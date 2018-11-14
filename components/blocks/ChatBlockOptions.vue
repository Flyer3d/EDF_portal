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
                    ref="title"
            ></v-text-field>
        </v-card-text>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import axios from 'axios';

    const defaultOptions = {
        title: ''
    };

    export default {
        name: 'chat-block-options',
        props: {
            options: {
                type: Object,
                required: true
            },
            params: {
                type: Object
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.chatBlockOptions) || {},
                dataOptions: Object.assign({}, defaultOptions, this.options)
            };
        },
        created () {
        },
        watch: {
            options (val) {
                this.dataOptions = Object.assign({}, defaultOptions, val);
            }
        },
        methods: {
            getOptions () {
                console.log('[ChatBlockOptions] getting options!');
                console.dir(this.dataOptions);
                return Object.assign({}, this.dataOptions);
            }
        }
    };
</script>

<style lang="stylus">

</style>
