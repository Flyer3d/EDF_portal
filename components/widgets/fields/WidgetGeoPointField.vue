<template>
    <v-layout wrap class="widget-field">
        <v-flex xs12 sm12 md12 class="widget-field__label">
            {{fieldName}}{{(requiredTag && editable && !readonlyTag) ? '*' : ''}}
        </v-flex>
        <div v-if="documentation.length > 0" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description" v-if="!editable && inDescription">
                <span v-html="inDescription"></span>
            </v-flex>
            <v-flex xs12 sm12 md12 class="widget-field__description" v-else-if="outDescription">
                <span v-html="outDescription"></span>
            </v-flex>
        </div>
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-text-field
                    class="form__field"
                    name="text-field"
                    readonly
                    @focus="onFocus"
                    @click="mapDlg=(true && editable)"
                    @blur="validate"
                    :error="error"
                    :error-messages="errorMsg"
                    :mask="maskTag"
                    v-model="fieldData"
                    single-line
                    hide-details
            ></v-text-field>
        </v-flex>
        <v-dialog v-model="mapDlg" lazy @keydown.esc="mapDlg = false" max-width="800" content-class="map-dlg">

            <div style="position: relative">
                <v-btn
                        class="v-btn__close"
                        absolute
                        fab
                        top
                        right
                        small
                        @click.native="mapDlg = false"
                >
                    <v-icon>close</v-icon>
                </v-btn>
                <div class="pa-0" style="width: 100%; height:60vh">
                    <GmapMap
                            @click="placeMarker"
                            class="map-dlg__map google-map"
                            :center="{lat:55.75222, lng:37.61556}"
                            :zoom="7"
                            map-type-id="terrain"
                            :options="googleMapOptions"
                            style="width: 100%; height: 100%"
                            ref="map"
                    >
                        <gmap-info-window
                                class="info-window"
                                :options="infoOptions"
                                :position="infoWindowPos"
                                :opened="infoWinOpen"
                                @closeclick="infoWinOpen=false"
                        >
                            <v-layout align-center>
                                <v-flex>
                                    <h4 class="mb-2">{{infoAdress}}</h4>
                                    <div class="text__small">{{infoContent}}</div>

                                </v-flex>
                                <v-flex>
                                    <v-btn
                                            round
                                            dark
                                            @click="select"
                                            class="elevation-0"
                                    >Place a point here
                                    </v-btn>
                                </v-flex>
                            </v-layout>
                        </gmap-info-window>
                        <GmapMarker
                                v-if="marker.position"
                                :position="marker.position"
                                :icon="{
                                    url: markerIcon,
                                    anchor: new google.maps.Point(8, 8),
                                    scaledSize: new google.maps.Size(16, 16)
                                }"
                                :draggable="true"
                                :clickable="true"
                                @click="infoWinOpen = !infoWinOpen"
                        />
                        <div slot="visible" class="map-dlg__autocomplete">
                            <v-autocomplete
                                    ref="autocomplete"
                                    attach
                                    :loading="loading"
                                    :items="autocompleteArr"
                                    :search-input.sync="search"
                                    v-model="autocomplete"
                                    item-text="description"
                                    return-object
                                    cache-items
                                    class="mx-3"
                                    flat
                                    hide-no-data
                                    hide-details
                                    label="Type a name of location"
                                    solo
                            ></v-autocomplete>
                        </div>
                    </GmapMap>
                </div>
            </div>
        </v-dialog>

    </v-layout>


</template>

<script>
    import _ from 'lodash';
    import {gmapApi} from 'vue2-google-maps';
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    const googleMapOptions = {
        mapTypeControl: false,
        fullscreenControl: false
    };

    export default {
        name: 'widget-geo-point-field',
        mixins: [WidgetFieldMixin],
        data () {
            return {
                googleMapOptions,
                showMenu: false,
                mapDlg: false,
                marker: {},
                place: null,
                markerIcon: `${process.env.base}img/icons/chooseGeoPoint.svg`,

                autocompleteService: null,
                autocompleteArr: [],
                autocomplete: {},

                infoContent: '',
                infoAdress: '',
                infoWindowPos: null,
                infoWinOpen: false,
                infoOptions: {
                    pixelOffset: {
                        width: 0,
                        height: -5
                    }
                },

                geocoder: null,
                search: null,
                loading: false,
                items: [],
                itemsSearch: null
            };
        },
        computed: {
            google: gmapApi,
            isError () {
                return !this.editable && this.isEmpty;
            },
            fieldText () {
                if (this.fieldData && typeof this.fieldData === 'object') {
                    return this.fieldData.entityDesc;
                }
                return this.fieldData;
            }
        },
        watch: {
            mapDlg (val) {
                if (val) {
                    this.$nextTick(() => {
                        this.$refs.map.$mapPromise.then((map) => {
                            this.autocompleteService = new this.google.maps.places.AutocompleteService();
                            this.geocoder = new this.google.maps.Geocoder();
                            console.log('[mapDlg] AutocompleteService ');
                            console.dir(this.autocompleteService);
                            console.dir(this.geocoder);
                        });
                    });
                }
            },
            search (val) {
                console.log(`[autocompleteText] Changed to ${val}! Searching...`);
                this.loading = true;
                this.autocompleteService.getQueryPredictions({ input: val }, this.setAutocompleteArr);
            },
            autocomplete (val) {
                if (!_.isEmpty(val)) {
                    console.log('[autocomplete] Changed to:');
                    console.dir(val);
                    const placeId = val.place_id;
                    this.geocoder.geocode({'placeId': placeId}, this.selectPlace);
                }
            }
        },
        mounted () {
        },
        methods: {
            onFocus () {
                this.error = false;
                this.errorMsg = [];
            },
            placeMarker (e) {
                this.geocoder.geocode({'location': e.latLng}, this.selectPlace);
            },
            setPoint (place) {
                this.place = place;
                const latLng = place.geometry.location;
                const region = place.address_components.find(item => item.types.indexOf('administrative_area_level_1') !== -1) || {};
                const country = place.address_components.find(item => item.types.indexOf('country') !== -1) || {};
                this.marker = {
                    position: latLng
                };
                this.$refs.map.panTo(latLng);
                this.infoWindowPos = latLng;
                this.infoContent = `${latLng.lat().toFixed(4)}, ${latLng.lng().toFixed(4)}`;
                this.infoAdress = `${region.long_name}, ${country.short_name}`;
                this.infoWinOpen = true;
            },
            setAutocompleteArr (predictions, status) {
                if (status !== this.google.maps.places.PlacesServiceStatus.OK) {
                    console.log(`[setAutocompleteArr] Error getting places: ${status}`);
                    return;
                }
                console.log(`[setAutocompleteArr] Array getted!!!`);
                console.dir(predictions);
                this.autocompleteArr = predictions;
                this.loading = false;
            },
            select () {
                if (this.place) {
                    const latLng = this.place.geometry.location;
                    this.fieldData = `${latLng.lat()}::${latLng.lng()}`;
                }
                this.mapDlg = false;
                this.error = false;
                this.errorMsg = [];
            },
            selectPlace (results, status) {
                console.log(`[selectPlace] SelectingPlace with status = '${status}'`);
                console.dir(results);
                if (status === 'OK') {
                    if (results[0]) {
                        this.setPoint(results[0]);
                    } else {
                        console.log('[selectPlace] No results found!');
                        console.dir(results);
                    }
                } else {
                    console.log(`[selectPlace] GeoCoder ERROR: ${status}`);
                    console.dir(results);
                }
            }
        }

    };
</script>

<style lang="stylus">
    .map-dlg
        overflow inherit

        &__autocomplete
            position absolute
            z-index: 20
            left 20px
            right 20px
            top 20px

    .widget-field
        .widget-field
            &__select .menu__content
                top 36px !important

</style>
