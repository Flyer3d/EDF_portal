import BlockFieldsMixin from '~/mixins/common/BlockFieldMixin';
import axios from 'axios';
import _ from 'lodash';

export default {
    extends: BlockFieldsMixin,
    data: () => ({
        valid: true,
        loaded: false,
        fieldsSrc: [],
        error: false,

        // Заглушки для данных
        // Необходимо переопределить их в компоненте!
        modelName: '',
        processName: '',
        formData: {}
    }),

    computed: {
       fields () {
           const fields = {};
           this.fieldsSrc.forEach(field => {
               field.fieldType = this.getFieldType(field.type);
               fields[field.name] = field;
           });
           return fields;
       }
    },
    methods: {
        async getModel () {
            const url = `${process.env.apiBase}/model/model`;
            const model = this.modelName;
            if (model) {
                try {
                    const response = await axios.get(url, {params: {model}});
                    console.log(`[getModel] Model ${model} loaded!`);
                    console.dir(response);
                    this.fieldsSrc = _.get(response, 'data.fields', []);
                    this.loaded = true;
                } catch (err) {
                    console.error(`[getModel] Error getting model ${model}! `);
                    console.dir(err);
                    this.error = true;
                }
            } else {
                console.error(`[getModel] model is empty!`);
            }
        },
        validate () {
            let error = false;
            console.log('[validate] Validating form');
            console.dir(this.$refs);
            for (let key in this.formData) {
                if (this.$refs[key]) {
                    const res = this.$refs[key].validate();
                    error = error || res;
                }
            }
            return error;
        },
        getFields () {
            console.log('[getFields] Getting fielsd...');
            const fields = [];
            for (let key in this.formData) {
                if (this.$refs[key]) {
                    fields.push(this.$refs[key].getData());
                }
            }
            console.log('[getFields] Sending fields');
            console.dir(fields);
            return fields;
        },
        getModelName () {
            return this.modelName;
        },
        getProcessName () {
            return this.processName;
        }

    }
};
