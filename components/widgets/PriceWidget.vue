<template>
    <v-card flat class="price-widget">
        <v-card-text>
            <v-container grid-list-md>
                <h2 class="price-widget__title mb-4">{{options.title}}</h2>
                <v-layout v-if="list && list.length > 0" row wrap class="price-widget__list">
                    <template v-for="(price, i) in list">
                        <v-flex :key="i" md4 sm4 xs4>
                            <v-card class="price-widget__card">
                                <div class="price-widget__label mb-4">{{price.object.label}}</div>
                                <div class="price-widget__price mb-4">{{price.object.price}}</div>
                                <div class="price-widget__comment">{{price.object.comment}}</div>
                            </v-card>
                        </v-flex>
                    </template>
                </v-layout>
                <div v-html="options.footer" class="price-widget__footer">></div>
                <vue-editor
                        v-show="false"
                        v-model="fake"
                >
                </vue-editor>
            </v-container>
        </v-card-text>

    </v-card>
</template>
<script>
    import { VueEditor } from 'vue2-editor';

    export default {
        name: 'card-widget',
        components: {
            VueEditor
        },
        props: {
            id: {
                required: true,
                type: String
            },
            editable: {
                required: false,
                type: Boolean,
                default: false
            },
            inputData: {
                required: false,
                type: Object,
                default: undefined
            }
        },
        data () {
            return {
                fake: ''
            };
        },
        mounted () {
            this.getList();
        },
        computed: {
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            },
            list () {
                return this.$store.getters[`${this.id}/getList`];
            }
        },
        methods: {
            getList () {
                this.$store.dispatch(`${this.id}/loadList`, {
                    model: 'BAAS_Price',
                    pageNumber: 1,
                    pageSize: 99,
                    orderBy: '',
                    query: ''
                });
            }
        }
    };
</script>

<style lang="stylus">

    .price-widget
        .price-widget
            &__title
                text-align: center

            &__list
                justify-content space-around

            &__card
                background rgb(224, 224, 224)
                margin 16px
                padding 36px 24px
                text-align center

            &__price
                font-size 120%
                font-weight:700

            &__footer
                padding 24px 48px

</style>
