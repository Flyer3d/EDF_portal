<template>
    <v-card flat class="auto-step-block" v-if="saveStatus !== 'IN_PROGRESS'">
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
            <v-form>
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
                                        :editable="!field.valueFrom"
                                        :inputData.sync="storeData[field.name]"
                                        :allData="storeData"
                                        :key="field.name"
                                        @download="download"
                                        @submit="submit"
                                ></component>
                            </v-flex>
                        </template>
                    </v-layout>
                    <v-btn
                            v-if="!actionFound && !inline"
                            block
                            @click="submit"
                    >{{gui.submitStep}}
                    </v-btn>
                </v-container>
            </v-form>
        </v-card-text>

    </v-card>
    <div class="card__spinner-wrapper" v-else>
        <v-progress-circular indeterminate :width="2" :size="150" color="primary"
                             class="card__spinner"></v-progress-circular>
    </div>
</template>

<script>
    import evaluator from '~/utils/toStringEvaluator';
    import BlockFieldMixin from '~/mixins/common/BlockFieldMixin';
    import {mapGetters, mapActions} from 'vuex';
    import moment from 'moment';
    import _ from 'lodash';

    const minColumnWidth = process.env.minColumnWidth;

    export default {
        name: 'mono-step-block',
        mixins: [BlockFieldMixin],
        props: {
            data: {
                type: Object,
                required: true
            },
            params: {
                type: Object
            },
            inline: {
                type: Boolean,
                default: false
            },
            inlineData: {
                type: Object
            }
        },
        data: () => ({
            gui: (process.env.gui && process.env.gui.monoStepBlock) || {},
            basis: '100%',
            actionFound: false,
            widgetWidth: 0,
            storeData: {},
            inputData: {},
            segmentData: {},
            statements: [],
            hiddenFields: []
        }),
        created () {
            this.setStoreData();
            this.setConstraint();
        },
        mounted () {
            this.onResize();
        },
        beforeDestroy () {
        },
        watch: {
            data: {
                handler () {
                    this.setStoreData();
                    this.setConstraint();
                    this.onResize();
                },
                deep: true
            },
            inputData () {
                this.setStoreData();
            },
            storeData: {
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
            saveStatus (value) {
                if (value === 'SAVING') {
                    this.loading = true;
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.msg.terminatingStep,
                        timeout: 6000
                    });
                } else if (value === 'SUCCESS') {
                    this.loading = false;
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.msg.stepSuccess,
                        timeout: 6000
                    });
                    this.item = {};
                    if (!this.inline) {
                        this.gotoPage(this.data.url, this.data.externalUrl);
                    }
                    this.$emit('submit');
                    this.setStoreData();
                } else if (value === 'ERROR') {
                    this.loading = false;
                    const error = _.get(this.error, 'response.data.message');
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.msg.stepError} ${error}`,
                        timeout: 20000
                    });
                } else {
                }
            }
        },
        computed: {
            ...mapGetters({
                saveStatus: 'action/stepStatus'
            }),
            isEmpty () {
                return _.isEmpty(this.item);
            },
            showModelName () {
                return this.data.showModelName;
            },
            modelName () {
                return this.data.processModelName;
            },
            constraint () {
                return this.data.constraint;
            },
            documentation () {
                if (this.data.documentation && this.data.documentation.length > 0) {
                    const doc = this.data.documentation;
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
            fields () {
                let fieldsArr = [];
                if (this.data && this.data.fields && this.data.fields.length > 0) {
                    fieldsArr = this.data.fields.filter(item => item.checked);
                }
                return fieldsArr.map((item) => {
                    item.fieldType = this.getFieldType(item.type);
                    if (!this.actionFound && (item.tags && Boolean(item.tags.action))) {
                        this.actionFound = true;
                        this.$nextTick(() => {
                            this.$emit('hideSubmitButton');
                        });
                    }
                    return item;
                });
            }
        },
        methods: {
            ...mapActions({
                downloadFile: 'utils/downloadFile',
                saveMonoStepData: 'action/takeStep'
            }),
            getData () {
                const fields = this.$refs.field.map(item => item.getData());
                if (this.data.fields.length > 0) {
                    this.data.fields.forEach(field => {
                        if (!field.checked && (this.storeData[field.name] !== undefined)) {
                            fields.push({
                                name: field.name,
                                value: this.storeData[field.name],
                                type: field.type
                            });
                        }
                    });
                }
                return {
                    fields,
                    modelName: this.modelName,
                    instanceId: this.instanceId
                };
            },
            setStoreData () {
                const resultData = {};
                if (this.data.fields.length > 0) {
                    this.data.fields.forEach(field => {
                        if (field.valueFrom) {
                            switch (field.valueFrom) {
                                case '_id':
                                    resultData[field.name] = this.params._id;
                                    break;
                                case '__entityId':
                                    resultData[field.name] = this.params.__entityId;
                                    break;
                                case '__entityName':
                                    resultData[field.name] = this.params.__entityName;
                                    break;
                                case '__userId':
                                    resultData[field.name] = this.params.__userId;
                                    break;
                                case '__dateNow':
                                    resultData[field.name] = moment().format();
                                    break;
                                default:
                                    resultData[field.name] = _.get(this.params, `object[${field.valueFrom}]`) || this.params[field.valueFrom];
                            }
                        }
                    });
                }
                this.storeData = resultData;
                this.segmentData = Object.assign({}, this.segmentData);
            },
            setConstraint () {
                if (this.constraint.length > 0) {
                    console.log('[MonoStepBlock/setConstraint] Constraint found!');
                    console.dir(this.constraint);
                    console.log('[MonoStepBlock/setConstraint] Fields data:');
                    console.dir(this.storeData);
                    this.constraint.map(constraint => {
                        try {
                            const statement = evaluator.parseStatement(constraint);
                            this.statements.push(statement);
                        } catch (err) {
                            console.error('[MonoStepBlock/setConstraint] Error parsing constraint:');
                            console.error(constraint);
                            console.dir(err);
                        }
                    });
                    console.log('[MonoStepBlock/setConstraint] Statements:');
                    console.dir(this.statements);
                }
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
                console.dir('[MonoStepBlock] onResize!!');
                const divider = Math.floor(this.$el.clientWidth / minColumnWidth);
                if (divider) {
                    this.basis = `${100 / divider}%`;
                }
                console.log(`Divider = ${divider}, basis = ${this.basis}`);
            },
            fieldStyle (field) {
                const type = field.fieldType;
                if (type === 'block-text-area-field' || type === 'block-html-field' ||
                    (type === 'block-checkbox-field' && field.tags && field.tags.action)) {
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
            },
            download (payload) {
                this.downloadFile(payload);
            },
            submit (noVerify) {
                if (!noVerify) {
                    if (this.validate()) {
                        this.$root.$emit('say', {
                            type: 'error',
                            msg: this.gui.validatingError,
                            timeout: 6000
                        });
                        return;
                    }
                }
                const fields = this.$refs.field.map(item => item.getData());
                if (this.data.fields.length > 0) {
                    this.data.fields.forEach(field => {
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
                this.saveMonoStepData({
                    fields,
                    entityName: this.data.processModelName,
                    processId: this.data.processId
                });
            },
            gotoPage (url, externalUrl) {
                console.log(`[gotoPage] Going to page ${url}`);
                this.$root.$emit('gotoPage', { url, externalUrl });
            }
        }
    };
</script>

<style lang="stylus">
    .card

        &__spinner-wrapper
            width: 100%;
            min-height 200px;
            position relative;

        &__spinner
            position absolute
            top calc( 50% - 75px )
            left calc( 50% - 75px )
            opacity: 0.5


</style>
