<template>
    <v-layout column class="avk-contacts">
        <v-flex class="avk-contacts__phone"><a href="tel:74954520548">+7(495) 452-05-48</a></v-flex>
        <v-flex class="avk-contacts__phone"><a href="tel:79033635787">+7(903) 363-57-87</a></v-flex>
        <v-flex class="avk-contacts__email"><a href="mailto:baasservise@bk.ru">baasservise@bk.ru</a></v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'avk-contacts'
    };
</script>

<style lang="stylus">
    .avk-contacts
        font-size 18px
        font-weight: 400
        text-align right

        a
            text-decoration none
            color: #333

</style>
