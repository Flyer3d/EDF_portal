<template>
    <v-layout class="form__field-wrapper">
        <v-flex>
            <div v-if="!noLabel" class="form__label text-xs-left mb-2"
                 :class="{required: isRequired, dark: dark, disabled: disabled}">
                {{fieldLabel}}
            </div>

            <template v-if="!isEditable">
                <v-layout>
                    <v-icon color="primary" class="mr-2">language</v-icon>
                    <a :href="href" alt="fieldData" target="_blank">{{fieldData}}</a>
                </v-layout>
            </template>
            <v-text-field
                    v-else
                    name="text-field"
                    @focus="onFocus"
                    @blur="validate"
                    :error="error"
                    :disabled="disabled"
                    :error-messages="errorMsg"
                    :mask="maskTag"
                    v-model="fieldData"
                    prepend-icon="language"
                    :placeholder="placeholder"
                    single-line
                    hide-details
                    :solo="dark"
                    :box="!dark"
            ></v-text-field>
        </v-flex>
    </v-layout>


</template>

<script>
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';

    export default {
        name: 'widget-link-field',
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
            href () {
                if (this.inputData && typeof this.inputData === 'string') {
                   if (this.inputData.indexOf('http') !== -1) {
                       return this.inputData;
                   }
                   return `http://${this.inputData}`;
                }
                return '';
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
