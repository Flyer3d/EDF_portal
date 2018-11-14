<template>
    <v-container fluid flat class="fs-block">
        <v-layout row child-flex>
            <v-flex style="flex-basis: 100%;">
                <div class="fs-block__info-wrapper">
                    <v-btn small
                           round
                           outline
                           color="black"
                           nuxt
                           to="/fsSelect"
                           style="position: relative; left: 40px; top: 40px; z-index: 1;"
                    >
                        <v-icon>keyboard_arrow_left</v-icon>
                        Back
                    </v-btn>
                    <component
                            :is="formType"
                            ref="form"
                            style="margin-top: -40px;"
                    ></component>
                </div>
            </v-flex>

            <v-flex style="flex-basis: 480px; min-width: 480px;">
                <v-toolbar dark height="60" color="#35323f">
                    <div class="text__label_small dark">Choose one or more banks:</div>
                    <v-spacer></v-spacer>
                    <v-btn small round outline color="white" @click.native="selectAll">
                        Select all
                    </v-btn>
                </v-toolbar>
                <div class="v-dialog--scrollable" style="height: calc(100vh - 124px);">
                    <v-card>
                        <v-container grid-list-lg fluid>
                            <v-card-text style="height: calc( 100% - 164px )">
                                <v-list>
                                    <template v-for="item in bankList">
                                        <v-list-tile
                                                :key="item.id"
                                                avatar
                                        >
                                            <v-list-tile-avatar>
                                                <v-img :src="item.icon"></v-img>
                                            </v-list-tile-avatar>

                                            <v-list-tile-content>
                                                <v-list-tile-title v-html="item.name" class="title__label"
                                                                   :style="{color: item.selected ? '#0f7acd' : '#524f5f'}"></v-list-tile-title>
                                            </v-list-tile-content>

                                            <v-list-tile-action>
                                                <v-checkbox v-model="item.selected"></v-checkbox>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-divider class="v-divider--extend"></v-divider>
                                    </template>
                                </v-list>
                            </v-card-text>
                            <v-divider></v-divider>
                            <v-card-actions>
                                <v-layout column style="height: 160px">
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
                                                :disabled="!personalDataCheckbox || !anyBankSelected"
                                                @click.native="submit"
                                        >Send an Application
                                        </v-btn>
                                    </v-flex>
                                </v-layout>
                            </v-card-actions>
                        </v-container>
                    </v-card>
                </div>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import axios from 'axios';
    import {mapGetters, mapActions} from 'vuex';
    import _ from 'lodash';
    import FsBankGuaranteesForm from '~/components/forms/FsBankGuaranteesForm';
    import FsCreditForm from '~/components/forms/FsCreditForm';
    import FsFactoringForm from '~/components/forms/FsFactoringForm';
    import FsInvestmentForm from '~/components/forms/FsInvestmentForm';
    import FsLeasingForm from '~/components/forms/FsLeasingForm';
    import FsTradeFinancingForm from '~/components/forms/FsTradeFinancingForm';

    export default {
        name: 'fs-block',
        layout: 'site',
        validate ({ params }) {
            console.log('[fservice/_service] Validating service');
            return Boolean(params.service);
        },
        components: {
            FsBankGuaranteesForm,
            FsCreditForm,
            FsFactoringForm,
            FsInvestmentForm,
            FsLeasingForm,
            FsTradeFinancingForm
        },
        asyncData: ({params}) => ({serviceType: params.service}),
        data: () => ({
            defaultUserSrc: `${process.env.base}/img/default/defaultUser.png`,
            gui: (process.env.gui && process.env.gui.autoStepWidget) || {},
            personalDataCheckbox: false,
            bankFilter: '',
            bankListLoading: false,
            bankListSrc: [],
            bankList: []
        }),
        created () {
            console.log('[FsBlock] Created! Loading Bank list!');
            const type = this.serviceType;
            switch (type) {
                case 'credit':
                    this.bankFilter = '[Кредитование] = \'True\'';
                    break;
                case 'trade-financing':
                    this.bankFilter = '[Торговое финансирование] = \'True\'';
                    break;
                case 'investment':
                    this.bankFilter = '[Инвестиционное и проектное финансирование] = \'True\'';
                    break;
                case 'bank-guarantees':
                    this.bankFilter = '[Банковские гарантии] = \'True\'';
                    break;
                case 'factoring':
                    this.bankFilter = '[Факторинг] = \'True\'';
                    break;
                case 'leasing':
                    this.bankFilter = '[Лизинг] = \'True\'';
                    break;
                default:
            }
            this.getBankList();
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
                    this.$router.push('/fsSuccess');
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
                saveStatus: 'action/stepStatus',
                userId: 'login/getUserId',
                userProfile: 'login/getProfile'
            }),
            allParams () {
                return Object.assign({}, this.params, this.item);
            },
            anyBankSelected () {
                for (let i = 0; i < this.bankList.length; i++) {
                    if (this.bankList[i].selected) {
                        return true;
                    }
                }
                return false;
            },
            userIndustryId () {
                if (!_.isEmpty(this.userProfile)) {
                    return _.get(this.userProfile, '[\'Отрасль\'].entityInstancePk.entityInstanceId');
                }
                return null;
            },
            formType () {
                return `fs-${this.serviceType}-form`;
            }
        },
        methods: {
            ...mapActions({
                saveMonoStepData: 'action/takeStep'
            }),
            async getBankList () {
                console.log('[getBankList] Loading... ');
                const url = `${process.env.apiBase}/widget`;
                const filters = [
                    '[Тип профиля] = \'Investor or Bank\'',
                    '[Тип инвестора] = \'Bank\''
                ];
                if (this.bankFilter) {
                    filters.push(this.bankFilter);
                }
                const params = {
                    model: 'Профиль участника',
                    userOnly: false,
                    pageNumber: 1,
                    pageSize: 1000,
                    orderBy: 'Название',
                    query: filters.join(' AND ')
                };
                console.dir(params);
                try {
                    this.bankListLoading = true;
                    const bankListSrc = await axios.get(url, { params });
                    console.log('[getBankList] Bank list loaded!');
                    console.dir(bankListSrc);
                    this.bankListSrc = bankListSrc.data;
                    this.bankList = bankListSrc.data.rows
                        .filter(bank => !_.isEmpty(_.find(bank.object['Приоритетные отрасли финансирования'], {entityInstancePk: {entityInstanceId: this.userIndustryId}})))
                        .filter(item => Boolean(item.object.user_id))
                        .map(bank => {
                        let icon = bank.entityIcon;
                        if (icon && icon.split('://')[1]) {
                            icon = `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                        } else {
                            icon = this.defaultUserSrc;
                        }
                        return {
                            selected: false,
                            icon: icon,
                            name: bank.entityDesc,
                            id: bank.entityInstancePk.entityInstanceId
                        };
                    });

                    console.dir(this.bankList);
                } catch (err) {
                    console.error('[getBankList] Error loading bank list!');
                    console.dir(err);
                }
            },
            selectAll () {
                this.bankList.forEach(bank => {
                    bank.selected = true;
                });
            },
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
                    const bankIds = this.bankList.filter(item => item.selected).map(item => item.id);
                    const fields = form.getFields();
                    const entityName = form.getModelName();
                    const processName = form.getProcessName();
                    fields.push({name: 'Поставщики финансовых услуг', value: bankIds, type: 'DROPDOWN_LINK'});
                    fields.push({name: 'user_id', value: this.userId, type: 'TEXT_FIELD'});
                    fields.push({name: 'Отправляя форму, вы даете согласие на обработку персональных данных, указанных вами в заявке. В соответствии с требованиями Федерального закона № 152-ФЗ 27.07.2006 "О персональных данных"', value: 'True', type: 'CHECKBOX'});
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
    .item-info__icon
        width 32px !important
        height 32px  !important
        margin 4px 8px 0 0
        border-radius 50%
        background: #000

    .autor-icon
        width 48px !important
        height 48px !important
        border-radius 50%

    .fs-block
        padding 0

        small
            display block
            line-height: 1.4

        .fs-block
            &__info-wrapper
                background-color: #f0eff1;
                padding 20px
                height: calc(100vh - 64px);
                overflow auto
            &__tabs-wrapper
                background-color: #f0eff1;
                padding 20px 20px 20px 0

            &__img-info
                background rgba(0, 0, 0, 0.4)
                padding 64px 20px
                text-align: center
                line-height 1

                h2
                    font-size 18px
                    margin-top 16px

            &__item-info
                position absolute
                z-index: 20
                width: 300px
                height 300px
                right 100px
                top 100px
                background lightgoldenrodyellow
</style>
