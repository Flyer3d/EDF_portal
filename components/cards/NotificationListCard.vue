<template>
    <v-card
            flat
            class="notification-list-card"
            v-if="!isEmpty"
            style="position: relative; cursor: pointer;"
            @click.native="$root.$emit(notificationAction, {stepId: stepId})"
    >
        <v-card-text>
            <v-container grid-list-lg flat>
                <v-layout row justify-center align-center>
                    <v-flex style="flex: 0 0 40px">
                        <v-avatar :size="40">
                            <v-img :src="notificationIcon" contain alt="avatar"></v-img>
                        </v-avatar>
                    </v-flex>
                    <v-flex>
                        <v-layout column align-start>
                            <v-flex>
                                <div class="text__small" v-html="notificationText"></div>
                            </v-flex>
                            <v-flex>
                                <div class="text__label_small">{{notificationDate}}</div>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>

            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';

    const PROJECT_INVITATION_STEP = 'Рассмотреть приглашение';
    const PROJECT_PART_STEP = 'Рассмотреть и принять решение';
    const PROJECT_PUBLISH_REJECTED = 'Проект не опубликован';
    const PROJECT_PUBLISH_ACCEPTED = 'Проект опубликован';
    const PROJECT_COINVEST_REJECTED = 'Соинвестирование отклонено';
    const PROJECT_PART_REJECTED = 'Участие отклонено';
    const PROJECT_PART_ACCEPTED = 'Участие одобрено';

    export default {
        name: 'notification-list-card',
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
            defaultProfileIcon: `${process.env.base}/img/default/defaultUser.png`,
            defaultAcceptedIcon: `${process.env.base}/img/icons/projectAccepted.svg`,
            defaultRejectedIcon: `${process.env.base}/img/icons/projectRejected.svg`,
            projectAcceptedIcon: `${process.env.base}/img/icons/project_accept.svg`,
            projectRejectedIcon: `${process.env.base}/img/icons/project_reject.svg`,
            partAcceptedIcon: `${process.env.base}/img/icons/participation_accept.svg`,
            partRejectedIcon: `${process.env.base}/img/icons/participation_reject.svg`,
            coinvestRejectedIcon: `${process.env.base}/img/icons/co-investment_reject.svg`
        }),
        computed: {
            isEmpty () {
                return _.isEmpty(this.notification.inEntityModels);
            },
            inModels () {
                return this.notification.inEntityModels;
            },
            activityModelName () {
                return this.notification.activityModelName;
            },
            poolModelName () {
                return this.notification.activityModelName;
            },
            stepId () {
                return this.notification.stepId;
            },
            notificationIcon () {
                let iconSrc;
                let icon = this.defaultProfileIcon;
                switch (this.activityModelName) {
                    case PROJECT_PART_STEP:
                        // ToDo: Хардкод! Заменить на _.find!
                        iconSrc = _.get(this.inModels[0], 'object[\'Автор заявки\'].entityIcon');
                        break;
                    case PROJECT_INVITATION_STEP:
                        iconSrc = _.get(this.inModels[0], 'object[\'Автор заявки\'].entityIcon');
                        break;
                    case PROJECT_PUBLISH_REJECTED:
                        return this.projectRejectedIcon;
                    case PROJECT_PUBLISH_ACCEPTED:
                        return this.projectAcceptedIcon;
                    case PROJECT_COINVEST_REJECTED:
                        return this.coinvestRejectedIcon;
                    case PROJECT_PART_REJECTED:
                        return this.partRejectedIcon;
                    case PROJECT_PART_ACCEPTED:
                        return this.partAcceptedIcon;
                }
                if (iconSrc && iconSrc.split('://')[1]) {
                    icon = `${process.env.apiBase}/img/${iconSrc.split('://')[1]}`;
                }
                return icon;
            },
            notificationText () {
                let text = '';
                let inModel;
                let companyName;
                let projectName;
                switch (this.activityModelName) {
                    case PROJECT_PART_STEP:
                        inModel = _.get(this.inModels[0], 'object');
                        companyName = _.get(inModel, '[\'Автор заявки\'].entityDesc', '');
                        projectName = _.get(inModel, '[\'Проект\'].entityDesc', '');
                        text = `<b>${companyName}</b> Company sent a request for participation in the project <b>'${projectName}'</b>`;
                        break;
                    case PROJECT_INVITATION_STEP:
                        inModel = _.get(this.inModels[0], 'object');
                        companyName = _.get(inModel, '[\'Автор заявки\'].entityDesc', '');
                        projectName = _.get(inModel, '[\'Проект\'].entityDesc', '');
                        text = `<b>${companyName}</b> Company invited you to participate in the project <b>'${projectName}'</b>`;
                        break;
                    case PROJECT_PUBLISH_REJECTED:
                        inModel = _.get(this.inModels[0], 'object');
                        projectName = _.get(inModel, '[\'Название\']', '');
                        text = `Your project <b>'${projectName}'</b> has been rejected!`;
                        break;
                    case PROJECT_PUBLISH_ACCEPTED:
                        inModel = _.get(this.inModels[0], 'object');
                        projectName = _.get(inModel, '[\'Название\']', '');
                        text = `Your project <b>'${projectName}'</b> has been successfully hosted!`;
                        break;
                    case PROJECT_COINVEST_REJECTED:
                        inModel = _.find(this.inModels, {modelName: 'Заявка на участие в проекте'});
                        companyName = _.get(inModel, 'object[\'Соинвестор\'].entityDesc', '');
                        projectName = _.get(inModel, 'object[\'Проект\'].entityDesc', '');
                        text = `<b>${companyName}</b> reject your request for a coinvestment in a project <b>'${projectName}'</b>!`;
                        break;
                    case PROJECT_PART_REJECTED:
                        inModel = _.find(this.inModels, {modelName: 'Заявка на участие в проекте'});
                        projectName = _.get(inModel, 'object[\'Проект\'].entityDesc', '');
                        text = `Your request for a project <b>'${projectName}'</b> has been rejected!`;
                        break;
                    case PROJECT_PART_ACCEPTED:
                        inModel = _.find(this.inModels, {modelName: 'Заявка на участие в проекте'});
                        projectName = _.get(inModel, 'object[\'Проект\'].entityDesc', '');
                        text = `Your request is accepted and you have successfully joined the project <b>'${projectName}'</b>`;
                        break;
                }
                return text;
            },
            notificationDate () {
                return moment(this.notification.stepTime).format('D MMMM');
            },
            notificationAction () {
                switch (this.activityModelName) {
                    case PROJECT_PART_STEP:
                    case PROJECT_INVITATION_STEP:
                        return 'doStep';
                    case PROJECT_PUBLISH_REJECTED:
                    case PROJECT_PUBLISH_ACCEPTED:
                    case PROJECT_COINVEST_REJECTED:
                    case PROJECT_PART_REJECTED:
                    case PROJECT_PART_ACCEPTED:
                        return 'terminateStep';
                }
                return '';
            }
        },
        created () {
            moment.locale('en');
        }
    };
</script>

<style lang="stylus">
    .notification-list-card
        position rellative
        border-bottom: solid 1px #dcdcdf;

        .notification-list-card
            &__person
                margin -16px !important
                padding 16px
                border: solid 1px #d9d9dd;


</style>
