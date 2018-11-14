<template>
    <v-container  grid-list-xl flat class="accreditation-form">
        <v-btn
                small
                round
                outline
                color="black"
                nuxt
                to="/"
                class="accreditation-form__back-btn"
        >
            <v-icon>keyboard_arrow_left</v-icon>Back
        </v-btn>
        <v-layout align-center column v-if="loaded">
            <v-flex>
                <v-card style="width: 912px;">
                    <v-form  ref="form" v-model="valid" lazy-validation>
                        <v-img :src="bgImageSrc" :height="560" :width="912" class="accreditation-form__header">
                        <v-layout column>
                            <div class="text__label">Application for Accreditation</div>
                            <h1 class="mt-4 dark">Investor</h1>
                            <h3 class="mt-5 text-xs-left dark">Organization Name</h3>
                            <div class="accreditation-form__divider dark mt-2"></div>
                            <v-flex class="mt-4">
                                <component
                                        :is="fields['Название'].fieldType"
                                        label="Name of Organization in English"
                                        ref="Название"
                                        dark
                                        :field="fields['Название']"
                                        :inputData.sync="formData['Название']"
                                ></component>
                            </v-flex>
                            <v-flex class="mt-4">
                                <component
                                        :is="fields['Название на локальном языке'].fieldType"
                                        label="Full Name of Organization in the Local Language"
                                        ref="Название на локальном языке"
                                        dark
                                        :field="fields['Название на локальном языке']"
                                        :inputData.sync="formData['Название на локальном языке']"
                                ></component>
                            </v-flex>
                        </v-layout>

                    </v-img>
                        <v-card-text class="accreditation-form__body">
                            <v-layout row wrap>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Тип инвестора'].fieldType"
                                            label="Investor Type"
                                            ref="Тип инвестора"
                                            placeholder="Choose one"
                                            :field="fields['Тип инвестора']"
                                            :inputData.sync="formData['Тип инвестора']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12></v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Вид собственности'].fieldType"
                                            label="Type of ownership"
                                            ref="Вид собственности"
                                            placeholder="Choose one"
                                            :field="fields['Вид собственности']"
                                            :inputData.sync="formData['Вид собственности']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['ИНН'].fieldType"
                                            label="Taxpayer TIN"
                                            ref="ИНН"
                                            :field="fields['ИНН']"
                                            :inputData.sync="formData['ИНН']"
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
                                            :is="fields['География деятельности (страна)'].fieldType"
                                            label="Branches and Representative Offices (Country)"
                                            placeholder="Choose one or more"
                                            ref="География деятельности (страна)"
                                            :field="fields['География деятельности (страна)']"
                                            :inputData.sync="formData['География деятельности (страна)']"
                                            :allData="formData"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['География деятельности (регион)'].fieldType"
                                            label="Branches and Representative Offices (Region)"
                                            placeholder="Choose one or more"
                                            ref="География деятельности (регион)"
                                            :field="fields['География деятельности (регион)']"
                                            :inputData.sync="formData['География деятельности (регион)']"
                                            :allData="formData"
                                    ></component>
                                </v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Организация является дочерней'].fieldType"
                                            label="The Company is a Subsidiary"
                                            ref="Организация является дочерней"
                                            :field="fields['Организация является дочерней']"
                                            :inputData.sync="formData['Организация является дочерней']"
                                    ></component>
                                    <v-template v-if="formData['Организация является дочерней']">
                                        <component
                                                :is="fields['Головная компания'].fieldType"
                                                label="Head Company"
                                                ref="Головная компания"
                                                :field="fields['Головная компания']"
                                                :inputData.sync="formData['Головная компания']"
                                                :allData="formData"
                                        ></component>
                                    </v-template>
                                </v-flex>
                                <v-flex lg6 xs12></v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <div class="form__label text-xs-left mb-2">Key Products</div>

                                    <component
                                            :is="fields['Кредитование'].fieldType"
                                            label="Crediting"
                                            ref="Кредитование"
                                            :field="fields['Кредитование']"
                                            :inputData.sync="formData['Кредитование']"
                                    ></component>
                                    <component
                                            :is="fields['Торговое финансирование'].fieldType"
                                            label="Trade Financing"
                                            ref="Торговое финансирование"
                                            :field="fields['Торговое финансирование']"
                                            :inputData.sync="formData['Торговое финансирование']"
                                    ></component>
                                    <component
                                            :is="fields['Инвестиционное и проектное финансирование'].fieldType"
                                            label="Investment and Project Financing"
                                            ref="Инвестиционное и проектное финансирование"
                                            :field="fields['Инвестиционное и проектное финансирование']"
                                            :inputData.sync="formData['Инвестиционное и проектное финансирование']"
                                    ></component>
                                    <component
                                            :is="fields['Банковские гарантии'].fieldType"
                                            label="Bank Guarantees"
                                            ref="Банковские гарантии"
                                            :field="fields['Банковские гарантии']"
                                            :inputData.sync="formData['Банковские гарантии']"
                                    ></component>
                                    <component
                                            :is="fields['Факторинг'].fieldType"
                                            label="Factoring"
                                            ref="Факторинг"
                                            :field="fields['Факторинг']"
                                            :inputData.sync="formData['Факторинг']"
                                    ></component>
                                    <component
                                            :is="fields['Лизинг'].fieldType"
                                            label="Leasing"
                                            ref="Лизинг"
                                            :field="fields['Лизинг']"
                                            :inputData.sync="formData['Лизинг']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Приоритетные отрасли финансирования'].fieldType"
                                            label="Financing Industries"
                                            placeholder="Choose one or more"
                                            ref="Приоритетные отрасли финансирования"
                                            :field="fields['Приоритетные отрасли финансирования']"
                                            :inputData.sync="formData['Приоритетные отрасли финансирования']"
                                    ></component>
                                </v-flex>
                                <v-flex xs12>

                                    <component
                                            :is="fields['Краткое описание'].fieldType"
                                            label="Information About the Company "
                                            ref="Краткое описание"
                                            :field="fields['Краткое описание']"
                                            :inputData.sync="formData['Краткое описание']"
                                    ></component>
                                </v-flex>
                                <!--*********************-->
                                <v-flex xs12>
                                    <component
                                            is="block-image-field"
                                            label="Upload logo"
                                            ref="Логотип"
                                            :field="fields['Логотип']"
                                            :inputData.sync="formData['Логотип']"
                                            :allData="formData"
                                    ></component>
                                </v-flex>
                                <!--*********************-->
                                <v-flex xs12>
                                    <v-container  class="accreditation-form__files-block">
                                        <v-layout align-center>
                                            <v-flex xs6 class="text-xs-left">
                                                <h3>Balance</h3>
                                            </v-flex>
                                            <v-flex xs6 class="text-xs-left">
                                                <h3>Profit and Losses Report</h3>
                                            </v-flex>
                                        </v-layout>
                                        <v-divider class="v-divider--extend"></v-divider>
                                        <v-layout row wrap>
                                            <v-flex xs6>
                                                <v-layout align-center>
                                                    <v-flex xs6>
                                                        <v-layout align-center>
                                                            <v-flex style="flex: 0">
                                                                <v-progress-circular
                                                                        :rotate="-90"
                                                                        :size="16"
                                                                        :width="3"
                                                                        :value="100"
                                                                        color="primary"
                                                                ></v-progress-circular>
                                                            </v-flex>
                                                            <v-flex class="px-0">
                                                                <h4 class="text-xs-left">For the last year</h4>
                                                            </v-flex>
                                                        </v-layout>
                                                    </v-flex>
                                                    <v-flex xs6>
                                                        <component
                                                                :is="fields['Бухгалтерский баланс за последний год'].fieldType"
                                                                noLabel
                                                                ref="Бухгалтерский баланс за последний год"
                                                                :field="fields['Бухгалтерский баланс за последний год']"
                                                                :inputData.sync="formData['Бухгалтерский баланс за последний год']"
                                                                :allData="formData"
                                                        ></component>
                                                    </v-flex>
                                                </v-layout>
                                            </v-flex>
                                            <v-flex xs6>
                                                <v-layout align-center>
                                                    <v-flex xs6>
                                                        <v-layout align-center>
                                                            <v-flex style="flex: 0">
                                                                <v-progress-circular
                                                                        :rotate="-90"
                                                                        :size="16"
                                                                        :width="3"
                                                                        :value="100"
                                                                        color="primary"
                                                                ></v-progress-circular>
                                                            </v-flex>
                                                            <v-flex class="px-0">
                                                                <h4 class="text-xs-left">For the last year</h4>
                                                            </v-flex>
                                                        </v-layout>
                                                    </v-flex>
                                                    <v-flex xs6>
                                                        <component
                                                                :is="fields['Отчет о прибылях и убытках за последний год'].fieldType"
                                                                noLabel
                                                                ref="Отчет о прибылях и убытках за последний год"
                                                                :field="fields['Отчет о прибылях и убытках за последний год']"
                                                                :inputData.sync="formData['Отчет о прибылях и убытках за последний год']"
                                                                :allData="formData"
                                                        ></component>
                                                    </v-flex>
                                                </v-layout>
                                            </v-flex>
                                            <v-flex xs6>
                                                <v-layout align-center>
                                                    <v-flex xs6>
                                                        <v-layout align-center>
                                                            <v-flex style="flex: 0">
                                                                <v-progress-circular
                                                                        :rotate="-90"
                                                                        :size="16"
                                                                        :width="3"
                                                                        :value="25"
                                                                        color="primary"
                                                                ></v-progress-circular>
                                                            </v-flex>
                                                            <v-flex>
                                                                <h4 class="text-xs-left">For the last<br>reporting quarter</h4>
                                                            </v-flex>
                                                        </v-layout>
                                                    </v-flex>
                                                    <v-flex xs6>
                                                        <component
                                                                :is="fields['Бухгалтерский баланс за последний квартал'].fieldType"
                                                                noLabel
                                                                ref="Бухгалтерский баланс за последний квартал"
                                                                :field="fields['Бухгалтерский баланс за последний квартал']"
                                                                :inputData.sync="formData['Бухгалтерский баланс за последний квартал']"
                                                                :allData="formData"
                                                        ></component>
                                                    </v-flex>
                                                </v-layout>
                                            </v-flex>
                                            <v-flex xs6>
                                                <v-layout align-center>
                                                    <v-flex xs6>
                                                        <v-layout align-center>
                                                            <v-flex style="flex: 0">
                                                                <v-progress-circular
                                                                        :rotate="-90"
                                                                        :size="16"
                                                                        :width="3"
                                                                        :value="25"
                                                                        color="primary"
                                                                ></v-progress-circular>
                                                            </v-flex>
                                                            <v-flex>
                                                                <h4 class="text-xs-left">For the last<br>reporting quarter</h4>
                                                            </v-flex>
                                                        </v-layout>
                                                    </v-flex>
                                                    <v-flex xs6>
                                                        <component
                                                                :is="fields['Отчет о прибылях и убытках за последний квартал'].fieldType"
                                                                noLabel
                                                                ref="Отчет о прибылях и убытках за последний квартал"
                                                                :field="fields['Отчет о прибылях и убытках за последний квартал']"
                                                                :inputData.sync="formData['Отчет о прибылях и убытках за последний квартал']"
                                                                :allData="formData"
                                                        ></component>
                                                    </v-flex>
                                                </v-layout>
                                            </v-flex>
                                        </v-layout>
                                    </v-container>
                                </v-flex>
                                <!--*********************-->
                                <v-flex xs6 class="mt-2">
                                    <component
                                            :is="fields['Бенефициары'].fieldType"
                                            label="Major Shareholders"
                                            ref="Бенефициары"
                                            :field="fields['Бенефициары']"
                                            :inputData.sync="formData['Бенефициары']"
                                            :allData="formData"
                                    ></component>
                                </v-flex>
                                <v-flex xs6 class="mt-2">
                                </v-flex>
                                <!--*********************-->
                                <v-flex xs12><h3 class="text-xs-left">Additional Information</h3></v-flex>
                                <div class="accreditation-form__divider mt-2"></div>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Сайт'].fieldType"
                                            label="Official website of the Company"
                                            ref="Сайт"
                                            :field="fields['Сайт']"
                                            :inputData.sync="formData['Сайт']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Ссылка на видео'].fieldType"
                                            label="Link to the YouTube video"
                                            ref="Ссылка на видео"
                                            :field="fields['Ссылка на видео']"
                                            :inputData.sync="formData['Ссылка на видео']"
                                    ></component>
                                </v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Презентация о компании'].fieldType"
                                            label="Presentation of the company (.pdf, .pptx)"
                                            ref="Презентация о компании"
                                            :field="fields['Презентация о компании']"
                                            :inputData.sync="formData['Презентация о компании']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Портфолио с проектами (архив)'].fieldType"
                                            label="Information about the implemented projects (.pdf, .pptx)"
                                            ref="Портфолио с проектами (архив)"
                                            :field="fields['Портфолио с проектами (архив)']"
                                            :inputData.sync="formData['Портфолио с проектами (архив)']"
                                    ></component>
                                </v-flex>
                                <div class="company-accreditation-block__divider mt-2"></div>
                                <v-flex xs12>
                                    <component
                                            :is="fields['Рейтинги'].fieldType"
                                            label="Information About Ratings of International and Local Rating Agencies"
                                            ref="Рейтинги"
                                            :field="fields['Рейтинги']"
                                            :inputData.sync="formData['Рейтинги']"
                                    ></component>
                                </v-flex>


                                <v-flex xs12><h3 class="text-xs-left">Contact Person</h3></v-flex>
                                <div class="accreditation-form__divider mt-2"></div>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['ФИО'].fieldType"
                                            label="Name of the Person"
                                            ref="ФИО"
                                            :field="fields['ФИО']"
                                            :inputData.sync="formData['ФИО']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Должность'].fieldType"
                                            label="Position"
                                            ref="Должность"
                                            :field="fields['Должность']"
                                            :inputData.sync="formData['Должность']"
                                    ></component>
                                </v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Email'].fieldType"
                                            label="E-mail Address"
                                            ref="Email"
                                            :field="fields['Email']"
                                            :inputData.sync="formData['Email']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Телефон'].fieldType"
                                            label="Contact Phone"
                                            ref="Телефон"
                                            :field="fields['Телефон']"
                                            :inputData.sync="formData['Телефон']"
                                    ></component>
                                </v-flex>
                                <v-flex xs12>
                                    <component
                                            :is="fields['Я согласен на обработку персональной информации'].fieldType"
                                            label="I consent to the processing of personal data"
                                            ref="Я согласен на обработку персональной информации"
                                            :field="fields['Я согласен на обработку персональной информации']"
                                            :inputData.sync="formData['Я согласен на обработку персональной информации']"
                                    ></component>
                                </v-flex>
                                <v-flex xs-12>
                                    <v-btn
                                            round
                                        :disabled="!formData['Я согласен на обработку персональной информации']"
                                        @click.native="submit"
                                    >Send an Application</v-btn>
                                </v-flex>
                            </v-layout>
                        </v-card-text>
                    </v-form>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>

</template>

<script>
    import MonoStepMixin from '~/mixins/common/MonoStepMixin';
    import axios from 'axios';
    import _ from 'lodash';

    const modelName = 'Заявка на аккредитацию института развития';
    const processName = 'Подать заявку на аккредитацию института развития';

    const defaultFormData = {
        'Название': '',
        'Название на локальном языке': '',
        'Тип инвестора': '',
        'Вид собственности': '',
        'ИНН': '',
        'Страна': null,
        'Регион': null,
        'География деятельности (страна)': null,
        'География деятельности (регион)': null,
        'Организация является дочерней': false,
        'Головная компания': '',
        'Кредитование': false,
        'Торговое финансирование': false,
        'Инвестиционное и проектное финансирование': false,
        'Банковские гарантии': false,
        'Факторинг': false,
        'Лизинг': false,
        'Приоритетные отрасли финансирования': null,
        'Краткое описание': '',
        'Логотип': '',
        'Бухгалтерский баланс за последний год': '',
        'Бухгалтерский баланс за последний квартал': '',
        'Отчет о прибылях и убытках за последний год': '',
        'Отчет о прибылях и убытках за последний квартал': '',
        'Бенефициары': '',

        'Сайт': '',
        'Ссылка на видео': '',
        'Презентация о компании': '',
        'Портфолио с проектами (архив)': '',
        'Рейтинги': '',
        'ФИО': '',
        'Должность': '',
        'Email': '',
        'Телефон': '',
        'Я согласен на обработку персональной информации': false
    };

    export default {
        name: 'inst-accreditation-block',
        mixins: [MonoStepMixin],
        layout: 'defaultSite',
        async asyncData () {
            const url = `${process.env.apiBase}/model/model`;
            const model = modelName;
            const data = {
                fieldsSrc: {},
                error: false,
                loaded: false
            };
            try {
                const response = await axios.get(url, { params: { model } });
                console.log(`[asyncData] Model ${model} loaded!`);
                data.fieldsSrc = _.get(response, 'data.fields');
                data.loaded = true;
            } catch (err) {
                console.error(`[getModel] Error getting model ${model}! `);
                console.dir(err);
                data.error = true;
            }
            return data;
        },
        data: () => ({
            bgImageSrc: `${process.env.base}/img/company/investorAccBg.svg`,
            modelName,
            processName,
            formData: Object.assign({}, defaultFormData)
        }),
        methods: {
            onSuccess () {
                this.$router.push('/default/accreditationSuccess');
            }
        }
    };
</script>

<style lang="stylus">
    @require "~assets/style/accreditationForm"
</style>
