<template>
    <v-card flat class="card-widget" v-if="(dataLoadStatus === 'LOADED') && !isEmpty">
        <v-card-title center class="headline" ref="title" v-if="options.showModelName">
            <v-spacer></v-spacer>
            <h4>{{modelName}}</h4>
            <v-spacer></v-spacer>

        </v-card-title>
        <v-card-text>
            <v-container grid-list-lg class="fullwidth">
                <v-layout row v-if="options.editable" wrap>
                    <v-flex sm6>
                        <v-btn
                                block
                                @click="saveItem"
                        >Save item!
                        </v-btn>
                    </v-flex>
                    <v-flex sm6>
                        <v-btn
                                block
                                @click="deleteItem"
                        >Delete item!
                        </v-btn>
                    </v-flex>
                </v-layout>
                <div v-if="documentation" class="card-widget__documentation">
                    <v-flex xs12 sm12 md12 class="card-widget__description">
                        <span v-html="documentation"></span>
                    </v-flex>
                </div>
                <v-layout row wrap v-resize="onResize">
                    <template v-for="field in fields">
                        <v-flex
                                v-if="hiddenFields.indexOf(field.name) === -1"
                                :key="field.name"
                                :style="fieldStyle(field)"
                        >
                            <component
                                    ref="field"
                                    :modelName="modelName"
                                    :is="field.fieldType"
                                    :field="field"
                                    :editable="options.editable"
                                    :inputData="getFieldData(field.name)"
                                    :key="field.name"
                                    @download="download"
                            ></component>
                        </v-flex>
                    </template>
                </v-layout>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import WidgetFieldMixin from '~/mixins/common/WidgetFieldMixin';
    import evaluator from '~/utils/toStringEvaluator';

    const minColumnWidth = process.env.minColumnWidth;

    export default {
        name: 'card-widget',
        mixins: [WidgetFieldMixin],
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
                basis: '100%',
                $bus: this.storeBus,
                masterWidget: '',
                statements: [],
                hiddenFields: []
            };
        },
        watch: {
            options: {
                handler () {
                    if (this.masterWidget) {
                        this.$bus.$off('select', this.selectItem);
                        this.masterWidget = '';
                    }
                    this.getConstraints();
                    this.getData();
                },
                deep: true
            },
            dataLoadStatus (val) {
                if (val === 'LOADED') {
                    this.onResize();
                }
            },
            updateStatus (val) {
                if (val === 'UPDATED') {
                    this.$bus.$emit('refresh_all');
                }
            },
            deleteStatus (val) {
                if (val === 'SUCCESS') {
                    this.$bus.$emit('refresh_all');
                }
            },
            data (val) {
                if (val && val.object) {
                    this.getHiddenFields();
                    console.log(`[CardWidget] Emitting event select (widgetId = ${this.id})`);
                    let item = _.cloneDeep(val);
                    this.options.fields.forEach(field => {
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
                    this.$bus.$emit('select', {
                        widgetId: this.id,
                        modelName: this.modelName,
                        itemId: this.itemId,
                        item: item
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
            documentation () {
               if (this.options.documentation && this.options.documentation.length > 0) {
                   const doc = this.options.documentation;
                   return doc.map(item => item.replace(/{{(.*?)}}/g, function (str, arg) {
                       if (arg) {
                           return encodeURIComponent(item.object[arg]);
                       }
                       return '';
                   })).join('<br>');
               } else {
                   return undefined;
               }
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
            modelName () {
                return this.$store.getters[`${this.id}/getModelName`];
            },
            updateStatus () {
                return this.$store.getters[`${this.id}/dataUpdateStatus`];
            },
            deleteStatus () {
                return this.$store.getters[`${this.id}/dataDeleteStatus`];
            },
            fields () {
                return this.options.fields && this.options.fields.filter(item => item.checked).map((item, i) => {
                    item.fieldType = this.getFieldType(item.type);
                    return item;
                });
            },
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            }
        },
        mounted () {
            this.$bus = this.storeBus;
            this.$bus.$on('refresh_all', this.getData);
            this.getConstraints();
            this.getData();
            this.onResize();
        },
        beforeDestroy () {
            this.$bus && this.$bus.$off('refresh_all', this.getData);
            if (this.masterWidget) {
                this.$bus && this.$bus.$off('select', this.selectItem);
            }
        },
        methods: {
            getHiddenFields () {
                const val = (this.data && this.data.object) || {};
                console.log('*** Card data changed to ');
                console.dir(val);
                if (this.statements.length > 0) {
                    let fieldsArr = [];
                    this.statements.forEach(statement => {
                        const arr = statement.evaluate(val);
                        fieldsArr = fieldsArr.concat(arr);
                    });
                    this.hiddenFields = _.uniq(_.compact(fieldsArr));
                }
            },
            getConstraints () {
                this.statements = [];
                if (this.options.constraint && this.options.constraint.length > 0) {
                    console.log('[getConstraints] Constraint found!');
                    console.dir(this.options.constraint);
                    console.log('[getConstraints] Fields data:');
                    console.dir(this.segmentData);
                    this.options.constraint.map(constraint => {
                        try {
                            const statement = evaluator.parseStatement(constraint);
                            this.statements.push(statement);
                        } catch (err) {
                            console.error('[getConstraints] Error parsing constraint:');
                            console.error(constraint);
                            console.dir(err);
                        }
                    });
                    console.log('[getConstraints] Statements:');
                    console.dir(this.statements);
                }
            },
            getFieldData (fieldName) {
               const item = this.data || {};
               if (!item.object) {
                   return;
               }
               if (fieldName === 'documentation') {
                   const doc = item.object[fieldName];
                   const field = doc && doc[0] && doc[0].replace(/{{(.*?)}}/g, function (str, arg) {
                       if (arg) {
                           return encodeURIComponent(item.object[arg]);
                       }
                       return '';
                   });
                  return field;
               }
               return item.object[fieldName];
            },
            getData () {
                if (!(this.options.dataSource && this.options.dataSource.type)) {
                    return;
                }
                switch (this.options.dataSource.type) {
                    case 'listElem':
                        this.getItem(this.options.dataSource.itemId);
                        break;
                    case 'pageId':
                        this.getItem(this.params.__entityId && this.params.__entityId.split('::')[0]);
                        break;
                    case 'widgetClassElem':
                        if (!this.masterWidget && this.options.dataSource.masterWidget) {
                            console.log(`\n----> [CardWidget ${this.id}] Select ON!!!`);
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
                console.log(`[CardWidget] Item selected! (incomingWidget = ${obj.widgetId}, masterWidget = ${this.options.dataSource.masterWidget})`);
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
            saveItem () {
                const fields = this.$refs.field.map(item => item.getData());
                const sendObject = {};
                fields.forEach(item => {
                    sendObject[item.name] = item.value;
                });
                console.log('[CardWidget] Save items with params:');
                console.dir({
                    fields: sendObject,
                    modelName: this.modelName,
                    id: this.data.entityInstancePk.entityInstanceId
                });
                this.$store.dispatch(`${this.id}/updateItem`, {
                    fields: sendObject,
                    modelName: this.modelName,
                    id: this.data.entityInstancePk.entityInstanceId
                });
            },
            deleteItem () {
                this.$store.dispatch(`${this.id}/deleteItem`, {
                    modelName: this.modelName,
                    id: this.data.entityInstancePk.entityInstanceId
                });
            },
            download (payload) {
                this.$store.dispatch(`utils/downloadFile`, payload);
            },
            onResize () {
                const divider = Math.floor(this.$el.clientWidth / minColumnWidth);
                if (divider) {
                    this.basis = `${100 / divider}%`;
                }
            },
            fieldStyle (field) {
                const type = field.fieldType;
                if (type === 'widget-text-area-field' || type === 'widget-html-field' ||
                    (type === 'widget-checkbox-field' && field.tags && field.tags.action)) {
                    return {
                        'flex-basis': '100%',
                        'max-width': '100%'
                    };
                } else {
                    return {
                        'flex-basis': this.basis,
                        'max-width': this.basis
                    };
                }
            }
        }
    };
</script>

<style lang="stylus">

    .card-widget
        .card-widget
            &__layout
                align-items center
            &__documentation
                padding 16px
                width 100%
                line-height: 1.4;
            &__description
                text-align center

</style>
