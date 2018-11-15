import axios from 'axios';
import Vue from 'vue';
import _ from 'lodash';
import model from './model';

import segment from './widgetSegment';

const {
    state: widgetSegmentState,
    getters: widgetSegmentGetters,
    mutations: widgetSegmentMutations,
    modules: widgetSegmentModules,
    actions: widgetSegmentActions
} = segment;

const ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

const state = () => ({

    isAlive: true,
    widget: {
        location: {
            'x': 0,
            'y': 0,
            'w': 1,
            'h': 6,
            'i': ''
        },
        title: 'Безымянный виджет',
        type: '',
        widgetMenu: [],
        model: {
            name: '',
            title: '',
            type: ''
        },
        modelDescription: [],
        options: {
            acceptedModels: []
        }
    },
    bus: null,
    data: {},
    list: [],
    actionList: [],
    actionData: {},
    inputWidgetSegments: {},
    outputWidgetSegments: {},
    listPaging: {
        totalRows: 0,
        pageSize: 0,
        pageNumber: 0
    },
    actionListPaging: {
        totalRows: 0,
        pageSize: 0,
        pageNumber: 0
    },
    dataLoadStatus: 'INITIAL',
    dataSaveStatus: 'INITIAL',
    dataUpdateStatus: 'INITIAL',
    dataDeleteStatus: 'INITIAL',
    listLoadStatus: 'INITIAL',
    actionListLoadStatus: 'INITIAL',
    actionStatus: 'INITIAL',
    error: null,
    isChanged: false,
    id: ''
});

const getters = {
    // Statuses
    dataSaveStatus: st => st.dataSaveStatus,
    dataLoadStatus: st => st.dataLoadStatus,
    dataUpdateStatus: st => st.dataUpdateStatus,
    dataDeleteStatus: st => st.dataDeleteStatus,
    listLoadStatus: st => st.listLoadStatus,
    actionListLoadStatus: st => st.listLoadStatus,
    actionStatus: st => st.actionStatus,
    actionData: st => st.actionData,
    isChanged: st => st.isChanged,

    // data getters
    getData: st => st.data,
    getItem: st => st.data,
    getError: st => st.error,
    getItemId: st => st.data && st.data.entityInstancePk && st.data.entityInstancePk.entityInstanceId,
    getItemDesc: st => st.data && st.data.entityDesc,
    getList: st => st.list,
    getActionList: st => st.actionList,
    totalListRows: st => st.listPaging.totalRows,
    pageListSize: st => st.listPaging.pageSize,
    pageListNumber: st => st.listPaging.pageNumber,

    // widget getters
    getWidget: st => st.widget,
    getInputWidgetSegments: st => {
        const segments = [];
        for (let segment in st.inputWidgetSegments) {
            segments.push(segment);
        }
        return segments;
    },
    getOutputWidgetSegments: st => {
        const segments = [];
        for (let segment in st.outputWidgetSegments) {
            segments.push(segment);
        }
        return segments;
    },
    getId: st => st.id,
    getBus: st => st.bus,
    getOptions: st => st.widget.options,
    getAcceptedModels: st => st.widget.options.acceptedModels || [],
    getLocation: st => st.widget.location,
    getTitle: st => st.widget.title,
    getWidgetMenu: st => st.widget.widgetMenu,
    getType: st => st.widget.type,

    // model getters
    getModel: st => st.widget.model,
    getModelName: st => st.widget.model.name,
    getModelTitle: st => st.widget.model.title,
    getModelType: st => st.widget.model.type
};

const modules = {
    model
};

const actions = {
    // //////////////////////////////MODEL SECTION////////////////////////////////////
    async loadItem ({ commit, dispatch, state }, payload) {
        console.log('[widget/loadItem] Loading... ');
        console.dir(payload);
        commit('LOADING');
        const id = payload.id;
        const model = payload.model;
        const fields = payload.fields;
        const url = `${process.env.apiBase}/widget/${model}/${id}`;

        if (!id) {
            commit('LOADED', {});
            return;
        }
        try {
            const res = await axios.get(url);
            console.log('[widget/loadItem] Data loaded!');
            const resItem = _.get(res, 'data.rows[0]');
            console.dir(resItem);
            if (fields && fields.length > 0) {
                await Promise.all(fields.map(async (field) => {
                   if (field.replaceModelName && field.replaceFieldName && resItem.object[field.name]) {
                       console.log(`[widget/loadItem] Replacing field ${field.name}!!!`);
                       try {
                           let replaceRes;
                           if (field.replaceEqualFieldName) {
                               const replaceUrl = `${process.env.apiBase}/widget`;
                               let id = resItem.object[field.name];
                               if (field.type === 'DROPDOWN_LINK') {
                                   const splitValue = String(id).split('::');
                                   id = splitValue[0];
                               }
                               console.log(`Replacing id ${id} for field ${field.name}`);

                               replaceRes = await axios.get(replaceUrl, { params: {
                                       model: field.replaceModelName,
                                       pageNumber: 1,
                                       pageSize: 1,
                                       orderBy: '',
                                       query: `[${field.replaceEqualFieldName}] = '${id}'`
                                   } });
                           } else {
                               const replaceUrl = `${process.env.apiBase}/widget/${field.replaceModelName}/${id}`;
                               replaceRes = await axios.get(replaceUrl);
                           }

                           console.log(`[widget/loadItem] Replace data loaded for field ${field.name}!`);
                           console.dir(replaceRes.data);
                           const replaceItem = _.get(replaceRes, 'data.rows[0]');
                           resItem.object[field.name] = replaceItem.object[field.replaceFieldName];
                       } catch (err) {
                           console.error(`[widget/loadItem] Error loading REPLACE data for field ${field.name}!`);
                           console.dir(err);
                       }
                   }
                   return field;
               }));
            }
            console.log('[widget/loadItem] All fields replaced!!!');
            if (state.isAlive) {
                commit('LOADED', resItem);
            }
        } catch (err) {
            console.error('[widget/loadItem] Error loading widget data!');
            console.dir(err);
            if (state.isAlive) {
                commit('LOADED', {});
            }
        }
    },

    async updateItem ({ commit, dispatch, state }, payload) {
        console.log('[widget/updateItem] Updating... ');
        console.dir(payload);
        commit('UPDATING');
        const id = payload.id;
        const model = payload.modelName;
        const fields = payload.fields;
        const url = `${process.env.apiBase}/widget/${model}/${id}`;

        try {
            const res = await axios({
                url,
                method: 'PATCH',
                data: {fields}
            });
            console.log('[widget/updateItem] Item updated!');
            console.dir(res.data);
            if (state.isAlive) {
                commit('UPDATED', _.get(res, 'data.rows[0]'));
            }
        } catch (err) {
            console.error('[widget/updateItem] Error updating item!');
            console.dir(err);
            if (state.isAlive) {
                commit('UPDATED', {});
            }
        }
    },

    async deleteItem ({ commit, dispatch, state }, payload) {
        console.log('[widget/deleteItem] Deleting... ');
        console.dir(payload);
        commit('DELETING');
        const id = payload.id;
        const model = payload.modelName;
        const url = `${process.env.apiBase}/widget/${model}/${id}`;

        try {
            const res = await axios.delete(url);
            console.log('[widget/deleteItem] Item deleted!');
            console.dir(res.data);
            if (state.isAlive) {
                commit('DELETED', 'SUCCESS');
            }
        } catch (err) {
            console.error('[widget/deleteItem] Error deleting item!');
            console.dir(err);
            if (state.isAlive) {
                commit('DELETED', 'ERROR');
            }
        }
    },

    async loadFirstListItem ({ commit, dispatch, state }, payload) {
        console.log('[widget/loadFirstListItem] Loading... ');
        console.dir(payload);
        commit('LOADING');
        const url = `${process.env.apiBase}/widget`;
        try {
            const res = await axios.get(url, {
                params: {
                    model: payload.model,
                    query: payload.query,
                    orderBy: payload.orderBy,
                    pageNumber: 1,
                    pageSize: 1
                }
            });
            console.log('[widget/loadFirstListItem] Item loaded!');
            const resItem = _.get(res, 'data.rows[0]');
            console.dir(resItem);
            const fields = payload.fields;
            if (fields && fields.length > 0) {
                await Promise.all(fields.map(async (field) => {
                    if (field.replaceModelName && field.replaceFieldName && resItem.object[field.name]) {
                        console.log(`[widget/loadItem] Replacing field ${field.name}!!!`);

                        try {
                            let replaceRes;
                            let id = resItem.object[field.name];
                            if (field.type === 'DROPDOWN_LINK') {
                                const splitValue = String(id).split('::');
                                id = splitValue[0];
                            }
                            console.log(`Replacing id ${id} for field ${field.name}`);
                            if (field.replaceEqualFieldName) {
                                replaceRes = await axios.get(url, { params: {
                                        model: field.replaceModelName,
                                        pageNumber: 1,
                                        pageSize: 1,
                                        orderBy: '',
                                        query: `[${field.replaceEqualFieldName}] = '${id}'`
                                    } });
                            } else {
                                const replaceUrl = `${process.env.apiBase}/widget/${field.replaceModelName}/${id}`;
                                replaceRes = await axios.get(replaceUrl);
                            }

                            console.log(`[widget/loadItem] Replace data loaded for field ${field.name}!`);
                            console.dir(replaceRes.data);
                            const replaceItem = _.get(replaceRes, 'data.rows[0]');
                            resItem.object[field.name] = replaceItem.object[field.replaceFieldName];
                        } catch (err) {
                            console.error(`[widget/loadItem] Error loading REPLACE data for field ${field.name}!`);
                            console.dir(err);
                        }
                    }
                    return field;
                }));
            }
            console.log('[widget/loadItem] All fields replaced!!!');
            if (state.isAlive) {
                commit('LOADED', resItem);
            }
        } catch (err) {
            console.error('[widget/loadFirstListItem] Error loading first item!');
            console.dir(err);
            if (state.isAlive) {
                commit('LOADED', {});
            }
        }
    },

    async loadLastListItem ({ commit, dispatch, state }, payload) {
        console.log('[widget/loadLastListItem] Loading... ');
        console.dir(payload);
        commit('LOADING');
        const {model} = payload;
        const url = `${process.env.apiBase}/widget`;
        if (model.slice(0, 3) === 'EDF') {
            try {
                const res = await axios.get(url, {
                    params: {
                        model: payload.model,
                        query: payload.query,
                        orderBy: payload.orderBy,
                        pageNumber: 1,
                        pageSize: 1
                    }
                });
                console.log('[widget/loadLastListItem] FINAL item loaded!');

                const resItem = _.last(_.get(res, 'data.rows'));
                console.dir(resItem);
                const fields = payload.fields;
                if (fields && fields.length > 0) {
                    await Promise.all(fields.map(async (field) => {
                        if (field.replaceModelName && field.replaceFieldName && resItem.object[field.name]) {
                            console.log(`[widget/loadItem] Replacing field ${field.name}!!!`);

                            try {
                                let replaceRes;
                                let id = resItem.object[field.name];
                                if (field.type === 'DROPDOWN_LINK') {
                                    const splitValue = String(id).split('::');
                                    id = splitValue[0];
                                }
                                console.log(`Replacing id ${id} for field ${field.name}`);
                                if (field.replaceEqualFieldName) {
                                    replaceRes = await axios.get(url, { params: {
                                            model: field.replaceModelName,
                                            pageNumber: 1,
                                            pageSize: 1,
                                            orderBy: '',
                                            query: `[${field.replaceEqualFieldName}] = '${id}'`
                                        } });
                                } else {
                                    const replaceUrl = `${process.env.apiBase}/widget/${field.replaceModelName}/${id}`;
                                    replaceRes = await axios.get(replaceUrl);
                                }

                                console.log(`[widget/loadItem] Replace data loaded for field ${field.name}!`);
                                console.dir(replaceRes.data);
                                const replaceItem = _.get(replaceRes, 'data.rows[0]');
                                resItem.object[field.name] = replaceItem.object[field.replaceFieldName];
                            } catch (err) {
                                console.error(`[widget/loadItem] Error loading REPLACE data for field ${field.name}!`);
                                console.dir(err);
                            }
                        }
                        return field;
                    }));
                }
                console.log('[widget/loadItem] All fields replaced!!!');
                if (state.isAlive) {
                    commit('LOADED', resItem);
                }
            } catch (err) {
                console.error('[widget/loadLastListItem] Error loading widget list!');
                console.dir(err);
                if (state.isAlive) {
                    commit('LOADED', {});
                }
            }
        } else {
            try {
                const tempRes = await axios.get(url, {
                    params: {
                        model: payload.model,
                        query: payload.query,
                        orderBy: payload.orderBy,
                        pageNumber: 1,
                        pageSize: 1
                    }
                });
                console.log('[widget/loadLastListItem] TEMP item loaded!');
                console.dir(tempRes.data);
                const maxPageNumber = _.get(tempRes.data, 'paging.totalRows');
                const res = await axios.get(url, {
                    params: {
                        model: payload.model,
                        query: payload.query,
                        orderBy: payload.orderBy,
                        pageNumber: maxPageNumber,
                        pageSize: 1
                    }
                });
                console.log('[widget/loadLastListItem] FINAL item loaded!');
                const resItem = _.get(res, 'data.rows[0]');
                console.dir(resItem);
                const fields = payload.fields;
                if (fields && fields.length > 0) {
                    await Promise.all(fields.map(async (field) => {
                        if (field.replaceModelName && field.replaceFieldName && resItem.object[field.name]) {
                            console.log(`[widget/loadItem] Replacing field ${field.name}!!!`);
                            try {
                                let replaceRes;
                                let id = resItem.object[field.name];
                                if (field.type === 'DROPDOWN_LINK') {
                                    const splitValue = String(id).split('::');
                                    id = splitValue[0];
                                }
                                console.log(`Replacing id ${id} for field ${field.name}`);
                                if (field.replaceEqualFieldName) {
                                    replaceRes = await axios.get(url, { params: {
                                            model: field.replaceModelName,
                                            pageNumber: 1,
                                            pageSize: 1,
                                            orderBy: '',
                                            query: `[${field.replaceEqualFieldName}] = '${id}'`
                                        } });
                                } else {
                                    const replaceUrl = `${process.env.apiBase}/widget/${field.replaceModelName}/${id}`;
                                    replaceRes = await axios.get(replaceUrl);
                                }

                                console.log(`[widget/loadItem] Replace data loaded for field ${field.name}!`);
                                console.dir(replaceRes.data);
                                const replaceItem = _.get(replaceRes, 'data.rows[0]');
                                resItem.object[field.name] = replaceItem.object[field.replaceFieldName];
                            } catch (err) {
                                console.error(`[widget/loadItem] Error loading REPLACE data for field ${field.name}!`);
                                console.dir(err);
                            }
                        }
                        return field;
                    }));
                }
                console.log('[widget/loadItem] All fields replaced!!!');
                if (state.isAlive) {
                    commit('LOADED', resItem);
                }
            } catch (err) {
                console.error('[widget/loadLastListItem] Error loading widget list!');
                console.dir(err);
                if (state.isAlive) {
                    commit('LOADED', {});
                }
            }
        }
    },

    async loadList ({ commit, dispatch, state }, payload) {
        console.log('[widget/loadList] Loading... ');
        console.dir(payload);
        const fields = payload.fields;
        delete payload.fields;
        commit('LIST_LOADING');
        const url = `${process.env.apiBase}/widget`;
        try {
            const res = await axios.get(url, { params: payload });
            console.log('[widget/loadList] List loaded!');
            console.dir(res.data);

            const resList = _.get(res, 'data');
            console.dir(resList);
            if (fields && fields.length > 0) {
                await Promise.all(fields.map(async (field) => {
                    if (field.replaceModelName && field.replaceFieldName) {
                        console.log(`[widget/loadList] Replacing field ${field.name}!!!`);
                        const ids = resList.rows.map(item => item.object[field.name]);
                        console.log('[widget/loadList] IDS ===');
                        console.dir(ids);
                        await Promise.all(ids.map(async (id, i) => {
                            if (id) {
                                try {
                                    let replaceRes;
                                    if (field.type === 'DROPDOWN_LINK') {
                                        if (typeof id === 'object') {
                                            if (Array.isArray(id)) {
                                                id = id.map(item => _.get(item, 'entityInstancePk.entityInstanceId'));
                                            } else {
                                                id = _.get(id, 'entityInstancePk.entityInstanceId');
                                            }
                                        } else {
                                            const splitValue = String(id).split('::');
                                            id = splitValue[0];
                                        }
                                    }
                                    console.log(`Replacing id ${Array.isArray(id) ? id.join(', ') : id} for field ${field.name}`);
                                    if (field.replaceEqualFieldName) {
                                        if (Array.isArray(id)) {
                                            replaceRes = await Promise.all(id.map(async item => {
                                                const response = await axios.get(url, {
                                                    params: {
                                                        model: field.replaceModelName,
                                                        pageNumber: 1,
                                                        pageSize: 1,
                                                        orderBy: '',
                                                        query: `[${field.replaceEqualFieldName}] = '${item}'`
                                                    }
                                                });
                                                return response.data.rows[0];
                                            }));
                                        } else {
                                            replaceRes = await axios.get(url, {
                                                params: {
                                                    model: field.replaceModelName,
                                                    pageNumber: 1,
                                                    pageSize: 1,
                                                    orderBy: '',
                                                    query: `[${field.replaceEqualFieldName}] = '${id}'`
                                                }
                                            });
                                        }
                                    } else {
                                        if (Array.isArray(id)) {
                                            replaceRes = await Promise.all(id.map(async item => {
                                                const replaceUrl = `${process.env.apiBase}/widget/${field.replaceModelName}/${item}`;
                                                const response = await axios.get(replaceUrl);
                                                return response.data.rows[0];
                                            }));
                                        } else {
                                            const replaceUrl = `${process.env.apiBase}/widget/${field.replaceModelName}/${id}`;
                                            replaceRes = await axios.get(replaceUrl);
                                        }
                                    }
                                    console.log(`[widget/loadList] Replace data loaded for field ${field.name}!`);
                                    console.dir(replaceRes);
                                    if (Array.isArray(id)) {
                                        resList.rows[i].object[field.name] = replaceRes.map(item => item.object[field.replaceFieldName]).join(', ');
                                    } else {
                                        const replaceItem = _.get(replaceRes, 'data.rows[0]');
                                        resList.rows[i].object[field.name] = replaceItem.object[field.replaceFieldName];
                                    }
                                } catch (err) {
                                    console.error(`[widget/loadList] Error loading REPLACE data for field ${field.name}!`);
                                    console.dir(err);
                                }
                            }
                        }));
                    }
                    return field;
                }));
            }

            console.log(`[widget/loadList] All fields replaced!!! ${state.isAlive}`);
            if (state.isAlive) {
                commit('LIST_LOADED', resList);
            }
        } catch (err) {
            console.error('[widget/loadList] Error loading widget list!');
            console.dir(err);
            if (state.isAlive) {
                commit('LIST_LOADED', {});
            }
        }
    },

    // //////////////////////////////STEP SECTION////////////////////////////////////
    // ToDo: Сделать возможность сортировки/фильтрации/пагинации
    async loadStepList ({ commit, state }, payload) {
        console.log('[widget/loadStepList] Loading... ');
        commit('LIST_LOADING');
        const url = `${process.env.apiBase}/widget/step`;
        try {
            const res = await axios.get(url, { params: payload });
            console.log('[widget/loadStepList] Loaded EdfProcessList data!!');
            console.dir(res.data);
            if (state.isAlive) {
                commit('LIST_LOADED', res.data);
            }
        } catch (err) {
            console.error('[widget/loadStepList] Error EdfProcessList data!');
            console.dir(err);
            if (state.isAlive) {
                commit('LIST_LOADED', {});
            }
        }
    },

    async loadStepData ({ commit, dispatch, state }, payload) {
        console.log('[widget/loadStepData] Loading... ');
        console.dir(payload);
        commit('LOADING');
        const id = payload.id;
        const model = payload.model;
        const url = `${process.env.apiBase}/widget/step/${model}/${id}`;
        try {
            const res = await axios.get(url);
            console.log('[widget/loadStepData] Data loaded!');
            console.dir(res.data);
            if (state.isAlive) {
                commit('LOADED', res.data);
            }
        } catch (err) {
            console.error('[widget/loadStepData] Error loading widget data!');
            console.dir(err);
            if (state.isAlive) {
                commit('LOADED', {});
            }
        }
    },

    async submitStep ({ commit, dispatch, state }, payload) {
        commit('SAVING');
        console.log('[widget/submitStep] Saving... ');
        console.dir(payload);
        const {segments, activityTypeId, adapterTaskId} = payload;
        try {
            if (segments && segments.length > 0) {
                await dispatch('saveStepData', {segments, inAction: true});
                console.log('[widget/submitStep] All segments saved!!! Submitting!!!');
                const url = `${process.env.apiBase}/widget/step/${activityTypeId}/${adapterTaskId}`;
                await axios.post(url);
                console.log('[widget/submitStep] Data saved!');
                    commit('SAVED', 'SUCCESS');
            }
        } catch (err) {
            console.error('[widget/submitStep] Error loading widget data!');
            console.dir(err);
                commit('NOTSAVED', err);
        }
    },

    async saveStepData ({ commit, state }, payload) {
        const {segments, inAction} = payload;
        if (!inAction) {
            commit('SAVING');
        }
        console.log('[widget/saveStepData] Saving... ');
        console.dir(payload);
        try {
            if (segments && segments.length > 0) {
                await Promise.all(segments.map(async (segment) => {
                    console.log('\nSaving segment:');
                    console.dir(segment);
                    const fields = await Promise.all(segment.fields.map(async (item) => {
                        if ((item.type === 'FILE') && item.fileName) {
                            console.log(`Saving file "${item.fileName}, storage is: ${item.fileStorage}"`);
                            if (!item.form) {
                                item.value = `${item.fileStorage}://${item.fileName}`;
                                return item;
                            }
                            let file;

                            item.form.append('fileStorage', item.fileStorage);
                            item.form.append('fileName', item.fileName);
                            console.log('************   Sending file!!!!');
                            try {
                                file = await axios.post(
                                    `${process.env.apiBase}/utils/uploadFile`,
                                    item.form,
                                    {headers: {'Content-Type': 'multipart/form-data', 'Authorization': axios.defaults.headers.common['Authorization']}}
                                );
                            } catch (err) {
                                console.error(`Cannot save file ${item.fileName}`);
                                console.dir(err);
                                throw new Error('Cannot save file');
                            }
                            console.log('**************** SUCCESS!!!!!');
                            item.value = _.get(file, 'data.filePath');
                        } else if ((item.type === 'IMAGE') && item.fileName) {
                            console.log(`Saving image "${item.fileName}, storage is: ${item.fileStorage}"`);
                            if (!item.form) {
                                item.value = `${item.fileStorage}://${item.fileName}`;
                                return item;
                            }
                            let file;
                            item.form.append('fileStorage', 'images');
                            item.form.append('fileName', item.fileName);
                            console.log('************   Sending file!!!!');
                            try {
                                file = await axios.post(
                                    `${process.env.apiBase}/img`,
                                    item.form,
                                    {headers: {'Content-Type': 'multipart/form-data', 'Authorization': axios.defaults.headers.common['Authorization']}}
                                );
                            } catch (err) {
                                console.error(`Cannot save file ${item.fileName}`);
                                console.dir(err);
                                throw new Error('Cannot save file');
                            }
                            item.value = _.get(file, 'data.filePath');
                        }
                        return item;
                    }));

                    console.log('All files sended!');
                    console.dir(fields);

                    const sendObject = {};
                    fields.forEach(item => {
                        sendObject[item.name] = item.value;
                    });
                    console.log('Saving Object!');
                    console.dir(sendObject);
                    const url = `${process.env.apiBase}/widget/step`;
                    const res = await axios.post(url, {
                        data: {
                            model: segment.modelName,
                            id: segment.instanceId,
                            fields: sendObject
                        }
                    });
                    console.log(`[widget/saveData] Data saved for ${segment.modelName}!`);
                    console.dir(res.data);
                    return segment;
                }));
                console.log('[widget/saveStepData] All segments saved!!!');
                if (!inAction) {
                    commit('SAVED', 'SUCCESS');
                }
            }
        } catch (err) {
            console.error('[widget/saveStepData] Error loading widget data!');
            console.dir(err);
            if (!inAction) {
                commit('NOTSAVED', err);
            }
        }
    },

    async saveMonoStepData ({ commit, dispatch, state }, payload) {
        const { fields, entityName, processId } = payload;
        if (!processId) return;
        commit('SAVING');
        console.log('[widget/saveMonoStepData] Saving... ');
        console.dir(payload);
        try {
            const outFields = await Promise.all(fields.map(async (item) => {
                if ((item.type === 'FILE') && item.fileName) {
                    console.log(`Saving file "${item.fileName}, storage is: ${item.fileStorage}"`);
                    let file;
                    item.form.append('fileStorage', item.fileStorage);
                    item.form.append('fileName', item.fileName);
                    console.log('************   Sending file!!!!');
                    try {
                        file = await axios.post(
                            `${process.env.apiBase}/utils/uploadFile`,
                            item.form,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    'Authorization': axios.defaults.headers.common['Authorization']
                                }
                            }
                        );
                    } catch (err) {
                        console.error(`Cannot save file ${item.fileName}`);
                        console.dir(err);
                        throw new Error('Cannot save file');
                    }
                    console.log('**************** SUCCESS!!!!!');
                    item.value = _.get(file, 'data.filePath');
                } else if ((item.type === 'IMAGE') && item.fileName) {
                    console.log(`Saving image "${item.fileName}, storage is: ${item.fileStorage}"`);
                    let file;
                    item.form.append('fileStorage', 'images');
                    item.form.append('fileName', item.fileName);
                    console.log('************   Sending file!!!!');
                    try {
                        file = await axios.post(
                            `${process.env.apiBase}/img`,
                            item.form,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    'Authorization': axios.defaults.headers.common['Authorization']
                                }
                            }
                        );
                    } catch (err) {
                        console.error(`Cannot save file ${item.fileName}`);
                        console.dir(err);
                        throw new Error('Cannot save file');
                    }
                    item.value = _.get(file, 'data.filePath');
                }
                return item;
            }));

            console.log('All files sended!');
            console.dir(outFields);

            const sendObject = {};
            outFields.forEach(item => {
                sendObject[item.name] = item.value;
                });
            console.log(`Starting process ${processId} with data:`);
            console.dir(sendObject);
            const url = `${process.env.apiBase}/widget/step/submitMonoStep`;
            await axios.post(url, {
                processId,
                entityName,
                fields: sendObject
            });
            console.log('[widget/saveMonoStepData] MonoStep successfully terminated!');
            commit('SAVED', 'SUCCESS');
        } catch (err) {
            console.error('[widget/saveMonoStepData] Error terminating monoStep!');
            console.dir(err);
                commit('NOTSAVED', err);
        }
    },

    // //////////////////////////////ACTION SECTION////////////////////////////////////
    async loadActionList ({ commit, dispatch, state }, payload) {
        console.log(`[${state.id}/loadActionList] Loading... `);
        console.dir(payload);
        commit('ACTION_LIST_LOADING');
        state.isAlive = true;
        const url = `${process.env.apiBase}/widget/action`;
        try {
            const res = await axios.get(url, { params: payload });
            console.log(`[${state.id}/loadActionList] List loaded!`);
            console.dir(res.data);
            if (state.isAlive) {
                commit('ACTION_LIST_LOADED', res.data);
            }
        } catch (err) {
            console.error('[widget/loadActionList] Error loading action list!');
            console.dir(err);
            if (state.isAlive) {
                commit('ACTION_LIST_LOADED', {});
            }
        }
    },

    async doAction ({ commit, dispatch, state }, { actionId, entityInstance }) {
        console.log(`[widget/doAction]Starting new event id = ${actionId}!`);
        commit('ACTION_STARTED');
        const url = `${process.env.apiBase}/widget/action/${actionId}`;
        try {
            state.isAlive = true;
            console.log(`[widget/doAction] Posting to ${url}`);
            const actionData = await axios.post(url, {entityInstance});
            console.log(`[widget/doAction] Event id = ${actionId} started!`);
            console.dir(actionData.data);
            if (state.isAlive) {
                commit('ACTION_SUCCESS', actionData.data);
            }
        } catch (err) {
            console.error(`[widget/doAction] Error creating new event id = ${actionId}!`);
            console.dir(err);
            if (state.isAlive) {
                commit('ACTION_FAIL', err);
            }
        }
    }
};

const mutations = {
    'ACTION_STARTED' (st) {
        st.actionStatus = 'STARTED';
    },
    'ACTION_SUCCESS' (st, actionData) {
        st.actionData = actionData;
        st.actionStatus = 'SUCCESS';
    },
    'ACTION_FAIL' (st, error) {
        st.actionStatus = 'FAIL';
        st.error = error;
    },
    'LOADING' (st) {
        st.data = {};
        st.dataLoadStatus = 'LOADING';
    },
    'LOADED' (st, data) {
        st.data = data || {};
        st.dataLoadStatus = 'LOADED';
    },
    'UPDATING' (st) {
        st.data = {};
        st.dataUpdateStatus = 'UPDATING';
    },
    'UPDATED' (st, data) {
        st.data = data || {};
        st.dataUpdateStatus = 'UPDATED';
    },
    'DELETING' (st) {
        st.dataDeleteStatus = 'DELETING';
    },
    'DELETED' (st, status) {
        st.dataDeleteStatus = status;
        st.data = {};
    },
    'SAVING' (st) {
        st.dataSaveStatus = 'SAVING';
    },
    'SAVED' (st) {
        st.dataSaveStatus = 'SUCCESS';
    },
    'NOTSAVED' (st, error) {
        st.dataSaveStatus = 'ERROR';
        st.error = error;
    },
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
    'ACTION_LIST_LOADING' (st) {
        st.actionListLoadStatus = 'LOADING';
    },
    'ACTION_LIST_LOADED' (st, data) {
        st.actionList = (data && data.rows) || [];
        st.actionListPaging = (data && data.paging) || {
            totalRows: 0,
            pageSize: 0,
            pageNumber: 0
        };
        st.actionListLoadStatus = 'LOADED';
    },
    setId (st, id) {
        st.id = id;
        st.widget.location.i = id;
    },
    setBus (st, bus) {
        st.bus = bus;
    },
    resized (st) {
        st.isChanged = true;
    },
    saved (st) {
        st.isChanged = false;
    },
    load (st, widget) {
        Vue.set(st, 'widget', widget);
        st.widget.location.i = st.id;
        st.isChanged = false;
        console.log('[WIDGET] Widget LOAD!!!');
        st.isAlive = true;
    },
    update (st, widget) {
        const mergedWidget = Object.assign({}, st.widget, widget);
        Vue.set(st, 'widget', mergedWidget);
        st.widget.location.i = st.id;
        st.isChanged = true;
        st.isAlive = true;
    },

    createSegment (st, payload) {
        const id = `segment${ID()}`;
        const segmentId = `${st.id}/${id}`;
        const segmentType = payload.type;
        const fields = payload.fields;
        st.isAlive = true;
        this.registerModule([st.id, id], {
            state: widgetSegmentState,
            getters: widgetSegmentGetters,
            mutations: widgetSegmentMutations,
            modules: widgetSegmentModules,
            actions: widgetSegmentActions,
            namespaced: true
        });
        if (segmentType === 'INPUT') {
            st.inputWidgetSegments[id] = true;
        } else if (segmentType === 'OUTPUT') {
            st.outputWidgetSegments[id] = true;
        }
        this.commit(`${segmentId}/setData`, {
            id: id,
            widgetId: st.id,
            modelName: payload.modelName,
            instanceId: payload.instanceId,
            fields
        });
    },

    deleteSegmentById (st, id) {
        if (st.inputWidgetSegments[id]) {
            this.commit(`${st.id}/${id}/unregister`);
            this.unregisterModule([st.id, id]);
            delete st.inputWidgetSegments[id];
            Vue.set(st, 'isChanged', true);
            return true;
        } else if (st.outputWidgetSegments[id]) {
            this.commit(`${st.id}/${id}/unregister`);
            this.unregisterModule([st.id, id]);
            delete st.outputWidgetSegments[id];
            Vue.set(st, 'isChanged', true);
            return true;
        } else {
            console.error(`[STORE.widget.deleteSegmentById] Error: Segment ID = ${id} not found!`);
            return false;
        }
    },
    unregister (st) {
        console.log(`[${st.id}/unregister] Widget UNREGISTER!!!`);
        this.commit(`${st.id}/unregisterSegments`);
        st.isAlive = false;
    },
    unregisterSegments (st) {
        console.log(`[${st.id}/unregister] Widget UNREGISTER SEGMENTS!!!`);

        for (let segmentId in st.inputWidgetSegments) {
            this.commit(`${st.id}/${segmentId}/unregister`);
            this.unregisterModule([st.id, segmentId]);
            delete st.inputWidgetSegments[segmentId];
        }
        for (let segmentId in st.outputWidgetSegments) {
            this.commit(`${st.id}/${segmentId}/unregister`);
            this.unregisterModule([st.id, segmentId]);
            delete st.outputWidgetSegments[segmentId];
        }
    }
};

export default {
    namespaced: true,
    state,
    modules,
    getters,
    actions,
    mutations
};
