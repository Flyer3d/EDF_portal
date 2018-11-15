import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import Vue from 'vue';

const state = () => {
   return {
       chatList: [],
       messageList: [],
       currentChat: {},
       chatListStatus: 'INITIAL',
       messageListStatus: 'INITIAL',
       sendMessageStatus: 'INITIAL',
       error: null,
       strict: process.env.NODE_ENV !== 'production'
   };
};

const getters = {
    getChatListStatus: st => st.chatListStatus,
    getMessageListStatus: st => st.messageListStatus,
    getSendMessageStatus: st => st.sendMessageStatus,
    chatList: st => st.chatList.map(item => item.object),
    messageList: st => st.messageList.map(item => item.object),
    currentChat: st => st.currentChat,
    totalUnreadMessages: st => st.chatList.reduce((res, item) => {
        if (!isNaN(Number(item.object['Новых сообщений']))) {
            return res + Number(item.object['Новых сообщений']);
        } else {
            return res;
        }
    }, 0),
    getError: st => st.error
};

const actions = {

    async loadChatList ({ commit }) {
        if (state.chatListStatus !== 'IN_PROGRESS') {
            console.log('[chat/loadChatList] Loading... ');
            commit('DATA_LOADING', {name: 'chatList'});
            const url = `${process.env.apiBase}/chat/chatList`;
            try {
                const res = await axios.post(url);
                console.log('[chat/loadChatList] Chat list loaded!');
                const resList = _.get(res, 'data.rows', []);
                console.dir(resList);
                const response = {
                    name: 'chatList',
                    data: resList
                };
                commit('DATA_LOADED', response);
            } catch (err) {
                console.error('[chat/loadChatList] Error loading roles list!');
                console.dir(err);
                commit('DATA_LOADED', {
                    name: 'chatList',
                    data: [],
                    error: err
                });
            }
        }
    },

    async loadMessageList ({ commit, state, dispatch }) {
        if (state.messageListStatus !== 'IN_PROGRESS') {
            const chatId = state.currentChat['Код переписки'];
            console.log(`[chat/loadMessageList] Loading message list for chat '${chatId}'...`);
            commit('DATA_LOADING', {name: 'messageList'});
            if (!chatId) {
                console.log('[chat/loadMessageList] Setting to zero message list!');
                const response = {
                    name: 'messageList',
                    data: []
                };
                commit('DATA_LOADED', response);
                return;
            }
            const url = `${process.env.apiBase}/chat/messageList`;
            try {
                const res = await axios.post(url, { chatId });
                console.log('[chat/loadMessageList] Message list loaded!');
                const resList = _.get(res, 'data.rows', []);
                console.dir(res);
                const response = {
                    name: 'messageList',
                    data: resList
                };
                commit('DATA_LOADED', response);
                setTimeout(() => {
                    dispatch('loadChatList');
                }, 1500);
            } catch (err) {
                console.error('[chat/loadMessageList] Error loading roles list!');
                console.dir(err);
                commit('DATA_LOADED', {
                    name: 'chatList',
                    data: [],
                    error: err
                });
            }
        }
    },

    async setCurrentChat ({ commit, dispatch, state }, chat = {}) {
        console.log('[chat/setCurrentChat] Setting current chat to:');
        console.dir(chat);
        commit('SET_CHAT', chat);
        if (!chat['Код переписки'] && !_.isEmpty(chat)) {
            console.log('[chat/setCurrentChat] Код переписки is empty! Finding chat');
            await dispatch('loadChatList');
            const chatUser = chat['Имя собеседника'];
            const chatListSrc = state.chatList;
            const projectId = chat['Проект'];
            console.log(`[chat/setCurrentChat] Finding in chat list with params: chatUser = '${chatUser}' and projectId = '${projectId}'`);
            console.dir(chatListSrc);
            let currentChat = {};
            if (projectId) {
                currentChat = _.find(chatListSrc, item => {
                    const chatObject = item.object;
                    if (chatObject['Имя собеседника'] === chatUser) {
                        if (_.get(chatObject['Проект'], 'entityInstancePk.entityInstanceId') === projectId) {
                            return true;
                        }
                    }
                    return false;
                });
            } else {
                currentChat = _.find(chatListSrc, item => {
                    const chatObject = item.object;
                    if (chatObject['Имя собеседника'] === chatUser) {
                        if (!chatObject['Проект']) {
                           return true;
                        }
                    }
                    return false;
                });
            }
            console.log('[chat/setCurrentChat] Finally current chat is:');
            console.dir(currentChat);
            if (!_.isEmpty(currentChat)) {
                commit('SET_CHAT', currentChat.object);
            }
        }
        Vue.nextTick(() => dispatch('loadMessageList'));
    },

    async sendMessage ({ state, commit, dispatch, rootGetters }, payload) {
        console.log('[chat/sendMessage] SendingNessage with payload:');
        console.dir(payload);
        commit('MESSAGE_STATUS', 'IN_PROGRESS');
        const url = `${process.env.apiBase}/chat/sendMessage`;
        try {
            const currentDate = moment().format();
            await axios.post(url, payload);
            commit('MESSAGE_STATUS', 'SUCCESS');
            Vue.nextTick(() => {
                state.messageList.push({
                    object: {
                        DT: currentDate,
                        a_sub_userId: rootGetters['login/getUserId'],
                        'Код переписки': state.currentChat['Код переписки'],
                        'Сообщение': payload.message,
                        'Вложение': payload.file,
                        'Внутренняя ссылка': payload.link
                    }
                });
                console.log('[chat/sendMessage] Message sended!');
                console.dir({
                    object: {
                        DT: currentDate,
                        a_sub_userId: rootGetters['login/getUserId'],
                        'Код переписки': state.currentChat['Код переписки'],
                        'Сообщение': payload.message,
                        'Вложение': payload.file,
                        'Внутренняя ссылка': payload.link
                    }
                });
                console.dir(state.messageList);
            });
            setTimeout(async () => {
                if (!state.currentChat['Код переписки']) {
                    console.log('Код переписки is empty! Finding chat');
                    await dispatch('loadChatList');
                    const chatUser = state.currentChat['Имя собеседника'];
                    const chatListSrc = state.chatList;
                    const projectId = state.currentChat['Проект'];
                    console.log(`[chat/sendMessage] Finding in chat list with params: chatUser = '${chatUser}' and projectId = '${projectId}'`);
                    console.dir(chatListSrc);
                    let currentChat = {};
                    if (projectId) {
                        currentChat = _.find(chatListSrc, {object: {'Имя собеседника': chatUser, 'Проект': {entityInstancePk: {entityInstanceId: projectId}}}});
                    } else {
                        currentChat = _.find(chatListSrc, item => {
                            const chatObject = item.object;
                            if (chatObject['Имя собеседника'] === chatUser) {
                                if (!chatObject['Проект']) {
                                    return true;
                                }
                            }
                            return false;
                        });
                    }
                    console.log('[chat/sendMessage] Finaly current chat is:');
                    console.dir(currentChat);
                    if (!_.isEmpty(currentChat)) {
                        commit('SET_CHAT', currentChat.object);
                    }
                }
                setTimeout(() => dispatch('loadMessageList'), 500);
            }, 2000);
        } catch (err) {
            console.error('[chat/sendMessage] Error sending!');
            console.dir(err);
            commit('MESSAGE_STATUS', 'ERROR');
        }
    }
};

const mutations = {

    'DATA_LOADING' (st, payload) {
        Vue.set(st, `${payload.name}Status`, 'IN_PROGRESS');
    },

    'DATA_LOADED' (st, payload) {
        Vue.set(st, `${payload.name}Status`, payload.data ? 'SUCCESS' : 'ERROR');
        Vue.set(st, payload.name, payload.data);
    },

    'MESSAGE_STATUS' (st, status) {
        Vue.set(st, 'sendMessageStatus', status);
    },

    'SET_CHAT' (st, chat) {
        st.currentChat = chat || {};
    }

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
