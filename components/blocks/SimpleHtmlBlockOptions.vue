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
            <keep-alive>
                <vue-editor
                        v-if="visualEditor"
                        ref="editor"
                        useCustomImageHandler
                        @imageAdded="handleImageAdded"
                        v-model="dataOptions.html"
                >
                </vue-editor>

                <no-ssr placeholder="Codemirror Loading..." v-else>
                    <codemirror
                            ref="cmEditor"
                            v-model="dataOptions.html"
                            :options="cmOptions"
                    ></codemirror>
                </no-ssr>
            </keep-alive>
            <v-btn block @click.native="switchEditor">{{(visualEditor) ? 'Switch to text mode' : 'Switch to visual mode'}}
            </v-btn>
        </v-card-text>
    </v-card>
</template>

<script>
    import axios from 'axios';
    import { VueEditor } from 'vue2-editor';
    import 'codemirror/theme/base16-light.css';

    export default {
        name: 'simple-html-block-options',
        props: {
            options: {
                type: Object,
                required: true
            }
        },
        components: {
            VueEditor
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.simpleHtmlBlockOptions) || {},
                visualEditor: false,
                cmOptions: {
                    tabSize: 2,
                    styleActiveLine: true,
                    lineNumbers: true,
                    autoCloseTags: true,
                    line: true,
                    mode: 'text/html',
                    theme: 'base16-light',
                    extraKeys: {
                        'F11' (cm) {
                            cm.setOption('fullScreen', !cm.getOption('fullScreen'));
                        },
                        'Esc' (cm) {
                            if (cm.getOption('fullScreen')) cm.setOption('fullScreen"', false);
                        }
                    }
                },
                dataOptions: Object.assign({
                    title: '',
                    subtitle: '',
                    html: ''
                }, this.options)
            };
        },
        watch: {
            options (val) {
                this.dataOptions = Object.assign({
                    title: '',
                    subtitle: '',
                    html: ''
                }, val);
            }
        },
        methods: {
            switchEditor () {
                console.log('switchEditor !!!!!');
                if (this.visualEditor && this.dataOptions.html) {
                    console.log('Visual --> text in:');
                    console.dir(this.dataOptions.html);
                    this.dataOptions.html = this.dataOptions.html.replace(/></ig, '>\n<');
                    this.$nextTick(() => {
                        const codemirror = this.$refs.cmEditor && this.$refs.cmEditor.codemirror;
                        if (codemirror) {
                            const totalLines = codemirror.lineCount();
                            codemirror.autoFormatRange({line: 0, ch: 0}, {line: totalLines});
                            codemirror.setCursor({line: 0, ch: 0});
                            console.log('Visual --> text out:');
                            console.dir(this.dataOptions.html);
                        }
                    });
                } else {
                    console.log('Text --> Visual in:');
                    console.dir(this.dataOptions.html);
                    this.dataOptions.html = this.dataOptions.html.replace(/\s+</ig, '<');
                    console.log('Text --> Visual out:');
                    console.dir(this.dataOptions.html);
                }
                this.visualEditor = !this.visualEditor;
            },
            handleImageAdded: function (file, Editor, cursorLocation, resetUploader) {
                const formData = new FormData();
                formData.append('file', file, file.name);
                formData.append('fileStorage', 'images');
                formData.append('fileName', file.name);
                this.$root.$emit('veil', {
                    type: 'info',
                    msg: `Uploading file ${file.name}`,
                    timeout: 6000
                });
                axios.post(
                    `${process.env.apiBase}/img`,
                    formData,
                    {headers: {'Content-Type': 'multipart/form-data', 'Authorization': axios.defaults.headers.common['Authorization']}}
                )
                    .then((result) => {
                        const filePath = result.data.filePath; // Get url from response
                        const fileName = filePath.split('://')[1];
                        console.log('HTML Image saved!!!');
                        console.log(`${process.env.apiBase}/img/${fileName}`);
                        Editor.insertEmbed(cursorLocation, 'image', `${process.env.apiBase}/img/${fileName}`);
                        this.$root.$emit('unveil', {
                            type: 'success',
                            msg: `File ${file.name} successfully uploaded`,
                            timeout: 6000
                        });
                        resetUploader();
                    })
                    .catch((err) => {
                        this.$root.$emit('unveil', {
                            type: 'error',
                            msg: `Error uploading file ${file.name}! \n\n ${err}`,
                            timeout: 20000
                        });
                        console.log(err);
                    });
            },
            getOptions () {
                return Object.assign({}, {
                    title: this.dataOptions.title,
                    subtitle: this.dataOptions.subtitle,
                    html: this.dataOptions.html
                });
            }

        }

    };
</script>

<style scoped>

</style>
