<template>
    <div class="accreditation-success">
        <v-layout column align-center justify-center child-flex class="accreditation-success__text-wrapper">
            <v-flex>
                <v-card class="accreditation-success__card">
                    <v-card-text class="accreditation-success__card-wrapper">
                        <v-layout align-center fill-height column>
                            <v-flex class="mb-4">
                                <v-img :src="letterSrc" :width="105" :height="50" contain></v-img>
                            </v-flex>
                            <h1 class="mb-4">Your application has been<br>submitted. Thank you!</h1>
                            <div class="mb-4">
                                Within a day, the application will be checked by the moderator, <br>
                                and you will receive a notification of the publication of the <br>
                                project. Check your mail!
                            </div>
                            <v-btn
                                    large
                                    round
                                    nuxt
                                    to="/"
                            >Back to Homepage</v-btn>
                        </v-layout>
                    </v-card-text>

                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
    export default {
        name: 'accreditation-success',
        layout: 'defaultSite',
        data: () => ({
            logoSrc: `${process.env.base}/img/logo.svg`,
            letterSrc: `${process.env.base}/img/default/letter.svg`
        })
    };
</script>

<style lang="stylus">
    .accreditation-success
        width 100%
        height 100%
        padding 0

        .accreditation-success
            &__title
                text-align: center
                padding-top 1em

            &__text-wrapper
                padding-top 128px

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
                background-color: #ffffff;
                box-shadow: 0 26px 68px 0 rgba(35, 33, 45, 0.07);

            &__card-wrapper
                height 100%
                padding 72px 212px
                text-align center

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
