<template>
    <v-card style="width: 100%" flat v-if="loaded">
        <v-form ref="form" v-model="valid" lazy-validation>
            <v-card-text>
                <v-container grid-list-xl flat class="avant-singup-form">
                    <v-layout row wrap>

                        <v-flex lg6 xs12>
                            <component
                                    :is="fields['Количество участников'].fieldType"
                                    label="Number of Participants"
                                    ref="Количество участников"
                                    :field="fields['Количество участников']"
                                    :inputData.sync="formData['Количество участников']"
                            ></component>
                        </v-flex>
                        <v-flex lg6 xs12></v-flex>
                        <!-- ********************* -->
                        <v-flex xs12>
                            <component
                                    :is="fields['Контактное лицо'].fieldType"
                                    label="Full Name"
                                    ref="Контактное лицо"
                                    :field="fields['Контактное лицо']"
                                    :inputData.sync="formData['Контактное лицо']"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->
                        <v-flex xs12>
                            <component
                                    :is="fields['Телефон'].fieldType"
                                    label="Phone"
                                    ref="Телефон"
                                    :field="fields['Телефон']"
                                    :inputData.sync="formData['Телефон']"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->
                        <v-flex xs12>
                            <component
                                    :is="fields['Email'].fieldType"
                                    label="E-mail"
                                    ref="Email"
                                    :field="fields['Email']"
                                    :inputData.sync="formData['Email']"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->

                    </v-layout>
                </v-container>
            </v-card-text>
        </v-form>
    </v-card>
</template>

<script>
    import FormMixin from '~/mixins/common/FormMixin';

    const modelName = 'Заявка на участие в мероприятии';
    const processName = 'Подать заявку на участие в мероприятии';

    const defaultFormData = {
            'Количество участников': '',
            'Контактное лицо': '',
            'Телефон': '',
            'Email': ''
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
    .avant-singup-form
        padding 0
        .avant-singup-form
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
