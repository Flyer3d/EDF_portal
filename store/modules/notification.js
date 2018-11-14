import _ from 'lodash';
import axios from 'axios';
import Vue from 'vue';

// const PROJECT_PART_PROCESS = 'Подать заявку на участие в проекте';
// const PROJECT_CREATE_PROCESS = 'Подать заявку на публикацию проекта';

const PROJECT_INVITATION_STEP = 'Рассмотреть приглашение';
const PROJECT_PART_STEP = 'Рассмотреть и принять решение';
const PROJECT_PUBLISH_REJECTED = 'Проект не опубликован';
const PROJECT_PUBLISH_ACCEPTED = 'Проект опубликован';
const PROJECT_COINVEST_REJECTED = 'Соинвестирование отклонено';
const PROJECT_PART_REJECTED = 'Участие отклонено';
const PROJECT_PART_ACCEPTED = 'Участие одобрено';

const validNotifications = [
    PROJECT_INVITATION_STEP,
    PROJECT_PART_STEP,
    PROJECT_PUBLISH_REJECTED,
    PROJECT_PUBLISH_ACCEPTED,
    PROJECT_COINVEST_REJECTED,
    PROJECT_PART_REJECTED,
    PROJECT_PART_ACCEPTED
];

const state = () => {
   return {
       notificationList: [],
       fullNotificationList: [],

       notificationListStatus: 'INITIAL',
       fullNotificationListStatus: 'INITIAL',

       error: null,
       strict: process.env.NODE_ENV !== 'production'
   };
};

const getters = {
    getNotificationListStatus: st => st.fullNotificationListStatus,

    notificationList: st => st.fullNotificationList.filter(notification => validNotifications.indexOf(notification.activityModelName) !== -1) || [],

    getInvitationNotifications: st => _.filter(st.fullNotificationList, {activityModelName: PROJECT_INVITATION_STEP}),
    getPartNotifications: st => _.filter(st.fullNotificationList, {activityModelName: PROJECT_PART_STEP}),

    getNotificationByStepId: (st) => (stepId) => {
        return _.find(st.fullNotificationList, {stepId});
    },
    totalUnreadNotifications: (state, getters) => getters['notificationList'].length,
    getError: st => st.error
};

const defaultNotificationsParams = {
    orderBy: 'createdWhen DESC',
    pageNumber: 1,
    pageSize: 999
};

const actions = {

    async loadFullNotificationList ({ commit }) {
        if (state.notificationListStatus !== 'IN_PROGRESS') {
            console.log('[notification/loadFullNotificationList] Loading... ');
            commit('DATA_LOADING', {name: 'FullNotificationList'});
            let url = `${process.env.apiBase}/widget/step`;
            try {
                const stepsSrc = await axios.get(url, { params: defaultNotificationsParams });
                console.log('[notification/loadFullNotificationList] FullNotificationList loaded!');
                const stepList = _.get(stepsSrc, 'data.rows', []);
                console.dir(stepList);
                url = `${process.env.apiBase}/model/stepModel`;

                const stepModelListSrc = await Promise.all(stepList.map(async step =>
                    axios.get(url, { params: {
                            stepId: step.object.pk,
                            processId: step.object.processPk,
                            flowNodeId: step.object.flowNodePk
                        } })));
                console.log('[notification/loadFullNotificationList] Full Notification models list loaded!');
                console.dir(stepModelListSrc);
                const stepModelList = stepModelListSrc.map((modelSrc, i) => {
                    const model = modelSrc.data;
                    model.activityTypeId = _.get(stepList[i], `object.activityTypeId`);
                    model.adapterTaskId = _.get(stepList[i], `object.adapterTaskId`);
                    model.stepTime = _.get(stepList[i], `object.updatedWhen`) || _.get(stepList[i], `object.createdWhen`);
                    return model;
                });

                await Promise.all(stepModelList.map(async stepModel => {
                    // ToDo: Запихнуть все в один запрос!
                    const inModelsSrc = await Promise.all(stepModel.inEntityModels.map(inModel => {
                        if (inModel.modelName && inModel.instanceId) {
                            return axios(`${process.env.apiBase}/widget/${inModel.modelName}/${inModel.instanceId}`);
                        } else {
                            return {};
                        }
                    }));

                    const outModelsSrc = await Promise.all(stepModel.outEntityModels.map(outModel => {
                        if (outModel.modelName && outModel.instanceId) {
                            return axios(`${process.env.apiBase}/widget/${outModel.modelName}/${outModel.instanceId}`);
                        } else {
                            return {};
                        }
                    }));
                    stepModel.inEntityModels.forEach((inModel, i) => {
                        stepModel.inEntityModels[i] = Object.assign({}, stepModel.inEntityModels[i], _.get(inModelsSrc[i], 'data.rows[0]'));
                    });
                    stepModel.outEntityModels.forEach((outModel, i) => {
                        stepModel.outEntityModels[i] = Object.assign({}, stepModel.outEntityModels[i], _.get(outModelsSrc[i], 'data.rows[0]'));
                    });
                }));
                console.dir(stepModelList);
                const response = {
                    name: 'fullNotificationList',
                    data: stepModelList
                };
                commit('DATA_LOADED', response);
            } catch (err) {
                console.error('[notification/loadFullNotificationList] Error loading notifications list!');
                console.dir(err);
                commit('DATA_LOADED', {
                    name: 'fullNotificationList',
                    data: [],
                    error: err
                });
            }
        }
    },

    async loadNotificationList ({ commit, dispatch, state }) {
        if (state.notificationListStatus !== 'IN_PROGRESS') {
            console.log('[notification/loadNotificationList] Loading... ');
            commit('DATA_LOADING', {name: 'notificationList'});
            let url = `${process.env.apiBase}/widget/step`;
            try {
                const stepsSrc = await axios.get(url, { params: defaultNotificationsParams });
                console.log('[notification/loadNotificationList] Notification List loaded!');
                const stepList = _.get(stepsSrc, 'data.rows', []);
                console.dir(stepList);

                const response = {
                    name: 'notificationList',
                    data: stepList
                };
                commit('DATA_LOADED', response);
                if (state.notificationList.length !== state.fullNotificationList.length) {
                    dispatch('loadFullNotificationList');
                }
            } catch (err) {
                console.error('[notification/loadNotificationList] Error loading notifications list!');
                console.dir(err);
                commit('DATA_LOADED', {
                    name: 'notificationList',
                    data: [],
                    error: err
                });
            }
        }
    },

    async deleteNotification ({dispatch, state}, stepId) {
        const index = _.findIndex(state.fullNotificationList, {stepId});
        if (index) {
            state.fullNotificationList.splice(index, 1);
            dispatch('loadNotificationList');
        }
    }

    // async sendMessage ({ state, commit, dispatch, rootGetters }, payload) {
    //     console.log('[notification/sendMessage] Sending Message with payload:');
    //     console.dir(payload);
    //     commit('MESSAGE_STATUS', 'IN_PROGRESS');
    //     const url = `${process.env.apiBase}/notification/sendMessage`;
    //     try {
    //         const currentDate = moment().format();
    //         await axios.post(url, payload);
    //         state.messageList.push({
    //             object: {
    //                 DT: currentDate,
    //                 a_sub_userId: rootGetters['login/getUserId'],
    //                 'Код переписки': state.currentChat['Код переписки'],
    //                 'Сообщение': payload.message,
    //                 'Вложение': payload.file,
    //                 'Внутренняя ссылка': payload.link
    //             }
    //         });
    //         console.log('[notification/sendMessage] Message sended!');
    //         commit('MESSAGE_STATUS', 'SUCCESS');
    //         setTimeout(() => {
    //             dispatch('loadMessageList');
    //         }, 1500);
    //     } catch (err) {
    //         console.error('[notification/sendMessage] Error sending!');
    //         console.dir(err);
    //         commit('MESSAGE_STATUS', 'ERROR');
    //     }
    // }
};

const mutations = {

    'DATA_LOADING' (st, payload) {
        Vue.set(st, `${payload.name}Status`, 'IN_PROGRESS');
    },

    'DATA_LOADED' (st, payload) {
        Vue.set(st, `${payload.name}Status`, payload.data ? 'SUCCESS' : 'ERROR');
        Vue.set(st, payload.name, payload.data);
    }

    // 'MESSAGE_STATUS' (st, status) {
    //     Vue.set(st, 'sendMessageStatus', status);
    // }

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
