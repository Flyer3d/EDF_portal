<template>
    <v-layout row justify-center align-center style="position: relative;">
        <v-hover>
            <v-card
                    slot-scope="{ hover }"
                    :class="`elevation-${hover ? 12 : 2}`"
                    class="project-short-list-card"
                    @click.native="$router.push(`/project/${entityId}`)"
            >
                <v-card-text class="pa-0">
                    <v-container grid-list-xl fluid style="padding: 30px 20px">
                        <v-layout row justify-start align-center>

                            <v-flex style="flex:0 0 40px;">
                                <v-avatar :size="40" class="avatar--outline">
                                    <v-img :src="autorIcon ? autorIcon : defaultUserSrc" alt="avatar"></v-img>
                                </v-avatar>
                            </v-flex>
                            <v-flex><h3>{{item['Название']}}</h3></v-flex>

                        </v-layout>
                    </v-container>
                    <v-divider></v-divider>
                    <template v-if="stageToProgress">

                        <v-layout class="my-2 mx-3">
                            <v-flex xs3 style="text-align: left">
                                <div class="text__label_tiny" v-if="item['Стадии проекта'] === 'Project Concept'">Stage
                                    of Readiness: <span style="color: #232129; font-weight: 600; opacity: 1;">{{item['Стадии проекта']}}</span>
                                </div>
                            </v-flex>
                            <v-flex xs3 style="text-align: left">
                                <div class="text__label_tiny" v-if="item['Стадии проекта'] === 'Feasibility study'">
                                    Stage of Readiness: <span style="color: #232129; font-weight: 600; opacity: 1;">{{item['Стадии проекта']}}</span>
                                </div>
                            </v-flex>
                            <v-flex xs3 style="text-align: left">
                                <div class="text__label_tiny" v-if="item['Стадии проекта'] === 'Project Design'">Stage
                                    of Readiness: <span style="color: #232129; font-weight: 600; opacity: 1;">{{item['Стадии проекта']}}</span>
                                </div>
                            </v-flex>
                            <v-flex xs3 style="text-align: left">
                                <div class="text__label_tiny" v-if="item['Стадии проекта'] === 'Implementation'">Stage
                                    of Readiness: <span style="color: #232129; font-weight: 600; opacity: 1;">{{item['Стадии проекта']}}</span>
                                </div>
                            </v-flex>
                        </v-layout>
                        <v-progress-linear v-model="stageToProgress" :height="3"
                                           style="margin-bottom: 0; margin-top: 0;"></v-progress-linear>
                    </template>
                </v-card-text>


            </v-card>
        </v-hover>
    </v-layout>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import _ from 'lodash';

    export default {
        name: 'project-short-list-card',
        components: {},
        mixins: [ItemMixin],
        props: {
            canClose: {
                type: Boolean,
                default: false
            },
            short: {
                type: Boolean
            }
        },
        data: () => ({
            defaultUserSrc: `${process.env.base}/img/default/defaultUser.png`,
        }),
        computed: {

            autorIcon () {
                const icon = _.get(this.item, '[\'Автор проекта\'].entityIcon');
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return '';
            },
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
        }
    };
</script>

<style lang="stylus">
    .project-short-list-card
        background white
        width 100%
        color black
        border 1px solid #aaa
        text-align left
        margin 12px 0 0 0
        display: flex
        align-items: center

</style>
