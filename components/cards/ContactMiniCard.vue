<template>
    <v-card class="contact-mini-card" width="100%">
        <v-btn
                class="contact-mini-card__close"
                v-if="canClose"
                absolute
                fab
                top
                right
                small
                @click.native="$emit('close')"
        >
            <v-icon>close</v-icon>
        </v-btn>
        <v-card-text class="contact-mini-card__body">
            <v-container grid-list-lg>

                <v-layout row wrap>
                    <v-flex sm6>
                        <div class="text__label_small mb-2">Contact person</div>
                        <div>{{item['ФИО']}}</div>
                    </v-flex>
                    <v-flex sm6>
                        <div class="text__label_small mb-2">Position</div>
                        <div>{{item['Должность']}}</div>
                    </v-flex>
                    <v-flex sm6 class="mt-2">
                        <div class="text__label_small mb-2">E-mail</div>
                        <a :href="`mailto:${item['Email']}`">{{item['Email']}}</a>
                    </v-flex>
                    <v-flex sm4 class="mt-2">
                        <div class="text__label_small mb-2">Phone</div>
                        <div>{{item['Телефон'] | formatPhone}}</div>
                    </v-flex>
                </v-layout>
                <v-layout align-start class="mt-3 mb-3" v-if="userId !== entityUserId">
                    <v-btn
                            round
                            outline
                            large
                            color="primary"
                            @click.native="$root.$emit('sendMessage', {profileId: entityId, profileTitle: entityDesc, profileAvatar: entityIcon})"
                    >Write a message
                    </v-btn>
                </v-layout>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import ItemMixin from '~/mixins/card/CardItemMixin';
    import {mapGetters} from 'vuex';

    export default {
        name: 'contact-mini-card',
        components: {},
        mixins: [ItemMixin],
        props: {
            canClose: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
        }),
        computed: {
            ...mapGetters({
                userId: 'login/getUserId'
            }),
            entityUserId () {
                return this.item.user_id;
            }
        }
    };
</script>

<style lang="stylus">
    .contact-mini-card
        padding 16px
        .contact-mini-card
            &__body
                background #fff
                line-height 1.5

            &__close
                right -12px
                width 24px
                height 24px
                top -12px !important
</style>
