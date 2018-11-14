<template>
    <div class="fs-select">
        <v-layout column align-center justify-space-between child-flex class="fs-select__text-wrapper">
            <v-flex>
                <h1 class="text-xs-center">
                    Financial Services
                </h1>
            </v-flex>
            <v-flex>
                <v-card flat>
                    <v-card-text class="fs-select__card-wrapper">
                        <v-layout row wrap justify-center>
                            <v-hover>
                                <v-flex
                                        xs4
                                        slot-scope="{ hover }"
                                        @click="$router.push('fservice/credit')"
                                        :style="{zIndex: hover ? 10 : 0, flex: '0 0 360px', transform: `scale(${hover ? 1.05 : 1})`, transition: '0.2s'}"
                                >
                                    <v-card
                                            :class="`elevation-${hover ? 6 : 0}`"
                                            class="fs-select__card"
                                    >
                                        <v-card-text>
                                            <v-layout column fill-height align-start>
                                                <v-flex>
                                                    <v-avatar tile size="65"><img :src="creditSrc" alt="credit">
                                                    </v-avatar>
                                                </v-flex>
                                                <v-spacer></v-spacer>
                                                <v-flex style="flex: 0;">
                                                    <h2 :style="{color: hover ? '#0f7acd' : '#524f5f'}">Crediting</h2>
                                                </v-flex>
                                            </v-layout>
                                        </v-card-text>
                                    </v-card>
                                </v-flex>
                            </v-hover>
                            <v-hover>
                                <v-flex
                                        xs4
                                        slot-scope="{ hover }"
                                        @click="$router.push('fservice/trade-financing')"
                                        :style="{zIndex: hover ? 10 : 0, flex: '0 0 360px', transform: `scale(${hover ? 1.05 : 1})`, transition: '0.2s'}"
                                >
                                    <v-card
                                            :class="`elevation-${hover ? 6 : 0}`"
                                            class="fs-select__card"
                                    >
                                        <v-card-text>
                                            <v-layout column fill-height align-start>
                                                <v-flex>
                                                    <v-avatar tile size="65"><img :src="tradeSrc" alt="credit">
                                                    </v-avatar>
                                                </v-flex>
                                                <v-spacer></v-spacer>
                                                <v-flex style="flex: 0;"><h2
                                                        :style="{color: hover ? '#0f7acd' : '#524f5f'}">Trade
                                                    Financing</h2></v-flex>
                                            </v-layout>
                                        </v-card-text>
                                    </v-card>
                                </v-flex>
                            </v-hover>
                            <v-hover>
                                <v-flex
                                        xs4
                                        slot-scope="{ hover }"
                                        @click="$router.push('fservice/investment')"
                                        :style="{zIndex: hover ? 10 : 0, flex: '0 0 360px', transform: `scale(${hover ? 1.05 : 1})`, transition: '0.2s'}"
                                >
                                    <v-card
                                            :class="`elevation-${hover ? 6 : 0}`"
                                            class="fs-select__card"
                                    >
                                        <v-card-text>
                                            <v-layout column fill-height align-start>
                                                <v-flex>
                                                    <v-avatar tile size="65"><img :src="investmentSrc" alt="credit">
                                                    </v-avatar>
                                                </v-flex>
                                                <v-spacer></v-spacer>
                                                <v-flex style="flex: 0;"><h2
                                                        :style="{color: hover ? '#0f7acd' : '#524f5f'}">Investment and
                                                    Project<br>
                                                    Financing</h2></v-flex>
                                            </v-layout>
                                        </v-card-text>
                                    </v-card>
                                </v-flex>
                            </v-hover>
                            <v-hover>
                                <v-flex
                                        xs4
                                        slot-scope="{ hover }"
                                        @click="$router.push('fservice/bank-guarantees')"
                                        :style="{zIndex: hover ? 10 : 0, flex: '0 0 360px', transform: `scale(${hover ? 1.05 : 1})`, transition: '0.2s'}"
                                >
                                    <v-card
                                            :class="`elevation-${hover ? 6 : 0}`"
                                            class="fs-select__card"
                                    >
                                        <v-card-text>
                                            <v-layout column fill-height align-start>
                                                <v-flex>
                                                    <v-avatar tile size="65"><img :src="bankSrc" alt="credit">
                                                    </v-avatar>
                                                </v-flex>
                                                <v-spacer></v-spacer>
                                                <v-flex style="flex: 0;"><h2
                                                        :style="{color: hover ? '#0f7acd' : '#524f5f'}">Bank
                                                    Guarantees</h2></v-flex>
                                            </v-layout>
                                        </v-card-text>
                                    </v-card>
                                </v-flex>
                            </v-hover>
                            <v-hover>
                                <v-flex
                                        xs4
                                        slot-scope="{ hover }"
                                        @click="$router.push('fservice/factoring')"
                                        :style="{zIndex: hover ? 10 : 0, flex: '0 0 360px', transform: `scale(${hover ? 1.05 : 1})`, transition: '0.2s'}"
                                >
                                    <v-card
                                            :class="`elevation-${hover ? 6 : 0}`"
                                            class="fs-select__card"
                                    >
                                        <v-card-text>
                                            <v-layout column fill-height align-start>
                                                <v-flex>
                                                    <v-avatar tile size="65"><img :src="factoringSrc" alt="credit">
                                                    </v-avatar>
                                                </v-flex>
                                                <v-spacer></v-spacer>
                                                <v-flex style="flex: 0;"><h2
                                                        :style="{color: hover ? '#0f7acd' : '#524f5f'}">Factoring</h2>
                                                </v-flex>
                                            </v-layout>
                                        </v-card-text>
                                    </v-card>
                                </v-flex>
                            </v-hover>
                            <v-hover>
                                <v-flex
                                        xs4
                                        slot-scope="{ hover }"
                                        @click="$router.push('fservice/leasing')"
                                        :style="{zIndex: hover ? 10 : 0, flex: '0 0 360px', transform: `scale(${hover ? 1.05 : 1})`, transition: '0.2s'}"
                                >
                                    <v-card
                                            :class="`elevation-${hover ? 6 : 0}`"
                                            class="fs-select__card"
                                    >
                                        <v-card-text>
                                            <v-layout column fill-height align-start>
                                                <v-flex>
                                                    <v-avatar tile size="65"><img :src="leasingSrc" alt="credit">
                                                    </v-avatar>
                                                </v-flex>
                                                <v-spacer></v-spacer>
                                                <v-flex style="flex: 0;"><h2
                                                        :style="{color: hover ? '#0f7acd' : '#524f5f'}">Leasing</h2>
                                                </v-flex>
                                            </v-layout>
                                        </v-card-text>
                                    </v-card>
                                </v-flex>
                            </v-hover>
                        </v-layout>
                    </v-card-text>

                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
    export default {
        name: 'fs-select-page',
        layout: 'site',
        data: () => ({
            creditSrc: `${process.env.base}/img/icons/crediting.svg`,
            tradeSrc: `${process.env.base}/img/icons/trade_financing.svg`,
            investmentSrc: `${process.env.base}/img/icons/investment.svg`,
            bankSrc: `${process.env.base}/img/icons/bank_guarantees.svg`,
            factoringSrc: `${process.env.base}/img/icons/factoring.svg`,
            leasingSrc: `${process.env.base}/img/icons/leasing.svg`
        })
    };
</script>

<style lang="stylus">
    .fs-select
        width calc(100vw - 80px )
        height calc(100vh - 64px )
        background-color: #f3f4f8;
        position fixed
        padding 0

        .fs-select
            &__text-wrapper
                margin-top 64px


            &__card-wrapper
                height 100%
                width 1080px
                padding 0
                margin-top 56px
                background-color: #f3f4f8;

            &__card
                border: solid 1px #dcdcdf;
                background #ffffff
                width 360px
                height 270px

                .v-card__text
                    height 100%
                    padding 40px

</style>
