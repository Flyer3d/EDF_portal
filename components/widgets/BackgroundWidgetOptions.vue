<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>
            <v-layout>
                <span ref="img"></span>
                <v-text-field
                        prepend-icon="attach_file" single-line
                        v-model="filename" :label="gui.fileLabel"
                        @click.native="onFocus"
                        ref="fileTextField"
                        :rules="[v => !!v || 'Обязательное поле!']"
                        required
                ></v-text-field>
                <input type="file" accept="image/*" :multiple="false"
                       ref="fileInput" @change="onFileChange">

            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'background-widget-options',
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
                gui: (process.env.gui && process.env.gui.BackgroundWidgetOptions) || {},
                dataOptions: Object.assign({
                    img: ''
                }, this.options),
                filename: '',
                file: null,
                error: ''
            };
        },
        methods: {
            getOptions () {
                return Object.assign({}, this.dataOptions);
            },
            onFileChange ($event) {
                const files = $event.target.files || $event.dataTransfer.files;
                console.log('[CreateLayoutCathegoryDlg] onFileChange');
                console.dir(files);
                this.file = files && files[0];
                if (files) {
                    if (files.length > 0) {
                        if (!this.file.type.match('image.*')) {
                            alert('Image only please....');
                            this.filename = null;
                            this.$refs.img.innerHTML = '';
                        } else {
                            this.$emit('optionsLoaded', false);
                            this.saveImage();
                            this.filename = files[0].name;
                            const reader = new FileReader();
                            // Closure to capture the file information.
                            reader.onload = (theFile => e => {
                                // Render thumbnail.
                                console.log('InnerHTML CREATED!!!');
                                console.dir(this.$refs);
                                this.$refs.img.innerHTML = `<img class="thumb" title="${escape(theFile.name)}" src="${e.target.result}" width="64" height="64"/>`;
                            })(this.file);
                            // Read in the image file as a data URL.
                            reader.readAsDataURL(this.file);
                        }
                    } else {
                        this.filename = null;
                        this.$refs.img.innerHTML = '';
                    }
                }
            },
            onFocus () {
                this.error = false;
                this.$refs.fileInput.click();
            },
            async saveImage () {
                const file = this.file;
                const formData = new FormData();
                formData.append('file', file, file.name);
                formData.append('fileStorage', 'images');
                formData.append('fileName', file.name);
                this.$root.$emit('veil', {
                    type: 'info',
                    msg: `Uploading file ${file.name}`,
                    timeout: 6000
                });
                try {
                    const result = await axios.post(`${process.env.apiBase}/img`, formData, {headers: {'Content-Type': 'multipart/form-data', 'Authorization': axios.defaults.headers.common['Authorization']}});
                    const filePath = result.data.filePath; // Get url from response
                    const fileName = filePath.split('://')[1];
                    console.log('HTML Image saved!!!');
                    console.log(`${process.env.apiBase}/img/${fileName}`);
                    this.$emit('optionsLoaded', true);
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: `File ${file.name} successfully uploaded`,
                        timeout: 6000
                    });
                    this.dataOptions.img = `/img/${fileName}`;
                } catch (err) {
                    this.$emit('optionsLoaded', true);
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `Error uploading file ${file.name}! \n\n ${err}`,
                        timeout: 20000
                    });
                    console.log(err);
                    this.dataOptions.img = '';
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
