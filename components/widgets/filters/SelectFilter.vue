<template>
    <v-card class="filter">
        <v-card-title class="filter__title">
            {{title}}
        </v-card-title>
        <v-card-text class="filter__body">
            <v-select
                    :attach="true"
                    clearable
                    open-on-clear
                    :loading="loading"
                    :items="items"
                    multiple
                    v-model="filterData"
            ></v-select>
        </v-card-text>
    </v-card>
</template>

<script>
    import FilterFieldMixin from '~/mixins/FilterFieldMixin';
    import axios from 'axios';

    export default {
        data: () => ({
            loading: false,
            items: [],
            itemsSearch: null
        }),
        name: 'select-filter',
        mixins: [FilterFieldMixin],
        created () {
            if (this.modelName) {
                this.suggest('');
            }
        },
        watch: {
            itemsSearch (val) {
                this.suggest(val);
            }
        },
        computed: {
            modelName () {
                return this.field.linkedEntityName || '';
            }
        },
        methods: {
            getFilter () {
                if (this.filterData && this.filterData.length > 0) {
                    return this.filterData.map(data => `[${this.fieldName}] = '${data}'`).join(' OR ');
                }
                return '';
            },
            async suggest (val) {
                const url = `${this.$store.getters['getApiBase']}/widget/suggest`;
                this.loading = true;
                try {
                    console.log(`[selectFilter] Searching with q = "${val}"`);
                    const res = await axios.get(url, {params: {
                            q: val,
                            model: this.modelName,
                            isDropdownLink: true
                        }});
                    this.loading = false;
                    this.items = res.data && res.data.map(item => {
                        if (typeof item === 'string') {
                            const splitItem = String(item).split('::');
                            console.log(`Splitting item ${item} to ${splitItem[0]} and ${splitItem[1]}`);
                            return {
                                text: splitItem[1] || splitItem[0],
                                value: splitItem[0]
                            };
                        } else if (typeof item === 'object') {
                            return {
                                text: item.entityDesc,
                                value: item.entityInstancePk.entityInstanceId
                            };
                        }
                    });
                    console.log(`[selectFilter] List loaded!!!`);
                    console.dir(res.data);
                } catch (e) {
                    console.error('[selectFilter] Error getting field list!');
                    console.dir(e);
                    this.loading = false;
                }
            }
        }

    };
</script>

<style lang="stylus">
    @require './FilterField.styl'

</style>
