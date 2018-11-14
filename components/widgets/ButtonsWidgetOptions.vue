<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text v-show="!loading">
            <v-select
                    v-bind:items="connectionOptions"
                    v-model="connectionType"
                    :label="gui.dataSourceLabel"
                    single-line
                    bottom
            ></v-select>
            <template v-if="connectionType === 'listElem'">
                <v-select
                        v-bind:items="items"
                        v-model="stepId"
                        :label="gui.selectEntityLabel"
                        single-line
                        bottom
                ></v-select>
            </template>
            <template v-else-if="connectionType === 'firstElem' || connectionType === 'lastElem'">
                <filter-query
                        ref="filterQuery"
                        :fields="dataOptions.fields"
                        :rawQuery="dataOptions.query && dataOptions.query.queryRaw"
                />
                <v-text-field
                        :label="gui.sortLabel"
                        placeholder="field_1 DESC, field_2 ASC"
                        v-model="dataOptions.orderBy"
                        ref="sort"
                ></v-text-field>
            </template>
            <template v-else-if="connectionType === 'widgetClassElem'">
                <v-select
                        v-bind:items="acceptedItems"
                        v-model="dataOptions.dataSource.masterWidget"
                        :label="gui.masterWidgetLabel"
                        single-line
                        bottom
                ></v-select>
            </template>
            <v-btn block @click.native="getModel(model.name)">{{gui.refreshModel}}</v-btn>
            <v-checkbox label="Вертикальное расположение кнопок" v-model="dataOptions.vertical" light></v-checkbox>
            <template v-for="n in buttonsCount">
                <buttons-widget-options-segment
                        :connectionType="connectionType"
                        :fields="fields"
                        :id="id"
                        :params="params"
                        :options="dataOptions.buttons[n-1]"
                        ref="buttons"
                        :key="n"
                />
            </template>
            <v-btn
                    :disabled="buttonsCount > 10"
                    @click.stop="addButton"
            >{{gui.addButton}}
            </v-btn>
            <v-btn
                    :disabled="buttonsCount < 2"
                    @click.stop="removeButton"
            >{{gui.deleteButton}}
            </v-btn>
        </v-card-text>
        <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
    </v-card>

</template>

<script>
    import FilterQuery from '~/components/dialogs/FilterQuery';
    import ButtonsWidgetOptionsSegment from '~/components/widgets/ButtonsWidgetOptionsSegment';
    import _ from 'lodash';

    const defaultOptions = {
        query: {},
        orderBy: '',
        buttons: [{}],
        fields: [],
        vertical: false,
        acceptedModels: [],
        dataSource: {
            type: 'noConnection',
            itemId: '',
            masterWidget: ''
        }
    };

    export default {
        name: 'buttons-widget-options',
        components: {
            ButtonsWidgetOptionsSegment, FilterQuery
        },
        props: {
            options: {
                type: Object,
                required: true
            },
            params: {
                type: Object
            },
            id: {
                required: true,
                type: String
            },
            model: {
                required: true,
                type: Object
            },
            widgetName: {
                required: true,
                type: String
            },
            acceptedList: {
                type: Array,
                required: true
            }
        },
        data () {
           return {
               gui: (process.env.gui && process.env.gui.buttonsWidgetOptions) || {},
               buttonsCount: (this.options && this.options.buttons && this.options.buttons.length) || 1,
               loading: false,
               connectionType: (this.options.dataSource && this.options.dataSource.type) || 'noConnection',
               connectionOptions: [
                   {text: process.env.gui && process.env.gui.buttonsWidgetOptions.connectionList.noConnection, value: 'noConnection'},
                   {text: process.env.gui && process.env.gui.buttonsWidgetOptions.connectionList.firstElem, value: 'firstElem'},
                   {text: process.env.gui && process.env.gui.buttonsWidgetOptions.connectionList.lastElem, value: 'lastElem'},
                   {text: process.env.gui && process.env.gui.buttonsWidgetOptions.connectionList.listElem, value: 'listElem'},
                   {text: process.env.gui && process.env.gui.buttonsWidgetOptions.connectionList.widgetClassElem, value: 'widgetClassElem'}
               ],

               dataOptions: Object.assign({}, _.cloneDeep(defaultOptions), this.options)
           };
        },
        mounted () {
            if (this.dataOptions.fields && this.dataOptions.fields.length === 0) {
                this.getModel(this.model.name);
            }
            this.getList();
        },
        beforeDestroy () {
            this.$emit('optionsLoaded', true);
        },
        watch: {
            widgetName (val) {
                if (this.dataOptions.acceptedModels && this.dataOptions.acceptedModels.length > 0) {
                    this.dataOptions.acceptedModels.forEach(item => { item.widgetName = val; });
                }
            },
            connectionType (val) {
                if (val !== 'widgetClassElem') {
                    this.$emit('optionsLoaded', true);
                }
                this.dataOptions.dataSource = {
                    type: val,
                    itemId: '',
                    masterWidget: ''
                };
            },
            'dataOptions.dataSource.masterWidget' () {
                this.$emit('optionsLoaded', true);
            },
            options (val) {
                this.dataOptions = Object.assign({}, _.cloneDeep(defaultOptions), this.options);
                this.buttonsCount = (this.options && this.options.buttons && this.options.buttons.length) || 1;
            },
            stepId (value) {
                this.dataOptions.dataSource.itemId = value;
            },
            model (val) {
                val && this.getModel(val.name);
            },
            modelLoadStatus (val) {
                if (val === 'SUCCESS') {
                    this.dataOptions.acceptedModels = [{
                        widgetId: this.id,
                        modelName: this.model.name,
                        modelTitle: this.model.title,
                        widgetName: this.widgetName,
                        type: 'SINGLE_MODEL'
                    }];
                    this.dataOptions.acceptedModels.push({
                        widgetId: this.id,
                        modelName: this.model.name,
                        modelTitle: this.model.title,
                        widgetName: this.widgetName,
                        widgetFields: [{ name: '_id' }].concat(this.storeModel.fields),
                        type: 'MULTI_MODEL'
                    });
                    if (this.storeModel.fields && this.storeModel.fields.length > 0) {
                        this.dataOptions.fields = this.storeModel.fields
                            .sort((a, b) => ((a.tags && a.tags.order) && (b.tags && b.tags.order)) ? Number(a.tags.order) - Number(b.tags.order) : a.order - b.order)
                            .map((item) => {
                                if (item.type === 'DROPDOWN_LINK') {
                                    this.dataOptions.acceptedModels.push({
                                        widgetId: this.id,
                                        modelName: item.linkedEntityName,
                                        modelTitle: item.linkedEntityName,
                                        widgetName: this.widgetName,
                                        type: 'SINGLE_MODEL'
                                    });
                                }
                                return item;
                            });
                    } else {
                        this.dataOptions.fields = [];
                    }
                    this.loading = false;
                }
            }
        },
        computed: {
            modelLoadStatus () {
                return this.$store.getters[`${this.id}/model/modelLoadStatus`];
            },
            acceptedItems () {
                if (this.acceptedList && this.acceptedList.length > 0) {
                    return this.acceptedList.filter((item) => (item.modelName === this.model.name) && (item.type === 'SINGLE_MODEL') && (item.widgetId !== this.id)).map((item) => {
                        return {
                            text: `Widget "${item.widgetName}" model "${item.modelTitle}"`,
                            value: item.widgetId
                        };
                    });
                } else {
                    return [];
                }
            },
            storeModel () {
                return this.$store.getters[`${this.id}/model/model`];
            },
            fields () {
                return this.dataOptions && this.dataOptions.fields && this.dataOptions.fields.filter(item => item.type !== 'HIDDEN');
            },
            dataLoadStatus () {
                return this.$store.getters[`${this.id}/dataLoadStatus`];
            },
            list () {
                return this.$store.getters[`${this.id}/getList`];
            },
            items () {
                if (this.list && this.list.length > 0) {
                    return this.list.map((item) => {
                        return {
                            value: item.entityInstancePk.entityInstanceId,
                            text: `Model "${this.model.title}" with ID = ${item.entityInstancePk.entityInstanceId}`
                        };
                    });
                }
            }
        },
        methods: {
            getOptions () {
                this.dataOptions.query = this.$refs.filterQuery ? this.$refs.filterQuery.getQuery() : '';
                this.dataOptions.buttons = this.$refs.buttons && this.$refs.buttons.map(item => item.getData());
                return _.cloneDeep(this.dataOptions);
            },
            getModel (model) {
                this.loading = true;
                this.dataOptions.fields = [];
                this.dataOptions.acceptedModels = [];
                this.$store.dispatch(`${this.id}/model/getModel`, model);
            },
            addButton () {
                this.buttonsCount++;
                this.dataOptions.buttons.push({});
            },
            removeButton () {
                this.buttonsCount--;
                this.dataOptions.buttons.pop();
            },
            getList () {
                this.$store.dispatch(`${this.id}/loadList`, {
                    model: this.model.name,
                    pageNumber: 1,
                    pageSize: 99,
                    orderBy: this.dataOptions.orderBy,
                    query: this.dataOptions.query && this.dataOptions.query.queryStr
                });
            }
        }
    };
</script>

<style scoped>

</style>
