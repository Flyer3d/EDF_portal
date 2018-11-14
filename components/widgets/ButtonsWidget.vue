<template>
    <v-card flat class="buttons-widget">
        <v-card-text>
            <v-container grid-list-md>
                <v-layout :column="options.vertical" v-if="buttons && buttons.length > 0">
                    <v-flex v-for="(button, n) in buttons" :key="n">
                        <v-btn
                                max-width="100%"
                                slot="activator"
                                :disabled="buttonDisabled(button) || !dataAviable"
                                block
                                :key="n"
                                @click="doAction(button)"
                        >{{button.title}}
                        </v-btn>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: 'buttons-widget',

        props: {
            id: {
                required: true,
                type: String
            },
            params: {
                type: Object
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
                gui: (process.env.gui && process.env.gui.buttonsWidget) || {},
                masterWidget: '',
                actionName: ''
            };
        },
        watch: {
            options: {
                handler () {
                    if (this.masterWidget) {
                        this.$bus.$off('select', this.selectItem);
                        this.masterWidget = '';
                    }
                    this.getData();
                },
                deep: true
            },
            actionStatus (val) {
                const actionName = this.actionName;
                if (val === 'SUCCESS') {
                    this.$bus.$emit('refresh_all');
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.msg.processSuccess && this.gui.msg.processSuccess.replace('###', actionName),
                        timeout: 6000
                    });
                } else if (val === 'STARTED') {
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.msg.startingProcess && this.gui.msg.startingProcess.replace('###', actionName),
                        timeout: 6000
                    });
                } else if (val === 'FAIL') {
                    const error = _.get(this.error, 'response.data.message');
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.msg.processError && this.gui.msg.processError.replace('###', actionName)} \n${error}`,
                        timeout: 20000
                    });
                }
            },
            data (val) {
                if (val && val.object) {
                    console.log(`[ButtonWidget] Emitting event select (widgetId = ${this.id})`);
                    this.$bus.$emit('select', {
                        widgetId: this.id,
                        modelName: this.modelName,
                        itemId: this.itemId,
                        item: val
                    });
                    this.options.fields.forEach(field => {
                        if (field.type === 'DROPDOWN_LINK') {
                            if (typeof val.object[field.name] === 'string') {
                                this.$bus.$emit('select', {
                                    widgetId: this.id,
                                    modelName: field.linkedEntityName,
                                    itemId: val.object[field.name]
                                });
                            } else if (typeof val.object[field.name] === 'object') {
                                if (Array.isArray(val.object[field.name])) {
                                    val.object[field.name].forEach(item => {
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
                                        itemId: _.get(val.object[field.name], 'entityInstancePk.entityInstanceId')
                                    });
                                }
                            }
                        }
                    });
                }
            }

        },
        computed: {
            dataAviable () {
                return ((this.dataLoadStatus === 'LOADED') && !this.isEmpty) || this.options.dataSource.type === 'noConnection';
            },
            dataLoadStatus () {
                return this.$store.getters[`${this.id}/dataLoadStatus`];
            },
            isEmpty () {
               return _.isEmpty(this.data);
            },
            data () {
                return this.$store.getters[`${this.id}/getItem`];
            },
            itemId () {
                return this.$store.getters[`${this.id}/getItemId`];
            },
            itemDesc () {
                return this.$store.getters[`${this.id}/getItemDesc`];
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
            userName () {
                return this.$store.getters[`login/getUserName`];
            },
            storeBus () {
                return this.$store.getters[`${this.id}/getBus`];
            },
            error () {
                return this.$store.getters[`${this.id}/getError`];
            },
            actionStatus () {
                return this.$store.getters[`${this.id}/actionStatus`];
            },
            modelName () {
                return this.$store.getters[`${this.id}/getModelName`];
            },
            buttons () {
                const buttons = this.options.buttons || [];
                const item = this.data && this.data.object;
                const params = this.params;
                const modelName = this.modelName;
                const entityId = this.itemId;
                const entityDesc = this.itemDesc;
                return buttons.map(button => {
                    const newButton = Object.assign({}, button);
                    if (newButton.type === 'link') {
                        newButton.url = button.url.replace(/{{(.*?)}}/g, function (str, arg) {
                            if (arg) {
                                let result = '';
                                if (arg === '__entityName') {
                                    result = encodeURIComponent(modelName);
                                } else if (arg === '__entityId') {
                                    result = `${entityId}::${entityDesc}`;
                                } else if (params && params[arg]) {
                                    result = encodeURIComponent(params[arg]);
                                } else if (item && item[arg]) {
                                    if (typeof item[arg] === 'object') {
                                        // ToDo: Неправильно!!! Переделать срочно!!!
                                        result = encodeURIComponent(Array.isArray(item[arg])
                                            ? `${_.get(item[arg], '[0].entityInstancePk.entityInstanceId')}::${_.get(item[arg], '[0].entityDesc')}`
                                            : `${_.get(item[arg], 'entityInstancePk.entityInstanceId')}::${_.get(item[arg], 'entityDesc')}`);
                                    } else {
                                        result = encodeURIComponent(item[arg]);
                                    }
                                }
                                return result;
                            }
                        });
                    }
                    console.log(`[buttons] Result button:`);
                    console.dir(newButton);
                    return newButton;
                });
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
            buttonDisabled (button) {
                if (button.type === 'process') {
                    return !(button.processId && button.processId !== '');
                }
                return !(button.url && button.url !== '');
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
                        if (!this.masterWidget && this.options.dataSource.masterWidget) {
                            this.$bus.$on('select', this.selectItem);
                        }
                        this.masterWidget = this.options.dataSource.masterWidget;
                        break;
                    case 'firstElem':
                        this.getFirst();
                        break;
                    case 'lastElem':
                        this.getLast();
                        break;
                    default:
                }
            },
            selectItem (obj) {
                console.log(`[ButtonWidget] Item selected! (incomingWidget = ${obj.widgetId}, masterWidget = ${this.options.dataSource.masterWidget})`);
                if (obj.widgetId === this.masterWidget && obj.modelName === this.modelName) {
                    this.getItem(obj.itemId);
                }
            },
            getItem (id) {
                this.$store.dispatch(`${this.id}/loadItem`, {
                    fields: this.fields,
                    model: this.modelName,
                    id: id
                });
            },
            getFirst () {
                this.$store.dispatch(`${this.id}/loadFirstListItem`, {
                    fields: this.fields,
                    model: this.modelName,
                    query: this.queryStr,
                    orderBy: this.options.orderBy
                });
            },
            getLast () {
                this.$store.dispatch(`${this.id}/loadLastListItem`, {
                    fields: this.fields,
                    model: this.modelName,
                    query: this.queryStr,
                    orderBy: this.options.orderBy
                });
            },
            doAction (button) {
                console.log('[doAction] Button clicked!!');
                console.dir(button);
               if (button.type === 'link' || !button.type) {
                   this.gotoPage(button.url, button.externalUrl);
               } else if (button.type === 'process') {
                   const actionId = button.processId;
                   const entityInstance = {};
                   if (button.usePk) {
                       entityInstance.entityName = this.modelName;
                       entityInstance.entityInstanceId = this.itemId;
                   }
                   console.log(`[doAction] DoAction with id = ${actionId}`);
                   console.dir(entityInstance);
                   this.actionName = button.processName;
                   this.$store.dispatch(`${this.id}/doAction`, { actionId, entityInstance });
               }
            },
            gotoPage (url, externalUrl) {
                console.log(`[gotoPage] Going to page ${url}`);
                this.$root.$emit('gotoPage', { url, externalUrl });
            }
        }
    };
</script>

<style lang="stylus">

    .buttons-widget
        .buttons-widget
            &__layout
                align-items center
            &__documentation
                padding 16px
                width 100%
                line-height: 1.4;
            &__description
                text-align center
        .container
            max-width 3000px
            padding 0

</style>
