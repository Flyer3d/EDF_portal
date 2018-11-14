import axios from 'axios';
import _ from 'lodash';

const baseModelName = 'Статья';
const defaultFilterOptions = {
    title: '',
    country: null,
    // region: null,
    industry: null
};

const state = () => ({
    // data
    list: [],
    item: {},
    activeFilters: defaultFilterOptions,
    listPaging: {
        totalRows: 0,
        pageSize: 0,
        pageNumber: 0
    },

    // Statuses
    listLoadStatus: 'INITIAL',
    itemLoadStatus: 'INITIAL'
});

const getters = {
    getList: st => st.list.filter(item => item.entityDesc),
    getItem: st => st.item,
    getFilters: st => st.activeFilters,
    // Statuses
    listLoadStatus: st => st.listLoadStatus,
    itemLoadStatus: st => st.itemLoadStatus,
    getItemLoadStatus: st => st.itemLoadStatus
};

const defaultListParams = {
    model: baseModelName,
    userOnly: false,
    pageNumber: 1,
    pageSize: 1000,
    orderBy: '',
    query: ''
};

const actions = {
    async setFilter ({ commit }, payload) {
        console.log('[analytics/setFilter] Setting filter with payload: ');
        console.dir(payload);
       commit('SET_FILTER', payload);
    },

    async getList ({ commit, dispatch, state }, payload) {
        console.log('[analytics/getList] Loading... ');
        console.dir(payload);
        const params = Object.assign({}, defaultListParams, payload);

        commit('LIST_LOADING');
        const url = `${process.env.apiBase}/widget`;
        // Filters section
        const filters = [];
        for (let key in state.activeFilters) {
            console.log(`[analytics/getList] Testing key = ${key} value = ${state.activeFilters[key]}`);
            if (state.activeFilters[key] !== null) {
                switch (key) {
                    case 'title':
                        if (state.activeFilters[key] !== '') {
                            filters.push(`[Название статьи] = '%${state.activeFilters[key]}%'`);
                        }
                        break;
                    case 'country':
                        filters.push(`[Страна] = ${state.activeFilters[key]}`);
                        break;
                    case 'industry':
                        filters.push(`[Отрасль] = ${state.activeFilters[key]}`);
                        break;
                    default:
                }
            }
        }
        params.query = filters.join(' AND ');
        console.dir(filters);
        console.dir(params);
        try {
            const res = await axios.get(url, { params });
            console.log('[analytics/getList] List loaded!');
            console.dir(res.data);

            commit('LIST_LOADED', res.data);
        } catch (err) {
            console.error('[analytics/getList] Error loading project list!');
            console.dir(err);
            commit('LIST_LOADED', {});
        }
    },
    async getItem ({ commit, dispatch, state }, id) {
        console.log(`[analytics/getItem] Loading... user id = ${id}`);
        if (!id) {
            console.error('[analytics/getItem] Empty ID!');
            return;
        }
            let url = `${process.env.apiBase}/widget/${baseModelName}/${id}`;
            try {
                commit('ITEM_LOADING');
                const res = await axios.get(url);
                console.log('[analytics/getItem] Data loaded!');
                const resItem = _.get(res, 'data.rows[0]');
                console.dir(resItem);
                const articleIndustry = _.get(resItem, 'object[\'Отрасль\'].entityInstancePk.entityInstanceId');
                const params = Object.assign({}, defaultListParams);
                params.pageSize = 10;
                if (articleIndustry) {
                    params.query = `[Отрасль] = ${articleIndustry}`;
                }
                url = `${process.env.apiBase}/widget`;
                const articlesSrc = await axios.get(url, { params });

                console.log('[analytics/getItem] Articles list loaded! Commiting...');
                const articles = _.get(articlesSrc, 'data.rows');
                resItem.object.__sameArticles = articles;
                console.dir(resItem);

                commit('ITEM_LOADED', resItem);
            } catch (err) {
                console.error('[analytics/getItem] Error loading widget data!');
                console.dir(err);
                commit('ITEM_LOADED', {});
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
    'ITEM_LOADING' (st) {
        st.item = {};
        st.itemLoadStatus = 'LOADING';
    },
    'ITEM_LOADED' (st, data) {
        st.item = data || {};
        if (_.isEmpty(data)) {
            st.itemLoadStatus = 'ERROR';
        } else {
            st.itemLoadStatus = 'LOADED';
        }
    },
    'SET_FILTER' (st, payload) {
        console.log('[SET_FILTER] Setting filters mutation!');
        console.dir(payload);
        st.activeFilters = Object.assign({}, defaultFilterOptions, payload);
        console.dir(st.activeFilters);
    }

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
