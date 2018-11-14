<template>
    <v-app light class="app page site wbif">
        <v-hover>
            <v-navigation-drawer
                    dark
                    fixed
                    app
                    :mini-variant="!hover"
                    clipped
                    v-model="drawer"
                    class="main-navigation-drawer"
                    stateless
                    slot-scope="{ hover }"
                    width="180"
            >
                <v-list dense class="main-drawer-toolbar">
                    <v-toolbar flat class="transparent">
                        <v-list class="pa-0">
                            <v-list-tile avatar>
                                <v-list-tile-avatar>
                                    <v-img contain :src="profileIcon ? profileIcon : defaultProfileIcon"></v-img>
                                </v-list-tile-avatar>

                                <v-list-tile-content>
                                </v-list-tile-content>

                                <v-list-tile-action v-if="hover">
                                    <v-btn icon @click.stop="logout">
                                        <v-avatar tile :size="20">
                                            <v-img :src="logoutIcon" alt="messages" contain></v-img>
                                        </v-avatar>
                                    </v-btn>
                                </v-list-tile-action>
                            </v-list-tile>
                        </v-list>
                    </v-toolbar>
                    <v-divider class="permanent"></v-divider>

                    <v-list dense class="pt-3">
                        <v-list-tile
                                @click.stop="chatDlg = true"
                                class="mt-2"
                        >
                            <v-list-tile-action>
                                <v-badge color="red">
                                    <span v-if="totalUnreadMessages && !hover"
                                          slot="badge">{{totalUnreadMessages}}</span>
                                    <v-avatar tile :size="20">
                                        <v-img :src="messagesIcon" alt="messages" contain></v-img>
                                    </v-avatar>
                                </v-badge>
                            </v-list-tile-action>

                            <v-list-tile-content>

                                <v-list-tile-title>Messages</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile
                                @click.stop="notificationListDlg = true"
                                class="mt-2"
                        >

                            <v-list-tile-action>
                                <v-badge color="red">
                                    <span v-if="totalUnreadNotifications && !hover" slot="badge">{{totalUnreadNotifications}}</span>
                                    <v-avatar tile :size="20">
                                        <v-img :src="notificationsIcon" alt="notifications" contain></v-img>
                                    </v-avatar>
                                </v-badge>
                            </v-list-tile-action>

                            <v-list-tile-content>
                                <v-list-tile-title>Notifications</v-list-tile-title>
                            </v-list-tile-content>

                        </v-list-tile>
                    </v-list>
                    <v-divider class="mt-4 permanent"></v-divider>
                    <v-list dense class="pt-3">
                        <v-list-tile
                                @click="gotoPage({url: 'myProjects'})"
                                class="mt-2"
                        >
                            <v-list-tile-action>
                                <v-avatar tile :size="20">
                                    <v-img :src="projectsIcon" alt="projects"></v-img>
                                </v-avatar>
                            </v-list-tile-action>

                            <v-list-tile-content>
                                <v-list-tile-title>My projects</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                    <v-divider class="mt-4 permanent"></v-divider>
                    <v-list dense class="pt-3">
                        <v-list-tile
                                @click="createProjectDlg = true"
                                class="mt-2"
                        >
                            <v-btn v-if="!hover" fab round dark icon small class="ma-0">
                                <v-avatar tile :size="20">
                                    <v-img contain :src="createProjectIcon" alt="create projects"></v-img>
                                </v-avatar>
                            </v-btn>

                            <v-btn v-else dark color="primary" round box class="ma-0">
                                <v-avatar tile :size="20" class="mr-2">
                                    <v-img contain :src="createProjectIcon" alt="create projects"></v-img>
                                </v-avatar>
                                Create project
                            </v-btn>
                        </v-list-tile>
                    </v-list>
                </v-list>
            </v-navigation-drawer>
        </v-hover>
        <v-toolbar
                class="site-toolbar"
                app
                dark
                clipped-left
                fixed
                style="z-index:100;"
        >
            <v-avatar :size="30" tile>
                <v-img :src="wbifImgSrc" alt="WBIF_Logo" contain></v-img>
            </v-avatar>
            <v-spacer></v-spacer>
            <v-toolbar-items class="main-menu">
                <v-btn
                        class="main-menu__item"
                        v-for="(menuItem, index) in menuItems"
                        flat
                        :key="index"
                        nuxt
                        :to="menuItem.url"
                >{{menuItem.text}}
                </v-btn>

            </v-toolbar-items>
            <v-spacer></v-spacer>
        </v-toolbar>

        <v-content class="pages">
            <v-container fluid>
                <nuxt/>
            </v-container>
        </v-content>

        <div class="app_freeze" v-if="freeze">
            <v-progress-circular indeterminate :width="2" :size="150" color="primary"
                                 class="app__spinner"></v-progress-circular>
        </div>

        <v-dialog v-model="chatDlg" scrollable lazy @keydown.esc="chatDlg = false" max-width="360"
                  content-class="site__chat">

            <v-card>
                <v-btn
                        class="v-btn__close"
                        absolute
                        fab
                        top
                        right
                        small
                        @click.native="chatDlg = false"
                >
                    <v-icon>close</v-icon>
                </v-btn>
                <chat-card :data="chatOptions" :params="chatParams"/>
            </v-card>
        </v-dialog>

        <v-dialog v-model="notificationListDlg" scrollable lazy @keydown.esc="notificationListDlg = false"
                  max-width="400" content-class="site__notifications">

            <v-card>
                <v-btn
                        class="v-btn__close"
                        absolute
                        fab
                        top
                        right
                        small
                        @click.native="notificationListDlg = false"
                >
                    <v-icon>close</v-icon>
                </v-btn>
                <v-card flat class="pa-0">
                    <v-card-text style="height: calc(100vh - 128px); overflow-y: auto" class="pa-0">
                        <v-layout column v-if="notificationList.length > 0" class="site__notifications-list">
                            <v-flex
                                    style="flex: 0;"
                                    v-for="notification in notificationList"
                                    :key="notification.stepId"
                            >
                                <notification-list-card
                                        ref="notificationList"
                                        :notification="notification"
                                />
                                <v-divider></v-divider>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-card>
        </v-dialog>

        <v-dialog v-model="requestProjectDlg" scrollable lazy @keydown.esc="requestProjectDlg = false" max-width="960"
                  content-class="site__notification">
            <request-project-participation-card :project="project" canClose
                                                @close="requestProjectDlg = false"></request-project-participation-card>
        </v-dialog>

        <v-dialog v-model="acceptProjectDlg" scrollable lazy @keydown.esc="acceptProjectDlg = false" max-width="960"
                  content-class="site__notification">
            <accept-project-notification-card :notification="notification" canClose
                                              @close="acceptProjectDlg = false"></accept-project-notification-card>
        </v-dialog>

        <v-dialog v-model="terminateStepDlg" scrollable lazy @keydown.esc="terminateStepDlg = false" max-width="400"
                  content-class="site__notification">
            <terminate-notification-card
                    :notification="notification"
                    canClose
                    @close="terminateStepDlg = false"
                    @submit="deleteNotification(notification.stepId)"
            ></terminate-notification-card>
        </v-dialog>

        <v-dialog v-model="createProjectDlg" scrollable lazy @keydown.esc="chatDlg = false" max-width="1024px"
                  width="67%">
            <create-project-card @close="createProjectDlg = false"/>
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
    import {mapGetters, mapActions} from 'vuex';

    const menuItems = [
        {text: 'Projects', url: '/'},
        {text: 'Members', url: '/companyList'},
        {text: 'Financial Services', url: '/fsSelect'},
        {text: 'Analytics', url: '/articleList'},
        {text: 'Events', url: '/eventList'}
    ];

    export default {
        components: {
            ChatCard: () => import(/* webpackChunkName: "Blocks" */ '~/components/cards/ChatCard'),
            NotificationListCard: () => import(/* webpackChunkName: "Blocks" */ '~/components/cards/NotificationListCard'),
            CreateProjectCard: () => import(/* webpackChunkName: "Blocks" */ '~/components/cards/CreateProjectCard'),
            AcceptProjectNotificationCard: () => import(/* webpackChunkName: "Blocks" */ '~/components/cards/AcceptProjectNotificationCard'),
            TerminateNotificationCard: () => import(/* webpackChunkName: "Blocks" */ '~/components/cards/TerminateNotificationCard'),
            RequestProjectParticipationCard: () => import(/* webpackChunkName: "Blocks" */ '~/components/cards/RequestProjectParticipationCard')
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.default) || {},
                btn: (process.env.gui && process.env.gui.button) || {},
                createProjectDlg: false,
                chatDlg: false,
                acceptProjectDlg: false,
                terminateStepDlg: false,
                notification: {},
                requestProjectDlg: false,
                notificationListDlg: false,
                project: {},
                chatOptions: {},
                projectOptions: {},
                chatParams: {},
                wbifImgSrc: `${process.env.base}/img/site/wb_short.svg`,
                defaultProfileIcon: `${process.env.base}/img/default/defaultUser.png`,
                logoutIcon: `${process.env.base}/img/icons/logout.svg`,
                messagesIcon: `${process.env.base}/img/icons/chat_icon_white.svg`,
                notificationsIcon: `${process.env.base}/img/icons/notifications_icon_white.svg`,
                projectsIcon: `${process.env.base}/img/icons/projects_white.svg`,
                createProjectIcon: `${process.env.base}/img/icons/new_project_white.svg`,
                apiBase: process.env.apiBase,
                base: process.env.base,
                drawer: true,
                mini: true,
                freeze: false,
                chatTimerId: null,
                notificationTimerId: null,
                menuItems: menuItems,
                snackbar: {
                    color: 'info',
                    timeout: 6000,
                    msg: '',
                    model: false
                }
            };
        },
        watch: {
            drawer (val) {
                console.log(`Drawer changed to ${val}`);
                if (!val) {
                    this.$nextTick(() => {
                        this.drawer = true;
                        this.mini = true;
                    });
                }
            }
        },
        created () {
            this.$vuetify.icons.dropdown = 'keyboard_arrow_down';
            this.loadSiteData();
        },
        mounted () {
            this.desktopTitle = this.$store.getters['desktop/getDesktopTitle'];
            this.loadChatList();
            this.getBookmarks();
            this.chatTimerId = setInterval(() => this.loadChatList(), 30000);
            this.loadNotificationsList();
            this.notificationTimerId = setInterval(() => this.loadNotificationsList(), 60000);
            this.$root.$on('veil', this.veil);
            this.$root.$on('unveil', this.unveil);
            this.$root.$on('say', this.say);
            this.$root.$on('gotoPage', this.gotoPage);
            this.$root.$on('doStep', this.doStep);
            this.$root.$on('terminateStep', this.terminateStep);
            this.$root.$on('requestProject', this.requestProject);
            this.$root.$on('sendMessage', this.sendMessage);
        },
        beforeDestroy () {
            if (this.chatTimerId) {
                clearInterval(this.chatTimerId);
                this.chatTimerId = null;
            }
            this.$root.$off('veil', this.veil);
            this.$root.$off('unveil', this.unveil);
            this.$root.$off('say', this.say);
            this.$root.$off('gotoPage', this.gotoPage);
            this.$root.$off('doStep', this.doStep);
            this.$root.$off('terminateStep', this.terminateStep);
            this.$root.$off('requestProject', this.requestProject);
            this.$root.$off('sendMessage', this.sendMessage);
        },
        computed: {
            ...mapGetters({
                storeDrawer: 'drawer',
                storeUserName: 'login/getUserName',
                profile: 'login/getProfile',
                storeProfileIcon: 'login/getProfileIcon',
                storeProfileName: 'login/getProfileName',
                totalUnreadMessages: 'chat/totalUnreadMessages',
                notificationList: 'notification/notificationList',
                totalUnreadNotifications: 'notification/totalUnreadNotifications',
                getNotificationByStepId: 'notification/getNotificationByStepId',
                error: 'desktop/getError'

            }),
            profileIcon () {
                const iconName = this.storeProfileIcon;
                if (iconName) {
                    return `${this.apiBase}/img/${iconName}`;
                }
                return '';
            }
        },
        methods: {
            ...mapActions({
                setChat: 'chat/setCurrentChat',
                storeLogout: 'login/logout',
                getBookmarks: 'bookmark/getList',
                loadSiteData: 'site/loadData',
                loadChatList: 'chat/loadChatList',
                loadNotificationsList: 'notification/loadNotificationList',
                deleteNotification: 'notification/deleteNotification',
                storeGetDesktop: 'desktop/getDesktop'
            }),
            gotoPage ({page, url, externalUrl}) {
                const userRoles = this.$store.getters['login/getRoles'];
                const role = (userRoles.indexOf('web_admin') !== -1) ? 'admin' : (userRoles.indexOf('default') !== -1) ? 'default' : 'user';
                if (url !== undefined) {
                    const defaultLayoutSlug = this.$store.getters['desktop/getDefaultLayoutSlug'];
                    if (externalUrl) {
                        location.href = url;
                    } else {
                        const urlPage = url || defaultLayoutSlug;
                        if (urlPage && (urlPage !== this.$store.getters['desktop/getCurrentLayoutSlug'])) {
                            this.$store.commit('desktop/resetCurrentLayout');
                            this.$router.push(`/${role}/${urlPage}`);
                        }
                    }
                } else {
                    this.$store.commit('desktop/resetCurrentLayout');
                    this.$router.push(`/${role}/${page}`);
                }
            },
            doStep ({ stepId }) {
                console.log(`[site/doStep] Doing step id = ${stepId}`);
                console.dir(this.getNotificationByStepId(stepId));
                this.notification = this.getNotificationByStepId(stepId);
                this.$nextTick(() => {
                    this.acceptProjectDlg = true;
                });
            },
            terminateStep ({ stepId }) {
                console.log(`[site/terminateStep] Terminating step id = ${stepId}`);
                console.dir(this.getNotificationByStepId(stepId));
                this.notification = this.getNotificationByStepId(stepId);
                this.$nextTick(() => {
                    this.terminateStepDlg = true;
                });
            },
            requestProject ({ project }) {
                this.project = project;
                this.$nextTick(() => {
                    this.requestProjectDlg = true;
                });
            },
            say (payload) {
                if (payload && payload.msg) {
                    if (this.snackbar.model) {
                        this.snackbar.model = false;
                    }
                    this.snackbar.msg = payload.msg;
                    this.snackbar.timeout = payload.timeout || 6000;
                    this.snackbar.color = payload.type || 'info';
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
            logout () {
                this.mini = true;
                this.storeLogout();
            },
            sendMessage ({profileId, profileTitle, profileAvatar, projectId, chatId}) {
                this.setChat({
                    'Имя собеседника': profileTitle,
                    'Аватар собеседника': profileAvatar,
                    __profileId: profileId,
                    'Проект': projectId,
                    'Код переписки': chatId
                });
                this.$nextTick(() => { this.chatDlg = true; });
            },
            openNotificationListDlg () {
                this.$nextTick(() => {
                    this.notificationListDlg = true;
                });
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
