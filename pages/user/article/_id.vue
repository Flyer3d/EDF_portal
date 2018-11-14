<template>
    <v-container fluid flat class="article-info" v-if="!isEmpty">
            <v-layout row child-flex>
                <v-flex style="flex-basis: 100%;">
                    <div  class="article-info__info-wrapper">
                        <article-card
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
                            <v-tab class="ml-2">
                                In the Same Category
                            </v-tab>
                        </v-tabs>
                    <div  style="height: calc(100vh - 124px); background: #e8e7eb;">
                        <div  class="article-info__tabs-wrapper">
                        <v-tabs-items v-model="tabs">
                            <v-tab-item>
                                <v-container grid-list-md v-if="articlesList.length > 0">
                                    <v-layout column>
                                        <v-flex v-for="article in articlesList" :key="article.entityInstancePk.entityInstanceId">
                                            <article-list-card
                                                    :itemSrc="article"
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
    import ItemMixin from '~/mixins/ItemMixin';
    import ArticleListCard from '~/components/cards/ArticleListCard';
    import ArticleCard from '~/components/cards/ArticleCard';

    export default {
        name: 'article-info-page',
        layout: 'site',
        mixins: [ItemMixin],
        validate ({ params }) {
            console.log('[article/_id] Validating id');
            return Boolean(params.id) && !Number.isNaN(Number(params.id));
        },
        components: {
            ArticleListCard,
            ArticleCard
        },
        data: () => ({
            tabs: 0
        }),
        async fetch ({params, store, redirect}) {
            await store.dispatch('analytics/getItem', params.id);
            if (store.getters['analytics/getItemLoadStatus'] === 'ERROR') {
                redirect('/error/404');
            }
        },
        computed: {
            ...mapGetters({
                itemSrc: 'analytics/getItem'
            }),
            articlesList () {
                return _.get(this.itemSrc, 'object.__sameArticles', []);
            }
        }
    };
</script>

<style lang="stylus">


    .article-info
        padding 0

        small
            display block
            line-height: 1.4

        .article-info
            &__info-wrapper
                background-color: #f0eff1
                height: calc(100vh - 64px)
                overflow auto
                padding 20px

            &__tabs-wrapper
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
