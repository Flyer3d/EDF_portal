<template>
    <fieldset class="filter-widget-options-segment">
        <legend>{{legend}}</legend>
        <v-container grid-list-md>
            <v-layout row>
                <v-flex xs4>
                    <v-text-field
                            :label="gui.titleLabel"
                            v-model="dataOptions.title"
                            :rules="[v => !!v || 'Обязательное поле!']"
                            required
                    ></v-text-field>
                </v-flex>
                <v-flex xs4>
                    <v-select
                            v-bind:items="acceptedFields"
                            item-text="name"
                            return-object
                            v-model="dataOptions.field"
                            :label="gui.fieldLabel"
                            single-line
                            bottom
                    ></v-select>
                </v-flex>
                <v-flex xs4>
                    <v-select
                            v-bind:items="acceptedTypes"
                            v-model="dataOptions.type"
                            :label="gui.typeLabel"
                            single-line
                            :readonly="acceptedTypes.length < 2"
                            bottom
                    ></v-select>
                </v-flex>
            </v-layout>
            <v-layout v-if="dataOptions.type == 'range'">
                <v-flex xs4>
                    <v-text-field
                            v-model="dataOptions.from"
                            :label="gui.fromLabel"
                            type="number"
                    ></v-text-field>
                </v-flex>
                <v-flex xs4>
                    <v-text-field
                            v-model="dataOptions.to"
                            :label="gui.toLabel"
                            type="number"
                    ></v-text-field>
                </v-flex>
                <v-flex xs4>
                    <v-text-field
                            v-model="dataOptions.step"
                            :label="gui.stepLabel"
                            type="number"
                    ></v-text-field>
                </v-flex>
            </v-layout>
            <v-layout v-else-if="dataOptions.type == 'date-range'">
            </v-layout>
        </v-container>
    </fieldset>
</template>

<script>
    import _ from 'lodash';

    const defaultOptions = {
        title: process.env.gui.filterWidgetOptionsSegment.newFilterTitle || '',
        field: {},
        type: '',
        from: null,
        to: null,
        step: 10
    };
    const supportedTypes = ['RADIOBUTTON', 'CHECKBOX', 'DROPDOWN_LINK', 'TEXT_AREA', 'TEXT_FIELD'];
    const matchTable = {
        'RADIOBUTTON': ['radio'],
        'NUMBER': ['range'],
        'CHECKBOX': ['switch'],
        'DATE': ['date-range'],
        'DROPDOWN_LINK': ['select'],
        'TEXT_AREA': ['text-input'],
        'TEXT_FIELD': ['text-input']
    };

    export default {
        name: 'filter-widget-options-segment',
        props: {

            options: {
                type: Object,
                required: true
            },
            fields: {
                type: Array,
                required: true
            },
            usedFields: {
                type: Array,
                default: () => []
            }
        },
        data () {
           return {
               gui: (process.env.gui && process.env.gui.filterWidgetOptionsSegment) || {},
               typeList: [
                   {text: process.env.gui && process.env.gui.filterWidgetOptionsSegment.typeList.range, value: 'range'},
                   {text: process.env.gui && process.env.gui.filterWidgetOptionsSegment.typeList.textInput, value: 'text-input'},
                   {text: process.env.gui && process.env.gui.filterWidgetOptionsSegment.typeList.dateRange, value: 'date-range'},
                   {text: process.env.gui && process.env.gui.filterWidgetOptionsSegment.typeList.select, value: 'select'},
                   {text: process.env.gui && process.env.gui.filterWidgetOptionsSegment.typeList.switch, value: 'switch'},
                   {text: process.env.gui && process.env.gui.filterWidgetOptionsSegment.typeList.radio, value: 'radio'}
               ],
               dataOptions: Object.assign(_.cloneDeep(defaultOptions), this.options)
           };
        },
        watch: {
            'dataOptions.field' (val) {
                this.dataOptions.type = matchTable[val.type][0];
                this.dataOptions.title = val.name;
            },
            dataOptions: {
                handler () {
                    this.$emit('update:options', this.dataOptions);
                },
                deep: true
            }
        },
        computed: {
            legend () {
                return `Фильтр "${this.dataOptions.title}"`;
            },
            acceptedFields () {
                const selectedFieldName = this.dataOptions.field.name;
                return this.fields
                    .filter(field => supportedTypes.indexOf(field.type) !== -1)
                    .filter(field => field.name === selectedFieldName || this.usedFields.indexOf(field.name) === -1);
            },
            acceptedTypes () {
                if (!_.isEmpty(this.dataOptions.field)) {
                    const fieldType = this.dataOptions.field.type;
                    return this.typeList.filter(type => {
                        return matchTable[fieldType].indexOf(type.value) !== -1;
                    });
                }
                return [];
            }
        },
        methods: {
            getData () {
                return Object.assign({}, this.dataOptions);
            }
        }
    };
</script>

<style lang="stylus">
    .filter-widget-options-segment
        padding 16px 16px 32px 16px
        margin-bottom 20px
        border 1px solid #ccc
        legend
            padding 0 10px

</style>
