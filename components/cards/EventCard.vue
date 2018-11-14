<template>
    <v-card class="event-card" flat>
        <v-img
                :src="eventBg"
                class="event-card__header white--text"
        >
            <v-container grid-list-lg fluid>
                <v-layout column fill-height>
                    <v-flex class="mb-4">
                        <v-layout>
                            <v-flex>
                                <h2 class="text-xs-left" style="font-weight: 300;">{{eventDate}}</h2>
                            </v-flex>
                            <v-spacer></v-spacer>
                            <v-flex>
                                <h2 class="text-xs-right" style="font-weight: 300;">{{eventPlace}}</h2>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex>
                        <h1 class="text-xs-center dark" style="font-size: 50px">{{eventTitle}}</h1>
                    </v-flex>
                    <v-spacer></v-spacer>
                </v-layout>
            </v-container>
        </v-img>
        <v-card-text>
            <v-layout class="mt-3" align-center>
                <v-flex xs4>
                    <v-avatar size="20" tile class="mr-2">
                        <v-img :src="dateIcon" contain alt="avatar"></v-img>
                    </v-avatar>
                    <span class="text__label">{{eventDate}}</span>
                </v-flex>
                <v-flex xs4>
                    <v-avatar size="20" tile class="mr-2">
                        <v-img :src="mapIcon" contain alt="avatar"></v-img>
                    </v-avatar>
                    <span class="text__label">{{eventPlace}}</span>
                </v-flex>
                <v-flex xs4>
                    <a :href="href(eventSite)" target="_blank">
                        <v-avatar size="20" tile class="mr-2">
                            <v-img :src="globusIcon" contain alt="avatar"></v-img>
                        </v-avatar>
                        <span class="text__label">{{eventSite}}</span>
                    </a>
                </v-flex>
            </v-layout>
            <v-divider class="my-4"></v-divider>
            <v-layout>
                <v-flex>
                    <div class="text__label_small mb-3">About Event</div>
                    <div v-html="eventDescription"></div>
                </v-flex>
            </v-layout>
            <v-divider class="my-4"></v-divider>
            <v-layout>
                <v-flex>
                    <div class="text__label_small mb-3">Speakers</div>
                    <v-layout row wrap>
                        <v-flex
                                xs12 md6
                                v-for="speaker in eventSpeakers"
                                :key="speaker.entityInstancePk.entityInstanceId"
                        >
                            <v-layout>
                                <v-flex style="flex: 0;">
                                    <v-avatar size="80" class="mr-4">
                                        <v-img :src="getSpeakerIcon(speaker)" alt="avatar"></v-img>
                                    </v-avatar>
                                </v-flex>
                                <v-flex>
                                    <h4 class="mb-2">{{getSpeakerName(speaker)}}</h4>
                                    <div class="text__small">{{getSpeakerDescription(speaker)}}</div>
                                </v-flex>
                            </v-layout>
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <template v-if="eventProgram">
                <v-divider class="my-4"></v-divider>
                <v-layout>
                    <v-flex>
                        <div class="text__label_small mb-3">Program</div>
                        <div @click.stop="downloadFile(eventProgram)">
                            <v-avatar size="20" tile class="mr-2">
                                <v-img :src="downloadBlueIcon" contain alt="avatar"></v-img>
                            </v-avatar>
                            <span class="text__label">{{getFileName(eventProgram)}}</span>
                        </div>
                    </v-flex>
                </v-layout>
            </template>
        </v-card-text>


    </v-card>
</template>

<script>
    import _ from 'lodash';
    import FileMixin from '~/mixins/common/FileMixin';
    import LinkMixin from '~/mixins/common/LinkMixin';
    import ItemMixin from '~/mixins/card/CardItemMixin';

    export default {
        name: 'event-card',
        mixins: [FileMixin, LinkMixin, ItemMixin],
        data: () => ({
            defaultBg: `${process.env.base}img/events/eventDefaultBg.png`,
            downloadIcon: `${process.env.base}img/icons/download.svg`,
            downloadBlueIcon: `${process.env.base}img/icons/download_blue.svg`,
            dateIcon: `${process.env.base}/img/icons/calendar.svg`,
            mapIcon: `${process.env.base}/img/icons/switch_map_blue.svg`,
            globusIcon: `${process.env.base}/img/icons/globe_blue.svg`,
            defaultUserSrc: `${process.env.base}/img/default/defaultUser.png`,
            tabs: 0
        }),
        computed: {
            eventBg () {
                const bg = _.get(this.item, '[\'Фоновая картинка\']');
                if (bg && bg.split('://')[1]) {
                    return `${process.env.apiBase}/img/${bg.split('://')[1]}`;
                }
                return this.defaultBg;
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
            },
            eventSite () {
                return _.get(this.item, '[\'Сайт\']');
            },
            eventSpeakers () {
                return _.get(this.item, '[\'Спикер\']') || [];
            },
            eventProgram () {
                return _.get(this.item, '[\'Программа мероприятия\']');
            }
        },
        methods: {
            getSpeakerName (speaker) {
                return _.get(speaker, 'entityDesc');
            },
            getSpeakerIcon (speaker) {
                const icon = _.get(speaker, 'object[\'Фото\']');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return this.defaultUserSrc;
            },
            getSpeakerDescription (speaker) {
                return _.get(speaker, 'object[\'Описание\']');
            }
        }
    };
</script>

<style lang="stylus">

    .event-card
        .event-card__header
            height 340px
            width 100%
            padding 60px


</style>
