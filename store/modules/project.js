import axios from 'axios';
import _ from 'lodash';

const baseModelName = 'Проект';
const defaultFilterOptions = {
    title: '',
    country: null,
    region: null,
    industry: null,
    AP: [0, 100000000000],
    ownEquity: [0, 100],
    NPV: [0, 100000000000],
    recoup: 1000,
    stage: '',
    DD: false,
    PPP: false
};

const defaultConstraints = {
   APMax: 100000000000,
   APMin: 0,
   recoupMax: 500,
   ownEquityMin: 0,
   ownEquityMax: 100,
   NPVMin: 0,
   NPVMax: 100000000000
};

const state = () => ({
    // data
    list: [],
    myList: [],
    myPartList: [],
    myBookmarkedList: [],
    mapList: [],
    item: {},
    activeFilters: Object.assign({}, defaultFilterOptions),
    constraints: Object.assign({}, defaultConstraints),
    constraintsFor: {
        title: undefined,
        country: undefined,
        region: undefined,
        industry: undefined
    },
    listPaging: {
        totalRows: 0,
        pageSize: 0,
        pageNumber: 0
    },
    myListPaging: {
        totalRows: 0,
        pageSize: 0,
        pageNumber: 0
    },
    myPartListPaging: {
        totalRows: 0,
        pageSize: 0,
        pageNumber: 0
    },
    myBookmarkedListPaging: {
        totalRows: 0,
        pageSize: 0,
        pageNumber: 0
    },

    // Statuses
    listLoadStatus: 'INITIAL',
    myListLoadStatus: 'INITIAL',
    myPartListLoadStatus: 'INITIAL',
    myBookmarkedListLoadStatus: 'INITIAL',
    mapListLoadStatus: 'INITIAL',
    itemLoadStatus: 'INITIAL'
});

const getters = {
    getList: st => st.list,
    getMyList: st => st.myList,
    getMyPartList: st => st.myPartList,
    getMyBookmarkedList: st => st.myBookmarkedList,
    getItem: st => st.item,
    getFilters: st => st.activeFilters,
    getConstraints: st => st.constraints,
    // Statuses
    listLoadStatus: st => st.listLoadStatus,
    myListLoadStatus: st => st.myListLoadStatus,
    getItemLoadStatus: st => st.itemLoadStatus,
    myPartListLoadStatus: st => st.myListLoadStatus,
    myBookmarkedListLoadStatus: st => st.myListLoadStatus
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
        console.log('[project/setFilter] Setting filter with payload: ');
        console.dir(payload);
       commit('SET_FILTER', payload);
    },

    async getList ({ commit, state }, payload) {
        console.log('[project/getList] Loading... ');
        console.dir(payload);
        const params = Object.assign({}, defaultListParams, payload);

        commit('LIST_LOADING');
        const url = `${process.env.apiBase}/widget`;
        // Filters section
        const filters = [];
        const constraintFilters = [];
        for (let key in state.activeFilters) {
            console.log(`[project/getList] Testing key = ${key} value = ${state.activeFilters[key]}`);
            if (state.activeFilters[key]) {
                switch (key) {
                    case 'title' :
                        filters.push(`[Название] = '%${state.activeFilters[key]}%'`);
                        constraintFilters.push(`[Название] = '%${state.activeFilters[key]}%'`);
                        break;
                    case 'country':
                        filters.push(`[Страна] = '${state.activeFilters[key]}'`);
                        constraintFilters.push(`[Страна] = '${state.activeFilters[key]}'`);
                        break;
                    case 'region':
                        filters.push(`[Регион] = '${state.activeFilters[key]}'`);
                        constraintFilters.push(`[Регион] = '${state.activeFilters[key]}'`);
                        break;
                    case 'industry':
                        filters.push(`[Отрасль] = '${state.activeFilters[key]}'`);
                        constraintFilters.push(`[Отрасль] = '${state.activeFilters[key]}'`);
                        break;
                    case 'AP':
                        if (state.activeFilters.AP[0] > state.constraints.APMin) {
                            filters.push(`[Capital Required (USD)] >= ${state.activeFilters[key][0]}`);
                        }
                        if (state.activeFilters[key][1] < (state.constraints.APMax - Math.round(state.constraints.APMax / 1000))) {
                            filters.push(`[Capital Required (USD)] <= ${state.activeFilters[key][1]}`);
                        }
                        break;
                    case 'NPV':
                        if (state.activeFilters[key][0] > state.constraints.NPVMin) {
                            filters.push(`[NPV (USD)] >= ${state.activeFilters[key][0]}`);
                        }
                        if (state.activeFilters[key][1] < (state.constraints.NPVMax - Math.round(state.constraints.NPVMax / 1000))) {
                            filters.push(`[NPV (USD)] <= ${state.activeFilters[key][1]}`);
                        }
                        break;
                    case 'ownEquity':
                        if (state.activeFilters[key][0] > state.constraints.ownEquityMin) {
                            filters.push(`[Собственный капитал (%)] >= ${state.activeFilters[key][0]}`);
                        }
                        if (state.activeFilters[key][1] < state.constraints.ownEquityMax) {
                            filters.push(`[Собственный капитал (%)] <= ${state.activeFilters[key][1]}`);
                        }
                        break;
                    case 'recoup':
                        if (state.activeFilters.recoup < state.constraints.recoupMax) {
                            filters.push(`[PBP (мес)] <= ${state.activeFilters[key]}`);
                        }
                        break;
                    case 'stage':
                        filters.push(`[Стадии проекта] = '${state.activeFilters[key]}'`);
                        break;
                    case 'DD':
                        filters.push(`[DD] = 'True'`);
                        break;
                    case 'PPP':
                        filters.push(`[ГЧП] = 'True'`);
                        break;
                    default:
                }
            }
        }
        params.query = filters.join(' AND ');
        console.dir(filters);
        console.dir(params);
        try {
            if (state.activeFilters.country !== state.constraintsFor.country ||
                state.activeFilters.region !== state.constraintsFor.region ||
                state.activeFilters.title !== state.constraintsFor.title ||
                state.activeFilters.industry !== state.constraintsFor.industry
            ) {
                commit('SET_CONSTRAINTS_FOR');
                const constraintQuery = constraintFilters.join(' AND ');
                console.log('[project/getList] Finding Constraints!!!!!');
                console.time('constraints');
                const [res, ...constraintsRes] = await Promise.all([
                    axios.get(url, { params }),
                    axios.get(url, {
                        params: Object.assign({}, defaultListParams, {
                            pageSize: 1,
                            query: constraintQuery,
                            orderBy: 'Capital Required (USD) DESC'
                        })
                    }),
                    axios.get(url, {
                        params: Object.assign({}, defaultListParams, {
                            pageSize: 1,
                            query: constraintQuery,
                            orderBy: 'Capital Required (USD)'
                        })
                    }),
                    axios.get(url, {
                        params: Object.assign({}, defaultListParams, {
                            pageSize: 1,
                            query: constraintQuery,
                            orderBy: 'NPV (USD) DESC'
                        })
                    }),
                    axios.get(url, {
                        params: Object.assign({}, defaultListParams, {
                            pageSize: 1,
                            query: constraintQuery,
                            orderBy: 'NPV (USD)'
                        })
                    }),
                    axios.get(url, {
                        params: Object.assign({}, defaultListParams, {
                            pageSize: 1,
                            query: constraintQuery,
                            orderBy: 'PBP (мес) DESC'
                        })
                    })
                ]);
                console.log('[project/getList] ConstraintsFor CHanged! Result is:');
                console.dir(constraintsRes);
                console.timeEnd('constraints');
                const APMax = _.get(constraintsRes[0], 'data.rows[0].object[Capital Required (USD)]');
                const APMin = _.get(constraintsRes[1], 'data.rows[0].object[Capital Required (USD)]');
                const NPVMax = _.get(constraintsRes[2], 'data.rows[0].object[NPV (USD)]');
                const NPVMin = _.get(constraintsRes[3], 'data.rows[0].object[NPV (USD)]');
                const recoupMax = _.get(constraintsRes[4], 'data.rows[0].object[PBP (мес)]');
                console.dir({
                    APMax, APMin, recoupMax, NPVMax, NPVMin
                });
                commit('SET_CONSTRAINTS', {
                    APMax, APMin, recoupMax, NPVMax, NPVMin
                });
                console.log('[project/getList] commiting list!');
                console.dir(res.data);
                commit('LIST_LOADED', res.data);
            } else {
                const res = await axios.get(url, { params });
                console.log('[project/getList] List loaded!');
                console.dir(res.data);

                commit('LIST_LOADED', res.data);
            }
        } catch (err) {
            console.error('[project/getList] Error loading project list!');
            console.dir(err);
            commit('LIST_LOADED', {});
        }
    },

    async getMyList ({ commit, state, rootGetters }, payload) {
        console.log('[project/getMyList] Loading... ');
        console.dir(payload);
        const params = Object.assign({}, defaultListParams, {
            query: `[user_id] = '${rootGetters['login/getUserId']}'`
        }, payload);
        console.dir(params);
        commit('MY_LIST_LOADING');
        const url = `${process.env.apiBase}/widget`;
        try {
                const res = await axios.get(url, { params });
                console.log('[project/getMyList] List loaded!');
                console.dir(res.data);

                console.log('[project/getMyList] committing list!');
                console.dir(res.data);
                commit('MY_LIST_LOADED', res.data);
        } catch (err) {
            console.error('[project/getMyList] Error loading project list!');
            console.dir(err);
            commit('MY_LIST_LOADED', {});
        }
    },

    async getMyPartList ({ commit, state, rootGetters }, payload) {
        console.log('[project/getMyPartList] Loading... ');
        console.dir(payload);
        const params = Object.assign({}, defaultListParams, {
            query: `[Участники проекта] = '${rootGetters['login/getProfileId']}'`
        }, payload);
        console.dir(params);
        commit('MY_PART_LIST_LOADING');
        const url = `${process.env.apiBase}/widget`;
        try {
                const res = await axios.get(url, { params });
                console.log('[project/getMyPartList] List loaded!');
                console.dir(res.data);

                console.log('[project/getMyPartList] committing list!');
                console.dir(res.data);
                commit('MY_PART_LIST_LOADED', res.data);
        } catch (err) {
            console.error('[project/getMyPartList] Error loading project list!');
            console.dir(err);
            commit('MY_PART_LIST_LOADED', {});
        }
    },

    async getMyBookmarkedList ({ commit, state, rootGetters, dispatch }, payload) {
        console.log('[project/getMyBookmarkedList] Loading... ');
        console.dir(payload);
        let url = `${process.env.apiBase}/bookmark/list`;
        let bookmarksIdList;
        try {
            const res = await axios.post(url);
            bookmarksIdList = _.get(res, 'data.rows');
        } catch (err) {
            console.error('[project/getMyBookmarkedList] Error loading bookmarks list!');
            console.dir(err);
            commit('LIST_LOADED', {});
        }
        console.dir(bookmarksIdList);

        commit('MY_BOOKMARKED_LIST_LOADING');
        if (bookmarksIdList.length > 0) {
            url = `${process.env.apiBase}/widget/${baseModelName}/`;
            try {
                    const bookmarksLisrSrc = await Promise.all(bookmarksIdList.map(bookmarkItem => axios.get(`${url}${bookmarkItem.object.entityId}`)));
                    console.log('[project/getMyBookmarkedList] List loaded!');
                    console.dir(bookmarksLisrSrc);
                    const bookmarksList = bookmarksLisrSrc.map(item => item.data.rows[0]);
                    console.log('[project/getMyBookmarkedList] committing list!');
                    console.dir(bookmarksList);
                    commit('MY_BOOKMARKED_LIST_LOADED', bookmarksList);
            } catch (err) {
                console.error('[project/getMyBookmarkedList] Error loading project list!');
                console.dir(err);
                commit('MY_BOOKMARKED_LIST_LOADED', {});
            }
        } else {
            console.log('[project/getMyBookmarkedList] Empty bookmark list!');
            commit('MY_BOOKMARKED_LIST_LOADED', {});
        }
    },

    async getItem ({ commit, state }, id) {
        console.log(`[project/getItem] Loading... project id = ${id}`);
        if (!id) {
            console.error('[project/getItem] Empty ID!');
            return;
        }
        // Loading data
        let url = `${process.env.apiBase}/widget/${baseModelName}/${id}`;
        try {
            commit('ITEM_LOADING');
            const res = await axios.get(url);
            // Собираем статистику!!!
            axios.post(`${process.env.apiBase}/statistics/viewed`, {type: 'project', projectId: id});

            console.log('[project/getItem] Data loaded!');
            const resItem = _.get(res, 'data.rows[0]');
            console.dir(resItem);

            const item = resItem.object;
            console.log('[project/getItem] Loading more data!');
            console.dir(item);

            const userModel = _.get(item['Автор проекта'], 'entityInstancePk.entityName');
            const userId = _.get(item['Автор проекта'], 'entityInstancePk.entityInstanceId');
            let profileIds = [];
            if (item['Участники проекта'] && item['Участники проекта'].length > 0) {
                item['Участники проекта'].forEach(profileItem => profileIds.push(_.get(profileItem, 'entityInstancePk.entityInstanceId')));
            }
            profileIds = _.compact(profileIds);
            console.log('[project/getItem] Loading more data AXIOS!!!!');
            console.dir(profileIds);
            const [companyResSrc, totalProjectSrc, ...proflesResSrc] = await Promise.all([].concat(
                axios.get(`${process.env.apiBase}/widget/${userModel}/${userId}`),
                axios.get(`${process.env.apiBase}/widget`, {
                    params: Object.assign({}, defaultListParams, {
                        pageSize: 1,
                        query: `[Автор проекта] = ${userId}`
                    })
                }),
                profileIds.length > 0 ? profileIds.map(profileId => axios.get(`${process.env.apiBase}/widget/${userModel}/${profileId}`)) : []));
            const companyRes = _.get(companyResSrc, 'data.rows[0]');
            const myProjects = _.get(totalProjectSrc, 'data.paging.totalRows');
            console.log(`[project/getItem] Data loaded for field 'Автор проекта'!`);
            console.dir(companyRes);
            resItem.object['Автор проекта'] = companyRes;
            resItem.object['Автор проекта'].object.__myProjects = myProjects;
            if (proflesResSrc && proflesResSrc.length > 0) {
                proflesResSrc.map((profileResSrc, i) => {
                    const profileRes = _.get(profileResSrc, 'data.rows[0]');
                    console.log(`[project/getItem] Data loaded for field 'Участники проекта' N = ${i + 1}!`);
                    console.dir(profileRes);
                    resItem.object['Участники проекта'][i] = profileRes;
                });
            }
            console.log('[project/getItem] All fields replaced!!!');
            console.dir(resItem);
            commit('ITEM_LOADED', resItem);
        } catch (err) {
            console.error(`[project/getItem] Error getting model ${baseModelName}! `);
            console.dir(err);
            commit('ITEM_LOADED');
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
    'MY_LIST_LOADING' (st) {
        st.myList = [];
        st.myListLoadStatus = 'LOADING';
    },
    'MY_LIST_LOADED' (st, data) {
        st.myList = (data && data.rows) || [];
        st.myListPaging = (data && data.paging) || {
            totalRows: 0,
            pageSize: 0,
            pageNumber: 0
        };
        st.myListLoadStatus = 'LOADED';
    },
    'MY_PART_LIST_LOADING' (st) {
        st.myPartList = [];
        st.myPartListLoadStatus = 'LOADING';
    },
    'MY_PART_LIST_LOADED' (st, data) {
        st.myPartList = (data && data.rows) || [];
        st.myPartListPaging = (data && data.paging) || {
            totalRows: 0,
            pageSize: 0,
            pageNumber: 0
        };
        st.myPartListLoadStatus = 'LOADED';
    },
    'MY_BOOKMARKED_LIST_LOADING' (st) {
        st.myBookmarkedList = [];
        st.myBookmarkedListLoadStatus = 'LOADING';
    },
    'MY_BOOKMARKED_LIST_LOADED' (st, data) {
        st.myBookmarkedList = (data) || [];
        st.myBookmarkedListPaging = (data && data.paging) || {
            totalRows: 0,
            pageSize: 0,
            pageNumber: 0
        };
        st.myBookmarkedListLoadStatus = 'LOADED';
    },
    'ITEM_LOADING' (st) {
        st.item = {};
        st.itemLoadStatus = 'LOADING';
    },
    'ITEM_LOADED' (st, data) {
        st.item = data || {};
        if (data) {
            st.itemLoadStatus = 'LOADED';
        } else {
            st.itemLoadStatus = 'ERROR';
        }
    },
    'SET_FILTER' (st, payload) {
        console.log('[SET_FILTER] Setting filters mutation!');
        console.dir(payload);
        st.activeFilters = Object.assign({}, defaultFilterOptions, payload);
        this.commit('project/FIX_FILTERS');
        console.dir(st.activeFilters);
    },
    'SET_CONSTRAINTS_FOR' (st) {
        st.constraintsFor.country = st.activeFilters.country;
        st.constraintsFor.region = st.activeFilters.region;
        st.constraintsFor.title = st.activeFilters.title;
        st.constraintsFor.industry = st.activeFilters.industry;
    },
    'SET_CONSTRAINTS' (st, payload) {
        st.constraints = Object.assign({}, defaultConstraints, payload);
        this.commit('project/FIX_FILTERS');
    },
    'FIX_FILTERS' (st) {
        console.log('[FIX_FILTERS]');
        const filtersFix = {
            AP: st.activeFilters.AP.slice(),
            NPV: st.activeFilters.NPV.slice(),
            recoup: st.activeFilters.recoup
        };
        let isChanged = false;
        if (st.activeFilters.AP[0] < st.constraints.APMin) {
            filtersFix.AP[0] = st.constraints.APMin;
            isChanged = true;
        } else if (st.activeFilters.AP[0] > st.constraints.APMax) {
            filtersFix.AP[0] = st.constraints.APMax;
            isChanged = true;
        }
        if (st.activeFilters.AP[1] < st.constraints.APMin) {
            filtersFix.AP[1] = st.constraints.APMin;
            isChanged = true;
        } else if (st.activeFilters.AP[1] > st.constraints.APMax) {
            filtersFix.AP[1] = st.constraints.APMax;
            isChanged = true;
        }
        if (st.activeFilters.NPV[0] < st.constraints.NPVMin) {
            filtersFix.NPV[0] = st.constraints.NPVMin;
            isChanged = true;
        } else if (st.activeFilters.NPV[0] > st.constraints.NPVMax) {
            filtersFix.NPV[0] = st.constraints.NPVMax;
            isChanged = true;
        }
        if (st.activeFilters.NPV[1] < st.constraints.NPVMin) {
            filtersFix.NPV[1] = st.constraints.NPVMin;
            isChanged = true;
        } else if (st.activeFilters.NPV[1] > st.constraints.NPVMax) {
            filtersFix.NPV[1] = st.constraints.NPVMax;
            isChanged = true;
        }
        if (st.activeFilters.recoup > st.constraints.recoupMax) {
            filtersFix.recoup = st.constraints.recoupMax;
            isChanged = true;
        }
        if (isChanged) {
            st.activeFilters = Object.assign({}, st.activeFilters, filtersFix);
        }
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
