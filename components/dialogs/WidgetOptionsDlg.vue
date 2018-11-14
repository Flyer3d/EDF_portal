<template>
    <v-card>
        <v-toolbar :color="'primary'">
            <v-spacer></v-spacer>
            <v-card-title class="widget__title">{{gui.title}}</v-card-title>
            <v-spacer></v-spacer>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex xs12 sm12 md12>
                        <v-text-field :label="gui.widgetTitleLabel" v-model.lazy="dataTitle"></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                        <v-select
                                :label="gui.widgetMenuLabel"
                                v-model="dataWidgetMenu"
                                v-bind:items="menuItems"
                                chips
                                deletable-chips
                                multiple
                                clearable
                                return-object
                        ></v-select>
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                        <v-autocomplete
                                v-model="dataModel"
                                :items="models"
                                :loading="loading"
                                :search-input.sync="modelsSearch"

                                :label="gui.widgetModelLabel"
                                clearable
                                open-on-clear

                                item-text="title"
                                item-value="name"

                                return-object
                                :rules="[() => Boolean(dataModel) || 'You must choose one item']"
                        ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                        <v-select
                                :label="gui.widgetTypeLabel"
                                :disabled="!(dataModel && dataModel.type)"
                                v-model="dataType"
                                v-bind:items="widgetTypes"
                        ></v-select>
                    </v-flex>
                </v-layout>
                <v-expansion-panel lazy>
                    <v-expansion-panel-content v-if="(dataModel && dataModel.type) && dataType">
                        <div slot="header">{{gui.optionsTitle}}</div>
                        <table-widget-options v-if="dataType === 'table'" :options="dataOptions" ref="options" :id="id"
                                              :model="dataModel" :acceptedList="acceptedList"
                                              @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle"
                                              :params="params"/>
                        <list-widget-options v-else-if="dataType === 'list'" :options="dataOptions" ref="options"
                                             :id="id" :model="dataModel" :acceptedList="acceptedList"
                                             @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle" :params="params"/>
                        <card-widget-options v-else-if="dataType === 'card'" :options="dataOptions" ref="options"
                                             :id="id" :model="dataModel" :acceptedList="acceptedList"
                                             @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle" :params="params"/>
                        <news-widget-options v-else-if="dataType === 'news'" :options="dataOptions" ref="options"
                                             :id="id" :model="dataModel" :acceptedList="acceptedList"
                                             @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle" :params="params"/>
                        <menu-widget-options v-else-if="dataType === 'poolMenu'" :options="dataOptions" ref="options"
                                             :id="id" :model="dataModel" :acceptedList="acceptedList"
                                             @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle" :params="params"/>
                        <steps-list-widget-options v-else-if="dataType === 'processStepList'" :options="dataOptions"
                                                   ref="options" :id="id" :model="dataModel"
                                                   :acceptedList="acceptedList" @optionsLoaded="isOptionsLoaded"
                                                   :widgetName="dataTitle" :params="params"/>
                        <step-widget-options v-else-if="dataType === 'processStep'" :options="dataOptions" ref="options"
                                             :id="id" :model="dataModel" :acceptedList="acceptedList"
                                             @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle" :params="params"/>
                        <auto-step-widget-options v-else-if="dataType === 'autoStep'" :options="dataOptions"
                                                  ref="options" :id="id" :model="dataModel" :acceptedList="acceptedList"
                                                  @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle"
                                                  :params="params"/>
                        <mono-step-widget-options v-else-if="dataType === 'monoStep'" :options="dataOptions"
                                                  ref="options" :id="id" :model="dataModel" :acceptedList="acceptedList"
                                                  @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle"
                                                  :params="params"/>
                        <contacts-widget-options v-else-if="dataType === 'contacts'" :options="dataOptions"
                                                 ref="options" :id="id" :model="dataModel" :acceptedList="acceptedList"
                                                 @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle"
                                                 :params="params"/>
                        <price-widget-options v-else-if="dataType === 'price'" :options="dataOptions" ref="options"
                                              :id="id" :model="dataModel" :acceptedList="acceptedList"
                                              @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle"
                                              :params="params"/>
                        <filter-widget-options v-else-if="dataType === 'filter'" :options="dataOptions" ref="options"
                                               :id="id" :model="dataModel" :acceptedList="acceptedList"
                                               @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle"
                                               :params="params"/>
                        <buttons-widget-options v-else-if="dataType === 'buttons'" :options="dataOptions" ref="options"
                                                :id="id" :model="dataModel" :acceptedList="acceptedList"
                                                @optionsLoaded="isOptionsLoaded" :widgetName="dataTitle"
                                                :params="params"/>
                        <background-widget-options v-else-if="dataType === 'background'" :options="dataOptions"
                                                   ref="options" :id="id" :model="dataModel"
                                                   :acceptedList="acceptedList" @optionsLoaded="isOptionsLoaded"
                                                   :widgetName="dataTitle" :params="params"/>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-container>
            <!--<small>*indicates required field</small>-->
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn :disabled="!optionsLoaded" color="blue darken-1" flat @click.stop="saveSettings"
                   @keydown.enter="saveSettings">{{button.save}}
            </v-btn>
            <v-btn flat @click.native="closeSettings" @keydown.esc="closeSettings">{{button.close}}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import axios from 'axios';

    const modelWidgets = [
        {text: 'Виджет таблицы сущностей', value: 'table'},
        {text: 'Виджет списка сущностей', value: 'list'},
        {text: 'Виджет карточки сущности', value: 'card'},
        {text: 'Виджет кнопок со ссылками', value: 'buttons'},
        {text: 'Виджет фильтрации', value: 'filter'},
        {text: 'Виджет фоновой картинки', value: 'background'}
    ];

    const stepWidgets = [
        {text: 'Виджет Задачи', value: 'processStep'},
        {text: 'Виджет списка Задач', value: 'processStepList'},
        {text: 'Виджет Моношага', value: 'monoStep'},
        {text: 'Виджет Автошага', value: 'autoStep'}
    ];

    const actionWidgets = [
        {text: 'Меню действий', value: 'poolMenu'}
    ];

    const newsWidgets = [
        {text: 'Виджет новостей', value: 'news'}
    ];

    const htmlWidgets = [
        {text: 'Форма контактов', value: 'contacts'}
    ];

    const priceWidgets = [
        {text: 'BAAS виджет с енами', value: 'price'}
    ];

    export default {
        name: 'widget-options-dlg',
        components: {
            TableWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/TableWidgetOptions'),
            ListWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/ListWidgetOptions'),
            MenuWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/MenuWidgetOptions'),
            NewsWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/NewsWidgetOptions'),
            StepsListWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/StepsListWidgetOptions'),
            StepWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/StepWidgetOptions'),
            AutoStepWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/AutoStepWidgetOptions'),
            MonoStepWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/MonoStepWidgetOptions'),
            CardWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/CardWidgetOptions'),
            ContactsWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/ContactsWidgetOptions'),
            PriceWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/PriceWidgetOptions'),
            FilterWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/FilterWidgetOptions'),
            BackgroundWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/BackgroundWidgetOptions'),
            ButtonsWidgetOptions: () => import(/* webpackChunkName: "Dlg" */ '~/components/widgets/ButtonsWidgetOptions')
        },
        props: {
            id: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            params: {
                type: Object
            },
            options: {
                type: Object,
                required: true
            },
            model: {
                type: Object,
                required: true
            },
            widgetMenu: {
                type: Array,
                default: () => []
            },
            acceptedList: {
                type: Array,
                required: true
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.widgetOptionsDlg) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                optionsLoaded: true,
                modelsSearch: this.model.title,
                dataTitle: this.title.slice(),
                dataWidgetMenu: this.widgetMenu.slice(),
                dataType: this.type && this.type.slice(),
                dataOptions: Object.assign({}, this.options),
                dataModel: Object.assign({}, this.model),
                modelFields: [],
                models: [],
                loading: false
            };
        },
        mounted () {
            this.modelsSuggest(this.model.title);
            this.getMenuList();
        },
        watch: {
            dataModel (val) {
                if (!val) {
                    this.dataType = '';
                } else {
                    if (_.findIndex(this.widgetTypes, {value: this.dataType}) === -1) {
                        this.dataType = '';
                    }
                }
            },
            modelsSearch (val) {
                console.log('[watch/modelSearch] searching with param^');
                console.dir(val);
                this.modelsSuggest(val);
            }
        },
        computed: {
            // ...mapGetters({
            //     loading: 'model/loading',
            //     models: 'model/models'
            // }),
            menuItems () {
                const actionList = this.$store.getters[`${this.id}/getActionList`] || [];
                return actionList.map(item => {
                    return {text: _.get(item, 'object.name'), value: _.get(item, 'object.startEventPk')};
                });
            },
            widgetTypes () {
                if (_.isEmpty(this.dataModel)) {
                    return [];
                }
                let list = [];
                if (this.dataModel.type === 'ACTION') {
                    list = list.concat(actionWidgets, modelWidgets);
                } else if (this.dataModel.type === 'STEP') {
                    list = list.concat(stepWidgets, modelWidgets);
                } else if (this.dataModel.type === 'NEWS') {
                    list = list.concat(newsWidgets, modelWidgets);
                } else if (this.dataModel.type === 'HTML') {
                    list = list.concat(htmlWidgets, modelWidgets);
                } else if (this.dataModel.type === 'PRICE') {
                    list = list.concat(priceWidgets, modelWidgets);
                } else {
                    list = list.concat(modelWidgets);
                }
                return list;
            }
        },
        methods: {
            refresh () {
                console.log(`[widgetOptionsDlg] refresh!!! this.dataType = ${this.dataType}, this.type = ${this.type}`);
                    this.dataTitle = this.title.slice();
                    this.dataWidgetMenu = this.widgetMenu.slice();
                    this.dataType = this.type && this.type.slice();
                    this.dataOptions = Object.assign({}, this.options);
                    this.dataModel = Object.assign({}, this.model);
                console.log(`[widgetOptionsDlg] refresh after!!! this.dataType = ${this.dataType}, this.type = ${this.type}`);
            },
            // ...mapActions({
            //     // modelsSuggest: 'model/suggest'
            // }),
            isOptionsLoaded (val) {
                this.optionsLoaded = val;
            },
            saveSettings () {
                const options = this.$refs.options;
                const res = {
                    title: this.dataTitle,
                    type: this.dataType.slice(),
                    model: Object.assign({}, this.dataModel),
                    widgetMenu: this.dataWidgetMenu,
                    options: Object.assign({}, (options && options.getOptions()) || {})
                };
                console.log('[WidgetOptionsDlg] Saving settings!');
                console.dir(res);
                this.$emit('save', res);
            },
            closeSettings () {
                this.$emit('close');
            },
            getMenuList () {
                this.$store.dispatch(`${this.id}/loadActionList`, {
                    pageNumber: 1,
                    // ToDO: Сделать переменной максимальное число элементов
                    pageSize: 99,
                    orderBy: this.options.orderBy,
                    query: this.options.query
                });
            },
            async modelsSuggest (val) {
                const url = `${process.env.apiBase}/model`;
                this.loading = true;
                try {
                    console.log(`[modelsSuggest] Searching with q = "${val}"`);
                    const response = await axios.get(url, { params: { q: val } });
                    this.models = response.data;
                    this.loading = false;
                } catch (err) {
                    console.error('[modelsSuggest] Error getting models list!');
                    console.dir(err);
                    this.models = [];
                    this.loading = false;
                }
            }
        }
    };
</script>

<style lang="stylus">

</style>
