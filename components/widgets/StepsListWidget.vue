<template>
    <div class="step-list-widget">
        <v-btn block @click.native="getData()">{{gui.refreshStepList}}</v-btn>
        <v-list v-if="(items && items.length > 0)" :two-line="isTwoLine" :three-line="isThreeLine">
        <template v-for="(item, index) in items">
            <v-list-tile
                    ripple
                    @click="selectField(item.id)"
                    :key="item.id"
                    class="step-list-widget__item"
                    :class="{ 'step-list-widget__item_selected': (item.id === selectedId) }"
            >
                <v-list-tile-content>
                    <v-list-tile-title v-if="isTitleField">{{ item.title }}</v-list-tile-title>
                    <v-list-tile-sub-title class="grey--text text--darken-4">{{ item.subTitle }}</v-list-tile-sub-title>
                    <v-list-tile-sub-title>{{ item.label }}</v-list-tile-sub-title>
                </v-list-tile-content>
            </v-list-tile>
            <v-divider v-if="index + 1 < items.length"></v-divider>
        </template>

        </v-list>
        <v-card v-else>
            <v-card-title class="text-xs-center">
                Нет данных
            </v-card-title>
        </v-card>
        <div class="text-xs-center step-list-widget__pagination" v-if="totalPages > 1">
            <v-pagination :length="totalPages" v-model="page" circle></v-pagination>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';

    export default {
        name: 'step-list-widget',
        props: {
            id: {
                required: true,
                type: String
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.stepListWidget) || {},
                $bus: this.storeBus,
                rowsPerPage: 10,
                page: 1,
                selectedId: null
            };
        },
        watch: {
            options: {
                handler () {
                    this.page = 1;
                    this.getData();
                },
                deep: true
            },
            page () {
                this.getData();
            },
            data () {
                if (this.options.autoSelect && (this.data && this.data.length > 0)) {
                    setTimeout(() => this.selectField(_.get(this.data, '[0].object.pk')), 700);
                }
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
                const rowsPerPage = this.$store.getters[`${this.id}/pageListSize`];
                if (!rowsPerPage) {
                    return 1;
                }
                return Math.ceil(this.totalRow / rowsPerPage);
            },
            data () {
                return this.$store.getters[`${this.id}/getList`];
            },
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
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
                        id: item.object.pk,
                        title,
                        subTitle,
                        label
                    };
                });
            }
        },
        mounted () {
            this.$bus = this.storeBus;
            this.$bus.$on('refresh_all', this.refreshData);
            this.getData();
        },
        beforeDestroy () {
            this.$bus.$off('refresh_all', this.refreshData);
        },
        methods: {
            refreshData () {
                setTimeout(() => {
                    console.log('[StepListWidget] UPDATE LIST!!!');
                    this.getData();
                    }, 3000);
            },
            formatField (fieldName, item) {
                let type = this.options.fields && this.options.fields.find(function (item) {
                    return item.name === fieldName;
                });
                type = type && type.type;
                const value = item[fieldName] || 'Не задано';
                if (type === 'DATE') {
                    return moment(value).format('DD-MM-YYYY HH:mm');
                }
                return value;
            },
            getData () {
                this.$store.dispatch(`${this.id}/loadStepList`, {
                    pageNumber: this.page,
                    pageSize: this.rowsPerPage,
                    orderBy: this.options && this.options.orderBy,
                    query: this.options && this.options.query
                });
            },
            selectField (id) {
                this.selectedId = id;
                if (!this.data) {
                    return;
                }
                const item = this.data.find(item => item.object.pk === id);
                console.log(`[StepListWidget] Emitting event select (widgetId = ${this.id})`);
                this.$bus.$emit('select', {
                    widgetId: this.id,
                    modelName: this.modelName,
                    item: item,
                    itemId: id
                });
                this.fields.forEach(field => {
                    if (field.type === 'DROPDOWN_LINK') {
                        if (!item) {
                            console.error(`Error select field for id ${id}, field name = ${field.name}`);
                        }
                        console.log(`[StepListWidget] Selecting dropdown link for field ${field.name}!`);
                        console.dir(item);

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

    .step-list-widget
        .step-list-widget
            &__item_selected
                background #ffffcc

</style>
