<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>Опции виджета списка новостей</div>
            <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>
            <v-select
                    v-bind:items="connectionOptions"
                    v-model="connectionType"
                    label="Select data source"
                    single-line
                    bottom
            ></v-select>
            <template v-if="connectionType === 'listElem'">
                <v-select
                        v-bind:items="items"
                        v-model="stepId"
                        label="Select Step"
                        single-line
                        bottom
                ></v-select>
                <v-text-field
                        label="Filter parameters"
                        placeholder="field_1 = '%item%' AND field_2 = 'Москва'"
                        v-model="dataOptions.query"
                        ref="filter"
                        @blur="getList"
                ></v-text-field>
                <v-text-field
                        label="Sort parameters"
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
                        label="Select master widget"
                        single-line
                        bottom
                ></v-select>
            </template>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'news-widget-options',
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
                dataOptions: Object.assign({
                    query: '',
                    orderBy: '',
                    dataSource: {
                        type: '',
                        itemId: '',
                        masterWidget: ''
                    },
                    acceptedModels: []
                }, this.options),
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
                    itemId: '',
                    masterWidget: ''
                };
            },
            options (val) {
                this.dataOptions = Object.assign({
                    query: '',
                    orderBy: '',
                    dataSource: {
                        type: '',
                        itemId: '',
                        masterWidget: ''
                    },
                    acceptedModels: [],
                    fields: []
                }, this.options);
            },
            stepId (value) {
                this.dataOptions.dataSource.itemId = value;
            }
        },
        computed: {
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
            }
        },
        methods: {
            getOptions () {
                return Object.assign({}, this.dataOptions);
            },
            getList () {
                this.stepId = null;
                this.$store.dispatch(`${this.id}/loadList`, {
                    model: this.model.name,
                    pageNumber: 1,
                    pageSize: 999,
                    orderBy: this.dataOptions.orderBy,
                    query: this.dataOptions.query
                });
            }
        }
    };
</script>

<style scoped>

</style>
