<template>
    <v-app light class="app page site default">
        <v-toolbar fixed app color="white">

            <avk-logo class="desktop__toolbar-logo"/>
            <v-spacer></v-spacer>
            <v-toolbar-title v-text="title"></v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>


        <v-content>
            <v-container fluid class="default__bg">
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
    import moment from 'moment';

    export default {
        components: {
            AvkLogo: () => import('~/components/site/AvkLogo')
        },
        data () {
            return {
                btn: (process.env.gui && process.env.gui.button) || {},
                now: moment().format('YYYY'),
                freeze: false,
                snackbar: {
                    color: 'info',
                    timeout: 6000,
                    msg: '',
                    model: false
                }
            };
        },
        created () {
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
            title () {
                return process.env.TITLE;
            },
            base () {
               return process.env.base;
            },
            apiBase () {
               return process.env.apiBase;
            }
        },
        methods: {
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
            }
        }
    };
</script>

<style lang="stylus">
    .default
        .default
            &__bg
                background-color #f3f4f8
                width 100vw
                height 100%
                padding 0

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

</style>
