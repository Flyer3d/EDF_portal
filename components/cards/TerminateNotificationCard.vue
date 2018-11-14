<template>
    <v-card class="terminate-notification-card" style="position: relative;">
        <v-btn
                v-if="canClose"
                style="top: 40px; right: 40px;"
                absolute
                fab
                top
                right
                large
                flat
                class="v-btn__close_small"
                @click.native="$emit('close')"
        >
            <v-icon>close</v-icon>
        </v-btn>
        <v-card-title>
            <h1 class="mt-4 px-5 text-xs-center">{{notificationTitle}}</h1>

        </v-card-title>
        <v-card-text class="terminate-notification-card__body" style="max-height: calc(100vh - 300px)">
            <v-container grid-list-lg flat>
                <v-layout column class="my-2">
                    <v-flex>
                        <h3 class="text-xs-center mt-3" v-if="notificationSubTitle">{{notificationSubTitle}}</h3>
                    </v-flex>
                    <v-flex v-if="message">
                        <div class="text__label mb-2">Reason:</div>
                        {{message}}
                    </v-flex>
                </v-layout>

            </v-container>
        </v-card-text>
        <v-card-actions class="my-3">
            <v-spacer></v-spacer>
            <v-btn dark round large class="ml-2" @click="submit">Viewed</v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
        <div class="loading" v-if="saveStatus === 'IN_PROGRESS'">
            <v-progress-circular indeterminate :width="2" :size="150" color="primary"
                                 class="loading__spinner"></v-progress-circular>
        </div>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import {mapGetters, mapActions} from 'vuex';

    const titleTextMap = {
        'Проект опубликован': 'The project is published',
        'Проект не опубликован': 'The project is not published',
        'Соинвестирование отклонено': 'Co-investment is rejected',
        'Участие отклонено': 'Invitation declined',
        'Участие одобрено': 'Participation is confirmed'

    };

    const subTitleTextMap = {
        'Информация была опубликована': 'Thank you for contacting  and notifying us about the successful project placement  at the international independent  WBIF platform.',
        'Информация не была опубликована.': 'Thank you for contacting us. Information about the project was considered. Unfortunately we have made negative decision about  it\'s possible placement on the international independent WBIF platform.',
        'Ваше приглашение к соинвестированию проекта отклонено.': 'Your invitation to co-invest in the project had declined.',
        'Ваша заявка на участие отклонена.': 'We kindly inform you that the company had declined to participate in the project.',
        'Вы включены в состав участников проекта.': 'We kindly inform you that the company had confirmed to participate in the project.'
    };

    export default {
        name: 'terminate-notification-card',
        components: {},
        props: {
            canClose: {
                type: Boolean,
                default: false
            },
            notification: {
                type: Object,
                required: true
            }
        },
        data: () => ({
            titleTextMap,
            subTitleTextMap
        }),
        computed: {
            ...mapGetters({
                saveStatus: 'action/stepStatus'
            }),
            outModelName () {
                return this.outModel.modelName;
            },
            outEntityId () {
                return this.outModel.instanceId;
            },
            activityTypeId () {
                return this.notification.activityTypeId;
            },
            adapterTaskId () {
                return this.notification.adapterTaskId;
            },
            inModels () {
                return this.notification.inEntityModels && this.notification.inEntityModels;
            },
            outModel () {
                return this.notification.outEntityModels && this.notification.outEntityModels[0];
            },
            notificationTitle () {
                return titleTextMap[this.notification.activityModelName];
            },
            notificationSubTitle () {
                return subTitleTextMap[_.get(this.outModel, 'object[\'Сообщение\']')];
            },
            message () {
                if (this.notification.poolModelName === 'Подать заявку на участие в проекте') {
                    const item = _.find(this.inModels, {modelName: 'Решение по заявке'}) || _.find(this.inModels, {modelName: 'Решение по приглашению'});
                    return _.get(item, 'object[\'Комментарий\']');
                }
                return '';
            },
            stepId () {
                return this.notification.stepId;
            }
        },
        created () {
            moment.locale('en');
        },
        watch: {
            saveStatus (value) {
                if (value === 'SUCCESS') {
                    this.loadNotificationsList();
                    this.$emit('submit');
                    this.$emit('close');
                }
            }
        },
        methods: {
            ...mapActions({
                submitSimpleStep: 'action/submitSimpleStep',
                loadNotificationsList: 'notification/loadNotificationList'
            }),
            submit () {
                console.log('[TerminateNotificationCard/submit] Submitting!...');
                const response = Object.assign({}, this.outModel.object);
                response['Ознакомлен'] = 'True';
                console.dir({
                    fields: response,
                    inModelName: this.outModelName,
                    inEntityId: this.outEntityId,
                    activityTypeId: this.activityTypeId,
                    adapterTaskId: this.adapterTaskId
                });
                this.submitSimpleStep({
                    fields: response,
                    modelName: this.outModelName,
                    entityId: this.outEntityId,
                    activityTypeId: this.activityTypeId,
                    adapterTaskId: this.adapterTaskId
                });
            }
        }
    };
</script>

<style lang="stylus">
    .terminate-notification-card
        background-color #ffffff
        position rellative
        max-width 100%
        /*min-width 1024px*/
        width 100%
        height 100%

        .terminate-notification-card

            &__body
                padding 0px 20px



</style>
