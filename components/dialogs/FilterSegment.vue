<template>
    <v-layout>
        <v-flex md1 sm1 xs1 v-if="count > 1">
            <v-select
                    :items="prefixes"
                    v-model="prefix"
                    :label="gui.segment.prefixLabel"
                    single-line
            ></v-select>
        </v-flex>
        <v-flex md5 sm5 xs5 v-if="count > 1">
            <v-select
                    :items="fieldsList"
                    v-model="fieldName"
                    :label="gui.segment.fieldNameLabel"

            ></v-select>
        </v-flex>
        <v-flex md6 sm6 xs6 v-else>
            <v-select
                    :items="fieldsList"
                    v-model="fieldName"
                    :label="gui.segment.fieldNameLabel"

            ></v-select>
        </v-flex>
        <v-flex md2 sm2 xs2>
            <v-select
                    :disabled="!fieldName"
                    :items="operators"
                    v-model="operator"
                    :label="gui.segment.fieldOperatorLabel"

            ></v-select>
        </v-flex>
        <v-flex md4 sm4 xs4>
            <v-text-field
                    :disabled="!operator || operator === 'IS NULL' || operator === 'IS NOT NULL'"
                    name="fiemdValue"
                    :label="gui.segment.fieldValueLabel"
                    v-model="fieldValue"
            ></v-text-field>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'filter-segment',
        props: {
            fields: {
                type: Array,
                default: () => []
            },
            count: {
                type: Number,
                default: 1
            },
            rawSegment: {
                type: Object,
                default: () => {}
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.filterQueryDlg) || {},
                prefixes: ['AND ', 'OR '],
                prefix: this.rawSegment.prefix || 'AND ',
                operators: ['', '=', '<>', '!=', '>', '>=', '!>', '<', '<=', '!<', 'IS NULL', 'IS NOT NULL'],
                fieldName: this.rawSegment.fieldName || '',
                operator: this.rawSegment.operator || '',
                fieldValue: this.rawSegment.fieldValue || ''
            };
        },
        computed: {
            fieldsList () {
                return [''].concat(this.fields && this.fields.map(item => item.name));
            }
        },
        watch: {
           rawSegment (value) {
               if (value && value.fieldName) {
                   this.prefix = value.prefix;
                   this.fieldName = value.fieldName;
                   this.operator = value.operator;
                   this.fieldValue = value.fieldValue;
               }
           }
        },
        methods: {
            getQuerySegment () {
                let str = '';
                if (this.fieldName && this.operator) {
                    if (this.operator === 'IS NOT NULL' || this.operator === 'IS NULL') {
                        str = `${(this.count > 1) ? this.prefix : ''}[${this.fieldName}] ${this.operator}`;
                    } else if (this.fieldValue) {
                        str = `${(this.count > 1) ? this.prefix : ''}[${this.fieldName}] ${this.operator} '${this.fieldValue}'`;
                    }
                }
                return {
                    raw: {
                        prefix: this.prefix.slice(),
                        fieldName: this.fieldName.slice(),
                        operator: this.operator.slice(),
                        fieldValue: this.fieldValue.slice()
                    },
                    str
                };
            }
        }
    };
</script>

<style scoped>

</style>
