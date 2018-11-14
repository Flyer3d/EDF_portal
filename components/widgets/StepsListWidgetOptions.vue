<template>
        <v-card v-if="dataOptions">
            <v-card-title center class="headline" ref="title">
                <v-spacer></v-spacer>
                <div>{{gui.title}}</div>
                <v-spacer></v-spacer>

            </v-card-title>
            <v-card-text>
                <v-checkbox :label="gui.selectFirstLabel" v-model="dataOptions.autoSelect" light></v-checkbox>
                <v-text-field
                        :label="gui.sortLabel"
                        placeholder="field_1 DESC, field_2 ASC"
                        v-model="dataOptions.orderBy"
                        ref="sort"
                ></v-text-field>
                <v-btn block @click.native="getModel">{{gui.refreshModel}}</v-btn>
                <v-layout row wrap>
                    <v-flex xs3>
                        <v-subheader>{{gui.titleLabel}}</v-subheader>
                    </v-flex>
                    <v-flex xs3>
                        <v-select
                                v-bind:items="firstSelectItems"
                                v-model="dataOptions.title.fieldName"
                                :label="gui.titleLabel"
                                single-line
                                :disabled="true"
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
                                :label="gui.subtitleLabel"
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
                                :label="gui.labelLabel"
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
        </v-card>
    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>

</template>

<script>
    export default {
        name: 'step-list-widget-options',
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
        data () {
           return {
               gui: (process.env.gui && process.env.gui.stepListWidgetOptions) || {},
               dataOptions: Object.assign({
                   query: '',
                   orderBy: '',
                   autoSelect: false,
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
                   dataSource: {
                       type: '',
                       itemId: '',
                       masterWidget: ''
                   },
                   acceptedModels: [],
                   fields: []
               }, this.options)
           };
        },
        mounted () {
            if (!(this.options.fields && this.options.fields.length > 0)) {
                this.getModel(this.model && this.model.name);
            }
            if (!this.dataOptions.title.fieldName) {
                this.dataOptions.title.fieldName = 'name';
            }
        },
        computed: {
            modelLoadStatus () {
                return this.$store.getters[`${this.id}/model/stepListModelLoadStatus`];
            },
            storeModel () {
                return this.$store.getters[`${this.id}/model/stepListModel`];
            },
           firstSelectItems () {
               if (!this.dataOptions.fields) {
                   return [];
               }
                return (this.dataOptions.fields && this.dataOptions.fields.filter(function (item) {
                   return item.type !== 'HIDDEN' && item.type !== 'CHECKBOX';
                }).map(function (item) {
                    return item.name;
                })) || ['name'];
           },
           secondSelectItems () {
               if (!this.dataOptions.fields) {
                   return [];
               }
               const that = this;
                return [''].concat((this.dataOptions.fields && this.dataOptions.fields.filter(function (item) {
                    return item.type !== 'HIDDEN' && item.type !== 'CHECKBOX' && item.name !== that.dataOptions.title.fieldName && item.name !== that.dataOptions.label.fieldName;
                }).map(function (item) {
                    return item.name;
                })) || []);
           },
           thirdSelectItems () {
               if (!this.dataOptions.fields) {
                   return [];
               }
               const that = this;
                return [''].concat((this.dataOptions.fields && this.dataOptions.fields.filter(function (item) {
                    return item.type !== 'HIDDEN' && item.type !== 'CHECKBOX' && item.name !== that.dataOptions.title.fieldName && item.name !== that.dataOptions.subTitle.fieldName;
                }).map(function (item) {
                    return item.name;
                })) || []);
           }
        },
        watch: {
            widgetName (val) {
                if (this.dataOptions.acceptedModels && this.dataOptions.acceptedModels.length > 0) {
                    this.dataOptions.acceptedModels.forEach(item => { item.widgetName = val; });
                }
            },
            modelLoadStatus (val) {
                if (val === 'SUCCESS') {
                    if (this.storeModel.fields && this.storeModel.fields.length > 0) {
                        this.dataOptions.acceptedModels = [{
                            widgetId: this.id,
                            modelName: this.model && this.model.name,
                            modelTitle: this.model && this.model.title,
                            widgetName: this.widgetName,
                            type: 'STEP_MODEL'
                        }];
                        this.dataOptions.acceptedModels.push({
                            widgetId: this.id,
                            modelName: this.model && this.model.name,
                            modelTitle: this.model && this.model.title,
                            widgetName: this.widgetName,
                            type: 'SINGLE_MODEL'
                        });
                        this.dataOptions.fields = this.storeModel.fields
                            .sort((a, b) => ((a.tags && a.tags.order) && (b.tags && b.tags.order)) ? Number(a.tags.order) - Number(b.tags.order) : a.order - b.order).map((item) => {
                            const newItem = Object.assign({}, item);
                            newItem.checked = !(item.tags && item.tags.hide !== undefined);
                            if (item.type === 'DROPDOWN_LINK') {
                                this.dataOptions.acceptedModels.push({
                                    widgetId: this.id,
                                    modelName: item.linkedEntityName,
                                    modelTitle: item.linkedEntityName,
                                    widgetName: this.widgetName,
                                    type: (Number(item.maxInstances) === 1) ? 'SINGLE_MODEL' : 'LIST_MODEL'
                                });
                            }
                            return newItem;
                        });
                    }
                    this.$emit('optionsLoaded', true);
                }
            },
           options () {
               this.dataOptions = Object.assign({
                   query: '',
                   orderBy: '',
                   autoSelect: false,
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
                   fields: []
               }, this.options);
               if (!this.dataOptions.title.fieldName) {
                   this.dataOptions.title.fieldName = 'name';
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
                return Object.assign({}, this.dataOptions);
            },
            getModel () {
                this.dataOptions.acceptedModels = [];
                this.dataOptions.fields = [];
                this.$emit('optionsLoaded', false);
                this.$store.dispatch(`${this.id}/model/getStepListModel`);
            }
        }
    };
</script>

<style scoped>

</style>
