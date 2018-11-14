<template>
    <v-layout class="project-list">
        <v-flex class="project-list__filters">
            <v-container grid-list-lg wrap>
                <v-layout column align-content-start>
                    <v-flex xs12 class="project-list__toggle">
                        <v-btn-toggle mandatory v-model="toggleButton" color="primary" class="btn-toggle--round">
                            <v-btn flat block color="primary">
                                <img :src="listIcon" width="20" height="20" class="ml-2 mr-1">
                            </v-btn>
                            <v-btn
                                    flat
                                    block
                                    color="primary"
                                    nuxt
                                    to="/"
                            >
                                <img :src="mapIcon" width="20" height="20" class="ml-1 mr-2">
                            </v-btn>
                        </v-btn-toggle>
                    </v-flex>
                    <v-flex xs12 class="pb-0">
                        <v-text-field
                                v-model="filters.title"
                                class="widget-field__text"
                                label="Enter project name"
                                append-icon="search"
                                solo
                                flat
                        />
                    </v-flex>
                    <v-divider class="my-4"></v-divider>
                    <v-flex xs12 class="py-0 mb-2">
                        <v-autocomplete
                                ref="countries"
                                :attach="true"
                                open-on-clear
                                :items="countries"
                                v-model="filters.country"
                                class="widget-field__select"
                                @focus="$refs.countries.$refs.input.select()"
                                single-line
                                solo
                                flat
                        />
                    </v-flex>
                    <v-flex xs12 class="py-0 mt-1 mb-4">
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
                    <v-flex xs12 class="py-0 mt-2">
                        <v-autocomplete
                                :attach="true"
                                ref="industries"
                                open-on-clear
                                :items="industries"
                                v-model="filters.industry"
                                @focus="$refs.industries.$refs.input.select()"
                                class="widget-field__select"
                                single-line
                                solo
                                flat
                        >
                            <template
                                    slot="selection"
                                    slot-scope="{ item }"
                            >
                                <v-avatar tile :size="16" class="mr-2" v-if="item.icon_list"><img :src="item.icon_list"
                                                                                                  alt="icon"></v-avatar>
                                <div class="input__label">{{ item.text }}</div>
                            </template>
                            <template
                                    slot="item"
                                    slot-scope="{ item }"
                            >
                                <v-avatar tile :size="16" class="mr-2"><img :src="item.icon_list" v-if="item.icon_list"
                                                                            alt="icon"></v-avatar>
                                <div class="input__label small-list">{{ item.text }}</div>
                            </template>
                        </v-autocomplete>
                    </v-flex>
                    <v-flex xs12 class="mt-4 py-0">
                        <v-flex class="px-0">
                            <div class="text__label_small mb-2">Capital Required (USD)</div>
                        </v-flex>

                        <v-flex class="mt-2 py-0">
                            <v-layout row align-center>
                                <v-text-field
                                        v-model="filters.AP[0]"
                                        class="mt-0"
                                        suffics="@"
                                        hide-details
                                        single-line
                                        readonly
                                        solo
                                        flat
                                ></v-text-field>
                                &nbsp;-&nbsp;
                                <v-text-field
                                        v-model="filters.AP[1]"
                                        class="mt-0"
                                        hide-details
                                        readonly
                                        single-line
                                        solo
                                        flat
                                ></v-text-field>
                            </v-layout>
                        </v-flex>

                        <v-flex class="px-0">
                            <v-range-slider
                                    v-model="filters.AP"
                                    :max="storeConstraints.APMax"
                                    :min="storeConstraints.APMin"
                                    thumb-color="white"
                                    color="#0f7acd"
                                    :step="APStep"
                                    range

                            ></v-range-slider>
                        </v-flex>
                    </v-flex>
                    <v-flex xs12 class="py-0 mt-3">
                        <v-layout row align-center>
                            <v-flex xs6>
                                <div class="text__label_small">Recoupment, up to&nbsp;</div>
                            </v-flex>
                            <v-flex xs6 class="py-0">
                                <v-text-field
                                        v-model="filters.recoup"
                                        class="mt-0"
                                        hide-details
                                        readonly
                                        single-line
                                        solo
                                        flat
                                        suffix="mo"
                                ></v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-flex class="pa-0">
                            <v-slider
                                    v-model="filters.recoup"
                                    step="1"
                                    ticks
                                    thumb-color="white"
                                    color="#0f7acd"
                                    :max="storeConstraints.recoupMax"
                                    :min="0"
                            ></v-slider>
                        </v-flex>
                    </v-flex>
                    <v-flex xs12 class="py-0">
                        <v-flex class="px-0">
                            <div class="text__label_small">Own Equity (%)</div>
                        </v-flex>

                        <v-flex class="mt-2 pa-0">
                            <v-layout row align-center>
                                <v-flex xs5>
                                    <v-text-field
                                            v-model="filters.ownEquity[0]"
                                            class="mt-0"
                                            suffix="%"
                                            hide-details
                                            single-line
                                            readonly
                                            solo
                                            flat
                                    ></v-text-field>
                                </v-flex>
                                <v-flex xs2></v-flex>
                                <v-flex style="flex: 0;" class="pr-0">to</v-flex>
                                <v-flex xs5>
                                    <v-text-field
                                            v-model="filters.ownEquity[1]"
                                            class="mt-0"
                                            hide-details
                                            suffix="%"
                                            readonly
                                            single-line
                                            solo
                                            flat
                                    ></v-text-field>
                                </v-flex>
                            </v-layout>
                        </v-flex>

                        <v-flex class="pa-0">
                            <v-range-slider
                                    v-model="filters.ownEquity"
                                    :max="storeConstraints.ownEquityMax"
                                    :min="storeConstraints.ownEquityMin"
                                    thumb-color="white"
                                    color="#0f7acd"
                                    :step="10"
                                    range

                            ></v-range-slider>
                        </v-flex>
                        <!--</v-layout>-->
                    </v-flex>
                    <v-flex xs12 class="py-0">
                        <v-flex class="px-0">
                            <div class="text__label_small mb-2">
                                NPV (USD)
                                <v-tooltip top class="ml-1">
                                    <v-icon
                                            slot="activator"
                                            color="primary"
                                            size="15"
                                    >help_outline
                                    </v-icon>
                                    <span>Net Present Value</span>
                                </v-tooltip>
                            </div>
                        </v-flex>

                        <v-flex class="mt-2 py-0">
                            <v-layout row align-center>
                                <v-text-field
                                        v-model="filters.NPV[0]"
                                        class="mt-0"
                                        hide-details
                                        single-line
                                        readonly
                                        solo
                                        flat
                                ></v-text-field>
                                &nbsp;-&nbsp;
                                <v-text-field
                                        v-model="filters.NPV[1]"
                                        class="mt-0"
                                        hide-details
                                        readonly
                                        single-line
                                        solo
                                        flat
                                ></v-text-field>
                            </v-layout>
                        </v-flex>

                        <v-flex class="px-0">
                            <v-range-slider
                                    v-model="filters.NPV"
                                    :max="storeConstraints.NPVMax"
                                    :min="storeConstraints.NPVMin"
                                    thumb-color="white"
                                    color="#0f7acd"
                                    :step="NPVStep"
                                    range

                            ></v-range-slider>
                        </v-flex>
                        <!--</v-layout>-->
                    </v-flex>
                    <v-flex xs12 class="py-0 mt-3">
                        <div class="text__label_small mb-3">Stage of Readyness</div>
                        <v-select
                                open-on-clear
                                :items="stages"
                                v-model="filters.stage"
                                class="widget-field__select"
                                single-line
                                solo
                                flat
                        />
                    </v-flex>
                    <v-flex>
                        <v-checkbox
                                label="Only with Due Diligence"
                                v-model="filters.DD"
                        >
                            <span slot="label">Only with <span style="color:#e96a44">Due Diligence</span></span>
                        </v-checkbox>
                        <v-checkbox
                                label="Only Public Private Partnership"
                                v-model="filters.PPP"
                        ></v-checkbox>
                    </v-flex>
                    <v-flex xs12 class="mt-4">
                        <v-layout column align-center>
                            <v-btn dark round block @click.stop.native="filterIt"><span class="mx-3">Show results</span>
                            </v-btn>
                            <v-btn round
                                   outline
                                   small
                                   @click.stop.native="resetFilters">
                                <img :src="resetIcon" width="14" height="14" class="mr-2">Reset filters
                            </v-btn>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-flex>
        <v-flex>
            <v-data-table
                    :headers="headers"
                    :pagination.sync="pagination"
                    :loading="loaded !== 'LOADED'"
                    :items="fakeItems"
                    hide-actions
                    class="elevation-0 project-list__table"
                    dark
            >
                <template slot="headers" slot-scope="props">
                    <tr>
                        <th
                                v-for="header in props.headers"
                                :key="header.text"
                                :class="[
                                'column',
                                header.sortable ? 'sortable' : '',
                                pagination.descending ? 'desc' : 'asc',
                                header.value === pagination.sortBy ? 'active' : '',
                                'text-xs-left'
                            ]"
                                @click="changeSort(header)"
                                :style="`flex: 1 1 ${header.width}px;`"
                        >
                            {{ header.text }}
                            <v-tooltip v-if="header.tooltip" bottom class="mr-1">
                                <v-icon
                                        slot="activator"
                                        color="primary"
                                        size="15"
                                >help_outline
                                </v-icon>
                                <span>{{header.tooltip}}</span>
                            </v-tooltip>
                            <v-icon v-if="header.sortable" small>arrow_upward</v-icon>
                        </th>
                    </tr>
                </template>
                <div slot="no-data"></div>
            </v-data-table>
            <div class="project-list__list">
                <template v-for="item in items">
                    <project-list-card
                            :key="item.id"
                            :itemSrc="item"
                    />
                </template>
            </div>
        </v-flex>
    </v-layout>
</template>

<script>
    import ProjectListCard from '~/components/cards/ProjectListCard';
    import {mapGetters, mapActions} from 'vuex';
    import _ from 'lodash';

    const defaultFilterOptions = {
        title: '',
        country: null,
        region: null,
        industry: null,
        AP: [0, 1000000000],
        ownEquity: [0, 100],
        NPV: [0, 1000000000],
        recoup: 1000,
        stage: '',
        DD: false,
        PPP: false
    };

    const stages = [
        {text: 'No matter', value: ''},
        {text: 'Project Concept', value: 'Project Concept'},
        {text: 'Feasibility study', value: 'Feasibility study'},
        {text: 'Project Design', value: 'Project Design'},
        {text: 'Implementation', value: 'Implementation'}
    ];

    export default {
        name: 'project-list-page',
        layout: 'site',
        components: {
            ProjectListCard
        },
        data: () => ({
            stages: stages,
            toggleButton: 0,
            defaultIndustryIcon: `${process.env.base}/img/site/default_industry.png`,
            listIcon: `${process.env.base}img/icons/switch_list_white.svg`,
            mapIcon: `${process.env.base}img/icons/switch_map_black.svg`,
            resetIcon: `${process.env.base}img/icons/reset_grey.svg`,
            initRegion: true,
            freeze: false,
            fakeItems: [{}],
            filters: defaultFilterOptions,
            selectedId: null,
            pagination: {},
            selectedEntityDesc: '',
            selectedItem: {},
            headers: [
                {
                    sortable: false,
                    width: 24
                },
                {
                    text: 'Owner',
                    align: 'left',
                    width: 64,
                    sortable: true,
                    value: 'Автор проекта'
                },
                {
                    text: 'Project name',
                    width: 180,
                    align: 'left',
                    sortable: true,
                    value: 'Название'
                },
                {
                    text: 'Industry',
                    width: 120,
                    align: 'left',
                    sortable: true,
                    value: 'Отрасль'
                },
                {
                    text: 'Capital Required',
                    width: 160,
                    align: 'left',
                    sortable: true,
                    value: 'Capital Required (USD)'
                },
                {
                    text: 'Own Equity',
                    width: 80,
                    align: 'left',
                    sortable: true,
                    value: 'Собственный капитал (%)'
                },
                {
                    text: 'NPV',
                    width: 160,
                    align: 'left',
                    sortable: true,
                    value: 'Срок реализации проекта (мес)',
                    tooltip: 'Net Present Value'
                },
                {
                    text: 'Recoupment',
                    width: 120,
                    align: 'left',
                    sortable: true,
                    value: 'PBP (мес)'
                },
                {
                    text: 'PPP',
                    width: 12,
                    align: 'left',
                    sortable: true,
                    value: 'ГЧП',
                    tooltip: 'Public Private Partnership'
                },
                {
                    text: 'DD',
                    width: 12,
                    align: 'left',
                    sortable: true,
                    value: 'DD',
                    tooltip: 'Due Diligence'
                }
            ]
        }),
        created () {
            console.log('[ProjectList] Created! Loading list!');
            this.filters = Object.assign({}, this.storeFilters);
            this.getList();
            this.getBookmarkList();
        },
        watch: {
            storeFilters (val) {
                this.filters = Object.assign({}, val);
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
                list: 'project/getList',
                loaded: 'project/listLoadStatus',
                storeFilters: 'project/getFilters',
                storeConstraints: 'project/getConstraints',
                storeRegions: 'site/regionList',
                storeCountries: 'site/countryList',
                storeIndustries: 'site/industryList'
            }),
            APStep  () {
               if (this.storeConstraints.APMax !== this.storeConstraints.APMin) {
                   return Math.floor((this.storeConstraints.APMax - this.storeConstraints.APMin) / 20);
               }
               return 1;
            },
            NPVStep  () {
               if (this.storeConstraints.NPVMax !== this.storeConstraints.NPVMin) {
                   return Math.floor((this.storeConstraints.NPVMax - this.storeConstraints.NPVMin) / 20);
               }
               return 1;
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
                getList: 'project/getList',
                setFilter: 'project/setFilter',
                getRegionsList: 'site/loadRegionList',
                getBookmarkList: 'bookmark/getList'
            }),
            getItemById (id) {
                return _.find(this.list, {entityInstancePk: {entityInstanceId: id}}) || {};
            },
            filterIt () {
                this.setFilter(this.filters);
                this.$nextTick(() => this.getList());
            },
            resetFilters () {
                this.setFilter({});
                this.$nextTick(() => this.getList());
            },
            changeSort ({ value, sortable }) {
                if (!sortable) return;
                if (this.pagination.sortBy === value) {
                    this.pagination.descending = !this.pagination.descending;
                } else {
                    this.pagination.sortBy = value;
                    this.pagination.descending = false;
                }
            }
        }
    };
</script>

<style lang="stylus">
    .small-list
        font-size

    .project-list
        padding 0
        .v-text-field__details
        .v-messages
            display none

        .project-list
            &__toggle
                .v-btn-toggle
                    border-radius: 32px
                    width 110px
                    height 40px
                    .v-btn.v-btn--active:before
                    .v-btn
                        opacity 1
                        height 40px
                    .v-btn:last-child
                        border-radius 0 32px 32px 0
                    .v-btn:first-child
                        border-radius 32px 0 0 32px
            &__filters
                flex 0 0 256px;
                background-color: #e8e7eb;
                padding 24px
                .v-messages
                   display: none

                .v-input--slider
                    margin-top 0

                .v-input.v-input--checkbox label
                    opacity: 0.7;
                    font-family: Rubik;
                    font-size: 12px;
                    font-weight: 500;
                    font-style: normal;
                    font-stretch: normal;
                    line-height: 1.17;
                    letter-spacing: normal;
                    color: #524f5f;

            &__item-info
                position absolute
                z-index: 20
                width: 300px
                height 300px
                right 100px
                top 100px
                background lightgoldenrodyellow

            &__table
                table.v-table
                    background-color: #35323f
                    thead th
                        padding 0 8px

            &__list
                background-color: #f3f4f8;
                padding 16px
                height calc( 100% - 57px )
    </style>
