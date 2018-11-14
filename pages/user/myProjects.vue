<template>
    <v-container full-height fluid flat class="my-project-list">
        <v-layout row child-flex>
            <v-flex style="flex-basis: 100%;">
                    <v-tabs
                            v-model="listTabs"
                            hide-slider
                            color="#35323f"
                            dark
                    >
                        <v-tab>
                            <v-icon small class="mr-2">person</v-icon>
                            <h4 style="font-weight: normal;" class="text-xs-left">My Projects</h4>
                            <span class="ml-2 text__label">{{ list.length || 0 }}</span>
                        </v-tab>
                        <v-tab>
                            <v-icon small class="mr-2">people</v-icon>
                            <h4 style="font-weight: normal;"  class="text-xs-left">Projects in which I participate</h4>
                            <span class="ml-2 text__label">{{ partList.length || 0 }}</span>
                        </v-tab>
                        <v-tab>
                            <v-icon small class="mr-2">bookmark</v-icon>
                            <h4 style="font-weight: normal;"  class="text-xs-left">My bookmarks</h4>
                            <span class="ml-2 text__label">{{ bookmarkedList.length || 0 }}</span>
                        </v-tab>
                    </v-tabs>
                <div  class="my-project-list__info-wrapper">
                    <v-tabs-items v-model="listTabs">
                        <v-tab-item>
                            <template v-for="item in list">
                                <my-project-list-card
                                        :itemSrc="item"
                                />
                            </template>
                        </v-tab-item>
                        <v-tab-item>
                            <template v-for="item in partList">
                                <project-simple-list-card
                                        :itemSrc="item"
                                />
                            </template>
                        </v-tab-item>
                        <v-tab-item>
                            <template v-for="item in bookmarkedList">
                                <project-list-card
                                        :itemSrc="item"
                                        short
                                />
                            </template>
                        </v-tab-item>
                    </v-tabs-items>
                </div>
            </v-flex>

            <v-flex style="flex-basis: 480px; min-width: 480px;">
                    <v-tabs
                            v-model="notificationTabs"
                            centered
                            hide-slider
                            color="#35323f"
                            dark
                    >
                        <v-tab>
                            <img :src="incomingRequestIconBlue" width="14" height="14" class="mr-2" v-if="notificationTabs === 0">
                            <img :src="incomingRequestIcon" width="14" height="14" class="mr-2" v-else>
                            <h4 style="font-weight: normal;">Incoming requests</h4>
                        </v-tab>
                        <v-tab>
                            <img :src="invitationsIconBlue" width="22" height="20" class="mr-2" v-if="notificationTabs === 1">
                            <img :src="invitationsIcon" width="22" height="20" class="mr-2" v-else>
                            <h4 style="font-weight: normal;">Invitations in projects</h4>
                        </v-tab>
                    </v-tabs>
                <div  class="my-project-list__notificationTabs-wrapper">
                    <v-tabs-items v-model="notificationTabs">
                        <v-tab-item>
                            <template v-if="projectPartList.length > 0">
                                <project-notification-card
                                    v-for="notification in projectPartList"
                                    :notification="notification"
                                    :key="notification.stepId"
                                    ></project-notification-card>
                            </template>
                        </v-tab-item>
                        <v-tab-item>
                            <template v-if="projectInvitationList.length > 0">
                                <project-notification-card
                                        v-for="notification in projectInvitationList"
                                        :notification="notification"
                                        :key="notification.stepId"
                                ></project-notification-card>
                            </template>
                        </v-tab-item>
                    </v-tabs-items>
                </div>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import ProjectListCard from '~/components/cards/ProjectListCard';
    import ProjectSimpleListCard from '~/components/cards/ProjectSimpleListCard';
    import ProjectNotificationCard from '~/components/cards/ProjectNotificationCard';
    import MyProjectListCard from '~/components/cards/MyProjectListCard';

    export default {
        name: 'my-project-list-page',
        layout: 'site',
        components: {
            ProjectNotificationCard,
            MyProjectListCard,
            ProjectListCard,
            ProjectSimpleListCard
        },
        data: () => ({
            freeze: false,
            notificationTabs: 0,
            listTabs: 0,
            incomingRequestIcon: `${process.env.base}img/icons/request_white.svg`,
            incomingRequestIconBlue: `${process.env.base}img/icons/request_blue.svg`,
            invitationsIcon: `${process.env.base}img/icons/co-investors_white.svg`,
            invitationsIconBlue: `${process.env.base}img/icons/co-investors_blue.svg`
        }),
        created () {
            console.log('[MyProjectList] Created! Loading list!');
            this.getList();
            this.loadNotificationsList();
            this.getPartList();
            this.getBookmarkedList();
            this.getBookmarkList();
        },
        watch: {
            loaded (val) {
                if (val === 'LOADED') {
                    this.$nextTick(() => {
                        this.freeze = false;
                    });
                }
            }
        },
        computed: {
            ...mapGetters({
                list: 'project/getMyList',
                partList: 'project/getMyPartList',
                bookmarkedList: 'project/getMyBookmarkedList',
                loaded: 'project/myListLoadStatus',
                bookmarksList: 'bookmark/getProjectBookmarkList',
                projectPartList: 'notification/getPartNotifications',
                projectInvitationList: 'notification/getInvitationNotifications'
            })
        },
        methods: {
            ...mapActions({
                getList: 'project/getMyList',
                getPartList: 'project/getMyPartList',
                getBookmarkedList: 'project/getMyBookmarkedList',
                loadNotificationsList: 'notification/loadNotificationList',
                getBookmarkList: 'bookmark/getList'
            })
        }
    };
</script>

<style lang="stylus">

    .my-project-list
        .my-project-list
            &__info-wrapper
                background-color: #f0eff1;
                height: calc(100vh - 122px);
                overflow-y auto
                padding 20px
            &__notificationTabs-wrapper
                background-color: #f0eff1;
                height: calc(100vh - 122px);
                padding 20px 20px 20px 0
                overflow-y auto

</style>
