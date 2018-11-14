<template>
    <v-card fluid class="company-list-card">
        <v-card-text>
            <v-layout row justify-center align-center>
                <v-flex xs8 class="company-list-card__name">
                    <v-layout row>
                        <v-flex style="flex: 0 0 40px;">
                            <v-avatar :size="40" tile class="mr-3">
                                <v-img contain :src="companyIcon" alt="avatar"></v-img>
                            </v-avatar>
                        </v-flex>
                        <v-flex>
                            <h4>{{companyName}}</h4>
                            <div class="text__label_small">{{companyType}}</div>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs4 class="company-list-card__industry">
                    <v-layout align-center v-if="item['Отрасль']">
                        <v-flex class="mr-2" style="flex: 0 0 40px;">
                            <v-avatar :size="40">
                                <img :src="getIndustryIcon(item['Отрасль'].entityInstancePk.entityInstanceId)"
                                     alt="avatar">
                            </v-avatar>
                        </v-flex>
                        <div class="text__label_small text-xs-left">{{item['Отрасль'].entityDesc}}</div>
                    </v-layout>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
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
            defaultProfileIcon: `${process.env.base}/img/default/defaultUser.png`
        }),
        computed: {
            ...mapGetters({
                storeIndustries: 'site/industryList'
            }),
            companyIcon () {
                const icon = this.entityIcon;
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
                return industryIcon;
            }
        }
    };
</script>

<style lang="stylus">
    .company-list-card
        background white
        width 100%
        color black
        margin 0 0 2px 0
        display: flex
        align-items: center

        .company-list-card
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
