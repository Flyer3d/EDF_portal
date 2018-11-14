<template>
    <v-card>
        <v-card-text>
            <v-container grid-list-md>
                <v-layout row>
                    <v-flex xs12 sm6 md6>
                        <v-autocomplete
                                :label="gui.classLabel"
                                :disabled="field.type === 'DROPDOWN_LINK'"
                                :loading="loading"
                                item-text="title"
                                item-value="name"
                                required
                                clearable
                                :items="models"
                                :rules="[() => Boolean(selectedModel) || 'You must choose one item']"
                                :search-input.sync="modelsSearch"
                                v-model="selectedModel"
                        ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 sm6 md6 v-if="equal">
                        <v-select
                                :disabled="!selectedModel"
                                :label="gui.equalLabel"
                                clearable
                                v-model="equalFieldName"
                                v-bind:items="modelFields"
                        ></v-select>
                    </v-flex>
                    <v-flex xs12 sm6 md6>
                        <v-select
                                :disabled="!selectedModel"
                                :label="gui.replaceLabel"
                                clearable
                                v-model="selectedFieldName"
                                v-bind:items="modelFields"
                        ></v-select>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="blue darken-1" flat @click.stop="saveSelection">{{button.save}}</v-btn>
            <v-btn flat @click.native="closeDialog">{{button.close}}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';

    export default {
        name: 'replace-field-dlg',
        props: {
            field: {
                required: true,
                type: Object
            },
            equal: {
                required: false,
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.replaceFieldDlg) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                selectedModel: '',
                modelsList: [],
                selectedFieldName: '',
                equalFieldName: '',
                modelFields: [],
                modelsSearch: null
            };
        },
        mounted () {
            const field = this.field;
            if (field.replaceModeName) {
                this.selectedModel = this.field.replaceModelName;
            } else {
                if (field.type === 'DROPDOWN_LINK') {
                    this.selectedModel = field.linkedEntityName;
                } else {
                    this.selectedModel = '';
                }
            }
            this.modelsSuggest(this.selectedModel);
            this.selectedFieldName = field.replaceFieldName || '';
        },
        watch: {
            'field.name' () {
                console.log(`\n\nField name CHANGED to ${this.field.name}!!! repFN = ${this.field['replaceModelName']}`);
                console.dir(this.field);
                const field = this.field;
                if (field.replaceModelName) {
                    console.log('field.replaceModeName OK!');
                    this.selectedModel = field.replaceModelName;
                } else {
                    if (field.type === 'DROPDOWN_LINK') {
                        this.selectedModel = field.linkedEntityName;
                    } else {
                        this.selectedModel = '';
                    }
                }
                this.modelsSuggest(this.selectedModel);
            },
            modelsSearch (val) {
                this.modelsSuggest(val);
            },
            selectedModel (val) {
                if (val) {
                    this.getModel(val);
                }
                this.selectedFieldName = this.field.replaceFieldName || '';
            },
            modelLoadStatus (val) {
                if (val === 'SUCCESS') {
                    if (this.storeModel.fields && this.storeModel.fields.length > 0) {
                        this.modelFields = this.storeModel.fields.filter(item => item.type !== 'CHECKBOX').map(item => item.name);
                    }
                }
            }
        },
        computed: {
            ...mapGetters({
                loading: 'model/loading',
                models: 'model/models',
                modelLoadStatus: 'model/modelLoadStatus',
                storeModel: 'model/model'
            })
        },
        methods: {
            ...mapActions({
                modelsSuggest: 'model/suggest',
                getModel: 'model/getModel'
            }),
            saveSelection () {
                this.field.replaceModelName = this.selectedModel;
                this.field.replaceFieldName = this.selectedFieldName;
                if (this.equal) {
                    this.field.replaceEqualFieldName = this.equalFieldName;
                }
                this.$emit('save', {
                    fieldToReplaceName: this.field.name,
                    modelName: this.selectedModel,
                    filedName: this.selectedFieldName,
                    equalFieldName: (this.equal) ? this.equalFieldName : undefined
                });
            },
            closeDialog () {
                this.$emit('close');
            }
        }
    };
</script>

<style scoped>

</style>
