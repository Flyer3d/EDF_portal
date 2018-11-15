import _ from 'lodash';
import axios from 'axios';
import Vue from 'vue';
import model from './model';

const state = () => {
    return {
        isAlive: true,
        modelName: '',
        instanceId: null,
        fields: [],
        data: {},
        list: [],
        listPaging: {
            totalRows: 0,
            pageSize: 0,
            pageNumber: 0
        },
        modelLoadStatus: 'INITIAL',
        listLoadStatus: 'INITIAL',
        dataLoadStatus: 'INITIAL',
        isDataChanged: false,
        id: '',
        widgetId: ''
    };
};

const getters = {
    // Statuses
    dataLoadStatus: st => st.dataLoadStatus,
    listLoadStatus: st => st.listLoadStatus,
    isDataChanged: st => st.isDataChanged,

    // data getters
    getItem: st => st.data,
    getFields: st => st.fields,
    getList: st => st.list,
    // widget getters
    getId: st => st.id,
    getModelName: st => st.modelName,
    getInstanceId: st => st.instanceId,
    // paging
    totalListRows: st => st.listPaging.totalRows,
    pageListSize: st => st.listPaging.pageSize,
    pageListNumber: st => st.listPaging.pageNumber
};

const modules = {
    model
};

const actions = {

    async resetData  ({ commit }) {
        commit('RESET');
        commit('LOADING');
        commit('LOADED', {});
    },
    // //////////////////////////////MODEL SECTION////////////////////////////////////
    async loadItem ({ commit, dispatch, state }, payload) {
        console.log(`[loadItem] Loading model ${payload.model} id = ${payload.id}`);
        console.dir(payload);
        commit('LOADING');
        const id = payload.id;
        const model = payload.model;
        const url = `${process.env.apiBase}/widget/${model}/${id}`;

        try {
            const res = await axios.get(url);
            console.log('[loadItem] Data loaded!');
            console.dir(res.data);
            if (state.isAlive) {
                commit('LOADED', _.get(res, 'data.rows[0]'));
            }
        } catch (err) {
            console.error('[loadItem] Error loading widget data!');
            console.dir(err);
            if (state.isAlive) {
                commit('LOADED', {});
            }
        }
    },
    async loadList ({ commit, state, dispatch }, payload) {
        console.log('[loadList] Loading... ');
        console.dir(payload);
        commit('LIST_LOADING');
        const url = `${process.env.apiBase}/widget`;
        try {
            const res = await axios.get(url, { params: payload });
            console.log('[loadList] List loaded!');
            console.dir(res.data);
            if (state.isAlive) {
                commit('LIST_LOADED', res.data);
            }
        } catch (err) {
            console.error('[loadList] Error loading widget list!');
            console.dir(err);
            if (state.isAlive) {
                commit('LIST_LOADED', {});
            }
        }
    },
    async getModel ({ commit, state }, model) {
        commit('MODEL_LOADING');
        const url = `${process.env.apiBase}/model/model`;
        try {
            const response = await axios.get(url, { params: { model } });
            if (state.isAlive) {
                commit('MODEL_LOADED', response.data);
            }
        } catch (e) {
            console.error('[getModel] Error getting models list!');
            console.dir(e);
            if (state.isAlive) {
                commit('MODEL_LOADED', {});
            }
        }
    }
};

const mutations = {
    'LOADING' (st) {
        st.data = {};
        st.dataLoadStatus = 'LOADING';
    },
    'LOADED' (st, data) {
        st.data = data || {};
        st.dataLoadStatus = 'LOADED';
    },
    'LIST_LOADING' (st) {
        st.list = [];
        st.listPaging = {
            totalRows: 0,
            pageSize: 0,
            pageNumber: 0
        };
        st.listLoadStatus = 'LOADING';
    },
    'LIST_LOADED' (st, data) {
        st.list = data.rows || [];
        st.listPaging = data.paging || {
            totalRows: 0,
            pageSize: 0,
            pageNumber: 0
        };
        st.listLoadStatus = 'LOADED';
    },
    'MODEL_LOADING' (st) {
        st.modelLoadStatus = 'LOADING';
    },
    'MODEL_LOADED' (st, model) {
        st.modelLoadStatus = 'LOADED';
        st.model = model || {};
    },
    setData (st, payload) {
        st.id = payload.id;
        st.widgetId = payload.widgetId;
        st.modelName = payload.modelName;
        st.instanceId = payload.instanceId;
        st.fields = payload.fields || [];
    },
    saved (st) {
        st.isChanged = false;
    },
    load (st, widget) {
        Vue.set(st, 'widget', widget);
        st.isChanged = false;
    },
    update (st, widget) {
        const mergedWidget = Object.assign({}, st.widget, widget);
        Vue.set(st, 'widget', mergedWidget);
        st.isChanged = true;
    },
    unregister (st) {
        st.isAlive = false;
    }
};

export default {
    namespaced: true,
    state,
    modules,
    getters,
    actions,
    mutations
};
