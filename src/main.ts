import { createApp } from 'vue'
import App from './App.vue'
// import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import "@mdi/font/css/materialdesignicons.css";

loadFonts()

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'dark'
    },
})


import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/login',
        name: 'login',
        component: () => import(/* webpackChunkName: "about" */ './views/HomeView.vue')
    },
    {
        path: '/styles',
        name: 'styles',
        component: () => import(/* webpackChunkName: "about" */ './views/StylesView.vue')
    },
    {
        path: '/line_manage',
        name: 'lineManage',
        component: () => import(/* webpackChunkName: "about" */ './views/LineManageView.vue')
    }
]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
})

createApp(App)
  .use(vuetify).use(router)
  .mount('#app')
