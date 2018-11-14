<template>
    <v-container class="login" @keydown.enter="submit">
        <v-layout row class="login__wrapper" align-center>
            <v-flex>
                <v-card class="login__card" dark>
                    <v-card-title class="login__title" >{{gui.title}}</v-card-title>
                    <v-form v-model="valid" ref="form">
                        <v-card-text>
                            <v-text-field
                                box
                                name="login"
                                v-model="login"
                                :hint="gui.loginHint"
                                :rules="loginRules"
                                :placeholder="gui.loginStr"
                            ></v-text-field>
                            <v-text-field
                                box
                                name="password"
                                v-model="password"
                                :hint="gui.passwordHint"
                                :rules="passRules"
                                :placeholder="gui.passwordStr"
                                type="password"
                            ></v-text-field>
                            <v-alert
                                    :value="loginError"
                                    color="error"
                                    icon="warning"
                                    dismissible
                            >
                                Login or password incorrect!
                            </v-alert>
                        </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            round
                            @click.native="submit"
                            :loading="loginStatus === 'LOGGING_IN'"
                            :disabled="!valid"
                            :light="valid"
                            class="login__button"
                        >
                            {{button.login}}
                        </v-btn>
                        <v-spacer></v-spacer>
                    </v-card-actions>
                    </v-form>
                </v-card>
            </v-flex>

        </v-layout>

    </v-container>
</template>

<script>
    import {mapActions} from 'vuex';
    import _ from 'lodash';

    export default {
        name: 'Login',
        data () {
            return {
                gui: (process.env.gui && process.env.gui.login) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                valid: false,
                loginError: false,
                login: '',
                password: '',
                passRules: [
                    (v) => !!v || _.get(process.env.gui, 'login.passwordErr'),
                    (v) => (v && v.length >= 8) || _.get(process.env.gui, 'login.passwordErrHint')
                ],
                loginRules: [
                    (v) => !!v || _.get(process.env.gui, 'login.loginErr'),
                    (v) => (v && v.length >= 3) || _.get(process.env.gui, 'login.loginErrHint')
                ]
            };
        },
        watch: {
            login () {
                this.loginError = false;
            },
            password () {
                this.loginError = false;
            },
           loginStatus (val) {
               if (val === 'BAD_CREDENTIALS') {
                   this.loginError = true;
                   this.$root.$emit('say', {
                       type: 'error',
                       msg: this.gui.badCredentialsMsg,
                       timeout: 6000
                   });
               } else if (val === 'LOGGING_ERROR') {
                   this.loginError = true;
                   this.$root.$emit('say', {
                       type: 'error',
                       msg: this.gui.loginErrorMsg,
                       timeout: 6000
                   });
               }
           }
        },

        computed: {
           loginStatus () {
               return this.$store.getters[`login/getStatus`];
           }
        },
        methods: {
            ...mapActions({
                loginAction: 'login/login'
            }),
            submit () {
                if (!((this.login && this.login.length >= 3) && (this.password && this.password.length >= 8))) {
                    return;
                }
                this.loginAction({login: this.login, password: this.password});
            }
        }
    };
</script>

<style lang="stylus">

    .login
        height 100%

        &__card
            background-color #37363f !important
            padding 70px 110px
            width 650px

        &__title
            justify-content center
            font-size 30px
            line-height 36px
            font-weight bold

        &__wrapper
            margin 0 auto
            width 600px
            height 100%
            align-items center

        &__button
            width 204px
            height 50px

</style>
