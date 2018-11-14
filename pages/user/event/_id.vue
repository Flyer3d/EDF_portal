<template>
    <v-container fluid flat class="event-info" v-if="!isEmpty">
            <v-layout row child-flex>
                <v-flex style="flex-basis: 100%;">

                    <div  class="event-info__info-wrapper">
                        <event-card
                            v-if="!isEmpty"
                            :itemSrc="itemSrc"
                            />
                    </div>
                </v-flex>

                <v-flex style="flex-basis: 480px; min-width: 480px;">
                        <v-tabs
                                v-model="tabs"
                                color="#35323f"
                                hide-slider
                                dark
                        >
                            <v-tab class="ml-2">
                                Sign Up
                            </v-tab>
                        </v-tabs>
                    <div  style="height: calc(100vh - 124px); background: #e8e7eb;">
                        <div  class="event-info__tabs-wrapper">
                        <v-tabs-items v-model="tabs">
                            <v-tab-item>
                                <v-layout column class="event-info__form">
                                    <v-flex>
                                        <h4>Cost of Participation</h4>
                                        <h1>from {{eventPrice}}$</h1>
                                    </v-flex>
                                    <v-divider></v-divider>
                                    <v-flex>
                                        <event-singup-form ref="form"></event-singup-form>
                                    </v-flex>
                                    <v-flex>
                                        <v-checkbox
                                                class="mt-3"
                                                label="I consent to the processing of personal data"
                                                v-model="personalDataCheckbox"
                                        ></v-checkbox>
                                    </v-flex>
                                    <v-flex class="text-xs-center">
                                        <v-btn
                                                class="my-3"
                                                round
                                                :disabled="!personalDataCheckbox"
                                                @click.native="submit"
                                        >Sign Up</v-btn>
                                    </v-flex>
                                </v-layout>
                            </v-tab-item>
                        </v-tabs-items>
                    </div>
                    </div>
                </v-flex>
            </v-layout>
    </v-container>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import ItemMixin from '~/mixins/ItemMixin';
    import _ from 'lodash';
    import EventSingupForm from '~/components/forms/EventSingupForm';
    import EventCard from '~/components/cards/EventCard';

    export default {
        name: 'event-info-page',
        layout: 'site',
        validate ({ params }) {
            console.log('[event/_id] Validating id');
            return Boolean(params.id) && !Number.isNaN(Number(params.id));
        },
        mixins: [ItemMixin],
        components: {
            EventSingupForm,
            EventCard
        },
        data: () => ({
            id: null,
            gui: (process.env.gui && process.env.gui.autoStepWidget) || {},
            entityDesc: '',
            personalDataCheckbox: false,
            tabs: 0
        }),
        async fetch ({params, store, redirect}) {
            await store.dispatch('events/getItem', params.id);
            if (store.getters['events/getItemLoadStatus'] === 'ERROR') {
                redirect('/error/404');
            }
        },
        watch: {
            saveStatus (value) {
                if (value === 'SAVING') {
                    this.loading = true;
                    this.$root.$emit('veil', {
                        type: 'info',
                        msg: this.gui.msg.terminatingStep,
                        timeout: 6000
                    });
                } else if (value === 'SUCCESS') {
                    this.loading = false;
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: this.gui.msg.stepSuccess,
                        timeout: 6000
                    });
                    this.$router.push('/eventSuccess');
                } else if (value === 'ERROR') {
                    this.loading = false;
                    const error = _.get(this.error, 'response.data.message');
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `${this.gui.msg.stepError} ${error}`,
                        timeout: 20000
                    });
                } else {
                }
            }
        },
        computed: {
            ...mapGetters({
                itemSrc: 'events/getItem',
                saveStatus: 'action/stepStatus',
                userId: 'login/getUserId'
            }),
            eventPrice () {
                return _.get(this.item, '[\'Стоимость\']');
            }
        },
        methods: {
            ...mapActions({
                saveMonoStepData: 'action/takeStep'
            }),
            submit () {
                console.log('[submit] Validating...');
                const form = this.$refs.form;
                console.dir(form);
                if (form) {
                    if (form.validate()) {
                        this.$root.$emit('say', {
                            type: 'error',
                            msg: this.gui.validatingError,
                            timeout: 6000
                        });
                        return;
                    }
                    const fields = form.getFields();
                    const entityName = form.getModelName();
                    const processName = form.getProcessName();
                    fields.push({name: 'Мероприятие', value: this.itemId, type: 'DROPDOWN_LINK'});
                    fields.push({name: 'user_id', value: this.userId, type: 'TEXT_FIELD'});
                    fields.push({name: 'Я согласен на обработку персональных данных', value: 'True', type: 'CHECKBOX'});
                    console.log('[sibmit] Submitting...');
                    console.dir({
                        fields,
                        entityName,
                        processName
                    });
                    this.saveMonoStepData({
                        fields,
                        entityName,
                        processName
                    });
                }
            }
        }
    };
</script>

<style lang="stylus">


    .event-info
        padding 0

        small
            display block
            line-height: 1.4

        .event-info
            &__info-wrapper
                background-color: #f0eff1
                height: calc(100vh - 64px)
                overflow auto
                padding 20px

            &__tabs-wrapper
                padding 20px

            &__form
                background #fff
                padding 16px 16px 40px 16px


</style>
