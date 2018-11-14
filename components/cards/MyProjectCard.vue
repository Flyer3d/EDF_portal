<template>
    <v-card class="my-project-card" flat>
        <v-img
                class="my-project-card__img white--text"
                :src="projectBgSrc"
                height="324px"
        >
            <v-container fill-height fluid>
                <v-layout fill-height align-center justify-center column class="my-project-card__img-info">
                    <v-flex>
                        <v-avatar :size="50" style="background-color: #fff">
                            <v-img :src="projectCreatorIcon" class="autor-icon" contain></v-img>
                        </v-avatar>
                    </v-flex>
                    <v-flex class="mt-2 mb-3">
                        <h2>{{item['Название']}}</h2>
                    </v-flex>
                    <v-flex>
                        <div class="text__label_small white--text mb-2">Publication date</div>
                        <div class="white--text">{{publicationDate}}</div>

                    </v-flex>
                </v-layout>
            </v-container>
        </v-img>
        <v-card-text>
            <v-layout class="mb-4" align-start>
                <v-flex xs12 md6 class="mr-4">
                    <div class="text__label_small mb-3">Project views</div>
                    <views-chart
                            v-if="viewsArr.length > 0"
                            :data="viewsArr"
                            :labels="labelsArr"
                            :height="150"
                    ></views-chart>
                </v-flex>
                <v-flex xs12 md6 class="ml-4">
                    <div class="text__label_small mb-3">&nbsp;</div>
                    <v-layout>
                        <v-flex xs6>
                            <v-layout column class="my-project-card__info-card">
                                <v-flex>
                                    <div class="text__label_small">New requests</div>
                                </v-flex>
                                <v-spacer></v-spacer>
                                <v-flex style="flex: 0;">
                                    <v-layout align-center>
                                        <v-avatar :size="20" tile class="mr-2">
                                            <v-img :src="incomingRequestIconBlue" class="icon" contain></v-img>
                                        </v-avatar>
                                        <h1 style="font-weight: 500;">{{totalOurPartNotifications}}</h1>
                                        <v-spacer></v-spacer>
                                    </v-layout>
                                </v-flex>
                            </v-layout>
                        </v-flex>
                        <v-flex xs6>
                            <v-layout column class="my-project-card__info-card">
                                <v-flex>
                                    <div class="text__label_small">Participants</div>
                                </v-flex>
                                <v-spacer></v-spacer>
                                <v-flex style="flex: 0;">
                                    <v-layout align-canter>
                                        <v-avatar :size="34" tile class="mr-2">
                                            <v-img :src="participantsIconBlue" class="icon" contain></v-img>
                                        </v-avatar>
                                        <h1 style="font-weight: 500;">{{participants.length}}</h1>
                                        <v-spacer></v-spacer>
                                    </v-layout>
                                </v-flex>
                            </v-layout>
                        </v-flex>
                    </v-layout>
                </v-flex>

            </v-layout>
            <v-layout align-end>
                <h1 class="mr-2" style="font-weight: 500; line-height: 1">{{viewsSrc.length}}</h1>
                <div>views for the last week</div>
            </v-layout>
            <v-layout class="mt-5">
                <v-flex class="my-project-card__pseudo-btn" @click="$router.push(`/project/${entityId}`)">
                    <h4 class="text-xs-center my-3">View project card</h4>
                </v-flex>
            </v-layout>
        </v-card-text>

    </v-card>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import {mapGetters} from 'vuex';
    import axios from 'axios';
    import ViewsChart from '~/components/charts/ViewsChart';

    const weekDates = [
        moment().subtract(6, 'days').startOf('day'),
        moment().subtract(5, 'days').startOf('day'),
        moment().subtract(4, 'days').startOf('day'),
        moment().subtract(3, 'days').startOf('day'),
        moment().subtract(2, 'days').startOf('day'),
        moment().subtract(1, 'days').startOf('day'),
        moment().startOf('day')
    ];

    export default {
        name: 'my-project-card',
        components: {
            MonoStepBlock: () => import('~/components/blocks/MonoStepBlock'),
            ViewsChart
        },
        mixins: [ItemMixin],
        data: () => ({
            participantsIconBlue: `${process.env.base}img/icons/participants_blue.svg`,
            incomingRequestIconBlue: `${process.env.base}img/icons/request_blue.svg`,
            defaultProjectBgSrc: `${process.env.base}/img/project/defaultProjectBg.jpg`,
            viewsSrc: [],
            viewsArr: [],
            labelsArr: [],
            weekDates
        }),
        created () {
            this.getViews();
        },
        computed: {
            ...mapGetters({
                userId: 'login/getUserId',
                partNotificationList: 'notification/getPartNotifications'
            }),
            entityUserId () {
                return this.item.user_id;
            },
            isEmpty () {
                return _.isEmpty(this.item);
            },
            publicationDate () {
                return moment(this.itemSrc.createdWhen).format('MMMM D, YYYY');
            },
            projectCreator () {
                return this.item['Автор проекта'];
            },
            projectCreatorIcon () {
                const icon = _.get(this.projectCreator, 'entityIcon');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return this.defaultUserSrc;
            },
            projectBgSrc () {
                const icon = _.get(this.item, '[\'Фоновая картинка\']');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return this.defaultProjectBgSrc;
            },
            participants () {
                return this.item['Участники проекта'] ? this.item['Участники проекта'] : [];
            },
            totalOurPartNotifications () {
                if (!_.isEmpty(this.partNotificationList)) {
                    const ourPartNotifications = this.partNotificationList.filter(item =>
                        _.get(item, 'inEntityModels[0].object[\'Проект\'].entityInstancePk.entityInstanceId') === this.entityId);
                    if (ourPartNotifications) {
                        return ourPartNotifications.length;
                    }
                }
                return 0;
            }
        },
        methods: {
            async getViews () {
                try {
                    const viewsSrc = await axios.post(`${process.env.apiBase}/statistics/getViews`,
                        {
                            type: 'project',
                            projectId: this.entityId,
                            fromDate: moment().subtract(7, 'days').startOf('day')
                        });
                    this.viewsSrc = _.get(viewsSrc, 'data.rows');

                    const viewsArr = [];
                    const labelsArr = [];
                    for (let i = 0; i < this.weekDates.length; i++) {
                        viewsArr.push(0);
                        labelsArr.push(moment(this.weekDates[i]).format('D.MM'));
                    }
                    this.viewsSrc.forEach(view => {
                        const viewDate = view.object.date;
                        for (let i = 0; i < this.weekDates.length; i++) {
                            if (moment(viewDate).isSame(this.weekDates[i], 'd')) {
                                viewsArr[i] += 1;
                                break;
                            }
                        }
                    });
                    this.viewsArr = viewsArr;
                    this.labelsArr = labelsArr;
                    console.log('[getViews] Views getted!');
                    console.dir(viewsSrc.data);
                } catch (err) {
                    console.error(`[getViews] Error getting views!`);
                    console.error(err);
                }
            }
        }
    };
</script>

<style lang="stylus">
    .my-project-card
        padding 0

        .v-card__text
            padding 50px

        .my-project-card

            &__tabs-wrapper
                padding 20px

            &__img-info
                background rgba(0, 0, 0, 0.4)
                padding 80px 20px
                text-align: center
                line-height 1

            &__info-card
                height 132px
                box-sizing border-box
                padding 16px 16px 8px
                border: solid 1px #dcdcdf

            &__item-info
                position absolute
                z-index: 20
                width: 300px
                height 300px
                right 100px
                top 100px
                background lightgoldenrodyellow

            &__pseudo-btn
                border: solid 1px #dcdcdf
                cursor pointer

</style>
