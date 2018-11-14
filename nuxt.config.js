const config = require('yaml-config');
const gui = config.readConfig('./config/gui.yaml', 'ru');

var title = 'Code demo';
var apiBase = 'http://XXX.XXX.XXX.XXX:XXXXX/api';
var base = '/';

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
        base: base
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
