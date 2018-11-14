import _ from 'lodash';
import Vue from 'vue';

const defaultOptions = {
    maxWidth: null
};

const defaultBlock = {
    title: 'Безымянный блок',
    type: '',
    options: {}
};

const state = () => ({
    layout: {
        blocks: [],
        blockIds: [],
        options: defaultOptions,
        title: 'Безымянная страница',
        type: 'page',
        status: 'draft',
        _id: null
    },
    params: {},
    bus: new Vue(),
    isChanged: false,
    strict: process.env.NODE_ENV !== 'production'
});

const getters = {
    blocks: st => st.layout.blocks,
    options: st => st.layout.options,
    params: st => st.params,
    id: st => st.layout._id,
    bus: st => {
        if (st.bus) return st.bus;
        st.bus = new Vue();
        return st.bus;
    },
    layout: st => st.layout,
    isChanged: st => st.isChanged
};

const actions = {
};

const mutations = {
    layoutSaved (st) {
        Vue.set(st, 'isChanged', false);
    },
    /**
     * Load new layout
     *
     * @param st            {Object} Store state
     * @param inputLayout   {Object} New layout
     * @returns {boolean}
     */
    loadLayout (state, {layout: inputLayout, query}) {
        console.log('[page/loadLayout] Loading layout:');
        console.dir(inputLayout);
        console.dir(query);
        console.dir(state);
        if (!inputLayout) {
            return false;
        }
        state.params = Object.assign({}, query);
        const layout = Object.assign({}, inputLayout);
        console.log('[page/loadLayout] Loading data!');
        console.dir(layout);
        Vue.set(state, 'layout', layout);
        Vue.set(state, 'isChanged', false);
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
    },

    updateBlocks (st, blocks) {
        console.log('[page/updateBlocks] set blocks!');
        console.dir(blocks);
        Vue.set(st.layout, 'blocks', blocks);
        st.isChanged = true;
    },

    updateBlock (st, {index, block}) {
        console.log(`[page/updateBlock] set block ${index}!`);
        console.dir(block);
        st.layout.blocks.splice(index, 1, block);
        st.isChanged = true;
    },

    /**
     * Delete block
     *
     * @param st {Object} Store state
     * @param index {String} Widget ID
     * @returns {boolean}
     */
    deleteBlock (st, index) {
        st.layout.blocks.splice(index, 1);
        st.isChanged = true;
    },

    /**
     * Create new widget
     *
     * @param st {Object} Store state
     */
    createBlock (st) {
        console.log('[page] createWidget!');
        const newBlock = Object.assign({}, defaultBlock);
        newBlock.title = newBlock.title;
        st.layout.blocks.push(newBlock);
        st.isChanged = true;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
