<template>
    <v-card v-if="noCurrentChat" class="chat">
        <v-list three-line v-if="chatList.length > 0">
            <template v-for="(item, index) in chatList">
                <v-list-tile
                        :key="item.code"
                        avatar
                        @click="setChat(storeChatList[index])"
                >
                    <v-list-tile-action style="min-width: 24px; flex: 0 0 24px;">
                        <v-icon v-if="item.newMessages > 0" color="primary" small>fiber_manual_record</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-avatar>
                        <v-img contain :src="item.avatar"></v-img>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title class="d-flex">
                            <v-flex>{{ item.title }}</v-flex>
                            <v-flex class="text-xs-right text__label_small">{{ item.lastMessage | fromNow }}</v-flex>
                        </v-list-tile-title>
                        <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                        <v-list-tile-sub-title v-if="item.projectId">
                            <v-btn
                                    round
                                    dark
                                    nuxt
                                    :to="`/project/${item.projectId}`"
                                    class="v-btn--tiny"
                            >
                                {{item.projectName}}
                            </v-btn>
                        </v-list-tile-sub-title>
                    </v-list-tile-content>

                </v-list-tile>
            </template>
        </v-list>
        <v-layout column align-center v-else style="background: #f3f4f8; height: 60vh;">
            <v-spacer></v-spacer>
            <v-flex class="text-xs-center">
                <img :src="letterSrc" :width="105" :height="50" contain class="my-4">
                <div class="text__label mb-4">No messages<br>have been sent yet</div>
            </v-flex>
            <v-spacer></v-spacer>
        </v-layout>
    </v-card>
    <v-card v-else class="chat">
        <v-card-title>
            <v-layout align-center>
                <v-flex style="flex: 0;">
                    <v-icon large @click="setChat()">chevron_left</v-icon>
                </v-flex>
                <v-divider class="mx-3" inset vertical></v-divider>
                <v-flex v-if="currentChat['Имя собеседника']">
                    <v-layout column>
                        <v-flex><h3>{{currentChat['Имя собеседника']}}</h3></v-flex>
                        <v-flex v-if="currentProjectId">
                            <v-btn
                                    round
                                    dark
                                    nuxt
                                    :to="`/project/${currentProjectId}`"
                                    class="v-btn--tiny">
                                {{currentProjectName}}
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex v-else>
                    <v-autocomplete
                            clsass="pt-0"
                            v-if="!currentUser.name"
                            hide-details
                            v-model="currentUser"
                            :disabled="usersListLoading"
                            :items="usersList"
                            flat
                            chips
                            single-line
                            color="blue-grey lighten-2"
                            label="Select company"
                            item-text="name"
                            item-value="value"
                            return-object
                    >
                        <template
                                slot="selection"
                                slot-scope="data"
                        >
                            <v-avatar>
                                <v-img :src="data.item.avatar" contain></v-img>
                            </v-avatar>
                            {{ data.item.name }}
                        </template>
                        <template
                                slot="item"
                                slot-scope="data"
                        >
                            <v-list-tile-avatar>
                                <img :src="data.item.avatar">
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                            </v-list-tile-content>
                        </template>
                    </v-autocomplete>
                    <v-flex v-else>
                        <v-layout column>
                            <v-flex>
                                <v-layout align-center>
                                    <v-flex><h3>{{currentUser.name}}</h3></v-flex>
                                    <v-spacer></v-spacer>
                                    <v-flex style="flex: 0;">
                                        <v-icon @click="currentUser = {}">close</v-icon>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                            <v-flex v-if="currentProjectId">
                                <v-btn
                                        round
                                        dark
                                        nuxt
                                        :to=`/project/${currentProjectId}`"
                                        class="v-btn--tiny"
                                >
                                    {{currentProjectName}}
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-flex>
            </v-layout>

        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: calc(100vh - 300px);" class="chat__text" ref="messages">
            <v-layout>
                <v-container grid-list-xl fluid row>
                    <v-layout
                            v-for="(msg, index) in messageList"
                            :key="index"
                            row
                            :align-start="msg.userId !== currentUserId"
                            :align-end="msg.userId === currentUserId"
                            :align-content-start="msg.userId === currentUserId"
                            :align-content-end="msg.userId !== currentUserId"
                    >
                        <v-flex shrink style="width: 60px" v-if="msg.userId !== currentUserId">
                            <v-avatar :size="48">
                                <v-img contain :src="msg.userAvatar" alt="avatar"></v-img>
                            </v-avatar>
                        </v-flex>
                        <v-flex xs8 :offset-xs4="msg.userId === currentUserId">
                            <div class="text__small dark">
                                <span v-if="msg.userId !== currentUserId" class="mr-4">{{msg.userName}}</span>
                                <span class="text__label_tiny">{{msg.date|toDate}}</span>
                            </div>
                            <v-card class="msg" :color="msg.userId !== currentUserId ? 'blue' : 'white' ">
                                <v-card-text :class="msg.userId !== currentUserId ? 'white--text' : 'black--text' ">
                                    {{msg.text}}
                                </v-card-text>
                            </v-card>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-layout>
            <div ref="messagesEnd"></div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions style="height: 96px;">
            <v-layout row align-center class="pa-2">
                <v-flex>
                    <v-text-field v-model="message" @keyup.enter="sendMessage()" single-line
                                  label="Enter your message"></v-text-field>
                </v-flex>
                <v-flex style="flex: 0;">
                    <v-icon large color="primary" @click="sendMessage()">send</v-icon>
                </v-flex>
            </v-layout>
        </v-card-actions>
        <div class="loading" v-if="sendMessageStatus === 'IN_PROGRESS'">
            <v-progress-circular indeterminate :width="2" :size="150" color="primary"
                                 class="loading__spinner"></v-progress-circular>
        </div>
    </v-card>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import _ from 'lodash';
    import axios from 'axios';
    import moment from 'moment';

    export default {
        name: 'chat-card',
        props: {
            data: {
                type: Object,
                required: true
            },
            params: {
                type: Object
            }
        },
        data: () => ({
            defaultUserSrc: `${process.env.base}/img/default/defaultUser.png`,
            iconSrc: `${process.env.base}/img/project/projectIcon.png`,
            letterSrc: `${process.env.base}/img/default/letter_gray.svg`,
            usersListSrc: [],
            usersList: [],
            currentUser: {},
            usersListLoading: false,
            message: '',
            messageTimer: null
        }),
        created () {
            console.log('[ChatBlock] Created! Loading list!');
            this.loadChatList();
            this.getUsersList();
        },
        beforeDestroy () {
            if (this.messageTimer) {
                clearInterval(this.messageTimer);
                this.messageTimer = null;
            }
        },
        watch: {

            'storeMessageList.length' () {
                        if (this.$refs.messages) {
                            const element = this.$refs.messages;
                            element.scrollTop = element.scrollHeight;
                            setTimeout(() => {
                                if (this.$refs.messages) {
                                    const element = this.$refs.messages;
                                    element.scrollTop = element.scrollHeight;
                                }
                            }, 100);
                        }
                        this.messageListLoading = false;
            },

            noCurrentChat (val) {
                if (val && this.messageTimer) {
                    clearInterval(this.messageTimer);
                    this.messageTimer = null;
                } else {
                    this.loadMessageList();
                    this.messageTimer = setInterval(() => this.loadMessageList(), 10000);
                }
            },
            currentChat (val) {
                if (!_.isEmpty(val) && !val['Имя собеседника']) {
                    this.getUsersList();
                }
            }
        },
        computed: {
            ...mapGetters({
                storeChatList: 'chat/chatList',
                storeMessageList: 'chat/messageList',
                sendMessageStatus: 'chat/getSendMessageStatus',
                messageListStatus: 'chat/getMessageListStatus',
                currentChat: 'chat/currentChat',
                currentUserId: 'login/getUserId',
                currentUserName: 'login/getUserName'
            }),
            chatList () {
                return this.storeChatList
                    .sort((a, b) => moment(b['Время последнего сообщения']).diff(moment(a['Время последнего сообщения'])))
                    .map(item => {
                    let avatar;
                    const icon = item['Аватар собеседника'];
                    if (icon && icon.split('://')[1]) {
                        avatar = `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                    } else {
                        avatar = this.defaultUserSrc;
                    }
                    let projectName, projectId;
                    if (!_.isEmpty(item['Проект'])) {
                        projectName = _.get(item, '[\'Проект\'].entityDesc');
                        projectId = _.get(item, '[\'Проект\'].entityInstancePk.entityInstanceId');
                    }
                    return {
                        projectName,
                        projectId,
                        avatar,
                        lastMessage: item['Время последнего сообщения'],
                        newMessages: item['Новых сообщений'],
                        code: item['Код переписки'],
                        title: `${item['Имя собеседника']}`,
                        subtitle: (item['Новых сообщений']) ? `New messages: ${item['Новых сообщений']}` : 'No new messages'
                    };
                });
            },
            messageList () {
                return this.storeMessageList
                    .sort((a, b) => moment(a.DT).diff(moment(b.DT)))
                    .map(item => {
                        let userIcon;
                        if (this.currentChat['Аватар собеседника'] && this.currentChat['Аватар собеседника'].split('://')[1]) {
                            userIcon = `${process.env.apiBase}/img/${this.currentChat['Аватар собеседника'].split('://')[1]}`;
                        }
                        return {
                            text: item['Сообщение'],
                            userId: item['a_sub_userId'],
                            userName: (item['a_sub_userId'] === this.currentUserId) ? this.currentUserName : this.currentChat['Имя собеседника'],
                            file: item['Вложение'],
                            userAvatar: (item['a_sub_userId'] === this.currentUserId) ? ''
                                : (userIcon || this.defaultUserSrc),
                            date: item['DT'],
                            link: item['Внутренняя ссылка']
                        };
                    });
            },
            noCurrentChat () {
                return _.isEmpty(this.currentChat);
            },
            currentProjectName () {
                if (this.noCurrentChat) {
                    return '';
                }
                return _.get(this.currentChat, '[\'Проект\'].entityDesc');
            },
            currentProjectId () {
                if (this.noCurrentChat) {
                    return '';
                }
                return _.get(this.currentChat, '[\'Проект\'].entityInstancePk.entityInstanceId');
            }
        },
        methods: {
            ...mapActions({
                setChat: 'chat/setCurrentChat',
                loadChatList: 'chat/loadChatList',
                loadMessageList: 'chat/loadMessageList',
                storeSendMessage: 'chat/sendMessage'
            }),
            attachFile () {

            },
            sendMessage () {
                if (this.message) {
                    if (!this.currentUser.name && !this.currentChat['Код переписки']) {
                        console.log(`[sendMessage] No user srelected!!`);
                        return;
                    }
                    if (!this.currentChat.__profileId && !this.currentChat['Код переписки']) {
                        this.setChat({
                            'Имя собеседника': this.currentUser.name,
                            'Аватар собеседника': this.currentUser.avatar,
                            __profileId: this.currentUser.value,
                            'Проект': this.currentChat['Проект'],
                            'Код переписки': this.currentChat['Код переписки']
                        });
                    }
                    this.$nextTick(() => {
                        console.log('[sendMessage] Sending.....');
                        console.dir({
                            chatId: this.currentChat['Код переписки'],
                            profileId: this.currentChat.__profileId || this.currentUser.value,
                            projectId: this.currentChat['Проект'],
                            message: this.message
                        });
                        this.storeSendMessage({
                            chatId: this.currentChat['Код переписки'],
                            profileId: this.currentChat.__profileId || this.currentUser.value,
                            projectId: this.currentChat['Проект'],
                            message: this.message
                        });
                        this.message = '';
                    });
                }
            },
            async getUsersList () {
                console.log('[getUsersList] Loading... ');
                const url = `${process.env.apiBase}/widget`;

                const params = {
                    model: 'Профиль участника',
                    userOnly: false,
                    pageNumber: 1,
                    pageSize: 1000,
                    orderBy: 'Название',
                    query: ''
                };
                try {
                    this.usersListLoading = true;
                    const usersListSrc = await axios.get(url, { params });
                    console.log('[getUsersList] Users list loaded!');
                    console.dir(usersListSrc);
                    this.usersListSrc = usersListSrc.data;
                    this.usersList = usersListSrc.data.rows
                        .filter(item => Boolean(item.object.user_id))
                        .map(user => {
                        let icon = user.entityIcon;
                        if (icon && icon.split('://')[1]) {
                            icon = `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                        } else {
                            icon = this.defaultUserSrc;
                        }
                        return {
                            avatar: icon,
                            name: user.entityDesc,
                            value: user.entityInstancePk.entityInstanceId
                        };
                    });
                    this.usersListLoading = false;
                    console.dir(this.usersList);
                } catch (err) {
                    console.error('[getUsersList] Error loading user list!');
                    console.dir(err);
                    this.usersListLoading = false;
                }
            }
        }
    };
</script>

<style lang="stylus">
    .chat
        min-height 60vh
        background #f3f4f8 !important
        .v-input.v-text-field
            padding-top 0

        .chat__text
            background white
            overflow auto

    .loading
        width: 100%;
        height 100%;
        top 0
        left 0
        z-index 100
        background rgba(255, 255, 255, 0.4)
        position absolute;


        .loading
            &__spinner
                position absolute
                bottom 20vh
                left calc( 50% - 75px )
                opacity: 0.5


</style>
