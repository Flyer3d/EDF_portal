import Vue from 'vue';
import axios from 'axios';
import _ from 'lodash';
import layout from './layout';
import page from './page';

const {
    state: layoutState,
    getters: layoutGetters,
    mutations: layoutMutations,
    actions: layoutActions
} = layout;
const {
    state: pageState,
    getters: pageGetters,
    mutations: pageMutations,
    actions: pageActions
} = page;

const defaultOptions = {
    colNum: 12,
    rowHeight: 30,
    isDraggable: true,
    isResizable: true,
    verticalCompact: true,
    useCssTransforms: true,
    autoSize: true
};

const templateLayout = {
    widgetIds: [],
    widgets: [],
    blockIds: [],
    blocks: [],
    layoutCategory: null,
    options: defaultOptions,
    title: 'Безымянная страница',
    type: 'layout',
    parentId: null,
    status: 'draft',
    _id: null
};

const templateDesktop = {
    layouts: [],
    name: null,
    title: null,
    defaultLayoutId: null
};

const state = () => ({
    layoutsList: [],
    layoutsTree: {},
    // layoutsTypeList: [],
    desktopsList: [],
    currentLayoutId: null,
    currentLayoutType: null,
    desktop: templateDesktop,

    desktopLoadStatus: 'INITIAL',
    desktopListStatus: 'INITIAL',
    desktopDeleteStatus: 'INITIAL',
    desktopSaveStatus: 'INITIAL',
    layoutLoadStatus: 'INITIAL',
    layoutDeleteStatus: 'INITIAL',
    layoutCreateStatus: 'INITIAL',
    layoutListStatus: 'INITIAL',
    layoutSaveStatus: 'INITIAL',
    error: null,
    isChanged: false,
    strict: process.env.NODE_ENV !== 'production'
});

const getters = {
    getCurrentLayout: (state, getters, rootState, rootGetters) => {
        if (!state.currentLayoutId) {
            return templateLayout;
        }
        const layout = rootGetters[`layout_${state.currentLayoutId}/layout`];
        return layout || templateLayout;
    },
    getCurrentLayoutParams: (state, getters, rootState, rootGetters) => {
        if (state.currentLayoutId) {
            return rootGetters[`layout_${state.currentLayoutId}/params`];
        }
        return {};
    },
    getAcceptedList: (state, getters, rootState, rootGetters) => {
        if (!state.currentLayoutId) {
            return [];
        }
        const list = rootGetters[`layout_${state.currentLayoutId}/acceptedList`];
        return list;
    },
    getDesktopTitle: st => st.desktop.title,
    getDesktop: st => st.desktop,
    getCurrentLayoutId: st => st.currentLayoutId,
    getCurrentLayoutName: st => {
        if (st.currentLayoutId && st.desktop.layouts && st.desktop.layouts.length > 0) {
            const layout = _.find(st.desktop.layouts, {_id: st.currentLayoutId}, {});
            console.log(`desktop/getCurrentLayoutSlug!!! ${st.currentLayoutId}`);
            console.dir(layout);
            if (layout) {
                return layout.title || '';
            }
        }
        return '';
    },
    getCurrentLayoutSlug: st => {
        if (st.currentLayoutId && st.desktop.layouts && st.desktop.layouts.length > 0) {
            const layout = _.find(st.desktop.layouts, {_id: st.currentLayoutId}, {});
            console.log(`desktop/getCurrentLayoutSlug!!! ${st.currentLayoutId}`);
            console.dir(layout);
            console.dir(st.desktop.layouts);
            if (layout) {
                return layout.slug || layout._id;
            }
        }
        return undefined;
    },
    getDefaultLayoutSlug: st => {
        if (st.desktop.defaultLayoutId) {
            const layout = _.find(st.desktop.layouts, {_id: st.desktop.defaultLayoutId}, {});
            if (layout) {
                console.log(`desktop/getDefaultLayoutSlug!!! ${st.desktop.defaultLayoutId} --> ${layout.slug || layout._id}`);
                console.dir(layout);
                return layout.slug || layout._id;
            }
        }
        if (st.desktop.layouts && st.desktop.layouts.length > 0) {
            const layout = st.desktop.layouts[0];
            console.log(`desktop/getDefaultLayoutSlug!!! ${layout._id} --> ${layout.slug || layout._id}`);
            console.dir(layout);
            return layout.slug || layout._id;
        }
        return '';
    },
    loadedLayoutsList: st => st.desktop.layouts || [],
    layoutsList: st => st.layoutsList,
    desktopsList: st => st.desktopsList,
    getDesktopName: st => st.desktop.name,
    getDefaultLayoutId: st => st.desktop.defaultLayoutId || (st.desktop.layouts[0] && st.desktop.layouts[0]._id),

    getDesktopSaveStatus: st => st.desktopSaveStatus,
    getDesktopDeleteStatus: st => st.desktopDeleteStatus,
    getDesktopLoadStatus: st => st.desktopLoadStatus,
    getDesktopListStatus: st => st.desktopListStatus,
    getLayoutSaveStatus: st => st.layoutSaveStatus,
    getLayoutLoadStatus: st => st.layoutLoadStatus,
    getLayoutDeleteStatus: st => st.layoutDeleteStatus,
    getLayoutCreateStatus: st => st.layoutCreateStatus,
    getLayoutListStatus: st => st.layoutListStatus,
    getError: st => st.error,
    isCurrentLayoutChanged: (state, getters, rootState, rootGetters) => {
        return rootGetters[`layout_${state.currentLayoutId}/isChanged`];
    },
    isLayoutChanged: (state, getters, rootState, rootGetters) => (layoutId) => {
        if (state.loadedLayoutsList.indexOf(String(layoutId)) === -1) {
            return false;
        }
        return rootGetters[`layout_${layoutId}/isChanged`];
    }
};

const actions = {

    // ********************* DESKTOP ACTIONS **************************

    /**
     * Async save desktop by name
     *
     * @param commit        {Function} Store commit methiod
     * @param state         {Object} Store state
     * @param rootGetters   {Object} Store root getters
     * @param name            {String} desktop name
     * @returns {Promise<boolean>}
     */
    async saveDesktop ({ commit, state, rootGetters }, {name, title}) {
        commit('DESKTOP_SAVING');
        console.log(`[desktop/saveDesktop] Saving desktop with name "${name}"!`);
        const desktop = Object.assign(state.desktop, {
            name,
            title: title || state.desktop.title,
            defaultLayoutId: state.currentLayoutId
        });
        console.dir(desktop);
        try {
            await axios.put(`${process.env.apiBase}/desktop/${name}`, {data: desktop});
            console.log(`[desktop/saveDesktop] Desktop ${name} saved!`);
            commit('DESKTOP_SAVED', {status: 'SUCCESS'});
        } catch (err) {
            console.error(`[desktop/saveDesktop] Error saving desktop ${name}!`);
            console.dir(err);
            commit('DESKTOP_SAVED', {status: 'ERROR', err});
        }
    },

    /**
     * Async gets desktops list from server
     *
     * @param commit        {Function} Store commit methiod
     * @returns {Promise<void>}
     */
    async getDesktopList ({ commit }) {
        console.log('[desktop/getDesktopList] Getting desktop list!');
        commit('DESKTOP_LIST_LOADING');
        try {
            const list = await axios.get(`${process.env.apiBase}/desktop`);
            console.log('[desktop/getDesktopList] desktopList loaded!');
            console.dir(list.data);

            commit('DESKTOP_LIST_LOADED', {status: 'SUCCESS', list: list.data});
        } catch (err) {
            console.error('[desktop/getDesktopList] Error loading desktop list!');
            console.dir(err.message);
            commit('DESKTOP_LIST_LOADED', {status: 'ERROR', err: err.message});
        }
    },

    /**
     * Async delete desktop by ID
     *
     * @param commit    {Function} Store commit methiod
     * @param dispatch  {Function} Store dispatch method
     * @param state     {Object} Store state
     * @param id        {String} ID
     * @returns {Promise<void>}
     */
    async deleteDesktop ({ commit, dispatch, state }, id) {
        console.log(`[desktop/deleteDesktop] Delete desktop id = ${id}!`);
        commit('DESKTOP_DELETING');
        try {
            await axios.delete(`${process.env.apiBase}/desktop/${id}`);
            commit('DESKTOP_DELETED', {status: 'SUCCESS'});
            await dispatch('getDesktopList');
        } catch (err) {
            console.error('[desktop/deleteDesktop] Error deleting desktop!');
            console.dir(err);
            commit('DESKTOP_DELETED', {status: 'ERROR', err});
        }
    },

    /**
     * Async load layout from server by ID or NAME
     *
     * @param commit        {Function} Store commit methiod
     * @param state         {Object} Store state
     * @param id            {String} ID
     * @returns {Promise<boolean>}
     */
    async getDesktop ({ dispatch, commit, state }, payload) {
        console.log(`[desktop/getDesktop] Loading desktop ${payload} (${Array.isArray(payload)})`);
        commit('DESKTOP_LOADING');
        try {
            console.log('[desktop/getDesktop] Getting Array!!!');
            const result = await axios.post(`${process.env.apiBase}/desktop/getDesktops`, {desktops: payload});
            console.log(`[desktop/getDesktop] SRC!!! Desktop ${payload} loaded!`);
            console.dir(result.data);
            commit('DESKTOP_LOADED', {status: 'SUCCESS', desktop: result.data});
        } catch (err) {
            console.error('[desktop/getDesktop] Error getting desktop!');
            console.dir(err.message);
            commit('DESKTOP_LOADED', {status: 'ERROR', err: err.message});
        }
    },

    // ************************* LAYOUT ACTIONS *****************************
    /**
     * Async create new layout and set it as current layout
     *
     * @param commit
     * @param dispatch
     * @param payload
     * @returns {Promise<void>}
     */
    async createLayout ({ commit, dispatch }, layout) {
        commit('LAYOUT_CREATING');
        console.log('[desktop/createLayout] Creating layout with params:');
        console.dir(layout);
        const url = `${process.env.apiBase}/layout`;
        try {
            const newLayout = await axios.post(url, {data: layout});
            console.log('[desktop/createLayout] Layout created');
            console.dir(newLayout.data);
            commit('createLayout', {layout: newLayout.data});
            commit('LAYOUT_CREATED', {status: 'SUCCESS', layout: newLayout.data});
            await dispatch('getLayoutList');
        } catch (err) {
            console.error('[desktop/createLayout] Error creating layout!');
            console.dir(err);
            commit('LAYOUT_CREATED', {status: 'ERROR', err});
        }
    },
    /**
     * Async delete layout by ID
     *
     * @param commit    {Function} Store commit methiod
     * @param dispatch  {Function} Store dispatch method
     * @param state     {Object} Store state
     * @param id        {String} ID
     * @returns {Promise<void>}
     */
    async deleteLayout ({ commit, dispatch, state }, id) {
        console.log(`[desktop/deleteLayout] Deleting layout id = ${id}`);
        commit('LAYOUT_DELETING');
        try {
            await axios.delete(`${process.env.apiBase}/layout/${id}`);
            commit('removeLayout', id);
            commit('LAYOUT_DELETED', {status: 'SUCCESS'});
            await dispatch('getLayoutList');
        } catch (err) {
            console.error('[desktop/deleteLayout] Error deleting layout!');
            console.dir(err);
            commit('LAYOUT_DELETED', {status: 'ERROR', err});
        }
    },

    /**
     * Async save layout by ID
     *
     * @param commit        {Function} Store commit methiod
     * @param state         {Object} Store state
     * @param rootGetters   {Object} Store root getters
     * @param id            {String} ID
     * @returns {Promise<boolean>}
     */
    async saveLayout ({ commit, state, rootGetters }, id) {
        console.log(`[desktop/saveLayout] Save layout id = ${id}`);
        if (_.findIndex(state.desktop.layouts, {_id: id}) === -1) {
            return false;
        }
        commit('LAYOUT_SAVING');
        const layout = Object.assign({}, rootGetters[`layout_${id}/layout`]);

        console.dir(layout);

        try {
            const { data } = await axios.put(`${process.env.apiBase}/layout/${id}`, {data: layout});
            console.log('[desktop/saveLayout] Response received!');
            console.dir(data);
            commit('layoutSaved', id);
            commit('LAYOUT_SAVED', {status: 'SUCCESS'});
        } catch (err) {
            console.error('[desktop/saveLayout] Error saving layout!');
            console.dir(err);
            commit('LAYOUT_SAVED', {status: 'ERROR', err});
        }
    },

    /**
     * Async load layout from server by ID
     *
     * @param commit        {Function} Store commit methiod
     * @param state         {Object} Store state
     * @param id            {String} ID
     * @returns {Promise<boolean>}
     */
    async getLayout ({ commit, state }, {path, query}) {
        console.log(`[desktop/getLayout] Getting Layout id = "${path}" (CLI = ${state.currentLayoutId} ${typeof state.currentLayoutId})`);
        if (!path) {
            console.log('[desktop/getLayout] Nothing to load!');
            return;
        }
        if (path === state.currentLayoutSlug) {
            console.log(`[desktop/getLayout] Layout is loaded yet`);
            return;
        }
        commit('LAYOUT_LOADING');
        try {
            const layout = await axios.get(`${process.env.apiBase}/layout/${path}`);
            console.log('[desktop/getLayout] Layout getted!');
            console.dir(layout.data);
            commit('createLayout', {layout: layout.data, query});
            commit('LAYOUT_LOADED', {status: 'SUCCESS'});
        } catch (err) {
            console.error('[desktop/getLayout] Error getting layout!');
            console.dir(err);
            commit('LAYOUT_LOADED', {status: 'ERROR', err});
        }
    },

    // ToDo: Возможно понадобится refreshLayout - обновить настройки лейаута с сервера

    /**
     * Async gets layouts list from server
     *
     * @param commit        {Function} Store commit methiod
     * @returns {Promise<void>}
     */
    async getLayoutList ({ commit }, payload) {
        commit('LAYOUT_LIST_LOADING');
        console.log('[desktop/getLayoutList] Loading layout list!');
        try {
            const list = await axios.get(`${process.env.apiBase}/layout`, {params: payload});
            console.log('[desktop/getLayoutList] Layout list getted');
            console.dir(list.data);
            commit('setList', list.data);
            commit('LAYOUT_LIST_LOADED', {status: 'SUCCESS'});
        } catch (err) {
            console.error('[desktop/getLayoutList] Error loading layout list!');
            console.dir(err);
            commit('LAYOUT_LIST_LOADED', {status: 'ERROR', err});
        }
    }
};

const mutations = {
    // ****************************** DESKTOP CRUD MUTATIONS *****************************

    'DESKTOP_SAVING' (st) {
        st.desktopLoadStatus = 'IN_PROGRESS';
    },
    'DESKTOP_SAVED' (st, payload) {
        st.desktopLoadStatus = payload.status;
        st.error = payload.err;
    },
    'DESKTOP_DELETING' (st) {
        st.desktopDeleteStatus = 'IN_PROGRESS';
    },
    'DESKTOP_DELETED' (st, payload) {
        st.desktopDeleteStatus = payload.status;
        st.error = payload.err;
    },
    'DESKTOP_LOADING' (st) {
        st.desktopLoadStatus = 'IN_PROGRESS';
        st.desktop = Object.assign({}, templateDesktop);
    },
    'DESKTOP_LOADED' (st, payload) {
        st.desktopLoadStatus = payload.status;
        st.desktop = payload.desktop || Object.assign({}, templateDesktop);
        st.error = payload.err;
    },
    'DESKTOP_LIST_LOADING' (st) {
        st.desktopListStatus = 'IN_PROGRESS';
    },
    'DESKTOP_LIST_LOADED' (st, payload) {
        st.desktopListStatus = payload.status;
        st.desktopsList = payload.list || [];
        st.error = payload.err;
    },

    // ****************************** lAYOUT CRUD MUTATIONS ******************************
    'LAYOUT_SAVING' (st) {
        st.layoutSaveStatus = 'IN_PROGRESS';
    },
    'LAYOUT_SAVED' (st, payload) {
        st.layoutSaveStatus = payload.status;
        st.error = payload.err;
    },
    'LAYOUT_CREATING' (st) {
        st.layoutCreateStatus = 'IN_PROGRESS';
    },
    'LAYOUT_CREATED' (st, payload) {
        st.layoutCreateStatus = payload.status;
        if (st.layout) {
            const layout = st.layout;
            delete layout.widgets;
           st.desktop.layouts.push(layout);
        }
        st.error = payload.err;
    },
    'LAYOUT_DELETING' (st) {
        st.layoutDeleteStatus = 'IN_PROGRESS';
    },
    'LAYOUT_DELETED' (st, payload) {
        st.layoutDeleteStatus = payload.status;
        st.error = payload.err;
    },
    'LAYOUT_LOADING' (st) {
        st.layoutLoadStatus = 'IN_PROGRESS';
    },
    'LAYOUT_LOADED' (st, payload) {
        st.layoutLoadStatus = payload.status;
        st.error = payload.err;
        if (_.get(payload, 'err.response.data.code') === 404) {
            console.log('[LAYOUT_LOADED] Error loading layout!!! Redirecting!...');
            this.app.router.replace('/error/404');
        }
    },
    'LAYOUT_LIST_LOADING' (st) {
        st.layoutListStatus = 'IN_PROGRESS';
    },
    'LAYOUT_LIST_LOADED' (st, payload) {
        st.layoutListStatus = payload.status;
        st.error = payload.err;
    },

    unregister (st) {
        if (st.currentLayoutId) {
            this.commit(`layout_${st.currentLayoutId}/unregister`);
            this.unregisterModule(`layout_${st.currentLayoutId}`);
            st.currentLayoutId = null;
            st.desktop = templateDesktop;
            st.desktopLoadStatus = 'INITIAL';
        }
    },
    resetCurrentLayout (st) {
        if (st.currentLayoutId) {
            this.commit(`layout_${st.currentLayoutId}/unregister`);
            this.unregisterModule(`layout_${st.currentLayoutId}`);
            st.currentLayoutId = null;
        }
    },

    createLayout (st, {layout, query}) {
        if (!layout) {
            console.log('[desktop/createLayout] EMPTY LAYOUT!!!');
            return false;
        }
        console.log(`[desktop/createLayout] Creating layout id = ${layout._id} ${typeof layout._id} (CLI = ${st.currentLayoutId})`);
        console.dir(layout);

        const id = layout._id;
        if (st.currentLayoutId) {
            try {
                if (process.browser) {
                    this.commit(`layout_${st.currentLayoutId}/unregister`);
                    this.unregisterModule(`layout_${st.currentLayoutId}`);
                } else {
                    st.currentLayoutId = null;
                }
            } catch (err) {
                console.error(`[desktop/createLayout] Error unregistering layout ${st.currentLayoutId}`);
                console.error(err);
            }
        }
        console.log('[desktop/createLayout] REGISTERING modules');
        console.dir(st);
        if (layout.type === 'page') {
            console.log('[desktop/createLayout] Creating PAGE');
            console.dir(pageState);
            this.registerModule(`layout_${id}`, {
                state: pageState,
                getters: pageGetters,
                mutations: pageMutations,
                actions: pageActions,
                namespaced: true
            });
        } else {
            console.log('[desktop/createLayout] Creating LAYOUT');
            console.dir(layoutState);
            this.registerModule(`layout_${id}`, {
                state: layoutState,
                getters: layoutGetters,
                mutations: layoutMutations,
                actions: layoutActions,
                namespaced: true
            });
        }
        console.log(`[desktop/createLayout] Committing to layout_${id}/loadLayout...`);
        console.dir(this);
        console.dir(this._modulesNamespaceMap[`layout_${id}/`]);
        console.dir(this._modulesNamespaceMap[`layout_${id}/`].state);
        this.commit(`layout_${id}/loadLayout`, {layout, query});

        if (_.findIndex(st.desktop.layouts, {_id: id}) === -1) {
            st.desktop.layouts.push(layout);
        }
        console.log(`Setting currentLayoutId to ${id}`);
        Vue.set(st, 'currentLayoutId', id);
        Vue.set(st, 'currentLayoutType', layout.type);
    },

    addLayoutToList (st, layout) {
        const id = layout && layout._id;
        if (id) {
            if (_.findIndex(st.desktop.layouts, {_id: id}) === -1) {
                st.desktop.layouts.push(layout);
            }
        }
    },

    removeLayout (st, id) {
        console.log('[desktop/removeLayout] Removing layout from list:');
        const index = _.findIndex(st.desktop.layouts, {_id: id});
        if (index === -1) {
            return false;
        }
        st.desktop.layouts.splice(index, 1);

        if (Number(st.desktop.defaultLayoutId) === Number(id)) {
            st.desktop.defaultLayoutId = null;
        }
        console.log(`[desktop/removeLayout] CurrentLayout = ${st.currentLayoutId}, id = ${id}`);
        if (Number(st.currentLayoutId) === Number(id)) {
            console.log(`[desktop/removeLayout] Reloading Current layout!!!`);
            this.commit(`layout_${id}/unregister`);
            this.unregisterModule(`layout_${id}`);
            st.currentLayoutId = null;
            if (st.desktop.layouts && st.desktop.layouts.length > 0) {
                this.dispatch('desktop/getLayout', {path: st.desktop.layouts[0].slug || st.desktop.layouts[0]._id});
            }
        }
    },

    updateCurrentLayout (st, layout) {
        if (!st.currentLayoutId) {
            return false;
        }
        const layoutIndex = _.findIndex(st.desktop.layouts, {_id: st.currentLayoutId});
        console.log(`[uppdateCurrentLayout] Updating to: (LayoutIndex = ${layoutIndex})`);
        console.dir(layout);
        if (layoutIndex !== -1) {
            const layoutToUpdate = Object.assign({}, st.desktop.layouts[layoutIndex], {
                parentId: layout.parentId,
                layoutCategory: layout.layoutCategory,
                title: layout.title,
                slug: layout.slug
            });
            console.dir(layoutToUpdate);
            st.desktop.layouts.splice(layoutIndex, 1, layoutToUpdate);
        }
        this.commit(`layout_${st.currentLayoutId}/updateLayout`, layout);
    },

    layoutSaved (st, id) {
        this.commit(`layout_${id}/layoutSaved`);
        this.commit('site/setEditable', false);
    },

    setList (st, list) {
        Vue.set(st, 'layoutsList', list);
    },

    // Current Layout Widgets manipulation!
    createItem (st) {
        if (!st.currentLayoutId) {
            return false;
        }
        if (st.currentLayoutType === 'layout') {
            this.commit(`layout_${st.currentLayoutId}/createWidget`);
        } else if (st.currentLayoutType === 'page') {
            this.commit(`layout_${st.currentLayoutId}/createBlock`);
        }
        this.commit('site/setEditable', true);
    },
    deleteWidgetById (st, id) {
        if (!st.currentLayoutId) {
            return false;
        }
        this.commit(`layout_${st.currentLayoutId}/deleteWidgetById`, id);
    },
    updateWidgetById (st, payload) {
        if (!st.currentLayoutId) {
            return false;
        }
        this.commit(`layout_${st.currentLayoutId}/updateWidgetById`, payload);
    },
    widgetResized (st, id) {
        if (!st.currentLayoutId) {
            return false;
        }
        this.commit(`layout_${st.currentLayoutId}/widgetResized`, id);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
