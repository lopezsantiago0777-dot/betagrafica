import { ref, onMounted, onBeforeUnmount } from 'vue';
const isScrolled = ref(false);
const isMenuOpen = ref(false);
const currentSlide = ref(0);
let observer;
let carouselTimer = null;
const slides = [
    {
        id: 'inicio',
        type: 'video',
        eyebrow: 'BETA GRÁFICA',
        title: 'INDUSTRIA GRÁFICA',
        description: 'Soluciones gráficas integrales con precisión micrométrica',
        buttonText: '',
        buttonLink: '/'
    },
    {
        id: 'nosotros',
        type: 'image',
        image: 'fondonosotros.jpeg',
        eyebrow: 'SOBRE NOSOTROS',
        title: 'Calidad que se ve.',
        description: 'Calidad premium y precisión milimétrica en cada impresión desde 1997.',
        buttonText: 'Conozca la Empresa',
        buttonLink: '/beta'
    },
    {
        id: 'servicios',
        type: 'image',
        image: 'fondoploteados.jpeg',
        eyebrow: 'SERVICIOS CORPORATIVOS',
        title: 'Precisión en cada detalle.',
        description: 'Ingeniería en ploteado, corte computarizado y montaje industrial.',
        buttonText: 'Explorar Servicios',
        buttonLink: '/plotear'
    },
    {
        id: 'portfolio',
        type: 'image',
        image: 'fondocontacto.jpeg',
        eyebrow: 'PORTFOLIO DE PROYECTOS',
        title: 'Proyectos que hablan por nosotros.',
        description: 'Garantía visual de nuestros desarrollos en campo.',
        buttonText: 'Ver Trabajos',
        buttonLink: '/fotos'
    },
    {
        id: 'pisos-1',
        type: 'image',
        image: 'pisos.jpeg',
        eyebrow: 'EQUIPAMIENTOS COHESIVOS',
        title: 'Superficies diseñadas para durar.',
        description: 'Revestimientos y soluciones de alta durabilidad.',
        buttonText: 'Ver Catálogo',
        buttonLink: '/ventas'
    },
    {
        id: 'pisos-2',
        type: 'image',
        image: 'pisos 2.jpeg',
        eyebrow: 'ALTO TRÁNSITO',
        title: 'Resistencia industrial.',
        description: 'Soluciones pensadas para soportar las condiciones más exigentes.',
        buttonText: 'Ver Catálogo',
        buttonLink: '/ventas'
    },
    {
        id: 'pisos-3',
        type: 'image',
        image: 'pisos (9).jpeg',
        eyebrow: 'DISEÑO ESPECIAL',
        title: 'Diseño que transforma espacios.',
        description: 'Terminaciones especiales adaptadas a cada proyecto.',
        buttonText: 'Ver Catálogo',
        buttonLink: '/ventas'
    },
    {
        id: 'pisos-4',
        type: 'image',
        image: 'pisos (7).jpeg',
        eyebrow: 'REVESTIMIENTOS PREMIUM',
        title: 'Terminaciones de alto nivel.',
        description: 'Revestimientos premium para proyectos que requieren máxima calidad.',
        buttonText: 'Ver Catálogo',
        buttonLink: '/ventas'
    }
];
const handleScroll = () => {
    isScrolled.value = window.scrollY > 40;
};
function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
}
function closeMenu() {
    isMenuOpen.value = false;
}
function nextSlide() {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
    restartCarousel();
}
function previousSlide() {
    currentSlide.value =
        (currentSlide.value - 1 + slides.length) % slides.length;
    restartCarousel();
}
function goToSlide(index) {
    currentSlide.value = index;
    restartCarousel();
}
function startCarousel() {
    carouselTimer = setInterval(() => {
        currentSlide.value = (currentSlide.value + 1) % slides.length;
    }, 6500);
}
function restartCarousel() {
    if (carouselTimer) {
        clearInterval(carouselTimer);
    }
    startCarousel();
}
function makeImageSrc(fileName) {
    return '/imagenes/' + encodeURIComponent(fileName);
}
onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    startCarousel();
    observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -20px 0px'
    });
    document
        .querySelectorAll('.fade-in')
        .forEach(el => observer.observe(el));
});
onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
    if (observer) {
        observer.disconnect();
    }
    if (carouselTimer) {
        clearInterval(carouselTimer);
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)({
    ...{ class: "main-carousel" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "carousel-background" },
});
for (const [slide, index] of __VLS_getVForSourceType((__VLS_ctx.slides))) {
    // @ts-ignore
    [slides,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: (slide.id),
        ...{ class: "carousel-slide" },
        ...{ class: ({ active: __VLS_ctx.currentSlide === index }) },
    });
    // @ts-ignore
    [currentSlide,];
    if (slide.type === 'video') {
        __VLS_asFunctionalElement(__VLS_elements.video, __VLS_elements.video)({
            autoplay: true,
            muted: true,
            loop: true,
            playsinline: true,
            ...{ class: "carousel-media" },
        });
        __VLS_asFunctionalElement(__VLS_elements.source)({
            src: "/imagenes/videobeta.mp4",
            type: "video/mp4",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.img)({
            src: (__VLS_ctx.makeImageSrc(slide.image ?? '')),
            alt: (slide.title),
            ...{ class: "carousel-media" },
        });
        // @ts-ignore
        [makeImageSrc,];
    }
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "carousel-overlay" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "carousel-content" },
});
const __VLS_0 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "content-fade",
    mode: "out-in",
}));
const __VLS_2 = __VLS_1({
    name: "content-fade",
    mode: "out-in",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    key: (__VLS_ctx.slides[__VLS_ctx.currentSlide].id),
    ...{ class: "slide-info" },
});
// @ts-ignore
[slides, currentSlide,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "slide-number" },
});
(String(__VLS_ctx.currentSlide + 1).padStart(2, '0'));
(String(__VLS_ctx.slides.length).padStart(2, '0'));
// @ts-ignore
[slides, currentSlide,];
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
(__VLS_ctx.slides[__VLS_ctx.currentSlide].eyebrow);
// @ts-ignore
[slides, currentSlide,];
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
(__VLS_ctx.slides[__VLS_ctx.currentSlide].title);
// @ts-ignore
[slides, currentSlide,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
(__VLS_ctx.slides[__VLS_ctx.currentSlide].description);
// @ts-ignore
[slides, currentSlide,];
if (__VLS_ctx.slides[__VLS_ctx.currentSlide].buttonText) {
    // @ts-ignore
    [slides, currentSlide,];
    const __VLS_5 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    RouterLink;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        to: (__VLS_ctx.slides[__VLS_ctx.currentSlide].buttonLink),
        ...{ class: "carousel-button" },
    }));
    const __VLS_7 = __VLS_6({
        to: (__VLS_ctx.slides[__VLS_ctx.currentSlide].buttonLink),
        ...{ class: "carousel-button" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const { default: __VLS_9 } = __VLS_8.slots;
    // @ts-ignore
    [slides, currentSlide,];
    (__VLS_ctx.slides[__VLS_ctx.currentSlide].buttonText);
    // @ts-ignore
    [slides, currentSlide,];
    var __VLS_8;
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.previousSlide) },
    ...{ class: "carousel-arrow carousel-arrow-left" },
    'aria-label': "Imagen anterior",
});
// @ts-ignore
[previousSlide,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.nextSlide) },
    ...{ class: "carousel-arrow carousel-arrow-right" },
    'aria-label': "Imagen siguiente",
});
// @ts-ignore
[nextSlide,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "carousel-dots" },
});
for (const [slide, index] of __VLS_getVForSourceType((__VLS_ctx.slides))) {
    // @ts-ignore
    [slides,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.goToSlide(index);
                // @ts-ignore
                [goToSlide,];
            } },
        key: (slide.id),
        ...{ class: "carousel-dot" },
        ...{ class: ({ active: __VLS_ctx.currentSlide === index }) },
        'aria-label': (`Ir a slide ${index + 1}`),
    });
    // @ts-ignore
    [currentSlide,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "scroll-indicator" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
/** @type {__VLS_StyleScopedClasses['main-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-background']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-slide']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-media']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-media']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-content']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-info']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-button']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-arrow-left']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-arrow-right']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-dots']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-indicator']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        currentSlide: currentSlide,
        slides: slides,
        nextSlide: nextSlide,
        previousSlide: previousSlide,
        goToSlide: goToSlide,
        makeImageSrc: makeImageSrc,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
