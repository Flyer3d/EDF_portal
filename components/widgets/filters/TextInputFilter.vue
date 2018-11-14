<template>
    <v-card class="filter">
        <v-card-title class="filter__title">
            {{title}}
        </v-card-title>
        <v-card-text class="filter__body">
            <v-text-field
                    v-model="filterData"
                    :placeholder="mixinGui.textInputPlaceholder"
                    clearable
            ></v-text-field>
        </v-card-text>
    </v-card>
</template>

<script>
    import FilterFieldMixin from '~/mixins/FilterFieldMixin';

    export default {
        name: 'text-input-filter',
        mixins: [FilterFieldMixin],
        methods: {
            getFilter () {
                if (this.filterData) {
                    return `[${this.fieldName}] = '%${this.filterData}%'`;
                }
                return '';
            }
        }

    };
</script>

<style lang="stylus">
    @require './FilterField.styl'

</style>
