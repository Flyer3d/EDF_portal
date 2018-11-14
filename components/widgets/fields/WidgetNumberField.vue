<template>
    <v-layout wrap class="widget-field">
        <v-flex xs12 sm12 md12 class="widget-field__label">
            {{fieldName}}{{(requiredTag && editable && !readonlyTag) ? '*' : ''}}
        </v-flex>
        <div v-if="field.documentation && field.documentation.length > 0" class="widget-field__documentation">
            <v-flex xs12 sm12 md12 class="widget-field__description" v-if="!editable && inDescription">
                <span v-html="inDescription"></span>
            </v-flex>
            <v-flex xs12 sm12 md12 class="widget-field__description" v-else-if="outDescription">
                <span v-html="outDescription"></span>
            </v-flex>
        </div>
        <v-flex xs12 sm12 md12 class="widget-field__field">
            <v-text-field
                    name="text-area-field"
                    v-model="fieldData"
                    @focus="onFocus"
                    :error="error"
                    :readonly="!editable || readonlyTag"
                    type="number"
            ></v-text-field>
        </v-flex>
    </v-layout>
</template>

<script>
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    export default {
        name: 'widget-number-field',
        mixins: [WidgetFieldMixin]
    };
</script>

<style lang="stylus">

</style>
