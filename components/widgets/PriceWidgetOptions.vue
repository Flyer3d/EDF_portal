<template>
    <v-card>
        <v-card-title center class="headline" ref="title">
            <v-spacer></v-spacer>
            <div>Contacts form options</div>
            <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>
            <v-text-field
                    label="Title"
                    placeholder=""
                    v-model="dataOptions.title"
                    ref="title"
            ></v-text-field>
            <widget-html-field
                    ref="footer"
                    :widgetId="id"
                    :editable="true"
                    :inputData="dataOptions.footer"
            />
        </v-card-text>
    </v-card>
</template>

<script>
    import WidgetHtmlField from '~/components/widgets/fields/WidgetHtmlField';
    import _ from 'lodash';

    export default {
        name: 'contacts-widget-options',
        components: {
            WidgetHtmlField
        },
        props: {
            options: {
                type: Object,
                required: true
            },
            id: {
                required: true,
                type: String
            },
            model: {
                required: true,
                type: Object
            },
            widgetName: {
                required: true,
                type: String
            },
            acceptedList: {
                type: Array,
                required: true
            }
        },
        data () {
            return {
                dataOptions: Object.assign({
                    title: '',
                    footer: ''
                }, this.options)
            };
        },
        mounted () {
            console.log('[PriceWidgetOptions] mounted');
        },
        watch: {
            options () {
                this.dataOptions = Object.assign({
                    title: '',
                    footer: ''
                }, this.options);
            }
        },
        methods: {
            getOptions () {
                const footer = this.$refs.footer.getData();
                this.dataOptions.footer = footer.value && footer.value[0];
                // return Object.assign({}, this.dataOptions);
                return _.cloneDeep(this.dataOptions);
            }
        }
    };
</script>

<style scoped>

</style>
