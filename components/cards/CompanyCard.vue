<template>
    <v-card class="company-card" flat>
        <v-container
                fill-height
                fluid
                class="company-card__banner white--text"
                :style="`background: url(${companyBg}) no-repeat; background-size: cover`">
            <v-layout fill-height align-center justify-start row class="company-card__banner-info">
                <v-flex style="flex: 0 0 260px;" class="mr-5">
                    <v-layout align-center justify-center>
                        <v-avatar :size="260" tile v-if="companyIcon">
                            <v-img contain :src="companyIcon" alt="avatar"/>
                        </v-avatar>
                    </v-layout>
                </v-flex>
                <v-flex fill-height>
                    <v-layout column fill-height align-start justify-space-between>
                        <v-flex></v-flex>
                        <v-spacer></v-spacer>
                        <h1 class="dark mb-3">{{item['Название']}}</h1>
                        <h2 class="dark">{{item['Название на локальном языке']}}</h2>
                        <div class="title__label mt-3 mb-4" style="text-transform: capitalize;">{{companyType}}</div>
                        <v-spacer></v-spacer>
                        <v-flex
                                v-if="item['Презентация о компании']"
                                style="cursor: pointer;"
                                @click="downloadFile(item['Презентация о компании'])"
                        >
                            <v-layout align-center>
                                <v-avatar size="24" tile class="mr-2">
                                    <v-img :src="downloadIcon" contain alt="download"></v-img>
                                </v-avatar>
                                <span class="text__label"
                                      style="opacity: 1; font-weight:400;">Download presentation</span>
                            </v-layout>
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
        </v-container>
        <v-card-text class="company-card__body">
            <v-layout align-center>
                <v-flex :xs4="item['Сайт']" :xs6="!item['Сайт']">
                    <v-layout align-center v-if="item['Отрасль']">
                        <v-avatar :size="40" v-if="getIndustryIcon(item['Отрасль'].entityInstancePk.entityInstanceId)">
                            <img :src="getIndustryIcon(item['Отрасль'].entityInstancePk.entityInstanceId)" alt="avatar">
                        </v-avatar>
                        <div class="title__label ml-2">{{item['Отрасль'].entityDesc}}</div>

                    </v-layout>
                </v-flex>
                <v-flex :xs4="item['Сайт']" :xs6="!item['Сайт']">
                    <v-layout>
                        <v-icon medium color="primary">location_on</v-icon>
                        <v-layout column :style="{color: '#35323f'}">
                            <div class="title__label">{{item['Страна'].entityDesc}}</div>
                            <div class="title__label" v-if="item['Регион']">{{item['Регион'].entityDesc}}</div>
                        </v-layout>
                    </v-layout>
                </v-flex>
                <v-flex v-if="item['Сайт']" xs4>
                    <v-layout>
                        <v-icon color="primary" class="mr-2">language</v-icon>
                        <a :href="href(item['Сайт'])" alt="fieldData" target="_blank" class="title__label">{{item['Сайт']}}</a>
                    </v-layout>
                </v-flex>
            </v-layout>
            <v-divider class="my-5 v-divider--extend"></v-divider>
            <v-layout class="mt-4" column>
                <div class="text__label_small mb-3">About company</div>
                <p v-html="item['Краткое описание']"></p>
            </v-layout>
            <v-layout class="mt-4 mb-4" v-if="item['Ссылка на видео']">
                <iframe v-if="isEmbed(item['Ссылка на видео'])" width="640" height="360" :src="item['Ссылка на видео']"
                        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                <v-flex v-else>
                    <v-icon color="primary" class="mr-2">play_circle_filled</v-icon>
                    <a :href="href(item['Ссылка на видео'])" alt="" target="_blank">See presentation video (in other
                        window)</a>
                </v-flex>
            </v-layout>
            <template v-if="parentCompany">
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout column>
                    <div class="text__label_small mb-3">Head Company</div>
                    <v-layout
                            align-center
                    >
                        <v-avatar :size="40">
                            <v-img :src="getIcon(parentCompany.entityIcon)" alt="avatar" contain></v-img>
                        </v-avatar>
                        <div class="title__label ml-2">{{parentCompany.entityDesc}}</div>
                    </v-layout>
                </v-layout>
            </template>
            <template v-if="childCompanies && childCompanies.length > 0">
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout row wrap>
                    <v-flex xs12>
                        <div class="text__label_small mb-3">Affiliated Companies</div>
                    </v-flex>
                    <v-flex
                            xs12 md6 lg4
                            v-for="child in childCompanies"
                            :key="child.entityInstancePk.entityInstanceId"
                    >
                        <v-layout
                                align-center
                        >
                            <v-avatar :size="40">
                                <v-img :src="getIcon(child.entityIcon)" alt="avatar" contain></v-img>
                            </v-avatar>
                            <div class="title__label ml-2">{{child.entityDesc}}</div>
                        </v-layout>
                    </v-flex>
                </v-layout>

            </template>
            <template v-if="companyType === 'Federal State Unitary Enterprise'">
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout row wrap>
                    <v-flex xs12 md6>
                        <v-img :src="fsueRegionImg" contain width="100%" height="200px"></v-img>
                    </v-flex>
                    <v-flex xs12 md6>
                        <v-layout row wrap>
                            <v-flex xs12>
                                <h4>{{region}}</h4>
                            </v-flex>
                            <v-flex xs6 class="mb-3">
                                <div class="text__label_small mb-2">Area</div>
                                <div>{{item['Площадь региона'] | bigNumber}} km<sup>2</sup></div>
                            </v-flex>
                            <v-flex xs6 class="mb-3">
                                <div class="text__label_small mb-2">Population</div>
                                <div>{{item['Население региона'] | bigNumber}}</div>
                            </v-flex>
                            <v-flex xs6 class="mb-3">
                                <div class="text__label_small mb-2">Administrative Center</div>
                                <div>{{item['Административный центр']}}</div>
                            </v-flex>
                            <v-flex xs6 class="mb-3">
                                <div class="text__label_small mb-2">Main Directions of the Economy</div>
                                <div v-html="item['Основные направления экономики'].map(item=>item.entityDesc).join('<br>')"></div>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout class="mb-5">
                    <v-flex xs6 md4>
                        <div class="text__label_small mb-2">Parent Organization</div>
                        <div>{{item['Управляющий орган']}}</div>
                    </v-flex>
                    <v-flex xs6 md4>
                        <div class="text__label_small mb-2">Actual Head</div>
                        <div>{{item['Действующий глава']}}</div>
                    </v-flex>
                </v-layout>
            </template>
            <template v-if="companyType === 'Commercial organization'">
                <v-divider class="my-5  v-divider--extend"></v-divider>
                <v-layout class="mt-4 mb-4">
                    <v-flex :xs3="item['Рейтинги']" :xs4="!item['Рейтинги']">
                        <div class="text__label_small mb-3">Type of Ownership</div>
                        <div style="text-transform: capitalize;">{{item['Вид собственности']}}</div>
                    </v-flex>
                    <v-flex :xs3="item['Рейтинги']" :xs4="!item['Рейтинги']">
                        <div class="text__label_small mb-3">TIN</div>
                        <div>{{item['ИНН']}}</div>
                    </v-flex>
                    <v-flex :xs3="item['Рейтинги']" :xs4="!item['Рейтинги']">
                        <div class="text__label_small mb-3">Average Annual Turnover</div>
                        <div>$ {{item['Средний оборот в год (USD)'] | bigNumber}}</div>
                    </v-flex>
                    <v-flex xs3 v-if="item['Рейтинги']">
                        <div class="text__label_small mb-3">Ratings</div>
                        <div>{{item['Рейтинги']}}</div>
                    </v-flex>
                </v-layout>
            </template>
            <template v-if="companyType === 'Investment Fund'">
                <v-divider class="my-5  v-divider--extend"></v-divider>
                <v-layout class="mt-4 mb-4">
                    <v-flex xs4>
                        <div class="text__label_small mb-3">Type of Ownership</div>
                        <div style="text-transform: capitalize;">{{item['Вид собственности']}}</div>
                    </v-flex>
                    <v-flex xs4>
                        <div class="text__label_small mb-3">TIN</div>
                        <div>{{item['ИНН']}}</div>
                    </v-flex>
                    <v-flex xs4 v-if="item['Рейтинги']">
                        <div class="text__label_small mb-3">Ratings</div>
                        <div>{{item['Рейтинги']}}</div>
                    </v-flex>
                </v-layout>
                <v-divider class="my-5  v-divider--extend"></v-divider>
                <v-layout class="mt-4 mb-4">
                    <v-flex xs4>
                        <div class="text__label_small mb-3">Capital of a Fund (USD)</div>
                        <div>$ {{item['Капитал'] | bigNumber}}</div>
                    </v-flex>
                    <v-flex xs4>
                        <div class="text__label_small mb-3">Major Shareholders</div>
                        <v-layout
                                align-center
                                v-if="item['Бенефициары']"
                                style="cursor: pointer;"
                                @click="downloadFile(item['Бенефициары'])"
                        >
                            <v-avatar size="20" tile class="mr-3">
                                <v-img :src="downloadBlueIcon" contain alt="download"></v-img>
                            </v-avatar>
                            <span class="title__label" style="opacity: 1; font-weight:400; color: #0f7acd">Shareholders list</span>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </template>
            <template v-if="companyType === 'Bank'">
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout class="mt-4 mb-4">
                    <v-flex xs3>
                        <div class="text__label_small mb-3">Type of Ownership</div>
                        <div style="text-transform: capitalize;">{{item['Вид собственности']}}</div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text__label_small mb-3">TIN</div>
                        <div>{{item['ИНН']}}</div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text__label_small mb-3">BIC</div>
                        <div>{{item['БИК (для России)']}}</div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text__label_small mb-3">SWIFT</div>
                        <div>{{item['SWIFT']}}</div>
                    </v-flex>
                </v-layout>
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout class="mt-4 mb-4">
                    <v-flex xs6>
                        <div class="text__label_small mb-3">Key Financial Products</div>
                        <div v-if="item['Кредитование'] === 'True'" class="mb-2">Crediting</div>
                        <div v-if="item['Торговое финансирование'] === 'True'" class="mb-2">Trade Financing</div>
                        <div v-if="item['Инвестиционное и проектное финансирование'] === 'True'" class="mb-2">Investment
                            and Project Financing
                        </div>
                        <div v-if="item['Банковские гарантии'] === 'True'" class="mb-2">Bank Guarantees</div>
                        <div v-if="item['Факторинг'] === 'True'" class="mb-2">Factoring</div>
                        <div v-if="item['Лизинг'] === 'True'" class="mb-2">Leasing</div>
                    </v-flex>
                    <v-flex xs6>
                        <div class="text__label_small mb-3">Financing Industries</div>
                        <v-layout row wrap>
                            <v-flex
                                    xs6
                                    v-for="industry in finIndustries"
                                    :key="industry.entityInstancePk.entityInstanceId"
                                    class="mb-3"
                            >
                                <v-layout align-center>
                                    <v-avatar :size="40"
                                              v-if="getIndustryIcon(industry.entityInstancePk.entityInstanceId)">
                                        <img :src="getIndustryIcon(industry.entityInstancePk.entityInstanceId)"
                                             alt="avatar">
                                    </v-avatar>
                                    <div class="text__label_tiny ml-2">{{industry.entityDesc}}</div>

                                </v-layout>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout class="mt-4 mb-4">
                    <v-flex xs3>
                        <div class="text__label_small mb-3">Amount of Authorized Capital (USD)</div>
                        <div>$ {{item['Размер уставного капитала (USD)'] | bigNumber}}</div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text__label_small mb-3">Licence Number</div>
                        <div>{{item['Номер лицензии']}}</div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text__label_small mb-3">Major Shareholders</div>
                        <v-layout
                                align-center
                                v-if="item['Бенефициары']"
                                style="cursor: pointer;"
                                @click="downloadFile(item['Бенефициары'])"
                        >
                            <v-avatar size="20" tile class="mr-3">
                                <v-img :src="downloadBlueIcon" contain alt="download"></v-img>
                            </v-avatar>
                            <span class="title__label" style="opacity: 1; font-weight:400; color: #0f7acd">Shareholders list</span>
                        </v-layout>
                    </v-flex>
                    <!--</v-flex>-->
                    <v-flex xs3>
                        <div class="text__label_small mb-3">Ratings</div>
                        <div>{{item['Рейтинги']}}</div>
                    </v-flex>
                </v-layout>
            </template>
            <template v-if="companyType === 'Development Institute'">
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout class="mt-4 mb-4">
                    <v-flex xs6>
                        <div class="text__label_small mb-3">Key Financial Products</div>
                        <div v-if="item['Кредитование'] === 'True'" class="mb-2">Crediting</div>
                        <div v-if="item['Торговое финансирование'] === 'True'" class="mb-2">Trade Financing</div>
                        <div v-if="item['Инвестиционное и проектное финансирование'] === 'True'" class="mb-2">Investment
                            and Project Financing
                        </div>
                        <div v-if="item['Банковские гарантии'] === 'True'" class="mb-2">Bank Guarantees</div>
                        <div v-if="item['Факторинг'] === 'True'" class="mb-2">Factoring</div>
                        <div v-if="item['Лизинг'] === 'True'" class="mb-2">Leasing</div>
                    </v-flex>
                    <v-flex xs6>
                        <div class="text__label_small mb-3">Financing Industries</div>
                        <v-layout row wrap>
                            <v-flex
                                    xs6
                                    v-for="industry in finIndustries"
                                    :key="industry.entityInstancePk.entityInstanceId"
                                    class="mb-3"
                            >
                                <v-layout align-center>
                                    <v-avatar :size="40"
                                              v-if="getIndustryIcon(industry.entityInstancePk.entityInstanceId)">
                                        <img :src="getIndustryIcon(industry.entityInstancePk.entityInstanceId)"
                                             alt="avatar">
                                    </v-avatar>
                                    <div class="text__label_tiny ml-2">{{industry.entityDesc}}</div>

                                </v-layout>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout class="mt-4 mb-4">
                    <v-flex xs3>
                        <div class="text__label_small mb-3">Type of Ownership</div>
                        <div style="text-transform: capitalize;">{{item['Вид собственности']}}</div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text__label_small mb-3">TIN</div>
                        <div>{{item['ИНН']}}</div>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text__label_small mb-3">Major Shareholders</div>
                        <v-layout
                                align-center
                                v-if="item['Бенефициары']"
                                style="cursor: pointer;"
                                @click="downloadFile(item['Бенефициары'])"
                        >
                            <v-avatar size="20" tile class="mr-3">
                                <v-img :src="downloadBlueIcon" contain alt="download"></v-img>
                            </v-avatar>
                            <span class="title__label" style="opacity: 1; font-weight:400; color: #0f7acd">Shareholders list</span>
                        </v-layout>
                    </v-flex>
                    <v-flex xs3>
                        <div class="text__label_small mb-3">Ratings</div>
                        <div>{{item['Рейтинги']}}</div>
                    </v-flex>
                </v-layout>
            </template>
            <template v-if="item['Портфолио с проектами']">
                <v-divider class="my-5 v-divider--extend"></v-divider>
                <v-layout>
                    <v-flex>
                        <div class="text__label_small mb-3">Project Portfolio</div>
                        <v-layout
                                align-center
                                style="cursor: pointer;"
                                @click="downloadFile(item['Портфолио с проектами'])"
                        >
                            <v-avatar size="20" tile class="mr-3">
                                <v-img :src="downloadBlueIcon" contain alt="download"></v-img>
                            </v-avatar>
                            <span class="title__label" style="opacity: 1; font-weight:400; color: #0f7acd">Download Portfolio</span>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </template>
        </v-card-text>


    </v-card>
</template>

<script>
    import _ from 'lodash';
    import {mapGetters} from 'vuex';
    import FileMixin from '~/mixins/common/FileMixin';
    import LinkMixin from '~/mixins/common/LinkMixin';
    import ItemMixin from '~/mixins/card/CardItemMixin';

    export default {
        name: 'company-card',
        mixins: [FileMixin, LinkMixin, ItemMixin],
        data: () => ({
            defaultImg: `${process.env.base}/img/company/fund_bg.png`,
            defaultCompanyBg: `${process.env.base}/img/company/companyBg.svg`,
            defaultFsueBg: `${process.env.base}/img/company/fsueBg.svg`,
            defaultInvestorBg: `${process.env.base}/img/company/investorBg.svg`,
            downloadIcon: `${process.env.base}img/icons/download_white.svg`,
            downloadBlueIcon: `${process.env.base}img/icons/download_blue.svg`,
            DDIcon: `${process.env.base}/img/icons/dd_icon.png`,
            PPPIcon: `${process.env.base}/img/icons/ppp_icon.png`,
            requestDlg: false,
            askQuestionDlg: false,
            hideRequestSubmitButton: false,
            hideAskQuestionSubmitButton: false
        }),
        computed: {
            ...mapGetters({
                storeIndustries: 'site/industryList'
            }),
            companyType () {
                return this.item['Тип инвестора'] || this.item['Тип профиля'];
            },
            companyBg () {
                const img = this.item['Фоновая картинка'];
                if (img && img.split('://')[1]) {
                    return `${process.env.apiBase}/img/${img.split('://')[1]}`;
                }
                switch (this.companyType) {
                    case 'Commercial organization':
                        return this.defaultCompanyBg;
                    case 'Investor or bank':
                        return this.defaultInvestorBg;
                    case 'Federal state unitary enterprise':
                        return this.defaultFsueBg;
                }
                return this.defaultImg;
            },
            finIndustries () {
                if (this.item['Приоритетные отрасли финансирования']) {
                    return this.item['Приоритетные отрасли финансирования'];
                }
                return [];
            },
            childCompanies () {
                if (this.item.__childrens) {
                    return this.item.__childrens;
                }
                return [];
            },
            parentCompany () {
                return this.item['Головная компания'];
            },
            companyIcon () {
                if (this.entityIcon && this.entityIcon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${this.entityIcon.split('://')[1]}`;
                }
                return '';
            },

            region () {
                return this.item['Регион'].entityDesc;
            },
            fsueRegionImg () {
                const fsueImg = this.item['Карта региона'];
                if (fsueImg && fsueImg.split('://')[1]) {
                    return `${process.env.apiBase}/img/${fsueImg.split('://')[1]}`;
                }
                return '';
            }
        },
        methods: {
            getIcon (icon) {
                if (icon && icon.split('://')[1]) {
                    return `${process.env.apiBase}/img/${icon.split('://')[1]}`;
                }
                return '';
            },
            getIndustryIcon (industryId) {
                console.log(`[getIndustryIcons] Getting icon for ${industryId}`);
                console.dir(_.find(this.storeIndustries, {value: industryId}));
                const industryIcon = _.get(_.find(this.storeIndustries, {value: industryId}), 'icon', '');
                return industryIcon;
            },
            apply (dlg) {
                console.log(`[ProjectInfoBlock] Apply for ${dlg}!`);
                this[`${dlg}Dlg`] = true;
                setTimeout(() => {
                    this.$refs[dlg].onResize();
                }, 300);
            }
        }
    };
</script>

<style lang="stylus" scoped>
    .company-card
        &__banner
            padding 24px
            min-height 324px;

        &__body
            padding 24px 50px
            @media only screen and (max-width: 1264px)
                padding 24px 16px

</style>
