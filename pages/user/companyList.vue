<template>
    <v-container fluid flat>
        <v-layout class="company-list" row child-flex>
            <v-flex fill-height class="company-list__filters">
                <v-toolbar height="58" dark color="#35323f"></v-toolbar>
                <v-container grid-list-lg fill-height>
                        <v-layout column align-content-start style="padding: 24px; overflow-y: auto; height: calc(100% - 58px)">
                            <v-flex style="flex: 0;">
                                <v-text-field
                                        v-model="filters.title"
                                        class="widget-field__text"
                                        label="Enter company name"
                                        append-icon="search"
                                        solo
                                        flat
                                />
                            </v-flex>
                            <v-divider class="my-4"></v-divider>
                            <v-flex style="flex: 0;">
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
                            <v-flex style="flex: 0;">
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
                            <v-flex class="mt-3" style="flex: 0;">
                                <v-autocomplete
                                        :attach="true"
                                        open-on-clear
                                        :items="industries"
                                        v-model="filters.industry"
                                        class="widget-field__select"
                                        label="Select industry"
                                        single-line
                                        multiple
                                        solo
                                        flat
                                >
                                    <template
                                            slot="selection"
                                            slot-scope="{ item, index }"
                                    >
                                        <template v-if="index === 0">
                                            <v-avatar tile :size="16" class="mr-2" v-if="item.icon_list"><img :src="item.icon_list" alt="icon"></v-avatar>
                                            <div class="input__label">{{ item.text }}</div>
                                        </template>
                                        <span
                                                v-if="index === 1"
                                                class="grey--text caption ml-2"
                                        >(+{{ filters.industry.length - 1 }} others)</span>
                                    </template>
                                    <template
                                            slot="item"
                                            slot-scope="{ item }"
                                    >
                                        <v-avatar tile :size="16" class="mr-2"><img :src="item.icon_list" v-if="item.icon_list" alt="icon"></v-avatar>
                                        <div class="input__label">{{ item.text }}</div>
                                    </template>
                                </v-autocomplete>
                            </v-flex>
                            <v-flex style="flex: 0;">
                                <v-btn block dark round @click.native="filterIt">Show results</v-btn>
                            </v-flex>
                            <v-spacer></v-spacer>
                        </v-layout>
                </v-container>
            </v-flex>
            <v-flex fill-height style="flex-basis: 100%;">
                <v-tabs
                        v-model="tabs"
                        hide-slider
                        color="#35323f"
                        dark
                >
                    <v-tab>
                        <h4 style="font-weight: normal;">Companies</h4>
                        <span class="ml-2 text__label">
                            {{ companiesList.length }}
                        </span>
                    </v-tab>
                    <v-tab>
                        <h4 style="font-weight: normal;">FSUE</h4>
                        <span class="ml-2 text__label">
                            {{ FSUEList.length }}
                        </span>
                    </v-tab>
                    <v-tab>
                        <h4 style="font-weight: normal;">Investors</h4>
                        <span class="ml-2 text__label">
                            {{ investorsList.length }}
                        </span>
                    </v-tab>
                </v-tabs>
                <v-layout row fill-height>
                    <v-flex xs6>
                        <v-layout style="box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.11)" class="mb-1">
                            <v-spacer></v-spacer>
                            <v-flex style="flex: 0 0 186px; border: 1px solid rgba(53, 50, 63, 0.18)" class="ma-3">
                                <v-select
                                        class="company-list__sort-select"
                                    :items="sortArr"
                                    v-model="sort"
                                    solo
                                    flat
                                >
                                </v-select>
                            </v-flex>
                        </v-layout>
                        <div class="company-list__list" >
                            <v-tabs-items v-model="tabs">
                                <v-tab-item>
                                    <v-layout column v-if="companiesList.length > 0">
                                        <template v-for="item in companiesList" >
                                            <v-hover>
                                                <v-flex
                                                        slot-scope="{ hover }"
                                                        :style="{zIndex: hover ? 10 : 0}"
                                                        :key="item.entityDesc"
                                                >
                                                    <company-list-card
                                                            :class="`elevation-${hover ? 6 : 0}`"
                                                            :itemSrc="item"
                                                            @click.native="selectedItem = item"
                                                    />
                                                </v-flex>
                                            </v-hover>
                                        </template>
                                    </v-layout>
                                    <v-layout column align-center v-else style="background: #fff; height: 100%;">
                                        <v-spacer></v-spacer>
                                        <v-flex class="text-xs-center">
                                            <img :src="noContactsIcon" :width="85" :height="85" class="my-4">
                                            <div class="text__label mb-4">No company is suitable for your<br>request. Soften the filter settings<br>and try again.</div>

                                        </v-flex>
                                        <v-spacer></v-spacer>
                                    </v-layout>
                                </v-tab-item>
                                <v-tab-item>
                                    <v-layout column v-if="FSUEList.length > 0">
                                        <template v-for="item in FSUEList">
                                            <v-hover>
                                                <v-flex
                                                        slot-scope="{ hover }"
                                                        :style="{zIndex: hover ? 10 : 0}"
                                                        :key="item.entityDesc"
                                                >
                                                    <company-list-card
                                                            :itemSrc="item"
                                                            :class="`elevation-${hover ? 6 : 0}`"
                                                            @click.native="selectedItem = item"
                                                    />
                                                </v-flex>
                                            </v-hover>
                                        </template>
                                    </v-layout>
                                    <v-layout column align-center v-else style="background: #fff; height: 100%;">
                                        <v-spacer></v-spacer>
                                        <v-flex class="text-xs-center">
                                            <img :src="noContactsIcon" :width="85" :height="85" class="my-4">
                                            <div class="text__label mb-4">No company is suitable for your<br>request. Soften the filter settings<br>and try again.</div>

                                        </v-flex>
                                        <v-spacer></v-spacer>
                                    </v-layout>
                                </v-tab-item>
                                <v-tab-item>
                                    <v-layout column v-if="investorsList.length > 0">
                                        <template v-for="item in investorsList">
                                            <v-hover>
                                                <v-flex
                                                        slot-scope="{ hover }"
                                                        :style="{zIndex: hover ? 10 : 0}"
                                                        :key="item.entityDesc"
                                                >
                                                    <company-list-card
                                                            :class="`elevation-${hover ? 6 : 0}`"
                                                            :itemSrc="item"
                                                            @click.native="selectedItem = item"
                                                    />
                                                </v-flex>
                                            </v-hover>
                                        </template>
                                    </v-layout>
                                    <v-layout column align-center v-else style="background: #fff; height: 100%;">
                                        <v-spacer></v-spacer>
                                        <v-flex class="text-xs-center">
                                            <img :src="noContactsIcon" :width="85" :height="85" class="my-4">
                                            <div class="text__label mb-4">No company is suitable for your<br>request. Soften the filter settings<br>and try again.</div>

                                        </v-flex>
                                        <v-spacer></v-spacer>
                                    </v-layout>
                                </v-tab-item>
                            </v-tabs-items>
                        </div>
                    </v-flex>
                    <v-flex xs6>
                        <v-layout
                                v-if="selectedItem.object"
                                fill-height
                                class="company-list__company-info" >
                            <company-mini-card
                                    v-if="selectedItem.object"
                                    :itemSrc="selectedItem"
                            />
                        </v-layout>
                        <v-layout column align-center v-else style="background: #f3f4f8; height: 100%;">
                            <v-spacer></v-spacer>
                            <v-flex class="text-xs-center">
                                <img :src="noContactIcon" :width="85" :height="85" class="my-4">
                                <div class="text__label mb-4">Click on one of the companies in the<br>list on the left to see a short<br>summary</div>

                            </v-flex>
                            <v-spacer></v-spacer>
                        </v-layout>
                    </v-flex>
                </v-layout>


            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import CompanyListCard from '~/components/cards/CompanyListCard';
    import CompanyMiniCard from '~/components/cards/CompanyMiniCard';
    import {mapGetters, mapActions} from 'vuex';
    import _ from 'lodash';

    const defaultFilterOptions = {
        title: '',
        country: null,
        region: null,
        industry: []
    };

    export default {
        name: 'company-list-page',
        layout: 'site',
        components: {
            CompanyListCard,
            CompanyMiniCard
        },
        data: () => ({
            toggleButton: 0,
            defaultIndustryIcon: `${process.env.base}/img/site/default_industry.png`,
            noContactIcon: `${process.env.base}/img/icons/noContacts.svg`,
            noContactsIcon: `${process.env.base}/img/icons/sad_face.svg`,
            tabs: 0,
            sortArr: [
                {text: 'Sort by name A—Z', value: 'az'},
                {text: 'Sort by name Z—A', value: 'za'}
                ],
            sort: 'az',
            initRegion: true,
            freeze: false,
            filters: defaultFilterOptions,
            selectedId: null,
            pagination: {},
            selectedEntityDesc: '',
            selectedItem: {}

        }),
        created () {
            console.log('[CompanyList] Created! Loading list!');
            this.filters = Object.assign({}, this.storeFilters);
            this.getList();
        },
        watch: {
            tabs () {
                this.clearSelectedCompany();
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
                    console.log('[CompanyList/pagination] Pagination changed to:');
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
                list: 'company/getList',
                companiesListSrc: 'company/getCompanies',
                FSUEListSrc: 'company/getFSUE',
                investorsListSrc: 'company/getInvestors',
                loaded: 'company/listLoadStatus',
                storeFilters: 'company/getFilters',
                storeRegions: 'site/regionList',
                storeCountries: 'site/countryList',
                storeIndustries: 'site/industryList'
            }),
            companiesList () {
                return this.companiesListSrc.sort((a, b) => {
                    if (this.sort === 'az') {
                        return a.object['Название'] && a.object['Название'].localeCompare(b.object['Название']);
                    } else {
                        return b.object['Название'] && b.object['Название'].localeCompare(a.object['Название']);
                    }
                });
            },
            FSUEList () {
                return this.FSUEListSrc.sort((a, b) => {
                    if (this.sort === 'az') {
                        return a.object['Название'] && a.object['Название'].localeCompare(b.object['Название']);
                    } else {
                        return b.object['Название'] && b.object['Название'].localeCompare(a.object['Название']);
                    }
                });
            },
            investorsList () {
                return this.investorsListSrc.sort((a, b) => {
                    if (this.sort === 'az') {
                        return a.object['Название'] && a.object['Название'].localeCompare(b.object['Название']);
                    } else {
                        return b.object['Название'] && b.object['Название'].localeCompare(a.object['Название']);
                    }
                });
            },
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
                getList: 'company/getList',
                setFilter: 'company/setFilter',
                getRegionsList: 'site/loadRegionList'
            }),
            getItemById (id) {
                return _.find(this.list, {entityInstancePk: {entityInstanceId: id}}) || {};
            },
            filterIt () {
                this.setFilter(this.filters);
                this.clearSelectedCompany();
                this.$nextTick(() => this.getList());
            },
            clearSelectedCompany () {
                this.selectedId = null;
                this.selectedEntityDesc = '';
                this.selectedItem = {};
            }
        }
    };
</script>

<style lang="stylus">
    .small-list
        font-size

    .company-list
        position fixed
        width calc( 100% - 80px)
        height calc( 100vh - 64px )
        padding 0

        .v-text-field__details
        .v-messages
            display none

        .company-list
            &__sort-select .v-input__slot
                margin-bottom: 0


            &__filters
                flex 0 0 256px;
                background-color: #e8e7eb;
                padding 0

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
                height calc( 100% - 58px )
                overflow-y auto

                .v-tabs__items
                .v-tabs__content
                    height 100%
                .v-tabs__content
                    overflow-y auto

            &__company-info
                height calc( 100% - 58px )
                background-color: #f3f4f8;
                overflow-y auto
                padding-top 16px
                padding-left 16px
                padding-right 16px

    </style>
