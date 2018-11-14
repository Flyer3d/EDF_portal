<template>
    <div class="table-widget">
        <v-data-table
            v-bind:headers="headers"
            :items="items"
            :pagination.sync="pagination"
            :total-items="totalRows"
            class="table-widget__table"
            :loading="loaded !== 'LOADED' || saveStatus === 'SAVING'"
            :rows-per-page-text="rowsPerPageText"
            :rows-per-page-items="rowsPerPageItems"
            no-data-text="Данные не загружены"
            no-results-text="Не найдено ни одной записи"
            v-model="selectedItem"
            item-key="_id"
    >
        <template slot="items" slot-scope="props">
            <tr @click="selectField(props)"
                class="table-widget__item"
                :class="{ 'table-widget__item_selected': (props.item._id === selectedId) }"
            >
                <td v-for="(field, i, j) in props.item" v-if="j > 0" :class="{ 'text-xs-right' : j > 1, 'text-xs-center' : j = 1}" :key="i">{{field}}</td>
                <td v-if="options.editable" class="justify-center layout px-0">
                    <v-btn icon class="mx-0" @click.stop="editItem(props.item)">
                        <v-icon color="teal">edit</v-icon>
                    </v-btn>
                    <v-btn icon class="mx-0" @click.stop="deleteItem(props.item)">
                        <v-icon color="pink">delete</v-icon>
                    </v-btn>
                </td>
            </tr>
        </template>
        <template slot="expand" slot-scope="props" v-if="options.expand && options.documentation && options.documentation.length > 0">
            <v-card flat>
                <v-card-text v-html="documentation(props.item._id)" class="table-widget__documentation"></v-card-text>
            </v-card>
        </template>
    </v-data-table>
        <v-dialog v-model="dialog" scrollable persistent lazy max-width="960" >
            <v-card>
                <v-toolbar :color="'primary'" :height="48">
                    <v-spacer></v-spacer>
                    <v-toolbar-title class="widget__title">{{modelName}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-card-text>
                    <v-form v-if="outputSegments && (outputSegments.length > 0)">

                        <step-card-segment
                                v-for="segmentId in outputSegments"
                                :id="segmentId"
                                :widgetId="id"
                                :inputData="itemToEdit.object"
                                :params="params"
                                :editable="true"
                                :showModelName="options.showModelName"
                                :key="segmentId"
                                ref="output"
                                @submit="saveSegment"
                        />
                    </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="blue darken-1" flat @click.stop="saveSegment">{{button.save}}</v-btn>
                    <v-btn flat @click.native="dialog=false">{{button.close}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import StepCardSegment from '~/components/widgets/StepCardSegment';

    export default {
        name: 'table-widget',
        components: {
            StepCardSegment
        },
        props: {
            id: {
                required: true,
                type: String
            },
            params: {
                type: Object
            },
            userQuery: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                freeze: false,
                dialog: false,
                button: (process.env.gui && process.env.gui.button) || {},
                $bus: this.storeBus,
                query: '',
                orderBy: '',
                searchQuery: '',
                masterFilter: '',
                externalFilter: '',
                pagination: {
                    rowsPerPage: (this.options && this.options.rowsPerPage) || 5,
                    page: 1
                },
                itemToEdit: {},
                itemToEditId: null,
                rowsPerPageText: 'Строк на странице:',
                rowsPerPageItems: [5, 15, 25],
                selectedItem: [],
                selectedId: null
            };
        },
        watch: {
            pagination: {
                handler (val) {
                    if (this.freeze) {
                        return;
                    }
                    this.freeze = true;
                    this.getData();
                },
                deep: true
            },
            options: {
                handler () {
                    console.log(`\n<---- [TableWidget ${this.id}] Options: Select OFF!!!`);
                    this.$bus.$off('select', this.selectItem);
                    this.query = '';
                    this.pagination.page = 1;
                    this.pagination.rowsPerPage = (this.options && this.options.rowsPerPage) || 5;
                    this.masterFilter = '';
                    if (this.options.widgetLink) {
                        this.$store.commit(`${this.id}/LIST_LOADING`);
                        console.log(`\n[TableWidget] Select ON!!!`);
                        this.$bus.$on('select', this.selectItem);
                    } else {
                        this.getData();
                    }
                },
                deep: true
            },
            loaded (val) {
                if (val === 'LOADED') {
                    this.$nextTick(() => {
                        this.freeze = false;
                    });
                }
            },
            searchQuery: function () {
                this.search();
            },
            data () {
                if (this.options.autoSelect && (this.data && this.data.length > 0)) {
                    setTimeout(() => this.selectField({item: {_id: _.get(this.data, '[0].entityInstancePk.entityInstanceId')}}), 700);
                }
            },
            userQuery (val) {
                this.getData();
            },
            saveStatus (val) {
                if (val === 'SAVED') {
                    this.$bus.$emit('refresh_all');
                }
            },
            deleteStatus (val) {
                console.log(`\n\nDALETE STATUS CHANGED WITH VAL = ${val}`);
                if (val === 'SUCCESS') {
                    this.$bus.$emit('refresh_all');
                }
            }
        },
        computed: {
            loaded () {
                return this.$store.getters[`${this.id}/listLoadStatus`];
            },
            totalRows () {
                return this.$store.getters[`${this.id}/totalListRows`];
            },
            storeBus () {
                return this.$store.getters[`${this.id}/getBus`];
            },
            data () {
                return this.$store.getters[`${this.id}/getList`];
            },
            modelName () {
                return this.$store.getters[`${this.id}/getModelName`];
            },
            saveStatus () {
                return this.$store.getters[`${this.id}/dataSaveStatus`];
            },
            deleteStatus () {
                return this.$store.getters[`${this.id}/dataDeleteStatus`];
            },
            fields () {
                return this.options.fields;
            },
            outputSegments () {
                return this.$store.getters[`${this.id}/getOutputWidgetSegments`];
            },
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            },
            queryStr () {
                if (this.options.query && this.options.query.queryStr) {
                    const params = this.params;
                    return this.options.query.queryStr.replace(/{{(.*?)}}/g, function (str, arg) {
                        if (arg) {
                            if (params && params[arg]) {
                                return encodeURIComponent(params[arg]);
                            }
                            return '';
                        }
                    });
                }
                return '';
            },
            headers () {
                const headers = [].concat(this.fields && this.fields.filter(item => item.checked).map((item, i) => {
                    return {
                        text: item.customName || item.name,
                        name: item.name,
                        type: item.type,
                        value: `field_${i}`,
                        align: i ? 'right' : 'left'
                    };
                }));
                if (this.options.editable) {
                    headers.push({
                        text: 'Actions',
                        value: '__actions',
                        align: 'right',
                        sortable: false });
                }
                return headers;
            },
            items () {
                const headers = this.headers;
                return (this.fields && this.data) && this.data.map((item) => {
                    const obj = {};
                    obj['_id'] = item.entityInstancePk && item.entityInstancePk.entityInstanceId;
                    headers.forEach(head => {
                        if (head.value === '__actions') {
                            return;
                        }
                        obj[head.value] = _.cloneDeep(item.object[head.name]) || 'Не задано';
                        if (head.type === 'CHECKBOX') {
                            if (obj[head.value] !== 'Не задано') {
                                obj[head.value] = (obj[head.value] === 'True') ? 'ДА' : 'НЕТ';
                            }
                        } else if (head.type === 'DATE') {
                            if (obj[head.value] !== 'Не задано') {
                                obj[head.value] = moment(obj[head.value]).format('DD-MM-YYYY HH:mm');
                            }
                        } else if (head.type === 'DROPDOWN_LINK') {
                            if (typeof obj[head.value] === 'string' && obj[head.value] !== 'Не задано') {
                                const splitValue = (obj[head.value] && String(obj[head.value]).split('::')) || [];
                                obj[head.value] = splitValue[1] || splitValue[0];
                            } else if (typeof obj[head.value] === 'object') {
                                if (Array.isArray(obj[head.value])) {
                                    obj[head.value] = obj[head.value].map(item => item.entityDesc).join(', ');
                                } else {
                                    obj[head.value] = _.get(obj[head.value], 'entityDesc');
                                }
                            }
                        }
                    });

                    return obj;
                });
            }
        },
        mounted () {
            this.$bus = this.storeBus;
            this.$bus.$on('refresh_all', this.getData);
            this.$bus.$on('filter', this.onFilter);
            this.pagination.rowsPerPage = (this.options && this.options.rowsPerPage) || 5;
            if (this.options.widgetLink) {
                this.$store.commit(`${this.id}/LIST_LOADING`);
                console.log(`\n----> [TableWidget ${this.id}] Select ON!!!`);
                this.$bus.$on('select', this.selectItem);
            } else {
                this.getData();
            }
        },
        beforeDestroy () {
            this.$bus && this.$bus.$off('refresh_all', this.getData);
            this.$bus && this.$bus.$off('filter', this.onFilter);
            this.$bus && this.$bus.$off('select', this.selectItem);
        },
        methods: {
            onFilter ({targetWidgetId, params}) {
                console.log(`[TableWidget] Filter event! (targetWidget = ${targetWidgetId}`);
                console.dir(params);
                if (targetWidgetId === this.id) {
                    console.log(`[TableWidget] OUR FILTER!!!`);
                    this.externalFilter = params;
                    this.getData();
                }
            },
            documentation (id) {
                if (this.options.documentation && this.options.documentation.length > 0) {
                    console.log(`Documentation for ID = ${id}`);
                    console.dir(this.options.documentation);
                    const docs = this.options.documentation;
                    const item = this.data.find(item => item.entityInstancePk.entityInstanceId === id);
                    const res = docs.map(doc => doc.replace(/{{(.*?)}}/g, function (str, arg) {
                        if (arg) {
                            return encodeURIComponent(item.object[arg]);
                        }
                        return '';
                    })).join('<br>');
                    console.log(`Res is "${res}"`);
                    return res;
                }
                return '';
            },
            getData () {
                console.log(`[TableWidget ${this.id}] getData!`);
                if (this.options.widgetLink && !this.masterFilter) return;
                const { sortBy, descending } = this.pagination;
                let query = [];
                if (this.masterFilter) query.push(this.masterFilter);
                if (this.queryStr) query.push(this.queryStr);
                if (this.userQuery) query.push(this.userQuery);
                if (this.query) query.push(this.query);
                if (this.externalFilter) query.push(this.externalFilter);

                let localOrderBy = '';
                if (sortBy !== null) {
                    localOrderBy = this.headers.find(item => item.value === sortBy).name + ((descending) ? ' ASC' : ' DESC');
                }
                if (this.orderBy !== localOrderBy) {
                    this.orderBy = localOrderBy;
                    // ToDo: Проверить, чтобы не вызывалось повторно обновление!
                    this.pagination.page = 1;
                }
                const orderBy = (this.options.orderBy) ? (localOrderBy ? `${this.options.orderBy}, ${localOrderBy}` : this.options.orderBy) : localOrderBy;
                this.$store.dispatch(`${this.id}/loadList`, {
                    fields: this.options.fields,
                    model: this.modelName,
                    userOnly: this.options.userOnly,
                    pageNumber: this.pagination.page,
                    pageSize: this.pagination.rowsPerPage,
                    orderBy: orderBy,
                    query: query.length > 0 ? query.join(' AND ') : ''
                });
            },
            selectItem (obj) {
                console.log(`[TableWidget] Item selected! (incomingWidget = ${obj.widgetId}, masterWidget = ${this.options.dataSource.masterWidget})`);
                console.dir(obj);
                if (this.options.dataSource && obj.widgetId === this.options.dataSource.masterWidget && obj.modelName === this.options.dataSource.modelName) {
                    const source = this.options.dataSource;
                    if (source.field && source.operator && source.masterField) {
                        if (source.masterField === '_id') {
                            this.masterFilter = `[${source.field}]${source.operator}'${obj.item.entityInstancePk.entityInstanceId}'`;
                        } else {
                            this.masterFilter = `[${source.field}]${source.operator}'${obj.item.object[source.masterField]}'`;
                        }
                    }
                    console.log(`[TableWidget] OUR WIDGET!!! MasterFilter = ${this.masterFilter}`);
                    this.getData();
                }
            },
            selectField (props) {
                console.log('[TableWidget/selectField] property is:');
                console.dir(props);
                const id = props && props.item && props.item._id;
                    props.expanded = !props.expanded;
                    props.selected = !props.selected;
                const selectedItem = this.data.find(item => item.entityInstancePk.entityInstanceId === id);
                let item = _.cloneDeep(selectedItem);
                this.selectedId = id;
                this.fields.forEach(field => {
                    if (field.type === 'DROPDOWN_LINK') {
                        if (typeof item.object[field.name] === 'string') {
                            const splitValue = (item.object[field.name] && String(item.object[field.name]).split('::')) || [];
                            item.object[field.name] = splitValue[0];
                        } else if (typeof item.object[field.name] === 'object') {
                            if (Array.isArray(item.object[field.name])) {
                                item.object[field.name] = item.object[field.name].map(item => _.get(item, 'entityInstancePk.entityInstanceId'));
                            } else {
                                item.object[field.name] = _.get(item.object[field.name], 'entityInstancePk.entityInstanceId');
                            }
                        }
                        const splitValue = item.object[field.name] ? String(item.object[field.name]).split('::') : [];
                        item.object[field.name] = splitValue[0];
                    }
                });
                console.log(`[TableWidget] Emitting event select (widgetId = ${this.id})`);
                console.dir(item);
                this.$bus.$emit('select', {
                    widgetId: this.id,
                    modelName: this.modelName,
                    itemId: id,
                    item
                });
                this.fields.forEach(field => {
                    if (field.type === 'DROPDOWN_LINK') {
                        if (typeof selectedItem.object[field.name] === 'string') {
                            const splitValue = selectedItem.object[field.name] ? String(selectedItem.object[field.name]).split('::') : [];
                            this.$bus.$emit('select', {
                                widgetId: this.id,
                                modelName: field.linkedEntityName,
                                itemId: splitValue[0]
                            });
                        } else if (typeof selectedItem.object[field.name] === 'object') {
                            if (Array.isArray(selectedItem.object[field.name])) {
                                selectedItem.object[field.name].forEach(item => {
                                    this.$bus.$emit('select', {
                                        widgetId: this.id,
                                        modelName: field.linkedEntityName,
                                        itemId: _.get(item, 'entityInstancePk.entityInstanceId')
                                    });
                                });
                            } else {
                                this.$bus.$emit('select', {
                                    widgetId: this.id,
                                    modelName: field.linkedEntityName,
                                    itemId: _.get(selectedItem.object[field.name], 'entityInstancePk.entityInstanceId')
                                });
                            }
                        }
                    }
                });
            },
            search: _.debounce(function () {
                const source = this.options.dataSource;
                this.query = this.searchQuery ? `${this.headers.reduce((total, item) => {
                    if (item.type === 'CHECKBOX' || item.type === 'DATE' || (source && (source.field === item.name))) {
                        return total;
                    }
                    return `${total}${(total) ? ' OR ' : ''}[${item.text}]='%${this.searchQuery}%'`;
                }, '')}` : '';
                this.pagination.page = 1;
                this.getData();
            }, 500),
            deleteItem (item) {
                this.$store.dispatch(`${this.id}/deleteItem`, {
                    modelName: this.modelName,
                    id: item._id
                });
            },
            editItem (item) {
                const id = item._id;
                this.itemToEditId = item._id;
                this.itemToEdit = this.data.find(obj => obj.entityInstancePk.entityInstanceId === id);
                if (this.options.fields && this.options.fields.length > 0) {
                    this.freeze = true;
                    this.$store.commit(`${this.id}/unregisterSegments`);
                    console.log(`[TableWidget] Creating form!`);
                    console.dir(this.options.fields);
                    this.$store.commit(`${this.id}/createSegment`, {
                        type: 'OUTPUT',
                        instanceId: item._id,
                        modelName: this.modelName,
                        fields: this.options.fields
                    });
                }
                this.$nextTick(() => {
                    this.freeze = false;
                    setTimeout(() => this.onResize(), 200);
                    this.dialog = true;
                });
            },
            onResize () {
                this.$refs.output && this.$refs.output.forEach(item => item.onResize());
            },
            saveSegment (items) {
                const segments = (this.$refs.output && this.$refs.output.map(item => item.getSegmentData())) || [];
                const fields = (segments[0] && segments[0].fields) || {};
                console.log('[TableWidget] Save items with params:');
                console.dir(segments);
                console.dir({
                    fields,
                    modelName: this.modelName,
                    id: this.itemToEditId
                });
                this.$store.dispatch(`${this.id}/saveStepData`, {
                    segments
                });
                this.dialog = false;
            }
        }
    };
</script>

<style lang="stylus">

    .table-widget
        & th
        & td
            max-width 200px
            min-width 100px
            overflow hidden
            text-overflow ellipsis
            outline-style none
        .table-widget
            &__search
                padding 0 16px

            &__item_selected
                background #ffffcc

            &__documentation
                padding 8px 24px
                width 100%
                background-color: #eee;
                line-height: 1.4;

</style>
