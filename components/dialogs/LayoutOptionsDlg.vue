<template>
    <v-card>
        <v-toolbar :color="'primary'" dark>
            <v-spacer></v-spacer>
            <v-toolbar-title>{{gui.title.replace('###', title)}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click.stop="cancel">
                <v-icon>close</v-icon>
            </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex xs12 sm12 md12>
                        <v-text-field
                                :label="gui.layoutTitleLabel"
                                v-model="dataTitle"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                        <v-text-field
                                :label="gui.layoutSlugLabel"
                                v-model="dataSlug"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                        <v-select
                                :disabled="Boolean(layoutType)"
                                v-model="dataType"
                                :label="gui.typeLabel"
                                :items="layoutTypeArr"
                        ></v-select>
                    </v-flex>
                    <v-flex xs12>
                        <v-select
                                v-model="dataParent"
                                clearable
                                :label="gui.parentLabel"
                                :items="parentLayoutList"

                        ></v-select>
                    </v-flex>
                    <v-flex xs10>
                        <v-select
                                v-model="dataCategory"
                                :label="gui.categoryLabel"
                                clearable
                                :items="layoutCategoryItems"
                        ></v-select>
                    </v-flex>
                    <v-flex xs2>
                        <v-btn flat block @click.native="createLayoutCathegoryDlg = true">{{button.create}}</v-btn>
                    </v-flex>
                </v-layout>
                <v-expansion-panel>
                    <v-expansion-panel-content v-if="dataType === 'layout'">
                        <div slot="header">{{gui.optionsTitle}}</div>
                        <v-card>
                            <v-card-title center class="headline" ref="title">
                                <v-spacer></v-spacer>
                                <div>{{gui.options.title}}</div>
                                <v-spacer></v-spacer>

                            </v-card-title>
                            <v-card-text>
                                <v-layout wrap>
                                    <v-flex xs12 sm12 md12>
                                        <v-text-field
                                                :label="gui.options.colLabel"
                                                v-model="layoutOptions.colNum"
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm12 md12>
                                        <v-text-field
                                                :label="gui.options.rowLabel"
                                                v-model="layoutOptions.rowHeight"
                                        ></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content v-else-if="dataType === 'page'">
                        <div slot="header">{{gui.optionsTitle}}</div>
                        <v-card>
                            <v-card-title center class="headline" ref="title">
                                <v-spacer></v-spacer>
                                <div>{{gui.options.title}}</div>
                                <v-spacer></v-spacer>

                            </v-card-title>
                            <v-card-text>
                                <v-layout wrap>
                                    <v-flex xs12 sm12 md12>
                                        <v-text-field
                                                :label="gui.options.maxWidthLabel"
                                                v-model="pageOptions.maxWidth"
                                        ></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="blue darken-1" flat @click.native="save" :disabled="!dataTitle">{{submitButtonName}}</v-btn>
            <v-btn flat @click.native="cancel">{{button.close}}</v-btn>
        </v-card-actions>

        <v-dialog v-model="createLayoutCathegoryDlg" persistent :max-width="maxDialogWidth">
            <create-layout-category-dlg
                    ref="createLayoutCategory"
                    @cancel="createLayoutCathegoryDlg = false"
            />
        </v-dialog>
    </v-card>
</template>

<script>
    import axios from 'axios';
    import {mapGetters} from 'vuex';
    import CreateLayoutCategoryDlg from './CreateLayoutCategoryDlg';
    const layoutTypeArr = [
        {text: 'Дашборд с виджетами', value: 'layout'},
        {text: 'Статическая страница', value: 'page'}
    ];

    const defaultLayoutOptions = {
        colNum: 12,
        rowHeight: 30,
        isDraggable: true,
        isResizable: true,
        verticalCompact: true,
        useCssTransforms: true,
        autoSize: true
    };

    const defaultPageOptions = {
        maxWidth: null
    };

    export default {
        name: 'layout-options-dlg',
        components: {CreateLayoutCategoryDlg},
        props: {
            title: {
                type: String,
                required: false,
                default: 'Безымянная страница'
            },
            slug: {
                type: String,
                required: false,
                default: ''
            },
            layoutType: {
                type: String,
                required: false
            },
            layoutCategory: {
                type: String,
                required: false
            },
            layoutParentId: {
                type: [Number, String],
                required: false,
                default: null
            },
            layoutId: {
                type: [Number, String],
                required: false,
                default: null
            },
            submitButtonName: {
                type: String
            },
            options: {
                type: Object,
                required: false,
                default: () => ({})
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.layoutOptionsDlg) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                maxDialogWidth: process.env.maxDialogsWidth,
                createLayoutCathegoryDlg: false,
                dataTitle: '',
                dataSlug: '',
                categories: [],
                layoutTypeArr: layoutTypeArr,
                dataType: this.layoutType || 'layout',
                dataCategory: this.layoutCategory || '',
                dataParent: null,
                layoutOptions: defaultLayoutOptions,
                pageOptions: defaultPageOptions,
                itemsSearch: null
            };
        },
        computed: {
            ...mapGetters({
                layoutList: 'desktop/layoutsList',
                layoutCategoryList: 'site/layoutCategoryList'
            }),
            layoutCategoryItems () {
                return this.layoutCategoryList.filter(item => item.type === 'node').map(item => ({text: item.name, value: item._id}));
            },
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
            reset () {
                this.$store.dispatch('site/loadLayoutCategoryList');
                this.dataTitle = this.title.slice();
                this.dataSlug = this.slug && this.slug.slice();
                this.dataType = this.layoutType || 'layout';
                this.dataParent = parseInt(this.layoutParentId) || null;

                this.layoutOptions = Object.assign(defaultLayoutOptions, this.options);
                this.pageOptions = Object.assign(defaultPageOptions, this.options);
            },
            cancel () {
                this.$emit('cancel');
            },
            save () {
                const dataType = this.dataType;
                let dataOptions;
                if (dataType === 'layout') {
                    this.layoutOptions.colNum = parseInt(this.layoutOptions.colNum) || 12;
                    this.layoutOptions.rowHeight = parseInt(this.layoutOptions.rowHeight) || 30;
                    dataOptions = Object.assign({}, this.layoutOptions);
                } else if (dataType === 'page') {
                    this.pageOptions.maxWidth = Number(this.pageOptions.maxWidth);
                    dataOptions = Object.assign({}, this.pageOptions);
                }
                this.$emit('update', {
                    title: this.dataTitle,
                    slug: this.dataSlug ? this.dataSlug : undefined,
                    type: dataType,
                    layoutCategory: this.dataCategory,
                    parentId: (this.dataParent && parseInt(this.dataParent)) || null,
                    options: dataOptions
                });
            },
            async suggest (val) {
                const url = `${this.$store.getters['getApiBase']}/widget/suggest`;
                this.loading = true;
                try {
                    console.log(`[widgetTextField] Searching with q = "${val}"`);
                    const res = await axios.get(url, {params: {
                            q: val,
                            model: 'WEB_LayoutCategory',
                            field: 'name',
                            isDropdownLink: true
                        }});
                    this.loading = false;
                    this.items = res.data && res.data.map(item => {
                        const splitItem = String(item).split('::');
                        console.log(`Splitting item ${item} to ${splitItem[0]} and ${splitItem[1]}`);
                        return {
                            text: splitItem[1] || splitItem[0],
                            value: splitItem[0]
                        };
                    });
                    console.log(`[widgetTextField] List loaded!!!`);
                    console.dir(res.data);
                } catch (e) {
                    console.error('[widgetTextField] Error getting field list!');
                    console.dir(e);
                    this.loading = false;
                }
            }
        }
    };
</script>

<style scoped>

</style>
