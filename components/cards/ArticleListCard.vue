<template>
    <v-card fluid class="article-list-card">
        <v-card-text>
            <v-container grid-list-lg fluid>
                <v-layout row align-center>
                    <v-flex v-if="extend" style="flex: 0 0 126px">
                        <v-avatar :size="126" tile>
                            <v-img :src="articleIcon" contain alt="avatar"></v-img>
                        </v-avatar>
                    </v-flex>
                    <v-divider vertical v-if="extend"></v-divider>
                    <v-flex class="article-list-card__body">
                        <v-layout column align-start>

                            <v-flex>
                                <div class="text__label_small mb-2">{{articleAgency}}</div>
                                <h4 class="article-list-card__title">{{articleTitle}}</h4>
                            </v-flex>
                            <v-flex style="width: 100%">
                                <v-layout align-center>
                                    <v-flex>
                                        <v-avatar size="20" tile class="mr-2">
                                            <v-img :src="dateIcon" contain alt="avatar"></v-img>
                                        </v-avatar>
                                        <span class="text__label_small">{{articleDate}}</span>
                                    </v-flex>
                                    <v-flex>
                                        <v-avatar size="20" tile class="mr-2">
                                            <v-img :src="pagesIcon" contain alt="avatar"></v-img>
                                        </v-avatar>
                                        <span class="text__label_small">{{articlePages}}</span>
                                    </v-flex>
                                    <v-spacer></v-spacer>
                                    <v-flex v-if="articleFile" style="flex: 0;">
                                        <v-btn @click.stop="downloadFile(articleFile)" dark round>
                                            <v-avatar size="20" tile class="mr-2">
                                                <img :src="downloadIcon">
                                            </v-avatar>
                                            <span>Download</span>
                                        </v-btn>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                        </v-layout>
                    </v-flex>

                </v-layout>
            </v-container>
        </v-card-text>

    </v-card>
</template>

<script>
    import {mapGetters} from 'vuex';
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import FileMixin from '~/mixins/common/FileMixin';
    import _ from 'lodash';
    import moment from 'moment';

    export default {
        name: 'article-list-card',
        components: {},
        mixins: [ItemMixin, FileMixin],
        props: {
            extend: {
                type: Boolean
            },
            canClose: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            defaultIndustryIcon: `${process.env.base}/img/site/default_industry_black.png`,
            defaultProfileIcon: `${process.env.base}/img/site/default_profile.png`,
            downloadIcon: `${process.env.base}img/icons/download_white.svg`,
            dateIcon: `${process.env.base}/img/icons/calendar.svg`,
            pagesIcon: `${process.env.base}/img/icons/pages.svg`
        }),
        created () {
            moment.locale('en');
        },
        computed: {
            ...mapGetters({
                storeIndustries: 'site/industryList'
            }),
            articleIcon () {
                const icon = _.get(this.item, '[\'Иконка\']');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return this.defaultProfileIcon;
            },
            articleTitle () {
                return _.get(this.item, '[\'Название статьи\']');
            },
            articleAgency () {
                return _.get(this.item, '[\'Название агентства\']');
            },
            articlePages () {
                return _.get(this.item, '[\'Количество страниц\']');
            },
            articleFile () {
                return _.get(this.item, '[\'Файл\']');
            },
            articleDate () {
                const date = _.get(this.item, '[\'Дата документа\']');
                return moment(date).format('DD MMM YYYY');
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
    .article-list-card
        background white

        .article-list-card
            &__title
                height 62px
                overflow hidden

</style>
