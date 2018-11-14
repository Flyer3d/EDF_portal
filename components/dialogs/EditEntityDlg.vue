<template>
    <v-card>
        <v-toolbar :color="'primary'" :height="48">
            <v-spacer></v-spacer>
            <v-toolbar-title class="widget__title">{{gui.title.replace('###', modelName)}}</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
            <template v-for="field in itemFields">
                <component
                        ref="field"
                        :modelName="modelName"
                        :is="field.fieldType"
                        :field="field"
                        :editable=true
                        :inputData.sync="segmentData[field.name]"
                        :allData="segmentData"
                        :key="field.name"
                ></component>
            </template>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="blue darken-1" flat @click.stop="saveEntity">{{button.save}}</v-btn>
            <v-btn flat @click.native="closeDialog">{{button.close}}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import WidgetFieldMixin from '~/mixins/common/WidgetFieldMixin';

    const minColumnWidth = process.env.minColumnWidth;

    export default {
        name: 'edit-entity-dlg',
        props: {
            modelName: {
                required: true,
                type: String
            },
            fields: {
                required: true,
                type: Array
            },
            item: {
                required: true,
                type: Object
            },
            widgetId: {
                required: true,
                type: String
            },
            instanceId: {
                required: true,
                type: Number
            }
        },
        data () {
            return {
                gui: (process.env.gui && process.env.gui.editEntityDlg) || {},
                button: (process.env.gui && process.env.gui.button) || {},
                basis: '100%',
                widgetWidth: 0,
                segmentData: {}

            };
        },
        mounted () {
            this.onResize();
        },
        watch: {
            item (val) {
                this.segmentData = Object.assign({}, val.object);
                this.onResize();
            }
        },
        computed: {
            itemFields () {
                return this.fields && this.fields.filter(item => item.type !== 'HIDDEN').sort((a, b) => a.order - b.order).map((item) => {
                    item.fieldType = this.getFieldType(item.type);
                    return item;
                });
            }
        },
        methods: {
            saveEntity () {
                this.$emit('save', this.getData());
            },
            closeDialog () {
                this.$emit('close');
            },
            getFieldData (fieldName) {
                if (!this.item.object) {
                    return;
                }
                return String(this.item.object[fieldName]);
            },
            getData () {
                return {
                    fields: this.$refs.field.map(item => item.getData()),
                    modelName: this.modelName,
                    instanceId: this.instanceId
                };
            },
            onResize () {
                const divider = Math.floor(this.$el.clientWidth / minColumnWidth);
                if (divider) {
                    this.basis = `${100 / divider}%`;
                }
            },
            fieldStyle (field) {
                const type = field.fieldType;
                if (type === 'widget-text-area-field' || type === 'widget-html-field' ||
                    (type === 'widget-checkbox-field' && field.tags && field.tags.action)) {
                    return {
                        'flex-basis': '100%',
                        'max-width': '100%'
                    };
                } else {
                    return {
                        'flex-basis': this.basis,
                        'max-width': this.basis
                    };
                }
            }
        }
    };
</script>

<style scoped>

</style>
