<template>
    <v-layout wrap class="widget-field" v-if="!editable || readonlyTag">
        <v-flex xs12 sm12 md12 class="widget-field__label">
            {{fieldName}}
        </v-flex>
        <div v-if="inDescription" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description">
                <span v-html="inDescription"></span>
            </v-flex>
        </div>
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-text-field
                    name="text-field"
                    v-model="fieldText"
                    :readonly="true"
            ></v-text-field>
        </v-flex>
    </v-layout>
    <v-layout wrap class="widget-field" v-else>
        <v-flex xs12 sm12 md12 class="widget-field__label">
            {{fieldName}}{{(requiredTag && !readonlyTag) ? '*' : ''}}
        </v-flex>
        <div v-if="outDescription" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description">
                <span v-html="outDescription"></span>
            </v-flex>
        </div>
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-autocomplete
                    v-if="!isCollection"
                    v-model="selectedItem"
                    :items="itemsList"
                    :loading="loading"
                    :search-input.sync="itemsSearch"

                    :attach="true"
                    :disabled="linkedFieldTag && !watchedField"
                    clearable
                    open-on-clear
                    :error="error"
                    :error-messages="errorMsg"

                    class="widget-field__select"
                    @input="validate"
                    @blur="validate"
            >
                <template
                        slot="selection"
                        slot-scope="{ item }"
                >
                    <span>{{(item.text.length > 40) ? `${item.text.substr(0, 40)}...` : item.text }}</span>
                </template>
            </v-autocomplete>
            <v-autocomplete
                    v-else
                    v-model="selectedItems"
                    :items="itemsList"
                    :loading="loading"
                    :search-input.sync="itemsSearch"
                    multiple
                    chips
                    deletable-chips

                    :attach="true"
                    :disabled="linkedFieldTag && !watchedField"
                    clearable
                    open-on-clear
                    :error="error"
                    :error-messages="errorMsg"

                    class="widget-field__select"
                    @input="validate"
                    @blur="validate"
            >
            </v-autocomplete>
        </v-flex>

        <v-dialog v-model="dialog" scrollable persistent lazy>
            <link-select-dlg
                    :modelName="field.linkedEntityName"
                    :multiply="isCollection"
                    @close="dialog=false"
                    @save="entitySelected"
                    lazy
                    :key="field.name"
            />
        </v-dialog>
    </v-layout>
</template>

<script>
    import axios from 'axios';
    import _ from 'lodash';
    import LinkSelectDlg from '~/components/dialogs/LinkSelectDlg';
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    const ddlToText = (ddl) => {
        if (typeof ddl === 'string') {
            const splitData = ddl && ddl.split('::');
            if (splitData) {
                return (splitData.length > 1) ? splitData[1] : splitData[0];
            }
        } else if (typeof ddl === 'object') {
            return _.get(ddl, 'entityDesc');
        }
        return 'Не задано';
    };

    const ddlToId = (ddl) => {
        if (typeof ddl === 'string') {
            const splitData = ddl.split('::');
            return splitData[0];
        } else if (typeof ddl === 'number') {
            return ddl;
        } else {
            const instanceId = _.get(ddl, 'entityInstancePk.entityInstanceId');
            return instanceId;
        }
    };

    export default {
        name: 'widget-dropdown-link-field',
        mixins: [WidgetFieldMixin],
        components: {
            LinkSelectDlg
        },
        data () {
            return {
                dialog: false,
                selectedItem: null,
                selectedItems: [],
                loading: false,
                items: [],
                itemsSearch: null,
                fieldText: 'Не задано'
            };
        },
        computed: {
            fieldName () {
                return this.field.name;
            },
            itemsList () {
                return this.items.sort((a, b) => a.text.localeCompare(b.text));
            },
            fieldToFilterTag () {
                return this.tags.fieldToFilter;
            },
            linkedFieldTag () {
                return this.tags.linkedField;
            },
            watchedField () {
                if (this.linkedFieldTag) {
                    return this.allData && this.allData[this.linkedFieldTag];
                }
                return '';
            }
        },
        created () {
            if (!this.isCollection) {
                if (this.fieldData) {
                    this.selectedItem = ddlToId(this.fieldData);
                    this.fieldText = ddlToText(this.fieldData);
                }
            } else {
                if (Array.isArray(this.fieldData) && !_.isEmpty(this.fieldData)) {
                    this.selectedItems = this.fieldData.map(item => ddlToId(item));
                    this.fieldText = this.fieldData.map(item => ddlToText(item)).join(', ');
                }
            }
        },
        mounted () {
            if (!this.linkedFieldTag) {
                this.suggest();
            }
        },
        watch: {
            fieldData (val) {
                if (!this.isCollection) {
                    if (this.fieldData) {
                        const newId = ddlToId(this.fieldData);
                        if (this.selectedItem !== newId) {
                            this.selectedItem = newId;
                            this.fieldText = ddlToText(this.fieldData);
                        }
                    } else {
                        if (!this.selectedItem) {
                            this.selectedItem = null;
                            this.fieldText = 'Не задано';
                        }
                    }
                } else {
                    if (Array.isArray(this.fieldData) && !_.isEmpty(this.fieldData)) {
                        const newArr = this.fieldData.map(item => ddlToId(item));
                        if (!_.isEmpty(_.difference(this.selectedItems, newArr))) {
                            this.selectedItems = newArr;
                            this.fieldText = this.fieldData.map(item => ddlToText(item)).join(', ');
                        }
                    } else {
                        if (!_.isEmpty(this.selectedItems)) {
                            this.selectedItems = [];
                            this.fieldText = 'Не задано';
                        }
                    }
                }
            },
            selectedItem (val) {
                this.fieldData = val;
            },
            selectedItems: {
                handler (val) {
                    this.fieldData = val;
                },
                deep: true
            },
            itemsSearch (val) {
                this.suggest(val);
            },
            watchedField (val, oldVal) {
                if (Array.isArray(val)) {
                    if (val.length > 0) {
                        this.suggest();
                    } else {
                        this.items = [];
                    }
                    if (val.length < oldVal.length) {
                        this.fieldData = null;
                    }
                } else {
                    if (val) {
                        this.suggest();
                    } else {
                        this.items = [];
                    }
                    this.fieldData = null;
                }
            }
        },
        methods: {
            getData () {
                if (!this.isCollection) {
                    console.log(`[DropdownLinkField] Saving Data!!! (type = ${typeof this.selectedItem})`);
                    console.dir(this.selectedItem);
                    console.dir({
                        name: this.field.name,
                        value: this.selectedItem,
                        type: this.field.type
                    });

                    return {
                        name: this.field.name,
                        value: this.selectedItem,
                        type: this.field.type
                    };
                } else {
                    console.log(`[DropdownLinkField] Saving Data!!! (type = ${typeof this.selectedItems})`);
                    console.dir(this.selectedItems);
                    console.dir({
                        name: this.field.name,
                        value: this.selectedItems,
                        type: this.field.type
                    });

                    return {
                        name: this.field.name,
                        value: this.selectedItems,
                        type: this.field.type
                    };
                }
            },
            entitySelected (item) {
                if (typeof item === 'string') {
                    this.fieldData = item;
                    this.dialog = false;
                } else {
                    this.fieldData = {
                        entityDesc: item.entityDesc,
                        entityInstancePk: item.entityInstancePk
                    };
                    this.dialog = false;
                }
            },
            async suggest (val) {
                console.log(`[DDL/suggest] Searching items for val = '${val}' (Editable = ${this.editable && !this.readonlyTag})`);
                console.dir(val);
                if (this.editable && !this.readonlyTag) {
                    const url = `${this.$store.getters['getApiBase']}/widget/suggest`;
                    let query = '';
                    if (this.linkedFieldTag && this.fieldToFilterTag) {
                        if (Array.isArray(this.watchedField)) {
                            if (this.watchedField.length > 0) {
                                query = this.watchedField.map(item => `[${this.fieldToFilterTag}] = '${item}'`).join(' OR ');
                            }
                        } else {
                            if (this.watchedField) {
                                query = `[${this.fieldToFilterTag}] = '${this.watchedField}'`;
                            }
                        }
                    }

                    this.loading = true;
                    console.dir({
                        params: {
                            q: val,
                            model: this.field.linkedEntityName,
                            query,
                            isDropdownLink: true
                        }
                    });
                    try {
                        console.log(`[DDL/suggest] Searching with q = "${val}"`);
                        const res = await axios.get(url, {
                            params: {
                                q: val,
                                model: this.field.linkedEntityName,
                                query,
                                isDropdownLink: true
                            }
                        });
                        console.log(`[DDL/suggest] List loaded for val = '${val}'!`);
                        console.dir(res.data);
                        this.loading = false;
                        this.items = res.data && res.data.map(item => {
                            if (typeof item === 'string') {
                                const splitItem = String(item).split('::');
                                console.log(`[DDL/suggest] Splitting item ${item} to ${splitItem[0]} and ${splitItem[1]}`);
                                return {
                                    text: splitItem[1] || splitItem[0] || '',
                                    value: splitItem[0]
                                };
                            } else if (typeof item === 'object') {
                                return {
                                    text: item.entityDesc || `${item.entityInstancePk.entityName}::${item.entityInstancePk.entityInstanceId}`,
                                    value: item.entityInstancePk.entityInstanceId
                                };
                            }
                        });
                        console.log(`[DDL/suggest] List loaded!!!`);
                        console.dir(res.data);
                    } catch (e) {
                        console.error('[DDL/suggest] Error getting field list!');
                        console.dir(e);
                        this.loading = false;
                    }
                }
            }
        }
    };
</script>

<style lang="stylus">


</style>

