<template>
    <v-card flat class="buttons-widget">
        <v-card-text>
            <v-layout column v-if="filters && filters.length > 0">
                <template v-for="filter in filters">
                    <component
                            v-if="filter.field && filter.field.name"
                            ref="filter"
                            :is="`${filter.type}-filter`"
                            :options="filter"
                            :key="filter.field.name"
                    ></component>
                </template>
            </v-layout>
        </v-card-text>
        <v-card-actions>
            <v-btn
                    @click.native="doFilter"
                    block
            >
                Фильтровать!
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import TextInputFilter from '~/components/widgets/filters/TextInputFilter';
    import SelectFilter from '~/components/widgets/filters/SelectFilter';
    import SwitchFilter from '~/components/widgets/filters/SwitchFilter';
    import RadioFilter from '~/components/widgets/filters/RadioFilter';

    export default {
        name: 'filter-widget',
        components: {
            TextInputFilter,
            SelectFilter,
            SwitchFilter,
            RadioFilter
        },
        props: {
            id: {
                required: true,
                type: String
            },
            params: {
                type: Object
            },
            inputData: {
                required: false,
                type: Object,
                default: undefined
            }
        },
        data () {
            return {
                $bus: this.storeBus,
                gui: (process.env.gui && process.env.gui.filterWidget) || {}
            };
        },
        watch: {
        },
        computed: {
            storeBus () {
                return this.$store.getters[`${this.id}/getBus`];
            },
            filters () {
                return this.options.filters || [];
            },
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            },
            masterFilter () {
                return _.get(this.options, 'dataSource.masterWidget', '');
            }
        },
        mounted () {
            this.$bus = this.storeBus;
        },
        beforeDestroy () {
        },
        methods: {
            doFilter () {
                if (this.masterFilter) {
                    const filters = (this.$refs.filter && _.compact(this.$refs.filter.map(filter => filter.getFilter())).join(' AND ')) || '';
                    if (Array.isArray(this.masterFilter)) {
                        console.log('[FilterWidget/doFilter] Multi Master Widget!!');
                        console.dir(filters);
                        this.masterFilter.forEach(masterFilter =>
                            this.$bus.$emit('filter', {targetWidgetId: masterFilter, params: filters}));
                    } else {
                        console.log('[FilterWidget/doFilter] Single Master Widget!!');
                        console.dir(filters);
                        this.$bus.$emit('filter', {targetWidgetId: this.masterFilter, params: filters});
                    }
                } else {
                    console.log('[FilterWidget/doFilter] No master filter!!');
                }
            }
        }
    };
</script>

<style lang="stylus">

    .card-widget
        .card-widget
            &__layout
                align-items center
            &__documentation
                padding 16px
                width 100%
                /*background-color: #eee;*/
                line-height: 1.4;
            &__description
                text-align center

</style>
