import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/HomeView.vue';
const SobreNosotros = () => import('@/components/SobreNosotros.vue');
const servicios = () => import('@/components/servicios.vue');
const vinyl = () => import('@/components/vinyl.vue');
const beta = () => import('@/components/beta.vue');
const plotear = () => import('@/components/plotear.vue');
const equipo = () => import('@/components/equipo.vue');
const fotos = () => import('@/components/fotos.vue');
const clientes = () => import('@/components/clientes.vue');
const ventas = () => import('@/components/ventas.vue');
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/sobre-nosotros',
        name: 'SobreNosotros',
        component: SobreNosotros
    },
    {
        path: '/servicios',
        name: 'servicios',
        component: servicios
    },
    {
        path: '/vinyl',
        name: 'viny',
        component: vinyl
    },
    {
        path: '/beta',
        name: 'beta',
        component: beta
    },
    {
        path: '/plotear',
        name: 'plotear',
        component: plotear
    },
    {
        path: '/equipo',
        name: 'equipo',
        component: equipo
    },
    {
        path: '/fotos',
        name: 'fotos',
        component: fotos
    },
    {
        path: '/clientes',
        name: 'clientes',
        component: clientes
    },
    {
        path: '/ventas',
        name: 'ventas',
        component: ventas
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});
router.beforeEach((to, from, next) => {
    const usuario = localStorage.getItem('sesion_usuario');
    if (to.meta.requiresAuth && !usuario) {
        next('/clientes');
        return;
    }
    next();
});
export default router;
