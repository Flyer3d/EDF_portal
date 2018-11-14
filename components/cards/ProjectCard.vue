<template>
    <v-card class="project-card" flat>
        <v-img
                class="project-card__img white--text"
                :src="projectBgSrc"
                height="324px"
        >
            <v-btn class="mt-3" small round fab icon absolute :outline="!isBookmarked"
                   :color="isBookmarked ? 'primary' : 'white'" @click.native="bookmark"
                   style="right: 16px; width: 24px; height: 24px;">
                <img :src="bookmarkSrc" width="6" height="10">
            </v-btn>
            <v-container fill-height fluid>
                <v-layout fill-height align-center justify-center column class="project-card__img-info">
                    <v-flex>
                        <v-avatar :size="50" style="background-color: #fff">
                            <v-img :src="projectCreatorIcon" class="autor-icon" contain></v-img>
                        </v-avatar>
                    </v-flex>
                    <v-flex class="my-4">
                        <h2>{{item['Название']}}</h2>
                    </v-flex>
                    <v-flex>
                        <v-btn
                                class="project-card__take-part-btn"
                                v-if="userId !== entityUserId"
                                large round
                                block
                                color="white"
                                @click.native="$root.$emit('requestProject', {project: itemSrc})"
                        >
                            Take part in the project
                        </v-btn>

                    </v-flex>
                    <v-flex>
                        <v-layout row align-center justify-space-around class="mt-4">
                            <v-flex
                                    v-if="item['Презентация проекта']"
                                    class="mx-3"
                                    style="cursor: pointer;"
                                    @click="downloadFile(item['Презентация проекта'])"
                            >
                                <v-layout align-center>
                                    <v-avatar size="24" tile class="mr-2">
                                        <v-img :src="downloadIcon" contain alt="download"></v-img>
                                    </v-avatar>
                                    <span class="text__label"
                                          style="opacity: 1; font-weight:400;">Download materials</span>
                                </v-layout>
                            </v-flex>
                            <v-flex class="mx-3"
                                    style="cursor: pointer;"
                                    @click="$root.$emit('sendMessage', {projectId: entityId})"
                            >
                                <v-layout align-center>
                                    <img :src="sharedSrc" width="32" height="32">
                                    <span class="text__label" style="opacity: 1; font-weight:400;">Share project</span>
                                </v-layout>
                            </v-flex>
                            <v-flex class="mx-3"
                                    style="cursor: pointer;"
                                    @click="$root.$emit('sendMessage', {projectId: entityId, profileId: projectCreatorId, profileTitle: projectCreatorName, profileAvatar: projectCreatorIcon})"
                            >
                                <v-avatar size="20" tile class="mr-2">
                                    <v-img :src="startChatIcon" contain alt="download"></v-img>
                                </v-avatar>
                                <span class="text__label" style="opacity: 1; font-weight:400;">Start a chat on this project</span>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-img>
        <v-card-text class="project-card__body">
            <v-layout class="mt-3" align-center>
                <v-flex xs4>
                    <v-layout align-center>
                        <v-flex style="flex: 0;" class="mr-2">
                            <v-avatar :size="40">
                                <img :src="getIndustryIcon(item['Отрасль'].entityInstancePk.entityInstanceId)"
                                     alt="avatar">
                            </v-avatar>
                        </v-flex>
                        <v-flex>
                            <div class="text__label_small">{{item['Отрасль'].entityDesc}}</div>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs4 v-if="item['ГЧП'] === 'True'">
                    <v-layout align-center>
                        <v-flex style="flex: 0;" class="mr-2">
                            <v-avatar :size="40"><img :src="PPPIcon" alt="avatar"></v-avatar>
                        </v-flex>
                        <v-flex>
                            <div class="text__label_small">Public-private partnership</div>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs4>
                    <v-layout align-center>
                        <v-flex style="flex: 0;" class="mr-2">
                            <v-avatar :size="24" tile><img :src="mapSwitchIcon" alt="avatar"></v-avatar>
                        </v-flex>
                        <v-flex>
                            <div class="text__label_small">{{item['Место проведения работ']}}</div>
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <v-divider class="my-4 v-divider--extend"></v-divider>
            <v-layout>
                <v-flex xs4>
                    <v-layout column>
                        <div class="text__label_small mb-2">Capital Required (USD)</div>
                        <h1 class="medium">$ {{item['Capital Required (USD)'] | bigNumber}}</h1>
                        <div class="text__label_small mt-2"><i>Ask price. Volume of attracted<br>
                            investments</i></div>
                    </v-layout>
                </v-flex>
                <v-flex xs4>
                    <v-layout column>
                        <div class="text__label_small mb-2">Own Equity</div>
                        <h1 class="medium">
                            <v-progress-circular
                                    :rotate="-90"
                                    :size="24"
                                    :width="3"
                                    :value="Number(ownEquity)"
                                    color="primary"
                            ></v-progress-circular>
                            {{ownEquity}}%
                        </h1>
                    </v-layout>
                </v-flex>
                <v-flex xs4>
                    <v-layout column>
                        <div class="text__label_small mb-2">NPV</div>
                        <h1 class="medium">$ {{item['NPV (USD)'] | bigNumber}}</h1>
                    </v-layout>
                </v-flex>
            </v-layout>
            <v-divider class="my-4 v-divider--extend"></v-divider>
            <v-layout>
                <v-flex>
                    <template v-if="item['Стадии проекта']">
                        <div class="text__small bold mb-4">Stage of readyness</div>
                        <v-stepper alt-labels :value="stageToStep" class="flat">
                            <v-stepper-header>
                                <v-stepper-step step="" :complete="stageToStep >= 0">Project Concept</v-stepper-step>
                                <v-divider :class="{done: stageToStep > 0}"></v-divider>

                                <v-stepper-step step="" :complete="stageToStep >= 1">Feasibility study</v-stepper-step>

                                <v-divider :class="{done: stageToStep > 1}"></v-divider>

                                <v-stepper-step step="" :complete="stageToStep >= 2">Project Design</v-stepper-step>

                                <v-divider :class="{done: stageToStep > 2}"></v-divider>

                                <v-stepper-step step="" :complete="stageToStep >= 3">Implementation</v-stepper-step>
                            </v-stepper-header>
                        </v-stepper>
                    </template>
                    <template v-if="item['Краткое описание']">
                        <div class="text__label_small mb-4">Project description</div>
                        <div class="html-content html-container ql-editor">
                            <div v-html="item['Краткое описание']"></div>
                        </div>
                    </template>
                </v-flex>
            </v-layout>
            <v-divider class="my-4" v-if="item['DD'] === 'True'"></v-divider>
            <v-layout v-if="item['DD'] === 'True'" align-top>
                <v-flex xs4>
                    <v-layout align-center>
                        <v-flex style="flex: 0 0 40px;" class="mr-2">
                            <v-avatar :size="40"><img :src="DDIcon" alt="avatar"></v-avatar>
                        </v-flex>
                        <v-flex>
                            <div class="text__small bold mb-2">Due Diligence</div>
                            <div class="text__label_small" style="font-weight: normal;"><i>Financial Expertise</i></div>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs4>
                    <div class="text__label_small mb-2">Expertise date</div>
                    {{item['Дата экспертизы'] | fullDate}}
                </v-flex>
                <v-flex xs4>
                    <div class="text__label_small mb-2">Expert</div>
                    {{item['Эксперт']}}
                </v-flex>
            </v-layout>
            <v-divider class="my-4"></v-divider>
            <v-layout class="mb-4">
                <v-flex xs3>
                    <div class="text__small"><b>Project Cost<br>(USD)</b></div>
                    <h3 style="font-weight: 400;" class="mt-2">$ {{item['Стоимость проекта (USD)'] | bigNumber}}</h3>
                </v-flex>
                <v-flex xs3>
                    <div class="text__small"><b>Implementation<br>period</b></div>
                    <h3 style="font-weight: 400;" class="mt-2">{{item['Срок реализации проекта (мес)']}} mo</h3>
                </v-flex>
                <v-flex xs3>
                    <div class="text__small mb-2"><b>IRR (%)</b></div>
                    <div class="text__label_small" style="font-weight: normal;"><i>Iternal rate of return.</i></div>
                    <h3 style="font-weight: 400;" class="mt-2">{{item['IRR (%)']}}%</h3>
                </v-flex>
                <v-flex xs3>
                    <div class="text__small mb-2"><b>PBP (mo)</b></div>
                    <div class="text__label_small" style="font-weight: normal;"><i>Pay-back period.</i></div>
                    <h3 style="font-weight: 400;" class="mt-2">{{item['PBP (мес)']}} mo</h3>
                </v-flex>
            </v-layout>
        </v-card-text>

    </v-card>
</template>

<script>
    import _ from 'lodash';
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import FileMixin from '~/mixins/common/FileMixin';
    import ProjectBookmarkMixin from '~/mixins/ProjectBookmarkMixin';
    import {mapGetters} from 'vuex';

    export default {
        name: 'project-card',
        components: {
            MonoStepBlock: () => import('~/components/blocks/MonoStepBlock')
        },
        mixins: [FileMixin, ItemMixin, ProjectBookmarkMixin],
        data: () => ({
            defaultProjectBgSrc: `${process.env.base}/img/project/defaultProjectBg.jpg`,
            DDIcon: `${process.env.base}/img/icons/dd_icon.png`,
            PPPIcon: `${process.env.base}/img/icons/ppp_icon.png`,
            defaultUserSrc: `${process.env.base}/img/default/defaultUser.png`,
            bookmarkSrc: `${process.env.base}/img/icons/bookmark_white.svg`,
            downloadIcon: `${process.env.base}img/icons/download_white.svg`,
            startChatIcon: `${process.env.base}img/icons/start_chat_white.svg`,
            mapSwitchIcon: `${process.env.base}img/icons/switch_map_blue.svg`,
            sharedSrc: `${process.env.base}/img/icons/shared_white.svg`
        }),
        computed: {
            ...mapGetters({
                userId: 'login/getUserId',
                storeIndustries: 'site/industryList'
            }),
            entityUserId () {
                return this.item.user_id;
            },
            ownEquity () {
                return this.item['Собственный капитал (%)'] || 0;
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
            projectCreatorName () {
                return _.get(this.projectCreator, 'entityDesc');
            },
            projectCreatorId () {
                return _.get(this.projectCreator, 'entityInstancePk.entityInstanceId');
            },
            stageToStep () {
                switch (this.item['Стадии проекта']) {
                    case 'Project Concept':
                        return 0;
                    case 'Feasibility study':
                        return 1;
                    case 'Project Design':
                        return 2;
                    case 'Implementation':
                        return 3;
                    default:
                        return 0;
                }
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
    .project-card
        padding 0

        .project-card
            &__info-wrapper
                background-color: #f0eff1;
                height: calc(100vh - 124px);
                overflow auto
                padding 20px
            &__body
                padding 24px 50px
                @media only screen and (max-width: 1264px)
                    padding 24px 16px

            &__take-part-btn
                position relative

                &:after
                    position: absolute;
                    top: 6px;
                    right: -64%;
                    display: block;
                    content: 'You can also invite a co-investor';
                    opacity: 0.6;
                    font-family: Rubik;
                    font-size: 12px;
                    font-weight: 500;
                    text-align: left;
                    line-height: 1.33;
                    width: 116px;
                    color: #fff;

            &__tabs-wrapper
                padding 20px

            &__img-info
                background rgba(0, 0, 0, 0.4)
                padding 64px 20px
                text-align: center
                line-height 1

            &__item-info
                position absolute
                z-index: 20
                width: 300px
                height 300px
                right 100px
                top 100px
                background lightgoldenrodyellow

</style>
