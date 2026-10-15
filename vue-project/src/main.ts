import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Footer from './components/Footer.vue'
import '@/assets/base.css'

createApp(App).component('SiteFooter', Footer).use(router).mount('#app')
