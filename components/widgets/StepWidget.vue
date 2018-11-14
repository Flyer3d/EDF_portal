<template>
    <v-card flat class="step-widget">
        <div v-if="documentation" class="step-widget__documentation">
            <v-flex xs12 sm12 md12 class="step-widget__description">
                <span v-html="documentation"></span>
            </v-flex>
        </div>
        <v-expansion-panel v-if="inputSegments && (inputSegments.length > 0)" expand>
            <v-expansion-panel-content v-for="(segmentId, i) in inputSegments" :key="segmentId" @input="panelExpanded">
                <div slot="header">{{stepModel.inEntityModels[i].modelName}}</div>

                <step-card-segment
                        ref="input"
                        :id="segmentId"
                        :widgetId="id"
                        :editable="false"
                        :showModelName="options.showModelName"
                        :key="segmentId"
                />
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-form v-if="outputSegments && (outputSegments.length > 0)">
            <step-card-segment
                    v-for="segmentId in outputSegments"
                    :id="segmentId"
                    :widgetId="id"
                    :editable="true"
                    :showModelName="options.showModelName"
                    :key="segmentId"
                    ref="output"
                    @submit="submit"
                    @hideSubmitButton="hideSubmitButton = true"
            />
            <v-btn
                    v-if="!hideSubmitButton"
                    block
                    @click="submit"
                    :disabled="readOnly"
            >{{gui.submitStep}}
            </v-btn>

        </v-form>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import StepCardSegment from '~/components/widgets/StepCardSegment';
    import Vue from 'vue';

    export default {
        name: 'step-widget',
        components: {
            StepCardSegment
        },
        props: {
            id: {
                required: true,
                type: String
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.stepWidget) || {},
                expansionPanelModel: [],
                hideSubmitButton: false,
                readOnly: false,
                item: {},
                freeze: false,
                $bus: this.storeBus,
                masterWidget: '',
                loading: false,
                statusMsg: ''
            };
        },
        watch: {
            options: {
                handler () {
                    if (this.freeze) return;
                    if (this.masterWidget) {
                        console.log(`\n<---- [StepWidget ${this.id}] Select OFF!!!`);
                        this.$bus.$off('select', this.selectStep);
                        this.masterWidget = '';
                    }
                    this.getData();
                },
                deep: true
            },
            saveStatus (value) {
                if (this.freeze) return;
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
                    this.$store.commit(`${this.id}/unregisterSegments`);
                    this.item = {};
                    this.getList();

                    this.$bus.$emit('refresh_all');
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
            },
            modelLoadStatus (value) {
                if (this.freeze) return;
                if (value === 'SUCCESS') {
                    this.freeze = true;
                    if (this.stepModel.inEntityModels && this.stepModel.inEntityModels.length > 0) {
                        this.stepModel.inEntityModels.forEach(item => {
                            console.log('[inEntitySegment] create!');
                            console.dir(item);
                            this.$store.commit(`${this.id}/createSegment`, {
                                type: 'INPUT',
                                modelName: item.modelName,
                                instanceId: item.instanceId
                            });
                        });
                    }
                    if (this.stepModel.outEntityModels && this.stepModel.outEntityModels.length > 0) {
                        this.stepModel.outEntityModels.forEach(item => {
                            console.log('[outEntitySegment] create!');
                            console.dir(item);
                            this.$store.commit(`${this.id}/createSegment`, {
                                type: 'OUTPUT',
                                modelName: item.modelName,
                                instanceId: item.instanceId
                            });
                        });
                    }
                    Vue.nextTick(() => {
                        this.freeze = false;
                        this.onResize();
                    });
                }
            },
            listLoadStatus (val) {
                if (val === 'LOADED') {
                    const type = _.get(this.options, 'dataSource.type', '');
                    if (type === 'firstElem') {
                        this.getFirst();
                    } else if (type === 'lastElem') {
                        this.getLast();
                    }
                }
            }
        },
        computed: {
            userName () {
                return this.$store.getters[`login/getUserName`];
            },
            roles () {
                return this.$store.getters[`login/getRoles`];
            },
            listLoadStatus () {
                return this.$store.getters[`${this.id}/listLoadStatus`];
            },
            stepList () {
                return this.$store.getters[`${this.id}/getList`];
            },
            inputSegments () {
                return this.$store.getters[`${this.id}/getInputWidgetSegments`];
            },
            outputSegments () {
                return this.$store.getters[`${this.id}/getOutputWidgetSegments`];
            },
            storeId () {
                return this.$store.getters[`${this.id}/getId`];
            },
            error () {
                return this.$store.getters[`${this.id}/getError`];
            },
            modelLoadStatus () {
                return this.$store.getters[`${this.id}/model/stepModelLoadStatus`];
            },
            modelName () {
                return this.$store.getters[`${this.id}/getModelName`];
            },
            stepModel () {
                return this.$store.getters[`${this.id}/model/stepModel`];
            },
            saveStatus () {
                return this.$store.getters[`${this.id}/dataSaveStatus`];
            },
            storeBus () {
                return this.$store.getters[`${this.id}/getBus`];
            },
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            },
            fields () {
                return this.options.fields || [];
            },
            documentation () {
                const documentation = this.stepModel.activityDocumentation;
                const stepModel = this.stepModel;
                const userName = this.userName;
                const roles = JSON.stringify(this.roles || []);
                if (documentation && documentation.length > 0) {
                    const newDoc = documentation.map(doc => {
                        return doc.replace(/{{.*?}}/g, function (str) {
                            if (str === '{{pool_name}}') {
                                return encodeURIComponent(stepModel.poolModelName || '');
                            } else if (str === '{{process_step_name}}') {
                                return encodeURIComponent(stepModel.activityModelName || '');
                            } else if (str === '{{process_step_id}}') {
                                return Number(stepModel.stepId || '');
                            } else if (str === '{{process_id}}') {
                                return Number(stepModel.processId || '');
                            } else if (str === '{{username}}') {
                                return encodeURIComponent(userName || '');
                            } else if (str === '{{roles}}') {
                                return encodeURIComponent(roles || '');
                            }
                            return str;
                        });
                    });
                    return newDoc.join('<br>');
                }
                return '';
            }
        },
        mounted () {
            this.$bus = this.storeBus;
            this.$bus.$on('refresh_all', this.getData);
            this.getData();
            this.onResize();
        },
        beforeDestroy () {
            this.$bus && this.$bus.$off('refresh_all', this.getData);
            if (this.masterWidget) {
                this.$bus && this.$bus.$off('select', this.selectStep);
            }
        },
        methods: {
            getFirst () {
                const item = _.first(this.stepList);
                this.getStep(item && item.object);
            },
            getLast () {
                const item = _.last(this.stepList);
                this.getStep(item && item.object);
            },
            submit (noVerify) {
                if (!noVerify) {
                    let error = false;
                    this.$refs.output && this.$refs.output.forEach(item => {
                        error = error || item.validate();
                    });
                    if (error) {
                        this.$root.$emit('say', {
                            type: 'error',
                            msg: this.gui.validatingError,
                            timeout: 6000
                        });
                        return;
                    }
                }
                const segments = (this.$refs.output && this.$refs.output.map(item => item.getSegmentData()));
                this.$store.dispatch(`${this.id}/submitStep`, {
                    activityTypeId: this.item.activityTypeId,
                    adapterTaskId: this.item.adapterTaskId,
                    segments
                });
            },
            getData () {
                if (!(this.options.dataSource && this.options.dataSource.type)) {
                    return;
                }
                switch (this.options.dataSource.type) {
                    case 'listElem':
                        this.getStep(this.options.dataSource.item);
                        break;
                    case 'widgetClassElem':
                        if (!this.masterWidget && this.options.dataSource.masterWidget) {
                            this.$bus.$on('select', this.selectStep);
                        }
                        this.masterWidget = this.options.dataSource.masterWidget;
                        this.$store.commit(`${this.id}/unregisterSegments`);
                        break;
                    case 'firstElem':
                    case 'lastElem':
                    default:
                        this.getList();
                }
            },

            getStep (object) {
                this.hideSubmitButton = false;
                // this.storeUpdate = true;
                this.freeze = true;
                this.$store.commit(`${this.id}/unregisterSegments`);
                this.$nextTick(() => {
                    this.freeze = false;
                });
                if (object) {
                    this.readOnly = Boolean(object.endTime);
                    this.item = Object.assign({}, object);
                    this.$store.dispatch(`${this.id}/model/getStepModel`, {
                        stepId: object.pk,
                        processId: object.processPk,
                        flowNodeId: object.flowNodePk
                    });
                }
            },
            selectStep (obj) {
                console.log(`[StepWidget] Item selected! (incomingWidget = ${obj.widgetId}, masterWidget = ${this.options.dataSource.masterWidget})`);
                if (obj.widgetId === this.masterWidget && obj.modelName === this.modelName) {
                    obj.item && this.getStep(obj.item.object);
                    return true;
                } else {
                    return false;
                }
            },
            getList () {
                this.$store.dispatch(`${this.id}/loadStepList`, {
                    model: this.modelName,
                    pageNumber: 1,
                    pageSize: 999,
                    orderBy: this.options.orderBy,
                    query: this.options.query
                });
            },
            saveEntity () {
                console.log('[saveEntity] Saving step data');
                const segments = (this.$refs.output && this.$refs.output.map(item => item.getSegmentData()));
                console.dir(segments);
                this.$store.dispatch(`${this.id}/saveStepData`, {
                    segments
                });
            },
            onResize () {
                this.$refs.input && this.$refs.input.forEach(item => item.onResize());
                this.$refs.output && this.$refs.output.forEach(item => item.onResize());
            },
            panelExpanded (val) {
                if (val) {
                    setTimeout(() => {
                        this.onResize();
                    }, 200);
                }
            }
        }

    };
</script>

<style lang="stylus">

    .step-widget
        .step-widget
            &__documentation
                padding 16px
                width 100%
                background-color: #ffc;
                line-height: 1.4;

        .v-expansion-panel__header
            background-color #ffc

</style>
