<template>
    <div class="company-type-page">
        <v-btn
                v-if="isInvestor"
                small
                round
                outline
                color="black"
                @click.native="isInvestor = false"
                class="company-type-page__back-btn"
        >
            <v-icon>keyboard_arrow_left</v-icon>Back
        </v-btn>
        <v-layout column align-center justify-space-between child-flex class="company-type-page__text-wrapper">
            <v-flex>
                <p class="company-type-page__text-label">Application for Accreditation</p>
            </v-flex>
            <v-flex>
                <h3 class="company-type-page__text">
                    What type of company<br>do you represent?
                </h3>
            </v-flex>
            <v-flex>
                <v-card class="company-type-page__card" v-if="!isInvestor">
                    <v-card-text class="company-type-page__card-wrapper">
                        <v-layout align-content-space-between fill-height>
                            <v-hover>
                                <v-flex
                                        slot-scope="{ hover }"
                                        class="mx-auto company-type-page__selection"
                                        @click="$router.push('companyAccreditation')"
                                >
                                    <img :src="companySrc" :width="80" :height="80" class="company-type-page__selection-img mx-auto" :class="{active: hover}" />
                                    <div class="company-type-page__selection-text">Commercial<br>organization</div>
                                    <div class="company-type-page__selection-rect" v-if="hover">&nbsp;</div>

                                </v-flex>
                            </v-hover>
                            <v-hover>
                                <v-flex
                                        slot-scope="{ hover }"
                                        class="mx-auto company-type-page__selection"
                                        @click="isInvestor = true"
                                >

                                    <img :src="investorSrc" :width="80" :height="80" class="company-type-page__selection-img mx-auto" :class="{active: hover}">
                                    <div class="company-type-page__selection-text">Investor or Bank</div>
                                    <div class="company-type-page__selection-rect" v-if="hover">&nbsp;</div>
                                </v-flex>
                            </v-hover>
                            <v-hover>
                                <v-flex
                                        slot-scope="{ hover }"
                                        class="mx-auto company-type-page__selection"
                                        @click="$router.push('fsueAccreditation')"
                                >
                                    <img :src="fsueSrc" :width="80" :height="80" class="company-type-page__selection-img mx-auto" :class="{active: hover}">
                                    <div class="company-type-page__selection-text">Federal State Unitary<br>Enterprise</div>
                                    <div class="company-type-page__selection-rect" v-if="hover">&nbsp;</div>
                                </v-flex>
                            </v-hover>
                        </v-layout>
                    </v-card-text>

                </v-card>
                <v-card class="company-type-page__card" v-else>
                    <v-card-text class="company-type-page__card-wrapper">
                        <v-layout column class="company-type-page__investor" align-center>
                            <img :src="investorSrc" :width="40" :height="40">
                            <div class="company-type-page__investor-text">Choose investor type</div>
                            <v-btn-toggle v-model="investorType" dark>
                                <v-btn
                                        outline
                                        color="white"
                                        flat value="bank"
                                        class="company-type-page__investor-button"
                                        nuxt
                                        to="bankAccreditation"
                                >
                                    Bank
                                </v-btn>
                                <v-btn
                                        outline
                                        color="white"
                                        flat
                                        value="fund"
                                        class="company-type-page__investor-button"
                                        nuxt
                                        to="fundAccreditation"
                                >
                                    Investment Fund
                                </v-btn>
                                <v-btn
                                        outline
                                        color="white"
                                        flat
                                        value="institute"
                                        class="company-type-page__investor-button"
                                        nuxt
                                        to="instAccreditation"
                                >
                                    Development Institute
                                </v-btn>
                            </v-btn-toggle>
                        </v-layout>
                    </v-card-text>

                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>


<script>
    export default {
        name: 'company-type-page',
        layout: 'defaultSite',
        data: () => ({
            logoSrc: `${process.env.base}/img/logo.svg`,
            companySrc: `${process.env.base}/img/company/company.svg`,
            investorSrc: `${process.env.base}/img/company/investor.svg`,
            fsueSrc: `${process.env.base}/img/company/fsue.svg`,
            isInvestor: false,
            investorType: null
        })
    };
</script>

<style lang="stylus">
    .company-type-page
        width 100%
        padding 0

        .company-type-page
            &__back-btn
                position absolute
                left 57px
                bottom 46px
                width 113px
                height 40px
                z-index 10
                border: solid 1px #a3a2a7

            &__investor-button.v-btn:hover:before
                background-color #0f7acd
                opacity 1
            &__investor-button.v-btn:hover
                opacity 1
                color #fff

            &__title
                text-align: center
                margin-top 1em

            &__text-wrapper
                // margin-top 128px
                padding-top 15vh

            &__text-label
                opacity: 0.5;
                font-family: Rubik;
                font-size: 16px;
                font-weight: 500;
                font-style: normal;
                font-stretch: normal;
                line-height: 1.31;
                letter-spacing: normal;
                text-align: center;
                color: #35323f;

            &__text
                margin-top 24px
                font-family: Rubik;
                font-size: 30px;
                font-weight: bold;
                font-style: normal;
                font-stretch: normal;
                line-height: 1.2;
                letter-spacing: normal;
                text-align: center;
                color: #35323f;

            &__card
                margin-top 52px
                width: 873px;
                height: 336px;
                object-fit: contain;
                background-color: #37363f;
                box-shadow: 0 26px 68px 0 rgba(35, 33, 45, 0.42);

            &__card-wrapper
                height 100%
                padding 96px 60px 60px

            &__selection
                position: relative;
                height 100%
                text-align: center

                &-img
                    position relative
                    z-index: 10
                    opacity 0.6

                    &.active
                        opacity 1

                &-text
                    position relative
                    z-index: 10
                    margin-top 32px
                    font-family: Rubik;
                    font-size: 14px;
                    font-weight: 500;
                    font-style: normal;
                    font-stretch: normal;
                    line-height: 1.43;
                    letter-spacing: normal;
                    text-align: center;
                    color: #ffffff;

                &-rect
                    position: absolute;
                    bottom 0
                    left calc(50% - 80px)
                    width: 160px;
                    height: 116px;
                    object-fit: contain;
                    background-color: #0f7acd;

            &__investor
                margin-top -20px

                &-text
                    margin 20px 0 40px
                    object-fit: contain;
                    font-family: Rubik;
                    font-size: 20px;
                    font-weight: bold;
                    font-style: normal;
                    font-stretch: normal;
                    line-height: 1.4;
                    letter-spacing: normal;
                    text-align: center;
                    color: #ffffff;

                &-button
                    width 212px

</style>
