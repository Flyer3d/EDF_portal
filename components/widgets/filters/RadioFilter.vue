<template>
    <v-card class="filter">
        <v-card-title class="filter__title">
            {{title}}
        </v-card-title>
        <v-card-text class="filter__body">
            <v-checkbox
                    v-for="value in valuesTag"
                    v-model="filterDataArr"
                    :label="value"
                    :value="value"
                    :key="value"
            ></v-checkbox>
        </v-card-text>
    </v-card>
</template>

<script>
    import FilterFieldMixin from '~/mixins/FilterFieldMixin';

    export default {
        name: 'checkbox-input-filter',
        mixins: [FilterFieldMixin],
        methods: {
            getFilter () {
                if (this.filterDataArr && this.filterDataArr.length > 0) {
                    return this.filterDataArr.map(item => `[${this.fieldName}] = '${item}'`).join(' OR ');
                }
                return '';
            }
        }

    };
</script>

<style lang="stylus">
    @require './FilterField.styl'

</style>
