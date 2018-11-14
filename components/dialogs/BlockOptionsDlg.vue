<template>
    <v-card>
        <v-toolbar dark :color="'primary'">
            <v-spacer></v-spacer>
            <v-card-title class="widget__title">{{gui.title}}</v-card-title>
            <v-spacer></v-spacer>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex xs12 sm12 md12>
                        <v-text-field :label="gui.blockTitleLabel" v-model.lazy="dataTitle"></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                        <v-select
                                :label="gui.blockTypeLabel"
                                v-model="dataType"
                                v-bind:items="blockTypes"
                        ></v-select>
                    </v-flex>
                </v-layout>
                <v-expansion-panel lazy>
                    <v-expansion-panel-content>
                        <div slot="header">{{gui.optionsTitle}}</div>
                        <component :is="blockOptionType" :options="options" ref="options" :params="params"></component>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="blue darken-1" flat @click.stop="saveSettings" @keydown.enter="saveSettings">{{button.save}}
            </v-btn>
            <v-btn flat @click.native="closeSettings" @keydown.esc="closeSettings">{{button.close}}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    const blockTypes = [
        {text: 'Блок моношага', value: 'mono-step-block'},
        {text: 'Блок чата', value: 'chat-block'},
        {text: 'Простой текстовый блок', value: 'simple-text-block'},
        {text: 'Простой HTML блок', value: 'simple-html-block'}
    ];

    export default {
        name: 'block-options-dlg',
        components: {
            MonoStepBlockOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/blocks/MonoStepBlockOptions'),
            ChatBlockOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/blocks/ChatBlockOptions'),
            SimpleTextBlockOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/blocks/SimpleTextBlockOptions'),
            SimpleHtmlBlockOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/blocks/SimpleHtmlBlockOptions')
        },
        props: {
            title: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
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
                gui: (process.env.gui && process.env.gui.blockOptionsDlg) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                blockTypes,
                dataTitle: this.title,
                dataType: this.type,
                dataOptions: Object.assign({}, this.options),
                modelFields: []
            };
        },
        computed: {
            blockOptionType () {
                return this.dataType ? `${this.dataType}-options` : '';
            }
        },
        methods: {
            saveSettings () {
                const options = this.$refs.options;
                const res = {
                    title: this.dataTitle.slice(),
                    type: this.dataType.slice(),
                    options: Object.assign({}, (options && options.getOptions()) || {})
                };
                console.log('[BlockOptionsDlg] Saving settings!');
                console.dir(res);
                this.$emit('save', res);
            },
            closeSettings () {
                this.$emit('close');
            }
        }
    };
</script>

<style lang="stylus">

</style>
