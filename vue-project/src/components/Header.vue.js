import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const isScrolled = ref(false);
const isMenuOpen = ref(false);
const isLoggedIn = ref(false);
const profileMenuOpen = ref(false);
const usuario = ref({});
/* =========================================================
   SCROLL
========================================================= */
const handleScroll = () => {
    isScrolled.value = window.scrollY > 40;
};
/* =========================================================
   SESIÓN
========================================================= */
const checkSession = () => {
    const token = localStorage.getItem('token');
    const sesion = localStorage.getItem('sesion_usuario');
    if (!token || !sesion) {
        isLoggedIn.value = false;
        usuario.value = {};
        profileMenuOpen.value = false;
        return;
    }
    try {
        const data = JSON.parse(sesion);
        if (!data || typeof data !== 'object') {
            throw new Error('Sesión inválida');
        }
        usuario.value = data;
        isLoggedIn.value = true;
    }
    catch {
        localStorage.removeItem('token');
        localStorage.removeItem('sesion_usuario');
        isLoggedIn.value = false;
        usuario.value = {};
        profileMenuOpen.value = false;
    }
};
/* =========================================================
   MENÚ
========================================================= */
function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
}
function closeMenu() {
    isMenuOpen.value = false;
}
/* =========================================================
   PERFIL
========================================================= */
function toggleProfileMenu() {
    profileMenuOpen.value = !profileMenuOpen.value;
}
/* =========================================================
   DASHBOARD
========================================================= */
function goToDashboard() {
    profileMenuOpen.value = false;
    closeMenu();
    router.push('/ventas');
}
/* =========================================================
   LOGOUT
========================================================= */
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('sesion_usuario');
    isLoggedIn.value = false;
    usuario.value = {};
    profileMenuOpen.value = false;
    closeMenu();
    window.dispatchEvent(new Event('auth-changed'));
    router.push('/');
}
/* =========================================================
   MOUNT
========================================================= */
onMounted(() => {
    handleScroll();
    checkSession();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('auth-changed', checkSession);
    window.addEventListener('storage', checkSession);
});
/* =========================================================
   UNMOUNT
========================================================= */
onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('auth-changed', checkSession);
    window.removeEventListener('storage', checkSession);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-img']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['router-link-active']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-cta']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-cta']} */ ;
/** @type {__VLS_StyleScopedClasses['user-button']} */ ;
/** @type {__VLS_StyleScopedClasses['user-button']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-info']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-info']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-action']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-action']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-action']} */ ;
/** @type {__VLS_StyleScopedClasses['logout']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['router-link-active']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-cta']} */ ;
/** @type {__VLS_StyleScopedClasses['user-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['user-button']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['scrolled']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-img']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-img']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: (['header', { scrolled: __VLS_ctx.isScrolled }]) },
});
// @ts-ignore
[isScrolled,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "container header-flex" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/",
    ...{ class: "logo" },
    'aria-label': "Ir a inicio",
}));
const __VLS_2 = __VLS_1({
    to: "/",
    ...{ class: "logo" },
    'aria-label': "Ir a inicio",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: "/imagenes/betalogo.png",
    alt: "Logo Beta Gráfica",
    ...{ class: "logo-img" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "logo-main" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "logo-secondary" },
});
var __VLS_3;
__VLS_asFunctionalElement(__VLS_elements.nav, __VLS_elements.nav)({
    ...{ class: "nav-menu" },
});
__VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({
    ...{ class: ({ open: __VLS_ctx.isMenuOpen }) },
});
// @ts-ignore
[isMenuOpen,];
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
const __VLS_5 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ 'onClick': {} },
    to: "/",
}));
const __VLS_7 = __VLS_6({
    ...{ 'onClick': {} },
    to: "/",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_9;
let __VLS_10;
const __VLS_11 = ({ click: {} },
    { onClick: (__VLS_ctx.closeMenu) });
const { default: __VLS_12 } = __VLS_8.slots;
// @ts-ignore
[closeMenu,];
var __VLS_8;
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
const __VLS_13 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    ...{ 'onClick': {} },
    to: "/beta",
}));
const __VLS_15 = __VLS_14({
    ...{ 'onClick': {} },
    to: "/beta",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_17;
let __VLS_18;
const __VLS_19 = ({ click: {} },
    { onClick: (__VLS_ctx.closeMenu) });
const { default: __VLS_20 } = __VLS_16.slots;
// @ts-ignore
[closeMenu,];
var __VLS_16;
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
const __VLS_21 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onClick': {} },
    to: "/vinyl",
}));
const __VLS_23 = __VLS_22({
    ...{ 'onClick': {} },
    to: "/vinyl",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
const __VLS_27 = ({ click: {} },
    { onClick: (__VLS_ctx.closeMenu) });
const { default: __VLS_28 } = __VLS_24.slots;
// @ts-ignore
[closeMenu,];
var __VLS_24;
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
const __VLS_29 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ 'onClick': {} },
    to: "/plotear",
}));
const __VLS_31 = __VLS_30({
    ...{ 'onClick': {} },
    to: "/plotear",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
const __VLS_35 = ({ click: {} },
    { onClick: (__VLS_ctx.closeMenu) });
const { default: __VLS_36 } = __VLS_32.slots;
// @ts-ignore
[closeMenu,];
var __VLS_32;
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
const __VLS_37 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    ...{ 'onClick': {} },
    to: "/equipo",
}));
const __VLS_39 = __VLS_38({
    ...{ 'onClick': {} },
    to: "/equipo",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_41;
let __VLS_42;
const __VLS_43 = ({ click: {} },
    { onClick: (__VLS_ctx.closeMenu) });
const { default: __VLS_44 } = __VLS_40.slots;
// @ts-ignore
[closeMenu,];
var __VLS_40;
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
const __VLS_45 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    ...{ 'onClick': {} },
    to: "/fotos",
}));
const __VLS_47 = __VLS_46({
    ...{ 'onClick': {} },
    to: "/fotos",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
let __VLS_49;
let __VLS_50;
const __VLS_51 = ({ click: {} },
    { onClick: (__VLS_ctx.closeMenu) });
const { default: __VLS_52 } = __VLS_48.slots;
// @ts-ignore
[closeMenu,];
var __VLS_48;
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({});
const __VLS_53 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    ...{ 'onClick': {} },
    to: "/ventas",
}));
const __VLS_55 = __VLS_54({
    ...{ 'onClick': {} },
    to: "/ventas",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
let __VLS_57;
let __VLS_58;
const __VLS_59 = ({ click: {} },
    { onClick: (__VLS_ctx.closeMenu) });
const { default: __VLS_60 } = __VLS_56.slots;
// @ts-ignore
[closeMenu,];
var __VLS_56;
if (!__VLS_ctx.isLoggedIn) {
    // @ts-ignore
    [isLoggedIn,];
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
        ...{ class: "nav-cta" },
    });
    const __VLS_61 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    RouterLink;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        ...{ 'onClick': {} },
        to: "/clientes",
    }));
    const __VLS_63 = __VLS_62({
        ...{ 'onClick': {} },
        to: "/clientes",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = ({ click: {} },
        { onClick: (__VLS_ctx.closeMenu) });
    const { default: __VLS_68 } = __VLS_64.slots;
    // @ts-ignore
    [closeMenu,];
    var __VLS_64;
}
else {
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
        ...{ class: "user-nav" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.toggleProfileMenu) },
        ...{ class: "user-button" },
        'aria-label': "Abrir menú de usuario",
        'aria-expanded': (__VLS_ctx.profileMenuOpen),
    });
    // @ts-ignore
    [toggleProfileMenu, profileMenuOpen,];
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.6-9 6v2h18v-2c0-3.4-4-6-9-6Z",
    });
    const __VLS_69 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    Transition;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        name: "profile-menu",
    }));
    const __VLS_71 = __VLS_70({
        name: "profile-menu",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    const { default: __VLS_73 } = __VLS_72.slots;
    if (__VLS_ctx.profileMenuOpen) {
        // @ts-ignore
        [profileMenuOpen,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "profile-dropdown" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "profile-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mini-avatar" },
        });
        ((__VLS_ctx.usuario.nombre || 'U').charAt(0).toUpperCase());
        // @ts-ignore
        [usuario,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "profile-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.usuario.nombre || 'Usuario');
        // @ts-ignore
        [usuario,];
        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
        (__VLS_ctx.usuario.email || '');
        // @ts-ignore
        [usuario,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.goToDashboard) },
            ...{ class: "profile-action" },
        });
        // @ts-ignore
        [goToDashboard,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "action-icon" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.handleLogout) },
            ...{ class: "profile-action logout" },
        });
        // @ts-ignore
        [handleLogout,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "action-icon" },
        });
    }
    var __VLS_72;
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleMenu) },
    ...{ class: "mobile-toggle" },
    ...{ class: ({ active: __VLS_ctx.isMenuOpen }) },
    'aria-label': "Abrir menú",
    'aria-expanded': (__VLS_ctx.isMenuOpen),
});
// @ts-ignore
[isMenuOpen, isMenuOpen, toggleMenu,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
/** @type {__VLS_StyleScopedClasses['scrolled']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-img']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-main']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-cta']} */ ;
/** @type {__VLS_StyleScopedClasses['user-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['user-button']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-header']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-info']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-action']} */ ;
/** @type {__VLS_StyleScopedClasses['action-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-action']} */ ;
/** @type {__VLS_StyleScopedClasses['logout']} */ ;
/** @type {__VLS_StyleScopedClasses['action-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        isScrolled: isScrolled,
        isMenuOpen: isMenuOpen,
        isLoggedIn: isLoggedIn,
        profileMenuOpen: profileMenuOpen,
        usuario: usuario,
        toggleMenu: toggleMenu,
        closeMenu: closeMenu,
        toggleProfileMenu: toggleProfileMenu,
        goToDashboard: goToDashboard,
        handleLogout: handleLogout,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
