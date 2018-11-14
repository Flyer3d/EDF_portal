<template>
    <v-layout wrap class="widget-field" v-if="!editable || readonlyTag">
        <v-flex xs12 sm12 md12 class="widget-field__label">
            {{fieldName}}
        </v-flex>
        <div v-if="inDescription" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description">
                <span v-html="inDescription"></span>
            </v-flex>
        </div>
        <v-flex xs12 sm6 md6 class="widget-field__field">
            <v-text-field
                    name="text-field"
                    v-model="displayFileName"
                    :readonly="true"

            ></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md6 class="widget-field__field">
            <v-btn flat color="primary" @click="download" :disabled="fileName === 'Не задан'">Download</v-btn>
        </v-flex>
    </v-layout>
    <v-layout wrap class="widget-field" v-else>
        <v-flex xs12 sm12 md12 class="widget-field__label">
            {{fieldName}}{{(requiredTag) ? '*' : ''}}
        </v-flex>
        <div v-if="outDescription" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description">
                <span v-html="outDescription"></span>
            </v-flex>
        </div>
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-text-field
                    prepend-icon="attach_file" single-line
                    v-model="displayFileName"
                    :label="gui.label"
                    readonly
                    @click.native="onFocus"
                    :error="error"
                    :error-messages="errorMsg"
                    @blur="validate"
                    ref="fileTextField"
            ></v-text-field>
            <input type="file"
                   accept="*"
                   :multiple="false"
                   ref="fileInput"
                   @change="onFileChange">
        </v-flex>
    </v-layout>

</template>

<script>
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    export default {
        name: 'widget-file-field',
        mixins: [WidgetFieldMixin],
        data () {
            return {
                gui: (process.env.gui && process.env.gui.widgetFileField) || {},
                fileName: '',
                fileStorage: '',
                form: null
            };
        },
        mounted () {
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
