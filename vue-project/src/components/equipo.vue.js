import { computed } from 'vue';
import pipi from '/imagenes/pipi.jpeg';
import pao from '/imagenes/paoactu.jpeg';
import german from '/imagenes/germanactu.jpeg';
import caro from '/imagenes/caroactu.jpeg';
import nahuel from '/imagenes/nahuel.jpg';
import guille from '/imagenes/guilleactu.jpeg';
function esCumpleañosHoy(fechaNacimiento) {
    const hoy = new Date();
    const [anio, mes, dia] = fechaNacimiento
        .split('-')
        .map(Number);
    return (hoy.getDate() === dia &&
        hoy.getMonth() + 1 === mes);
}
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const [anio, mes, dia] = fechaNacimiento
        .split('-')
        .map(Number);
    const cumpleEsteAño = new Date(hoy.getFullYear(), mes - 1, dia);
    let edad = hoy.getFullYear() - anio;
    if (hoy < cumpleEsteAño) {
        edad--;
    }
    return edad;
}
const datosEquipo = [
    {
        nombre: 'Fernando Magnano',
        nacimiento: '1978-07-26',
        localidad: 'San Francisco, Cba',
        rol: 'CEO & Fundador. Liderazgo estratégico y desarrollo de marcas corporativas.',
        imagen: pipi,
        imagenName: 'pipi'
    },
    {
        nombre: 'Paola Brekes',
        nacimiento: '1978-04-28',
        localidad: 'San Francisco, Cba',
        rol: 'Diseñadora gráfica, encargada de corte, producción y control de calidad final.',
        imagen: pao,
        imagenName: 'paoactu'
    },
    {
        nombre: 'German Bitschin',
        nacimiento: '1976-07-20',
        localidad: 'San Francisco, Cba',
        rol: 'Representante en Córdoba; Especialista en ploteo vehicular de alta complejidad, cartelería y rotulaciones.',
        imagen: german,
        imagenName: 'germanactu'
    },
    {
        nombre: 'Carolina Pacheco',
        nacimiento: '1992-06-16',
        localidad: 'San Francisco, Cba',
        rol: 'Atención exclusiva al público, relevamiento técnico de datos y coordinación de producción.',
        imagen: caro,
        imagenName: 'caroactu'
    },
    {
        nombre: 'Nahuel Schneider',
        nacimiento: '1997-11-27',
        localidad: 'Córdoba',
        rol: 'Asistente técnico permanente en Córdoba, encargado de montajes y rotulaciones arquitectónicas.',
        imagen: nahuel,
        imagenName: 'nahuel'
    },
    {
        nombre: 'Guillermo Galvano',
        nacimiento: '1981-09-08',
        localidad: 'San Francisco, Cba',
        rol: 'Especialista senior en ploteo vehicular, estructuras de cartelería e instalaciones industriales.',
        imagen: guille,
        imagenName: 'guilleactu'
    }
];
const equipo = computed(() => {
    return datosEquipo.map((miembro) => {
        return {
            nombre: miembro.nombre,
            nacimiento: miembro.nacimiento,
            localidad: miembro.localidad,
            rol: miembro.rol,
            imagen: miembro.imagen,
            imagenName: miembro.imagenName,
            edad: calcularEdad(miembro.nacimiento),
            esSuCumple: esCumpleañosHoy(miembro.nacimiento)
        };
    });
});
function pathExt(importValue) {
    try {
        const s = String(importValue);
        const m = s.match(/\.(jpe?g|png|gif|webp|jpeg)$/i);
        return m
            ? `.${m[1]}`
            : '.jpg';
    }
    catch (e) {
        return '.jpg';
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['heading-index']} */ ;
/** @type {__VLS_StyleScopedClasses['heading-index']} */ ;
/** @type {__VLS_StyleScopedClasses['heading-index']} */ ;
/** @type {__VLS_StyleScopedClasses['texto-grande']} */ ;
/** @type {__VLS_StyleScopedClasses['texto-grande']} */ ;
/** @type {__VLS_StyleScopedClasses['texto-grande']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-x']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-img']} */ ;
/** @type {__VLS_StyleScopedClasses['image-status']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['role-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['role-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['member-name']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-links']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-links']} */ ;
/** @type {__VLS_StyleScopedClasses['social-link']} */ ;
/** @type {__VLS_StyleScopedClasses['social-link']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-float']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-float']} */ ;
/** @type {__VLS_StyleScopedClasses['team-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bloque-equipo']} */ ;
/** @type {__VLS_StyleScopedClasses['equipo-container']} */ ;
/** @type {__VLS_StyleScopedClasses['equipo-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['heading-index']} */ ;
/** @type {__VLS_StyleScopedClasses['heading-index']} */ ;
/** @type {__VLS_StyleScopedClasses['texto-grande']} */ ;
/** @type {__VLS_StyleScopedClasses['heading-description']} */ ;
/** @type {__VLS_StyleScopedClasses['team-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['role-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['footer']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-x']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-equipo']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "pantalla bloque-equipo" },
    id: "equipo",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "equipo-background" },
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "grid-equipo" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "light-orb orb-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "light-orb orb-two" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "light-line line-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "light-line line-two" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-x x-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-x x-two" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-square square-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-square square-two" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-circle circle-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "decor-circle circle-two" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "container equipo-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "equipo-heading" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "heading-index" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "heading-main" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "section-tag" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "texto-grande" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "heading-description" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "team-grid" },
});
for (const [miembro, index] of __VLS_getVForSourceType((__VLS_ctx.equipo))) {
    // @ts-ignore
    [equipo,];
    __VLS_asFunctionalElement(__VLS_elements.article, __VLS_elements.article)({
        key: (miembro.nombre),
        ...{ class: "team-card" },
        ...{ class: (`member-${index + 1}`) },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-number" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-x" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "image-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_elements.picture, __VLS_elements.picture)({});
    __VLS_asFunctionalElement(__VLS_elements.source)({
        type: "image/avif",
        srcset: (`
                  ${'/imagenes/' + miembro.imagenName}-400.avif 400w,
                  ${'/imagenes/' + miembro.imagenName}-800.avif 800w,
                  ${'/imagenes/' + miembro.imagenName}-1200.avif 1200w
                `),
        sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    });
    __VLS_asFunctionalElement(__VLS_elements.source)({
        type: "image/webp",
        srcset: (`
                  ${'/imagenes/' + miembro.imagenName}-400.webp 400w,
                  ${'/imagenes/' + miembro.imagenName}-800.webp 800w,
                  ${'/imagenes/' + miembro.imagenName}-1200.webp 1200w
                `),
        sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    });
    __VLS_asFunctionalElement(__VLS_elements.img)({
        src: (miembro.imagen),
        alt: (miembro.nombre),
        loading: "lazy",
        decoding: "async",
        ...{ class: "team-img" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "image-gradient" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "image-status" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "role-panel" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "role-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (miembro.rol);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "role-line" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "name-row" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "member-name" },
    });
    (miembro.nombre);
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "member-location" },
    });
    (miembro.localidad);
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "member-age" },
    });
    (miembro.edad);
    if (miembro.esSuCumple) {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "birthday-container" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "birthday-icon" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "birthday-tag" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "birthday-icon" },
        });
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-bottom" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "bottom-line" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (miembro.edad);
}
const __VLS_0 = {}.SiteFooter;
/** @type {[typeof __VLS_components.SiteFooter, ]} */ ;
// @ts-ignore
SiteFooter;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
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
/** @type {__VLS_StyleScopedClasses['pantalla']} */ ;
/** @type {__VLS_StyleScopedClasses['bloque-equipo']} */ ;
/** @type {__VLS_StyleScopedClasses['equipo-background']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-equipo']} */ ;
/** @type {__VLS_StyleScopedClasses['light-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['orb-one']} */ ;
/** @type {__VLS_StyleScopedClasses['light-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['orb-two']} */ ;
/** @type {__VLS_StyleScopedClasses['light-line']} */ ;
/** @type {__VLS_StyleScopedClasses['line-one']} */ ;
/** @type {__VLS_StyleScopedClasses['light-line']} */ ;
/** @type {__VLS_StyleScopedClasses['line-two']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-x']} */ ;
/** @type {__VLS_StyleScopedClasses['x-one']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-x']} */ ;
/** @type {__VLS_StyleScopedClasses['x-two']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-square']} */ ;
/** @type {__VLS_StyleScopedClasses['square-one']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-square']} */ ;
/** @type {__VLS_StyleScopedClasses['square-two']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['circle-one']} */ ;
/** @type {__VLS_StyleScopedClasses['decor-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['circle-two']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['equipo-container']} */ ;
/** @type {__VLS_StyleScopedClasses['equipo-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['heading-index']} */ ;
/** @type {__VLS_StyleScopedClasses['heading-main']} */ ;
/** @type {__VLS_StyleScopedClasses['section-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['texto-grande']} */ ;
/** @type {__VLS_StyleScopedClasses['heading-description']} */ ;
/** @type {__VLS_StyleScopedClasses['team-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['team-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-number']} */ ;
/** @type {__VLS_StyleScopedClasses['card-x']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['team-img']} */ ;
/** @type {__VLS_StyleScopedClasses['image-gradient']} */ ;
/** @type {__VLS_StyleScopedClasses['image-status']} */ ;
/** @type {__VLS_StyleScopedClasses['role-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['role-label']} */ ;
/** @type {__VLS_StyleScopedClasses['role-line']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['name-row']} */ ;
/** @type {__VLS_StyleScopedClasses['member-name']} */ ;
/** @type {__VLS_StyleScopedClasses['member-location']} */ ;
/** @type {__VLS_StyleScopedClasses['member-age']} */ ;
/** @type {__VLS_StyleScopedClasses['birthday-container']} */ ;
/** @type {__VLS_StyleScopedClasses['birthday-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['birthday-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['birthday-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['card-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-line']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-float']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        equipo: equipo,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
