import axios from 'axios';
import _ from 'lodash';

const state = () => ({
    actionList: [],
    actionData: {},
    actionListStatus: 'INITIAL',
    actionListError: null,
    actionStatus: 'INITIAL',
    actionError: null,
    stepStatus: 'INITIAL',
    stepError: null
});

const getters = {
    // Statuses
    actionListStatus: st => st.actionListStatus,
    actionListError: st => st.actionListError,
    actionStatus: st => st.actionStatus,
    actionError: st => st.actionError,
    stepStatus: st => st.stepStatus,
    stepError: st => st.stepError,

    // Data
    actionList: st => st.actionList,
    actionData: st => st.actionData
};

const defaultActionListOptions = {
    pageNumber: 1,
    pageSize: 99,
    orderBy: '',
    query: ''
};

const actions = {
    async loadActionList ({ commit }, payload) {
        console.log(`[action/loadActionList] Loading... `);
        console.dir(payload);
        commit('ACTION_LIST_LOADING');
        const url = `${process.env.apiBase}/widget/action`;
        try {
            const res = await axios.get(url, {params: Object.assign({}, defaultActionListOptions, payload)});
            console.log(`[action/loadActionList] List loaded!`);
            console.dir(res.data);
            commit('ACTION_LIST_LOADED', {status: 'SUCCESS', data: res.data.rows});
        } catch (err) {
            console.error('[action/loadActionList] Error loading action list!');
            console.dir(err);
            commit('ACTION_LIST_LOADED', {status: 'ERROR', error: err});
        }
    },

    async takeAction ({ commit }, { actionId, entityInstance }) {
        console.log(`[action/doAction]Starting new event id = ${actionId}!`);
        commit('ACTION_LOADING');
        const url = `${process.env.apiBase}/widget/action/${actionId}`;
        try {
            const res = await axios.post(url, {entityInstance});
            console.log(`[action/doAction] Event id = ${actionId} started!`);
            console.dir(res.data);
            commit('ACTION_LOADED', {status: 'SUCCESS', data: res.data});
        } catch (err) {
            console.error(`[action/doAction] Error creating new event id = ${actionId}!`);
            console.dir(err);
            commit('ACTION_LOADED', {status: 'ERROR', error: err});
        }
    },

    async takeStep ({ commit }, {fields, entityName, processId, processName}) {
        // if (!processId) return;
        commit('STEP_LOADING');
        console.log('[action/takeStep] Saving... ');
        console.dir({ fields, entityName, processId, processName });
        try {
            const outFields = await Promise.all(fields.map(async (item) => {
                if ((item.type === 'FILE') && item.fileName) {
                    console.log(`[action/takeStep] Saving file "${item.fileName}, storage is: ${item.fileStorage}"`);
                    let file;
                    item.form.append('fileStorage', item.fileStorage);
                    item.form.append('fileName', item.fileName);
                    console.log('[action/takeStep] Sending file!!!!');
                    try {
                        file = await axios.post(
                            `${process.env.apiBase}/utils/uploadFile`,
                            item.form,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    'Authorization': axios.defaults.headers.common['Authorization']
                                }
                            }
                        );
                    } catch (err) {
                        console.error(`[action/takeStep] Cannot save file ${item.fileName}`);
                        console.dir(err);
                        throw new Error('[action/takeStep] Cannot save file');
                    }
                    console.log('[action/takeStep] File save SUCCESS!!!!!');
                    item.value = _.get(file, 'data.filePath');
                } else if ((item.type === 'IMAGE') && item.fileName) {
                    console.log(`[action/takeStep] Saving image "${item.fileName}, storage is: ${item.fileStorage}"`);
                    let file;
                    item.form.append('fileStorage', 'images');
                    item.form.append('fileName', item.fileName);
                    console.log('[action/takeStep] Sending file!!!!');
                    try {
                        file = await axios.post(
                            `${process.env.apiBase}/img`,
                            item.form,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    'Authorization': axios.defaults.headers.common['Authorization']
                                }
                            }
                        );
                    } catch (err) {
                        console.error(`[action/takeStep] Cannot save file ${item.fileName}`);
                        console.dir(err);
                        throw new Error('[action/takeStep] Cannot save file');
                    }
                    console.log('[action/takeStep] Image save SUCCESS!!!!!');
                    item.value = _.get(file, 'data.filePath');
                }
                return item;
            }));

            console.log('[action/takeStep] All files sended!');
            console.dir(outFields);

            const sendObject = {};
            outFields.forEach(item => {
                sendObject[item.name] = item.value;
            });
            console.log(`[action/takeStep] Starting process ${processId} with data:`);
            console.dir(sendObject);
            const url = `${process.env.apiBase}/widget/step/submitMonoStep`;
            await axios.post(url, {
                processId,
                entityName,
                processName,
                fields: sendObject
            });
            console.log('[action/takeStep] MonoStep successfully terminated!');
            commit('STEP_LOADED', { status: 'SUCCESS' });
        } catch (err) {
            console.error('[action/takeStep] Error terminating monoStep!');
            console.dir(err);
            commit('STEP_LOADED', { status: 'ERROR', error: err });
        }
    },

    async takeSimpleStep ({ commit }, {fields, entityName, processId, processName}) {
        // if (!processId) return;
        commit('STEP_LOADING');
        console.log('[action/takeSimpleStep] Saving... ');
        console.dir({ fields, entityName, processId, processName });
        try {
            console.log(`[action/takeSimpleStep] Starting process ${processId} with data:`);
            console.dir(fields);
            const url = `${process.env.apiBase}/widget/step/submitMonoStep`;
            await axios.post(url, {
                processId,
                entityName,
                processName,
                fields
            });
            console.log('[action/takeSimpleStep] MonoStep successfully terminated!');
            commit('STEP_LOADED', { status: 'SUCCESS' });
        } catch (err) {
            console.error('[action/takeSimpleStep] Error terminating monoStep!');
            console.dir(err);
            commit('STEP_LOADED', { status: 'ERROR', error: err });
        }
    },

    async submitSimpleStep ({ commit, dispatch, state }, payload) {
        commit('STEP_LOADING');
        console.log('[action/submitSimpleStep] Saving... ');
        console.dir(payload);
        const {fields, modelName, entityId, activityTypeId, adapterTaskId} = payload;
        try {
            console.log(`[action/submitSimpleStep]Saving Fields to ${modelName}::${entityId}!`);
            console.dir(fields);
            let url = `${process.env.apiBase}/widget/step`;
            const saveFieldsRes = await axios.post(url, {
                data: {
                    model: modelName,
                    id: entityId,
                    fields
                }
            });
            console.log(`[action/submitSimpleStep] Data saved for ${modelName}!`);
            console.dir(saveFieldsRes.data);
            console.log('[action/submitSimpleStep] Submitting!!!');
            url = `${process.env.apiBase}/widget/step/${activityTypeId}/${adapterTaskId}`;
            await axios.post(url);
            console.log('[action/submitSimpleStep] Step submitted!');
            commit('STEP_LOADED', { status: 'SUCCESS' });
        } catch (err) {
            console.error('[action/submitSimpleStep] Error loading widget data!');
            console.dir(err);
            commit('STEP_LOADED', { status: 'ERROR', error: err });
        }
    },

};

const mutations = {
    'ACTION_LIST_LOADING' (st) {
        st.actionListStatus = 'IN_PROGRESS';
    },

    'ACTION_LIST_LOADED' (st, {status, data, error}) {
        st.actionListStatus = status;
        st.actionList = data || [];
        st.actionListError = error || null;
    },
    'ACTION_LOADING' (st) {
        st.actionStatus = 'IN_PROGRESS';
    },

    'ACTION_LOADED' (st, {status, data, error}) {
        st.actionStatus = status;
        st.actionData = data || [];
        st.actionError = error || null;
    },
    'STEP_LOADING' (st) {
        st.stepStatus = 'IN_PROGRESS';
    },

    'STEP_LOADED' (st, {status, error}) {
        st.stepStatus = status;
        st.stepError = error || null;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
