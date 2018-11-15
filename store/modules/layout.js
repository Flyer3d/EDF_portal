import _ from 'lodash';
// import axios from 'axios';
import Vue from 'vue';
import widget from './widget';

const {
    state: widgetState,
    getters: widgetGetters,
    modules: widgetModules,
    mutations: widgetMutations,
    actions: widgetActions
} = widget;

const defaultOptions = {
    colNum: 12,
    rowHeight: 30,
    isDraggable: true,
    isResizable: true,
    verticalCompact: true,
    useCssTransforms: true,
    autoSize: true
};

const state = () => ({
    layout: {
        widgetIds: [],
        widgets: [],
        options: defaultOptions,
        title: 'Безымянная страница',
        type: 'layout',
        status: 'draft',
        _id: null
    },
    params: {},
    bus: new Vue(),
    isChanged: false,
    strict: process.env.NODE_ENV !== 'production'
});

const ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

const getters = {
    widgets (state, getters, rootState, rootGetters) {
        const widgets = [];
        for (let widgetId in state.layout.widgets) {
            const widget = rootGetters[`${widgetId}/getWidget`];
            widgets.push(widget);
        }
        return widgets;
    },
    options: st => st.layout.options,
    params: st => st.params,
    id: st => st.layout.id,
    bus: st => {
        if (st.bus) return st.bus;
        st.bus = new Vue();
        return st.bus;
    },
    acceptedList (state, getters, rootState, rootGetters) {
        let list = [];
        for (let widgetId in state.layout.widgets) {
            const acceptedModels = rootGetters[`${widgetId}/getAcceptedModels`];
            list = list.concat(acceptedModels);
        }
        return list;
    },
    layout (state, getters) {
        const layout = _.cloneDeep(state.layout);
        layout.widgets = getters['widgets'];
        return layout;
    },
    isChanged (state, getters, rootState, rootGetters) {
        if (state.isChanged) {
            return true;
        }
        for (let widgetId in state.layout.widgets) {
            if (rootGetters[`${widgetId}/isChanged`]) {
                return true;
            }
        }
        return false;
    }
};

const actions = {
};

const mutations = {
    layoutSaved (st) {
        Vue.set(st, 'isChanged', false);
        for (let widgetId in st.layout.widgets) {
            this.commit(`${widgetId}/saved`);
        }
    },
    /**
     * Load new layout
     *
     * @param st            {Object} Store state
     * @param inputLayout   {Object} New layout
     * @returns {boolean}
     */
    loadLayout (st, {layout: inputLayout, query}) {
        console.log('[layout/loadLayout] Loading layout:');
        console.dir(inputLayout);
        console.dir(query);

        if (!inputLayout) {
            return false;
        }
        st.params = Object.assign({}, query);
        const layout = Object.assign({}, inputLayout);
        const widgetIds = {};
        console.dir(layout);
        for (let i = 0; i < layout.widgets.length; i++) {
            const id = layout.widgets[i].location.i;

            this.registerModule(id, {
                state: widgetState,
                modules: widgetModules,
                getters: widgetGetters,
                mutations: widgetMutations,
                actions: widgetActions,
                namespaced: true
            });
            this.commit(`${id}/load`, layout.widgets[i]);
            this.commit(`${id}/setId`, id);
            this.commit(`${id}/setBus`, st.bus);
            widgetIds[id] = true;
        }
        layout.widgets = widgetIds;
        layout && Vue.set(st, 'layout', layout);

        Vue.set(st, 'isChanged', false);
    },
    /**
     * Update layout parameters
     *
     * @param st        {Object} Store state
     * @param layout    {Object} new Layout
     */
    updateLayout (st, layout) {
        const mergedLayout = _.merge(st.layout, layout);
        layout && Vue.set(st, 'layout', mergedLayout);
        Vue.set(st, 'isChanged', false);
    },
    /**
     * Update layout options
     *
     * @param st        {Object} Store state
     * @param options   {Object} New options
     */
    updateOptions (st, options) {
        const mergedOptions = _.merge(st.layout.options, options);
        Vue.set(st.layout, 'options', mergedOptions);
        Vue.set(st, 'isChanged', true);
    },

    /**
     * Unregister all widgets
     *
     * @param st       {Object} Store state
     */
    unregister (st) {
        console.log(`[layout_${st.layout._id}/unregister] Unregistering all widgets:`);
        console.dir(st.layout.widgets);
        for (let widgetId in st.layout.widgets) {
            this.commit(`${widgetId}/unregister`);
            this.unregisterModule(widgetId);
            delete st.layout.widgets[widgetId];
        }
    },

    // WIDGET section
    /**
     * Delete widget by it's ID
     *
     * @param st {Object} Store state
     * @param id {String} Widget ID
     * @returns {boolean}
     */
    deleteWidgetById (st, id) {
        if (!st.layout.widgets[id]) {
            console.error(`[STORE.layout.deleteWidgetById] Error: Widget ID = ${id} not found!`);
            return false;
        }
        this.commit(`${id}/unregister`);
        this.unregisterModule(id);
        delete st.layout.widgets[id];
        Vue.set(st, 'isChanged', true);
        return true;
    },

    /**
     * Create new widget
     *
     * @param st {Object} Store state
     */
    createWidget (st) {
        const id = `widget${ID()}`;

        this.registerModule(id, {
            state: widgetState,
            modules: widgetModules,
            getters: widgetGetters,
            mutations: widgetMutations,
            actions: widgetActions,
            namespaced: true
        });
        st.layout.widgets[id] = true;
        this.commit(`${id}/setId`, id);
        this.commit(`${id}/setBus`, st.bus);
        st.isChanged = true;
    },

    updateWidgetById (st, payload) {
        const id = payload && payload.id;
        const widget = payload && payload.widget;
        if (!st.layout.widgets[id]) {
            console.error(`[STORE.layout.updateWidgetById] Error: Widget ID = ${id} not found!`);
            return false;
        }
        this.commit(`${id}/update`, widget);
        st.isChanged = true;
    },

    widgetResized (st, id) {
        if (!st.layout.widgets[id]) {
            console.error(`[STORE.layout.widgetResized] Error: Widget ID = ${id} not found!`);
            return false;
        }
        this.commit(`${id}/resized`);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
