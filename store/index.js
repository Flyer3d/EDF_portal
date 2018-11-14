import Vue from 'vue';
import Vuex from 'vuex';
import { getTokenFromCookie } from '~/utils/auth';

import desktop from './modules/desktop';
import model from './modules/model';
import login from './modules/login';
import site from './modules/site';
import chat from './modules/chat';
import utils from './modules/utils';
import project from './modules/project';
import company from './modules/company';
import bookmark from './modules/bookmark';
import action from './modules/action';
import notification from './modules/notification';
import analytics from './modules/analytics';
import events from './modules/events';

Vue.use(Vuex);

const store = function () {
    return new Vuex.Store({
        state: {
            sidebar: false,
            apiBase: process.env.apiBase,
            strict: process.env.NODE_ENV !== 'production'
        },
        modules: {
            desktop,
            model,
            login,
            site,
            chat,
            utils,
            action,
            bookmark,
            project,
            company,
            notification,
            analytics,
            events
        },
        getters: {
            drawer: st => st.sidebar,
            getApiBase: st => st.apiBase
        },
        actions: {
            async nuxtServerInit ({commit, dispatch}, {req}) {
                if (req.headers.cookie) {
                    const tokenData = getTokenFromCookie(req);
                    dispatch('login/setToken', tokenData);
                }
                await dispatch('site/loadData');
            }
        },
        mutations: {
            toggleSidebar (state) {
                state.sidebar = !state.sidebar;
            },
            setSidebar (state, param) {
                state.sidebar = param;
            }
        }
    });
};

export default store;
