import { ref, onMounted, onBeforeUnmount } from 'vue';
const videoRef = ref(null);
let videoObserver = null;
let revealObserver = null;
onMounted(() => {
    const videoEl = videoRef.value;
    /* ==========================================================
       CARGA DIFERIDA DEL VIDEO
    ========================================================== */
    if (videoEl) {
        videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const source = videoEl.querySelector('source[data-src]');
                    if (source &&
                        source.dataset.src &&
                        !source.src) {
                        source.src = source.dataset.src;
                        videoEl.load();
                    }
                    videoEl.play().catch(() => { });
                    observer.disconnect();
                }
            });
        }, {
            rootMargin: '300px'
        });
        videoObserver.observe(videoEl);
    }
    /* ==========================================================
       ANIMACIONES DE ENTRADA
    ========================================================== */
    const revealElements = document.querySelectorAll('.hero-copy, .hero-visual, .history-section, .video-editorial');
    revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.08
    });
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
});
onBeforeUnmount(() => {
    if (videoObserver) {
        videoObserver.disconnect();
    }
    if (revealObserver) {
        revealObserver.disconnect();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['bg-lines']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-label']} */ ;
/** @type {__VLS_StyleScopedClasses['top-process']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['service-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['target']} */ ;
/** @type {__VLS_StyleScopedClasses['service-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-item']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-text-column']} */ ;
/** @type {__VLS_StyleScopedClasses['editorial-button']} */ ;
/** @type {__VLS_StyleScopedClasses['editorial-button']} */ ;
/** @type {__VLS_StyleScopedClasses['editorial-button']} */ ;
/** @type {__VLS_StyleScopedClasses['editorial-button']} */ ;
/** @type {__VLS_StyleScopedClasses['editorial-button']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['visible']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image']} */ ;
/** @type {__VLS_StyleScopedClasses['history-section']} */ ;
/** @type {__VLS_StyleScopedClasses['visible']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['history-image']} */ ;
/** @type {__VLS_StyleScopedClasses['history-block']} */ ;
/** @type {__VLS_StyleScopedClasses['history-index']} */ ;
/** @type {__VLS_StyleScopedClasses['history-block']} */ ;
/** @type {__VLS_StyleScopedClasses['history-block']} */ ;
/** @type {__VLS_StyleScopedClasses['history-block']} */ ;
/** @type {__VLS_StyleScopedClasses['video-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['visible']} */ ;
/** @type {__VLS_StyleScopedClasses['video-title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['video-title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['video-title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['video-title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['video-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['video-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['ticker']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-links']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-links']} */ ;
/** @type {__VLS_StyleScopedClasses['social-link']} */ ;
/** @type {__VLS_StyleScopedClasses['social-link']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-float']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-float']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-information']} */ ;
/** @type {__VLS_StyleScopedClasses['service-list']} */ ;
/** @type {__VLS_StyleScopedClasses['history-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['about-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['editorial-topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['top-process']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-label']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-information']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-one']} */ ;
/** @type {__VLS_StyleScopedClasses['history-section']} */ ;
/** @type {__VLS_StyleScopedClasses['history-number']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['history-image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['history-image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['video-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['video-title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['video-title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['video-title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['ticker']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-column']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-information']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['history-image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['history-image']} */ ;
/** @type {__VLS_StyleScopedClasses['video-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['history-section']} */ ;
/** @type {__VLS_StyleScopedClasses['video-editorial']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "beta-page" },
});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "about-editorial" },
    id: "about",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "editorial-background" },
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "giant-background-number" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "bg-circle bg-circle-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "bg-circle bg-circle-two" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "bg-lines" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "dot-pattern dots-top" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "dot-pattern dots-bottom" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "diagonal-shadow" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "editorial-topbar" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "chapter-label" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "chapter-dot" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "top-process" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hero-editorial" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hero-copy" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "eyebrow-editorial" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "hero-title" },
});
__VLS_asFunctionalElement(__VLS_elements.br)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hero-introduction" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hero-information" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "service-list" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "service-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "service-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "service-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "service-icon scissors" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "service-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "service-icon target" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hero-text-column" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ class: "editorial-button" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hero-visual" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "image-decoration image-decoration-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "image-decoration image-decoration-two" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hero-image-frame" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hero-image" },
});
__VLS_asFunctionalElement(__VLS_elements.picture, __VLS_elements.picture)({});
__VLS_asFunctionalElement(__VLS_elements.source)({
    type: "image/avif",
    srcset: "\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0070\u006c\u006f\u0074\u0065\u0061\u0064\u006f\u002d\u0034\u0030\u0030\u002e\u0061\u0076\u0069\u0066\u0020\u0034\u0030\u0030\u0077\u002c\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0070\u006c\u006f\u0074\u0065\u0061\u0064\u006f\u002d\u0038\u0030\u0030\u002e\u0061\u0076\u0069\u0066\u0020\u0038\u0030\u0030\u0077\u002c\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0070\u006c\u006f\u0074\u0065\u0061\u0064\u006f\u002d\u0031\u0032\u0030\u0030\u002e\u0061\u0076\u0069\u0066\u0020\u0031\u0032\u0030\u0030\u0077\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020",
    sizes: "(max-width: 768px) 100vw, 55vw",
});
__VLS_asFunctionalElement(__VLS_elements.source)({
    type: "image/webp",
    srcset: "\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0070\u006c\u006f\u0074\u0065\u0061\u0064\u006f\u002d\u0034\u0030\u0030\u002e\u0077\u0065\u0062\u0070\u0020\u0034\u0030\u0030\u0077\u002c\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0070\u006c\u006f\u0074\u0065\u0061\u0064\u006f\u002d\u0038\u0030\u0030\u002e\u0077\u0065\u0062\u0070\u0020\u0038\u0030\u0030\u0077\u002c\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0070\u006c\u006f\u0074\u0065\u0061\u0064\u006f\u002d\u0031\u0032\u0030\u0030\u002e\u0077\u0065\u0062\u0070\u0020\u0031\u0032\u0030\u0030\u0077\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020",
    sizes: "(max-width: 768px) 100vw, 55vw",
});
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: "/imagenes/ploteado.png",
    alt: "Ploteo vehicular en planta",
    loading: "eager",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "image-dark-overlay" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-cross cross-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-cross cross-two" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-circle striped-circle" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-plus" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-square" },
});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "history-section" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-number" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-header" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.br)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-layout" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-image-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-image" },
});
__VLS_asFunctionalElement(__VLS_elements.picture, __VLS_elements.picture)({});
__VLS_asFunctionalElement(__VLS_elements.source)({
    type: "image/avif",
    srcset: "\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0065\u0071\u0075\u0069\u0070\u006f\u0056\u002d\u0034\u0030\u0030\u002e\u0061\u0076\u0069\u0066\u0020\u0034\u0030\u0030\u0077\u002c\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0065\u0071\u0075\u0069\u0070\u006f\u0056\u002d\u0038\u0030\u0030\u002e\u0061\u0076\u0069\u0066\u0020\u0038\u0030\u0030\u0077\u002c\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0065\u0071\u0075\u0069\u0070\u006f\u0056\u002d\u0031\u0032\u0030\u0030\u002e\u0061\u0076\u0069\u0066\u0020\u0031\u0032\u0030\u0030\u0077\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020",
});
__VLS_asFunctionalElement(__VLS_elements.source)({
    type: "image/webp",
    srcset: "\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0065\u0071\u0075\u0069\u0070\u006f\u0056\u002d\u0034\u0030\u0030\u002e\u0077\u0065\u0062\u0070\u0020\u0034\u0030\u0030\u0077\u002c\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0065\u0071\u0075\u0069\u0070\u006f\u0056\u002d\u0038\u0030\u0030\u002e\u0077\u0065\u0062\u0070\u0020\u0038\u0030\u0030\u0077\u002c\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002f\u0069\u006d\u0061\u0067\u0065\u006e\u0065\u0073\u002f\u0065\u0071\u0075\u0069\u0070\u006f\u0056\u002d\u0031\u0032\u0030\u0030\u002e\u0077\u0065\u0062\u0070\u0020\u0031\u0032\u0030\u0030\u0077\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020",
});
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: "/imagenes/equipoV.jpg",
    alt: "Equipamiento Roland",
    loading: "lazy",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-image-border" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-copy" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-block" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "history-index" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-block" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "history-index" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-block" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "history-index" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "history-block" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "history-index" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "video-editorial" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "video-title-area" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "section-number" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.br)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "video-art" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "video-frame" },
});
__VLS_asFunctionalElement(__VLS_elements.video, __VLS_elements.video)({
    ref: "videoRef",
    autoplay: true,
    loop: true,
    muted: true,
    playsinline: true,
    poster: "/imagenes/betalogo.png",
    preload: "metadata",
});
/** @type {typeof __VLS_ctx.videoRef} */ ;
// @ts-ignore
[videoRef,];
__VLS_asFunctionalElement(__VLS_elements.source)({
    'data-src': "/imagenes/videobeta.mp4",
    type: "video/mp4",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "video-overlay" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "video-backdrop" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "ticker-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "ticker" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.footer, __VLS_elements.footer)({
    ...{ class: "footer" },
    id: "contacto",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "container footer-grid" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "footer-brand" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "footer-logo" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.br)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "footer-links" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "footer-title" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "/",
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "/ventas",
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "/beta",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "footer-title" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://wa.me/5493564652137",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "footer-social" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "footer-title" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "social-list" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://www.facebook.com/share/1BDXuPqTHn/",
    target: "_blank",
    'aria-label': "Facebook",
    ...{ class: "social-link" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://www.instagram.com/beta_grafica/?next=%2F",
    target: "_blank",
    'aria-label': "Instagram",
    ...{ class: "social-link" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6.5-8.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM12 2c3.27 0 3.67.01 4.96.07 1.2.05 2.03.25 2.75.53a5.56 5.56 0 0 1 1.99 1.3 5.56 5.56 0 0 1 1.3 1.99c.28.72.48 1.55.53 2.75.06 1.29.07 1.69.07 4.96s-.01 3.67-.07 4.96c-.05 1.2-.25 2.03-.53 2.75a5.56 5.56 0 0 1-1.3 1.99 5.56 5.56 0 0 1-1.99 1.3c-.72.28-1.55.48-2.75.53-1.29.06-1.69.07-4.96.07s-3.67-.01-4.96-.07c-1.2-.05-2.03-.25-2.75-.53a5.56 5.56 0 0 1-1.99-1.3A5.56 5.56 0 0 1 1 19.31c-.28-.72-.48-1.55-.53-2.75C.41 15.27.4 14.87.4 11.6s.01-3.67.07-4.96C.52 5.44.72 4.61 1 3.89a5.56 5.56 0 0 1 1.3-1.99A5.56 5.56 0 0 1 4.29.6C5.01.32 5.84.12 7.04.07 8.33.01 8.73 0 12 0Z",
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://www.tiktok.com/@beta.grafica",
    target: "_blank",
    'aria-label': "TikTok",
    ...{ class: "social-link" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M14 2h3.1c.24 1.8 1.22 3.43 2.73 4.47A8.25 8.25 0 0 0 22 7.38v3.24a11.2 11.2 0 0 1-4.9-1.5v6.03A6.85 6.85 0 1 1 11.15 8.3v3.34a3.5 3.5 0 1 0 2.85 3.44V2Z",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "container footer-bottom" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "copyright" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://wa.me/5493564652137",
    target: "_blank",
    ...{ class: "whatsapp-float" },
    'aria-label': "Contactar por WhatsApp",
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    fill: "currentColor",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.292 1.493 4.741 1.494 5.428 0 9.847-4.41 9.849-9.836.001-2.628-1.02-5.1-2.877-6.96C16.444 1.98 13.974 1.57 12.008 1.57c-5.43 0-9.85 4.41-9.852 9.837-.001 1.812.487 3.591 1.411 5.17l-.953 3.478 3.533-.925zM17.467 14.3c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z",
});
/** @type {__VLS_StyleScopedClasses['beta-page']} */ ;
/** @type {__VLS_StyleScopedClasses['about-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['editorial-background']} */ ;
/** @type {__VLS_StyleScopedClasses['giant-background-number']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-circle-one']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-circle-two']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-lines']} */ ;
/** @type {__VLS_StyleScopedClasses['dot-pattern']} */ ;
/** @type {__VLS_StyleScopedClasses['dots-top']} */ ;
/** @type {__VLS_StyleScopedClasses['dot-pattern']} */ ;
/** @type {__VLS_StyleScopedClasses['dots-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['diagonal-shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['editorial-topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-label']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['top-process']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-information']} */ ;
/** @type {__VLS_StyleScopedClasses['service-list']} */ ;
/** @type {__VLS_StyleScopedClasses['service-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['scissors']} */ ;
/** @type {__VLS_StyleScopedClasses['service-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['target']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-text-column']} */ ;
/** @type {__VLS_StyleScopedClasses['editorial-button']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['image-decoration']} */ ;
/** @type {__VLS_StyleScopedClasses['image-decoration-one']} */ ;
/** @type {__VLS_StyleScopedClasses['image-decoration']} */ ;
/** @type {__VLS_StyleScopedClasses['image-decoration-two']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-image']} */ ;
/** @type {__VLS_StyleScopedClasses['image-dark-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-cross']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-one']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-cross']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-two']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['striped-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-plus']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-square']} */ ;
/** @type {__VLS_StyleScopedClasses['history-section']} */ ;
/** @type {__VLS_StyleScopedClasses['history-number']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['history-image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['history-image']} */ ;
/** @type {__VLS_StyleScopedClasses['history-image-border']} */ ;
/** @type {__VLS_StyleScopedClasses['history-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['history-block']} */ ;
/** @type {__VLS_StyleScopedClasses['history-index']} */ ;
/** @type {__VLS_StyleScopedClasses['history-block']} */ ;
/** @type {__VLS_StyleScopedClasses['history-index']} */ ;
/** @type {__VLS_StyleScopedClasses['history-block']} */ ;
/** @type {__VLS_StyleScopedClasses['history-index']} */ ;
/** @type {__VLS_StyleScopedClasses['history-block']} */ ;
/** @type {__VLS_StyleScopedClasses['history-index']} */ ;
/** @type {__VLS_StyleScopedClasses['video-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['video-title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['section-number']} */ ;
/** @type {__VLS_StyleScopedClasses['video-art']} */ ;
/** @type {__VLS_StyleScopedClasses['video-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['video-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['ticker-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['ticker']} */ ;
/** @type {__VLS_StyleScopedClasses['footer']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-links']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-social']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
/** @type {__VLS_StyleScopedClasses['social-list']} */ ;
/** @type {__VLS_StyleScopedClasses['social-link']} */ ;
/** @type {__VLS_StyleScopedClasses['social-link']} */ ;
/** @type {__VLS_StyleScopedClasses['social-link']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['copyright']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-float']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        videoRef: videoRef,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
