<template>
    <app />
</template>


<script>
    import App from '~/components/App';

    export default {
        name: 'admin-slug-page',
        layout: 'admin',
        validate ({ params }) {
            console.log('[admin/_slug] Validating slug');
            return Boolean(params.slug);
        },
        components: {App}
    };
</script>

<style scoped>

</style>
