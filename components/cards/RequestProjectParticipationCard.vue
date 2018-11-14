<template>
    <v-card class="request-project-participation-card" style="position: relative;">
        <v-btn
                v-if="canClose"
                style="top: 40px; right: 40px;"
                absolute
                fab
                top
                right
                large
                flat
                class="v-btn__close"
                @click.native="$emit('close')"
        >
            <v-icon>close</v-icon>
        </v-btn>
        <v-card-title>
            <v-layout>
                <v-flex>
                    <h1 class="my-4 text-xs-center">Request for Participation<br>
                        in the Project</h1>
                </v-flex>
            </v-layout>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="request-project-participation-card__body" style="max-height: calc( 100vh - 256px );">
            <v-form ref="form" v-model="valid" lazy-validation v-if="loaded">
                <v-container grid-list-lg flat>
                    <v-layout row wrap>

                        <v-flex xs12>
                            <div class="text__label_small md-2">Project Name</div>
                            <h2>{{projectName}}</h2>
                        </v-flex>
                        <!-- ********************* -->
                        <v-flex md6 xs12>
                            <component
                                    :is="fields['Пригласить соинвестора'].fieldType"
                                    label="Invite Co-investor"
                                    ref="Пригласить соинвестора"
                                    :field="fields['Пригласить соинвестора']"
                                    :inputData.sync="formData['Пригласить соинвестора']"
                            ></component>
                        </v-flex>
                        <v-flex md6 xs12>
                            <component
                                    v-if="formData['Пригласить соинвестора']"
                                    :is="fields['Соинвестор'].fieldType"
                                    label="Co-investor"
                                    ref="Соинвестор"
                                    icon
                                    :field="fields['Соинвестор']"
                                    :inputData.sync="formData['Соинвестор']"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->
                        <v-flex xs12>
                            <component
                                    :is="fields['Предложение'].fieldType"
                                    label="Your Offer"
                                    ref="Предложение"
                                    :field="fields['Предложение']"
                                    :inputData.sync="formData['Предложение']"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->
                        <v-flex md6 xs12>
                            <component
                                    :is="fields['Сумма инвестиций (USD) (%)'].fieldType"
                                    label="Amount of Investment (USD or %)"
                                    ref="Сумма инвестиций (USD) (%)"
                                    :field="fields['Сумма инвестиций (USD) (%)']"
                                    :inputData.sync="formData['Сумма инвестиций (USD) (%)']"
                            ></component>
                        </v-flex>
                        <v-flex md6 xs12>
                            <component
                                    :is="fields['Контакт ответственного лица'].fieldType"
                                    label="Contact Person"
                                    ref="Контакт ответственного лица"
                                    :field="fields['Контакт ответственного лица']"
                                    :inputData.sync="formData['Контакт ответственного лица']"
                            ></component>
                        </v-flex>
                        <!-- ********************* -->
                        <template v-if="formData['Контакт ответственного лица']">
                            <v-flex md6 xs12>
                                <component
                                        :is="fields['ФИО'].fieldType"
                                        label="Name of the Person"
                                        ref="ФИО"
                                        :field="fields['ФИО']"
                                        :inputData.sync="formData['ФИО']"
                                ></component>
                            </v-flex>
                            <v-flex md6 xs12>
                                <component
                                        :is="fields['Должность'].fieldType"
                                        label="Position"
                                        ref="Должность"
                                        :field="fields['Должность']"
                                        :inputData.sync="formData['Должность']"
                                ></component>
                            </v-flex>
                            <!-- ********************* -->
                            <v-flex md6 xs12>
                                <component
                                        :is="fields['Email'].fieldType"
                                        label="E-mail Address"
                                        ref="Email"
                                        :field="fields['Email']"
                                        :inputData.sync="formData['Email']"
                                ></component>
                            </v-flex>
                            <v-flex md6 xs12>
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
                    </v-layout>
                </v-container>
            </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="my-3">
            <v-spacer></v-spacer>
            <v-btn dark round large @click="submit">Send a request</v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
        <div class="loading" v-if="saveStatus === 'IN_PROGRESS'">
            <v-progress-circular indeterminate :width="2" :size="150" color="primary"
                                 class="loading__spinner"></v-progress-circular>
        </div>
    </v-card>
</template>

<script>
    import MonoStepMixin from '~/mixins/common/MonoStepMixin';
    import _ from 'lodash';
    import {mapGetters, mapActions} from 'vuex';

    const modelName = 'Заявка на участие в проекте';
    const processName = 'Подать заявку на участие в проекте';

    const defaultFormData = {
        'Проект': '',
        'Пригласить соинвестора': false,
        'Соинвестор': '',
        'Предложение': '',
        'Сумма инвестиций (USD) (%)': '',
        'Контакт ответственного лица': false,
        'ФИО': '',
        'Должность': '',
        'Email': '',
        'Телефон': '',
        'Автор заявки': '',
        'coinvestor_user_id': ''
    };

    export default {
        name: 'request-project-participation-card',
        mixins: [MonoStepMixin],
        props: {
            canClose: {
                type: Boolean,
                default: false
            },
            project: {
                type: Object,
                required: true
            }
        },
        data: () => ({

            modelName,
            processName,
            formData: Object.assign({}, defaultFormData)
        }),
        created () {
            this.getModel();
        },
        computed: {
            ...mapGetters({
                currentUserId: 'login/getUserId',
                currentUserName: 'login/getUserName'
            }),
            isEmpty () {
                return _.isEmpty(this.item);
            },
            projectName () {
                return _.get(this.project, 'entityDesc');
            },
            projectUserId () {
                return _.get(this.project, 'object.user_id');
            },
            projectId () {
                return _.get(this.project, 'entityInstancePk.entityInstanceId');
            }
        },
        methods: {
            onSuccess () {
                this.loadNotificationsList();
                this.$emit('submit');
                this.$emit('close');
            },
            ...mapActions({
                loadNotificationsList: 'notification/loadNotificationList'
            }),
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
                fields.push({name: 'projectAuthor_user_id', value: this.projectUserId, type: 'TEXT_FIELD'});
                fields.push({name: 'Проект', value: this.projectId, type: 'TEXT_FIELD'});

                console.log('[submit] Submitting Request data');
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
    .request-project-participation-card
        background-color #ffffff
        position rellative
        max-width 100%
        width 100%
        height 100%
        max-height: 80vh;
        overflow-y auto

        .request-project-participation-card

            &__body
                padding 16px 80px 16px 80px
                @media only screen and (max-width: 1264px)
                    padding 16px 40px 16px 40px

            &__person
                margin -16px !important
                padding 16px
                border: solid 1px #d9d9dd;


</style>
