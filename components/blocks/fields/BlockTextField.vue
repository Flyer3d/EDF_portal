<template>
    <v-layout class="form__field-wrapper">
        <v-flex>
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>
            <v-text-field
                    class="form__field"
                    name="text-field"
                    :readonly="!isEditable"
                    :placeholder="placeholder"
                    @focus="onFocus"
                    @blur="validate"
                    :error="error"
                    :disabled="disabled"
                    :prefix="prefix"
                    :suffix="suffix"
                    :error-messages="errorMsg"
                    :mask="maskTag"
                    v-model="fieldData"
                    single-line
                    hide-details
                    box
                    :dark="dark"
            ></v-text-field>
        </v-flex>
    </v-layout>
</template>

<script>
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';

    export default {
        name: 'block-text-field',
        mixins: [BlockFieldMixin],
        data () {
            return {
                showMenu: false,
                loading: false,
                items: [],
                itemsSearch: null
            };
        },
        computed: {
            isError () {
                return !this.editable && this.isEmpty;
            },
            fieldText () {
                if (this.fieldData && typeof this.fieldData === 'object') {
                    return this.fieldData.entityDesc;
                }
                return this.fieldData;
            }
        }
    };
</script>

<style lang="stylus">

    .widget-field
        .widget-field
            &__select .menu__content
                top 36px !important

</style>
