const config = require('yaml-config');
// const _ = require('lodash');
const gui = config.readConfig('./config/gui.yaml', 'ru');

// const roles = [ 'pages', 'admin' ];

var title, apiBase, base;
if (process.env.TARGET === 'commission') {
    title = 'Рабочее место';
    apiBase = 'http://178.208.147.158:49999/api';
    base = '/comission/';
} else if (process.env.TARGET === 'supp') {
    title = 'AVK Коммьюникейшнз. Служба поддержки';
    apiBase = 'http://localhost:5000/api';
    // apiBase = 'http://192.168.137.93:5000/api';
    // apiBase = 'http://5.8.181.27:5000/api';
    // apiBase = 'https://wbifund.org:5001/api';
    // apiBase = 'http://178.208.147.158:49998/api';
    base = '/supp/';
} else if (process.env.TARGET === 'wbif') {
    title = 'WBI Fund portal';
    apiBase = 'https://5.8.181.27:5001/api';
    base = '/portal/';
} else {
    title = 'AVK Коммьюникейшнз. Тестовая платформа';
    // apiBase = 'http://localhost:5000/api';
    apiBase = 'http://178.208.147.158:49998/api';
    base = '';
}

module.exports = {
    mode: 'spa',
    loadingIndicator: {
        name: 'rotating-plane',
        color: '#0f7acd',
        background: '#f3f4f8'
    },
    /*
    ** Router config
    */
    router: {
        middleware: 'check-auth',
        base: base // ,
        // extendRoutes (routes, resolve) {
        //     routes.push({
        //         path: `/default`,
        //         name: `default`,
        //         component: resolve(__dirname, `pages/index.vue`)
        //     });
        //     routes.push({
        //         path: `/default/*`,
        //         name: `default_all`,
        //         component: resolve(__dirname, `pages/index.vue`)
        //     });
        //     roles.forEach((role) => {
        //         routes.push({
        //             path: `/${role}/*`,
        //             name: `${role}_all`,
        //             component: resolve(__dirname, `pages/${role}.vue`),
        //             payload: () => role
        //         });
        //     });
        // }
    },
    // Environment variables
    env: {
        title,
        apiBase,
        gui,
        base,
        // Настройка внешнего вида
        maxDialogsWidth: 900,
        minColumnWidth: 400 // Минимальная ширина для полей
    },
    /*
    ** NUXT modules
    */
    modules: [
        '@nuxtjs/dotenv',
        '@nuxtjs/axios'
    ],
    axios: {
        debug: true,
        baseURL: apiBase
    },
    /*
    ** Headers of the page
    */
    head: {
        title,
        script: [
            { src: base ? base + 'polyfill.min.js' : '/polyfill.min.js' }
        ],
        meta: [
            {charset: 'utf-8'},
            {name: 'viewport', content: 'width=device-width, initial-scale=1'},
            {hid: 'description', name: 'description', content: title}
        ],
        link: [
            {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
            {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&amp;subset=cyrillic'},
            {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Rubik:300,400,500,700&amp;subset=cyrillic'},
            {rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons'},
            {rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'}
        ]
    },
    plugins: [
        '~/plugins/vuetify.js',
        '~/plugins/gmaps.js',
        '~/plugins/filters.js',
        { src: '~plugins/nuxt-codemirror-plugin.js', ssr: false }
    ],
    css: [
        '~assets/style/app.styl',
        // lib css
        'codemirror/lib/codemirror.css'
        // // merge css
        // 'codemirror/addon/merge/merg.css',
        // theme css
        // 'codemirror/theme/base16-light.css'
    ],
    /*
    ** Customize the progress bar color
    */
    // loading: {color: '#3B8070'},
    loading: {
        name: 'chasing-dots',
        color: '#0f7acd',
        background: '#aaa',
        height: '4px'
    },
    /*
    ** Build configuration
    */
    build: {
        extractCSS: true,
        transpile: [/^vue2-google-maps($|\/)/]
    }
};
