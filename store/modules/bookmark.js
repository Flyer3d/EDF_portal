import axios from 'axios';
import _ from 'lodash';

const state = () => ({
    // data
    list: [],

    // Statuses
    listLoadStatus: 'INITIAL'
});

const getters = {
    getBookmarkList: st => st.list,
    getProjectBookmarkList: st => st.list.filter(item => item.object.entityType === 'project'),
    getTenderBookmarkList: st => st.list.filter(item => item.object.entityType === 'tender'),
    // Statuses
    listLoadStatus: st => st.listLoadStatus
};

const actions = {

    async getList ({ commit }) {
        console.log('[bookmark/getList] Loading... ');

        commit('LIST_LOADING');
        const url = `${process.env.apiBase}/bookmark/list`;
        try {
            const res = await axios.post(url);
            console.log('[bookmark/getList] List loaded!');
            console.dir(res.data);
            commit('LIST_LOADED', _.get(res, 'data'));
        } catch (err) {
            console.error('[bookmark/getList] Error loading widget list!');
            console.dir(err);
            commit('LIST_LOADED', {});
        }
    },

    async addBookmark ({ commit }, payload) {
        console.log('[bookmark/addBookmark] Adding... ');
        console.dir(payload);
        const url = `${process.env.apiBase}/bookmark/addBookmark`;
        try {
            const res = await axios.post(url, payload);
            console.log('[bookmark/addBookmark] Bookmark added!');
            console.dir(res.data);
            commit('ADD_BOOKMARK', res.data);
        } catch (err) {
            console.error('[bookmark/addBookmark] Error adding bookmark!');
            console.dir(err);
        }
    },

    async removeBookmark ({ commit }, id) {
        console.log(`[bookmark/removeBookmark] Removing bookmark id = ${id}`);
        const url = `${process.env.apiBase}/bookmark/removeBookmark`;
        try {
            const res = await axios.post(url, { id });
            console.log('[bookmark/removeBookmark] Bookmark removed!');
            console.dir(res.data);
            commit('REMOVE_BOOKMARK', id);
        } catch (err) {
            console.error('[bookmark/removeBookmark] Error removing bookmark!');
            console.dir(err);
        }
    }

};

const mutations = {

    'LIST_LOADING' (st) {
        st.list = [];
        st.listLoadStatus = 'LOADING';
    },
    'LIST_LOADED' (st, data) {
        st.list = (data && data.rows) || [];
        st.listPaging = (data && data.paging) || {
            totalRows: 0,
            pageSize: 0,
            pageNumber: 0
        };
        st.listLoadStatus = 'LOADED';
    },
    'ADD_BOOKMARK' (st, payload) {
        console.log('[ADD_BOOKMARK] Adding bookmark!');
        console.dir(payload);
        console.dir(st.list);
        st.list.push(payload);
    },
    'REMOVE_BOOKMARK' (st, id) {
        const index = _.findIndex(st.list, item => item.entityInstancePk.entityInstanceId === id);
        st.list.splice(index, 1);
    }
};

export default {
    namespaced: true,
    state,
    // modules,
    getters,
    actions,
    mutations
};
