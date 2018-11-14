<template>
    <v-expansion-panel class="company-mini-list-card">
        <v-expansion-panel-content>
            <v-card
                    flat
                    fluid
                    slot="header"
            >
                <v-card-text>
                    <v-layout row justify-center align-center>
                        <v-flex style="flex: 0 0 60px;">
                            <v-avatar :size="40" class="avatar--outline mr-3">
                                <img :src="companyIcon" alt="avatar">
                            </v-avatar>
                        </v-flex>
                        <v-flex>
                            <h3>{{companyName}}</h3>
                            <small>{{companyType}}</small>
                        </v-flex>
                    </v-layout>
                </v-card-text>
            </v-card>
            <v-card>
                <v-card-text>
                    <v-layout row>
                        <v-flex>
                            <v-layout align-start justify-start>
                                <v-flex xs6 class="mr-3">
                                    <h4>
                                        <small>Contact Person</small>
                                    </h4>
                                    <h4>{{item['ФИО']}}</h4>
                                    <h4>
                                        <small>{{item['Должность']}}</small>
                                    </h4>
                                </v-flex>
                                <v-flex xs6>
                                    <a :href="`mailto:${item['Email']}`"><h4>{{item['Email']}}</h4></a>
                                    <a :href="`tel:${item['Телефон']}`"><h4>{{item['Телефон']}}</h4></a>
                                </v-flex>
                            </v-layout>
                        </v-flex>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script>
    import {mapGetters} from 'vuex';
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import _ from 'lodash';

    export default {
        name: 'project-mini-card',
        components: {},
        mixins: [ItemMixin],
        props: {
            canClose: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            defaultIndustryIcon: `${process.env.base}/img/site/default_industry_black.png`,
            defaultProfileIcon: `${process.env.base}/img/site/default_profile.png`
        }),
        computed: {
            ...mapGetters({
                storeIndustries: 'site/industryList'
            }),
            companyIcon () {
                const icon = _.get(this.item, '[\'Логотип\']');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return this.defaultProfileIcon;
            },
            companyName () {
                return _.get(this.item, '[\'Название\']');
            },
            companyType () {
                return _.get(this.item, '[\'Тип профиля\']');
            }
        },
        methods: {
            getIndustryIcon (industryId) {
                const industryIcon = _.get(_.find(this.storeIndustries, {value: industryId}), 'icon', '');
                return industryIcon || this.defaultIndustryIcon;
            }
        }
    };
</script>

<style lang="stylus">
    .company-mini-list-card
        background white
        width 100%
        color black
        border 1px solid #aaa
        text-align left
        margin 8px 0
        display: flex
        align-items: center

        .company-mini-list-card
            &__owner
                flex 1 1 64px
                margin-right 8px
            &__project-name
                flex 1 1 200px
                margin-right 8px
            &__industry
                flex 1 1 200px
                margin-right 8px
            &__ap
                flex 1 1 120px
                margin-right 8px
            &__equity
                flex 1 1 120px
                margin-right 8px
            &__imp-period
                flex 1 1 120px
                margin-right 8px
            &__pbp
                flex 1 1 120px
                margin-right 8px
            &__ppp
                flex 1 1 36px
                margin-right 8px
            &__dd
                flex 1 1 36px



</style>
