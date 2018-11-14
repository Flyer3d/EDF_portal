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
        label: {
            type: String
        },
        required: {
            type: Boolean
        },
        disabled: {
            type: Boolean
        },
        placeholder: {
            type: String
        },
        dark: {
            type: Boolean
        },
        mandatory: {
            type: Boolean
        },
        noLabel: {
            type: Boolean
        },
        prefix: {
            type: String
        },
        suffix: {
            type: String
        },
        tooltip: {
            type: String
        },
        editable: {
            required: false,
            type: Boolean,
            default: true
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
       console.log(`Creating field ${this.label}`);
       console.dir(this.field);
       this.fieldData = prepare(this.inputData) ? prepare(this.inputData) : prepare(this.field.defaultValue);
    },
    computed: {
        fieldLabel () {
            return this.label || this.fieldName;
        },
        isRequired () {
            return Boolean(this.required) || this.requiredTag;
        },
        isEditable () {
            return Boolean(this.editable) && !this.readonlyTag && !this.disabled;
        },
        isMandatory () {
            return Boolean(this.mandatory) || this.mandatoryTag;
        },
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
        mandatoryTag () {
            return Boolean(this.tags.mandatory);
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
        }
    },
    watch: {

        fieldData (val) {
            this.$emit('update:inputData', val);
        },
        inputData (val) {
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
            if (this.requiredTag || this.required) {
                if (this.isEmpty) {
                    console.log('[BlockFieldMixin] Field is empty');
                    this.errorMsg.push(this.mixinGui.requiredError);
                    this.error = true;
                }
            }
            if (!this.isEmpty) {
                if (this.minLengthTag && this.fieldData.length < this.minLengthTag) {
                    console.log('[BlockFieldMixin] Field length is too short');
                    this.errorMsg.push(this.mixinGui.minLengthError.replace('###', this.minLengthTag));
                    this.error = true;
                }

                if (this.maxLengthTag && this.fieldData.length > this.maxLengthTag) {
                    console.log('[BlockFieldMixin] Field length is too long');
                    this.errorMsg.push(this.mixinGui.maxLengthError.replace('###', this.maxLengthTag));
                    this.error = true;
                }

                if (this.regexpTag) {
                    console.log('[BlockFieldMixin] testing regexp');
                    const regexp = new RegExp(this.regexpTag);
                    if (!regexp.test(this.fieldData)) {
                        console.log('[BlockFieldMixin] regexp failed');
                        this.errorMsg.push(this.mixinGui.regexpError);
                        this.error = true;
                    }
                }
            }
            return this.error;
        },
        getData () {
            let data;
            if (!this.disabled) {
                if (this.fieldData && typeof this.fieldData === 'object') {
                    data = _.get(this.fieldData, 'entityInstancePk.entityInstanceId');
                } else {
                    data = this.fieldData;
                }
            }
            return {
                name: this.field.name,
                value: this.isCollection ? (this.fieldData ? [data] : []) : data,
                type: this.field.type
            };
        }
    }
};
