<template>
    <div class="project-map">
        <GmapMap
                class="project-map__map google-map"
                :center="{lat:55.75222, lng:37.61556}"
                :zoom="7"
                map-type-id="terrain"
                :options="googleMapOptions"
                style="width: 100%; height: 100%"
                ref="map"
        >
            <gmap-cluster
                    :zoomOnClick="true"
                    :maxZoom="9"
                    :styles="clusterStyle"
            >
                <GmapMarker
                        :key="m._id"
                        v-for="m in markers"
                        :position="m.position"
                        :clickable="true"
                        :title="m.title"
                        :icon="{
                            url: (selectedId === m._id) ? (m.DD ? m.icon_selected_marked : m.icon_selected) : (m.DD ? m.icon_marked : m.icon),
                            anchor: m.DD ? new google.maps.Point(40, 46) : new google.maps.Point(40, 40),
                            scaledSize: m.DD ? new google.maps.Size(47, 46) : new google.maps.Size(40, 40)}"
                        :draggable="false"
                        @click="markerClick(m._id)"
                />
            </gmap-cluster>
            <div slot="visible" v-if="selectedItemSrc.object" class="project-map__item-info" v-show="itemInfo">
                <v-btn
                        class="project-map__close"
                        absolute
                        fab
                        top
                        right
                        small
                        @click.native="itemInfo=false; selectedId=null"
                >
                    <v-icon>close</v-icon>
                </v-btn>
                <project-mini-card
                        style="overflow-x: auto; max-height: calc( 100vh - 190px )"
                        :itemSrc="selectedItemSrc"
                        :canClose="true"
                        @close="itemInfo=false"
                >
                </project-mini-card>
            </div>
            <div slot="visible" class="project-map__toggle">
                <v-btn-toggle mandatory flat v-model="toggleButton" color="primary" class="btn-toggle--round">
                    <v-btn
                            flat
                            block
                            color="primary"
                            nuxt
                            to="projectList"
                    >
                        <img :src="listIcon" width="20" height="20" class="ml-2 mr-1">
                    </v-btn>
                    <v-btn flat block color="primary">
                        <img :src="mapIcon" width="20" height="20" class="ml-1 mr-2">
                    </v-btn>
                </v-btn-toggle>
            </div>

            <div slot="visible" class="project-map__filters">
                <v-layout row style="padding-bottom: 10px">
                    <v-flex xs4 style="padding-right: 10px">
                        <v-autocomplete
                                ref="countries"
                                :attach="true"
                                open-on-clear
                                :items="countries"
                                v-model="filters.country"
                                class="widget-field__select"
                                @focus="$refs.countries.$refs.input.select()"
                                single-line
                                flat
                                solo
                        >
                        </v-autocomplete>
                    </v-flex>
                    <v-flex xs8>
                        <v-autocomplete
                                :attach="true"
                                open-on-clear
                                :items="regions"
                                v-model="filters.region"
                                :disabled="!filters.country"
                                class="widget-field__select"
                                single-line
                                flat
                                solo
                        >
                        </v-autocomplete>
                    </v-flex>
                </v-layout>
                <v-layout>
                    <v-flex style="padding-right: 10px">
                        <v-autocomplete
                                :attach="true"
                                ref="industries"
                                open-on-clear
                                item-avatar="icon_list"
                                :items="industries"
                                v-model="filters.industry"
                                @focus="$refs.industries.$refs.input.select()"
                                class="widget-field__select"
                                single-line
                                flat
                                solo
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
                                <div class="input__label">{{ item.text }}</div>
                            </template>
                        </v-autocomplete>
                    </v-flex>
                    <v-flex style="flex: 0;">
                        <v-menu
                                v-model="filtersMenu"
                                :close-on-content-click="false"
                                content-class="map-filters-menu"
                                :close-on-click="false"
                                :allow-overflow="true"
                                :nudge-width="200"
                                :nudge-bottom="20"
                                offset-y
                                bottom
                        >
                            <v-btn
                                    class="map-filters-menu__filters-btn"
                                    @click.native.stop="filtersMenu = !filtersMenu"
                                    slot="activator"
                                    dark
                                    round
                                    flat
                                    large
                                    :class="{active: filtersMenu}"
                            ><img :src="filtersMenu ? filterWhiteIcon : filterIcon" width="14" height="14" class="mr-2">Filters
                            </v-btn>
                            <v-card style="max-width: 600px; overflow: inherit; position: relative">
                                <v-btn
                                        class="v-btn__close"
                                        absolute
                                        fab
                                        top
                                        right
                                        small
                                        @click.native="filtersMenu = false"
                                >
                                    <v-icon>close</v-icon>
                                </v-btn>
                                <v-card-text>
                                    <v-container grid-list-lg class="fullwidth">
                                        <v-layout row wrap class="map-form pa-3 pb-0">
                                            <v-flex xs6 class="py-0">
                                                <div class="text__label_small mb-3">Capital Reqoired (USD)</div>

                                                <v-layout row align-center>
                                                    <v-flex class="py-0">
                                                        <v-text-field
                                                                v-model="filters.AP[0]"
                                                                class="mt-0"
                                                                hide-details
                                                                single-line
                                                                readonly
                                                                type="number"
                                                                box
                                                                flat
                                                        ></v-text-field>
                                                    </v-flex>
                                                    &nbsp;-&nbsp;
                                                    <v-flex class="py-0">
                                                        <v-text-field
                                                                v-model="filters.AP[1]"
                                                                class="mt-0"
                                                                hide-details
                                                                readonly
                                                                single-line
                                                                type="number"
                                                                box
                                                                flat
                                                        ></v-text-field>
                                                    </v-flex>
                                                </v-layout>
                                                <v-flex class="pa-0">
                                                    <v-range-slider
                                                            v-model="filters.AP"
                                                            :max="storeConstraints.APMax"
                                                            :min="storeConstraints.APMin"
                                                            :step="APStep"
                                                            range

                                                    ></v-range-slider>
                                                </v-flex>
                                            </v-flex>
                                            <v-flex xs4 class="py-0">
                                                <div class="text__label_small mb-3">Recoupment, up to&nbsp;</div>
                                                <v-text-field
                                                        v-model="filters.recoup"
                                                        suffix="Month"
                                                        class="mt-0"
                                                        hide-details
                                                        readonly
                                                        single-line
                                                        type="number"
                                                        box
                                                        flat
                                                ></v-text-field>
                                                <v-slider
                                                        v-model="filters.recoup"
                                                        step="1"
                                                        ticks
                                                        :max="storeConstraints.recoupMax"
                                                        :min="0"
                                                ></v-slider>
                                            </v-flex>

                                            <v-flex xs6 class="py-0">
                                                <div class="text__label_small mb-3">Own Equity (%)</div>
                                                <v-layout row align-center>
                                                    <v-flex class="py-0" xs5>
                                                        <v-text-field
                                                                v-model="filters.ownEquity[0]"
                                                                suffix="%"
                                                                class="mt-0"
                                                                hide-details
                                                                single-line
                                                                readonly
                                                                type="number"
                                                                box
                                                                flat
                                                        ></v-text-field>
                                                    </v-flex>
                                                    &nbsp;<v-spacer></v-spacer>
                                                    <v-flex class="py-0" xs5>
                                                        <v-text-field
                                                                v-model="filters.ownEquity[1]"
                                                                suffix="%"
                                                                class="mt-0"
                                                                hide-details
                                                                readonly
                                                                single-line
                                                                type="number"
                                                                box
                                                                flat
                                                        ></v-text-field>
                                                    </v-flex>
                                                </v-layout>
                                                <v-flex class="pa-0">
                                                    <v-range-slider
                                                            v-model="filters.ownEquity"
                                                            :max="storeConstraints.ownEquityMax"
                                                            :min="storeConstraints.ownEquityMin"
                                                            :step="10"
                                                            range
                                                    ></v-range-slider>
                                                </v-flex>
                                            </v-flex>
                                            <v-flex xs6 class="py-0">
                                                <div class="text__label_small mb-3">
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

                                                <v-layout row align-center>
                                                    <v-flex class="py-0">
                                                        <v-text-field
                                                                v-model="filters.NPV[0]"
                                                                class="mt-0"
                                                                hide-details
                                                                single-line
                                                                readonly
                                                                type="number"
                                                                box
                                                                flat
                                                        ></v-text-field>
                                                    </v-flex>
                                                    -&nbsp;
                                                    <v-flex class="py-0">
                                                        <v-text-field
                                                                v-model="filters.NPV[1]"
                                                                class="mt-0"
                                                                hide-details
                                                                readonly
                                                                single-line
                                                                type="number"
                                                                box
                                                                flat
                                                        ></v-text-field>
                                                    </v-flex>
                                                </v-layout>
                                                <v-flex class="pa-0">
                                                    <v-range-slider
                                                            v-model="filters.NPV"
                                                            :max="storeConstraints.NPVMax"
                                                            :min="storeConstraints.NPVMin"
                                                            :step="NPVStep"
                                                            range
                                                    ></v-range-slider>
                                                </v-flex>
                                            </v-flex>

                                            <v-flex xs6 class="py-0">
                                                <div class="text__label_small mb-3">Stage of Readyness</div>
                                                <v-select
                                                        open-on-clear
                                                        :items="stages"
                                                        v-model="filters.stage"
                                                        class="widget-field__select"
                                                        single-line
                                                        box
                                                        flat
                                                />
                                            </v-flex>
                                            <v-flex xs6 class="py-0">
                                                <div class="text__label_small mb-3">&nbsp;</div>
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
                                        </v-layout>
                                    </v-container>
                                </v-card-text>
                                <v-card-actions class="px-4 pb-4 pt-0">
                                    <v-btn round outline flat @click.native="resetFilters">
                                        <img :src="resetIcon" width="14" height="14" class="mr-2">Reset filters
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn round dark large @click.native="applyFilters">Show projects</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-menu>
                    </v-flex>
                </v-layout>
            </div>
        </GmapMap>
    </div>
</template>

<script>
    import ProjectMiniCard from '~/components/cards/ProjectMiniCard';
    import GmapCluster from 'vue2-google-maps/dist/components/cluster';
    import {gmapApi} from 'vue2-google-maps';
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

    const googleMapOptions = {
        mapTypeControl: false,
        fullscreenControl: false
    };

    export default {
        name: 'project-map-index-page',
        components: {
            ProjectMiniCard,
            GmapCluster
        },
        layout: 'site',
        data: () => ({
            stages: stages,
            filters: defaultFilterOptions,
            filtersMenu: false,
            initRegion: true,
            filterIcon: `${process.env.base}img/icons/filter.svg`,
            filterWhiteIcon: `${process.env.base}img/icons/filter_white.svg`,
            filterBlueIcon: `${process.env.base}img/icons/filter_blue.svg`,
            listIcon: `${process.env.base}img/icons/switch_list_black.svg`,
            mapIcon: `${process.env.base}img/icons/switch_map_white.svg`,
            resetIcon: `${process.env.base}img/icons/reset_grey.svg`,

            clusterStyle: [
                {
                    url: `${process.env.base}img/industry/cluster_map.svg`,
                    width: 40,
                    height: 40,
                    textColor: '#ffffff',
                    textSize: 16
                }],
            selectedId: null,
            toggleButton: 1,
            googleMapOptions: googleMapOptions,
            selectedItemSrc: {},
            itemInfo: false
        }),
        created () {
            console.log('[ProjectMap] Created! Loading list!');
            this.filters = Object.assign({}, this.storeFilters);
            this.getList();
            this.getBookmarkList();
        },
        watch: {
            'filters.country' (val) {
                if (this.initRegion) {
                    this.initRegion = false;
                } else {
                    this.filters.region = null;
                }
                if (val) {
                    this.getRegionsList(val);
                }
                this.filterIt();
            },
            'filters.region' () {
                this.filterIt();
            },
            'filters.industry' () {
                this.filterIt();
            },
            storeFilters (val) {
                this.filters = Object.assign({}, val);
            }
        },
        computed: {
            ...mapGetters({
                list: 'project/getList',
                loaded: 'project/listLoadStatus',
                storeFilters: 'project/getFilters',
                storeRegions: 'site/regionList',
                storeConstraints: 'project/getConstraints',
                storeCountries: 'site/countryList',
                storeIndustries: 'site/industryList',
                getIndustryById: 'site/getIndustryById',
                bookmarksList: 'bookmark/getProjectBookmarkList'
            }),
            google: gmapApi,
            APStep () {
                if (this.storeConstraints.APMax !== this.storeConstraints.APMin) {
                    return Math.floor((this.storeConstraints.APMax - this.storeConstraints.APMin) / 20);
                }
                return 1;
            },
            NPVStep () {
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
            markers () {
                return this.list
                    .filter(item => item.object['Точка на карте'])
                    .map(item => {
                        const industryId = _.get(item, 'object[\'Отрасль\'].entityInstancePk.entityInstanceId');
                        const industry = this.getIndustryById(industryId) || {};
                        const geoPoint = item.object['Точка на карте'] ? item.object['Точка на карте'].split('::') : [];
                        return {
                            position: {
                                lat: Number(geoPoint[0]),
                                lng: Number(geoPoint[1])
                            },
                            icon: industry.icon_map,
                            icon_marked: industry.icon_map_marked,
                            icon_selected_marked: industry.icon_map_selected_marked,
                            icon_selected: industry.icon_map_selected,
                            // ToDo!! Пересмотреть алгоритм!!!!
                            bookmarked: !_.isEmpty(_.find(this.bookmarksList, bookItem => bookItem.object.entityId === item.entityInstancePk.entityInstanceId)),
                            title: item.object['Название'],
                            DD: item.object.DD === 'True',
                            _id: item.entityInstancePk.entityInstanceId
                        };
                    });
            }
        },
        methods: {
            ...mapActions({
                getList: 'project/getList',
                getRegionsList: 'site/loadRegionList',
                setFilter: 'project/setFilter',
                getBookmarkList: 'bookmark/getList'
            }),
            markerClick (itemId) {
                console.log('Marker ckicked!!');
                console.dir(itemId);
                console.dir(this.getItemById(itemId));
                const item = this.getItemById(itemId);
                this.selectedId = _.get(item, 'entityInstancePk.entityInstanceId');
                this.selectedItemSrc = item;
                const geoPoint = item.object['Точка на карте'] ? item.object['Точка на карте'].split('::') : [];
                if (geoPoint.length > 0) {
                    this.$refs.map.panTo({
                        lat: Number(geoPoint[0]),
                        lng: Number(geoPoint[1])
                    });
                }
                this.itemInfo = true;
            },
            getItemById (id) {
                return _.find(this.list, {entityInstancePk: {entityInstanceId: id}}) || {};
            },
            resetFilters () {
                this.setFilter({});
                this.$nextTick(() => this.getList());
            },
            filterIt () {
                this.setFilter(this.filters);
                this.$nextTick(() => this.getList());
            },
            applyFilters () {
                this.filterIt();
                this.filtersMenu = false;
            },
            onFocus (ref) {
                console.log(`onFocus with param ${ref}`);
                console.dir(this.$refs);
                this.$refs[ref].$refs.input.select();
            }
        }
    };
</script>

<style lang="stylus">
    .map-filters-menu
        overflow inherit
        contain inherit !important
        transform translateX(-240px)

        &:after
            content: ''
            display block;
            width: 0;
            height: 0;
            border: 12px solid transparent;
            border-bottom-color: white;
            border-top: 0;
            position absolute;
            top: -12px;
            left 288px;


        &__filters-btn
            box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
            background-color: #fff;
            margin 0
            .v-btn__content
                opacity: 0.7;
                font-family: Rubik;
                font-size: 14px;
                font-weight: 500;
                font-style: normal;
                font-stretch: normal;
                line-height: normal;
                letter-spacing: normal;
                color: #524f5f;

        &__filters-btn:hover .v-btn__content
            color #0f7acd
            opacity 1

        &__filters-btn.active
            background-color #0f7acd
            .v-btn__content
                opacity: 0.6;
                font-family: Rubik;
                font-size: 14px;
                font-weight: 500;
                font-style: normal;
                font-stretch: normal;
                line-height: normal;
                letter-spacing: normal;
                color: #ffffff;

    .site.wbif .project-map__filters .v-input .v-input__slot
        margin-bottom 0

    .map-form
        background #fff


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

    .project-map
        position fixed
        width calc( 100% - 80px )
        height calc( 100vh - 64px )
        padding 0

        &__item-info
            position absolute
            z-index: 20
            width: 320px
            height 300px
            right 80px
            top 100px
            background transparent
            .project-map__close
                right: -12px
                width 24px
                height 24px
                top -12px !important

        &__filters
            position absolute
            z-index: 20
            width: 640px
            left 20px
            top 30px
            .v-input
                box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);

        &__toggle
            position absolute
            z-index: 20
            width: 100px
            right 44px
            top 30px
            .v-btn-toggle
                border-radius: 32px
                width 110px
                height 40px
                box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
                .v-btn.v-btn--active:before
                .v-btn
                    opacity 1
                    height 40px

                .v-btn:last-child
                    border-radius 0 32px 32px 0
                .v-btn:first-child
                    border-radius 32px 0 0 32px
</style>
