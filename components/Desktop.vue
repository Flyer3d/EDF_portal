<template>
    <v-layout :class="{static: !editable}" class="desktop">
        <v-toolbar fixed app :clipped-left="clipped" color="white" v-if="canEdit">
            <v-toolbar-side-icon @click="toggleSidebar"></v-toolbar-side-icon>
            <template v-if="canEdit && layoutId">
                <v-btn icon @click.native.stop="openLayoutOptionsDlg">
                    <v-icon color="blue darken-2">settings</v-icon>
                </v-btn>

                <v-btn v-if="!editable" icon @click.stop="editable = true">
                    <v-icon color="blue darken-2">edit</v-icon>
                </v-btn>
                <v-btn v-else icon @click.stop="saveLayout">
                    <v-icon color="blue darken-2">save</v-icon>
                </v-btn>
            </template>
            <avk-logo class="desktop__toolbar-logo"/>
            <v-spacer></v-spacer>
            <v-toolbar-title v-text="title"></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="openLayoutListDlg" v-if="canEdit">
                <v-icon dark color="primary">view_list</v-icon>
            </v-btn>
            <v-btn v-if="canEdit && editable && layoutId" icon @click="addItem">
                <v-icon dark color="primary">add_circle</v-icon>
            </v-btn>
            <v-btn v-if="isLoggedIn" @click.stop="logout" round color="primary" dark small>
                <span>{{button.logout}} {{userName}}&nbsp</span>
                <v-icon dark>exit_to_app</v-icon>
            </v-btn>
            <v-btn v-else @click.stop="login" round color="primary" dark small>
                <span>{{button.login}}&nbsp;</span>
                <v-icon dark>exit_to_app</v-icon>
            </v-btn>
        </v-toolbar>

        <layout :editable="editable" v-if="currentLayout.type === 'layout'"/>
        <static-page :editable="editable" v-else-if="currentLayout.type === 'page'"/>
        <v-card v-else>
            <v-card-text>Нечего показать</v-card-text>
        </v-card>

        <!--  Dialogs secction -->

        <v-dialog v-model="layoutDeleteDlg" persistent max-width="290">
            <v-card>
                <v-card-title class="headline">{{gui.dialogs.deleteLayoutTitle}}</v-card-title>
                <v-card-text>{{deleteMsg}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click.native="layoutDeleteDlg = false">{{button.cancel}}</v-btn>
                    <v-btn color="green darken-1" flat @click.native="submitDeleteLayoutDlg">{{button.delete}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="layoutListDlg" scrollable :max-width="maxDialogWidth">
            <v-card>
                <v-toolbar :color="'primary'" dark>
                    <v-toolbar-side-icon></v-toolbar-side-icon>
                    <v-btn icon @click.stop="openLayoutCreateDlg">
                        <v-icon>add</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-toolbar-title>{{gui.dialogs.layoutListTitle}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.stop="layoutListDlg=false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text style="max-height: 80vh;">
                    <v-list two-line subheader v-if="layoutListStatus !== 'IN_PROGRESS' && layoutListStatus !=='INITIAL'">
                        <v-subheader inset>{{gui.dialogs.layoutListPublished}}</v-subheader>
                        <v-list-tile avatar v-for="(item, i) in publishedLayouts" v-bind:key="i"
                                     @click="selectLayoutDlg(item)">
                            <v-list-tile-avatar>
                                <v-icon v-bind:class="[item.iconClass]">{{ item.icon }}</v-icon>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-btn icon ripple @click.stop="openDeleteLayoutDlg(item)">
                                    <v-icon color="grey lighten-1">remove_circle</v-icon>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                        <v-divider inset></v-divider>
                        <v-subheader inset>{{gui.dialogs.layoutListDraft}}</v-subheader>
                        <v-list-tile v-for="(item, i) in draftLayouts" v-bind:key="i" avatar
                                     @click="selectLayoutDlg(item)">
                            <v-list-tile-avatar>
                                <v-icon v-bind:class="[item.iconClass]">{{ item.icon }}</v-icon>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-btn icon ripple @click.stop="cloneLayout(item)">
                                    <v-icon color="grey lighten-1">file_copy</v-icon>
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-action>
                                <v-btn icon ripple @click.stop="openDeleteLayoutDlg(item)">
                                    <v-icon color="grey lighten-1">remove_circle</v-icon>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-list>
                    <div class="dialog__spinner-wrapper" v-else>
                        <v-progress-circular indeterminate :width="2" :size="150" color="primary" class="dialog__spinner"></v-progress-circular>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="layoutCreateDlg" scrollable persistent :max-width="maxDialogWidth">
            <layout-options-dlg
                    :create="true"
                    ref="createOptions"
                    :submitButtonName="button.create"
                    @cancel="layoutCreateDlg = false"
                    @update="submitLayoutCreateDlg"
            />
        </v-dialog>
        <v-dialog v-model="layoutOptionsDlg" scrollable persistent :max-width="maxDialogWidth">
            <layout-options-dlg
                    ref="updateOptions"
                    :layoutId="layoutId"
                    :layoutParentId="currentLayout.parentId"
                    :title="currentLayout.title"
                    :slug="currentLayout.slug"
                    :layoutType="currentLayout.type"
                    :options="currentLayout.options"
                    :submitButtonName="button.save"
                    @cancel="layoutOptionsDlg = false"
                    @update="submitLayoutOptionsDlg"
            />
        </v-dialog>
    </v-layout>
</template>

<script>
    import {mapGetters, mapMutations, mapActions} from 'vuex';
    import _ from 'lodash';
    import moment from 'moment';
    import AvkLogo from './site/AvkLogo';

    const ID = function () {
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    const templateLayout = {
        title: 'Безымянная страница',
        status: 'draft',
        id: null
    };

    /* @vue/component */
    export default {
        name: 'Desktop',
        props: {
        },
        components: {
            AvkLogo,
            LayoutOptionsDlg: () => import('~/components/dialogs/LayoutOptionsDlg'),
            Layout: () => import('~/components/Layout'),
            StaticPage: () => import('~/components/StaticPage')
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.desktop) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                maxDialogWidth: process.env.maxDialogsWidth,
                newLayout: templateLayout,
                layoutListDlg: false,
                layoutOptionsDlg: false,
                localLayout: {},
                layoutDeleteDlg: false,
                deleteMsg: '',
                deleteId: null,
                layoutCreateDlg: false,
                clipped: false,
                drawer: false,
                fixed: true,
                itemToLoad: null,
                items: [
                    {icon: 'apps', title: 'Welcome', to: '/'},
                    {icon: 'bubble_chart', title: 'Inspire', to: '/about'}
                ],
                miniVariant: false,
                right: true,
                rightDrawer: false
            };
        },
        created () {
        },
        watch: {
            layoutLoadStatus (val) {
                if (val === 'IN_PROGRESS') {
                    this.$root.$emit('veil');
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.messages.loadingMsg,
                        timeout: 6000
                    });
                } else if (val === 'SUCCESS') {
                    this.$root.$emit('unveil');
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.messages.loadedMsg,
                        timeout: 6000
                    });
                } else if (val === 'ERROR') {
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.messages.loadErrorMsg}\n${this.error}`,
                        timeout: 20000
                    });
                }
            },
            layoutDeleteStatus (val) {
                if (val === 'IN_PROGRESS') {
                    this.$root.$emit('veil');
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.messages.deletingMsg,
                        timeout: 6000
                    });
                } else if (val === 'SUCCESS') {
                    this.$root.$emit('unveil');
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.messages.deletedMsg,
                        timeout: 6000
                    });
                } else if (val === 'ERROR') {
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.messages.deleteErrorMsg}\n${this.error}`,
                        timeout: 20000
                    });
                }
            },
            layoutCreateStatus (val) {
                if (val === 'IN_PROGRESS') {
                    this.$root.$emit('veil');
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.messages.creatingMsg,
                        timeout: 6000
                    });
                } else if (val === 'SUCCESS') {
                    this.$root.$emit('unveil');
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.messages.createdMsg,
                        timeout: 6000
                    });
                } else if (val === 'ERROR') {
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.messages.createErrorMsg}\n${this.error}`,
                        timeout: 20000
                    });
                }
            },
            layoutSaveStatus (val) {
                if (val === 'IN_PROGRESS') {
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.messages.savingMsg,
                        timeout: 6000
                    });
                } else if (val === 'SUCCESS') {
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.messages.savedMsg,
                        timeout: 6000
                    });
                } else if (val === 'ERROR') {
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.messages.saveErrorMsg}\n${this.error}`,
                        timeout: 20000
                    });
                }
            }
        },
        computed: {
            ...mapGetters({
                isLoggedIn: 'login/isLoggedIn',
                userName: 'login/getUserName',
                canEdit: 'login/isAdmin',
                storeLayoutList: 'desktop/layoutsList',
                layoutId: 'desktop/getCurrentLayoutId',
                defaultLayoutId: 'desktop/getDefaultLayoutId',
                isChanged: 'desktop/isCurrentLayoutChanged',
                currentLayout: 'desktop/getCurrentLayout',
                currentLayoutSlug: 'desktop/getCurrentLayoutSlug',
                layoutLoadStatus: 'desktop/getLayoutLoadStatus',
                layoutListStatus: 'desktop/getLayoutListStatus',
                layoutCreateStatus: 'desktop/getLayoutCreateStatus',
                layoutSaveStatus: 'desktop/getLayoutSaveStatus',
                layoutDeleteStatus: 'desktop/getLayoutDeleteStatus'
            }),
            editable: {
                get () {
                    return this.$store.getters['site/editable'];
                },
                set (value) {
                    this.$store.commit('site/setEditable', value);
                }
            },
            title () {
                if (this.$store.getters[`desktop/getCurrentLayoutName`]) {
                    return this.$store.getters[`desktop/getCurrentLayoutName`];
                }
                return process.env.title;
            },
            userName () {
                return this.$store.getters[`login/getUserName`];
            },
            draftLayouts () {
                if (!this.layoutList) {
                    return [];
                }
                const filteredList = this.layoutList.filter(item => item.status === 'draft').sort((a, b) => a.title && a.title.localeCompare(b.title));
                return filteredList.map(item => {
                    return {
                        icon: (item.type === 'layout') ? 'dashboard' : 'view_agenda',
                        iconClass: 'grey lighten-1 white--text',
                        title: item.title,
                        subtitle: `Последнее изменение: ${(item.dateModified) ? (moment(item.dateModified).format('DD.MM.YYYY HH.mm') + ', ' + item.whoModified)
                            : (moment(item.dateCreated).format('DD.MM.YYYY HH.mm') + ', ' + item.whoCreated)}`,
                        id: item._id,
                        slug: item.slug,
                        status: item.status
                    };
                });
            },
            publishedLayouts () {
                if (!this.layoutList) {
                    return [];
                }
                const filteredList = this.layoutList.filter(item => item.status === 'published').sort((a, b) => a.title && a.title.localeCompare(b.title));
                return filteredList.map(item => {
                    return {
                        icon: (item.type === 'layout') ? 'dashboard' : 'view_agenda',
                        iconClass: 'blue white--text',
                        title: item.title,
                        subtitle: `Последнее изменение: ${(item.dateModified) ? (moment(item.dateModified).format('DD.MM.YYYY HH.mm') + ', ' + item.whoModified)
                            : (moment(item.dateCreated).format('DD.MM.YYYY HH.mm') + ', ' + item.whoCreated)}`,
                        id: item._id,
                        slug: item.slug,
                        status: item.status
                    };
                });
            },
            layoutList () {
                return this.storeLayoutList;
            }
        },
        methods: {
            ...mapMutations({
                addItem: 'desktop/createItem',
                addLayout: 'desktop/addLayoutToList',
                updateLayout: 'desktop/updateCurrentLayout',
                updateOptions: 'desktop/updateCurrentLayoutOptions',
                toggleSidebar: 'toggleSidebar'
            }),
            ...mapActions({
                logout: 'login/logout',
                storeCreateLayout: 'desktop/createLayout',
                storeSaveLayout: 'desktop/saveLayout',
                storeDeleteLayout: 'desktop/deleteLayout',
                storeGetLayoutList: 'desktop/getLayoutList'
            }),
            saveLayout () {
                this.storeSaveLayout(this.layoutId);
                this.editable = false;
            },

            selectLayoutDlg (item) {
                const newLayout = _.find(this.layoutList, layout => layout._id === item.id);
                this.addLayout(newLayout);
                this.$root.$emit('gotoPage', {page: item.slug || item.id});
            },

            openLayoutListDlg () {
                this.storeGetLayoutList();
                this.layoutListDlg = true;
            },

            // Delete layout dialog
            openDeleteLayoutDlg (item) {
                this.deleteMsg = this.gui.dialogs.deleteLayoutMsg.replace('###', item.title);
                this.deleteId = item.id;
                this.layoutDeleteDlg = true;
            },
            submitDeleteLayoutDlg () {
                this.layoutDeleteDlg = false;
                this.deleteId && this.storeDeleteLayout(this.deleteId);
            },

            // Create layout dialog
            openLayoutCreateDlg () {
                this.newLayout = Object.assign({}, templateLayout);
                this.$refs.createOptions.reset();
                this.layoutCreateDlg = true;
            },
            async submitLayoutCreateDlg (settings) {
                await this.storeCreateLayout(Object.assign({}, templateLayout, settings));
                console.log(`[Desktop/subminLayoutCreateDlg] -> gotoPage ${this.currentLayoutSlug}`);
                this.$store.commit('site/setEditable', true);
                this.$root.$emit('gotoPage', {page: this.currentLayoutSlug});
                this.layoutCreateDlg = false;
            },

            // Update options dialog
            openLayoutOptionsDlg () {
                console.log('OpenLayoutOptions!!!');
                console.dir(this.$refs);
                this.$refs.updateOptions.reset();
                this.layoutOptionsDlg = true;
            },
            submitLayoutOptionsDlg (settings) {
                this.updateLayout(settings);
                this.$nextTick(() => {
                    console.log(`\nUpdatedLayout is: (${this.currentLayout.type})`);
                    console.dir(this.currentLayout);
                    this.storeSaveLayout(this.layoutId);
                });
                this.layoutOptionsDlg = false;
            },

            login () {
                this.$router.push('/login');
            },
            getInfo () {
                window.open('http://sqlserver/reports/report/Управление%20эксплуатацией%20BSS/Отчеты/Отчет%20о%20состоянии%20дел%20в%20подразделении');
            },
            async cloneLayout (item) {
                const layoutToClone = _.find(this.layoutList, {_id: item.id});
                console.log('Cloning layout:');
                console.dir(layoutToClone);
                if (_.isEmpty(layoutToClone)) {
                    return false;
                }
                const newLayout = _.cloneDeep(layoutToClone);
                delete newLayout.dateCreated;
                delete newLayout.dateModified;
                delete newLayout.whoCreated;
                delete newLayout.whoModified;
                newLayout.title = `Копия ${newLayout.title}`;
                newLayout.slug = layoutToClone.slug ? `${layoutToClone.slug}_copy${ID()}` : layoutToClone.slug;
                console.dir(newLayout);
                await this.storeCreateLayout(newLayout);
                this.$store.commit('site/setEditable', true);
                this.$root.$emit('gotoPage', {page: this.currentLayoutSlug});
                this.layoutListDlg = false;
            }
        }
    };
</script>

<style lang="stylus">

    .dialog

        &__spinner-wrapper
            width: 100%;
            min-height 200px;
            position relative;

        &__spinner
            position absolute
            top calc( 50% - 75px )
            left calc( 50% - 75px )
            opacity: 0.5

    .desktop
        .desktop
            &__toolbar-logo
                margin-left 24px

</style>
