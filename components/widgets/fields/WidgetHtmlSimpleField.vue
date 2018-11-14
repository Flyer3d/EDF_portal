<template>
    <v-layout wrap class="widget-field" v-if="!editable">
        <v-flex xs12 sm12 md12 class="widget-field__field html-content" v-html="fieldData">

        </v-flex>
    </v-layout>
    <v-layout wrap class="widget-field" v-else>
        <v-flex xs12 sm12 md12 class="widget-field__label">
            {{fieldName}}
        </v-flex>
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-text-field
                    name="text-area-field"
                    v-model="fieldData"
                    textarea
            ></v-text-field>
        </v-flex>
        <div v-if="outDescription" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description">
                <span v-html="outDescription"></span>
            </v-flex>
        </div>
    </v-layout>

</template>

<script>
    export default {
        name: 'widget-html-simple-field',
        props: {
            field: {
               type: Object
            },
            editable: {
                required: false,
                type: Boolean,
                default: false
            },
            inputData: {
                required: false,
                type: String,
                default: undefined
            }
        },
        data () {
            return {
                fieldData: this.inputData || (this.field && this.field.defaultValue)
            };
        },
        watch: {
            inputData (value) {
                this.fieldData = value;
            }
        },
        mounted () {
        },
        computed: {
            tags () {
                return (this.field && this.field.tags) || {};
            },
            outDescription () {
                if (this.field.documentation && this.field.documentation.length > 0) {
                    if (this.field.documentation.length === 1) {
                        return this.field.documentation[0];
                    }
                    return this.field.documentation[1];
                }
                return undefined;
            },
            inDescription () {
                if (this.field.documentation && this.field.documentation.length > 0) {
                    return this.field.documentation[0];
                }
                return undefined;
            }
        },

        methods: {
            onFocus () {
                this.error = false;
            },
            validate () {
                if (this.tags.required) {
                    return (this.error = Boolean(this.fieldData));
                }
                return true;
            },
            getData () {
                return {
                    name: this.field.name,
                    value: (Number(this.field.maxInstances) === 1) ? this.fieldData : [this.fieldData],
                    type: this.field.type
                };
            }
        }
    };
</script>

<style lang="stylus">

</style>
