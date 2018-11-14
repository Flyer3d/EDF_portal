<template>
    <v-card class="link-select-dlg">
        <v-toolbar :color="'primary'" dark>
            <v-spacer></v-spacer>
            <v-toolbar-title class="link-select-dlg__title">{{modelName}}</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
            <v-container>
                <v-layout wrap class="link-select-dlg__search">
                    <v-flex xs12 sm12 md12>
                        <v-text-field
                                label="Поиск"
                                v-model="searchQuery"
                                clearable
                        ></v-text-field>
                    </v-flex>
                </v-layout>
                <v-data-table
                        no-data-text="Данные не найдены"
                        v-bind:headers="headers"
                        :items="items"
                        :pagination.sync="pagination"
                        :total-items="totalRows"
                        class="link-select-dlg__table elevation-1"
                        :loading="loaded !== 'LOADED'"
                        :rows-per-page-text="rowsPerPageText"
                        :rows-per-page-items="rowsPerPageItems"
                        v-model="selectedItem"
                >
                    <template slot="items" slot-scope="props">
                        <tr @click="selectField(props.item._id)"
                            class="link-select-dlg__item"
                            :class="{ 'link-select-dlg__item_selected': (props.item && props.item._id === selectedId) }"
                        >
                            <td v-for="(field, i, j) in props.item" v-if="j > 0" :class="{ 'text-xs-right' : j > 1}" :key="i">{{field}}</td>
                        </tr>
                    </template>
                </v-data-table>
            </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn :disabled="!selectedId" color="blue darken-1" flat @click.stop="saveEntity">{{button.choose}}</v-btn>
            <v-btn  flat @click.native="closeDialog">{{button.close}}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import moment from 'moment';
    import axios from 'axios';
    import _ from 'lodash';
    import FilterQuery from '~/components/dialogs/FilterQuery';

    export default {
        name: 'link-select-dlg',
        props: {
            modelName: {
                type: String,
                required: true
            },
            multiply: {
                type: Boolean
            }
        },
        components: {
            FilterQuery
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.linkSelectDlg) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                freeze: false,
                searchQuery: '',
                query: '',
                data: [],
                loaded: 'INITIAL',
                totalRows: 0,
                selectedId: null,
                fields: [],
                orderBy: '',
                pagination: {
                    rowsPerPage: 15,
                    page: 1
                },
                rowsPerPageText: 'Строк на странице:',
                rowsPerPageItems: [5, 15, 25],
                selectedItem: []
            };
        },
        created () {
            this.getModel();
        },
        watch: {
            pagination: {
                handler (val) {
                    if (this.freeze || this.loaded !== 'LOADED') {
                        return;
                    }
                    this.freeze = true;
                    this.getList();
                },
                deep: true
            },
            loaded (val) {
                if (val === 'LOADED') {
                    this.$nextTick(() => {
                        this.freeze = false;
                    });
                }
            },
            searchQuery: function () {
                this.search();
            }
        },
        computed: {
            headers () {
                return this.fields && this.fields
                    .sort((a, b) => ((a.tags && a.tags.order) && (b.tags && b.tags.order)) ? Number(a.tags.order) - Number(b.tags.order) : a.order - b.order)
                    .map((item, i) => {
                    return {
                        text: item.name,
                        type: item.type,
                        value: `field_${i}`,
                        align: i ? 'right' : 'left'
                    };
                });
            },
            items () {
                const headers = this.headers;
                return (this.fields && this.data) &&
                    this.data.map((item) => {
                    const obj = {};
                    obj['_id'] = item.entityInstancePk && item.entityInstancePk.entityInstanceId;
                    headers.forEach(head => {
                        if (head.value === '_id') {
                            obj['_id'] = item.entityInstancePk && item.entityInstancePk.entityInstanceId;
                        } else {
                            obj[head.value] = item.object[head.text] || 'Не задано';
                            if (head.type === 'CHECKBOX') {
                                obj[head.value] = (obj[head.value] === 'True') ? 'ДА' : 'НЕТ';
                            } else if (head.type === 'DATE') {
                                obj[head.value] = moment(obj[head.value]).format('DD-MM-YYYY HH:mm');
                            } else if (head.type === 'DROPDOWN_LINK') {
                                if (typeof obj[head.value] === 'string') {
                                    const splitValue = (obj[head.value] && String(obj[head.value]).split('::')) || [];
                                    obj[head.value] = splitValue[1] || splitValue[0];
                                } else if (typeof obj[head.value] === 'object') {
                                    if (Array.isArray(obj[head.value])) {
                                        obj[head.value] = obj[head.value].map(item => item.entityDesc).join(', ');
                                    } else {
                                        obj[head.value] = _.get(obj[head.value], 'entityDesc');
                                    }
                                }
                            }
                        }
                    });
                    return obj;
                });
            },
            idFieldName () {
                let idField;
                let orderField;
                this.fields && this.fields.forEach(item => {
                    if (item.tags && item.tags.isid) {
                        idField = item.name;
                    }
                    if (item.tags && Number(item.tags.order) === 1) {
                        orderField = item.name;
                    }
                });
                return idField || orderField;
            }
        },
        methods: {
            search: _.debounce(function () {
                console.log('[LinkSelectDlg] Search!!!');
                this.query = this.searchQuery ? `${this.headers.reduce((total, item) => {
                    if (item.type === 'CHECKBOX' || item.type === 'DATE') {
                        return total;
                    }
                    return `${total}${(total) ? ' OR ' : ''}[${item.text}]='%${this.searchQuery}%'`;
                }, '')}` : '';
                this.pagination.page = 1;
                this.getList();
            }, 500),
            selectField (id) {
                this.selectedId = id;
            },
            saveEntity () {
                const selectedItem = _.find(this.data,
                    (item) => (item.entityInstancePk && item.entityInstancePk.entityInstanceId) === this.selectedId, {});
                this.$emit('save', selectedItem);
            },
            closeDialog () {
                this.$emit('close');
            },
            async getList () {
                console.log('[LinkSelectDlg/getList] Getting list!..');
                console.dir(this.pagination);
                const {sortBy, descending} = this.pagination;
                this.freeze = true;
                let localOrderBy = '';
                if (sortBy !== null) {
                    localOrderBy = this.headers.find(item => item.value === sortBy).text + ((descending) ? ' ASC' : ' DESC');
                }
                const orderBy = (this.orderBy) ? (localOrderBy ? `${this.orderBy}, ${localOrderBy}` : this.orderBy) : localOrderBy;

                const query = this.query;
                const url = `${this.$store.getters['getApiBase']}/widget`;
                this.loaded = 'LOADING';
                this.data = [];
                this.totalRows = 0;
                try {
                    const res = await axios.get(url, {params: {
                                        model: this.modelName,
                                        pageNumber: this.pagination.page,
                                        pageSize: this.pagination.rowsPerPage,
                                        orderBy: orderBy,
                                        query: query
                                    }});
                    console.log('[LinkSelectDlg] List loaded!');
                    console.dir(res.data);
                    this.data = _.get(res, 'data.rows');
                    this.totalRows = _.get(res, 'data.paging.totalRows');
                    this.loaded = 'LOADED';
                } catch (err) {
                    console.error('[LinkSelectDlg] Error loading widget list!');
                    console.dir(err);
                    this.loaded = 'ERROR';
                }
            },
            async getModel () {
                console.log(`[LinkSelectDlg/getModel] Getting model "${this.modelName}"`);
                this.fields = [];
                if (this.modelName) {
                    const url = `${process.env.apiBase}/model/model`;
                    const model = this.modelName;
                    try {
                        const response = await axios.get(url, { params: { model } });
                        console.log(`[LinkSelectDlg/getModel] Model ${model} loaded!`);
                        this.fields = _.get(response, 'data.fields', []);
                        this.getList();
                    } catch (e) {
                        console.error('Error getting models list!');
                        console.dir(e);
                    }
                }
            }
        }
    };
</script>

<style lang="stylus">

    .link-select-dlg
        .link-select-dlg
            &__table
                th
                td
                    max-width 200px
                    overflow hidden
                    text-overflow ellipsis

            &__item_selected
                background #ffffcc

</style>
