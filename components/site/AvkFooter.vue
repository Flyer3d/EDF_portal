<template>
  <div class="avk-footer">
    <div class="section">
      <v-layout row wrap>
        <v-flex md3 sm6 xs12 class="avk-footer__logo">
          <baas-logo/>
        </v-flex>
        <v-spacer></v-spacer>
      </v-layout>
      <v-layout row wrap class="mt-3 text-white">
        <v-flex lg3 md4 sm5 xs12 class="mb-4">
          Мы специализируемся на разработке веб-систем для туристической отрасли.
          Для нас важно создавать решения, повышающие эффективность работы турфирм.
        </v-flex>
        <v-flex lg6 md4 sm2>&nbsp;</v-flex>
        <v-flex lg3 md4 sm5 xs12>
          +7 (495) 225-83-68<br><br>
          info@travelstack.ru<br><br>
          124527, Москва, Зеленоград,<br>
          814 корпус, 6 этаж, офис 11-12
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex class="avk-footer__copyright text-small text-white">
          <span>&copy; 2017-{{now}} АВК Коммьюникейшнз</span>
        </v-flex>
        <v-spacer></v-spacer>
      </v-layout>
    </div>
  </div>
</template>

<script>
  import BaasLogo from './BaasLogo';
  import moment from 'moment';

  export default {
      components: {
          BaasLogo
      },
      data () {
          return {
              now: moment().format('YYYY')
          };
      }
  };
</script>

<style lang="stylus">
  .avk-footer
    max-width: 1440px
    margin 0 auto
    padding 40px 16px 80px
    background-image: linear-gradient(104deg, #81cff5, #00a9e2);

    @media all and (max-width: 959px)
      padding 32px 0 32px


    .avk-footer
      &__logo
        text-align left

      &__copyright
        margin-top 40px


</style>
