<template>
    <v-checkbox
            :label="fieldLabel"
            :required="!isEditable"
            :error="error"
            @focus="onFocus"
            name="text-field"
            v-model="fieldData"
            :disabled="!editable || readonlyTag || disabled"
    ></v-checkbox>
</template>

<script>
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';

    export default {
        name: 'block-checkbox-field',
        mixins: [BlockFieldMixin],
        mounted () {
            if (typeof (this.fieldData) !== 'boolean') {
                this.fieldData = this.fieldData === 'True';
            }
        },
        methods: {
            emitAction () {
                this.fieldData = true;
                this.$emit('submit', this.noVerifyTag);
            },
            getData () {
                return {
                    name: this.field.name,
                    value: this.fieldData ? 'True' : 'False',
                    type: this.field.type
                };
            }
        }
    };
</script>

<style lang="stylus">


</style>
