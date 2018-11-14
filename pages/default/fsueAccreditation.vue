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
                            <h1 class="mt-4 dark">Federal State Unitary<br>Enterprise</h1>
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
                                            :is="fields['Площадь региона'].fieldType"
                                            label="Area of the region"
                                            ref="Площадь региона"
                                            :field="fields['Площадь региона']"
                                            :inputData.sync="formData['Площадь региона']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Население региона'].fieldType"
                                            label="Population"
                                            ref="Население региона"
                                            :field="fields['Население региона']"
                                            :inputData.sync="formData['Население региона']"
                                    ></component>
                                </v-flex>
                                <!--*********************-->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Административный центр'].fieldType"
                                            label="Administrative Center"
                                            ref="Административный центр"
                                            :field="fields['Административный центр']"
                                            :inputData.sync="formData['Административный центр']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Основные направления экономики'].fieldType"
                                            label="Main Directions of the Economy"
                                            ref="Основные направления экономики"
                                            :field="fields['Основные направления экономики']"
                                            :inputData.sync="formData['Основные направления экономики']"
                                    ></component>
                                </v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Управляющий орган'].fieldType"
                                            label="Parent Organization"
                                            ref="Управляющий орган"
                                            :field="fields['Управляющий орган']"
                                            :inputData.sync="formData['Управляющий орган']"
                                            :allData="formData"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Действующий глава'].fieldType"
                                            label="Actual Head"
                                            ref="Действующий глава"
                                            :field="fields['Действующий глава']"
                                            :inputData.sync="formData['Действующий глава']"
                                            :allData="formData"
                                    ></component>
                                </v-flex>
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


                                <v-flex xs12><h3 class="text-xs-left">Additional Information</h3></v-flex>
                                <div class="accreditation-form__divider mt-2"></div>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Сайт'].fieldType"
                                            label="Official website of the company"
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
                                            :is="fields['Презентация компании'].fieldType"
                                            label="Presentation of the company (.pdf, .pptx)"
                                            ref="Презентация компании"
                                            :field="fields['Презентация компании']"
                                            :inputData.sync="formData['Презентация компании']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
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

    const modelName = 'Заявка на аккредитацию госоргана';
    const processName = 'Подать заявку на аккредитацию госоргана';

    const defaultFormData = {
        'Название': '',
        'Название на локальном языке': '',
        'Страна': null,
        'Регион': null,
        'Площадь региона': null,
        'Население региона': null,
        'Административный центр': null,
        'Основные направления экономики': null,
        'Управляющий орган': null,
        'Действующий глава': null,
        'Логотип': '',

        'Сайт': '',
        'Ссылка на видео': '',
        'Презентация компании': '',
        'Рейтинги': '',
        'ФИО': '',
        'Должность': '',
        'Email': '',
        'Телефон': '',
        'Я согласен на обработку персональной информации': false
    };

    export default {
        name: 'fsue-accreditation-block',
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
            bgImageSrc: `${process.env.base}/img/company/fsueAccBg.svg`,
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
