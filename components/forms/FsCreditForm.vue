<template>
    <v-container grid-list-xl flat class="fs-credit-form">
        <v-layout align-center column v-if="loaded">
            <v-flex>
                <v-card style="width: 100%">
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-card-text class="fs-credit-form__body">
                            <v-layout row wrap>
                                <v-flex xs12>
                                    <h1 class="my-5 text-xs-center">Credit Request</h1>
                                </v-flex>

                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Выручка в год (USD)'].fieldType"
                                            label="Revenue per Year"
                                            suffix="$"
                                            ref="Выручка в год (USD)"
                                            :field="fields['Выручка в год (USD)']"
                                            :inputData.sync="formData['Выручка в год (USD)']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12></v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Вид'].fieldType"
                                            label="Type of Crediting"
                                            ref="Вид"
                                            :field="fields['Вид']"
                                            :inputData.sync="formData['Вид']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12></v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Сумма кредита (USD)'].fieldType"
                                            label="Amount of Credit (USD)"
                                            suffix="$"
                                            ref="Сумма кредита (USD)"
                                            :field="fields['Сумма кредита (USD)']"
                                            :inputData.sync="formData['Сумма кредита (USD)']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Срок (мес)'].fieldType"
                                            label="Credit Term (mo)"
                                            suffix="mo"
                                            ref="Срок (мес)"
                                            :field="fields['Срок (мес)']"
                                            :inputData.sync="formData['Срок (мес)']"
                                    ></component>
                                </v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Материальное обеспечение'].fieldType"
                                            label="Material Security"
                                            inline
                                            ref="Материальное обеспечение"
                                            :field="fields['Материальное обеспечение']"
                                            :inputData.sync="formData['Материальное обеспечение']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                </v-flex>
                                <!-- ********************* -->


                                <v-flex xs12><h3 class="text-xs-left mt-4">Attach Financial Documents</h3></v-flex>
                                <div class="fs-credit-form__divider mt-2"></div>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Отправить бухгалтерский баланс за последний год'].fieldType"
                                            label="Balance for the last year"
                                            ref="Отправить бухгалтерский баланс за последний год"
                                            :field="fields['Отправить бухгалтерский баланс за последний год']"
                                            :inputData.sync="formData['Отправить бухгалтерский баланс за последний год']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Отправить отчет о прибылях и убытках (P&L) за последний год'].fieldType"
                                            label="Profits and Losses Report For the last year"
                                            ref="Отправить отчет о прибылях и убытках (P&L) за последний год"
                                            :field="fields['Отправить отчет о прибылях и убытках (P&L) за последний год']"
                                            :inputData.sync="formData['Отправить отчет о прибылях и убытках (P&L) за последний год']"
                                    ></component>
                                </v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Отправить бухгалтерский баланс за последний квартал'].fieldType"
                                            label="Balance for the last reporting quarter"
                                            ref="Отправить бухгалтерский баланс за последний квартал"
                                            :field="fields['Отправить бухгалтерский баланс за последний квартал']"
                                            :inputData.sync="formData['Отправить бухгалтерский баланс за последний квартал']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Отправить отчет о прибылях и убытках (P&L) за последний квартал'].fieldType"
                                            label="Profits and Losses Report For the last reporting quarter"
                                            ref="Отправить отчет о прибылях и убытках (P&L) за последний квартал"
                                            :field="fields['Отправить отчет о прибылях и убытках (P&L) за последний квартал']"
                                            :inputData.sync="formData['Отправить отчет о прибылях и убытках (P&L) за последний квартал']"
                                    ></component>
                                </v-flex>
                                <div class="fs-credit-form__divider mt-2"></div>


                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Указать другой контакт'].fieldType"
                                            label="Enter another contact"
                                            ref="Указать другой контакт"
                                            :field="fields['Указать другой контакт']"
                                            :inputData.sync="formData['Указать другой контакт']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12></v-flex>
                                <!-- ********************* -->
                                <template v-if="formData['Указать другой контакт']">
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
                                    <!-- ********************* -->
                                </template>
                                <v-flex xs12>
                                    <component
                                            :is="fields['Комментарий'].fieldType"
                                            label="Comments"
                                            ref="Комментарий"
                                            :field="fields['Комментарий']"
                                            :inputData.sync="formData['Комментарий']"
                                    ></component>
                                </v-flex>
                                <!-- ********************* -->
                                <v-flex lg6 xs12>
                                    <component
                                            :is="fields['Дополнительная информация'].fieldType"
                                            label="Additional information"
                                            ref="Дополнительная информация"
                                            :field="fields['Дополнительная информация']"
                                            :inputData.sync="formData['Дополнительная информация']"
                                    ></component>
                                </v-flex>
                                <v-flex lg6 xs12></v-flex>
                                <!-- ********************* -->
                            </v-layout>
                        </v-card-text>
                    </v-form>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>

</template>

<script>
    import FormMixin from '~/mixins/common/FormMixin';

    const modelName = 'Заявка на кредитование';
    const processName = 'Подать заявку на кредитование';

    const defaultFormData = {
            'Выручка в год (USD)': '',
            'Вид': '',
            'Сумма кредита (USD)': '',
            'Срок (мес)': null,
            'Материальное обеспечение': '',
            'Отправить бухгалтерский баланс за последний год': 'False',
            'Отправить бухгалтерский баланс за последний квартал': 'False',
            'Отправить отчет о прибылях и убытках (P&L) за последний год': 'False',
            'Отправить отчет о прибылях и убытках (P&L) за последний квартал': 'False',
            'Указать другой контакт': 'False',
            'ФИО': '',
            'Должность': '',
            'Email': '',
            'Телефон': '',
            'Комментарий': '',
            'Дополнительная информация': ''
        };

    export default {
        name: 'fs-credit-block',
        mixins: [FormMixin],
        data: () => ({
            modelName,
            processName,
            formData: Object.assign({}, defaultFormData)
        }),
        created () {
           this.getModel();
        }
    };
</script>

<style lang="stylus">
    .fs-credit-form
        padding 0
        .fs-credit-form
            &__body
                padding 56px 128px 96px
                text-align center
                color #524f5f
                @media only screen and (max-width: 1264px)
                    padding 56px 32px

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

</style>
