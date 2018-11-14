<template>
    <v-card v-if="loaded" class="create-project-card" style="position: relative;">
        <v-icon style="top: 30px; right: 30px; position: absolute;" large @click="$emit('close')">close</v-icon>
        <v-form ref="form" v-model="valid" lazy-validation>
            <v-card-text class="create-project-card__body">
                <v-container grid-list-xl flat>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <h1 class="my-4">Application<br>for project publication</h1>
                        </v-flex>
                        <v-flex xs12>
                            <component
                                    :is="fields['Название'].fieldType"
                                    label="Project Name"
                                    ref="Название"
                                    :field="fields['Название']"
                                    :inputData.sync="formData['Название']"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->
                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Страна'].fieldType"
                                    label="Country"
                                    placeholder="Choose one"
                                    ref="Страна"
                                    :field="fields['Страна']"
                                    :inputData.sync="formData['Страна']"
                                    :allData="formData"
                            ></component>
                        </v-flex>
                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Регион'].fieldType"
                                    label="Region"
                                    placeholder="Choose one"
                                    ref="Регион"
                                    :field="fields['Регион']"
                                    :inputData.sync="formData['Регион']"
                                    :allData="formData"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->
                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Отрасль'].fieldType"
                                    label="Industry"
                                    placeholder="Choose one"
                                    ref="Отрасль"
                                    :field="fields['Отрасль']"
                                    :inputData.sync="formData['Отрасль']"
                                    :allData="formData"
                            ></component>
                        </v-flex>
                        <v-flex lg6 xs12 class="d-flex" align-end>
                            <component
                                    :is="fields['ГЧП'].fieldType"
                                    label="Public Private Partnership"
                                    ref="ГЧП"
                                    :field="fields['ГЧП']"
                                    :inputData.sync="formData['ГЧП']"
                                    :allData="formData"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->
                        <v-flex xs12>
                            <component
                                    :is="fields['Стадии проекта'].fieldType"
                                    label="Project Stage"
                                    ref="Стадии проекта"
                                    type="stepper"
                                    stepper
                                    :field="fields['Стадии проекта']"
                                    :inputData.sync="formData['Стадии проекта']"
                                    :allData="formData"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->

                        <v-flex xs12>
                            <component
                                    :is="fields['Краткое описание'].fieldType"
                                    label="Project Description"
                                    ref="Краткое описание"
                                    :field="fields['Краткое описание']"
                                    :inputData.sync="formData['Краткое описание']"
                                    :allData="formData"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->

                        <v-flex xs12><h3 class="text-xs-left">Upload Documents</h3></v-flex>
                        <div class="create-project-card__divider mt-2"></div>
                        <!-- ********************* -->
                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Презентация проекта'].fieldType"
                                    label="Project presentation (.pdf, .pptx)"
                                    ref="Презентация проекта"
                                    :field="fields['Презентация проекта']"
                                    :inputData.sync="formData['Презентация проекта']"
                            ></component>
                        </v-flex>
                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Финансовая модель'].fieldType"
                                    label="Business plan (.pdf, .pptx)"
                                    ref="Финансовая модель"
                                    :field="fields['Финансовая модель']"
                                    :inputData.sync="formData['Финансовая модель']"
                            ></component>
                        </v-flex>
                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Проектная документация'].fieldType"
                                    label="Project documentation (.pdf, .pptx)"
                                    ref="Проектная документация"
                                    :field="fields['Проектная документация']"
                                    :inputData.sync="formData['Проектная документация']"
                            ></component>
                        </v-flex>

                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Разрешения и лицензии'].fieldType"
                                    label="Promites and aprovals (.pdf, .pptx)"
                                    ref="Разрешения и лицензии"
                                    :field="fields['Разрешения и лицензии']"
                                    :inputData.sync="formData['Разрешения и лицензии']"
                            ></component>
                        </v-flex>
                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Документ DD'].fieldType"
                                    label="Due diligence (.pdf, .pptx)"
                                    ref="Документ DD"
                                    :field="fields['Документ DD']"
                                    :inputData.sync="formData['Документ DD']"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->
                        <v-flex xs12><h3 class="text-xs-left">Main Parameters</h3></v-flex>
                        <div class="create-project-card__divider mt-2"></div>
                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['Стоимость проекта (USD)'].fieldType"
                                    label="Project Cost (USD)"
                                    suffix="$"
                                    ref="Стоимость проекта (USD)"
                                    :field="fields['Стоимость проекта (USD)']"
                                    :inputData.sync="formData['Стоимость проекта (USD)']"
                            ></component>
                        </v-flex>
                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['Собственный капитал (%)'].fieldType"
                                    label="Equity (%)"
                                    suffix="%"
                                    ref="Собственный капитал (%)"
                                    :field="fields['Собственный капитал (%)']"
                                    :inputData.sync="formData['Собственный капитал (%)']"
                            ></component>
                        </v-flex>
                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['Capital Required (USD)'].fieldType"
                                    label="Capital Required (USD)"
                                    suffix="$"
                                    ref="Capital Required (USD)"
                                    :field="fields['Capital Required (USD)']"
                                    :inputData.sync="formData['Capital Required (USD)']"
                            ></component>
                        </v-flex>
                        <v-flex xs12>
                            <v-divider></v-divider>
                        </v-flex>

                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['DD'].fieldType"
                                    label="Due Diligence"
                                    ref="DD"
                                    :field="fields['DD']"
                                    :inputData.sync="formData['DD']"
                            ></component>
                        </v-flex>
                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['Дата экспертизы'].fieldType"
                                    :disabled="!formData['DD']"
                                    label="Expertise Date"
                                    ref="Дата экспертизы"
                                    :field="fields['Дата экспертизы']"
                                    :inputData.sync="formData['Дата экспертизы']"
                            ></component>
                        </v-flex>
                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['Эксперт'].fieldType"
                                    :disabled="!formData['DD']"
                                    label="Expert Name"
                                    ref="Эксперт"
                                    :field="fields['Эксперт']"
                                    :inputData.sync="formData['Эксперт']"
                            ></component>
                        </v-flex>
                        <v-flex xs12>
                            <v-divider></v-divider>
                        </v-flex>
                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['NPV (USD)'].fieldType"
                                    label="NPV (USD)"
                                    suffix="$"
                                    tooltip="Net Present Value"
                                    ref="NPV (USD)"
                                    :field="fields['NPV (USD)']"
                                    :inputData.sync="formData['NPV (USD)']"
                            ></component>
                        </v-flex>
                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['IRR (%)'].fieldType"
                                    label="IRR (%)"
                                    suffix="%"
                                    tooltip="Internal Rate of Return"
                                    ref="IRR (%)"
                                    :field="fields['IRR (%)']"
                                    :inputData.sync="formData['IRR (%)']"
                            ></component>
                        </v-flex>
                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['PBP (мес)'].fieldType"
                                    label="PBP (mo)"
                                    suffix="mo"
                                    tooltip="Payback Period"
                                    ref="PBP (мес)"
                                    :field="fields['PBP (мес)']"
                                    :inputData.sync="formData['PBP (мес)']"
                            ></component>
                        </v-flex>
                        <v-flex lg4 xs12>
                            <component
                                    :is="fields['Срок реализации проекта (мес)'].fieldType"
                                    label="Project Timeframe (mo)"
                                    suffix="mo"
                                    ref="Срок реализации проекта (мес)"
                                    suffics="mo"
                                    :field="fields['Срок реализации проекта (мес)']"
                                    :inputData.sync="formData['Срок реализации проекта (мес)']"
                            ></component>
                        </v-flex>
                        <v-flex xs12>
                            <v-divider></v-divider>
                        </v-flex>

                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Место проведения работ'].fieldType"
                                    label="Project Location"
                                    ref="Место проведения работ"
                                    :field="fields['Место проведения работ']"
                                    :inputData.sync="formData['Место проведения работ']"
                            ></component>
                        </v-flex>
                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Точка на карте'].fieldType"
                                    label="A Point on the Map"
                                    ref="Точка на карте"
                                    placeholder="Paste coordinates here"
                                    :field="fields['Точка на карте']"
                                    :inputData.sync="formData['Точка на карте']"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->

                        <v-flex xs12 class="mt-4">
                            <v-btn large round dark @click.native="submit">
                                Send an Application
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
        </v-form>


    </v-card>
</template>

<script>
    import MonoStepMixin from '~/mixins/common/MonoStepMixin';
    import {mapGetters} from 'vuex';

    const modelName = 'Заявка на публикацию проекта';
    const processName = 'Подать заявку на публикацию проекта';
    const defaultFormData = {
        'Название': '',
        'Страна': null,
        'Регион': null,
        'Отрасль': null,
        'ГЧП': false,
        'Стадии проекта': '',
        'Краткое описание': '',
        'Презентация проекта': '',
        'Проектная документация': '',
        'Документ DD': '',
        'Финансовая модель': '',
        'Разрешения и лицензии': '',
        'Стоимость проекта (USD)': '',
        'Собственный капитал (%)': '',
        'Capital Required (USD)': '',
        'DD': false,
        'Дата экспертизы': null,
        'Эксперт': '',
        'NPV (USD)': '',
        'IRR (%)': '',
        'PBP (мес)': '',
        'Срок реализации проекта (мес)': '',
        'Место проведения работ': '',
        'Точка на карте': '',
        'Автор заявки': '',
        'user_id': ''
    };

    export default {
        name: 'create-project-card',
        mixins: [MonoStepMixin],
        data: () => ({
            bgImageSrc: `${process.env.base}/img/company/companyAccBg.svg`,
            modelName,
            processName,
            formData: Object.assign({}, defaultFormData)
        }),
        created () {
           this.getModel();
        },
        computed: {
            ...mapGetters({
                currentUserId: 'login/getUserId'
            })
        },
        methods: {
            onSuccess () {
                this.$router.push('/createProjectSuccess');
                this.$emit('close');
            },

            submit () {
                if (this.validate()) {
                    this.$root.$emit('say', {
                        type: 'error',
                        msg: this.gui.validatingError,
                        timeout: 6000
                    });
                    return;
                }
                const fields = this.getFields();
                fields.push({name: 'user_id', value: this.currentUserId, type: 'TEXT_FIELD'});
                console.log('[submit] Submitting monostep data');
                console.dir({
                    fields,
                    entityName: this.modelName,
                    processName: this.processName
                });
                this.saveMonoStepData({
                    fields,
                    entityName: this.modelName,
                    processName: this.processName
                });
            }
        }
    };
</script>

<style lang="stylus">
    .create-project-card
        background-color #ffffff
        position rellative
        max-width 100%
        width 100%
        height 100%
        padding 0

        .create-project-card
            &__logo
                position absolute
                top 50px
                left 80px

            &__header
                padding 72px 128px
                text-align center
                color white

            &__body
                padding 56px 128px 96px
                text-align center
                color #524f5f

            &__divider
                width calc(100% + 256px)
                opacity: 0.22;
                position: relative;
                &:before
                    display: block;
                    content: ' ';
                    position: absolute;
                    left: -116px;
                    top: 0;
                    width: calc(100% + 232px);
                    border-bottom: 1px solid #4a4757;
                &.dark
                    margin-left -128px
                    border: solid 1px #ffffff;

            &__files-block
                border solid 1px #d7d7da
                width 100%
                height 100%
                padding 16px 16px 24px
                position relative

                &:before
                    display block
                    font-family: Rubik;
                    font-size: 20px;
                    font-weight: 500;
                    content: '*'
                    color: #ff0000
                    position: absolute;
                    top 0
                    left -20px

</style>
