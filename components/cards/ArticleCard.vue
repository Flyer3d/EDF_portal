<template>
    <v-card class="article-card" flat>
        <v-card-title
                class="article-card__header white--text"
        >
            <v-container grid-list-lg fluid>
                <v-layout row>
                    <v-flex style="flex: 0 0 220px; background: #ffffff;">
                        <v-avatar :size="220" tile>
                            <v-img :src="articleIcon" contain alt="avatar"></v-img>
                        </v-avatar>
                    </v-flex>

                    <v-flex class="article-card__header-body ml-5">
                        <v-layout column align-start justify-space-around>
                            <v-flex>
                                <div class="text__label my-4">Information Agency "{{articleAgency}}"</div>
                                <h2 class="article-card__title mb-4">{{articleTitle}}</h2>
                                <v-layout align-center v-if="articleFile">
                                    <v-flex style="flex: 0">
                                        <v-btn @click.stop="downloadFile(articleFile)" large round color="white">
                                            <v-avatar size="20" tile class="mr-2">
                                                <img :src="downloadIcon">
                                            </v-avatar>
                                            <span>Download</span>
                                        </v-btn>
                                    </v-flex>
                                    <v-flex>
                                        <div class="text__label">{{articleFileType}}, {{articleFileSize}} MB</div>
                                    </v-flex>
                                    <v-spacer></v-spacer>

                                </v-layout>
                            </v-flex>
                        </v-layout>
                    </v-flex>

                </v-layout>
            </v-container>
        </v-card-title>
        <v-card-text>
            <v-layout class="mt-3" align-center>
                <v-flex xs12 md6>
                    <v-layout align-center>
                        <v-flex>
                            <v-avatar size="20" tile class="mr-2">
                                <v-img :src="dateIcon" contain alt="avatar"></v-img>
                            </v-avatar>
                            <span class="text__label">{{articleDate}}</span>
                        </v-flex>
                        <v-flex>
                            <v-avatar size="20" tile class="mr-2">
                                <v-img :src="pagesIcon" contain alt="avatar"></v-img>
                            </v-avatar>
                            <span class="text__label">{{articlePages}}</span>
                        </v-flex>
                        <v-spacer></v-spacer>
                        <v-flex v-if="articleFile" @click.stop="downloadFile(articleFile)">
                            <v-avatar size="20" tile class="mr-2">
                                <v-img :src="downloadBlueIcon" contain alt="download"></v-img>
                            </v-avatar>
                            <span class="text__label">{{articleFileType}}, {{articleFileSize}} MB</span>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs12 md6>
                    <v-spacer></v-spacer>
                    <v-tabs
                            v-model="tabs"
                            centered
                    >
                        <v-tab>
                            Description
                        </v-tab>
                        <v-tab>
                            Contents
                        </v-tab>
                    </v-tabs>
                </v-flex>
            </v-layout>
            <v-divider class="mt-3"></v-divider>
            <v-layout class="mt-5">
                <v-flex>
                    <v-tabs-items v-model="tabs">
                        <v-tab-item class="html-content html-container ql-editor">
                            <div class="text__label_small mb-3">Description</div>
                            <div v-html="articleDescription"></div>
                        </v-tab-item>
                        <v-tab-item class="html-content html-container ql-editor">
                            <div class="text__label_small mb-3">Contents</div>
                            <div v-html="articlePagination"></div>
                        </v-tab-item>
                    </v-tabs-items>
                </v-flex>
            </v-layout>

        </v-card-text>


    </v-card>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import FileMixin from '~/mixins/common/FileMixin';
    import LinkMixin from '~/mixins/common/LinkMixin';
    import ItemMixin from '~/mixins/card/CardItemMixin';

    export default {
        name: 'article-card',
        mixins: [FileMixin, LinkMixin, ItemMixin],
        data: () => ({
            downloadIcon: `${process.env.base}img/icons/download.svg`,
            downloadBlueIcon: `${process.env.base}img/icons/download_blue.svg`,
            dateIcon: `${process.env.base}/img/icons/calendar.svg`,
            pagesIcon: `${process.env.base}/img/icons/pages.svg`,
            tabs: 0
        }),
        created () {
            moment.locale('en');
        },
        computed: {
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
            articlePagination () {
                return _.get(this.item, '[\'Оглавление\']');
            },
            articleDescription () {
                return _.get(this.item, '[\'Описание\']');
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
            articleFileType () {
                return _.get(this.item, '[\'Формат файла\']');
            },
            articleFileSize () {
                return _.get(this.item, '[\'Размер файла\']');
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
            },
            apply (dlg) {
                console.log(`[ProjectInfoBlock] Apply for ${dlg}!`);
                this[`${dlg}Dlg`] = true;
                setTimeout(() => {
                    this.$refs[dlg].onResize();
                }, 300);
            }
        }
    };
</script>

<style lang="stylus">

    .article-card
        .article-card__header
            height 340px
            background-color #0f7acd
            padding 60px


</style>
