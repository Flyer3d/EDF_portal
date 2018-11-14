<template>
    <v-card class="accept-project-notification-card" v-if="!isEmpty" style="position: relative;">
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
            <v-flex>
                <h1 class="my-4 text-xs-center">Request for joint<br>participation in the project</h1>
            </v-flex>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="accept-project-notification-card__body" style="max-height: calc( 100vh - 360px );">
            <v-container grid-list-lg flat>
                <v-layout class="my-4">
                    <v-flex>
                        <div class="text__label_small">Co-investors</div>
                        <v-layout align-start justify-start>
                            <v-flex>
                                <v-container grid-list-md flat>
                                    <v-layout align-start justify-start>
                                        <v-flex style="flex: 0 0 40px;">
                                            <v-avatar :size="40">
                                                <v-img :src="autorIcon" alt="avatar" contain></v-img>
                                            </v-avatar>
                                        </v-flex>
                                        <v-flex>
                                            <h3>{{companyName}}</h3>
                                            <div class="text__label_small">{{autorType}}</div>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-flex>
                            <v-flex v-if="isCoinvestor">
                                <v-container grid-list-md flat>
                                    <v-layout align-start justify-start>
                                        <v-flex style="flex: 0 0 40px;">
                                            <v-avatar :size="40">
                                                <v-img :src="coinvestorIcon" alt="avatar" contain></v-img>
                                            </v-avatar>
                                        </v-flex>
                                        <v-flex>
                                            <h3>{{coinvestorName}}</h3>
                                            <div class="text__label_small">{{coinvestorType}}</div>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
                <v-layout>
                    <v-flex xs12>
                        <div class="text__label_small">Your Offer</div>
                        {{message}}
                    </v-flex>
                </v-layout>

                <v-layout>
                    <v-flex xs12 class="text-xs-left mb-4">
                        <div class="text__label_small">Amount of Investment (%)</div>
                        <h3>{{amount}}</h3>
                    </v-flex>
                </v-layout>
                <v-layout class="accept-project-notification-card__person" v-if="contactPerson">
                    <v-flex xs3 class="text-xs-left">
                        <div class="text__label_small mb-2">Contact Person</div>
                        <h4>{{autorName}}</h4>
                    </v-flex>
                    <v-flex xs3 class="text-xs-left">
                        <div class="text__label_small mb-2">Position</div>
                        <h4>{{autorPosition}}</h4>
                    </v-flex>
                    <v-flex xs3 class="text-xs-left">
                        <div class="text__label_small mb-2">E-mail</div>
                        <h4>{{autorEmail}}</h4>
                    </v-flex>
                    <v-flex xs3 class="text-xs-left">
                        <div class="text__label_small mb-2">Phone</div>
                        <h4>{{autorPhone | formatPhone}}</h4>
                    </v-flex>
                </v-layout>
                <v-layout class="mt-4">
                    <v-flex xs12>
                        <div class="form__label mb-2 required">Response text:</div>
                        <v-textarea box v-model="response['Комментарий']"></v-textarea>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card-text>
        <v-card-actions class="my-3">
            <v-spacer></v-spacer>
            <v-btn :dark="Boolean(response['Комментарий'])" round large class="mr-2" color="red" @click="refuse"
                   :disabled="!response['Комментарий']">Refuse
            </v-btn>
            <v-btn :dark="Boolean(response['Комментарий'])" round large class="ml-2" @click="submit"
                   :disabled="!response['Комментарий']">Approve
            </v-btn>
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
    import axios from 'axios';
    import moment from 'moment';
    import {mapGetters, mapActions} from 'vuex';

    const defaultResponce = {
        'Комментарий': '',
        'Отказано': 'False',
        'Отклонить': 'False',
        'Одобрено': 'False',
        'Принять': 'False'
    };

    export default {
        name: 'accept-project-notification-card',
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
            itemSrc: {},
            loading: false,
            response: Object.assign({}, defaultResponce),
            defaultProfileIcon: `${process.env.base}/img/site/default_profile.png`
        }),
        computed: {
            ...mapGetters({
                saveStatus: 'action/stepStatus'
            }),
            isEmpty () {
                return _.isEmpty(this.item);
            },
            modelName () {
                return this.inModel.modelName;
            },
            entityId () {
                return this.inModel.instanceId;
            },
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
            contactPerson () {
                return _.get(this.item, '[\'Контакт ответственного лица\']') === 'True';
            },
            inModel () {
                return this.notification.inEntityModels && this.notification.inEntityModels[0];
            },
            outModel () {
                return this.notification.outEntityModels && this.notification.outEntityModels[0];
            },
            item () {
                return this.itemSrc.object;
            },
            message () {
                return _.get(this.item, '[\'Предложение\']');
            },
            companyName () {
                return _.get(this.item, '[\'Автор заявки\'].entityDesc');
            },
            autorName () {
                return _.get(this.item, '[\'Автор заявки\'].object[\'ФИО\']');
            },
            autorIcon () {
                const icon = _.get(this.item, '[\'Автор заявки\'].entityIcon');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return this.defaultProfileIcon;
            },
            autorId () {
                return _.get(this.item, '[\'Автор заявки\'].entityInstancePk.entityInstanceId');
            },
            autorModel () {
                return _.get(this.item, '[\'Автор заявки\'].entityInstancePk.entityName');
            },
            autorPosition () {
                return _.get(this.item, '[\'Автор заявки\'].object[\'Должность\']', '-');
            },
            autorEmail () {
                return _.get(this.item, '[\'Автор заявки\'].object[\'Email\']', '-');
            },
            autorPhone () {
                return _.get(this.item, '[\'Автор заявки\'].object[\'Телефон\']', '-');
            },
            autorType () {
                return _.get(this.item, '[\'Автор заявки\'].object[\'Тип профиля\']');
            },
            isCoinvestor () {
                return this.item['Пригласить соинвестора'] === 'True';
            },
            coinvestor () {
                return _.get(this.item, '[\'Соинвестор\']');
            },
            coinvestorId () {
                return _.get(this.item, '[\'Соинвестор\'].entityInstancePk.entityInstanceId');
            },
            coinvestorModel () {
                return _.get(this.item, '[\'Соинвестор\'].entityInstancePk.entityName');
            },
            coinvestorType () {
                return _.get(this.item, '[\'Соинвестор\'].object[\'Тип профиля\']');
            },
            coinvestorName () {
                return _.get(this.item, '[\'Соинвестор\'].entityDesc');
            },
            coinvestorIcon () {
                const icon = _.get(this.item, '[\'Соинвестор\'].entityIcon');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return this.defaultProfileIcon;
            },
            amount () {
                return _.get(this.item, '[\'Сумма инвестиций (USD) (%)\']');
            },
            date () {
                return moment(this.itemSrc.dateModified).format('DD MMMM');
            },
            stepId () {
                return this.notification.stepId;
            }
        },
        created () {
            moment.locale('en');
            if (this.entityId) {
                this.getNotification();
            }
        },
        watch: {
            notification: {
                handler () {
                    this.response = Object.assign({}, defaultResponce);
                    this.itemSrc = {};
                    if (this.entityId) {
                        this.getNotification();
                    }
                },
                deep: true
            },
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
            async getNotification () {
                try {
                    const url = `${process.env.apiBase}/widget/${this.modelName}/${this.entityId}`;
                    const res = await axios.get(url);
                    this.itemSrc = _.get(res, 'data.rows[0]');
                    console.log('[getNotification] Item loaded!');
                    console.dir(this.itemSrc);
                    const additionalUrls = [`${process.env.apiBase}/widget/${this.autorModel}/${this.autorId}`];
                    if (this.isCoinvestor) {
                        additionalUrls.push(`${process.env.apiBase}/widget/${this.coinvestorModel}/${this.coinvestorId}`);
                    }
                    const [autorSrc, coinvestorSrc] = await Promise.all(additionalUrls.map(addUrl => axios.get(addUrl)));
                    const autor = _.get(autorSrc, 'data.rows[0]');
                    this.itemSrc.object['Автор заявки'] = autor;
                    if (this.isCoinvestor) {
                        const coinvestor = _.get(coinvestorSrc, 'data.rows[0]');
                        this.itemSrc.object['Соинвестор'] = coinvestor;
                    }
                    console.log('[getNotification] All fields replaced!');
                    console.dir(this.itemSrc);
                } catch (err) {
                    console.error(`[getNotification] Error getting item ${this.modelName}::${this.entityId}! `);
                    console.dir(err);
                }
            },
            submit () {
                console.log('[AcceptProjectNotificationCard/submit] Submitting!...');
                this.response['Одобрено'] = 'True';
                this.response['Принять'] = 'True';
                console.dir({
                    fields: this.response,
                    modelName: this.outModelName,
                    entityId: this.outEntityId,
                    activityTypeId: this.activityTypeId,
                    adapterTaskId: this.adapterTaskId
                });
                this.submitSimpleStep({
                    fields: this.response,
                    modelName: this.outModelName,
                    entityId: this.outEntityId,
                    activityTypeId: this.activityTypeId,
                    adapterTaskId: this.adapterTaskId
                });
            },
            refuse () {
                console.log('[AcceptProjectNotificationCard/refuse] Refusing!...');
                this.response['Отказано'] = 'True';
                this.response['Отклонить'] = 'True';
                console.dir({
                    fields: this.response,
                    modelName: this.outModelName,
                    entityId: this.outEntityId,
                    activityTypeId: this.activityTypeId,
                    adapterTaskId: this.adapterTaskId
                });
                this.submitSimpleStep({
                    fields: this.response,
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
    .accept-project-notification-card
        background-color #ffffff
        position rellative
        max-width 100%
        width 100%
        height 100%

        .accept-project-notification-card

            &__body
                padding 16px 80px 16px 80px
                @media only screen and (max-width: 1264px)
                    padding 16px 40px 16px 40px

            &__person
                margin -16px !important
                padding 16px
                border: solid 1px #d9d9dd;

</style>
