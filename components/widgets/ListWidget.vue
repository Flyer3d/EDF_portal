<template>
    <div v-if="isTitleField" class="list-widget">
        <v-list v-if="(items && items.length > 0)" :two-line="isTwoLine" :three-line="isThreeLine">
            <template v-for="(item, index) in items">
                <v-list-tile
                        ripple
                        @click="selectField(item.id)"
                        :key="item.id"
                        class="list-widget__item"
                        :class="{ 'list-widget__item_selected': (item.id === selectedId) }"
                >
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        <v-list-tile-sub-title class="grey--text text--darken-4">{{ item.subTitle }}
                        </v-list-tile-sub-title>
                        <v-list-tile-sub-title>{{ item.label }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-divider v-if="index + 1 < items.length"></v-divider>
            </template>

        </v-list>
        <v-card v-else>
            <v-progress-linear :indeterminate="true" height="2" v-if="loading"></v-progress-linear>
            <v-card-title class="text-xs-center" v-else>
                {{gui.noDataLabel}}
            </v-card-title>
        </v-card>
        <div class="text-xs-center list-widget__pagination" v-if="totalPages > 1">
            <v-pagination :length="totalPages" v-model="page" circle></v-pagination>
        </div>
    </div>
    <v-card v-else>
        <v-card-title>
            {{gui.noTitleLabel}}
        </v-card-title>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';

    export default {
        name: 'list-widget',
        props: {
            id: {
                required: true,
                type: String
            },
            params: {
                type: Object
            },
            userQuery: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.listWidget) || {},
                $bus: this.storeBus,
                rowsPerPage: (this.options && this.options.rowsPerPage) || 10,
                page: 1,
                selectedId: null,
                masterFilter: '',
                externalFilter: ''
            };
        },
        watch: {
            options: {
                handler () {
                    this.page = 1;
                    this.rowsPerPage = (this.options && this.options.rowsPerPage) || 10;
                    this.masterFilter = '';
                    if (this.options.widgetLink) {
                        this.$store.commit(`${this.id}/LIST_LOADING`);
                        console.log(`\n[ListWidget] Select ON!!!`);
                        this.$bus.$on('select', this.selectItem);
                    } else {
                        this.getData();
                    }
                },
                deep: true
            },
            page () {
                this.getData();
            },
            data () {
                if (this.options.autoSelect && (this.data && this.data.length > 0)) {
                    setTimeout(() => this.selectField(_.get(this.data, '[0].entityInstancePk.entityInstanceId')), 700);
                }
            },
            userQuery () {
                this.getData();
            }
        },
        computed: {
            isTitleField () {
                return Boolean(_.get(this.options, 'title.fieldName', ''));
            },
            isTwoLine () {
                return Boolean(_.get(this.options, 'subTitle.fieldName', '')) && !_.get(this.options, 'label.fieldName', '');
            },
            isThreeLine () {
                return Boolean(_.get(this.options, 'label.fieldName', ''));
            },
            modelName () {
                return this.$store.getters[`${this.id}/getModelName`];
            },
            storeBus () {
                return this.$store.getters[`${this.id}/getBus`];
            },
            totalRow () {
                return this.$store.getters[`${this.id}/totalListRows`];
            },
            totalPages () {
                return Math.ceil(this.totalRow / this.rowsPerPage);
            },
            data () {
                return this.$store.getters[`${this.id}/getList`];
            },
            loading () {
                return this.$store.getters[`${this.id}/listLoadStatus`] === 'LOADING';
            },
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            },
            queryStr () {
                if (this.options.query && this.options.query.queryStr) {
                    const params = this.params;
                    return this.options.query.queryStr.replace(/{{(.*?)}}/g, function (str, arg) {
                        if (arg) {
                            if (params && params[arg]) {
                                return encodeURIComponent(params[arg]);
                            }
                            return '';
                        }
                    });
                }
                return '';
            },
            fields () {
                return this.options.fields;
            },
            items () {
                const titleField = this.options.title && this.options.title.fieldName;
                const titlePrefix = this.options.title && this.options.title.prefix;
                const subTitleField = this.options.subTitle && this.options.subTitle.fieldName;
                const subTitlePrefix = subTitleField ? this.options.subTitle.prefix : '';
                const labelField = this.options.label && this.options.label.fieldName;
                const labelPrefix = labelField ? this.options.label.prefix : '';
                const formatField = this.formatField;
                return this.data && this.data.map((item) => {
                    const title = `${titlePrefix} ${formatField(titleField, item.object)}`;
                    const subTitle = `${subTitlePrefix} ${subTitleField ? formatField(subTitleField, item.object) : ''}`;
                    const label = `${labelPrefix} ${labelField ? formatField(labelField, item.object) : ''}`;
                    return {
                        id: item.entityInstancePk && item.entityInstancePk.entityInstanceId,
                        title,
                        subTitle,
                        label
                    };
                });
            }
        },
        mounted () {
            this.$bus = this.storeBus;
            this.$bus.$on('refresh_all', this.getData);
            this.$bus.$on('filter', this.onFilter);
            this.rowsPerPage = (this.options && this.options.rowsPerPage) || 10;
            if (this.options.widgetLink) {
                this.$store.commit(`${this.id}/LIST_LOADING`);
                console.log(`\n----> [ListWidget ${this.id}] Select ON!!!`);
                this.$bus.$on('select', this.selectItem);
            } else {
                this.getData();
            }
        },
        beforeDestroy () {
            this.$bus.$off('refresh_all', this.getData);
            this.$bus && this.$bus.$off('filter', this.onFilter);
            this.$bus && this.$bus.$off('select', this.selectItem);
        },
        methods: {
            selectItem (obj) {
                console.log(`[ListWidget] Item selected! (incomingWidget = ${obj.widgetId}, masterWidget = ${this.options.dataSource.masterWidget})`);
                console.dir(obj);
                if (this.options.dataSource && obj.widgetId === this.options.dataSource.masterWidget && obj.modelName === this.options.dataSource.modelName) {
                    const source = this.options.dataSource;
                    if (source.field && source.operator && source.masterField) {
                        if (source.masterField === '_id') {
                            this.masterFilter = `[${source.field}]${source.operator}'${obj.item.entityInstancePk.entityInstanceId}'`;
                        } else {
                            this.masterFilter = `[${source.field}]${source.operator}'${obj.item.object[source.masterField]}'`;
                        }
                    }
                    console.log(`[ListWidget] OUR WIDGET!!! MasterFilter = ${this.masterFilter}`);
                    this.getData();
                }
            },
            onFilter ({targetWidgetId, params}) {
                console.log(`[ListWidget] Filter event! (targetWidget = ${targetWidgetId}`);
                console.dir(params);
                if (targetWidgetId === this.id) {
                    console.log(`[ListWidget] OUR FILTER!!!`);
                    this.externalFilter = params;
                    this.getData();
                }
            },
            formatField (fieldName, item) {
                const field = this.options.fields && this.options.fields.find(function (item) {
                    return item.name === fieldName;
                });
                const type = field && field.type;
                const value = item[fieldName] || 'Не задано';
                if (type === 'DATE') {
                    return moment(value).format('DD-MM-YYYY HH:mm');
                } else if (type === 'DROPDOWN_LINK') {
                    if (typeof item[fieldName] === 'string') {
                        const splitValue = item[fieldName] ? String(item[fieldName]).split('::') : [];
                        return splitValue[1] || splitValue[0] || 'Не задано';
                    } else if (typeof item[fieldName] === 'object') {
                        if (Array.isArray(item[fieldName])) {
                            return item[fieldName].map(item => item.entityDesc).join(', ');
                        }
                        return _.get(item[fieldName], 'entityDesc');
                    }
                }
                return value;
            },
            getData () {
                if (this.options.widgetLink && !this.masterFilter) return;
                let query = [];
                if (this.masterFilter) query.push(this.masterFilter);
                if (this.queryStr) query.push(this.queryStr);
                if (this.userQuery) query.push(this.userQuery);
                if (this.externalFilter) query.push(this.externalFilter);
                this.$store.dispatch(`${this.id}/loadList`, {
                    model: this.modelName,
                    userOnly: this.options.userOnly,
                    pageNumber: this.page,
                    pageSize: this.rowsPerPage,
                    orderBy: this.options.orderBy,
                    query: query.length > 0 ? query.join(' AND ') : ''
                });
            },
            selectField (id) {
                this.selectedId = id;
                const selectedItem = this.data.find(item => item.entityInstancePk.entityInstanceId === id);
                let item = _.cloneDeep(selectedItem);
                this.fields.forEach(field => {
                    if (field.type === 'DROPDOWN_LINK') {
                        if (typeof item.object[field.name] === 'string') {
                            const splitValue = (item.object[field.name] && String(item.object[field.name]).split('::')) || [];
                            item.object[field.name] = splitValue[0];
                        } else if (typeof item.object[field.name] === 'object') {
                            if (Array.isArray(item.object[field.name])) {
                                item.object[field.name] = item.object[field.name].map(item => _.get(item, 'entityInstancePk.entityInstanceId'));
                            } else {
                                item.object[field.name] = _.get(item.object[field.name], 'entityInstancePk.entityInstanceId');
                            }
                        }
                        const splitValue = item.object[field.name] ? String(item.object[field.name]).split('::') : [];
                        item.object[field.name] = splitValue[0];
                    }
                });
                console.log(`[ListWidget] Emitting event select (widgetId = ${this.id}, selectedId = ${id})`);
                console.dir(item);
                console.dir(this.data);
                this.$bus.$emit('select', {
                    widgetId: this.id,
                    modelName: this.modelName,
                    itemId: id,
                    item
                });
                this.fields.forEach(field => {
                    if (field.type === 'DROPDOWN_LINK') {
                        if (typeof item.object[field.name] === 'string') {
                            this.$bus.$emit('select', {
                                widgetId: this.id,
                                modelName: field.linkedEntityName,
                                itemId: item.object[field.name]
                            });
                        } else if (typeof item.object[field.name] === 'object') {
                            if (Array.isArray(item.object[field.name])) {
                                item.object[field.name].forEach(item => {
                                    this.$bus.$emit('select', {
                                        widgetId: this.id,
                                        modelName: field.linkedEntityName,
                                        itemId: _.get(item, 'entityInstancePk.entityInstanceId')
                                    });
                                });
                            } else {
                                this.$bus.$emit('select', {
                                    widgetId: this.id,
                                    modelName: field.linkedEntityName,
                                    itemId: _.get(item.object[field.name], 'entityInstancePk.entityInstanceId')
                                });
                            }
                        }
                    }
                });
            }
        }
    };
</script>

<style lang="stylus">

    .list-widget
        .list-widget
            &__item_selected
                background #ffffcc

</style>
