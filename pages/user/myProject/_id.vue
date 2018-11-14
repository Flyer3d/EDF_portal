<template>
    <v-container fluid flat class="my-project-info" v-if="!isEmpty">
            <v-layout row child-flex>
                <v-flex style="flex-basis: 100%;">
                    <div  class="my-project-info__info-wrapper">
                        <my-project-card
                            v-if="!isEmpty"
                            :itemSrc="itemSrc"
                            />
                    </div>
                </v-flex>
                <v-flex style="flex-basis: 480px; min-width: 480px;">

                        <v-tabs
                                v-model="tabs"
                                hide-slider
                                color="#35323f"
                                dark
                                centered
                        >
                            <v-tab>
                                <img :src="incomingRequestIconBlue" width="14" height="14" class="mr-2" v-if="tabs === 0">
                                <img :src="incomingRequestIcon" width="14" height="14" class="mr-2" v-else>
                                <h4 style="font-weight: normal;">Requests</h4>
                            </v-tab>
                            <v-tab>
                                <v-icon small class="mr-2" :color="tabs === 1? 'primary' : 'white'">people</v-icon>
                                <h4 style="font-weight: normal;">Project Participants</h4>
                            </v-tab>
                        </v-tabs>
                    <div style="height: calc(100vh - 124px); background: #e8e7eb;">
                        <div  class="my-project-info__tabs-wrapper">
                        <v-tabs-items v-model="tabs">
                            <v-tab-item>
                                <project-notification-card
                                        v-for="notification in projectPartList"
                                        :notification="notification"
                                        :key="notification.stepId"
                                ></project-notification-card>
                            </v-tab-item>
                            <v-tab-item>
                                <template v-if="isParticipants">
                                    <company-mini-list-card
                                            v-for="participant in item['Участники проекта']"
                                            :key="participant.entityInstancePk.entityInstanceId"
                                            :itemSrc="participant"
                                    />
                                </template>
                            </v-tab-item>
                        </v-tabs-items>
                    </div>
                    </div>
                </v-flex>
            </v-layout>
    </v-container>
</template>

<script>
    import {mapGetters} from 'vuex';
    import _ from 'lodash';
    import ItemMixin from '~/mixins/ItemMixin';
    import ProjectBookmarkMixin from '~/mixins/ProjectBookmarkMixin';
    import CompanyMiniCard from '~/components/cards/CompanyMiniCard';
    import CompanyMiniListCard from '~/components/cards/CompanyMiniListCard';
    import ProjectNotificationCard from '~/components/cards/ProjectNotificationCard';
    import MyProjectCard from '~/components/cards/MyProjectCard';

    export default {
        name: 'my-project-info-page',
        layout: 'site',
        mixins: [ItemMixin, ProjectBookmarkMixin],
        validate ({ params }) {
            console.log('[myCompany/_id] Validating id');
            return Boolean(params.id) && !Number.isNaN(Number(params.id));
        },
        components: {
            CompanyMiniCard,
            CompanyMiniListCard,
            ProjectNotificationCard,
            MyProjectCard
        },
        data: () => ({
            incomingRequestIcon: `${process.env.base}img/icons/request_white.svg`,
            incomingRequestIconBlue: `${process.env.base}img/icons/request_blue.svg`,
            tabs: 0
        }),
        async fetch ({params, store, redirect}) {
            await store.dispatch('myProject/getItem', params.id);
            if (store.getters['project/getItemLoadStatus'] === 'ERROR') {
                redirect('/error/project404');
            }
        },
        computed: {
            ...mapGetters({
                itemSrc: 'project/getItem',
                projectPartListSrc: 'notification/getPartNotifications',
                storeIndustries: 'site/industryList'
            }),
            projectCompany () {
                if (!this.isEmpty) {
                    return this.item['Автор проекта'];
                }
                return {};
            },
            projectPartList () {
                if (this.projectPartListSrc.length > 0) {
                    return this.projectPartListSrc.filter(item => _.get(item.inEntityModels[0], 'object[\'Проект\'].entityInstancePk.entityInstanceId') === this.entityId);
                }
                return [];
            },
            isParticipants () {
                return (!this.isEmpty) && this.item['Участники проекта'] && this.item['Участники проекта'].length > 0;
            }
        }
    };
</script>

<style lang="stylus">

    .my-project-info
        padding 0

        .my-project-info
            &__info-wrapper
                background-color: #f0eff1;
                height: calc(100vh - 64px);
                overflow auto
                padding 20px

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
