<template>
    <v-hover>
        <v-card
                slot-scope="{ hover }"
                :class="`elevation-${hover ? 12 : 2}`"
                class="my-project-list-card">
            <v-card-text>
                <v-container grid-list-lg>
                    <v-layout row justify-center align-center>
                        <v-flex xs6 class="text-xs-left">
                            <h3 class="my-project-list-card__title" @click="$router.push(`/myProject/${entityId}`)">
                                {{item['Название']}}
                            </h3>
                        </v-flex>
                        <v-flex xs class="text-xs-right">
                            <div class="text__label_small">Publication date</div>
                            <h4>{{date}}</h4>
                        </v-flex>
                    </v-layout>
                    <v-divider class="v-divider--extend mt-2"></v-divider>
                    <v-layout>
                        <v-flex xs4>
                            <div class="text__label_small">Views</div>
                            <h3>
                                <v-icon color="primary">remove_red_eye</v-icon>
                                {{views}}
                            </h3>
                        </v-flex>
                        <v-divider vertical></v-divider>
                        <v-flex xs4>
                            <div class="text__label_small">New Applications</div>
                            <h3>
                                <v-icon color="primary">input</v-icon>
                                {{totalOurPartNotifications}}
                            </h3>
                        </v-flex>
                        <v-divider vertical></v-divider>
                        <v-flex xs4>
                            <div class="text__label_small">Participants</div>
                            <h3>
                                <v-icon color="primary">people</v-icon>
                                {{participants.length}}
                            </h3>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
        </v-card>
    </v-hover>
</template>

<script>
    import {mapGetters} from 'vuex';
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import moment from 'moment';
    import axios from 'axios';
    import _ from 'lodash';

    export default {
        name: 'my-my-project-list-card',
        components: {},
        mixins: [ItemMixin],
        props: {
            canClose: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            imgSrc: `${process.env.base}/img/project/projectImg.jpg`,
            iconSrc: `${process.env.base}/img/project/projectIcon.png`,
            DDIcon: `${process.env.base}/img/icons/dd_icon.png`,
            PPPIcon: `${process.env.base}/img/icons/ppp_icon.png`,
            defaultIndustryIcon: `${process.env.base}/img/site/default_industry_black.png`,
            defaultProfileIcon: `${process.env.base}/img/site/default_profile.png`,
            views: ''
        }),
        created () {
            moment.locale('en');
            this.getViews();
        },
        computed: {
            ...mapGetters({
                partNotificationList: 'notification/getPartNotifications'
            }),
            date () {
                return moment(this.itemSrc.createdWhen).format('MMMM D, YYYY');
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
                const viewsSrc = await axios.post(`${process.env.apiBase}/statistics/getViews`, {type: 'project', projectId: this.entityId});
                this.views = _.get(viewsSrc, 'data.paging.totalRows');
                console.log('[getViews] Views getted!');
                console.dir(viewsSrc.data);
            }
        }
    };
</script>

<style lang="stylus">
    .my-project-list-card
        background white
        width 100%
        color black
        border 1px solid #aaa
        text-align left
        margin 12px 0 0 0
        display: flex
        align-items: center

        .v-card__text
            padding-bottom 0

        &__title
            &:hover
                cursor pointer
                color #0f7acd
</style>
