<template>
    <div :style="{width: '100%'}" v-if="layoutId">
        <no-ssr placeholder="Loading..." v-if="widgets && (widgets.length > 0)">
            <div class="widget-layout">
                <grid-layout :layout="widgets"
                             v-bind="options"
                >
                    <grid-item v-for="item in widgets"
                               :x.sync="item.x"
                               :y="item.y"
                               :w="item.w"
                               :h="item.h"
                               :i="item.i"
                               dragAllowFrom=".v-toolbar"
                               :minH="6"
                               @resize="resizeEvent"
                               @move="moveEvent"
                               @resized="resizedEvent"
                               @moved="movedEvent"
                               :key="item.i"
                    >
                        <widget
                                :ref="item.i"
                                :editable="editable"
                                :params="params"
                                :id="item.i"
                                :acceptedList="acceptedList"
                                @remove="removeItem(item.i)"
                                @updateSettings="updateWidget"
                        />
                    </grid-item>
                </grid-layout>
            </div>
        </no-ssr>
    </div>
</template>
<script>
    import Widget from '~/components/Widget';
    import {mapGetters, mapMutations} from 'vuex';

    let GridLayout, ResponsiveGridLayout, GridItem;
    if (process.browser) {
        const VueGridLayout = require('vue-grid-layout');
        GridLayout = VueGridLayout.GridLayout;
        ResponsiveGridLayout = VueGridLayout.ResponsiveGridLayout;
        GridItem = VueGridLayout.GridItem;
    }

    /* @vue/component */
    export default {
        name: 'Layout',
        props: {
            editable: {
                type: Boolean
            }
        },
        components: {
            'GridLayout': GridLayout,
            'ResponsiveGridLayout': ResponsiveGridLayout,
            'GridItem': GridItem,
            'Widget': Widget
        },
        data () {
            return {
                eventLog: []
            };
        },
        computed: {
            ...mapGetters({
                layout: 'desktop/getCurrentLayout',
                params: 'desktop/getCurrentLayoutParams',
                acceptedList: 'desktop/getAcceptedList'
            }),
            widgets () {
                return this.layout.widgets && this.layout.widgets.map(item => item.location);
            },
            options () {
                const options = Object.assign({}, this.layout.options);
                if (!this.editable) {
                    options.isDraggable = false;
                    options.isResizable = false;
                }
                return options;
            },
            layoutId () {
                return this.layout && this.layout._id;
            },
            bus () {
                return this.$store.getters[`${this.layoutId}/bus`];
            }
        },
        methods: {
            ...mapMutations({
                storeDeteteWidget: 'desktop/deleteWidgetById',
                storeUpdateWidget: 'desktop/updateWidgetById',
                storeWidgetResized: 'desktop/widgetResized'
            }),
            moveEvent: function (i, newX, newY) {
                const msg = 'MOVE i=' + i + ', X=' + newX + ', Y=' + newY;
                this.eventLog.push(msg);
            },
            resizeEvent: function (i, newH, newW) {
                const msg = 'RESIZE i=' + i + ', H=' + newH + ', W=' + newW;
                this.eventLog.push(msg);
            },
            movedEvent: function (i, newX, newY) {
                const msg = 'MOVED i=' + i + ', X=' + newX + ', Y=' + newY;
                this.eventLog.push(msg);
                this.storeWidgetResized(i);
            },
            /**
             *
             * @param i the item id/index
             * @param newH new height in grid rows
             * @param newW new width in grid columns
             * @param newHPx new height in pixels
             * @param newWPx new width in pixels
             *
             */
            resizedEvent: function (i, newH, newW, newHPx, newWPx) {
                const msg = 'RESIZED i=' + i + ', H=' + newH + ', W=' + newW + ', H(px)=' + newHPx + ', W(px)=' + newWPx;
                this.eventLog.push(msg);
                this.storeWidgetResized(i);
                this.$nextTick(() => {
                    this.$refs[i] && this.$refs[i][0] && this.$refs[i][0].onResize && this.$refs[i][0].onResize();
                });
            },

            removeItem (id) {
                this.storeDeteteWidget(id);
            },

            updateWidget (data) {
                this.storeUpdateWidget({id: data.id, widget: data});
            }
        }

    };
</script>

<style lang="stylus">

    .widget-layout
        width 100%
        padding-bottom: 40px;
        height 100%

        &__login
            margin-top 5%

    .vue-grid-layout
        width 100%


    .layoutJSON {
        background: #ddd;
        border: 1px solid black;
        margin-top: 10px;
        padding: 10px;
    }

    .eventsJSON {
        background: #ddd;
        border: 1px solid black;
        margin-top: 10px;
        padding: 10px;
        height: 100px;
        overflow-y: scroll;
    }

    .columns {
        -moz-columns: 120px;
        -webkit-columns: 120px;
        columns: 120px;
    }

    .vue-resizable-handle {
        z-index: 5000;
        position: absolute;
        width: 20px;
        height: 20px;
        bottom: 0;
        right: 0;
        background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg08IS0tIEdlbmVyYXRvcjogQWRvYmUgRmlyZXdvcmtzIENTNiwgRXhwb3J0IFNWRyBFeHRlbnNpb24gYnkgQWFyb24gQmVhbGwgKGh0dHA6Ly9maXJld29ya3MuYWJlYWxsLmNvbSkgLiBWZXJzaW9uOiAwLjYuMSAgLS0+DTwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DTxzdmcgaWQ9IlVudGl0bGVkLVBhZ2UlMjAxIiB2aWV3Qm94PSIwIDAgNiA2IiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojZmZmZmZmMDAiIHZlcnNpb249IjEuMSINCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQl4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiDT4NCTxnIG9wYWNpdHk9IjAuMzAyIj4NCQk8cGF0aCBkPSJNIDYgNiBMIDAgNiBMIDAgNC4yIEwgNCA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPg0JPC9nPg08L3N2Zz4=');
        background-position: bottom right;
        padding: 0 3px 3px 0;
        background-repeat: no-repeat;
        background-origin: content-box;
        box-sizing: border-box;
        cursor: se-resize;
    }

    .vue-grid-item:not(.vue-grid-placeholder) {
        background: #ccc;
        border: 1px solid black;
    }

    .vue-grid-item.resizing {
        opacity: 0.9;
    }

    .vue-grid-item.static {
        background: #cce;
        width: 100%;
    }

    .vue-grid-item .text {
        font-size: 24px;
        text-align: center;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        height: 100%;
        width: 100%;
    }

    .vue-grid-item .no-drag {
        height: 100%;
        width: 100%;
    }

    .vue-grid-item .minMax {
        font-size: 12px;
    }

    .vue-grid-item .add {
        cursor: pointer;
    }

    .vue-draggable-handle {
        position: absolute;
        width: 20px;
        height: 20px;
        top: 0;
        left: 0;
        background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='5' fill='#999999'/></svg>") no-repeat;
        background-position: bottom right;
        padding: 0 8px 8px 0;
        background-repeat: no-repeat;
        background-origin: content-box;
        box-sizing: border-box;
        cursor: pointer;
    }

</style>
