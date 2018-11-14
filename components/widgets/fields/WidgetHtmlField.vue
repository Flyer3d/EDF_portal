<template>
    <v-layout wrap class="widget-field" v-if="!editable || readonlyTag">
        <v-flex xs12 sm12 md12 class="widget-field__field html-content html-container ql-editor">
            <div v-html="inputData"></div>
            <vue-editor

                    v-show="false"
                    v-model="fieldData"
            >
            </vue-editor>
        </v-flex>
    </v-layout>
    <v-layout wrap class="widget-field" v-else>
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <keep-alive>
                <vue-editor
                        v-if="visualEditor"
                        ref="editor"
                        :id="`editor_${id}`"
                        class="html-container"
                        useCustomImageHandler
                        @imageAdded="handleImageAdded"
                        v-model="fieldData"
                >
                </vue-editor>

                <no-ssr placeholder="Codemirror Loading..." v-else>
                    <codemirror
                            ref="cmEditor"
                            v-model="fieldData"
                            :options="cmOptions"
                    ></codemirror>
                </no-ssr>
            </keep-alive>
            <v-btn block @click.native="switchEditor">{{(visualEditor) ? 'Switch to text mode' : 'Switch to visual
                mode'}}
            </v-btn>

        </v-flex>
        <div v-if="outDescription" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description">
                <span v-html="outDescription"></span>
            </v-flex>
        </div>
    </v-layout>

</template>

<script>
    import { VueEditor } from 'vue2-editor';
    import axios from 'axios';

    // CodeMirror
    // theme css
    import 'codemirror/theme/base16-light.css';

    export default {
        name: 'widget-html-field',
        components: {
            VueEditor
        },
        props: {
            field: {
               type: Object,
                default: function () { return {}; }
            },
            editable: {
                required: false,
                type: Boolean,
                default: false
            },
            inputData: {
                required: false,
                type: String,
                default: undefined
            }
        },
        data () {
            return {
                id: Math.random().toString(36).substr(2, 9),
                visualEditor: true,
                fieldData: this.inputData || (this.field && this.field.defaultValue) || '',
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
                }
            };
        },
        computed: {
            readonlyTag () {
                return Boolean(this.tags.readonly);
            },
            tags () {
                return (this.field && this.field.tags) || {};
            },
            outDescription () {
                if (this.field.documentation && this.field.documentation.length > 0) {
                    if (this.field.documentation.length === 1) {
                        return this.field.documentation[0];
                    }
                    return this.field.documentation[1];
                }
                return undefined;
            },
            inDescription () {
                if (this.field.documentation && this.field.documentation.length > 0) {
                    return this.field.documentation[0];
                }
                return undefined;
            }
        },
        methods: {
            onFocus () {
                this.error = false;
            },
            validate () {
                console.log('Validate TextField!');
                if (this.tags.required) {
                    return !(this.error = Boolean(this.fieldData));
                }
                return false;
            },
            switchEditor () {
                console.log('switchEditor !!!!!');
               if (this.visualEditor && this.fieldData) {
                   console.log('Visual --> text in:');
                   console.dir(this.fieldData);
                   this.fieldData = this.fieldData.replace(/></ig, '>\n<');
                   this.$nextTick(() => {
                       const codemirror = this.$refs.cmEditor && this.$refs.cmEditor.codemirror;
                       if (codemirror) {
                           const totalLines = codemirror.lineCount();
                           codemirror.autoFormatRange({line: 0, ch: 0}, {line: totalLines});
                           codemirror.setCursor({line: 0, ch: 0});
                           console.log('Visual --> text out:');
                           console.dir(this.fieldData);
                       }
                   });
               } else {
                   console.log('Text --> Visual in:');
                   console.dir(this.fieldData);
                   this.fieldData = this.fieldData.replace(/\s+</ig, '<');
                   console.log('Text --> Visual out:');
                   console.dir(this.fieldData);
               }
                this.visualEditor = !this.visualEditor;
            },
            getData () {
                let fieldData = this.fieldData && this.fieldData.slice();
                if (!this.visualEditor && fieldData) {
                    fieldData = fieldData.replace(/\s+</ig, '<');
                }
                return {
                    name: this.field.name,
                    value: (Number(this.field.maxInstances) === 1) ? fieldData : [fieldData],
                    type: this.field.type
                };
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
            }
        }
    };
</script>

<style lang="stylus">
    @import "../../../assets/style/html.styl"

    .html-container.ql-editor
        margin 0
        padding 0

</style>
