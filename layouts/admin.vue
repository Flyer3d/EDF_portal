<template>
    <v-app light class="app page">
        <v-navigation-drawer
                v-model="drawer"
                fixed
                temporary
                app
                :width="400"
        >
            <v-list two-line subheader class="layouts-list">

                <template v-for="item in listTree">
                    <v-list-tile
                            v-if="item.type === 'link'"
                            @click.native="gotoPage({url: item.url, externalUrl: item.externalUrl})"
                    >
                        <v-list-tile-avatar>
                            <img :src="item.icon">
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-group
                            v-model="item.active"
                            v-else
                            :key="item.title"
                    >
                        <v-list-tile slot="activator">
                            <v-list-tile-avatar>
                                <img :src="item.icon">
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile
                                v-for="layout in item.items"
                                v-bind:key="layout._id"
                                @click="setCurrentLayout(layout)"
                                class="layouts-list__item"
                                :class="{'layouts-list__item_active':
                            layout._id === currentLayoutId}">
                            <v-list-tile-content>
                                <v-list-tile-title>{{layout.title}}</v-list-tile-title>
                                <v-list-tile-sub-title v-if="layout.dateModified">{{gui.drawer.layouts.modified}}
                                    {{layout.dateModified|toDate}}
                                </v-list-tile-sub-title>
                                <v-list-tile-sub-title v-else>{{gui.drawer.layouts.created}}
                                    {{layout.dateCreated|toDate}}
                                </v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-btn icon ripple @click.stop="removeLayout(layout._id)">
                                    <v-icon color="blue darken-2">remove_circle</v-icon>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-list-group>
                </template>
                <template>
                    <v-divider></v-divider>
                    <v-list-tile
                            @click.stop="openSaveDesktopDlg"
                    >
                        <v-list-tile-avatar>
                            <img :src="`${base}/img/icons/icons8-save-48.png`">
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>{{ gui.drawer.saveDesktopBtn }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile
                            @click.stop="openDesktopListDlg"
                    >
                        <v-list-tile-avatar>
                            <img :src="`${base}/img/icons/icons8-list-48.png`">
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>{{ gui.drawer.desktopListBtn }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </template>
            </v-list>
        </v-navigation-drawer>

        <v-content>
            <v-container fluid>
                <nuxt/>
            </v-container>
        </v-content>

        <div class="app_freeze" v-if="freeze">
            <v-progress-circular indeterminate :width="2" :size="150" color="primary"
                                 class="app__spinner"></v-progress-circular>
        </div>
        <v-footer absolute>
            <span>&copy; 2017-{{now}} ЗАО "АВК-Коммьюникейшнз"</span>
        </v-footer>

        <v-dialog v-model="saveDesktopDlg" persistent max-width="290">
            <v-card>
                <v-card-title class="headline">{{gui.drawer.saveDesktopDlg.title}}</v-card-title>
                <v-card-text>
                    <v-select
                            v-model="desktopName"
                            :label="gui.drawer.saveDesktopDlg.nameLabel"
                            item-text="name"
                            item-value="public_id"
                            clearable
                            required
                            :items="rolesList"
                    ></v-select>
                    <!--<v-text-field :label="gui.drawer.saveDesktopDlg.titleLabel" required v-model="desktopTitle"></v-text-field>-->
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click.native="saveDesktopDlg = false">{{btn.cancel}}</v-btn>
                    <v-btn color="green darken-1" flat @click.native="saveDesktop" :disabled="!desktopName">
                        {{btn.save}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="deleteDesktopDlg" persistent max-width="290">
            <v-card>
                <v-card-title class="headline">{{gui.drawer.deleteDesktopDlg.title}}</v-card-title>
                <v-card-text>{{deleteMsg}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click.native="deleteDesktopDlg = false">{{btn.cancel}}</v-btn>
                    <v-btn color="green darken-1" flat @click.native="submitDeleteDesktopDlg">{{btn.delete}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="leaveLayoutDlg" persistent max-width="290">
            <v-card>
                <v-card-title class="headline">{{gui.drawer.leaveLayoutDlg.title}}</v-card-title>
                <v-card-text>{{gui.drawer.leaveLayoutDlg.msg}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click.native="leaveLayoutDlg = false">{{btn.cancel}}</v-btn>
                    <v-btn color="green darken-1" flat @click.native="submitLeaveLayoutDlg">{{btn.accept}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="desktopListDlg" scrollable>
            <v-card>
                <v-toolbar :color="'primary'" dark>
                    <v-toolbar-side-icon></v-toolbar-side-icon>
                    <v-btn icon @click.stop="openLayoutCreateDlg">
                        <v-icon>add</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-toolbar-title>{{gui.drawer.desktopListDlg.title}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.stop="desktopListDlg=false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text style="max-height: 80vh;">
                    <v-list two-line subheader>
                        <v-subheader inset>{{gui.drawer.desktopListDlg.subtitle}}</v-subheader>
                        <v-list-tile avatar v-for="item in desktopList" v-bind:key="item.name"
                                     @click="selectDesktop(item)">
                            <v-list-tile-avatar>
                                <v-icon>desktop_windows</v-icon>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>Имя: {{ item.name }}</v-list-tile-title>
                                <v-list-tile-sub-title>Обновлен: {{ item.dateModified | toDate}}</v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-btn icon ripple @click.stop="openDeleteDesktopDlg(item)">
                                    <v-icon color="grey lighten-1">remove_circle</v-icon>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-snackbar
                class="app__snackbar"
                :timeout="snackbar.timeout"
                :color="snackbar.color"
                :multi-line="true"
                v-model="snackbar.model"
        >
            {{ snackbar.msg }}
            <v-btn dark flat @click.native="snackbar.model = false">{{btn.close}}</v-btn>
        </v-snackbar>
    </v-app>
</template>

<script>
    import {mapGetters, mapMutations, mapActions} from 'vuex';
    import AvkHeader from '~/components/site/AvkHeader';
    import LayoutOptionsDlg from '~/components/dialogs/LayoutOptionsDlg';
    import moment from 'moment';
    import _ from 'lodash';

    export default {
        name: 'admin-layout',
        components: { LayoutOptionsDlg, AvkHeader },
        middleware: 'admin',
        data () {
            return {
                gui: (process.env.gui && process.env.gui.default) || {},
                btn: (process.env.gui && process.env.gui.button) || {},
                desktopName: '',
                desktopTitle: '',
                saveDesktopDlg: false,
                deleteDesktopDlg: false,
                leaveLayoutDlg: false,
                desktopListDlg: false,
                now: moment().format('YYYY'),
                deleteMsg: '',
                deleteId: '',
                drawer: false,
                mini: true,
                desktop: '',
                freeze: false,
                snackbar: {
                    color: 'info',
                    timeout: 6000,
                    msg: '',
                    model: false
                }
            };
        },
        watch: {
            storeDrawer (param) {
                this.drawer = this.storeDrawer;
            },
            drawer (param) {
                this.setSidebar(param);
            }
        },
        created () {
            // this.$store.commit('login/SET_HEADER');
            this.desktopTitle = this.$store.getters['desktop/getDesktopTitle'];
            this.$root.$on('veil', this.veil);
            this.$root.$on('unveil', this.unveil);
            this.$root.$on('say', this.say);
            this.$root.$on('gotoPage', this.gotoPage);
        },
        beforeDestroy () {
            this.$root.$off('veil', this.veil);
            this.$root.$off('unveil', this.unveil);
            this.$root.$off('say', this.say);
            this.$root.$off('gotoPage', this.gotoPage);
        },
        computed: {
            ...mapGetters({
                storeLoadedLayoutsList: 'desktop/loadedLayoutsList',
                storeDesktopList: 'desktop/desktopsList',
                isLayoutChanged: 'desktop/isLayoutChanged',
                storeCurrentLayoutId: 'desktop/getCurrentLayoutId',
                storeDrawer: 'drawer',
                isLoggedIn: 'login/isLoggedIn',
                error: 'desktop/getError'

            }),
            editable: {
                get () {
                    return this.$store.getters['site/editable'];
                },
                set (value) {
                    this.$store.commit('site/setEditable', value);
                }
            },
            rolesList () {
                return this.$store.getters['site/rolesList'] || [{}];
            },
            layoutCategoryList () {
                return this.$store.getters['site/layoutCategoryList'] || [{}];
            },
            desktopList () {
                return this.storeDesktopList && this.storeDesktopList.filter(item => item.name).sort((a, b) => a.name && a.name.localeCompare(b.name));
            },
            isAdmin () {
                return this.$store.getters[`login/getRole`] === 'admin';
            },
            base () {
               return process.env.base;
            },
            apiBase () {
               return process.env.apiBase;
            },
            listTree () {
                const isLoggedIn = this.isLoggedIn;
                console.log('[default] listTree');
                const defaultCategory = {
                    active: true,
                    icon: `${this.base}/img/icons/icons8-page-48.png`,
                    title: 'Общие страницы',
                    type: 'node',
                    items: []
                };
                const categoryList = this.layoutCategoryList
                    .filter(item => (isLoggedIn) ? true : item.showUnautorized)
                    .sort((a, b) => a.weight - b.weight)
                    .map(item => ({
                        active: false,
                        icon: `${this.apiBase}${item.icon}`,
                        type: item.type,
                        title: item.name,
                        url: item.url,
                        externalUrl: item.externalUrl,
                        items: [],
                        _id: item._id
                    }));
                this.loadedLayoutList && this.loadedLayoutList.forEach(layout => {
                    if (layout.layoutCategory && layout.layoutCategory[0]) {
                        const categoryIndex = _.findIndex(categoryList, {_id: layout.layoutCategory[0]});
                        if (categoryIndex !== -1) {
                            categoryList[categoryIndex].items.push(layout);
                        } else {
                            defaultCategory.items.push(layout);
                        }
                    } else {
                        defaultCategory.items.push(layout);
                    }
                });
                const listTree = [];

                listTree.push({
                    active: false,
                    icon: `${this.base}/img/icons/icons8-home-48.png`,
                    title: 'Домой',
                    type: 'link',
                    url: ''
                });
                if (defaultCategory.items.length > 0) {
                    listTree.push(defaultCategory);
                }
                categoryList.forEach(item => {
                    if (item.type === 'link' || (item.items.length > 0)) {
                        listTree.push(item);
                    }
                });
                return listTree;
            },
            loadedLayoutList () {
                return this.storeLoadedLayoutsList;
            },
            currentLayoutId () {
                return this.storeCurrentLayoutId;
            }
        },
        methods: {
            ...mapMutations({
                removeLayout: 'desktop/removeLayout',
                setSidebar: 'setSidebar'
            }),
            ...mapActions({
                loadSiteData: 'site/loadData',
                saveLayout: 'desktop/saveLayout',
                storeSaveDesktop: 'desktop/saveDesktop',
                storeDeleteDesktop: 'desktop/deleteDesktop',
                storeGetDesktop: 'desktop/getDesktop',
                storeGetDesktopList: 'desktop/getDesktopList'
            }),
            gotoPage ({page, url, externalUrl}) {
                console.log(`[default/gotoPage] Page: ${page}, Url: ${url}, externamUrl: ${externalUrl}`);
                const userRoles = this.$store.getters['login/getRoles'];
                const role = (userRoles.indexOf('web_admin') !== -1) ? 'admin' : (userRoles.indexOf('default') !== -1) ? 'default' : 'pages';
                if (url !== undefined) {
                    const defaultLayoutSlug = this.$store.getters['desktop/getDefaultLayoutSlug'];
                    if (externalUrl) {
                        console.log(`[default/gotoPage] Goto EXTERNAL ---> ${url}`);
                        location.href = url;
                    } else {
                        const urlPage = url || defaultLayoutSlug;
                        if (urlPage && (urlPage !== this.$store.getters['desktop/getCurrentLayoutSlug'])) {
                            console.log(`[default/gotoPage] Goto URL (DLS = ${defaultLayoutSlug}) ---> /${role}/${urlPage}`);
                            this.$store.commit('desktop/resetCurrentLayout');
                            this.$router.push(`/${role}/${urlPage}`);
                        }
                    }
                } else {
                    console.log(`[default/gotoPage] Goto PAGE ---> /${role}/${page}`);
                    this.$store.commit('desktop/resetCurrentLayout');
                    this.$router.push(`/${role}/${page}`);
                }
            },
            say (payload) {
                if (payload && payload.msg) {
                    if (this.snackbar.model) {
                        this.snackbar.model = false;
                    }
                    this.snackbar.msg = payload.msg;
                    this.snackbar.timeout = payload.timeout || 6000;
                    this.snackbar.color = payload.type || 'info';
                    this.$nextTick(() => { this.snackbar.model = true; });
                }
            },
            veil (payload) {
                this.freeze = true;
                if (payload) {
                    this.say(payload);
                }
            },
            unveil (payload) {
                this.freeze = false;
                if (payload) {
                    this.say(payload);
                }
            },

            saveDesktop () {
                this.storeSaveDesktop({name: this.desktopName, title: this.desktopTitle});
                this.saveDesktopDlg = false;
            },
            // Delete layout dialog
            openSaveDesktopDlg (item) {
                this.$store.dispatch('site/loadRolesList');
                this.saveDesktopDlg = true;
            },
            // Delete layout dialog
            openDeleteDesktopDlg (item) {
                this.deleteMsg = this.gui.drawer.deleteDesktopDlg.msg.replace('###', item.name);
                this.deleteId = item._id;
                this.deleteDesktopDlg = true;
            },
            submitDeleteDesktopDlg () {
                this.deleteDesktopDlg = false;
                this.deleteId && this.storeDeleteDesktop(this.deleteId);
            },
            openDesktopListDlg () {
                this.storeGetDesktopList();
                this.desktopListDlg = true;
            },
            selectDesktop (item) {
                this.desktop = item.name;
                console.log(`[default] Selecting desktop ${item.name}`);
                this.storeGetDesktop(item.name);
            },
            setCurrentLayout (layout) {
                console.log('setting current Layout!');
                console.dir(layout);
                this.$root.$emit('gotoPage', {page: layout.slug || layout._id});
            }
        }
    };
</script>

<style lang="stylus">
    .app
        .app
            &_freeze
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(2, 0, 0, 0.2);
                z-index: 10000;

            &__spinner
                position absolute
                top calc( 50% - 75px )
                left calc( 50% - 75px )
                opacity: 0.5

    .footer
        padding 8px 24px
        font-style italic


    .layouts-list
        &__item
            &_active
                background lightgoldenrodyellow

</style>
