<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>

        </v-card-title>
        <v-card-text v-show="!loading">
            <v-checkbox :label="gui.showModelNameLabel" v-model="dataOptions.showModelName" light></v-checkbox>
            <v-checkbox :label="gui.editLabel" v-model="dataOptions.editable" light></v-checkbox>
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
            <v-data-table
                    no-data-text="Данные не найдены"
                    v-bind:headers="headers"
                    :items="fields"
                    hide-actions
                    class="elevation-0"
                    ref="sortableTable"
            >
                <template slot="items" slot-scope="props">
                    <tr
                            class="sortableRow"
                            :key="itemKey(props.item)"
                            :active="props.item.checked"
                    >
                        <!-- NOTE:  You'll need a unique ID, that is specific to the given item, for the key.   Not providing a unique key that's bound to the item object will break drag and drop sorting.  The itemKey method will return a uid for a given object using WeakMap.  You could just use a property in the object with a unique value, like "props.item.name" in this case, but often getting a unique value from the object's properties can be difficult, like when adding new rows, or when the unique field is open to editing, etc. -->

                        <td class="px-1" style="width: 0.1%">
                            <v-btn style="cursor: move" icon class="sortHandle">
                                <v-icon>drag_handle</v-icon>
                            </v-btn>
                        </td>
                        <td>{{ props.item.name }}</td>
                        <td>
                            <v-text-field
                                    v-model="props.item.customName"
                            ></v-text-field>
                        </td>
                        <td class="text-xs-right">{{ props.item.type }}</td>
                        <td class="text-xs-right">
                            <v-checkbox
                                    primary
                                    hide-details
                                    :input-value="props.item.checked"
                                    @click.native="props.item.checked = !props.item.checked"
                            ></v-checkbox>
                        </td>
                        <td class="justify-center layout px-0">
                            <v-btn
                                    v-if="props.item.type === 'TEXT_FIELD' || props.item.type === 'DROPDOWN_LINK'"
                                    icon
                                    class="mx-0"
                                    @click.stop="replaceField(props.item)">
                                <v-icon color="teal">cached</v-icon>
                            </v-btn>
                            <v-btn
                                    v-if="props.item.type === 'TEXT_FIELD'"
                                    icon
                                    class="mx-0"
                                    @click.stop="replaceEqualField(props.item)">
                                <v-icon color="teal">compare_arrows</v-icon>
                            </v-btn>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-card-text>
        <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>

        <v-dialog v-model="dialog" scrollable persistent lazy max-width="800">
            <replace-field-dlg
                    :field="fieldToReplace"
                    :equal="equal"
                    @close="dialog=false"
                    @save="replaceItem"
            />
        </v-dialog>

    </v-card>

</template>

<script>
    import _ from 'lodash';
    import FilterQuery from '~/components/dialogs/FilterQuery';
    import ReplaceFieldDlg from '~/components/dialogs/ReplaceFieldDlg';

    let Sortable;
    if (process.browser) {
        Sortable = require('sortablejs');
    }

    export default {
        name: 'card-widget-options',
        components: {
           ReplaceFieldDlg, FilterQuery
        },
        props: {
            options: {
                type: Object,
                required: true
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
               gui: (process.env.gui && process.env.gui.cardWidgetOptions) || {},
               dialog: false,
               equal: false,
               fieldToReplace: {},
               loading: false,
               connectionType: this.options.dataSource && this.options.dataSource.type,
               connectionOptions: [
                   {text: process.env.gui && process.env.gui.cardWidgetOptions.connectionList.pageId, value: 'pageId'},
                   {text: process.env.gui && process.env.gui.cardWidgetOptions.connectionList.firstElem, value: 'firstElem'},
                   {text: process.env.gui && process.env.gui.cardWidgetOptions.connectionList.lastElem, value: 'lastElem'},
                   {text: process.env.gui && process.env.gui.cardWidgetOptions.connectionList.listElem, value: 'listElem'},
                   {text: process.env.gui && process.env.gui.cardWidgetOptions.connectionList.widgetClassElem, value: 'widgetClassElem'}
               ],
               //
               stepId: this.options.dataSource && this.options.dataSource.itemId,
               itemKeys: new WeakMap(),
               currentItemKey: 0,
               dataOptions: Object.assign({
                   query: {},
                   orderBy: '',
                   showModelName: true,
                   editable: false,
                   dataSource: {
                       type: '',
                       itemId: '',
                       masterWidget: ''
                   },
                   acceptedModels: [],
                   constraint: [],
                   tags: [],
                   fields: [],
                   documentation: []
               }, this.options),
               headers: [
                   {
                       sortable: false
                   },
                   {
                       text: 'Field name',
                       align: 'left',
                       sortable: false,
                       value: 'name'
                   },
                   {
                       text: 'Custom name',
                       align: 'left',
                       sortable: false,
                       value: 'name'
                   },
                   {
                       text: 'Field type',
                       align: 'right',
                       sortable: false,
                       value: 'type',
                       width: '64px'
                   },
                   {
                       text: 'Checked',
                       align: 'center',
                       sortable: false,
                       value: 'checked',
                       width: '48px'
                   },
                   {
                       text: 'Replace',
                       align: 'center',
                       sortable: false,
                       value: 'checked',
                       width: '96px'
                   }
               ]
           };
        },
        mounted () {
            /* eslint-disable no-new */
            if (!this.connectionType) {
                this.$emit('optionsLoaded', false);
            }
            new Sortable(
                this.$refs.sortableTable.$el.getElementsByTagName('tbody')[0],
                {
                    draggable: '.sortableRow',
                    handle: '.sortHandle',
                    onEnd: this.dragReorder
                }
            );
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
                this.dataOptions = Object.assign({
                    query: {},
                    orderBy: '',
                    showModelName: true,
                    editable: false,
                    dataSource: {
                        type: '',
                        itemId: '',
                        masterWidget: ''
                    },
                    acceptedModels: [],
                    constraint: [],
                    tags: [],
                    fields: [],
                    documentation: []
                }, this.options);
            },
            stepId (value) {
                this.dataOptions.dataSource.itemId = value;
            },
            model (val) {
                val && this.getModel(val.name);
                this.getList();
            },
            modelLoadStatus (val) {
                if (val === 'SUCCESS') {
                    if (this.storeModel.fields && this.storeModel.fields.length > 0) {
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
                        this.dataOptions.fields = this.storeModel.fields
                            .sort((a, b) => ((a.tags && a.tags.order) && (b.tags && b.tags.order)) ? Number(a.tags.order) - Number(b.tags.order) : a.order - b.order).map((item) => {
                            const newItem = Object.assign({}, item);
                            newItem.checked = !(item.tags && item.tags.hide !== undefined);
                            newItem.customName = item.name;
                            if (item.type === 'DROPDOWN_LINK') {
                                this.dataOptions.acceptedModels.push({
                                    widgetId: this.id,
                                    modelName: item.linkedEntityName,
                                    modelTitle: item.linkedEntityName,
                                    widgetName: this.widgetName,
                                    type: 'SINGLE_MODEL'
                                });
                            }
                            return newItem;
                        });
                        this.dataOptions.constraint = [];
                        this.dataOptions.tags = this.storeModel.tags || [];
                        this.dataOptions.tags.map(tag => {
                            if (tag.name.indexOf('constraint') !== -1) {
                                this.dataOptions.constraint.push(tag.value && tag.value.replace(/[«»]/g, '"'));
                            }
                        });

                        this.dataOptions.documentation = this.storeModel.documentation;
                    } else {
                        this.dataOptions.fields = [];
                        this.dataOptions.tags = [];
                        this.dataOptions.constraint = [];
                        this.dataOptions.documentation = [];
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
                return _.cloneDeep(this.dataOptions);
            },
            getModel (model) {
                this.loading = true;
                this.dataOptions.acceptedModels = [];
                this.dataOptions.fields = [];
                this.$store.dispatch(`${this.id}/model/getModel`, model);
            },
            getList () {
                this.$store.dispatch(`${this.id}/loadList`, {
                    model: this.model.name,
                    pageNumber: 1,
                    pageSize: 99,
                    orderBy: this.dataOptions.orderBy,
                    query: this.dataOptions.query && this.dataOptions.query.queryStr
                });
            },
            dragReorder ({oldIndex, newIndex}) {
                const movedItem = this.dataOptions.fields.splice(oldIndex, 1)[0];
                this.dataOptions.fields.splice(newIndex, 0, movedItem);
            },
            itemKey (item) {
                if (!this.itemKeys.has(item)) this.itemKeys.set(item, ++this.currentItemKey);
                return this.itemKeys.get(item);
            },
            replaceField (item) {
                console.log('[CardWidgetOptions] replace ITEM!');
                console.dir(item);
                this.equal = false;
                this.fieldToReplace = item;
                this.$nextTick(() => {
                    this.dialog = true;
                });
            },
            replaceEqualField (item) {
                console.log('[CardWidgetOptions] replace EQUAL ITEM!');
                console.dir(item);

                this.fieldToReplace = item;
                this.equal = true;
                this.$nextTick(() => {
                    this.dialog = true;
                });
            },
            replaceItem (val) {
                console.log('[CardWidgetOptions] REPLACE ITEM!!!');
                console.dir(val);
                this.dialog = false;
            }
        }
    };
</script>

<style scoped>

</style>
