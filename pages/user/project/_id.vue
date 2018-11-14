<template>
    <v-container fluid flat class="project-info" v-if="!isEmpty">
            <v-layout row child-flex>
                <v-flex style="flex-basis: 100%;">
                    <div  class="project-info__info-wrapper">
                        <project-card
                            v-if="!isEmpty"
                            :itemSrc="itemSrc"
                            />
                    </div>
                </v-flex>
                <v-flex style="flex-basis: 480px; min-width: 480px;">
                        <v-tabs
                                v-model="tabs"
                                centered
                                color="#35323f"
                                hide-slider
                                dark
                        >
                            <v-tab>
                                <v-icon small class="mr-2" :color="tabs === 0? 'primary' : 'white'">person</v-icon>
                                <span style="font-weight: normal;">Project Author</span>
                            </v-tab>
                            <v-tab>
                                <v-icon small class="mr-2" :color="tabs === 1? 'primary' : 'white'">people</v-icon>
                                <span style="font-weight: normal;">Project Participants</span>
                            </v-tab>
                        </v-tabs>
                    <div style="height: calc(100vh - 124px); background: #e8e7eb;">
                        <div  class="project-info__tabs-wrapper">
                        <v-tabs-items v-model="tabs">
                            <v-tab-item>
                                <company-mini-card
                                        v-if="projectCompany"
                                        :itemSrc="projectCompany"
                                >
                                </company-mini-card>
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
    import {mapGetters, mapActions} from 'vuex';
    import ItemMixin from '~/mixins/ItemMixin';
    import ProjectBookmarkMixin from '~/mixins/ProjectBookmarkMixin';
    import CompanyMiniCard from '~/components/cards/CompanyMiniCard';
    import CompanyMiniListCard from '~/components/cards/CompanyMiniListCard';
    import ProjectCard from '~/components/cards/ProjectCard';

    export default {
        name: 'project-info-page',
        layout: 'site',
        mixins: [ItemMixin, ProjectBookmarkMixin],
        validate ({ params }) {
            console.log('[company/_id] Validating slug');
            return Boolean(params.id) && !Number.isNaN(Number(params.id));
        },
        components: {
            CompanyMiniCard,
            CompanyMiniListCard,
            ProjectCard
        },
        data: () => ({
            tabs: 0
        }),
        async fetch ({params, store, redirect}) {
            await store.dispatch('project/getItem', params.id);
            if (store.getters['project/getItemLoadStatus'] === 'ERROR') {
                redirect('/error/project404');
            }
        },
        watch: {
            'data.requestOptions.processName' () {
                this.hideSubmitButton = false;
            }
        },
        computed: {
            ...mapGetters({
                itemSrc: 'project/getItem',
                storeIndustries: 'site/industryList'
            }),
            projectCompany () {
                if (!this.isEmpty) {
                    return this.item['Автор проекта'];
                }
                return {};
            },
            isParticipants () {
                return (!this.isEmpty) && this.item['Участники проекта'] && this.item['Участники проекта'].length > 0;
            }
        },
        methods: {
            ...mapActions({
                loadNotificationsList: 'notification/loadNotificationList'
            })
        }
    };
</script>

<style lang="stylus">

    .project-info
        padding 0

        .project-info
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
