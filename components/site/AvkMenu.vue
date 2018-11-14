<template>
    <div class="avk-menu" v-if="menu && menu.length > 1">
        <v-layout row nowrap class="avk-menu-big justify-center">
            <v-list class="avk-menu__list">
                <v-list-tile class="avk-menu__list-title" v-for="item in menu" :key="item.id" @click=""
                             v-bind:class="{ 'avk-menu__list-title_active': currentLayoutId == item.id }">
                    <v-list-tile-title class="avk-menu__list-item text" :class="{'text-white': !dark}"
                                       @click="setCurrentLayout(item.id)">{{ item.title }}
                    </v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-layout>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';

    export default {
        components: {},
        props: {
            dark: {
                type: Boolean,
                required: false
            },
            menu: {
                type: Array,
                required: true
            }
        },
        computed: {
            ...mapGetters({
                storeLoadedLayoutsList: 'desktop/loadedLayoutsList',
                currentLayoutId: 'desktop/getCurrentLayoutId'
            })
        },

        methods: {
            ...mapActions({
                setCurrentLayout: 'desktop/getLayout'
            })
        }
    };
</script>

<style lang="stylus">
    .avk-menu
        padding 0
        margin 0
        .icon.avk-menu__icon
            color rgba(0, 0, 0, .87);

        &__mobile-list-item
            padding 0 16px
            cursor pointer
        .avk-menu

            &__list-title .list__tile
                border-radius 30px
                height 32px
                background none

            &__list-title_active .list__tile .avk-menu__list-item
                color rgb(25, 118, 210)

            &__list
                padding 0
                display flex
                flex-flow row nowrap
                background transparent


</style>
