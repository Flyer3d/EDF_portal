<template>
    <v-layout fill-height>
        <desktop />
    </v-layout>
</template>

<script>
    import {mapGetters} from 'vuex';
    import Desktop from '~/components/Desktop';

    /* @vue/component */
    export default {
        name: 'App',
        components: {Desktop},
        data () {
            return {
                gui: (process.env.gui && process.env.gui.app) || {}
            };
        },
        created () {
            const routeArr = this.$route.path.split('/');
            const query = this.$route.query || {};
            const path = (routeArr.length > 2) ? routeArr.pop() : '';
            if (this.userId) {
                query.__userId = this.userId;
            }
            console.log(`[APP/created] server side = ${!process.browser}! Layout --> @${path}@`);
            console.dir(query);
            console.dir(this.$route);
            if (path) {
                console.log(`[APP/created] server side! Getting layout ${path}`);
                this.$store.dispatch(`desktop/getLayout`, {path, query});
                this.$root.$emit('unveil');
                console.dir(this.$store.getters['desktop/loadedLayoutsList']);
            }
        },
        destroyed () {
        },
        computed: {
            ...mapGetters({
                isLoggedIn: 'login/isLoggedIn',
                userId: 'login/getUserId',
                desktopLoadStatus: 'desktop/getDesktopLoadStatus',
                desktopSaveStatus: 'desktop/getDesktopSaveStatus',
                desktopDeleteStatus: 'desktop/getDesktopDeleteStatus',
                defaultLayoutId: 'desktop/getDefaultLayoutId',
                currentLayoutId: 'desktop/getCurrentLayoutId',
                error: 'desktop/getError'
            })
        },
        watch: {
            '$route' (val) {
                console.log('[App] route changed!!! UNREGISTER desktop!!!');
                console.dir(val);
                this.currentLayoutId && this.$store.dispatch(`desktop/unregister`);
            },
            desktopLoadStatus (val) {
                if (val === 'LOADING') {
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.loadingMsg,
                        timeout: 6000
                    });
                } else if (val === 'LOADED') {
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.loadedMsg,
                        timeout: 6000
                    });
                } else if (val === 'ERROR') {
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.loadErrorMsg}\n${this.error}`,
                        timeout: 20000
                    });
                }
            },
            desktopDeleteStatus (val) {
                if (val === 'DELETING') {
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.deletingMsg,
                        timeout: 6000
                    });
                } else if (val === 'DELETED') {
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.deletedMsg,
                        timeout: 6000
                    });
                } else if (val === 'ERROR') {
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.deleteErrorMsg}\n${this.error}`,
                        timeout: 20000
                    });
                }
            },
            desktopSaveStatus (val) {
                if (val === 'SAVING') {
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.savingMsg,
                        timeout: 6000
                    });
                } else if (val === 'SAVED') {
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.savedMsg,
                        timeout: 6000
                    });
                } else if (val === 'ERROR') {
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.saveErrorMsg}\n${this.error}`,
                        timeout: 20000
                    });
                }
            }
        }
    };
</script>

<style lang="stylus">

</style>
