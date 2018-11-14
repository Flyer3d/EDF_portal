<template>
    <fieldset class="filter-query container grid-list-md">
        <legend>{{gui.title}}</legend>
        <filter-segment
                v-for="n in segmentCount"
                :fields="fields"
                :rawSegment="dataRawQuery[n-1]"
                ref="segment"
                :count="n"
                :key="n"
        />
        <v-btn
                :disabled="segmentCount > 10"
                @click.stop="addSegment"
        >{{gui.addSegment}}
        </v-btn>
        <v-btn
                :disabled="segmentCount < 2"
                @click.stop="removeSegment"
        >{{gui.deleteSegment}}
        </v-btn>
    </fieldset>
</template>

<script>
    import FilterSegment from '~/components/dialogs/FilterSegment';

    export default {
        name: 'filter-query',
        components: {
            FilterSegment
        },
        props: {
            fields: {
                type: Array,
                default: []
            },
            rawQuery: {
                // ToDo: Remove STRING!
                type: [Array, String]
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.filterQueryDlg) || {},
                segmentCount: this.rawQuery ? this.rawQuery.length : 1,
                dataRawQuery: this.rawQuery || [{}]
            };
        },
        watch: {
           rawQuery (value) {
               if (value) {
                  this.segmentCount = value.length;
                  this.dataRawQuery = value.slice();
               }
           }
        },
        methods: {
            addSegment () {
               this.segmentCount++;
               this.dataRawQuery.push({});
            },
            removeSegment () {
               this.segmentCount--;
               this.dataRawQuery.pop();
            },
            getQuery () {
                const querySegments = this.$refs.segment.map(item => item.getQuerySegment());
                return {
                    queryStr: querySegments.map(item => item.str).join(' '),
                    queryRaw: querySegments.map(item => item.raw)
                };
            }
        }
    };
</script>

<style lang="stylus">
    .filter-query.container.grid-list-md
        padding 16px 16px 32px 16px
        margin-bottom 20px
        border 1px solid #ccc
        legend
            padding 0 10px

        .card__text
        .card__actions
        .card__title
            padding-left 0
            padding-right 0
        .card__title
            font-size 120%
            font-weight 400


</style>
