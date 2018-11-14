<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>

        </v-card-title>
        <v-card-text v-show="!loading">
            <v-checkbox :label="gui.selectFirstLabel" v-model="dataOptions.autoSelect" light></v-checkbox>
            <v-checkbox :label="gui.userOnlyLabel" v-model="dataOptions.userOnly" light></v-checkbox>
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
                    ref="filterQuuery"
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
            <v-layout row wrap>
                <v-flex xs3>
                    <v-subheader>{{gui.titleLabel}}</v-subheader>
                </v-flex>
                <v-flex xs3>
                    <v-select
                            v-bind:items="firstSelectItems"
                            v-model="dataOptions.title.fieldName"
                            label="TitleField"
                            single-line
                            bottom
                    ></v-select>
                </v-flex>
                <v-flex xs6>
                    <v-text-field
                            name="TitlePrefix"
                            :label="gui.prefixLabel"
                            v-model="dataOptions.title.prefix"
                    ></v-text-field>
                </v-flex>
                <v-flex xs3>
                    <v-subheader>{{gui.subtitleLabel}}</v-subheader>
                </v-flex>
                <v-flex xs3>
                    <v-select
                            v-bind:items="secondSelectItems"
                            v-model="dataOptions.subTitle.fieldName"
                            label="TitleField"
                            single-line
                            bottom
                    ></v-select>
                </v-flex>
                <v-flex xs6>
                    <v-text-field
                            :disabled="!dataOptions.subTitle.fieldName"
                            name="TitlePrefix"
                            :label="gui.prefixLabel"
                            v-model="dataOptions.subTitle.prefix"
                    ></v-text-field>
                </v-flex>
                <v-flex xs3>
                    <v-subheader>{{gui.labelLabel}}</v-subheader>
                </v-flex>
                <v-flex xs3>
                    <v-select
                            :disabled="!dataOptions.subTitle.fieldName"
                            v-bind:items="thirdSelectItems"
                            v-model="dataOptions.label.fieldName"
                            label="TitleField"
                            single-line
                            bottom
                    ></v-select>
                </v-flex>
                <v-flex xs6>
                    <v-text-field
                            :disabled="!dataOptions.label.fieldName"
                            name="TitlePrefix"
                            :label="gui.prefixLabel"
                            v-model="dataOptions.label.prefix"
                    ></v-text-field>
                </v-flex>

            </v-layout>

        </v-card-text>
        <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
    </v-card>
</template>

<script>
    import FilterQuery from '~/components/dialogs/FilterQuery';
    import _ from 'lodash';

    const defaultOptions = {
        rowsPerPage: 10,
        query: {},
        orderBy: '',
        autoSelect: false,
        userOnly: false,
        listRows: 1,
        title: {
            fieldName: '',
            prefix: ''
        },
        subTitle: {
            fieldName: '',
            prefix: ''
        },
        label: {
            fieldName: '',
            prefix: ''
        },
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
        fields: []
    };

    export default {
        name: 'list-widget-options',
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
            acceptedList: {
                type: Array,
                required: true
            },
            widgetName: {
                required: true,
                type: String
            }
        },
        components: {
            FilterQuery
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.listWidgetOptions) || {},
                loading: false,
                rowsPerPage: [10, 25, 50],
                operators: ['=', '<>', '!=', '>', '>=', '!>', '<', '<=', '!<'],
                dataOptions: Object.assign({}, _.cloneDeep(defaultOptions), this.options)
            };
        },
        mounted () {
            if (!(this.options.fields && this.options.fields.length > 0)) {
                this.getModel(this.model.name);
            }
            if (!this.dataOptions.title.fieldName) {
                const firstTextField = this.options.fields && this.options.fields.find(function (item) {
                    return item.type !== 'HIDDEN' && item.type !== 'CHECKBOX';
                });
                if (firstTextField && firstTextField.name) {
                    this.dataOptions.title.fieldName = firstTextField.name;
                }
            }
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
            firstSelectItems () {
                if (!this.dataOptions.fields) {
                    return [];
                }
                return this.dataOptions.fields && this.dataOptions.fields.filter(function (item) {
                    return item.type !== 'HIDDEN' && item.type !== 'CHECKBOX';
                }).map(function (item) {
                    return item.name;
                });
            },
            secondSelectItems () {
                const that = this;
                if (!this.dataOptions.fields) {
                    return [];
                }
                return [''].concat(this.dataOptions.fields && this.dataOptions.fields.filter(function (item) {
                    return item.type !== 'HIDDEN' && item.type !== 'CHECKBOX' && item.name !== that.dataOptions.title.fieldName && item.name !== that.dataOptions.label.fieldName;
                }).map(function (item) {
                    return item.name;
                }));
            },
            thirdSelectItems () {
                const that = this;
                if (!this.dataOptions.fields) {
                    return [];
                }
                return [''].concat(this.dataOptions.fields && this.dataOptions.fields.filter(function (item) {
                    return item.type !== 'HIDDEN' && item.type !== 'CHECKBOX' && item.name !== that.dataOptions.title.fieldName && item.name !== that.dataOptions.subTitle.fieldName;
                }).map(function (item) {
                    return item.name;
                }));
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
        watch: {
            widgetName (val) {
                if (this.dataOptions.acceptedModels && this.dataOptions.acceptedModels.length > 0) {
                    this.dataOptions.acceptedModels.forEach(item => { item.widgetName = val; });
                }
            },
            model (val) {
                this.dataOptions.title = {
                    fieldName: '',
                    prefix: ''
                };
                this.dataOptions.subTitle = {
                    fieldName: '',
                    prefix: ''
                };
                this.dataOptions.label = {
                    fieldName: '',
                    prefix: ''
                };
                val && this.getModel(val.name);
                this.dataOptions.acceptedModels = [];
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
                            // .sort((a, b) => a.order - b.order).map((item) => {
                            .sort((a, b) => ((a.tags && a.tags.order) && (b.tags && b.tags.order)) ? Number(a.tags.order) - Number(b.tags.order) : a.order - b.order).map((item) => {
                            const newItem = Object.assign({}, item);
                            newItem.checked = !(item.tags && item.tags.hide !== undefined);
                            if (item.type === 'DROPDOWN_LINK') {
                                this.dataOptions.acceptedModels.push({
                                    widgetId: this.id,
                                    modelName: item.linkedEntityName,
                                    modelTitle: item.linkedEntityName,
                                    widgetName: this.widgetName,
                                    type: (Number(item.maxInstances) === 1) ? 'SINGLE_MODEL' : 'MULTI_MODEL'
                                });
                            }
                            return newItem;
                        });
                        if (!this.dataOptions.title.fieldName) {
                            const firstTextField = this.dataOptions.fields && this.dataOptions.fields.find(function (item) {
                                return item.type !== 'HIDDEN' && item.type !== 'CHECKBOX';
                            });
                            if (firstTextField && firstTextField.name) {
                                this.dataOptions.title.fieldName = firstTextField.name;
                            }
                        }
                    }
                    this.$emit('optionsLoaded', true);
                    this.loading = false;
                }
            },
            options () {
                this.dataOptions = Object.assign({}, _.cloneDeep(defaultOptions), this.options);
                if (!this.dataOptions.title.fieldName) {
                    const firstTextField = this.options.fields && this.options.fields.find(function (item) {
                        return item.type !== 'HIDDEN' && item.type !== 'CHECKBOX';
                    });
                    if (firstTextField && firstTextField.name) {
                        this.dataOptions.title.fieldName = firstTextField.name;
                    }
                }
            },
            'dataOptions.title.fieldName' (val) {
                if (this.dataOptions.subTitle.fieldName === val) {
                    this.dataOptions.subTitle.fieldName = '';
                } else if (this.dataOptions.label.fieldName === val) {
                    this.dataOptions.label.fieldName = '';
                }
            },
            'dataOptions.subTitle.fieldName' (val) {
                if (!val) {
                    this.dataOptions.label.fieldName = '';
                }
            }
        },
        methods: {
            getOptions () {
                this.dataOptions.query = this.$refs.filterQuuery.getQuery();
                return Object.assign({}, this.dataOptions);
            },
            getModel (model) {
                this.dataOptions.acceptedModels = [];
                this.dataOptions.fields = [];
                this.loading = true;
                this.$emit('optionsLoaded', false);
                this.$store.dispatch(`${this.id}/model/getModel`, model);
            }
        }
    };
</script>

