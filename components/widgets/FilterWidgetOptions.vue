<template>
    <v-card v-if="dataOptions">
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>{{gui.title}}</div>
            <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>

            <v-select
                    v-bind:items="acceptedWidgets"
                    v-model="dataOptions.dataSource.masterWidget"
                    :label="gui.masterWidgetLabel"
                    single-line
                    bottom
            ></v-select>

            <v-btn block @click.native="getModel(model.name)">{{gui.refreshModel}}</v-btn>
            <filter-widget-options-segment
                    v-for="n in dataOptions.filters.length"
                    :fields="fields"
                    :usedFields="usedFields"
                    :options.sync="dataOptions.filters[n-1]"
                    ref="filters"
                    :key="n"
            />
            <v-btn
                    :disabled="dataOptions.filters.length >= fields.length"
                    @click.stop="addFilter"
            >{{gui.addButton}}
            </v-btn>
            <v-btn
                    :disabled="dataOptions.filters.length < 2"
                    @click.stop="removeFilter"
            >{{gui.deleteButton}}
            </v-btn>
        </v-card-text>
    </v-card>
    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>

</template>

<script>
    import _ from 'lodash';
    import FilterWidgetOptionsSegment from '~/components/widgets/FilterWidgetOptionsSegment';
    const supportedTypes = ['RADIOBUTTON', 'CHECKBOX', 'DROPDOWN_LINK', 'TEXT_AREA', 'TEXT_FIELD'];

    const defaultOptions = {
        widgetLink: false,
        filters: [{}],
        dataSource: {
            type: '',
            itemId: '',
            masterWidget: '',
            masterField: '',
            modelName: '',
            field: '',
            operator: ''

        },
        fields: []
    };

    export default {
        name: 'filter-widget-options',
        components: {
            FilterWidgetOptionsSegment
        },
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
               gui: (process.env.gui && process.env.gui.filterWidgetOptions) || {},
               dialog: false,
               itemKeys: new WeakMap(),
               currentItemKey: 0,
               dataOptions: Object.assign({}, defaultOptions, this.options)
           };
        },
        computed: {
            modelLoadStatus () {
                return this.$store.getters[`${this.id}/model/modelLoadStatus`];
            },
            storeModel () {
                return this.$store.getters[`${this.id}/model/model`];
            },
            fields () {
                if (this.dataOptions.fields && this.dataOptions.fields.length > 0) {
                    return this.dataOptions.fields.filter(field => supportedTypes.indexOf(field.type) !== -1);
                }
                return [];
            },

            acceptedWidgets () {
                if (this.acceptedList && this.acceptedList.length > 0) {
                    return this.acceptedList.filter((item) => (item.type === 'MULTI_MODEL') && (item.widgetId !== this.id)).map((item) => {
                        return {
                            text: `Виджет "${item.widgetName}"`,
                            value: item.widgetId
                        };
                    });
                } else {
                    return [];
                }
            },
            usedFields () {
                return _.compact(this.dataOptions.filters.map(filter => filter.field && filter.field.name));
            }
        },
        created () {
            if (this.dataOptions.fields && this.dataOptions.fields.length === 0) {
                this.getModel(this.model.name);
            }
        },
        watch: {
            widgetName (val) {
                if (this.dataOptions.acceptedModels && this.dataOptions.acceptedModels.length > 0) {
                    this.dataOptions.acceptedModels.forEach(item => { item.widgetName = val; });
                }
            },
            options () {
               this.dataOptions = Object.assign({}, defaultOptions, this.options);
           },
            model (val) {
               val && this.getModel(val.name);
            },
            modelLoadStatus (val) {
                if (val === 'SUCCESS') {
                    if (this.storeModel.fields && this.storeModel.fields.length > 0) {
                        this.dataOptions.fields = this.storeModel.fields
                            .sort((a, b) => ((a.tags && a.tags.order) && (b.tags && b.tags.order)) ? Number(a.tags.order) - Number(b.tags.order) : a.order - b.order);
                    } else {
                        this.dataOptions.fields = [];
                    }
                    this.$emit('optionsLoaded', true);
                }
            },
            'dataOptions.dataSource.masterWidget' (val) {
                this.dataOptions.widgetLink = Boolean(val);
            }
        },
        methods: {
            getModel (model) {
                this.dataOptions.acceptedModels = [];
                this.dataOptions.fields = [];
                this.$emit('optionsLoaded', false);
                this.$store.dispatch(`${this.id}/model/getModel`, model);
            },
            getOptions () {
                return _.cloneDeep(this.dataOptions);
            },
            dragReorder ({oldIndex, newIndex}) {
                const movedItem = this.dataOptions.fields.splice(oldIndex, 1)[0];
                this.dataOptions.fields.splice(newIndex, 0, movedItem);
            },
            itemKey (item) {
                if (!this.itemKeys.has(item)) this.itemKeys.set(item, ++this.currentItemKey);
                return this.itemKeys.get(item);
            },
            addFilter () {
                this.dataOptions.filters.push({});
            },
            removeFilter () {
                this.dataOptions.filters.pop();
            }
        }
    };
</script>

