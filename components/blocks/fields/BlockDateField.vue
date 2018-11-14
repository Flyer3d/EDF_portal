<template>
    <v-layout class="form__field-wrapper" v-if="!isEditable">
        <v-flex>
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>
            <v-text-field
                    name="text-field"
                    v-model="dateToText"
                    :readonly="true"
                    :disabled="disabled"
                    single-line
                    hide-details
                    :solo="dark"
                    :box="!dark"
            ></v-text-field>
        </v-flex>
    </v-layout>
    <v-layout class="form__field-wrapper" v-else>
        <v-flex>
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>
            <v-menu
                    ref="menu"
                    @focus="onFocus"
                    lazy
                    :close-on-content-click="false"
                    v-model="menu"
                    :disabled="disabled"
                    transition="scale-transition"
                    offset-y
                    full-width
                    :nudge-right="40"
                    max-width="290px"
                    min-width="290px"
                    :return-value.sync="date"

                    single-line
                    hide-details
                    :solo="dark"
                    :box="!dark"
            >
                <v-text-field
                        slot="activator"
                        :label="gui.label"
                        v-model="dateFormatted"
                        :error="error"
                        :disabled="disabled"
                        readonly
                        :mask="maskTag"
                        return-masked-value
                        :error-messages="errorMsg"
                        prepend-icon="event"
                        @focus="onFocus"
                        @keydown.enter.native="date = parseDate(fieldData)"

                        single-line
                        hide-details
                        :solo="dark"
                        :box="!dark"
                ></v-text-field>
                <v-date-picker
                        :readonly="readonlyTag"
                        :first-day-of-week="1"
                        v-model="date"
                        @input="dateFormatted = formatDate($event)"
                        @keydown.enter.native="menu = false"
                        no-title
                        scrollable
                        locale="en"
                >
                    <v-spacer></v-spacer>
                    <v-btn flat color="primary" @click="menu = false">{{button.cancel}}</v-btn>
                    <v-btn flat color="primary" @click="$refs.menu.save(date)">{{button.choose}}</v-btn>
                </v-date-picker>
            </v-menu>
        </v-flex>
    </v-layout>
</template>

<script>
    import moment from 'moment';
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';

    export default {
        name: 'widget-date-field',
        mixins: [BlockFieldMixin],
        data () {
            return {
                // formattedDate: null,
                DOMElem: null,
                button: (process.env.gui && process.env.gui.button) || {},
                gui: (process.env.gui && process.env.gui.widgetDateField) || {},
                date: null,
                dateFormatted: null,
                menu: false
            };
        },
        mounted () {
            this.DOMElem = this.$el;
            moment.locale('en');
            console.log(`Widget DATE mounted. fieldData === ${this.fielfData}`);
            if (this.inputData) {
                this.date = moment(this.inputData).format('YYYY-MM-DD');
            }
        },
        watch: {
            date (val) {
                this.dateFormatted = this.formatDate(this.date);
                if (val) {
                    this.fieldData = moment(val, 'YYYY-MM-DD').format();
                }
            },
            inputData (val) {
                console.log(`[WidgetDate/inputData] Updated with val = ${val}`);
                if (val) {
                    this.date = moment(val).format('YYYY-MM-DD');
                    // this.formatDate();
                }
            }
        },
        computed: {
            computedDateFormatted () {
                return this.formatDate(this.date);
            },
            dateToText () {
                if (this.disabled) {
                    return '';
                }
                return moment(this.fieldData).format(this.formatTag || 'DD/MM/YYYY');
            }
        },
        methods: {

            getData () {
                const data = this.fieldData;
                return {
                    name: this.field.name,
                    value: (Number(this.field.maxInstances) === 1) ? data : [data],
                    type: this.field.type
                };
            },
            formatDate (date) {
                if (!date) {
                    return null;
                }
                this.error = false;
                this.errorMsg = [];
                return moment(date, 'YYYY-MM-DD').format(this.formatTag || 'DD/MM/YYYY');
            },
            parseDate (date) {
                if (!date || date === 'Invalid date') {
                    this.errorMsg.push(this.mixinGui.requiredError);
                    this.error = true;
                    return null;
                }
                if (isNaN(moment(date, this.formatTag))) {
                    this.errorMsg.push(this.gui.badDateError);
                    this.error = true;
                    this.fieldData = null;
                    return null;
                }

                console.log(`Parse Date2!!! Date is "${moment(date, this.formatTag || 'DD/MM/YYYY').format('DD-MM-YYYY')}" ${this.formatTag}`);
                return moment(date, this.formatTag || 'DD/MM/YYYY').format('YYYY-MM-DD');
            },
            onFocus () {
                this.error = false;
                this.errorMsg = [];
            }
        }
    };
</script>

<style lang="stylus">
</style>
