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
            <v-text-field
                    name="text-field"
                    v-model="dateToText"
                    :readonly="true"
            ></v-text-field>
        </v-flex>
    </v-layout>
    <v-layout wrap class="widget-field" v-else>
        <v-flex xs12 sm12 md12 class="widget-field__label">
            {{fieldName}}{{(requiredTag && !readonlyTag) ? '*' : ''}}
        </v-flex>
        <div v-if="outDescription" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description">
                <span v-html="outDescription"></span>
            </v-flex>
        </div>
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-menu
                    :attach="DOMElem"
                    ref="menu"
                    @focus="onFocus"
                    lazy
                    :close-on-content-click="false"
                    v-model="menu"
                    :disabled="readonlyTag"
                    transition="scale-transition"
                    offset-y
                    full-width
                    :nudge-right="40"
                    max-width="290px"
                    min-width="290px"
                    :return-value.sync="date"
            >
                <v-text-field
                        slot="activator"
                        :label="gui.label"
                        v-model="dateFormatted"
                        :error="error"
                        readonly
                        :mask="maskTag"
                        return-masked-value
                        :error-messages="errorMsg"
                        prepend-icon="event"
                        @focus="onFocus"
                        @keydown.enter.native="date = parseDate(fieldData)"

                ></v-text-field>
                <v-date-picker

                        :readonly="readonlyTag"
                        :first-day-of-week="1"
                        v-model="date"
                        @input="dateFormatted = formatDate($event)"
                        @keydown.enter.native="menu = false"
                        no-title
                        scrollable
                        locale="ru"
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
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    export default {
        name: 'widget-date-field',
        mixins: [WidgetFieldMixin],
        data () {
            return {
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
                }
            }
        },
        computed: {
            computedDateFormatted () {
                return this.formatDate(this.date);
            },
            dateToText () {
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

                return moment(date, this.formatTag || 'DD/MM/YYYY').format('YYYY-MM-DD');
            },
            onFocus () {
                this.error = false;
                this.errorMsg = [];
            }
        }
    };
</script>
