<template>
    <v-layout ref="sortableBlocks" class="static-page" :style="style" column>
        <block
                v-for="(block, i) in blocks"
                :key="itemKey(block)"
                class="static-page__block"
                :editable="editable"
                :params="params"
                @remove="removeBlock"
                @update="updateBlock"
                :block="block"
                :index="i"
        />
    </v-layout>
</template>
<script>
    import Block from '~/components/Block';
    import {mapGetters, mapMutations} from 'vuex';

    let Sortable;
    if (process.browser) {
        Sortable = require('sortablejs');
    }

    export default {
        name: 'StaticPage',
        props: {
            editable: {
                type: Boolean
            }
        },
        components: {
            'Block': Block
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.staticPage) || {},
                currentItemKey: 0,
                itemKeys: new WeakMap()
            };
        },
        computed: {
            ...mapGetters({
                layout: 'desktop/getCurrentLayout',
                params: 'desktop/getCurrentLayoutParams'
            }),
            blocks: {
                get () {
                    return this.layout.blocks;
                },
                set (value) {
                    this.$store.commit(`layout_${this.layoutId}/updateBlocks`, value);
                }
            },
            options () {
                return this.layout.options;
            },
            style () {
               if (this.options.maxWidth) {
                  return {maxWidth: `${this.options.maxWidth}px`};
               }
               return {};
            },
            layoutId () {
                return this.layout && this.layout._id;
            },
            bus () {
                return this.$store.getters[`${this.layoutId}/bus`];
            }
        },

        watch: {
        },
        mounted () {
            /* eslint-disable no-new */
            new Sortable(
                this.$el,
                {
                    draggable: '.static-page__block',
                    handle: '.block__handle',
                    onEnd: this.dragReorder
                }
            );
        },
        methods: {
            ...mapMutations({
                storeDeteteBlock: 'desktop/deleteBlock',
                storeUpdateBlock: 'desktop/updateWidgetById',
                storeWidgetResized: 'desktop/widgetResized'
            }),

            dragReorder ({oldIndex, newIndex}) {
                const newBlocks = this.blocks;
                const movedItem = newBlocks.splice(oldIndex, 1)[0];
                newBlocks.splice(newIndex, 0, movedItem);
                this.blocks = newBlocks;
            },
            itemKey (item) {
                if (!this.itemKeys.has(item)) this.itemKeys.set(item, ++this.currentItemKey);
                return this.itemKeys.get(item);
            },

            removeBlock (index) {
                this.$store.commit(`layout_${this.layoutId}/deleteBlock`, index);
            },

            updateBlock (payload) {
                this.$store.commit(`layout_${this.layoutId}/updateBlock`, payload);
            }
        }
    };
</script>

<style lang="stylus">

    .static-page
        margin 0 auto
</style>
