<template>
    <div class="simple-html-block">
        <h2 v-if="data.title" class="simple-html-block__title">{{data.title}}</h2>
        <h3 v-if="data.subtitle" class="simple-text-block__subtitle">{{data.subtitle}}</h3>
        <div v-html="data.html" class="simple-html-block__text html-container ql-editor"></div>
    </div>
</template>

<script>
    export default {
        name: 'simple-text-block',
        props: {
            data: {
                type: Object,
                required: true
            }
        }
    };
</script>

<style lang="stylus">
    @import "../../assets/style/html.styl"

    .simple-html-block
        .simple-html-block
            &__title
                text-align: center
                margin-top 1em

            &__subtitle
                margin-top 0.5em
                text-align: center

            &__text
                margin-top 0.5em



</style>
