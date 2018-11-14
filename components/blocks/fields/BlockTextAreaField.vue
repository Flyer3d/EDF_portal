<template>
    <v-layout class="form__field-wrapper">
        <v-flex>
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>
            <v-textarea
                    class="form__field"
                    name="text-area-field"
                    v-model="fieldData"
                    @focus="onFocus"
                    @blur="validate"
                    :disabled="disabled"
                    :error="error"
                    :error-messages="errorMsg"
                    :readonly="!isEditable"
                    auto-grow
                    single-line
                    :placeholder="placeholder"
                    hide-details
                    :solo="dark"
                    :box="!dark"
            ></v-textarea>
        </v-flex>
    </v-layout>
</template>

<script>
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';

    export default {
        name: 'block-text-area-field',
        mixins: [BlockFieldMixin]
    };
</script>

<style lang="stylus">

</style>
