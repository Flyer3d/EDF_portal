<template>
    <v-layout class="form__field-wrapper">
        <v-flex>
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>
            <v-text-field
                    v-if="!isEditable"
                    name="text-field"
                    v-model="fieldData"
                    readonly
                    single-line
                    hide-details
                    :solo="dark"
                    :box="!dark"
                    :prefix="prefix"
                    :suffix="suffix"
            ></v-text-field>
            <template v-else>
                <v-select
                        v-if="selectTag"
                        v-model="fieldData"
                        :items="valuesTag"
                        @focus="onFocus"
                        @blur="validate"
                        :disabled="disabled"
                        :error="error"
                        :mandatory="isMandatory"
                        single-line
                        hide-details
                        :error-messages="errorMsg"
                        :solo="dark"
                        :box="!dark"
                        :prefix="prefix"
                        :suffix="suffix"
                ></v-select>
                <v-stepper alt-labels :value="fieldData" class="flat" v-else-if="stepper">
                    <v-stepper-header v-if="valuesTag || valuesTag.length > 0">
                        <template v-for="(value, i) in valuesTag">
                            <v-stepper-step
                                    step=""
                                    :complete="fieldDataToStep >= i"
                                    @click.native="fieldData = value"
                                    :key="`step-${i}`"
                            >{{value}}
                            </v-stepper-step>
                            <v-divider v-if="i < valuesTag.length - 1" :key="`divider-${i}`"></v-divider>
                        </template>
                    </v-stepper-header>
                </v-stepper>
                <v-radio-group
                        v-else
                        :row="inline"
                        v-model="fieldData"
                        @focus="onFocus"
                        @blur="validate"
                        :error="error"
                        :mandatory="isMandatory"
                        single-line
                        hide-details
                        :error-messages="errorMsg"
                        :solo="dark"
                        :box="!dark"
                >
                    <v-radio
                            v-for="value in valuesTag"
                            :key="value"
                            :label="value"
                            :value="value"
                    ></v-radio>
                </v-radio-group>
            </template>
        </v-flex>
    </v-layout>
</template>

<script>
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';
    import _ from 'lodash';

    export default {
        name: 'widget-radio-field',
        mixins: [BlockFieldMixin],
        props: {
            stepper: {
                type: Boolean
            },
            inline: {
                type: Boolean
            },
        },
        data () {
            return {};
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
            },
            fieldDataToStep () {
                return _.indexOf(this.valuesTag, this.fieldData);
            }
        }
    };
</script>

<style lang="stylus">
    .form__field-wrapper
        .v-stepper--alt-labels .v-stepper__step
            flex-basis 150px

        .v-stepper__step
            padding 24px 12px

        .v-stepper--alt-labels .v-stepper__header .v-divider
            margin-left -50px
            margin-right -50px
</style>
