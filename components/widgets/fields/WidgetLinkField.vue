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

            <template v-if="!editable || readonlyTag">
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
                    :error-messages="errorMsg"
                    :mask="maskTag"
                    v-model="fieldData"
                    prepend-icon="language"
                    :class="{'widget-field__error' : isError}"
            ></v-text-field>
        </v-flex>
    </v-layout>


</template>

<script>
    import axios from 'axios';
    import WidgetFieldMixin from '~/mixins/WidgetFieldMixin';

    export default {
        name: 'widget-link-field',
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
            href () {
                if (this.inputData && typeof this.inputData === 'string') {
                   if (this.inputData.indexOf('http') !== -1) {
                       return this.inputData;
                   }
                   return `http://${this.inputData}`;
                }
                return '';
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
