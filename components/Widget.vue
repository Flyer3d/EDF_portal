<template>
    <v-card flat height="100%" class="widget">
        <v-toolbar
                dark
                :color="'primary'"
                :height="48"
                v-if="!(!editable && storeType === 'buttons')"
        >
            <v-btn icon @click.native.stop="openDialog" v-if="editable">
                <v-icon>settings</v-icon>
            </v-btn>
            <v-menu bottom right v-if="widgetMenu && widgetMenu.length > 0">
                <v-btn
                        slot="activator"
                        dark
                        icon
                >
                    <v-icon>list</v-icon>
                </v-btn>

                <v-list>
                    <v-list-tile
                            v-for="item in widgetMenu"
                            :key="item.value"
                            @click.stop="doAction(item.value)"
                    >
                        <v-list-tile-title>{{ item.text}}</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
            <v-toolbar-title class="widget__title" :class="{widget__title_left: !editable}">{{widgetTitle}}
            </v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn
                    icon
                    @click.stop="filterDlg=true"
                    v-if="storeOptions.fields && (storeType === 'table' || storeType === 'list')"
            >
                <v-icon>filter_list</v-icon>
            </v-btn>
            <v-btn icon @click="saveEntity" v-if="storeType === 'processStep'">
                <v-icon>save</v-icon>
            </v-btn>
            <v-btn icon @click="remove" v-if="editable">
                <v-icon>remove_circle</v-icon>
            </v-btn>

        </v-toolbar>
        <!--<div class="widget__content" :class="{widget__content_small: !isAdmin, widget__content_noedit: !editable}">-->
        <div class="widget__content" :class="{widget__content_nohead: !editable && storeType === 'buttons'}">
            <table-widget v-if="storeType === 'table'" :id="id" ref="widget" :userQuery="userQueryStr"
                          :params="params"/>
            <list-widget v-else-if="storeType === 'list'" :id="id" ref="widget" :userQuery="userQueryStr"
                         :params="params"/>
            <steps-list-widget v-else-if="storeType === 'processStepList'" :id="id" ref="widget"
                               :userQuery="userQueryStr" :params="params"/>
            <news-widget v-else-if="storeType === 'news'" :id="id" ref="widget" :userQuery="userQueryStr"
                         :params="params"/>
            <menu-widget v-else-if="storeType === 'poolMenu'" :id="id" ref="widget" :userQuery="userQueryStr"
                         :params="params"/>
            <card-widget v-else-if="storeType === 'card'" :id="id" ref="widget" :userQuery="userQueryStr"
                         :params="params"/>
            <step-widget v-else-if="storeType === 'processStep'" :id="id" ref="widget" :userQuery="userQueryStr"
                         :params="params"/>
            <filter-widget v-else-if="storeType === 'filter'" :id="id" ref="widget" :userQuery="userQueryStr"
                           :params="params"/>
            <auto-step-widget v-else-if="storeType === 'autoStep'" :id="id" ref="widget" :userQuery="userQueryStr"
                              :params="params"/>
            <mono-step-widget v-else-if="storeType === 'monoStep'" :id="id" ref="widget" :userQuery="userQueryStr"
                              :params="params"/>
            <contacts-widget v-else-if="storeType === 'contacts'" :id="id" ref="widget" :userQuery="userQueryStr"
                             :params="params"/>
            <price-widget v-else-if="storeType === 'price'" :id="id" ref="widget" :userQuery="userQueryStr"
                          :params="params"/>
            <buttons-widget v-else-if="storeType === 'buttons'" :id="id" ref="widget" :userQuery="userQueryStr"
                            :params="params"/>
            <background-widget v-else-if="storeType === 'background'" :id="id" ref="widget" :userQuery="userQueryStr"
                               :params="params"/>
            <div v-else>{{id}}</div>
        </div>
        <v-dialog v-model="dialog" scrollable persistent lazy @keydown.esc="dialog = false" :key="id">
            <widget-options-dlg
                    v-if="dialogData.options"
                    v-bind="dialogData"
                    :acceptedList="acceptedList"
                    :params="params"
                    @close="dialog=false"
                    @save="saveSettings"
                    ref="widgetOptions"
                    :id="id"

            />
        </v-dialog>
        <v-dialog v-model="filterDlg" max-width="1200px" lazy>
            <v-card>
                <v-card-text v-if="storeOptions">
                    <filter-query
                            ref="filterQuuery"
                            :fields="storeOptions.fields"
                            :rawQuery="query && query.queryRaw"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" flat @click.stop="filterDlg=false">{{button.cancel}}</v-btn>
                    <v-btn color="primary" flat @click.stop="acceptFilter">{{button.accept}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
    import WidgetOptionsDlg from '~/components/dialogs/WidgetOptionsDlg';
    import FilterQuery from '~/components/dialogs/FilterQuery';
    import Vue from 'vue';
    import _ from 'lodash';

    export default {
        name: 'Widget',
        components: {
            WidgetOptionsDlg,
            FilterQuery,
            // Widgets
            TableWidget: () => import(/* webpackChunkName: "TableWidget" */ '~/components/widgets/TableWidget'),
            ListWidget: () => import(/* webpackChunkName: "ListWidget" */ '~/components/widgets/ListWidget'),
            CardWidget: () => import(/* webpackChunkName: "CardWidget" */ '~/components/widgets/CardWidget'),
            StepWidget: () => import(/* webpackChunkName: "StepWidget" */ '~/components/widgets/StepWidget'),
            FilterWidget: () => import(/* webpackChunkName: "FilterWidget" */ '~/components/widgets/FilterWidget'),
            AutoStepWidget: () => import(/* webpackChunkName: "AutoStepWidget" */ '~/components/widgets/AutoStepWidget'),
            MonoStepWidget: () => import(/* webpackChunkName: "MonoStepWidget" */ '~/components/widgets/MonoStepWidget'),
            StepsListWidget: () => import(/* webpackChunkName: "StepListWidget" */ '~/components/widgets/StepsListWidget'),
            MenuWidget: () => import(/* webpackChunkName: "MenuWidget" */ '~/components/widgets/MenuWidget'),
            NewsWidget: () => import(/* webpackChunkName: "NewsWidget" */ '~/components/widgets/NewsWidget'),
            ContactsWidget: () => import(/* webpackChunkName: "ContactsWidget" */ '~/components/widgets/ContactsWidget'),
            PriceWidget: () => import(/* webpackChunkName: "PriceWidget" */ '~/components/widgets/PriceWidget'),
            ButtonsWidget: () => import(/* webpackChunkName: "ButtonsWidget" */ '~/components/widgets/ButtonsWidget'),
            BackgroundWidget: () => import(/* webpackChunkName: "BackgroundWidget" */ '~/components/widgets/BackgroundWidget')
        },
        props: {
            editable: {
                type: Boolean
            },
            params: {
                type: Object
            },
            id: {
                type: String,
                required: true
            },
            acceptedList: {
                type: Array,
                required: true
            }
        },
        data () {
            return {
                query: {},
                button: (process.env.gui && process.env.gui.button) || {},
                filterDlg: false,
                userQueryStr: '',
                dialog: false,
                dialogData: {
                    title: '',
                    type: '',
                    widgetMenu: [],
                    model: {
                        name: '',
                        title: '',
                        type: ''
                    },
                    options: {}
                }
            };
        },
        computed: {
            actionStatus () {
                return this.$store.getters[`${this.id}/actionStatus`];
            },
            storeTitle () {
                return this.$store.getters[`${this.id}/getTitle`];
            },
            widgetMenu () {
                return this.$store.getters[`${this.id}/getWidgetMenu`];
            },
            storeType () {
                return this.$store.getters[`${this.id}/getType`];
            },
            storeModel () {
                return this.$store.getters[`${this.id}/getModel`];
            },
            storeOptions () {
                return this.$store.getters[`${this.id}/getOptions`];
            },
            dataLoadStatus () {
                return this.$store.getters[`${this.id}/dataLoadStatus`];
            },
            storeBus () {
                return this.$store.getters[`${this.id}/getBus`];
            },
            itemData () {
                return this.$store.getters[`${this.id}/getItem`] || {};
            },
            widgetTitle () {
                if ((this.storeType === 'processStep' || this.storeType === 'autoStep') && !this.storeTitle) {
                    const model = this.$store.getters[`${this.id}/model/stepModel`] || {};
                    return model.activityModelName || 'Шаг не выбран';
                } else if (this.storeType === 'card') {
                    if (this.itemData.object) {
                        return (this.storeTitle && this.storeTitle.replace(/{{(.*?)}}/g, (str, arg) => {
                            if (arg) {
                                return this.itemData.object[arg] || 'не задано';
                            }
                            return '';
                        })) || '';
                    } else {
                        return (this.storeTitle && this.storeTitle.replace(/{{(.*?)}}/g, ''));
                    }
                }
                return this.storeTitle;
            }
        },
        mounted () {
            this.$bus = this.storeBus;
        },
        watch: {
            actionStatus (val) {
                if (val === 'SUCCESS') {
                    this.$bus.$emit('refresh_all');
                }
            }
        },
        methods: {
            remove () {
                this.$emit('remove', this.id);
            },
            openDialog () {
                this.dialogData = {
                    title: this.storeTitle,
                    type: this.storeType,
                    options: _.cloneDeep(this.storeOptions),
                    widgetMenu: this.widgetMenu,
                    model: this.storeModel || {
                        name: '',
                        title: '',
                        type: ''
                    }
                };
                this.$nextTick(() => {
                    this.dialog = true;
                });
            },
            saveSettings (val) {
                console.log(`[WIDGET] save settings for widget ${this.id}!`);
                this.dialog = false;
                this.$store.commit(`${this.id}/update`, val);
            },
            doAction (actionId) {
                this.$store.dispatch(`${this.id}/doAction`, {actionId});
            },
            acceptFilter () {
                const query = this.$refs.filterQuuery.getQuery();
                Vue.set(this, 'userQueryStr', query.queryStr);
                this.filterDlg = false;
                this.query = query;
            },
            onResize () {
                this.$refs.widget && this.$refs.widget.onResize && this.$refs.widget.onResize();
            },
            saveEntity () {
                this.$refs.widget.saveEntity();
            }
        }
    };
</script>

<style lang="stylus">

    .widget
        height 100%

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
            background white
            overflow auto
            height calc( 100% - 48px )
            position relative

            &_small
                height calc( 100% - 48px )

            &_nohead
                height 100%
                overflow: hidden
                .buttons-widget .card__text
                    padding 9px 16px
                .btn.btn--block
                    margin 0

        .widget-field
            .widget-field
                &__documentation
                    width 100%
                    margin -16px 0 0

                &__description
                    padding 0px 16px 8px

                    p:last-of-type
                        margin-bottom 0

</style>
