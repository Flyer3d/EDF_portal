<template>
    <fieldset class="buttons-widget-options-segment">
        <legend>{{legend}}</legend>
        <p>{{label}}</p>
        <v-text-field
                :label="gui.titleLabel"
                v-model="dataOptions.title"
                :rules="[v => !!v || 'Обязательное поле!']"
                required
        ></v-text-field>
        <v-select
                v-bind:items="typeList"
                v-model="dataOptions.type"
                :label="gui.typeLabel"
                single-line
                bottom
        ></v-select>
        <template v-if="dataOptions.type === 'link'">
            <v-text-field
                    :label="gui.urlLabel"
                    v-model="dataOptions.url"
                    :rules="[v => !!v || 'Обязательное поле!']"
                    required
            ></v-text-field>
            <v-checkbox :label="gui.externalLinkLabel" v-model="dataOptions.isExternalUrl" light></v-checkbox>
        </template>
        <template v-else-if="dataOptions.type === 'process'">
            <v-select
                    :label="gui.processLabel"
                    v-model="process"
                    v-bind:items="processList"
                    single-line
                    return-object
                    required
                    bottom
            ></v-select>
            <v-checkbox :disabled="connectionType === 'noConnection'" :label="gui.paramsLabel"
                        v-model="dataOptions.usePk" light></v-checkbox>
        </template>

    </fieldset>

</template>

<script>
    import _ from 'lodash';

    export default {
        name: 'button-widget-options-segment',
        props: {
            id: {
                type: String,
                required: true
            },
            options: {
                type: Object,
                required: true
            },
            params: {
                type: Object
            },
            connectionType: {
                type: String
            },
            fields: {
                type: Array,
                default: () => []
            }
        },
        data () {
           return {
               gui: (process.env.gui && process.env.gui.buttonsWidgetOptionsSegment) || {},
               typeList: [
                   {text: process.env.gui && process.env.gui.buttonsWidgetOptionsSegment.typeList.link, value: 'link'},
                   {text: process.env.gui && process.env.gui.buttonsWidgetOptionsSegment.typeList.process, value: 'process'}
               ],
               process: null,
               dataOptions: Object.assign({
                   type: 'link',
                   title: process.env.gui.buttonsWidgetOptionsSegment.newButtonTitle,
                   processId: null,
                   processName: '',
                   usePk: false,
                   url: '',
                   isExternalUrl: false
               }, this.options)
           };
        },
        mounted () {
            this.getProcessList();
        },
        watch: {
            process (val) {
                console.log('[process] Process changed!');
                console.dir(val);
                if (val) {
                    this.dataOptions.processId = val.value;
                    this.dataOptions.processName = val.text;
                }
            },
            options (val) {
                this.dataOptions = Object.assign({
                    type: 'link',
                    title: this.gui.newButtonTitle,
                    processId: null,
                    processName: '',
                    usePk: false,
                    url: '',
                    isExternalUrl: false
                }, this.options);
                this.process = {
                    text: this.dataOptions.processName,
                    value: this.dataOptions.processId
                };
            },
            connectionType (val) {
                if (val === 'noConnection') {
                    this.dataOptions.usePk = false;
                }
            }
        },
        computed: {
            legend () {
                return `Кнопка "${this.dataOptions.title}"`;
            },
            processList () {
                const actionList = this.$store.getters[`${this.id}/getActionList`] || [];
                return actionList.map(item => {
                    return {text: _.get(item, 'object.name'), value: _.get(item, 'object.startEventPk')};
                });
            },
            label () {
                if (this.connectionType && this.connectionType !== 'noConnection') {
                    const fields = [].concat(_.keys(this.params),
                        ['__entityName', '__entityId'],
                        this.fields.map(item => item.name)).join(', ');
                    return `Доступные поля: ${fields}`;
                } else {
                    const fields = _.keys(this.params).join(', ');
                    return `Доступные поля: ${fields}`;
                }
            }
        },
        methods: {
            getData () {
                return Object.assign({}, this.dataOptions);
            },
            getProcessList () {
                console.log('[getProcessList] Getting process list!');
                this.$store.dispatch(`${this.id}/loadActionList`, {
                    pageNumber: 1,
                    pageSize: 99,
                    orderBy: '',
                    query: ''
                });
            }
        }
    };
</script>

<style lang="stylus">
    .buttons-widget-options-segment
        padding 16px 16px 32px 16px
        margin-bottom 20px
        border 1px solid #ccc
        legend
            padding 0 10px

</style>
