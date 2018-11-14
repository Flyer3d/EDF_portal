import axios from 'axios';
import _ from 'lodash';

const baseModelName = 'Профиль участника';
const defaultFilterOptions = {
    title: '',
    country: null,
    region: null,
    industry: []
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
    getCompanies: st => st.list.filter(item => item.entityDesc && item.object['Тип профиля'] === 'Commercial organization'),
    getFSUE: st => st.list.filter(item => item.entityDesc && item.object['Тип профиля'] === 'Federal State Unitary Enterprise'),
    getInvestors: st => st.list.filter(item => item.entityDesc && item.object['Тип профиля'] === 'Investor or Bank'),
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
        console.log('[company/setFilter] Setting filter with payload: ');
        console.dir(payload);
       commit('SET_FILTER', payload);
    },

    async getList ({ commit, dispatch, state }, payload) {
        console.log('[company/getList] Loading... ');
        console.dir(payload);
        const params = Object.assign({}, defaultListParams, payload);

        commit('LIST_LOADING');
        const url = `${process.env.apiBase}/widget`;
        // Filters section
        const filters = ['[user_id] IS NOT NULL'];
        for (let key in state.activeFilters) {
            console.log(`[company/getList] Testing key = ${key} value = ${state.activeFilters[key]}`);
            if (state.activeFilters[key] !== null) {
                switch (key) {
                    case 'title':
                        if (state.activeFilters[key] !== '') {
                            filters.push(`[Название] = '%${state.activeFilters[key]}%'`);
                        }
                        break;
                    case 'country':
                        filters.push(`[Страна] = ${state.activeFilters[key]}`);
                        break;
                    case 'region':
                        filters.push(`[Регион] = ${state.activeFilters[key]}`);
                        break;
                    case 'industry':
                        if (state.activeFilters[key].length > 0) {
                            const industryFilter = [];
                            state.activeFilters[key].forEach(item => {
                                industryFilter.push(`[Отрасль] = ${item}`);
                            });
                            filters.push(industryFilter.join(' OR '));
                        }
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
            console.log('[company/getList] List loaded!');
            console.dir(res.data);

            // Добавляем число проектов
            await Promise.all(res.data.rows.map(async (item, index) => {
                const entityId = _.get(item, 'entityInstancePk.entityInstanceId');
                console.log(`[company/getList] getting projects for item id = ${entityId}:`);
                console.dir(item);
                if (entityId) {
                    const projectsSrc = await axios.get(`${process.env.apiBase}/widget`, {
                        params: {
                            model: 'Проект',
                            userOnly: false,
                            pageNumber: 1,
                            pageSize: 1,
                            orderBy: '',
                            query: `[Автор проекта] = ${entityId}`}
                    });
                    const totalProjects = _.get(projectsSrc, 'data.paging.totalRows');
                    console.log(`For user ${entityId} found ${totalProjects} projects!`);
                    res.data.rows[index].object.__myProjects = totalProjects;
                }
            }));

            console.log('[company/getList] committing list!');
            console.dir(res.data);
            commit('LIST_LOADED', res.data);
        } catch (err) {
            console.error('[company/getList] Error loading project list!');
            console.dir(err);
            commit('LIST_LOADED', {});
        }
    },
    async getItem ({ commit, dispatch, state }, id) {
        console.log(`[company/getItem] Loading... user id = ${id}`);
        if (!id) {
            console.error('[company/getItem] Empty ID!');
            return;
        }
        const url = `${process.env.apiBase}/widget/${baseModelName}/${id}`;
        const projectsUrl = `${process.env.apiBase}/widget`;
        try {
            commit('ITEM_LOADING');
            const [res, projectsRes, childrensRes] = await Promise.all([
                axios.get(url),
                axios.get(projectsUrl, {
                    params: {
                        model: 'Проект',
                        userOnly: false,
                        pageNumber: 1,
                        pageSize: 1000,
                        orderBy: '',
                        query: `[Автор проекта] = ${id}`
                    }
                }),
                axios.get(projectsUrl, {
                    params: {
                        model: baseModelName,
                        userOnly: false,
                        pageNumber: 1,
                        pageSize: 1000,
                        orderBy: '',
                        query: `[Головная компания] = ${id}`
                    }
                })
            ]);
            console.log('[company/getItem] Data loaded!');
            const resItem = _.get(res, 'data.rows[0]');
            const projects = _.get(projectsRes, 'data.rows');
            const childrens = _.get(childrensRes, 'data.rows');
            resItem.object.__projects = projects;
            resItem.object.__childrens = childrens;
            console.dir(resItem);
            commit('ITEM_LOADED', resItem);
        } catch (err) {
            console.error('[company/getItem] Error loading widget data!');
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
    // modules,
    getters,
    actions,
    mutations
};
