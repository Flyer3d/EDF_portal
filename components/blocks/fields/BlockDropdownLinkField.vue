<template>
    <v-layout class="form__field-wrapper" v-if="!isEditable">
        <v-flex>
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>
            <v-text-field
                    name="text-field"
                    v-model="fieldText"
                    :readonly="true"
            ></v-text-field>
        </v-flex>
    </v-layout>
    <v-layout class="form__field-wrapper" v-else>
        <v-flex>
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>
            <v-autocomplete
                    v-if="!isCollection"
                    v-model="selectedItem"
                    :items="itemsList"
                    :loading="loading"
                    :search-input.sync="itemsSearch"
                    :attach="true"
                    clearable
                    :disabled="!isEditable || !(Boolean(watchedField) || !linkedFieldTag)"
                    :error="error"
                    :error-messages="errorMsg"
                    :placeholder="placeholder"
                    single-line
                    hide-details
                    item-avatar="icon"
                    class="form__field"
                    @input="validate"
                    @blur="validate"
                    single-line
                    hide-details
                    :solo="dark"
                    :box="!dark"
            >
                <template
                        slot="item"
                        slot-scope="{ item }"
                >
                    <v-list-tile-avatar v-if="icon">
                        <v-img :src="item.icon" contain></v-img>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title v-html="item.text"></v-list-tile-title>
                    </v-list-tile-content>
                </template>
                <template
                        slot="selection"
                        slot-scope="{ item }"
                >
                    <v-avatar size="40" tile class="mr-2" v-if="icon && item.icon">
                        <v-img :src="item.icon" contain alt="download"></v-img>
                    </v-avatar>
                    <span>{{ item.text }}</span>
                </template>
            </v-autocomplete>
            <v-autocomplete
                    v-else
                    v-model="selectedItems"
                    :items="itemsList"
                    :loading="loading"
                    :search-input.sync="itemsSearch"
                    multiple
                    clearable
                    chips
                    deletable-chips
                    :placeholder="placeholder"
                    single-line
                    hide-details
                    item-avatar="icon"
                    :attach="true"
                    :disabled="!isEditable || !(Boolean(watchedField) || !linkedFieldTag)"

                    :error="error"
                    :error-messages="errorMsg"

                    class="form__field"
                    @input="validate"
                    @blur="validate"

                    single-line
                    hide-details
                    :solo="dark"
                    :box="!dark"
            >
            </v-autocomplete>
        </v-flex>
    </v-layout>
</template>

<script>
    import axios from 'axios';
    import _ from 'lodash';
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';

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
        mixins: [BlockFieldMixin],
        props: {
           icon: {
               type: Boolean
           }
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
                    if (!oldVal || val.length < oldVal.length) {
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
                                let icon = item.entityIcon || '';
                                if (icon && icon.split('://')[1]) {
                                    icon = `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                                }
                                return {
                                    text: item.entityDesc || `${item.entityInstancePk.entityName}::${item.entityInstancePk.entityInstanceId}`,
                                    value: item.entityInstancePk.entityInstanceId,
                                    icon
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

