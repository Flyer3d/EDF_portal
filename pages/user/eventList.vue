<template>
    <v-container fluid flat>
        <v-layout class="event-list" row child-flex>
            <v-flex fill-height class="event-list__filters">
                <v-container grid-list-lg wrap>
                    <v-layout column align-content-start>
                        <v-flex class="mb-4">
                            <h3>Events</h3>
                        </v-flex>
                        <v-flex xs12 class="mb-1">
                            <v-autocomplete
                                    :attach="true"
                                    open-on-clear
                                    :items="countries"
                                    v-model="filters.country"
                                    class="widget-field__select"
                                    single-line
                                    solo
                                    flat
                            />
                        </v-flex>
                        <v-flex xs12 class="mb-1">
                            <v-autocomplete
                                    :disabled="!filters.country"
                                    :attach="true"
                                    open-on-clear
                                    :items="regions"
                                    v-model="filters.region"
                                    class="widget-field__select"
                                    single-line
                                    solo
                                    flat
                            />
                        </v-flex>
                        <v-flex>
                            <v-autocomplete
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
                            </v-autocomplete>
                        </v-flex>
                        <!--<v-flex xs12>-->
                        <!--<v-btn block dark round @click.native="filterIt">Show results</v-btn>-->
                        <!--</v-flex>-->
                        <v-spacer></v-spacer>
                    </v-layout>
                </v-container>
            </v-flex>
            <v-flex fill-height style="flex-basis: 100%;" class="event-list__list">
                <!--<v-progress-linear v-if="loaded === 'LOADING'" color="blue" indeterminate></v-progress-linear>-->
                <v-container grid-list-xl fluid>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <v-img :src="eventsBgSrc" class="event-list__list-header">
                                <v-layout column jistify-center align-center fill-height>
                                    <v-flex>
                                        <h1 class="dark mb-2 text-xs-center">Major Industry Events<br>
                                            Around the World</h1>
                                    </v-flex>
                                    <v-spacer></v-spacer>
                                    <v-flex style="width: 100%;">
                                        <v-text-field
                                                v-model="filters.title"
                                                class="widget-field__text"
                                                label="Searching for events"
                                                append-icon="search"
                                                solo
                                                flat
                                                full-width
                                                height="60"
                                        />
                                    </v-flex>

                                </v-layout>
                            </v-img>
                        </v-flex>
                        <v-flex lg6 xs12 v-for="item in list" :key="item.entityInstancePk.entityInstanceId">
                            <event-list-card
                                    extend
                                    :itemSrc="item"
                                    @click.native="$router.push(`/event/${item.entityInstancePk.entityInstanceId}`)"
                            />
                        </v-flex>
                    </v-layout>
                </v-container>

            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import EventListCard from '~/components/cards/EventListCard';
    import {mapGetters, mapActions} from 'vuex';
    import _ from 'lodash';

    const defaultFilterOptions = {
        title: '',
        country: null,
        industry: null
    };

    export default {
        name: 'event-list-page',
        layout: 'site',
        components: {
            EventListCard
        },
        data: () => ({
            toggleButton: 0,
            defaultIndustryIcon: `${process.env.base}/img/site/default_industry.png`,
            eventsBgSrc: `${process.env.base}/img/events/eventsBg.jpg`,

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
            'filters.country' (val) {
                if (this.initRegion) {
                    this.initRegion = false;
                } else {
                    this.filters.region = null;
                }
                if (val) {
                    this.getRegionsList(val);
                }
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
                list: 'events/getList',
                loaded: 'events/listLoadStatus',
                storeFilters: 'events/getFilters',
                storeCountries: 'site/countryList',
                storeRegions: 'site/regionList',
                storeIndustries: 'site/industryList'
            }),
            countries () {
                return _.concat([{
                    text: 'All countries',
                    value: null
                }], this.storeCountries);
            },
            regions () {
                return _.concat([{
                    text: 'All regions',
                    value: null
                }], this.storeRegions);
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
                getList: 'events/getList',
                setFilter: 'events/setFilter',
                getRegionsList: 'site/loadRegionList'
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

    .event-list
        position fixed
        width calc( 100% - 80px)
        height calc( 100vh - 64px )
        padding 0

        .v-text-field__details
        .v-messages
            display none

        .event-list
            &__filters
                width 256px
                max-width 256px
                height 100%
                background-color #e8e7eb
                padding 20px

            &__item-info
                position absolute
                z-index 20
                width 300px
                height 300px
                right 100px
                top 100px
                background lightgoldenrodyellow

            &__list
                background-color #f3f4f8
                height 100%
                padding 16px
                overflow auto

            &__list-header
                width 100%
                height 250px
                padding 40px 40px 20px

    </style>
