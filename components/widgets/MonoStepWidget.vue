<template>
    <v-card flat class="step-widget" v-if="dataAviable">
        <div v-if="documentation" class="step-widget__documentation">
            <v-flex xs12 sm12 md12 class="step-widget__description">
                <span v-html="documentation"></span>
            </v-flex>
        </div>
        <v-expansion-panel v-if="inputSegments && (inputSegments.length > 0)" expand>
            <v-expansion-panel-content v-for="(segmentId, i) in inputSegments" :key="segmentId" lazy
                                       @input="panelExpanded">
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
                    :inputData="inputData"
                    :params="params"
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

    export default {
        name: 'auto-step-widget',
        components: {
            StepCardSegment
        },
        props: {
            id: {
                required: true,
                type: String
            },
            params: {
                type: Object
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.autoStepWidget) || {},
                $bus: this.storeBus,
                inputData: {},
                hideSubmitButton: false,
                readOnly: false,
                item: {},
                freeze: false,
                loading: false
            };
        },
        watch: {
            options: {
                handler () {
                    this.$bus.$off('select', this.selectItem);
                    this.setMasterWidget();
                    if (this.freeze) return;
                    this.inputData = {};
                    this.createForm();
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
                    this.createForm();
                    this.gotoPage(this.options.url, this.options.externalUrl);
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
            dataAviable () {
                if (this.options.widgetLink) {
                    return !_.isEmpty(this.inputData);
                }
                return true;
            },
            userName () {
                return this.$store.getters[`login/getUserName`];
            },
            roles () {
                return this.$store.getters[`login/getRoles`];
            },
            storeBus () {
                return this.$store.getters[`${this.id}/getBus`];
            },
            actionStatus () {
                return this.$store.getters[`${this.id}/actionStatus`];
            },
            dataLoadStatus () {
                return this.$store.getters[`${this.id}/dataLoadStatus`];
            },
            actionData () {
                return this.$store.getters[`${this.id}/actionData`];
            },
            inputSegments () {
                return this.$store.getters[`${this.id}/getInputWidgetSegments`];
            },
            outputSegments () {
                return this.$store.getters[`${this.id}/getOutputWidgetSegments`];
            },
            data () {
                return this.$store.getters[`${this.id}/getItem`];
            },
            error () {
                return this.$store.getters[`${this.id}/getError`];
            },
            modelLoadStatus () {
                return this.$store.getters[`${this.id}/model/stepModelLoadStatus`];
            },
            stepModel () {
                return this.options.documentation;
            },
            saveStatus () {
                return this.$store.getters[`${this.id}/dataSaveStatus`];
            },
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            },
            fields () {
                return this.options.fields || [];
            },
            documentation () {
                if (this.stepModel) {
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
                }
                return '';
            }
        },

        mounted () {
            this.$bus = this.storeBus;
            this.setMasterWidget();
            this.createForm();
            this.onResize();
        },
        beforeDestroy () {
            this.$bus && this.$bus.$off('select', this.selectItem);
        },
        methods: {
            createForm () {
                console.dir('[MonoStepWidget] createForm!!');
                if (this.options.fields && this.options.fields.length > 0) {
                    this.freeze = true;
                    this.$store.commit(`${this.id}/unregisterSegments`);
                    console.log(`[MonoStepWidget/createForm] Creating form!`);
                    console.dir(this.options.fields);
                    this.$store.commit(`${this.id}/createSegment`, {
                        type: 'OUTPUT',
                        modelName: this.options.processModelName,
                        fields: this.options.fields
                    });
                }
                this.$nextTick(() => {
                    this.freeze = false;
                    setTimeout(() => this.onResize(), 200);
                });
            },
            setMasterWidget () {
                if (this.options.widgetLink) {
                    this.$bus.$on('select', this.selectItem);
                }
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
                const segments = (this.$refs.output && this.$refs.output.map(item => item.getSegmentData())) || [];
                const fields = (segments[0] && segments[0].fields) || {};
                this.$store.dispatch(`${this.id}/saveMonoStepData`, {
                    fields,
                    entityName: this.options.processModelName,
                    processId: this.options.processId
                });
            },
            selectItem (obj) {
                console.log(`[MonoStepWidget] Item selected! (incomingWidget = ${obj.widgetId}, masterWidget = ${this.options.dataSource.masterWidget})`);
                console.dir(obj);
                if (this.options.dataSource && (obj.widgetId === this.options.dataSource.masterWidget && obj.modelName === this.options.dataSource.modelName)) {
                    console.log(`[MonoStepWidget] OUR WIDGET!!!`);
                    this.inputData = obj.item;
                    setTimeout(() => this.onResize(), 500);
                }
            },
            onResize () {
                console.dir('[MonoStepWidget] onResize!!');
                this.$refs.input && this.$refs.input.forEach(item => item.onResize());
                this.$refs.output && this.$refs.output.forEach(item => item.onResize());
            },
            panelExpanded (val) {
                if (val) {
                    setTimeout(() => {
                        this.onResize();
                    }, 200);
                }
            },
            gotoPage (url, externalUrl) {
                console.log(`[MonoStepWidget/gotoPage] Going to page ${url}`);
                this.$root.$emit('gotoPage', { url, externalUrl });
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

        .expansion-panel__header
            background-color #ffc

</style>
