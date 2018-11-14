<template>
    <v-container fluid flat>
        <v-layout class="article-list" row child-flex>
            <v-flex fill-height class="article-list__filters">
                <v-container grid-list-lg wrap>
                    <v-layout column align-content-start>
                        <v-flex class="mb-4">
                            <h2>Analytics</h2>
                        </v-flex>
                        <v-flex>
                            <v-text-field
                                    v-model="filters.title"
                                    class="widget-field__text"
                                    label="Search for name"
                                    append-icon="search"
                                    solo
                                    flat
                            />
                        </v-flex>
                        <v-divider class="my-4" color="gray"></v-divider>
                        <v-flex>
                            <v-select
                                    :attach="true"
                                    open-on-clear
                                    :items="industries"
                                    v-model="filters.industry"
                                    class="widget-field__select"
                                    label="Select industry"
                                    single-line
                                    solo
                                    flat
                            >
                                <template
                                        slot="selection"
                                        slot-scope="{ item }"
                                >
                                    <v-avatar tile :size="16" class="mr-2" v-if="item.icon_list"><img
                                            :src="item.icon_list" alt="icon"></v-avatar>
                                    <div class="input__label">{{ item.text }}</div>
                                </template>
                                <template
                                        slot="item"
                                        slot-scope="{ item }"
                                >
                                    <v-avatar tile :size="16" class="mr-2"><img :src="item.icon_list"
                                                                                v-if="item.icon_list" alt="icon">
                                    </v-avatar>
                                    <div class="input__label">{{ item.text }}</div>
                                </template>
                            </v-select>
                        </v-flex>
                        <v-spacer></v-spacer>
                    </v-layout>
                </v-container>
            </v-flex>
            <v-flex fill-height style="flex-basis: 100%;" class="article-list__list">
                <v-container grid-list-xl fluid>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <v-card class="article-list__list-header">
                                <v-card-text style="height: 100%;padding: 16px 16px 0;">
                                    <v-layout row jistify-center align-center fill-height>
                                        <v-flex xs12 lg6>
                                            <h1 class="dark mb-2">Analytic materials</h1>
                                            <h4 class="dark">on the main branches of industry</h4>
                                        </v-flex>
                                        <v-flex xs6 md3>
                                            <v-layout align-center>
                                                <v-flex style="flex: 0 0 20px">
                                                    <v-avatar size="20" tile class="mr-2">
                                                        <v-img :src="businessPlansIcon" contain alt="avatar"></v-img>
                                                    </v-avatar>
                                                </v-flex>
                                                <v-flex>
                                                    <h2 class="dark">
                                                        research, business<br>
                                                        plans, etc.
                                                    </h2>
                                                </v-flex>
                                            </v-layout>
                                        </v-flex>
                                        <v-flex xs6 md3>
                                            <v-layout align-center>
                                                <v-flex style="flex: 0 0 20px">
                                                    <v-avatar size="20" tile class="mr-2">
                                                        <v-img :src="freshArticlesIcon" contain alt="avatar"></v-img>
                                                    </v-avatar>
                                                </v-flex>
                                                <v-flex>
                                                    <h2 class="dark">
                                                        fresh articles<br>
                                                        every week
                                                    </h2>
                                                </v-flex>
                                            </v-layout>
                                        </v-flex>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-flex>
                        <v-flex lg6 xs12 v-for="item in list" :key="item.entityDesc">
                            <article-list-card
                                    extend
                                    :itemSrc="item"
                                    @click.native="$router.push(`/article/${item.entityInstancePk.entityInstanceId}`)"
                            />
                        </v-flex>
                    </v-layout>
                </v-container>

            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import ArticleListCard from '~/components/cards/ArticleListCard';
    import {mapGetters, mapActions} from 'vuex';
    import _ from 'lodash';

    const defaultFilterOptions = {
        title: '',
        country: null,
        industry: null
    };

    export default {
        name: 'article-list',
        layout: 'site',
        components: {
            ArticleListCard
        },
        data: () => ({
            toggleButton: 0,
            defaultIndustryIcon: `${process.env.base}/img/site/default_industry.png`,
            freshArticlesIcon: `${process.env.base}/img/icons/freshArticles.svg`,
            businessPlansIcon: `${process.env.base}/img/icons/businessPlans.svg`,
            tabs: 0,
            initRegion: true,
            freeze: false,
            filters: defaultFilterOptions,
            selectedId: null,
            pagination: {},
            selectedEntityDesc: '',
            selectedItem: {}

        }),
        created () {
            console.log('[ProjectListBlock] Created! Loading list!');
            this.filters = Object.assign({}, this.storeFilters);
        },
        watch: {
            filters: {
                handler () {
                    this.filterIt();
                },
                deep: true
            },
            pagination: {
                handler (val) {
                    if (this.freeze) {
                        return;
                    }
                    this.freeze = true;
                    console.log('[ProjectListBlock/pagination] Pagination changed to:');
                    console.dir(val);
                    const { sortBy, descending } = this.pagination;
                    let localOrderBy = '';
                    if (sortBy !== null) {
                        localOrderBy = `${sortBy} ${descending ? ' ASC' : ' DESC'}`;
                    }
                    this.getList({
                        pageNumber: this.pagination.pageNumber,
                        pageSize: 100,
                        orderBy: localOrderBy
                    });
                },
                deep: true
            },
            loaded (val) {
                if (val === 'LOADED') {
                    this.$nextTick(() => {
                        this.freeze = false;
                    });
                }
            }
        },
        computed: {
            ...mapGetters({
                list: 'analytics/getList',
                loaded: 'analytics/listLoadStatus',
                storeFilters: 'analytics/getFilters',
                storeCountries: 'site/countryList',
                storeIndustries: 'site/industryList'
            }),
            countries () {
                return _.concat([{
                    text: 'All countries',
                    value: null
                }], this.storeCountries);
            },
            industries () {
                return _.concat([{
                    text: 'All Industries',
                    value: null
                }], this.storeIndustries);
            },
            items () {
                return this.list.filter(item => item.object['Отрасль']);
            }
        },
        methods: {
            ...mapActions({
                getList: 'analytics/getList',
                setFilter: 'analytics/setFilter'
            }),
            getItemById (id) {
                return _.find(this.list, {entityInstancePk: {entityInstanceId: id}}) || {};
            },
            filterIt () {
                this.setFilter(this.filters);
                this.$nextTick(() => this.getList());
            }
        }
    };
</script>

<style lang="stylus">
    .small-list
        font-size

    .article-list
        position fixed
        width calc( 100% - 80px)
        height calc( 100vh - 64px )
        padding 0

        .v-text-field__details
        .v-messages
            display none

        .article-list
            &__filters
                width: 256px;
                max-width: 256px;
                height: 100%
                background-color: #e8e7eb;
                padding 20px

            &__item-info
                position absolute
                z-index: 20
                width: 300px
                height 300px
                right 100px
                top 100px
                background lightgoldenrodyellow

            &__list
                background-color: #f3f4f8;
                height 100%
                padding 16px
                overflow auto

            &__list-header
                width 100%
                height: 160px
                background-color: #0f7acd

    </style>
