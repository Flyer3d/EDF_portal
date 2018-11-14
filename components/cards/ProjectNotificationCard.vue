<template>
    <v-card class="project-notification-card" v-if="!isEmpty">
        <v-btn
                class="project-notification-card__close"
                v-if="canClose"
                absolute
                fab
                top
                right
                small
                @click.native="$emit('close')"
        ><v-icon>close</v-icon></v-btn>
        <v-card-text class="project-notification-card__body">
            <v-container  grid-list-md>
            <v-layout align-center>
                <v-flex xs6 class="text-xs-left text__label_small">Project</v-flex>
                <v-flex xs6 class="text-xs-right text__label_small" >{{date}}</v-flex>
            </v-layout>
            <v-layout>
                <v-flex xs12 @click="$router.push(`/project/${projectId}`)">{{projectName}}</v-flex>
            </v-layout>
            <v-divider class="v-divider--extend my-3"></v-divider>
            <v-layout>
                <v-flex xs6 class="text-xs-left" @click="$router.push(`/company/${autorId}`)">
                    <div class="text__label_small">Company</div>
                    <h3>{{autorName}}</h3>
                </v-flex >
                <v-flex xs6 class="text-xs-right">
                    <div class="text__label_small">Amount of investment</div>
                    <h3>{{amount}}</h3>
                </v-flex>
            </v-layout>
            <v-layout>
                <v-flex xs12>
                    <div class="text__label_small">Offer</div>
                    {{message}}
                </v-flex>
            </v-layout>
            </v-container>
        </v-card-text>
        <v-card-actions class="text-xs-right" align-right>
            <v-spacer></v-spacer><v-btn dark round large class="mb-3"  @click="$root.$emit('doStep', {stepId: stepId})">Reply to request</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import _ from 'lodash';
    import axios from 'axios';
    import moment from 'moment';

    export default {
        name: 'project-notification-card',
        components: {},
        props: {
            canClose: {
                type: Boolean,
                default: false
            },
            notification: {
                type: Object,
                required: true
            }
        },
        data: () => ({
            itemSrc: {}
        }),
        computed: {
            isEmpty () {
                return _.isEmpty(this.item);
            },
            modelName () {
                return this.inModel.modelName;
            },
            entityId () {
                return this.inModel.instanceId;
            },
            inModel () {
                return this.notification.inEntityModels && this.notification.inEntityModels[0];
            },
            item () {
                return this.itemSrc.object;
            },
            projectName () {
                return _.get(this.item, '[\'Проект\'].entityDesc');
            },
            projectId () {
                return _.get(this.item, '[\'Проект\'].entityInstancePk.entityInstanceId');
            },
            message () {
                return _.get(this.item, '[\'Предложение\']');
            },
            autorName () {
                return _.get(this.item, '[\'Автор заявки\'].entityDesc');
            },
            autorId () {
                return _.get(this.item, '[\'Автор заявки\'].entityInstancePk.entityInstanceId');
            },
            amount () {
                return _.get(this.item, '[\'Сумма инвестиций (USD) (%)\']');
            },
            date () {
                return moment(this.itemSrc.dateModified).format('DD MMMM');
            },
            stepId () {
                return this.notification.stepId;
            }
        },
        created () {
            moment.locale('en');
            if (this.entityId) {
                this.getNotification();
            }
        },
        methods: {
            async getNotification () {
                try {
                    const url = `${process.env.apiBase}/widget/${this.modelName}/${this.entityId}`;
                    const res = await axios.get(url);
                    this.itemSrc = _.get(res, 'data.rows[0]');
                    console.log('[getNotification] All fields replaced!!!');
                    console.dir(this.itemSrc);
                } catch (err) {
                    console.error(`[getNotification] Error getting item ${this.modelName}::${this.entityId}! `);
                    console.dir(err);
                }
            }
        }
    };
</script>

<style lang="stylus">
    .project-notification-card
        margin 8px

        .project-notification-card
            &__close
                right: -12px
                width 24px
                height 24px
                top -12px !important

            &__progress
                font-size: 12px
                margin-right 12px
</style>
