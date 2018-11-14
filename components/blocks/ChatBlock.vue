<template>
    <v-card v-if="noCurrentChat">
        <v-list two-line v-if="chatList.length > 0">
            <template v-for="(item, index) in chatList">
                <v-list-tile
                        :key="item.code"
                        avatar
                        @click="setChat(storeChatList[index])"
                >
                    <v-list-tile-avatar>
                        <img :src="item.avatar">
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title v-html="item.title"></v-list-tile-title>
                        <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                    </v-list-tile-content>

                </v-list-tile>
            </template>
        </v-list>
        <v-layout column align-center v-else style="background: #e8e7eb; height: 60vh;">
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
                <v-btn fab small round @click.native="setChat()">
                    <v-icon large>arrow_left</v-icon>
                </v-btn>
                <h3 class="ml-3">{{currentChat['Имя собеседника']}}</h3>
            </v-layout>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 60vh;" class="chat">

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
                            <v-avatar class="avatar--outline" :size="48"><img :src="msg.userAvatar" alt="avatar">
                            </v-avatar>
                        </v-flex>
                        <v-flex xs8 :offset-xs4="msg.userId === currentUserId">
                            <v-card class="msg" :color="msg.userId !== currentUserId ? 'white' : 'blue' ">
                                <v-card-text :class="msg.userId !== currentUserId ? 'black--text' : 'white--text' ">
                                    <div>{{msg.userName}}
                                        <small>{{msg.date|toDate}}</small>
                                    </div>
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
                <v-flex xs11>
                    <v-text-field v-model="message" @keyup.enter="sendMessage()" single-line
                                  label="Type a message..."></v-text-field>
                </v-flex>
                <v-flex xs1 align-end style="min-width: 100px">
                    <v-btn color="blue" flat @click="sendMessage()">send &nbsp;
                        <v-icon>send</v-icon>
                    </v-btn>
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
    import moment from 'moment';

    export default {
        name: 'chat-block',
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
            iconSrc: `${process.env.base}/img/project/projectIcon.png`,
            letterSrc: `${process.env.base}/img/default/letter_gray.svg`,
            message: '',
            messageListLoading: false,
            messageTimer: null
        }),
        created () {
            console.log('[ChatBlock] Created! Loading list!');
            this.loadChatList();
        },
        beforeDestroy () {
            if (this.messageTimer) {
                clearInterval(this.messageTimer);
                this.messageTimer = null;
            }
        },
        watch: {
            messageListStatus (val) {
                console.log(`[messageListStatus] Status changed to ${val}`);
                console.dir(this.$refs);
                if (this.messageListLoading) {
                   if (val === 'SUCCESS' && !this.noCurrentChat()) {
                       this.messageListLoading = false;
                   }
                }
            },
            sendMessageStatus (val) {
                if (val === 'SUCCESS') {
                    this.loadMessageList();
                }
            },
            noCurrentChat (val) {
                if (val && this.messageTimer) {
                    clearInterval(this.messageTimer);
                    this.messageTimer = null;
                } else {
                    this.loadMessageList();
                    this.messageTimer = setInterval(() => this.storeLoadMessageList(), 10000);
                }
            },
            storeMessageList (val) {
                if (val.length > 0 && !this.noCurrentChat()) {
                    console.log('Messages list changed!!!');
                    console.dir(this.$refs);
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
                return this.storeChatList.map(item => ({
                    avatar: (item['Аватар собеседника'] && item['Аватар собеседника'].split('://')[1]) || this.iconSrc,
                    code: item['Код переписки'],
                    title: `${item['Имя собеседника']}`,
                    subtitle: (item['Новых сообщений']) ? `Новых сообщений: ${item['Новых сообщений']}` : 'Нет новых сообщений'
                }));
            },
            messageList () {
                return this.storeMessageList
                    .sort((a, b) => moment(a.DT).diff(moment(b.DT)))
                    .map(item => ({
                    text: item['Сообщение'],
                    userId: item['a_sub_userId'],
                    userName: (item['a_sub_userId'] === this.currentUserId) ? this.currentUserName : this.currentChat['Имя собеседника'],
                    file: item['Вложение'],
                    userAvatar: (item['a_sub_userId'] === this.currentUserId) ? ''
                        : (this.currentChat['Аватар собеседника'] && this.currentChat['Аватар собеседника'].split('://')[1]) || this.iconSrc,
                    date: item['DT'],
                    link: item['Внутренняя ссылка']
                }));
            },
            noCurrentChat () {
                return _.isEmpty(this.currentChat);
            }
        },
        methods: {
            ...mapActions({
                setChat: 'chat/setCurrentChat',
                loadChatList: 'chat/loadChatList',
                storeLoadMessageList: 'chat/loadMessageList',
                storeSendMessage: 'chat/sendMessage'
            }),
            loadMessageList () {
                this.messageListLoading = true;
                this.storeLoadMessageList();
            },
            sendMessage () {
                if (this.message) {
                    this.storeSendMessage({
                        chatId: this.currentChat['Код переписки'],
                        profileId: this.currentChat.__profileId,
                        message: this.message
                    });
                    this.message = '';
                }
            }
        }
    };
</script>

<style lang="stylus">
    .chat
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
