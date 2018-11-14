export default {
   data: () => ({
       mixinGui: (process.env.gui && process.env.gui.filterField) || {},
       filterData: null,
       filterDataArr: []
   }),
    props: {
        options: {
            type: Object,
            default: () => {}
        }
    },
    computed: {
        field () {
            return this.options.field || {};
        },
        fieldName () {
            return this.field.name || '';
        },
        title () {
            return this.options.title || '';
        },
        tags () {
            return (this.field && this.field.tags) || {};
        },
        valuesTag () {
            return this.tags.values ? this.tags.values.split(',') : [];
        }
    },
    watch: {
    },
    methods: {
       getFilter () {
           if (this.filterData) {
               if (Array.isArray(this.filterData)) {
                   return this.filterData.map(data => `[${this.fieldName}] = '%${data}%'`).join(' OR ');
               }
               return `[${this.fieldName}] = '%${this.filterData}%'`;
           }
           return '';
       }
    }
};
