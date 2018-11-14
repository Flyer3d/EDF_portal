import axios from 'axios';
import _ from 'lodash';

const baseModelName = 'Мероприятие';
const speakerModelName = 'Спикер';

const defaultFilterOptions = {
    title: '',
    country: null,
    region: null,
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
        console.log('[events/setFilter] Setting filter with payload: ');
        console.dir(payload);
       commit('SET_FILTER', payload);
    },

    async getList ({ commit, dispatch, state }, payload) {
        console.log('[events/getList] Loading... ');
        console.dir(payload);
        const params = Object.assign({}, defaultListParams, payload);

        commit('LIST_LOADING');
        const url = `${process.env.apiBase}/widget`;
        // Filters section
        const filters = [];
        for (let key in state.activeFilters) {
            console.log(`[events/getList] Testing key = ${key} value = ${state.activeFilters[key]}`);
            if (state.activeFilters[key] !== null) {
                switch (key) {
                    case 'title':
                        if (state.activeFilters[key] !== '') {
                            filters.push(`[Название мероприятия] = '%${state.activeFilters[key]}%'`);
                        }
                        break;
                    case 'country':
                        filters.push(`[Страна] = ${state.activeFilters[key]}`);
                        break;
                    case 'region':
                        filters.push(`[Регион] = ${state.activeFilters[key]}`);
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
            console.log('[events/getList] List loaded!');
            console.dir(res.data);

            commit('LIST_LOADED', res.data);
        } catch (err) {
            console.error('[events/getList] Error loading project list!');
            console.dir(err);
            commit('LIST_LOADED', {});
        }
    },
    async getItem ({ commit, dispatch, state }, id) {
        console.log(`[events/getItem] Loading... user id = ${id}`);
        if (!id) {
            console.error('[events/getItem] Empty ID!');
            return;
        }
            let url = `${process.env.apiBase}/widget/${baseModelName}/${id}`;
            try {
                commit('ITEM_LOADING');
                const res = await axios.get(url);
                console.log('[events/getItem] Data loaded!');
                const resItem = _.get(res, 'data.rows[0]');
                console.dir(resItem);
                const speakerIds = [];
                const item = resItem.object;
                if (item['Спикер'] && item['Спикер'].length > 0) {
                    item['Спикер'].forEach(speakerItem => speakerIds.push(_.get(speakerItem, 'entityInstancePk.entityInstanceId')));
                }
                url = `${process.env.apiBase}/widget/${speakerModelName}/`;
                const speakerListSrc = await Promise.all(speakerIds.map(speakerId => axios.get(`${url}${speakerId}`)));
                console.log(`[events/getItem] All Speakers loaded!`);
                console.dir(speakerListSrc.data);
                speakerListSrc.map((speakerSrc, i) => {
                    const speaker = _.get(speakerSrc, 'data.rows[0]');
                    console.log(`[events/getItem] Data loaded for field 'Спикер' N = ${i + 1}!`);
                    console.dir(speaker);
                    resItem.object['Спикер'][i] = speaker;
                });
                console.log(`[events/getItem] Committing!`);
                console.dir(resItem);
                commit('ITEM_LOADED', resItem);
            } catch (err) {
                console.error('[events/getItem] Error loading widget data!');
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
