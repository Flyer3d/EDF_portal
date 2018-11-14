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
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-img
                    v-if="img"
                    height="200px"
                    width="100%"
                    :src=img
            ></v-img>
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
            <v-layout>
                <span ref="img"></span>
                <v-text-field
                        prepend-icon="attach_file"
                        single-line
                        v-model="fileName"
                        @click.native="onFocus"
                        ref="fileTextField"
                        :rules="[v => !!v || 'Обязательное поле!']"
                        required
                ></v-text-field>
                <input
                        type="file"
                        accept="image/*"
                        :multiple="false"
                        ref="fileInput"
                        @change="onFileChange"
                />
            </v-layout>
        </v-flex>

    </v-layout>

</template>

<script>
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    export default {
        name: 'widget-image-field',
        mixins: [WidgetFieldMixin],
        data () {
            return {
                gui: (process.env.gui && process.env.gui.widgetImageField) || {},
                fileName: '',
                fileStorage: 'images',
                form: null
            };
        },
        mounted () {
            if (this.inputData && this.inputData !== 'null' && this.inputData !== 'undefined') {
                const splittedVal = this.inputData.split('://');
                this.fileName = splittedVal[1];
                this.fileStorage = splittedVal[0] || 'images';
            } else {
                this.fileName = (this.editable) ? '' : 'Не задан';
                this.fileStorage = (this.field.defaultValue && this.field.defaultValue.split('://')[0]) || 'images';
            }
        },
        computed: {
            isEmpty () {
                return !this.fileName;
            },
            img () {
                if (this.fieldData && this.fieldData.split('://')[1]) {
                    return `${process.env.apiBase}/img/${this.fileName}`;
                }
                return '';
            },
            isError () {
                return !this.editable && this.isEmpty;
            }
        },
        methods: {
            getData () {
                console.log(`[WidgetImageField] getting data! fieldName = ${this.fieldName}`);
                if (this.fieldName === 'Не задан') {
                    console.dir({
                        name: this.field.name,
                        value: undefined,
                        type: this.field.type,
                        form: null
                    });
                    return {
                        name: this.field.name,
                        value: undefined,
                        type: this.field.type,
                        form: null
                    };
                }
                console.dir({
                    name: this.field.name,
                    value: null,
                    fileName: this.fileName,
                    type: this.field.type,
                    form: this.form,
                    fileStorage: this.fileStorage
                });
                return {
                    name: this.field.name,
                    value: null,
                    fileName: this.fileName,
                    type: this.field.type,
                    form: this.form,
                    fileStorage: this.fileStorage
                };
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
                console.log('[WidgetImageField] onFileChange');
                console.dir(files);
                this.form = this.getSingleFormData(files[0]);
                const file = files && files[0];
                if (files) {
                    if (files.length > 0) {
                        if (!file.type.match('image.*')) {
                            alert('Image only please....');
                            this.fileName = null;
                            this.$refs.img.innerHTML = '';
                        } else {
                            this.fileName = files[0].name;
                            const reader = new FileReader();
                            // Closure to capture the file information.
                            reader.onload = (theFile => e => {
                                // Render thumbnail.
                                console.log('[WidgetImageField] InnerHTML CREATED!!!');
                                console.dir(this.$refs);
                                this.$refs.img.innerHTML = `<img class="thumb" title="${escape(theFile.name)}" src="${e.target.result}" width="64" height="64"/>`;
                            })(file);
                            // Read in the image file as a data URL.
                            reader.readAsDataURL(file);
                        }
                    } else {
                        this.fileName = null;
                        this.$refs.img.innerHTML = '';
                    }
                }
            }

        }

    };
</script>

<style lang="stylus">
    input[type=file]
        position: absolute
        left: -99999px

</style>
