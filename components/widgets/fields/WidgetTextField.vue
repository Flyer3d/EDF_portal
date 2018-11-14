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
            <v-autocomplete
                    :attach="true"
                    v-if="isListFieldTag && editable"
                    clearable
                    open-on-clear
                    :error="error"
                    :error-messages="errorMsg"
                    :loading="loading"
                    :items="items"
                    :search-input.sync="itemsSearch"
                    v-model="fieldData"
                    class="widget-field__select"
                    @input="validate"
                    @blur="validate"
            ></v-autocomplete>
            <template v-else>
                <v-text-field
                        v-if="!editable || readonlyTag"
                        name="text-field"
                        readonly
                        :ripple="false"
                        :mask="maskTag"
                        v-model="fieldText"
                        :class="{'widget-field__error' : isError}"
                ></v-text-field>
                <v-text-field
                        v-else
                        name="text-field"
                        @focus="onFocus"
                        @blur="validate"
                        :error="error"
                        :error-messages="errorMsg"
                        :mask="maskTag"
                        v-model="fieldData"
                ></v-text-field>
            </template>
        </v-flex>
    </v-layout>
</template>

<script>
    import axios from 'axios';
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    export default {
        name: 'widget-text-field',
        mixins: [WidgetFieldMixin],
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
        },
        watch: {
            itemsSearch (val) {
                if (val !== null) {
                    this.suggest(val);
                }
            }
        },
        mounted () {
        },
        methods: {
            async suggest (val) {
                const url = `${this.$store.getters['getApiBase']}/widget/suggest`;
                this.loading = true;
                try {
                    console.log(`[widgetTextField] Searching with q = "${val}"`);
                    const res = await axios.get(url, {params: {
                            q: val,
                            model: this.modelName,
                            field: this.field.name
                        }});
                    this.loading = false;
                    this.items = val ? [val].concat(res.data) : res.data;
                    console.log(`[widgetTextField] List loaded!!!`);
                    console.dir(res.data);
                } catch (e) {
                    console.error('[widgetTextField] Error getting field list!');
                    console.dir(e);
                    this.loading = false;
                }
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
