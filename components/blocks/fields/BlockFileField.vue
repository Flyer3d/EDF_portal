<template>
    <v-layout class="form__field-wrapper" v-if="!isEditable">
        <v-flex>
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>
        </v-flex>
        <v-flex xs12 sm6 lg6>
            <v-text-field
                    name="text-field"
                    v-model="displayFileName"
                    :readonly="true"
            ></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 lg6>
            <v-btn flat color="primary" @click="download" :disabled="fileName === 'Не задан'">Download</v-btn>
        </v-flex>
    </v-layout>
    <v-layout class="form__field-wrapper" v-else>
        <v-flex class="text-xs-left">
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>
            <template v-if="!fileName">
                <v-btn @click.native="onFocus" dark>
                    <v-avatar size="20" tile class="mr-2">
                        <img :src="iconErrorSrc" v-if="error">
                        <img :src="iconSrc" v-else>
                    </v-avatar>
                    <span>Upload file</span>
                </v-btn>
                <input type="file"
                       accept="*"
                       :multiple="false"
                       ref="fileInput"
                       @change="onFileChange">
            </template>
            <v-layout align-center class="pl-2" v-else>
                <v-avatar size="18" tile class="mr-2 ml-1">
                    <v-img :src="downloadIcon" contain alt="download"></v-img>
                </v-avatar>
                <div class="text__small" style="color: #0f7acd; display: flex; font-weight: 500">{{fileName}}
                    <v-icon style="font-weight: bold" :size="10" class="ml-1" color="#4a4757" @click="clear">close
                    </v-icon>
                </div>
            </v-layout>
        </v-flex>
    </v-layout>
</template>
<script>
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';

    export default {
        name: 'widget-file-field',
        mixins: [BlockFieldMixin],
        data () {
            return {
                gui: (process.env.gui && process.env.gui.widgetFileField) || {},
                iconSrc: `${process.env.base}img/icons/download_white.svg`,
                downloadIcon: `${process.env.base}img/icons/download_blue.svg`,
                iconErrorSrc: `${process.env.base}img/icons/download_error.svg`,
                fileName: '',
                fileStorage: '',
                form: null
            };
        },
        mounted () {
            console.log(`[BlockFileField] Mounting field ${this.fieldLabel}`);
            if (this.inputData && this.inputData !== 'null' && this.inputData !== 'undefined') {
                const splittedVal = this.inputData.split('://');
                this.fileName = splittedVal[1];
                this.fileStorage = splittedVal[0];
            } else {
                this.fileName = (this.editable) ? '' : 'Не задан';
                this.fileStorage = (this.field.defaultValue && this.field.defaultValue.split('://')[0]) || '';
            }
        },
        computed: {
            isEmpty () {
                return !this.fileName;
            },
            displayFileName () {
                if (this.fileName.indexOf('UID/') === 0) {
                    return this.fileName.split('/')[2];
                }
                return this.fileName;
            }
        },
        methods: {
            getData () {
                if (this.fieldName === 'Не задан') {
                    return {
                        name: this.field.name,
                        value: undefined,
                        type: this.field.type,
                        form: null
                    };
                }
                return {
                    name: this.field.name,
                    value: null,
                    fileName: this.fileName,
                    type: this.field.type,
                    form: this.form,
                    fileStorage: this.fileStorage
                };
            },
            getFormData (files) {
                const forms = [];
                for (const file of files) {
                    const form = new FormData();
                    form.append('file', file, file.name);
                    forms.push(form);
                }
                return forms;
            },
            getSingleFormData (file) {
                if (file) {
                    const form = new FormData();
                    form.append('file', file, file.name);
                    return form;
                }
                return null;
            },
            onFocus () {
                this.error = false;
                this.$refs.fileInput.click();
            },
            onFileChange ($event) {
                const files = $event.target.files || $event.dataTransfer.files;
                console.dir(files);
                this.form = this.getSingleFormData(files[0]);
                if (files) {
                    if (files.length > 0) {
                        this.fileName = files[0].name;
                    } else {
                        this.fileName = null;
                    }
                } else {
                    this.fileName = $event.target.value.split('\\').pop();
                }
                this.$emit('input', this.fileName);
            },
            clear () {
                this.fileName = '';
                this.form = null;
            },
            download () {
                this.$emit('download', {fileName: this.fileName, fileStorage: this.fileStorage});
            }
        }
    };
</script>

<style lang="stylus">
    input[type=file]
        position: absolute
        left: -99999px

</style>
