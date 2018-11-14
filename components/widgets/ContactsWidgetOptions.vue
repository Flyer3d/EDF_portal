<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>Contacts form options</div>
            <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>
            <v-text-field
                    label="Email to:"
                    placeholder="yourName@mail.ru"
                    v-model="dataOptions.email"
                    ref="email"
            ></v-text-field>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'contacts-widget-options',
        props: {
            options: {
                type: Object,
                required: true
            },
            id: {
                required: true,
                type: String
            },
            model: {
                required: true,
                type: Object
            },
            widgetName: {
                required: true,
                type: String
            },
            acceptedList: {
                type: Array,
                required: true
            }
        },
        data () {
            return {
                dataOptions: Object.assign({
                    email: ''
                }, this.options)
            };
        },
        mounted () {
            console.log('[ContactsWidgetOptions] mounted');
        },
        watch: {
            options () {
                this.dataOptions = Object.assign({
                    email: ''
                }, this.options);
            }
        },
        methods: {
            getOptions () {
                return Object.assign({}, this.dataOptions);
            }
        }
    };
</script>

<style scoped>

</style>
