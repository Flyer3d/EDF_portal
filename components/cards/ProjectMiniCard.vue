<template>
    <v-card class="project-mini-card">
        <v-img
                class="project-mini-card__img white--text"
                :src="projectBgSrc"
                height="150px"
        >
            <v-btn class="mt-3" small round fab icon absolute outline color="white"
                   @click.native="$root.$emit('sendMessage', {projectId: entityId})"
                   style="right: 48px; width: 24px; height: 24px;">
                <img :src="sharedSrc" width="24" height="24">
            </v-btn>
            <v-btn class="mt-3" small round fab icon absolute :outline="!isBookmarked"
                   :color="isBookmarked ? 'primary' : 'white'" @click.native="bookmark"
                   style="right: 16px; width: 24px; height: 24px;">
                <img :src="bookmarkSrc" width="6" height="10">
            </v-btn>
            <v-container fill-height fluid>
                <v-layout fill-height align-center justify-center class="project-mini-card__img-info">
                    <v-flex xs12>
                        <div>
                            <v-icon dark>home</v-icon>
                        </div>
                        <div class="text__label_small dark mt-2">{{item['Отрасль'] ? item['Отрасль'].entityDesc : ''}}
                        </div>
                        <h2 class="mt-3">{{item['Название']}}</h2>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-img>
        <v-card-text class="project-mini-card__body">
            <v-layout align-center class="mt-3 mb-3">
                <v-flex style="flex: 0 0 40px;" class="mr-3">
                    <v-avatar :size="40" class="avatar--outline">
                        <v-img contain :src="projectIconSrc" alt="avatar"></v-img>
                    </v-avatar>
                </v-flex>
                <v-flex>
                    <div class="text__label_small">Project author</div>
                    <h3>{{item['Автор проекта'] ? item['Автор проекта'].entityDesc : ''}}</h3>
                </v-flex>
            </v-layout>
            <template v-if="item.DD === 'True' || item['ГЧП'] === 'True'">
                <v-divider class="v-divider--extend"></v-divider>
                <v-layout row class="mt-3 mb-3">
                    <v-flex v-if="item['ГЧП'] === 'True'" :xs7="item.DD === 'True'" :xs12="item.DD !== 'True'"
                            class="mr-2">
                        <v-layout align-center>
                            <v-flex style="flex: 0 0 40px;" class="mr-3">
                                <v-avatar :size="40"><img :src="PPPIcon" alt="avatar"></v-avatar>
                            </v-flex>
                            <v-flex>
                                <div class="text__label_small">Public-private partnership</div>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.DD === 'True'" :xs5="item['ГЧП'] === 'True'" :xs12="item['ГЧП'] !== 'True'">
                        <v-layout align-center>
                            <v-flex style="flex: 0 0 40px;" class="mr-3">
                                <v-avatar :size="40"><img :src="DDIcon" alt="avatar"></v-avatar>
                            </v-flex>
                            <v-flex>
                                <div class="text__label_small">Due Deligence</div>
                            </v-flex>
                        </v-layout>
                    </v-flex>

                </v-layout>
            </template>
            <v-divider class="v-divider--extend"></v-divider>
            <v-layout row wrap class="mt-3 mb-3">
                <v-flex sm7>
                    <div class="text__label_small mb-2">Capital Required (USD)</div>
                    <h3>$ {{item['Capital Required (USD)'] | bigNumber}}</h3>
                </v-flex>
                <v-flex sm5>
                    <div class="text__label_small mb-2">Own Equity</div>
                    <h3>
                        <v-progress-circular
                                :rotate="-90"
                                :size="24"
                                :width="3"
                                :value="Number(ownEquity)"
                                color="primary"
                        ></v-progress-circular>
                        {{ownEquity}}%
                    </h3>
                </v-flex>
                <v-flex sm7 class="mt-3">
                    <div class="text__label_small mb-2">NPV (USD)</div>
                    <h3>$ {{item['NPV (USD)'] | bigNumber}}</h3>
                </v-flex>
                <v-flex sm5 class="mt-3">
                    <div class="text__label_small mb-2">Recoupment</div>
                    <h3>{{item['PBP (мес)']}} mo.</h3>
                </v-flex>
            </v-layout>
            <template v-if="stageToProgress">
                <v-layout>
                    <v-flex xs12 style="text-align: left">
                        <div class="text__label_small mb-2">Stage of Readiness: <b><span style="color: #232129;">{{item['Стадии проекта']}}</span></b>
                        </div>
                    </v-flex>
                </v-layout>
                <v-progress-linear v-model="stageToProgress" color="primary" :height="3"
                                   style="margin-bottom: 0; margin-top: 0;"
                                   class="v-progress-linear--extend"></v-progress-linear>
            </template>

            <v-divider class="v-divider--extend"></v-divider>
            <v-layout column align-center justify-center class="mt-4 mb-3">
                <v-btn
                        large
                        round
                        dark
                        nuxt
                        :to="`/project/${entityId}`"
                >
                    More information
                </v-btn>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import ProjectBookmarkMixin from '~/mixins/ProjectBookmarkMixin';
    import _ from 'lodash';

    export default {
        name: 'project-mini-card',
        components: {},
        mixins: [ItemMixin, ProjectBookmarkMixin],
        props: {
            canClose: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            defaultProjectBgSrc: `${process.env.base}/img/project/defaultProjectBg.jpg`,
            DDIcon: `${process.env.base}/img/icons/dd_icon.png`,
            PPPIcon: `${process.env.base}/img/icons/ppp_icon.png`,
            defaultUserSrc: `${process.env.base}/img/default/defaultUser.png`,
            bookmarkSrc: `${process.env.base}/img/icons/bookmark_white.svg`,
            sharedSrc: `${process.env.base}/img/icons/shared_white.svg`
        }),
        computed: {
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
            projectIconSrc () {
                const icon = _.get(this.item, '[\'Автор проекта\'].entityIcon');
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
            ownEquity () {
                return this.item['Собственный капитал (%)'] || 0;
            }
        }
    };
</script>

<style lang="stylus">
    .project-mini-card
        .project-mini-card
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

            &__progress
                font-size: 12px
                margin-right 12px
</style>
