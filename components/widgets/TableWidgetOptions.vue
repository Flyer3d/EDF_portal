<template>
    <v-card v-if="dataOptions">
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>

        </v-card-title>
        <v-card-text>
            <v-checkbox :label="gui.selectFirstLabel" v-model="dataOptions.autoSelect" light></v-checkbox>
            <v-checkbox :label="gui.expandDocumentationLabel" v-model="dataOptions.expand" light></v-checkbox>
            <v-checkbox :label="gui.userOnlyLabel" v-model="dataOptions.userOnly" light></v-checkbox>
            <v-checkbox :label="gui.editLabel" v-model="dataOptions.editable" light></v-checkbox>
            <v-select
                    :label="gui.rowsPerPageLabel"
                    v-model="dataOptions.rowsPerPage"
                    v-bind:items="rowsPerPage"
            ></v-select>
            <v-checkbox :label="gui.linkLabel" v-model="dataOptions.widgetLink" light></v-checkbox>
            <v-layout v-if="dataOptions.widgetLink">
                <v-flex md3 sm3 xs3>
                    <v-select
                            :items="fields"
                            v-model="dataOptions.dataSource.field"
                            :label="gui.selectMasterWidget.fieldLabel"
                            single-line
                            bottom
                    ></v-select>
                </v-flex>
                <v-flex md3 sm3 xs3>
                    <v-select
                            :items="operators"
                            v-model="dataOptions.dataSource.operator"
                            :label="gui.selectMasterWidget.operatorLabel"
                            single-line
                            bottom
                    ></v-select>
                </v-flex>
                <v-flex md3 sm3 xs3>
                    <v-select
                            :items="acceptedWidgets"
                            v-model="dataOptions.dataSource.masterWidget"
                            :label="gui.selectMasterWidget.masterWidgetLabel"
                            single-line
                            bottom
                    ></v-select>
                </v-flex>
                <v-flex md3 sm3 xs3>
                    <v-select
                            :items="acceptedFields"
                            v-model="dataOptions.dataSource.masterField"
                            :label="gui.selectMasterWidget.masterFieldLabel"
                            single-line
                            bottom
                    ></v-select>
                </v-flex>
            </v-layout>
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
            <v-btn block @click.native="getModel(model.name)">{{gui.refreshModel}}</v-btn>
            <v-data-table
                    no-data-text="Данные не найдены"
                    v-bind:headers="headers"
                    :items="dataOptions.fields"
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

        <v-dialog v-model="dialog" scrollable persistent lazy max-width="800">
            <replace-field-dlg
                    :field="fieldToReplace"
                    :equal="equal"
                    @close="dialog=false"
                    @save="replaceItem"
            />
        </v-dialog>

    </v-card>
    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>

</template>

<script>
    import FilterQuery from '~/components/dialogs/FilterQuery';
    import ReplaceFieldDlg from '~/components/dialogs/ReplaceFieldDlg';
    import _ from 'lodash';

    let Sortable;
    if (process.browser) {
        Sortable = require('sortablejs');
    }

    export default {
        name: 'table-widget-options',
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
               gui: (process.env.gui && process.env.gui.tableWidgetOptions) || {},
               dialog: false,
               equal: false,
               fieldToReplace: {},
               selected: [],
               rowsPerPage: [5, 15, 25],
               itemKeys: new WeakMap(),
               operators: ['=', '<>', '!=', '>', '>=', '!>', '<', '<=', '!<'],
               currentItemKey: 0,
               dataOptions: Object.assign({
                   rowsPerPage: 5,
                   query: {},
                   orderBy: '',
                   autoSelect: false,
                   userOnly: false,
                   editable: false,
                   expand: false,
                   widgetLink: false,
                   dataSource: {
                       type: '',
                       itemId: '',
                       masterWidget: '',
                       masterField: '',
                       modelName: '',
                       field: '',
                       operator: ''

                   },
                   acceptedModels: [],
                   documentation: [],
                   fields: []
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
                       value: 'customName'
                   },
                   {
                       text: 'Field type',
                       align: 'right',
                       sortable: false,
                       value: 'type'
                   },
                   {
                       text: 'Checked',
                       align: 'center',
                       sortable: false,
                       value: 'checked'
                   },
                   {
                       text: 'Replace',
                       align: 'center',
                       sortable: false,
                       value: 'replace'
                   }
               ]
           };
        },
        computed: {
            modelLoadStatus () {
                return this.$store.getters[`${this.id}/model/modelLoadStatus`];
            },
            storeModel () {
                return this.$store.getters[`${this.id}/model/model`];
            },
            fields () {
                if (this.dataOptions.fields && this.dataOptions.fields.length > 0) {
                    return this.dataOptions.fields.map(item => item.name);
                }
                return [];
            },
            acceptedWidgets () {
                if (this.acceptedList && this.acceptedList.length > 0) {
                    return this.acceptedList.filter((item) => (item.type === 'MULTI_MODEL') && (item.widgetId !== this.id)).map((item) => {
                        return {
                            text: `Виджет "${item.widgetName}"`,
                            value: item.widgetId
                        };
                    });
                } else {
                    return [];
                }
            },
            acceptedFields () {
                if (this.dataOptions.dataSource && this.dataOptions.dataSource.masterWidget) {
                    const item = this.acceptedList.find(item => (item.type === 'MULTI_MODEL') && (item.widgetId === this.dataOptions.dataSource.masterWidget));
                    this.dataOptions.dataSource.modelName = item.modelName;
                    return item && item.widgetFields && item.widgetFields.map((field) => {
                        return {
                            text: field.name,
                            value: field.name
                        };
                    });
                } else {
                    return [];
                }
            }
        },
        mounted () {
            /* eslint-disable no-new */
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
        },
        watch: {
            widgetName (val) {
                if (this.dataOptions.acceptedModels && this.dataOptions.acceptedModels.length > 0) {
                    this.dataOptions.acceptedModels.forEach(item => { item.widgetName = val; });
                }
            },
            options () {
               this.dataOptions = Object.assign({
                   query: {},
                   orderBy: '',
                   autoSelect: false,
                   userOnly: false,
                   editable: false,
                   rowsPerPage: 5,
                   expand: false,
                   widgetLink: false,
                   dataSource: {
                       type: '',
                       itemId: '',
                       masterWidget: '',
                       masterField: '',
                       modelName: '',
                       field: '',
                       operator: ''
                   },
                   acceptedModels: [],
                   documentation: [],
                   fields: []
               }, this.options);
           },
            model (val) {
               val && this.getModel(val.name);
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
                        // ToDo: Удалить это немедленно!!!
                        console.log('[TableOptions] documentation is');
                        console.dir(this.storeModel.documentation);
                        this.dataOptions.documentation = this.storeModel.documentation;
                    } else {
                        this.dataOptions.fields = [];
                        this.dataOptions.documentation = [];
                    }
                    this.$emit('optionsLoaded', true);
                }
            }
        },
        methods: {
            getModel (model) {
                this.dataOptions.acceptedModels = [];
                this.dataOptions.fields = [];
                this.$emit('optionsLoaded', false);
                this.$store.dispatch(`${this.id}/model/getModel`, model);
            },
            getOptions () {
                this.dataOptions.query = this.$refs.filterQuery.getQuery();
                return _.cloneDeep(this.dataOptions);
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
                console.log('[TableWidgetOptions] replace ITEM!');
                console.dir(item);
                this.fieldToReplace = item;
                this.equal = false;
                this.$nextTick(() => {
                    this.dialog = true;
                });
            },
            replaceEqualField (item) {
                console.log('[TableWidgetOptions] replace EQUAL ITEM!');
                console.dir(item);

                this.fieldToReplace = item;
                this.equal = true;
                this.$nextTick(() => {
                    this.dialog = true;
                });
            },
            replaceItem (val) {
                console.log('[TableWidgetOptions] REPLACE ITEM!!!');
                console.dir(val);
                this.dialog = false;
            }
        }
    };
</script>

<style scoped>

</style>
