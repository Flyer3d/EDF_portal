<template>
    <v-layout class="form__field-wrapper">
        <v-flex>
        <div v-if="!noLabel" class="form__label text-xs-left mb-2" :class="{required: isRequired, dark: dark, disabled: disabled}">
            {{fieldLabel}}
            <v-tooltip v-if="tooltip" top class="mr-1">
                <v-icon
                    slot="activator"
                    color="primary"
                    size="15"
                >help_outline</v-icon>
                <span>{{ tooltip }}</span>
            </v-tooltip>
        </div>
            <v-text-field
                    class="form__field"
                    name="text-field"
                    v-model="fieldData"
                    @focus="onFocus"
                    @blur="validate"
                    :error="error"
                    :disabled="disabled"
                    :mask="maskTag"
                    :readonly="!isEditable"
                    type="number"
                    single-line
                    hide-details
                    :prefix="prefix"
                    :suffix="suffix"
                    :solo="dark"
                    :box="!dark"
            ></v-text-field>
        </v-flex>
    </v-layout>
</template>

<script>
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';

    export default {
        name: 'widget-number-field',
        mixins: [BlockFieldMixin]
    };
</script>

<style lang="stylus">

</style>
