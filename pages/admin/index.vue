<template>
    <app></app>
</template>


<script>
    import App from '~/components/App';

    export default {
        name: 'admin-index-page',
        layout: 'admin',
        components: {App},
        async fetch (context) {
            const {store} = context;
            const desktopStatus = store.getters['desktop/getDesktopLoadStatus'];
            const rolesArr = store.getters['login/getRoles'];
            console.log(`[admin/index] fetch start! Desktop load status = ${desktopStatus}`);
            console.dir(rolesArr);
            if ((desktopStatus === 'INITIAL') || (desktopStatus === 'ERROR')) {
                console.log('[admin/index] Desktop doesn\'t loaded yet, loading...');
                await store.dispatch('desktop/getDesktop', rolesArr);
            }
            const defaultLayoutId = store.getters['desktop/getDefaultLayoutSlug'];
            const desktopLayouts = store.getters['desktop/loadedLayoutsList'] || [];
            const slug = defaultLayoutId || desktopLayouts[0] || '';
            console.log(`[admin/index] Redirecting to 'admin/${slug}'`);
            context.redirect(`/admin/${slug}`);
        }
    };
</script>

<style scoped>

</style>
