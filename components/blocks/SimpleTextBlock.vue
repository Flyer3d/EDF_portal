<template>
    <div class="simple-text-block">
        <h2 v-if="data.title" class="simple-text-block__title">{{data.title}}</h2>
        <h3 v-if="data.subtitle" class="simple-text-block__subtitle">{{data.subtitle}}</h3>
        <p v-html="data.text" class="simple-text-block__text html-content html-container"></p>
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
    .simple-text-block
        .simple-text-block
            &__title
                text-align: center
                margin-top 1em

            &__subtitle
                margin-top 0.5em
                text-align: center

            &__text
                margin-top 0.5em
                text-indent 2em


</style>
