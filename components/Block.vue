<template>
        <v-card flat height="100%" class="block" :class="{'block_editable': editable}">
            <v-toolbar dark
                    v-if="editable"
                    :color="'primary'"
                    :height="48"
            >
                <v-btn icon v-if="canEdit" class="block__handle">
                    <v-icon>drag_handle</v-icon>
                </v-btn>
                <v-btn icon @click.native.stop="openDialog" v-if="canEdit">
                    <v-icon>settings</v-icon>
                </v-btn>
                <v-toolbar-title class="block__title" :class="{block__title_left: !canEdit}">{{block.title}}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="remove" v-if="canEdit">
                    <v-icon>remove_circle</v-icon>
                </v-btn>
            </v-toolbar>
            <component :is="block.type" :data="block.options" :params="params" class="block__content" />
            <v-dialog v-model="dialog"
                      scrollable
                      persistent
                      lazy
                      @keydown.esc="dialog = false"
                      :max-width="maxDialogsWidth">
                <block-options-dlg
                        v-bind="dialogData"
                        :params="params"
                        @close="dialog=false"
                        @save="saveSettings"
                />
            </v-dialog>
        </v-card>
</template>

<script>
    import BlockOptionsDlg from '~/components/dialogs/BlockOptionsDlg';
    import _ from 'lodash';

    /* @vue/component */
    export default {
        name: 'Block',
        components: {
            BlockOptionsDlg,
            MonoStepBlock: () => import(/* webpackChunkName: "Blocks" */ '~/components/blocks/MonoStepBlock'),
            ChatBlock: () => import(/* webpackChunkName: "Blocks" */ '~/components/blocks/ChatBlock'),
            SimpleTextBlock: () => import(/* webpackChunkName: "Blocks" */ '~/components/blocks/SimpleTextBlock'),
            SimpleHtmlBlock: () => import(/* webpackChunkName: "Blocks" */ '~/components/blocks/SimpleHtmlBlock')

        },
        props: {
            editable: {
                type: Boolean
            },
            block: {
                type: Object,
                required: true
            },
            index: {
                type: Number,
                required: true
            },
            params: {
                type: Object
            }
        },
        data () {
            return {
                button: (process.env.gui && process.env.gui.button) || {},
                maxDialogsWidth: process.env.maxDialogsWidth,
                filterDlg: false,
                userQueryStr: '',
                dialog: false,
                dialogData: {
                    title: '',
                    type: '',
                    options: {}
                }
            };
        },
        computed: {
            canEdit () {
                return this.$store.getters[`login/canEdit`];
            },
            title () {
                return this.block.title;
            },
            type () {
                return this.block.type;
            },
            options () {
                return this.block.options;
            }
        },
        methods: {
            remove () {
                this.$emit('remove', this.index);
            },
            openDialog () {
                this.dialogData = {
                    title: this.title && this.title.slice(),
                    type: this.type && this.type.slice(),
                    options: _.cloneDeep(this.options)
                };
                this.dialog = true;
            },
            saveSettings (block) {
                this.dialog = false;
                this.$emit('update', {index: this.index, block});
            },
            doAction (actionId) {
                this.$emit('action', actionId);
            }
        }
    };
</script>

<style lang="stylus">

    .block
        width 100%


        &_editable
            border 1px solid #ccc
            margin 8px 0

        &__menu-btn.btn
            overflow: hidden
            justify-content start
            text-overflow ellipsis

        &__title
            text-align center
            justify-content center
            color white
            flex 1 1 90%

            &_left
                text-align left

        &__content
            width 100%
            background white
            overflow-x hidden
            overflow-y auto
            position relative

            &_small
                height calc( 100% - 48px )

            &_noedit
                height 100%
                overflow: hidden


</style>
