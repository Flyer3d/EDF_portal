<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>

        </v-card-title>
        <v-card-text>
            <v-checkbox :label="gui.showModelNameLabel" v-model="dataOptions.showModelName" light></v-checkbox>
            <v-select
                    v-bind:items="connectionOptions"
                    v-model="connectionType"
                    :label="gui.dataSourceLabel"
                    single-line
            ></v-select>
            <template v-if="connectionType === 'listElem'">
                <v-select
                        v-bind:items="items"
                        v-model="stepId"
                        :label="gui.selectStepLabel"
                        single-line
                ></v-select>
                <v-text-field
                        :label="gui.filterLabel"
                        placeholder="field_1 = '%item%' AND field_2 = 'Москва'"
                        v-model="dataOptions.query"
                        ref="filter"
                        @blur="getList"
                ></v-text-field>
                <v-text-field
                        :label="gui.sortLabel"
                        placeholder="field_1 DESC, field_2 ASC"
                        v-model="dataOptions.orderBy"
                        ref="sort"
                        @blur="getList"
                ></v-text-field>
            </template>
            <template v-else-if="connectionType === 'widgetClassElem'">
                <v-select
                        v-bind:items="acceptedItems"
                        v-model="dataOptions.dataSource.masterWidget"
                        :label="gui.masterWidgetLabel"
                        single-line
                ></v-select>
            </template>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'step-widget-options',
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
                gui: (process.env.gui && process.env.gui.stepWidgetOptions) || {},
                dataOptions: {
                    query: '',
                    orderBy: '',
                    showModelName: true,
                    dataSource: {
                        type: '',
                        item: {},
                        masterWidget: ''
                    },
                    acceptedModels: []
                },
                stepId: this.options.dataSource && this.options.dataSource.itemId,
                connectionType: this.options.dataSource && this.options.dataSource.type,
                connectionOptions: [
                    {text: 'Первый элемент', value: 'firstElem'},
                    {text: 'Последний элемент', value: 'lastElem'},
                    {text: 'Элемент из списка', value: 'listElem'},
                    {text: 'Привязать к виджету', value: 'widgetClassElem'}
                ]
            };
        },
        mounted () {
            if (!this.connectionType) {
                this.$emit('optionsLoaded', false);
            }
            this.dataOptions = Object.assign(this.dataOptions, this.options);
            this.getList();
        },
        watch: {
            widgetName (val) {
                if (this.dataOptions.acceptedModels && this.dataOptions.acceptedModels.length > 0) {
                    this.dataOptions.acceptedModels.forEach(item => { item.widgetName = val; });
                }
            },
            connectionType (val) {
                this.$emit('optionsLoaded', true);
                this.dataOptions.dataSource = {
                    type: val,
                    item: {},
                    masterWidget: ''
                };
            },
            options () {
                this.dataOptions = Object.assign({
                    query: '',
                    orderBy: '',
                    showModelName: true,
                    dataSource: {
                        type: '',
                        item: {},
                        masterWidget: ''
                    },
                    acceptedModels: []
                }, this.options);
            },
            stepId (value) {
                if (value) {
                    const entity = this.data && this.data.find(item => item.object.pk === value);
                    this.dataOptions.dataSource.item = entity.object;
                }
            }
        },
        computed: {
            loaded () {
                return this.$store.getters[`${this.id}/listLoadStatus`];
            },
            acceptedItems () {
                if (this.acceptedList && this.acceptedList.length > 0) {
                    return this.acceptedList.filter((item) => ((item.type === 'STEP_MODEL') && (item.widgetId !== this.id)) || ((item.type === 'MULTI_MODEL') && (item.modelName === this.model && this.model.name))).map((item) => {
                        return {
                            text: `Widget "${item.widgetName}" model "${item.modelTitle}"`,
                            value: item.widgetId
                        };
                    });
                } else {
                    return [];
                }
            },
            data () {
                return this.$store.getters[`${this.id}/getList`];
            },
            items () {
                if (this.data && this.data.length > 0) {
                    return this.data.map((item) => {
                        return {
                            value: item.object.pk,
                            text: `Process ${item.object.name} with ID = ${item.object.pk}`
                        };
                    });
                }
            }
        },
        methods: {
            getOptions () {
                return Object.assign({}, this.dataOptions);
            },
            getList () {
                this.stepId = null;
                this.$store.dispatch(`${this.id}/loadStepList`, {
                    model: this.model,
                    pageNumber: this.page,
                    pageSize: this.rowsPerPage,
                    orderBy: this.options.orderBy,
                    query: this.options.query
                });
            }
        }
    };
</script>

<style scoped>

</style>
