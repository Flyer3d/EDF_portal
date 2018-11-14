<template>
  <div tile :size="64" class="avk-logo">
    <img class="avk-logo__image" :src=imgSrc />
  </div>
</template>

<script>
  export default {
      data () {
          return {
              imgSrc: `${process.env.base}/img/logo/avklogo.png`
          };
      }
  };
</script>

<style lang="stylus">
  .avk-logo
    height auto
    cursor pointer
    .avk-logo
      &__image
        width 70px
        height auto
        position relative
        left -8px

</style>
