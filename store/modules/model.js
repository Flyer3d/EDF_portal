import axios from 'axios';

const state = () => ({
    // Suggest
    models: [],
    loading: false,
    // Models
    model: {},
    stepModel: {},
    processModel: {},
    stepListModel: {},
    modelLoadStatus: 'INITIAL',
    stepModelLoadStatus: 'INITIAL',
    processModelLoadStatus: 'INITIAL',
    stepListModelLoadStatus: 'INITIAL',
    error: null
});

const getters = {
    models: st => st.models,
    model: st => st.model,
    stepModel: st => st.stepModel,
    processModel: st => st.processModel,
    stepListModel: st => st.stepListModel,
    modelLoadStatus: st => st.modelLoadStatus,
    stepModelLoadStatus: st => st.stepModelLoadStatus,
    processModelLoadStatus: st => st.processModelLoadStatus,
    stepListModelLoadStatus: st => st.stepListModelLoadStatus,
    loading: st => st.loading,
    error: st => st.error
};

const actions = {
    /**
     * Load all aviable models
     *
     * @param term       {String} Search term
     */
    async suggest ({ commit }, term) {
        const url = `${process.env.apiBase}/model`;
        commit('SUGGEST_LOADING');
        try {
            console.log(`[suggest] Searching with q = "${term}"`);
            const response = await axios.get(url, { params: { q: term } });
            commit('SUGGEST_LOADED', response.data);
        } catch (err) {
            console.error('[suggest] Error getting models list!');
            console.dir(err);
            commit('SUGGEST_LOADED', []);
        }
    },

    /**
     * Get model description
     *
     * @param model       {String} Model name
     */
    async getModel ({ commit }, model) {
        commit('MODEL_LOADING');
        const url = `${process.env.apiBase}/model/model`;
        try {
            const response = await axios.get(url, { params: { model } });
            console.log(`[getModel] Model ${model} loaded!`);
            commit('MODEL_LOADED', { status: 'SUCCESS', model: response.data });
        } catch (err) {
            console.error(`[getModel] Error getting model ${model}! `);
            console.dir(err);
            commit('MODEL_LOADED', { status: 'ERROR', error: err });
        }
    },

    /**
     * Get process model description
     *
     * @param startEventPk       {Number} Process startEventPk
     */
    async getProcessModel ({ commit }, startEventPk) {
        commit('PROCESS_MODEL_LOADING');
        const url = `${process.env.apiBase}/model/stepModelByEventPk`;
        try {
            const response = await axios.post(url, { startEventPk });
            console.log(`[getProcessModel] Model for process ${startEventPk} loaded!`);
            commit('PROCESS_MODEL_LOADED', { status: 'SUCCESS', model: response.data });
        } catch (err) {
            console.error(`[getProcessModel] Error getting model for process ${startEventPk}! `);
            console.dir(err);
            commit('PROCESS_MODEL_LOADED', { status: 'ERROR', error: err });
        }
    },

    /**
     * Get step model description
     *
     * @param payload      {Object} Parametres for StepModel: {stepId, processId, flowNodeId}
     */
    async getStepModel ({ commit }, payload) {
        commit('STEP_MODEL_LOADING');
        const url = `${process.env.apiBase}/model/stepModel`;
        try {
            const response = await axios.get(url, { params: payload });
            console.log('[getStepModel] Step Model data received');
            console.dir(response.data);
            commit('STEP_MODEL_LOADED', { status: 'SUCCESS', model: response.data });
        } catch (err) {
            console.error('[getStepModel] Error getting step model!');
            console.dir(err);
            commit('STEP_MODEL_LOADED', { status: 'ERROR', error: err });
        }
    },

    /**
     * Get step list model description
     *
     */
    async getStepListModel ({ commit }) {
        commit('STEP_LIST_MODEL_LOADING');
        const url = `${process.env.apiBase}/model/stepListModel`;
        try {
            const response = await axios.get(url);
            console.log('[getStepListModel] Step List Model data received');
            console.dir(response.data);
            commit('STEP_LIST_MODEL_LOADED', { status: 'SUCCESS', model: response.data });
        } catch (err) {
            console.error('[getStepListModel] Error getting step list model!');
            console.dir(err);
            commit('STEP_LIST_MODEL_LOADED', { status: 'ERROR', error: err });
        }
    }
};

const mutations = {
    'SUGGEST_LOADING' (st) {
        st.loading = true;
    },
    'SUGGEST_LOADED' (st, models) {
        st.models = models || [];
        st.loading = false;
    },
    'MODEL_LOADING' (st) {
        st.modelLoadStatus = 'IN_PROGRESS';
    },
    'MODEL_LOADED' (st, {status, model, error}) {
        st.modelLoadStatus = status;
        st.model = model || {};
        st.error = error || null;
    },
    'PROCESS_MODEL_LOADING' (st) {
        st.processModelLoadStatus = 'IN_PROGRESS';
    },
    'PROCESS_MODEL_LOADED' (st, {status, model, error}) {
        st.processModelLoadStatus = status;
        st.processModel = model || {};
        st.error = error || null;
    },
    'STEP_MODEL_LOADING' (st) {
        st.stepModelLoadStatus = 'IN_PROGRESS';
    },
    'STEP_MODEL_LOADED' (st, {status, model, error}) {
        st.stepModelLoadStatus = status;
        st.stepModel = model || {};
        st.error = error || null;
    },
    'STEP_LIST_MODEL_LOADING' (st) {
        st.stepListModelLoadStatus = 'IN_PROGRESS';
    },
    'STEP_LIST_MODEL_LOADED' (st, {status, model, error}) {
        st.stepListModelLoadStatus = status;
        st.stepListModel = model || {};
        st.error = error || null;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
