<template>
    <v-layout row  justify-center align-center style="position: relative;" :class="short? '' : 'pl-4'">
        <template v-if="!short">
        <v-btn class="mt-3" small round fab icon absolute outline color="grey"
               @click.native="$root.$emit('sendMessage', {projectId: entityId})"
               style=" top: 32px; left: -8px; width: 24px; height: 24px;">

            <img :src="sharedSrc" width="24" height="24">
        </v-btn>
        <v-btn class="mt-3" small round fab icon absolute :outline="!isBookmarked" :color="isBookmarked? 'primary' : 'grey'" @click.stop="bookmark" style=" top: 0px; left: -8px; width: 24px; height: 24px;">
            <img v-if="isBookmarked" :src="bookmarkWhiteSrc" width="6" height="10">
            <img v-else :src="bookmarkSrc" width="6" height="10">
        </v-btn>
        </template>
        <v-hover>
            <v-card
            slot-scope="{ hover }"
            :class="`elevation-${hover ? 8 : 0}`"
            class="project-list-card"
            @click.native="$router.push(`/project/${entityId}`)"
    >
        <v-card-text class="pa-0">
            <v-container grid-list-md fluid style="padding: 30px 20px">
            <v-layout row justify-start align-center>

                <v-flex class="project-list-card__owner" style="flex:0 0 40px;">
                    <v-avatar :size="40" class="avatar--outline">
                        <v-img contain :src="autorIcon ? autorIcon : defaultUserSrc" alt="avatar"></v-img>
                </v-avatar>
                </v-flex>
                <v-flex class="project-list-card__project-name text__small font-weight-bold">{{item['Название']}}</v-flex>
                <v-flex class="project-list-card__industry">
                    <v-layout align-center>
                        <v-flex style="flex: 0;">
                        <v-avatar :size="40" style="flex: 0;">
                            <img :src="getIndustryIcon(item['Отрасль'].entityInstancePk.entityInstanceId)" alt="avatar">
                        </v-avatar>
                        </v-flex>
                        <v-flex>
                            <div class="text__label_tiny">{{item['Отрасль'].entityDesc}}</div>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex class="project-list-card__ap"><h3>${{item['Capital Required (USD)'] | bigNumber}}</h3></v-flex>
                <v-flex class="project-list-card__equity mr-3">
                    <v-layout align-center>
                        <v-flex style="flex: 0;">
                            <v-progress-circular
                                    :rotate="-90"
                                    :size="20"
                                    :width="3"
                                    :value="Number(ownEquity)"
                                    color="primary"
                            ></v-progress-circular>
                        </v-flex>
                        <v-flex><h3>{{ownEquity}}%</h3></v-flex>
                    </v-layout>
                </v-flex>
                <template v-if="!short">
                    <v-flex class="project-list-card__imp-period">
                        <h3>${{item['NPV (USD)'] | bigNumber}}</h3>

                    </v-flex>
                    <v-flex class="project-list-card__pbp">
                        <v-layout align-center>
                            <v-flex style="flex: 0;">
                                <v-avatar :size="14" style="flex: 0;">
                                    <img :src="doneIcon" alt="done">
                                </v-avatar>
                            </v-flex>
                            <v-flex><h3>{{item['PBP (мес)']}} month</h3></v-flex>
                        </v-layout>
                    </v-flex>
                </template>
                <v-flex class="project-list-card__ppp">
                    <template v-if="item['ГЧП'] === 'True'">
                        <v-avatar :size="40"><img :src="PPPIcon" alt="avatar"></v-avatar>
                    </template>
                    <template v-else><h3>-</h3></template>
                </v-flex>
                <v-flex class="project-list-card__dd">
                    <template v-if="item['DD'] === 'True'">
                        <v-avatar :size="40"><img :src="DDIcon" alt="avatar"></v-avatar>
                    </template>
                    <template v-else><h3> - </h3></template>
                </v-flex>

            </v-layout>
            </v-container>
            <v-divider></v-divider>
            <template v-if="stageToProgress">

                <v-layout class="my-2 mx-3">
                    <v-flex xs3 style="text-align: left">
                        <div class="text__label_tiny" v-if="item['Стадии проекта'] === 'Project Concept'">Stage of Readiness: <span style="color: #232129; font-weight: 600; opacity: 1;">{{item['Стадии проекта']}}</span></div>
                    </v-flex>
                    <v-flex xs3 style="text-align: left">
                        <div class="text__label_tiny" v-if="item['Стадии проекта'] === 'Feasibility study'">Stage of Readiness: <span style="color: #232129; font-weight: 600; opacity: 1;">{{item['Стадии проекта']}}</span></div>
                    </v-flex>
                    <v-flex xs3 style="text-align: left">
                        <div class="text__label_tiny" v-if="item['Стадии проекта'] === 'Project Design'">Stage of Readiness: <span style="color: #232129; font-weight: 600; opacity: 1;">{{item['Стадии проекта']}}</span></div>
                    </v-flex>
                    <v-flex xs3 style="text-align: left">
                        <div class="text__label_tiny" v-if="item['Стадии проекта'] === 'Implementation'">Stage of Readiness: <span style="color: #232129; font-weight: 600; opacity: 1;">{{item['Стадии проекта']}}</span></div>
                    </v-flex>
                </v-layout>
                <v-progress-linear v-model="stageToProgress" :height="3" style="margin-bottom: 0; margin-top: 0;"></v-progress-linear>
            </template>
        </v-card-text>


            </v-card>
        </v-hover>
    </v-layout>
</template>

<script>
    import {mapGetters} from 'vuex';
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import ProjectBookmarkMixin from '~/mixins/ProjectBookmarkMixin';
    import _ from 'lodash';

    export default {
        name: 'project-list-card',
        components: {},
        mixins: [ItemMixin, ProjectBookmarkMixin],
        props: {
            canClose: {
                type: Boolean,
                default: false
            },
            short: {
                type: Boolean
            }
        },
        data: () => ({
            imgSrc: `${process.env.base}/img/project/projectImg.jpg`,
            iconSrc: `${process.env.base}/img/project/projectIcon.png`,
            DDIcon: `${process.env.base}/img/icons/dd_icon.png`,
            PPPIcon: `${process.env.base}/img/icons/ppp_icon.png`,
            doneIcon: `${process.env.base}/img/icons/complete_blue.svg`,
            defaultIndustryIcon: `${process.env.base}/img/site/default_industry_black.png`,
            defaultUserSrc: `${process.env.base}/img/default/defaultUser.png`,
            bookmarkSrc: `${process.env.base}/img/icons/bookmark_grey.svg`,
            bookmarkWhiteSrc: `${process.env.base}/img/icons/bookmark_white.svg`,
            sharedSrc: `${process.env.base}/img/icons/shared.svg`
        }),
        computed: {
            ...mapGetters({
                storeIndustries: 'site/industryList'
            }),
            autorIcon () {
                const icon = _.get(this.item, '[\'Автор проекта\'].entityIcon');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return '';
            },
            stageToProgress () {
                switch (this.item['Стадии проекта']) {
                    case 'Project Concept':
                        return 25;
                    case 'Feasibility study':
                        return 55;
                    case 'Project Design':
                        return 75;
                    case 'Implementation':
                        return 100;
                    default:
                        return 0;
                }
            },
            ownEquity () {
                return this.item['Собственный капитал (%)'] || 0;
            }
        },
        methods: {
            getIndustryIcon (industryId) {
                const industryIcon = _.get(_.find(this.storeIndustries, {value: industryId}), 'icon', '');
                return industryIcon || this.defaultIndustryIcon;
            }
        }
    };
</script>

<style lang="stylus">
    .project-list-card
        background white
        width 100%
        color black
        text-align left
        margin 12px 0 0 0
        display: flex
        align-items: center

        .project-list-card
            &__owner
                flex 1 1 64px
            &__project-name
                flex 1 1 180px
            &__industry
                flex 1 1 120px
            &__ap
                flex 1 1 160px
            &__equity
                flex 1 1 80px
            &__imp-period
                flex 1 1 160px
            &__pbp
                flex 1 1 120px
            &__ppp
                flex 0 0 48px
            &__dd
                flex 0 0 48px



</style>
