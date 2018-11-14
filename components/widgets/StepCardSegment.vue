<template>
    <div class="step-card-segment" :class="{'step-card-segment_noteditable': !editable}"
         v-if="modelLoadStatus === 'SUCCESS'">
        <v-card v-if="dataLoadStatus === 'LOADED' || !instanceId">
            <v-card-title center class="headline" ref="title" v-if="showModelName">
                <v-spacer></v-spacer>
                <h4>{{modelName}}</h4>
                <v-spacer></v-spacer>

            </v-card-title>
            <v-card-text>
                <div v-if="documentation" class="step-card-segment__documentation">
                    <v-flex xs12 sm12 md12 class="step-card-segment__description">
                        <span v-html="documentation"></span>
                    </v-flex>
                </div>
                <v-container grid-list-lg class="fullwidth">
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
                                        :editable="editable && !field.valueFrom"
                                        :inputData.sync="segmentData[field.name]"
                                        :allData="segmentData"
                                        :key="field.name"
                                        @download="download"
                                        @submit="submit"
                                ></component>
                            </v-flex>
                        </template>
                    </v-layout>
                </v-container>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import WidgetFieldMixin from '~/mixins/common/WidgetFieldMixin';

    import evaluator from '~/utils/toStringEvaluator';
    import _ from 'lodash';
    import moment from 'moment';

    const minColumnWidth = process.env.minColumnWidth;

    export default {
        name: 'step-card-segment',
        mixins: [WidgetFieldMixin],
        props: {
            id: {
                required: true,
                type: String
            },
            widgetId: {
                required: true,
                type: String
            },
            editable: {
                required: false,
                type: Boolean,
                default: false
            },
            showModelName: {
                type: Boolean
            },
            inputData: {
                type: Object,
                required: false,
                default: () => ({})
            },
            params: {
                type: Object,
                required: false,
                default: () => ({})
            }
        },
        data () {
            return {
                basis: '100%',
                actionFound: false,
                storeData: {},
                widgetWidth: 0,
                segmentData: {},
                statements: [],
                hiddenFields: []

            };
        },
        watch: {
            modelLoadStatus (val) {
                if (val === 'SUCCESS') {
                    if (this.modelConstraint.length > 0) {
                        this.modelConstraint.map(constraint => {
                            try {
                                const statement = evaluator.parseStatement(constraint);
                                this.statements.push(statement);
                            } catch (err) {
                                console.error('[StepCardSegment.fields] Error parsing constraint:');
                                console.error(constraint);
                                console.dir(err);
                            }
                        });
                        console.log('[StepCardSegment.fields] Statements:');
                        console.dir(this.statements);
                    }
                    this.getItem();
                }
            },
            dataLoadStatus (val) {
                if (val === 'LOADED') {
                    this.segmentData = Object.assign({}, this.item.object, this.storeData);
                    this.onResize();
                }
            },
            segmentData: {
                handler (val) {
                    if (this.statements.length > 0) {
                        let fieldsArr = [];
                        this.statements.forEach(statement => {
                            const arr = statement.evaluate(val);
                            fieldsArr = fieldsArr.concat(arr);
                        });
                        this.hiddenFields = _.uniq(_.compact(fieldsArr));
                    }
                },
                deep: true
            },
            inputData () {
                this.setStoreData();
            }
        },
        computed: {
            documentation () {
                if (this.storeModel.documentation && this.storeModel.documentation.length > 0) {
                    const doc = this.storeModel.documentation;
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
            modelName () {
                return this.$store.getters[`${this.widgetId}/${this.id}/getModelName`];
            },
            instanceId () {
                return this.$store.getters[`${this.widgetId}/${this.id}/getInstanceId`];
            },
            dataLoadStatus () {
                return this.$store.getters[`${this.widgetId}/${this.id}/dataLoadStatus`];
            },
            modelLoadStatus () {
                return this.$store.getters[`${this.widgetId}/${this.id}/model/modelLoadStatus`];
            },
            item () {
                return this.$store.getters[`${this.widgetId}/${this.id}/getItem`] || {};
            },
            userName () {
                return this.$store.getters[`login/getUserName`];
            },
            storeModel () {
                return this.$store.getters[`${this.widgetId}/${this.id}/model/model`];
            },
            storeFields () {
                return this.$store.getters[`${this.widgetId}/${this.id}/getFields`];
            },
            modelConstraint () {
                const constraint = [];
               if (this.storeModel) {
                   const tags = this.storeModel.tags || [];
                   tags.map(tag => {
                       if (tag.name.indexOf('constraint') !== -1) {
                           constraint.push(tag.value && tag.value.replace(/[«»]/gi, '"'));
                       }
                   });
               }
               return constraint;
            },
            fields () {
                let fieldsArr = [];
                if (this.storeFields.length > 0) {
                    fieldsArr = this.storeFields.filter(item => item.checked);
                } else {
                    fieldsArr = this.storeModel && this.storeModel.fields && this.storeModel.fields.filter(item => (item.type !== 'HIDDEN') && !(item.tags && item.tags.hide))
                        .sort((a, b) => ((a.tags && a.tags.order) && (b.tags && b.tags.order)) ? Number(a.tags.order) - Number(b.tags.order) : a.order - b.order);
                }
                return fieldsArr.map((item) => {
                    item.fieldType = this.getFieldType(item.type);
                    if (!this.actionFound && (item.tags && Boolean(item.tags.action))) {
                        this.actionFound = true;
                        this.$emit('hideSubmitButton');
                    }
                    return item;
                });
            }
        },
        created () {
            this.getModel();
            this.setStoreData();
        },
        methods: {
            setStoreData () {
                const resultData = {};
                if (this.storeFields.length > 0) {
                    this.storeFields.forEach(field => {
                        if (field.valueFrom) {
                            switch (field.valueFrom) {
                                case '_id':
                                case '__entityId':
                                    resultData[field.name] = _.get(this.inputData, 'entityInstancePk.entityInstanceId');
                                    break;
                                case '__entityName':
                                    resultData[field.name] = _.get(this.inputData, 'entityInstancePk.entityName');
                                    break;
                                case '__userId':
                                    resultData[field.name] = this.params.__userId;
                                    break;
                                case '__dateNow':
                                    resultData[field.name] = moment().format();
                                    break;
                                default:
                                    resultData[field.name] = _.get(this.inputData, `object[${field.valueFrom}]`) || this.params[field.valueFrom];
                            }
                        }
                    });
                }
                this.storeData = resultData;
                this.segmentData = Object.assign({}, this.segmentData, this.storeData);
            },
            getFieldData (fieldName) {
               if (!this.item.object) {
                   return;
               }
               return String(this.item.object[fieldName]);
            },
            getModel () {
                if (this.modelName) {
                    this.$store.dispatch(`${this.widgetId}/${this.id}/model/getModel`, this.modelName);
                }
            },
            getItem () {
                if (this.instanceId) {
                    this.$store.dispatch(`${this.widgetId}/${this.id}/loadItem`, {
                        model: this.modelName,
                        id: this.instanceId
                    });
                }
            },
            getFields () {
                return this.$refs.field.map(item => item.getData());
            },
            getModelName () {
                return this.modelName;
            },
            getInstanceId () {
                return this.instanceId;
            },
            getSegmentData () {
                console.log('[StepCardSegment] Getting sregment data');
                const fields = this.$refs.field.map(item => item.getData());
                if (this.storeFields.length > 0) {
                    this.storeFields.forEach(field => {
                        if (!field.checked && (this.storeData[field.name] !== undefined)) {
                            if (field.type === 'DROPDOWN_LINK') {
                                if (typeof this.storeData[field.name] === 'string') {
                                    fields.push({
                                        name: field.name,
                                        value: this.storeData[field.name].split('::')[0],
                                        type: field.type
                                    });
                                } else {
                                    fields.push({
                                        name: field.name,
                                        value: _.get(this.storeData[field.name], 'entityInstancePk.entityInstanceId'),
                                        type: field.type
                                    });
                                }
                            } else {
                                if (typeof this.storeData[field.name] === 'object') {
                                    fields.push({
                                        name: field.name,
                                        value: _.get(this.storeData[field.name], 'entityInstancePk.entityInstanceId'),
                                        type: field.type
                                    });
                                } else {
                                    fields.push({
                                        name: field.name,
                                        value: this.storeData[field.name],
                                        type: field.type
                                    });
                                }
                            }
                        }
                    });
                }
                return {
                    fields,
                    modelName: this.modelName,
                    instanceId: this.instanceId
                };
            },
            download (payload) {
                this.$store.dispatch(`utils/downloadFile`, payload);
            },
            submit (noVerify) {
                this.$emit('submit', noVerify);
            },
            validate () {
                let error = false;
                this.$refs.field.forEach((item) => {
                    const res = item.validate();
                    error = error || res;
                    return true;
                });
                return error;
            },
            onResize () {
                console.dir('[StepCardSegment] onResize!!');
                const divider = Math.floor(this.$el.clientWidth / minColumnWidth);
                if (divider) {
                    this.basis = `${100 / divider}%`;
                }
                console.log(`Divider = ${divider}, basis = ${this.basis}`);
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

    .step-card-segment

        &_noteditable.step-card-segment .card
            background: #ffc;

        .step-card-segment
            &__layout
                align-items center

            &__documentation
                padding: 0px 16px 16px;
                width: 100%
                line-height: 1.4
                font-style italic
                font-size: 100%
                margin -16px 0 0

            &__description
                text-align center

</style>
