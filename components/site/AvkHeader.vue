<template>
    <v-card flat class="avk-header">
        <v-card-text>
            <v-layout row nowrap class="avk-header__wrapper">
                <v-flex class="avk-header__logo">
                    <avk-logo @click="logoClick" :dark='true'/>
                </v-flex>
                <v-flex class="avk-header__title">
                    <h1>{{title}}</h1>
                </v-flex>
                <v-flex class="avk-header__login">
                    <v-btn v-if="isLoggedIn" @click.stop="logout" round color="primary" dark small>
                        <span>{{button.logout}} {{userName}}&nbsp</span>
                        <v-icon dark>exit_to_app</v-icon>
                    </v-btn>
                    <v-btn v-else @click.stop="login" round color="primary" dark small>
                        <span>{{button.login}}&nbsp</span>
                        <v-icon dark>exit_to_app</v-icon>
                    </v-btn>
                </v-flex>
            </v-layout>
            <v-layout v-if="menu" row nowrap class="avk-header__wrapper">
                <v-flex class="avk-header__menu">
                    <avk-menu :dark="true" :menu="menu"/>
                </v-flex>

            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import {mapActions, mapGetters} from 'vuex';
    import AvkLogo from './AvkLogo';
    import AvkContacts from './AvkContacts';
    import AvkMenu from './AvkMenu';

    const roleToName = {
        'user': 'агента',
        'tech': 'абонентского отдела',
        'head': 'аналитика',
        'web_admin': 'администратора'
    };

    export default {
        data () {
            return {
                gui: (process.env.gui && process.env.gui.header) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                sticky: false,
                title: roleToName[this.userRole] ? `${process.env.title} ${roleToName[this.userRole]}` : process.env.title
            };
        },
        components: {
            AvkLogo, AvkMenu, AvkContacts
        },
        props: {
            menu: {
                required: false,
                type: Array
            }
        },
        watch: {
            userRole (val) {
                this.title = roleToName[val] ? `${process.env.title} ${roleToName[val]}` : process.env.title;
            }
        },
        computed: {
            ...mapGetters({
                isLoggedIn: 'login/isLoggedIn',
                userName: 'login/getUserName'
            }),
            userRole () {
                return this.$store.getters[`login/getRoles`][0];
            }

        },
        mounted () {
            this.title = roleToName[this.userRole] ? `${process.env.title} ${roleToName[this.userRole]}` : process.env.title;
        },
        methods: {
            ...mapActions({
                logout: 'login/logout'
            }),
            onScroll (e) {
                this.sticky = (window.pageYOffset || document.documentElement.scrollTop) > 20;
            },
            logoClick () {
                this.$router.push({path: '/'});
            },
            login () {
                this.$root.$emit('unveil');
                this.$router.replace('/auth');
            }
        }
    };
</script>

<style lang="stylus">
    .avk-header
        /*max-width: 1440px;*/
        /*margin: 0 auto;*/
        padding 8px 0
        border-bottom 2px solid #aaa
        //position absolute
        z-index 2
        //top 20px
        left 0
        right 0

        //background transparent
        display flex
        flex-flow row nowrap
        justify-content center
        align-items center
        align-content center

        /*position: fixed;*/
        width 100%
        top: 0;
        background-color white

        .card__text
            padding 0

        &.avk-header_sticky
            position: fixed;
            top: 0;
            background-color rgba(255, 255, 255, 0.8)
            width: 100%;

        .btn__content
            padding-left 40px
            padding-right 40px

        .avk-header
            &__logo
            &__contacts
            &__login
                flex 0 0 200px

            &__login
                text-align right

            &__title
                flex 1 1 calc(100% - 400px)
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center

            &__logo
                padding-left 16px
                top: 6px;
                position: relative;

            &__wrapper
                max-width: 1200px;
                margin: 0 auto;
                align-items center;

            &__spacer
                flex-basis: 100%

</style>
