<template>
    <v-card class="filter">
        <v-card-title class="filter__title">
            <v-switch
                    v-model="filterData"
                    :label="title"
            ></v-switch>
        </v-card-title>
    </v-card>
</template>

<script>
    import FilterFieldMixin from '~/mixins/FilterFieldMixin';
    import axios from 'axios';

    export default {
        name: 'checkbox-input-filter',
        mixins: [FilterFieldMixin],
        methods: {
            getFilter() {
                if (this.filterData) {
                    return `[${this.fieldName}] = 'True'`;
                }
                return '';
            }
        }

    };
</script>

<style lang="stylus">
    @require './FilterField.styl'

</style>
