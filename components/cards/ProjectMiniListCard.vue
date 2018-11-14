<template>
    <v-hover>
        <v-card
                slot-scope="{ hover }"
                :class="`elevation-${hover ? 10 : 1}`"
                class="project-mini-list-card"
                @click.native="$router.push(`/project/${itemId}`)"
        >
            <v-card-text>
                <v-layout row justify-center align-center>
                    <v-flex xs7><h4>{{item['Название']}}</h4></v-flex>
                    <v-flex xs5>
                        <v-layout align-center v-if="item['Отрасль']">
                            <v-avatar :size="40" class="avatar--outline">
                                <img :src="getIndustryIcon(item['Отрасль'].entityInstancePk.entityInstanceId)"
                                     alt="avatar">
                            </v-avatar>
                            <small class="ml-2">{{item['Отрасль'].entityDesc}}</small>
                        </v-layout>
                    </v-flex>
                </v-layout>
                <v-divider class="v-divider--extend mt-2 mb-2"></v-divider>

                <v-layout align-center class="my-2">
                    <v-flex xs5>
                        <div class="text__label_small">Capital Required</div>
                        <h3>$ {{item['Capital Required (USD)'] | bigNumber}}</h3>
                    </v-flex>
                    <v-flex xs3>
                        <v-layout align-center>
                            <v-progress-circular
                                    :rotate="-90"
                                    :size="20"
                                    :width="3"
                                    :value="Number(item['Собственный капитал (%)'])"
                                    color="primary"
                            ></v-progress-circular>
                            <v-flex>
                                <div class="text__label_small">Equity</div>
                                <h3 class="ml-2">{{item['Собственный капитал (%)']}}%</h3>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex xs4>
                        <div class="text__label_small">Pay-back period</div>
                        <v-layout align-center>
                            <v-icon medium :color="'primary'">done</v-icon>
                            <h3 class="ml-2">{{item['PBP (мес)']}} mo.</h3>
                        </v-layout>
                    </v-flex>
                </v-layout>

                <v-divider class="v-divider--extend mt-2" v-if="stageToProgress"></v-divider>
                <template v-if="stageToProgress">

                    <v-layout>
                        <v-flex xs12 style="text-align: left">
                            <small>Stage of Readiness: <b>{{item['Стадии проекта']}}</b></small>
                        </v-flex>
                    </v-layout>
                    <v-progress-linear v-model="stageToProgress" :height="3" style="margin-bottom: 0; margin-top: 0;"
                                       class="v-progress-linear--extend"></v-progress-linear>
                </template>
            </v-card-text>
        </v-card>
    </v-hover>
</template>

<script>
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import {mapGetters} from 'vuex';
    import _ from 'lodash';

    export default {
        name: 'project-mini-list-card',
        components: {},
        mixins: [ItemMixin],
        props: {
            canClose: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            defaultIndustryIcon: `${process.env.base}/img/site/default_industry_black.png`
        }),
        computed: {
            ...mapGetters({
                storeIndustries: 'site/industryList'
            }),
            stageToProgress () {
                switch (this.item['Стадии проекта']) {
                    case 'Project Concept':
                        return 25;
                    case 'Feasibility study':
                        return 55;
                    case 'Project Design':
                        return 75;
                    case 'Implementation':
                        return 100;
                    default:
                        return 0;
                }
            }
        },
        methods: {
            onClose () {
                this.$emit('close');
            },
            getIndustryIcon (industryId) {
                const industryIcon = _.get(_.find(this.storeIndustries, {value: industryId}), 'icon', '');
                return industryIcon || this.defaultIndustryIcon;
            }
        }
    };
</script>

<style lang="stylus">
    .project-mini-list-card
        background white
        width 100%

        .v-card__text
            padding-bottom 0


</style>
