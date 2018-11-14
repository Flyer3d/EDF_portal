<template>
    <v-layout wrap class="widget-field" :class="{'widget-field_action': (isActionTag && (!editable || readonlyTag))}"
              :tag="isActionTag ? 'nav' : 'div'">
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-btn
                    v-if="isActionTag && editable"
                    @click.native="emitAction"
                    block
            >
                {{fieldName}}
            </v-btn>
            <v-checkbox
                    v-else
                    :label="field.name"
                    :required="requiredTag && !readonlyTag"
                    :error="error"
                    @focus="onFocus"
                    name="text-field"
                    v-model="fieldData"
                    :disabled="!editable || readonlyTag"
            ></v-checkbox>
        </v-flex>
        <div v-if="field.documentation && field.documentation.length > 0" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description" v-if="!editable && inDescription">
                <span v-html="inDescription"></span>
            </v-flex>
            <v-flex xs12 sm12 md12 class="widget-field__description" v-else-if="outDescription">
                <span v-html="outDescription"></span>
            </v-flex>
        </div>
    </v-layout>
</template>

<script>
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    export default {
        name: 'widget-checkbox-field',
        mixins: [WidgetFieldMixin],
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
