<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>

        </v-card-title>
        <v-card-text>
            <v-text-field
                    :label="gui.titleLabel"
                    v-model="dataOptions.title"
                    ref="sort"
            ></v-text-field>
            <v-text-field
                    :label="gui.subtitleLabel"
                    v-model="dataOptions.subtitle"
                    ref="sort"
            ></v-text-field>
            <v-text-field
                    :label="gui.textLabel"
                    v-model="dataOptions.text"
                    ref="sort"
                    textarea
            ></v-text-field>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'simple-text-block-options',
        props: {
            options: {
                type: Object,
                required: true
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.simpleTextBlockOptions) || {},
                dataOptions: Object.assign({
                    title: '',
                    subtitle: '',
                    text: ''
                }, this.options)
            };
        },
        watch: {
            options (val) {
                this.dataOptions = Object.assign({
                    title: '',
                    subtitle: '',
                    text: ''
                }, val);
            }
        },
        methods: {
            getOptions () {
                return Object.assign({}, {
                    title: this.dataOptions.title,
                    subtitle: this.dataOptions.subtitle,
                    text: this.dataOptions.text
                });
            }
        }

    };
</script>

<style scoped>

</style>
