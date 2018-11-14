<template>
    <v-card>
        <v-toolbar :color="'primary'" dark>
            <v-spacer></v-spacer>
            <v-toolbar-title>{{gui.title}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click.stop="cancel">
                <v-icon>close</v-icon>
            </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
                <v-text-field
                        :label="gui.titleLabel"
                        v-model="title"
                        :rules="[v => !!v || 'Обязательное поле!']"
                        required
                ></v-text-field>
                <v-text-field
                        :label="gui.weightLabel"
                        v-model="weight"
                        type="number"
                        :rules="[v => !!v || 'Обязательное поле!',
                                        v => !Number.isNaN(+v) || 'Числовое поле!']"
                        required
                ></v-text-field>
                <v-layout>
                    <span ref="img"></span>
                    <v-text-field
                            prepend-icon="attach_file"
                            single-line
                            v-model="filename"
                            :label="gui.fileLabel"
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
                <v-select
                        v-model="type"
                        :label="gui.typeLabel"
                        :items="categoryType"
                ></v-select>
                <v-text-field
                        v-if="type === 'link'"
                        :label="gui.urlLabel"
                        v-model="url"
                        :rules="[v => !!v || 'Обязательное поле!']"
                        required
                ></v-text-field>
                <v-checkbox v-if="type === 'link'" :label="gui.externalUrlLabel" v-model="externalUrl"
                            light></v-checkbox>
                <v-checkbox
                        :label="gui.publicLabel"
                        v-model="showUnautorized"
                        light
                ></v-checkbox>
            </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="blue darken-1" flat @click.native="save" :disabled="!valid">{{button.create}}</v-btn>
            <v-btn flat @click.native="cancel">{{button.close}}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import axios from 'axios';
    import {mapGetters} from 'vuex';

    export default {
        name: 'create-layout-category-dlg',

        data () {
            return {
                gui: (process.env.gui && process.env.gui.createLayoutCategoryDlg) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                valid: true,
                categoryType: [
                    {text: 'Нода', value: 'node'},
                    {text: 'Ссылка', value: 'link'}
                ],
                type: 'node',
                weight: '',
                url: '',
                externalUrl: false,
                showUnautorized: false,
                title: '',
                filename: '',
                file: null
            };
        },
        computed: {
            ...mapGetters({
                layoutList: 'desktop/layoutsList',
                layoutCategoryList: 'site/layoutCategoryList'
            }),
            parentLayoutList () {
                if (this.layoutList || this.layoutList.length > 0) {
                    if (this.layoutId) {
                        return this.layoutList.filter(item =>
                            (parseInt(item.id) !== parseInt(this.layoutId)) && item.parentId !== undefined).map(item => {
                            return {
                                text: item.title,
                                value: item.id
                            };
                        });
                    }
                    return this.layoutList.filter(item => item.parentId !== undefined).map(item => {
                        return {
                            text: item.title,
                            value: item.id
                        };
                    });
                }
                return [];
            }
        },
        watch: {
            itemsSearch (val) {
                if (val !== null) {
                    this.suggest(val);
                }
            }
        },
        mounted () {
            this.$store.dispatch('site/loadLayoutCategoryList');
        },
        methods: {
            cancel () {
                this.$emit('cancel');
            },
            async save () {
                if (this.$refs.form.validate()) {
                    const icon = await this.saveImage();
                    this.$store.dispatch('site/createLayoutCategory', {
                        icon,
                        showUnautorized: this.showUnautorized ? 'True' : 'False',
                        weight: Number(this.weight),
                        type: this.type,
                        url: this.url,
                        externalUrl: this.externalUrl ? 'True' : 'False',
                        name: this.title
                    });
                    this.$emit('cancel');
                }
            },
            onFocus () {
                this.error = false;
                this.$refs.fileInput.click();
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
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: `File ${file.name} successfully uploaded`,
                        timeout: 6000
                    });
                    return `/img/${fileName}`;
                } catch (err) {
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `Error uploading file ${file.name}! \n\n ${err}`,
                        timeout: 20000
                    });
                    console.log(err);
                    return null;
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
