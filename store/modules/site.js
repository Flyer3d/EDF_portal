import _ from 'lodash';
import axios from 'axios';
import Vue from 'vue';

const state = () => {
   return {
       layoutCategoryList: [],
       rolesList: [],
       industryList: [],
       countryList: [],
       regionList: [],
       layoutCategoryListStatus: 'INITIAL',
       rolesListStatus: 'INITIAL',
       industryListStatus: 'INITIAL',
       countryListStatus: 'INITIAL',
       regionListStatus: 'INITIAL',
       contacts: [],
       editable: false,
       loaded: false,
       error: null,
       strict: process.env.NODE_ENV !== 'production'
   };
};

const getters = {
    getRolesListStatus: st => st.rolesListStatus,
    getIndustryListStatus: st => st.industryListStatus,
    getCountryListStatus: st => st.regionListStatus,
    getRegionListStatus: st => st.regionListStatus,
    editable: st => st.editable,
    contacts: st => st.contacts,
    layoutCategoryList: st => st.layoutCategoryList,
    rolesList: st => st.rolesList,
    industryList: st => st.industryList,
    getIndustryById: (st) => (industryId) => {
        return _.find(st.industryList, {value: industryId});
    },
    countryList: st => st.countryList,
    regionList: st => st.regionList,
    isLoaded: st => st.loaded
};

const initActions = ['loadIndustryList', 'loadCountryList', 'loadRolesList'];

const actions = {
    async loadData ({ commit, dispatch }) {
        console.log('[site/loadData] Loading... ');
        try {
            await Promise.all(initActions.map(action => dispatch(action)));
            console.dir('[site/loadData] All data loaded!');
            commit('LOADED', {});
        } catch (err) {
            console.error('[site/loadData] Error loading site data!');
            console.dir(err);
            commit('LOADED', {});
        }
    },

    async loadRolesList ({commit}) {
        if (state.rolesListStatus !== 'IN_PROGRESS') {
            console.log('[site/loadRolesList] Loading... ');
            commit('DATA_LOADING', {name: 'rolesList'});
            const url = `${process.env.apiBase}/widget`;
            try {
                const res = await axios.get(url, {
                    params: {
                        model: 'EDF_ACM_Role',
                        pageNumber: 1,
                        pageSize: 1000,
                        orderBy: '',
                        query: ''
                    }
                });
                console.log('[site/loadRolesList] Roles list loaded!');
                const resList = _.get(res, 'data.rows', []).map(item => _.isEmpty(item.object) ? null : item.object);
                console.dir(_.compact(resList));
                const response = {
                    name: 'rolesList',
                    data: _.compact(resList)
                };
                commit('DATA_LOADED', response);
            } catch (err) {
                console.error('[site/loadRolesList] Error loading roles list!');
                console.dir(err);
                commit('DATA_LOADED', {
                    name: 'rolesList',
                    data: [],
                    error: err
                });
            }
        }
    },

    async loadIndustryList ({commit}) {
        if (state.industryListStatus !== 'IN_PROGRESS') {
            console.log('[site/loadIndustryList] Loading... ');
            commit('DATA_LOADING', {name: 'industryList'});
            const url = `${process.env.apiBase}/widget`;
            try {
                const res = await axios.get(url, {
                    params: {
                        model: 'Отрасль',
                        pageNumber: 1,
                        pageSize: 1000,
                        orderBy: '',
                        query: ''
                    }
                });
                const resList = _.get(res, 'data.rows', []).sort((a, b) => a.entityDesc.localeCompare(b.entityDesc))
                    .map(item => {
                    const icon = item.entityIcon;
                    let iconName = 'industry';
                    if (icon && icon.split('://')[1]) {
                        iconName = icon.split('://')[1];
                        if (iconName.indexOf('UID/') === 0) {
                            iconName = iconName.split('/')[2];
                        }
                        iconName = iconName.slice(0, -4);
                    }

                    return {
                        icon_list: `${process.env.base}/img/industryIcons/${iconName}.svg`,
                        icon: `${process.env.base}/img/industryIcons/${iconName}_black.svg`,
                        icon_map: `${process.env.base}/img/industryIcons/${iconName}_map.svg`,
                        icon_map_marked: `${process.env.base}/img/industryIcons/${iconName}_map_marked.svg`,
                        icon_map_selected: `${process.env.base}/img/industryIcons/${iconName}_map_selected.svg`,
                        icon_map_selected_marked: `${process.env.base}/img/industryIcons/${iconName}_map_selected_marked.svg`,
                        text: item.entityDesc,
                        value: item.entityInstancePk.entityInstanceId
                    };
                });
                console.log('[site/loadIndustryList] Industry list loaded!');
                console.dir(resList);

                const response = {
                    name: 'industryList',
                    data: resList
                };
                commit('DATA_LOADED', response);
            } catch (err) {
                console.error('[site/loadIndustryList] Error loading industry list!');
                console.dir(err);
                commit('DATA_LOADED', {
                    name: 'industryList',
                    data: [],
                    error: err
                });
            }
        }
    },

    async loadCountryList ({ commit, dispatch }) {
        if (state.countryListStatus !== 'IN_PROGRESS') {
            console.log('[site/loadCountryList] Loading... ');
            commit('DATA_LOADING', {name: 'countryList'});
            const url = `${process.env.apiBase}/widget`;
            try {
                const res = await axios.get(url, {
                    params: {
                        model: 'Страна',
                        pageNumber: 1,
                        pageSize: 1000,
                        orderBy: '',
                        query: ''
                    }
                });
                console.log('[site/loadCountryList] Region list loaded!');
                const resList = _.get(res, 'data.rows', []).sort((a, b) => a.entityDesc.localeCompare(b.entityDesc)).map(item => ({
                    text: item.entityDesc,
                    value: item.entityInstancePk.entityInstanceId
                }));

                const response = {
                    name: 'countryList',
                    data: resList
                };
                commit('DATA_LOADED', response);
            } catch (err) {
                console.error('[site/loadRegionList] Error loading region list!');
                console.dir(err);
                commit('DATA_LOADED', {
                    name: 'countryList',
                    data: [],
                    error: err
                });
            }
        }
    },

    async loadRegionList ({commit}, countryId) {
        if (state.industryRegionStatus !== 'IN_PROGRESS') {
            console.log(`[site/loadRegionList] Loading region for country ${countryId}... `);
            commit('DATA_LOADING', {name: 'regionList'});
            if (!(countryId && !isNaN(Number(countryId)))) {
                console.error('[site/loadRegionList] Bad countryId!');
                commit('DATA_LOADED', {
                    name: 'regionList',
                    data: []
                });
            }
            const url = `${process.env.apiBase}/widget`;
            try {
                const res = await axios.get(url, {
                    params: {
                        model: 'Регион',
                        pageNumber: 1,
                        pageSize: 1000,
                        orderBy: '',
                        query: `[Страна] = ${countryId}`
                    }
                });
                console.log('[site/loadRegionList] Region list loaded!');
                console.dir(res.data);
                const resList = _.get(res, 'data.rows', []).sort((a, b) => a.entityDesc.localeCompare(b.entityDesc)).map(item => ({
                    text: item.entityDesc,
                    value: item.entityInstancePk.entityInstanceId
                }));

                const response = {
                    name: 'regionList',
                    data: resList
                };
                commit('DATA_LOADED', response);
            } catch (err) {
                console.error('[site/loadRegionList] Error loading region list!');
                console.dir(err);
                commit('DATA_LOADED', {
                    name: 'regionList',
                    data: [],
                    error: err
                });
            }
        }
    },

    async loadLayoutCategoryList ({commit}) {
        if (state.layoutCategoryListStatus !== 'IN_PROGRESS') {
            console.log('[site/loadLayoutCategoryList] Loading... ');
            commit('DATA_LOADING', {name: 'layoutCategoryList'});
            const url = `${process.env.apiBase}/widget`;
            try {
                const res = await axios.get(url, {
                    params: {
                        model: 'WEB_LayoutCategory',
                        pageNumber: 1,
                        pageSize: 99999,
                        orderBy: '',
                        query: ''
                    }
                });
                console.log('[site/loadLayoutCategoryList] Layout categories loaded!');
                console.dir(res.data);
                const response = {
                    name: 'layoutCategoryList',
                    data: _.get(res, 'data.rows', [].sort((a, b) => a.entityDesc.localeCompare(b.entityDesc))).map(item => {
                        const data = item.object;
                        data.showUnautorized = data.showUnautorized === 'True';
                        data.externalUrl = data.externalUrl === 'True';
                        data._id = _.get(item, 'entityInstancePk.entityInstanceId');
                        return data;
                    })
                };
                commit('DATA_LOADED', response);
            } catch (err) {
                console.error('[site/loadLayoutCategory] Error loading layout categories!');
                console.dir(err);
                commit('DATA_LOADED', {
                    name: 'layoutCategoryList',
                    data: [],
                    error: err
                });
            }
        }
    },

    async createLayoutCategory ({dispatch}, payload) {
        console.log('[site/createLayoutCategory] Creating... ');
        const url = `${process.env.apiBase}/widget`;
        try {
            const res = await axios.post(url, { data: {
                    model: 'WEB_LayoutCategory',
                    data: payload
                } });
            console.log('[site/createLayoutCategory] Created layout category!');
            console.dir(res.data);
            await dispatch('loadLayoutCategoryList');
        } catch (err) {
            console.error('[site/createLayoutCategory] Error creating layout categories!');
            console.dir(err);
        }
    }
};

const mutations = {
    'LOADED' (st, data) {
        st.contacts = data.contacts || [];
        st.loaded = true;
    },

    'DATA_LOADING' (st, payload) {
        Vue.set(st, `${payload.name}Status`, 'IN_PROGRESS');
    },

    'DATA_LOADED' (st, payload) {
        Vue.set(st, `${payload.name}Status`, payload.data ? 'SUCCESS' : 'ERROR');
        Vue.set(st, payload.name, payload.data);
    },

    setEditable (st, value) {
        st.editable = value;
    }

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
