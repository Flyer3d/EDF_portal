<template>
    <v-card flat class="background-widget" height="100%">
        <v-img
                class="white--text"
                height="100%"
                width="100%"
                :src=img
        ></v-img>
    </v-card>
</template>
<script>
    export default {
        name: 'background-widget',
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
                $bus: this.storeBus,
                masterWidget: ''
            };
        },
        computed: {
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            },
            img () {
                return `${process.env.apiBase}${this.options.img}`;
            }
        },
        methods: {

        }
    };
</script>

<style lang="stylus">

    .card-widget
        .card-widget
            &__layout
                align-items center

</style>
