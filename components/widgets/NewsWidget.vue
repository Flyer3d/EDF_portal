<template>
    <v-card flat class="card-widget" v-if="dataLoadStatus === 'LOADED'">
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <h2>{{fields['Заголовок']}}</h2>
            <v-spacer></v-spacer>
        </v-card-title>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <h4>{{fields['Подзаголовок']}}</h4>
            <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>
            <p>
                <span v-html="fields['Развернутое содержание']"></span>
            </p>
            <p>Автор: {{fields['Автор']}}</p>
            <p><span v-html="fields['Источник']"></span></p>
        </v-card-text>
    </v-card>
    <v-card v-else>
        <v-card-title>
            Нет данных
        </v-card-title>
    </v-card>
</template>
<script>
    export default {
        name: 'card-widget',
        props: {
            id: {
                required: true,
                type: String
            },
            editable: {
                required: false,
                type: Boolean,
                default: false
            },
            inputData: {
                required: false,
                type: Object,
                default: undefined
            }
        },
        data () {
            return {
                $bus: this.storeBus,
                masterWidget: ''
            };
        },
        watch: {
            options: {
                handler () {
                    if (this.masterWidget) {
                        this.$bus.$off('select', this.selectItem);
                    }
                    this.masterWidget = '';
                    this.getData();
                },
                deep: true
            },
            'options.dataSource.itemId' (val) {
                this.$bus.$emit('select', {
                    widgetId: this.id,
                    itemId: val
                });
            }
        },
        computed: {
            fields () {
                return (this.data && this.data.object) || {};
            },
            dataLoadStatus () {
                return this.$store.getters[`${this.id}/dataLoadStatus`];
            },
            data () {
                return this.$store.getters[`${this.id}/getItem`];
            },
            itemId () {
                return this.$store.getters[`${this.id}/getItemId`];
            },
            userName () {
                return this.$store.getters[`login/getUserName`];
            },
            storeBus () {
                return this.$store.getters[`${this.id}/getBus`];
            },
            modelName () {
                return this.$store.getters[`${this.id}/getModelName`];
            },
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            }
        },
        mounted () {
            this.$bus = this.storeBus;
            this.$bus.$on('refresh_all', this.getData);
            this.getData();
        },
        beforeDestroy () {
            this.$bus && this.$bus.$off('refresh_all', this.getData);
            if (this.masterWidget) {
                this.$bus && this.$bus.$off('select', this.selectItem);
            }
        },
        methods: {
            getFieldData (fieldName) {
               const item = this.data || {};
               if (!item.object) {
                   return;
               }
               return String(item.object[fieldName]);
            },
            getData () {
                if (!(this.options.dataSource && this.options.dataSource.type)) {
                    return;
                }
                switch (this.options.dataSource.type) {
                    case 'listElem':
                        this.getItem(this.options.dataSource.itemId);
                        break;
                    case 'widgetClassElem':
                        if (!this.masterWidget) {
                            this.$bus.$on('select', this.selectItem);
                        }
                        this.masterWidget = this.options.dataSource.masterWidget;
                        break;
                    case 'firstElem':
                        this.getFirst();
                        break;
                    case 'lastElem':
                    default:
                        this.getLast();
                }
            },
            selectItem (obj) {
                if (obj.widgetId === this.masterWidget && obj.modelName === this.modelName) {
                    this.getItem(obj.itemId);
                    this.$bus.$emit('select', {
                        widgetId: this.id,
                        itemId: obj.itemId
                    });
                }
            },
            getItem (id) {
                if (id) {
                    this.$store.dispatch(`${this.id}/loadItem`, {
                        model: this.modelName,
                        id: id
                    });
                }
            },
            getFirst () {
                this.$store.dispatch(`${this.id}/loadFirstListItem`, {
                    model: this.modelName,
                    query: this.options.query,
                    orderBy: this.options.orderBy
                });
            },
            getLast () {
                this.$store.dispatch(`${this.id}/loadLastListItem`, {
                    model: this.modelName,
                    query: this.options.query,
                    orderBy: this.options.orderBy
                });
            }
        }
    };
</script>

<style lang="stylus">

    .card-widget
        .card-widget
            &__layout
                align-items center

</style>
