<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>

        </v-card-title>
        <v-card-text>
            <v-checkbox :label="gui.refreshLabel" v-model="dataOptions.autoUpdate" light></v-checkbox>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'menu-widget-options',
        props: {
            options: {
                type: Object,
                required: true
            },
            id: {
                required: true,
                type: String
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.menuWidgetOptions) || {},
                dataOptions: Object.assign({
                    autoUpdate: true
                }, this.options)
            };
        },
        mounted () {

        },
        watch: {

            options () {
                this.dataOptions = Object.assign({
                    autoUpdate: true
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

