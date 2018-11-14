import _ from 'lodash';

const prepare = (data) => {
    if (data === 'null') return null;
    if (data === 'undefined') return undefined;
    return data;
};

export default {
   data () {
       return {
           mixinGui: (process.env.gui && process.env.gui.widgetField) || {},
           error: false,
           errorMsg: [],
           fieldData: '',
           fieldArr: []
       };
   },
    props: {
        field: {
            type: Object,
            default: () => {}
        },
        editable: {
            required: false,
            type: Boolean,
            default: false
        },
        modelName: {
            required: false,
            type: String
        },
        inputData: {
            required: false,
            type: [String, Array, Boolean, Object, Number],
            default: undefined
        },
        allData: {
            required: false,
            type: Object,
            default: () => ({})
        }
    },
    created () {
       this.fieldData = prepare(this.inputData) ? prepare(this.inputData) : prepare(this.field.defaultValue);
    },
    computed: {
        fieldName () {
            return this.field.customName || this.field.name;
        },
        isEmpty () {
            return !this.fieldData;
        },
        isCollection () {
            return Number(this.field.maxInstances) !== 1;
        },
        tags () {
            return (this.field && this.field.tags) || {};
        },
        valuesTag () {
            return this.tags.values ? this.tags.values.split(',') : [];
        },
        isActionTag () {
            return Boolean(this.tags.action);
        },
        isListFieldTag () {
            return Boolean(this.tags.isListField);
        },
        noVerifyTag () {
            return Boolean(this.tags.noVerify);
        },
        readonlyTag () {
            return Boolean(this.tags.readonly);
        },
        requiredTag () {
            return Boolean(this.tags.required);
        },
        maskTag () {
            return this.tags.mask;
        },
        maxLengthTag () {
            return isNaN(Number(this.tags.maxLength)) ? undefined : Number(this.tags.maxLength);
        },
        minLengthTag () {
            return isNaN(Number(this.tags.minLength)) ? undefined : Number(this.tags.minLength);
        },
        formatTag () {
            return this.tags.format;
        },
        regexpTag () {
            return this.tags.regexp || '';
        },
        documentation () {
            return this.field.documentation || [];
        },
        inDescription () {
            return this.documentation[0];
        },
        outDescription () {
            if (this.documentation.length > 1) {
                return this.documentation[1];
            }
            return this.documentation[0];
        }
    },
    watch: {

        fieldData (val) {
            console.log(`[fieldData] Updated field ${this.field.name} with val = ${val} (type = ${typeof val})`);
            this.$emit('update:inputData', val);
        },
        inputData (val) {
            console.log(`[inputData] Updated with val = ${val}`);
            if (typeof this.fieldData === 'boolean') {
                this.fieldData = val;
            } else {
                this.fieldData = prepare(val) ? prepare(val) : prepare(this.field.defaultValue);
            }
        }
    },
    methods: {
        onFocus () {
            this.error = false;
            this.errorMsg = [];
        },
        validate () {
            this.error = false;
            this.errorMsg = [];
            if (this.requiredTag) {
                if (this.isEmpty) {
                    console.log('[WidgetFieldMixin] Field is empty');
                    this.errorMsg.push(this.mixinGui.requiredError);
                    this.error = true;
                }
            }
            if (!this.isEmpty) {
                if (this.minLengthTag && this.fieldData.length < this.minLengthTag) {
                    console.log('[WidgetFieldMixin] Field length is too short');
                    this.errorMsg.push(this.mixinGui.minLengthError.replace('###', this.minLengthTag));
                    this.error = true;
                }

                if (this.maxLengthTag && this.fieldData.length > this.maxLengthTag) {
                    console.log('[WidgetFieldMixin] Field length is too long');
                    this.errorMsg.push(this.mixinGui.maxLengthError.replace('###', this.maxLengthTag));
                    this.error = true;
                }

                if (this.regexpTag) {
                    console.log('[WidgetFieldMixin] testing regexp');
                    const regexp = new RegExp(this.regexpTag);
                    if (!regexp.test(this.fieldData)) {
                        console.log('[WidgetFieldMixin] regexp failed');
                        this.errorMsg.push(this.mixinGui.regexpError);
                        this.error = true;
                    }
                }
            }
            return this.error;
        },
        getData () {
            let data = this.fieldData;
            if (this.fieldData && typeof this.fieldData === 'object') {
                data = _.get(this.fieldData, 'entityInstancePk.entityInstanceId');
            }
            return {
                name: this.field.name,
                value: this.isCollection ? (this.fieldData ? [data] : []) : data,
                type: this.field.type
            };
        }
    }
};
