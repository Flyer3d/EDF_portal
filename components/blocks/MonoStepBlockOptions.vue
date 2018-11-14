<template>
    <v-card>
        <v-card-title center class="headline" ref="title" v-if="!inline">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>

        </v-card-title>
        <v-card-text>
            <v-checkbox :label="gui.showModelNameLabel" v-model="dataOptions.showModelName" light></v-checkbox>
            <v-select
                    :label="gui.processLabel"
                    v-model="process"
                    v-bind:items="processList"
                    :loading="actionListStatus === 'IN_PROGRESS'"
                    single-line
                    return-object
                    required
                    bottom
            ></v-select>
            <template v-if="!inline">
                <v-text-field
                        :label="gui.urlLabel"
                        v-model="dataOptions.url"
                ></v-text-field>
                <v-checkbox :label="gui.externalLinkLabel" v-model="dataOptions.isExternalUrl" light></v-checkbox>
            </template>
            <label>{{label}}</label>
            <v-btn block @click.native="getProcessModel(process.value)">{{gui.refreshModel}}</v-btn>
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
                        <td style="min-width:160px">
                            <v-select
                                    v-model="props.item.valueFrom"
                                    v-bind:items="acceptedFields"
                                    clearable
                            ></v-select>
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
                    </tr>
                </template>
                <template slot="no-data">
                    <v-alert :value="true" color="error" icon="warning">
                        Нет данных!
                    </v-alert>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import axios from 'axios';
    import {mapGetters, mapActions} from 'vuex';

    let Sortable;
    if (process.browser) {
        Sortable = require('sortablejs');
    }

    const defaultOptions = {
        showModelName: true,
        processId: null,
        processName: '',
        processModelName: '',
        url: '',
        isExternalUrl: false,
        constraint: [],
        tags: [],
        fields: [],
        documentation: []
    };

    export default {
        name: 'auto-step-block-options',
        props: {
            options: {
                type: Object,
                required: true
            },
            params: {
                type: Object
            },
            masterFields: {
                type: Array
            },
            inline: {
                type: Boolean
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.monoStepBlockOptions) || {},
                dataOptions: Object.assign({}, defaultOptions, this.options),
                process: {
                    text: this.options.processName || '',
                    value: this.options.processId || null
                },
                processModel: {},
                itemKeys: new WeakMap(),
                currentItemKey: 0,
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
                        text: 'Value from:',
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
                    }
                ]
            };
        },
        created () {
            this.getProcessList();
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
        },
        watch: {
            process (val) {
                console.log('[process] Process changed!');
                console.dir(val);
                if (val && val.value !== this.dataOptions.processId) {
                    this.dataOptions.processId = val.value;
                    this.dataOptions.processName = val.text;
                    this.getProcessModel(val.value);
                }
            },
            options () {
                this.dataOptions = Object.assign({}, defaultOptions, this.options);
                this.process = {
                    text: this.options.processName || '',
                    value: this.options.processId || null
                };
            },
            processModel (val) {
                console.log('[processModel] Watching!');
                console.dir(val);
                if (!_.isEmpty(val)) {
                    this.dataOptions.processModelName = _.get(this.processModel, 'entityPk.name', '');

                    if (this.processModel.fields && this.processModel.fields.length > 0) {
                        this.dataOptions.fields = this.processModel.fields
                            .sort((a, b) => ((a.tags && a.tags.order) && (b.tags && b.tags.order)) ? Number(a.tags.order) - Number(b.tags.order) : a.order - b.order).map((item) => {
                                const newItem = Object.assign({}, item);
                                newItem.customName = item.name;
                                newItem.valueFrom = '';
                                newItem.checked = !(item.tags && item.tags.hide !== undefined);
                                return newItem;
                            });
                        this.dataOptions.constraint = [];
                        this.dataOptions.tags = this.processModel.tags || [];
                        this.dataOptions.tags.map(tag => {
                            if (tag.name.indexOf('constraint') !== -1) {
                                this.dataOptions.constraint.push(tag.value && tag.value.replace(/[«»]/g, '"'));
                            }
                        });
                        this.dataOptions.documentation = this.processModel.documentation;
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
            ...mapGetters({
                actionList: 'action/actionList',
                actionListStatus: 'action/actionListStatus'
            }),
            processList () {
                return this.actionList.map(item => {
                    return {text: _.get(item, 'object.name'), value: _.get(item, 'object.startEventPk')};
                });
            },
            acceptedFields () {
                if (this.masterFields) {
                    const fields = (this.masterFields.map((field) => {
                        return field.name;
                    })) || [];
                    return _.uniq([].concat(_.keys(this.params), ['__entityName', '__entityId', '__dateNow'], fields));
                } else {
                    return [].concat(_.keys(this.params), ['__dateNow']);
                }
            },
            fields () {
                return this.dataOptions && this.dataOptions.fields && this.dataOptions.fields.filter(item => item.type !== 'HIDDEN');
            },
            label () {
                return `Доступные поля: ${this.acceptedFields.join(' ')}`;
            }
        },
        methods: {
            ...mapActions({
                getProcessList: 'action/loadActionList'
            }),
            getOptions () {
                console.log('[MonoStepBlockOptions] getting options!');
                console.dir(this.dataOptions);
                return Object.assign({}, this.dataOptions);
            },
            async getProcessModel (startEventPk) {
                console.log(`[getProcessModel] Getting process model for process: ${startEventPk}!`);
                if (startEventPk) {
                    const url = `${process.env.apiBase}/model/stepModelByEventPk`;
                    try {
                        const response = await axios.post(url, { startEventPk });
                        console.log(`[getProcessModel] Model for process ${startEventPk} loaded!`);
                        this.processModel = response.data;
                    } catch (err) {
                        console.error(`[getProcessModel] Error getting model for process ${startEventPk}! `);
                        console.dir(err);
                    }
                }
            },
            dragReorder ({oldIndex, newIndex}) {
                const movedItem = this.dataOptions.fields.splice(oldIndex, 1)[0];
                this.dataOptions.fields.splice(newIndex, 0, movedItem);
            },
            itemKey (item) {
                if (!this.itemKeys.has(item)) this.itemKeys.set(item, ++this.currentItemKey);
                return this.itemKeys.get(item);
            }
        }

    };
</script>

