<template>
    <v-layout wrap class="widget-field">
        <v-flex xs12 sm12 md12 class="widget-field__label">
            {{fieldName}}{{(requiredTag && editable && !readonlyTag) ? '*' : ''}}
        </v-flex>
        <div v-if="documentation.length > 0" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description" v-if="!editable && inDescription">
                <span v-html="inDescription"></span>
            </v-flex>
            <v-flex xs12 sm12 md12 class="widget-field__description" v-else-if="outDescription">
                <span v-html="outDescription"></span>
            </v-flex>
        </div>
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-text-field
                    v-if="!editable || readonlyTag"
                    name="text-field"
                    :mask="maskTag"
                    v-model="fieldData"
                    readonly
            ></v-text-field>
            <template v-else>
                <v-radio-group
                        v-if="!selectTag"
                        v-model="fieldData"
                        @focus="onFocus"
                        @blur="validate"
                        :error="error"
                        mandatory
                        :error-messages="errorMsg"
                        :class="{'widget-field__error' : isError}"
                >
                    <v-radio
                            v-for="value in valuesTag"
                            :key="value"
                            :label="value"
                            :value="value"
                            :disabled="!editable || readonlyTag"
                    ></v-radio>
                </v-radio-group>
                <v-select
                        v-else
                        v-model="fieldData"
                        :items="valuesTag"
                        @focus="onFocus"
                        @blur="validate"
                        :error="error"
                        mandatory
                        :error-messages="errorMsg"
                ></v-select>
            </template>
        </v-flex>
    </v-layout>


</template>

<script>
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    export default {
        name: 'widget-radio-field',
        mixins: [WidgetFieldMixin],
        data () {
            return {
            };
        },
        created () {
           if (!this.fieldData) {
               this.fieldData = this.valuesTag[0];
           }
        },
        computed: {
            isError () {
                return !this.editable && this.isEmpty;
            },
            selectTag () {
                return Boolean(this.tags.select);
            }
        }
    };
</script>

<style lang="stylus">


</style>
