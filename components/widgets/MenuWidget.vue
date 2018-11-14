<template>
    <v-list avatar class="menu-widget">
        <template v-for="item in listData">
            <v-list-tile avatar v-bind:key="item.startEventPk" @click="doAction(item)" class="menu-widget__item">
                <v-list-tile-avatar>
                    <v-icon>play_circle_filled</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-tooltip top>
                        <v-list-tile-title slot="activator" v-html="item.name"></v-list-tile-title>
                        <span>{{item.name}}</span>
                    </v-tooltip>
                </v-list-tile-content>
            </v-list-tile>
        </template>
    </v-list>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: 'menu-widget',
        props: {
            id: {
                required: true,
                type: String
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.menuWidget) || {},
                $bus: this.storeBus,
                haveOptions: false,
                updateInterval: null,
                action: {}
            };
        },
        watch: {
            options: {
                handler () {
                    this.getData();
                    this.updateInterval && clearInterval(this.updateInterval);
                    if (this.options.autoUpdate) {
                        this.updateInterval = setInterval(() => {
                            console.log('[MenuWidget] Refresh list!');
                            this.getData();
                        }, 60000);
                    }
                },
                deep: true
            },
            actionStatus (val) {
                const action = this.action;
                if (val === 'SUCCESS') {
                    this.$bus.$emit('refresh_all');
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.msg.processSuccess && this.gui.msg.processSuccess.replace('###', action.name),
                        timeout: 6000
                    });
                } else if (val === 'STARTED') {
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.msg.startingProcess && this.gui.msg.startingProcess.replace('###', action.name),
                        timeout: 6000
                    });
                } else if (val === 'FAIL') {
                    const error = _.get(this.error, 'response.data.message');
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.msg.processError && this.gui.msg.processError.replace('###', action.name)} \n${error}`,
                        timeout: 20000
                    });
                }
            }
        },
        computed: {
            actionStatus () {
                return this.$store.getters[`${this.id}/actionStatus`];
            },
            storeBus () {
                return this.$store.getters[`${this.id}/getBus`];
            },
            data () {
                return this.$store.getters[`${this.id}/getActionList`];
            },
            error () {
                return this.$store.getters[`${this.id}/getError`];
            },
            listData () {
                return this.data.map(item => item.object).sort((a, b) => a.name && a.name.localeCompare(b.name));
            },
            options () {
                return this.$store.getters[`${this.id}/getOptions`] || {};
            }
        },
        mounted () {
            this.$bus = this.storeBus;
            this.$bus.$on('refresh_all', this.getData);
            this.getData();
            if (this.options.autoUpdate) {
               this.updateInterval = setInterval(() => {
                   console.log('[MenuWidget] Refresh list!');
                   this.getData();
                   }, 60000);
            }
        },
        beforeDestroy () {
            this.$bus && this.$bus.$off('refresh_all', this.getData);
            if (this.updateInterval) {
               clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        },
        methods: {
            getData () {
                this.$store.dispatch(`${this.id}/loadActionList`, {
                    pageNumber: 1,
                    // ToDO: Сделать переменной максимальное число элементов
                    pageSize: 99,
                    orderBy: this.options && this.options.orderBy,
                    query: this.options && this.options.query
                });
            },
            doAction (action) {
                const actionId = action.startEventPk;
                console.log('DoAction!!!!!');
                console.dir(action);
                console.log(`[MenuWidget] DoAction with id = ${actionId}`);
                this.$store.dispatch(`${this.id}/doAction`, { actionId });
                this.action = action;
            }
         }
    };
</script>

<style lang="stylus">
    .menu-widget
        .menu-widget
            &__item .list__tile
                padding 0
                .list__tile__avatar
                    min-width 42px

</style>
