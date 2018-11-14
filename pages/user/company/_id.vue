<template>
    <v-container fluid flat class="company-info" v-if="!isEmpty">
        <v-layout row child-flex>
            <v-flex style="flex-basis: 100%;">
                <div class="company-info__info-wrapper">
                    <company-card
                            v-if="!isEmpty"
                            :itemSrc="itemSrc"
                    />
                </div>
            </v-flex>
            <v-flex style="flex-basis: 480px; min-width: 480px;">
                <v-tabs
                        v-model="tabs"
                        color="#35323f"
                        hide-slider
                        dark
                >
                    <v-tab>
                        <v-icon medium class="mr-1">person</v-icon>
                        Contacts
                    </v-tab>
                    <v-tab>
                        <v-icon medium class="mr-1">work</v-icon>
                        Projects
                        <span class="ml-2 text__label">
                                {{ projectsList.length }}
                            </span>
                    </v-tab>
                </v-tabs>
                <div style="height: calc(100vh - 124px); background: #e8e7eb;">
                    <div class="company-info__tabs-wrapper">
                        <v-tabs-items v-model="tabs">
                            <v-tab-item>
                                <contact-mini-card
                                        :itemSrc="itemSrc"
                                >
                                </contact-mini-card>
                            </v-tab-item>
                            <v-tab-item>
                                <v-container grid-list-md v-if="projectsList.length > 0">
                                    <v-layout column>
                                        <v-flex v-for="project in projectsList"
                                                :key="project.entityInstancePk.entityInstanceId">
                                            <project-mini-list-card

                                                    :itemSrc="project"
                                            />
                                        </v-flex>
                                    </v-layout>
                                </v-container>
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

    import ContactMiniCard from '~/components/cards/ContactMiniCard';
    import ProjectMiniListCard from '~/components/cards/ProjectMiniListCard';
    import CompanyCard from '~/components/cards/CompanyCard';
    import ItemMixin from '~/mixins/ItemMixin';

    export default {
        name: 'company-info-page',
        layout: 'site',
        validate ({ params }) {
            console.log('[company/_id] Validating id');
            return Boolean(params.id) && !Number.isNaN(Number(params.id));
        },
        components: {
            ContactMiniCard,
            ProjectMiniListCard,
            CompanyCard
        },
        mixins: [ItemMixin],
        data: () => ({
            tabs: 0
        }),
        async fetch ({params, store, redirect}) {
            await store.dispatch('company/getItem', params.id);
            if (store.getters['company/getItemLoadStatus'] === 'ERROR') {
                redirect('/error/company404');
            }
        },
        computed: {
            ...mapGetters({
                itemSrc: 'company/getItem',
                storeIndustries: 'site/industryList'
            }),
            projectsList () {
                return _.get(this.itemSrc, 'object.__projects', []);
            }
        }
    };
</script>

<style lang="stylus" scoped>
    .company-info
        padding 0

        small
            display block
            line-height: 1.4

        .company-info
            &__info-wrapper
                background-color: #f0eff1
                height: calc(100vh - 64px)
                overflow auto
                padding 20px

            &__img-info
                background rgba(0, 0, 0, 0.4)
                padding 64px 20px
                text-align: center
                line-height 1

                h2
                    font-size 18px
                    margin-top 16px

            &__item-info
                position absolute
                z-index: 20
                width: 300px
                height 300px
                right 100px
                top 100px
                background lightgoldenrodyellow
</style>
