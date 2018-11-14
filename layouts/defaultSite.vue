<template>
    <v-app light class="app page site wbif default">

        <v-content>
            <v-container fluid class="default__bg">
                <nuxt/>
                <div class="default__logo">
                    <img :src="logoSrc" :height="36" :width="103">
                </div>
            </v-container>
        </v-content>

        <div class="app_freeze" v-if="freeze">
            <v-progress-circular indeterminate :width="2" :size="150" color="primary"
                                 class="app__spinner"></v-progress-circular>
        </div>
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
    export default {
        data () {
            return {
                btn: (process.env.gui && process.env.gui.button) || {},
                logoSrc: `${process.env.base}/img/logo.svg`,
                apiBase: process.env.apiBase,
                base: process.env.base,
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
        },
        mounted () {
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
        methods: {
            gotoPage ({page, url, externalUrl}) {
                const userRoles = this.$store.getters['login/getRoles'];
                const role = (userRoles.indexOf('web_admin') !== -1) ? 'admin' : (userRoles.indexOf('default') !== -1) ? 'default' : 'pages';
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
            }
        }
    };
</script>

<style lang="stylus">
    .default
        .default
            &__bg
                background-color #f3f4f8
                width 100%
                height 100%
                padding 0
            &__logo
                position absolute
                top 50px
                left 80px

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
