<template>
    <v-card fluid class="event-list-card">
        <v-card-text>
            <v-container grid-list-lg fluid>
                <v-layout row>
                    <v-flex style="flex: 0 0 150px">
                        <v-avatar :size="126" tile>
                            <v-img :src="eventIcon" contain alt="avatar"></v-img>
                        </v-avatar>
                    </v-flex>
                    <v-divider vertical></v-divider>
                    <v-flex class="event-list-card__body">
                        <v-layout column align-start>

                            <v-flex>
                                <h2 class="event-list-card__title">{{eventTitle}}</h2>
                            </v-flex>
                            <v-flex class="event-list-card__text html-content html-container ql-editor mb-2">
                                <div v-html="eventDescription"></div>
                            </v-flex>
                            <v-flex style="width:100%; border-top: solid 1px #dcdcdf;">
                                <v-layout align-center>
                                    <v-flex>
                                        <v-avatar size="20" tile class="mr-2">
                                            <v-img :src="dateIcon" contain alt="avatar"></v-img>
                                        </v-avatar>
                                        <span class="text__label_small">{{eventDate}}</span>
                                    </v-flex>
                                    <v-flex>
                                        <v-avatar size="16" tile class="mr-2">
                                            <v-img :src="mapIcon" contain alt="avatar"></v-img>
                                        </v-avatar>
                                        <span class="text__label_small">{{eventPlace}}</span>
                                    </v-flex>
                                    <v-spacer></v-spacer>
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

    export default {
        name: 'event-list-card',
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
            mapIcon: `${process.env.base}/img/icons/switch_map_blue.svg`
        }),
        computed: {
            ...mapGetters({
                storeIndustries: 'site/industryList'
            }),
            eventIcon () {
                const icon = _.get(this.item, '[\'Логотип\']');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return this.defaultProfileIcon;
            },
            eventTitle () {
                return _.get(this.item, '[\'Название мероприятия\']');
            },
            eventDescription () {
                return _.get(this.item, '[\'Краткое описание\']');
            },
            eventDate () {
                return _.get(this.item, '[\'Дата проведения\']');
            },
            eventPlace () {
                return _.get(this.item, '[\'Место проведения\']');
            }
        }
    };
</script>

<style lang="stylus">
    .event-list-card
        background white
        height 250px

        &__text
            height 100px
            overflow hidden
            font-size 12px

        &__title
            height 60px
            overflow hidden
            color #524f5f
</style>
