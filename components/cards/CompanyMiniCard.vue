<template>
    <v-card class="company-mini-card" width="100%" height="0%">
        <v-btn
                class="company-mini-card__close"
                v-if="canClose"
                absolute
                fab
                top
                right
                small
                @click.native="onClose"
        >
            <v-icon>close</v-icon>
        </v-btn>
        <v-card-text class="company-mini-card__body">
            <v-layout align-center class="mb-3">
                <v-flex style="flex: 0 0 40px;" class="mt-3 mr-3">
                    <v-avatar :size="80" tile>
                        <v-img contain :src="companyIcon" alt="avatar"></v-img>
                    </v-avatar>
                </v-flex>
                <v-flex>
                    <h2>{{item['Название']}}</h2>
                    <div class="text__label_small text-xs-left">{{item['Тип профиля']}}</div>
                </v-flex>
            </v-layout>
            <v-divider class="v-divider--extend"></v-divider>
            <v-layout class="mt-3 mb-3">
                <v-flex xs6>
                    <v-layout align-center>
                        <v-icon medium color="primary">location_on</v-icon>
                        <div class="text__label_small" v-if="item['Страна']">{{item['Страна'].entityDesc}}<span
                                v-if="item['Регион']">, {{item['Регион'].entityDesc}}</span></div>
                    </v-layout>
                </v-flex>
                <v-flex xs6>
                    <v-layout v-if="item['Сайт']">
                        <v-icon color="primary" class="mr-2">language</v-icon>
                        <a :href="href(item['Сайт'])" alt="fieldData" target="_blank" class="title__label">{{item['Сайт']}}</a>
                    </v-layout>
                </v-flex>
            </v-layout>
            <v-divider class="v-divider--extend"></v-divider>
            <v-layout align-center class="mt-3 mb-3" v-if="item['Отрасль']">
                <v-flex xs6>
                    <v-layout align-center>
                        <v-avatar :size="40">
                            <img :src="getIndustryIcon(item['Отрасль'].entityInstancePk.entityInstanceId)" alt="avatar">
                        </v-avatar>
                        <div class="text__label_small ml-2">{{item['Отрасль'].entityDesc}}</div>
                    </v-layout>
                </v-flex>
                <v-flex>
                    <v-layout align-center>
                        <h2 class="mr-2">{{item.__myProjects}} </h2><span class="text__label_small">projects</span>
                    </v-layout>
                </v-flex>
            </v-layout>
            <v-divider class="v-divider--extend"></v-divider>
            <v-layout row wrap class="mt-4 mb-4">
                <v-flex sm6>
                    <div class="text__label_small mb-2">Contact person</div>
                    <div>{{item['ФИО']}}</div>
                </v-flex>
                <v-flex sm6>
                    <div class="text__label_small mb-2">Position</div>
                    <div>{{item['Должность']}}</div>
                </v-flex>
                <v-flex sm6 class="mt-4">
                    <div class="text__label_small mb-2">E-mail</div>
                    <a :href="`mailto:${item['Email']}`">
                        <div>{{item['Email']}}</div>
                    </a>
                </v-flex>
                <v-flex sm4 class="mt-4">
                    <div class="text__label_small mb-2">Phone</div>
                    <div>{{item['Телефон']}}</div>
                </v-flex>
            </v-layout>
            <v-layout align-start justify-start class="mt-4 mb-3">
                <v-btn
                        round
                        outline
                        color="primary"
                        nuxt
                        :to="`/company/${entityId}`"
                >View full company profile
                </v-btn>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import {mapGetters} from 'vuex';
    import _ from 'lodash';
    import LinkMixin from '~/mixins/common/LinkMixin';
    import ProjectBookmarkMixin from '~/mixins/ProjectBookmarkMixin';
    import ItemMixin from '~/mixins/card/CardItemMixin';

    export default {
        name: 'company-mini-card',
        components: {},
        mixins: [LinkMixin, ItemMixin, ProjectBookmarkMixin],
        props: {
            canClose: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            imgSrc: `${process.env.base}/img/project/projectImg.jpg`,
            DDIcon: `${process.env.base}/img/icons/dd_icon.png`,
            PPPIcon: `${process.env.base}/img/icons/ppp_icon.png`,
            iconSrc: `${process.env.base}/img/project/projectIcon.png`
        }),
        computed: {
            ...mapGetters({
                storeIndustries: 'site/industryList'
            }),
            companyIcon () {
                if (this.entityIcon && this.entityIcon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${this.entityIcon.split('://')[1]}`;
                }
                return this.iconSrc;
            }
        },
        methods: {
            getIndustryIcon (industryId) {
                const industryIcon = _.get(_.find(this.storeIndustries, {value: industryId}), 'icon', '');
                return industryIcon;
            }
        }
    };
</script>

<style lang="stylus">
    .company-mini-card
        .company-mini-card
            &__img-info
                background rgba(0, 0, 0, 0.4)
                padding 16px 20px
                text-align: center
                line-height 1
                height 100%

                h2
                    font-size 18px
                    margin-top 16px

            &__body
                background #fff
                padding-top 0
                line-height 1.4

            &__close
                right: -12px
                width 24px
                height 24px
                top -12px !important

            &__progress
                font-size: 12px
                margin-right 12px
</style>
