<template>
  <main class="main-container">
    <!-- Fondo decorativo -->
    <div class="background-decoration" aria-hidden="true">
      <div class="background-glow glow-one"></div>
      <div class="background-glow glow-two"></div>
      <div class="background-line line-one"></div>
      <div class="background-line line-two"></div>
    </div>

    <section class="galeria">
      <!-- Encabezado -->
      <header class="gallery-header">
        <div class="header-label">
          <span class="label-dot"></span>
          PORTFOLIO / BETA GRÁFICA
        </div>

        <h1 class="titulo">
          Nuestros
          <span>Trabajos</span>
        </h1>

        <p class="intro-text">
          Una selección de proyectos, instalaciones y soluciones gráficas
          realizadas por nuestro equipo.
        </p>
      </header>

      <!-- Selector de categorías -->
      <div class="category-selector">
        <button
          type="button"
          :class="[
            'category-button',
            { activo: categoria === 'vehiculos' }
          ]"
          @click="categoria = 'vehiculos'"
        >
          <span class="button-number">01</span>

          <span class="button-content">
            <strong>Trabajos realizados</strong>
            <small>Vehículos · Ploteos · Rotulación</small>
          </span>

          <span class="button-arrow">↗</span>
        </button>

        <button
          type="button"
          :class="[
            'category-button',
            { activo: categoria === 'equipacion' }
          ]"
          @click="categoria = 'equipacion'"
        >
          <span class="button-number">02</span>

          <span class="button-content">
            <strong>Stock & equipamiento</strong>
            <small>Materiales · Soluciones móviles</small>
          </span>

          <span class="button-arrow">↗</span>
        </button>
      </div>

      <!-- Línea informativa -->
      <div class="gallery-meta">
        <span>
          MOSTRANDO
          <strong>
            {{ categoria === 'vehiculos'
              ? 'TRABAJOS REALIZADOS'
              : 'STOCK / EQUIPAMIENTO' }}
          </strong>
        </span>

        <span class="meta-line"></span>

        <span>
          {{ imagenesFiltradas.length }} PROYECTOS
        </span>
      </div>

      <!-- Galería -->
      <Transition name="gallery-change" mode="out-in">
        <div class="grid" :key="categoria">
          <article
            v-for="(img, index) in imagenesFiltradas"
            :key="`${categoria}-${index}`"
            class="item"
            :class="`item-${(index % 6) + 1}`"
            @click="abrir(img)"
          >
            <div class="image-wrapper">
              <picture>
                <source
                  :srcset="makeSrcset(img, 'avif')"
                  type="image/avif"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                <source
                  :srcset="makeSrcset(img, 'webp')"
                  type="image/webp"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                <img
                  :src="img"
                  alt="Trabajo realizado por Beta Gráfica"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              </picture>

              <div class="image-shade"></div>

              <div class="image-number">
                {{ String(index + 1).padStart(2, '0') }}
              </div>

              <div class="view-button">
                <span>VER</span>

                <svg
                  viewBox="0 0 24 24"
                  class="view-icon"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5c-5.5 0-9.5 4.5-10.5 7
                    C2.5 13 6.5 19 12 19s9.5-4.5
                    10.5-7C21.5 9.5 17.5 5 12 5zm0
                    11a4 4 0 1 1 0-8 4 4 0 0 1
                    0 8zm0-2.2a1.8 1.8 0 1 0
                    0-3.6 1.8 1.8 0 0 0 0 3.6z"
                  />
                </svg>
              </div>

              <div class="image-caption">
                <span>
                  {{ categoria === 'vehiculos'
                    ? 'TRABAJO REALIZADO'
                    : 'EQUIPAMIENTO' }}
                </span>

                <span class="caption-arrow">↗</span>
              </div>
            </div>
          </article>
        </div>
      </Transition>

      <!-- Modal -->
      <Transition name="modal">
        <div
          v-if="imagenActiva"
          class="modal"
          @click.self="cerrar"
        >
          <div class="modal-topbar">
            <span>VISTA DETALLADA</span>

            <button
              type="button"
              class="cerrar"
              aria-label="Cerrar imagen"
              @click="cerrar"
            >
              <span></span>
              <span></span>
            </button>
          </div>

          <div class="modal-content">
            <img
              :src="imagenActiva"
              alt="Imagen ampliada"
              class="modal-img"
            />
          </div>

          <div class="modal-bottom">
            <span>BETA GRÁFICA</span>
            <span>ESC / CERRAR</span>
          </div>
        </div>
      </Transition>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-row">
      <div class="footer-col brand-info">
        <h3 class="footer-title">Beta Gráfica</h3>

        <p class="footer-highlight">
          Industria Gráfica Integral
        </p>

        <p class="footer-text">
          Calidad premium y precisión milimétrica en cada impresión desde 1997.
        </p>
      </div>

      <div class="footer-col social-hub">
        <h3 class="footer-title">
          REDES SOCIALES
        </h3>

        <div class="social-icons">
          <a
            href="https://www.facebook.com/share/1BDXuPqTHn/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <svg
              viewBox="0 0 24 24"
              class="svg-icon"
            >
              <path
                d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"
              />
            </svg>
          </a>

          <a
            href="https://www.instagram.com/beta_grafica/?next=%2F"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <svg
              viewBox="0 0 24 24"
              class="svg-icon"
            >
              <path
                d="M12 2.163c3.204 0 3.584.012
                4.85.07 3.252.148 4.771 1.691
                4.919 4.919.058 1.265.069 1.645
                .069 4.849 0 3.205-.012 3.584
                -.069 4.849-.149 3.225-1.664
                4.771-4.919 4.919-1.266.058-1.644
                .07-4.85.07-3.204 0-3.584-.014
                -4.849-.07-3.26-.149-4.771-1.699
                -4.919-4.92-.058-1.28-.07-1.644
                -.07-4.849 0-3.204.013-3.583
                .07-4.849.149-3.227 1.664-4.771
                4.919-4.919C8.333.014 8.741 0 12 0zm0
                5.838a6.162 6.162 0 100 12.324
                6.162 6.162 0 000-12.324zM12
                16a4 4 0 110-8 4 4 0 010 8zm6.406
                -11.845a1.44 1.44 0 100 2.881
                1.44 1.44 0 000-2.881z"
              />
            </svg>
          </a>

          <a
            href="https://www.tiktok.com/@beta.grafica?_t=ZM-909zpyOoHTI&_r=1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <svg
              viewBox="0 0 24 24"
              class="svg-icon"
            >
              <path
                d="M12.525.02c1.31-.02 2.61-.01
                3.91-.02.08 1.53.63 3.02 1.59
                4.23.94 1.15 2.25 1.93 3.69
                2.23v3.74c-1.5-.04-2.99-.48
                -4.26-1.3-.77-.5-1.44-1.13
                -1.97-1.87v6.97c-.03 2.1-.81
                4.14-2.18 5.62-1.54 1.74-3.8
                2.76-6.13 2.8-2.13.06-4.24-.65
                -5.85-2.01C-.04 18.91-.45 16.2
                .29 13.91c.64-2.1 2.38-3.77
                4.54-4.33.6-.17 1.23-.24
                1.85-.24V13c-.92-.01-1.85.28
                -2.55.88-.73.61-1.14 1.54-1.1
                2.48.05 1.05.62 2.03 1.51
                2.58.91.58 2.06.66 3.03.22
                .95-.41 1.65-1.28 1.88-2.29
                .07-.36.1-.73.09-1.1V0l.01.02z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>

  <!-- WHATSAPP -->
  <a
    href="https://wa.me/5493564652137"
    target="_blank"
    rel="noopener noreferrer"
    class="whatsapp-floating-btn"
    aria-label="Contactar por WhatsApp"
  >
    <div class="pulse-ring"></div>

    <svg
      viewBox="0 0 24 24"
      class="whatsapp-icon"
    >
      <path
        d="M.057 24l1.687-6.163c-1.041-1.804
        -1.588-3.849-1.587-5.946C.06 5.348
        5.397.01 12.008.01c3.202.001 6.212
        1.246 8.477 3.513 2.266 2.268 3.507
        5.28 3.505 8.484-.004 6.657-5.34
        11.997-11.953 11.997-2.005-.001-3.973
        -.502-5.713-1.455L0 24zm6.59-4.846
        c1.66.986 3.292 1.493 4.741 1.494
        5.428 0 9.847-4.41 9.849-9.836
        .001-2.628-1.02-5.1-2.877-6.96
        C16.444 1.98 13.974 1.57 12.008
        1.57c-5.43 0-9.85 4.41-9.852
        9.837-.001 1.812.487 3.591
        1.411 5.17l-.953 3.478 3.533-.925z
        M17.467 14.3c-.297-.149-1.758-.867
        -2.03-.967-.273-.099-.471-.148-.67
        .15-.197.297-.767.966-.94 1.164
        -.173.199-.347.223-.644.075-.297
        -.15-1.255-.463-2.39-1.475-.883-.788
        -1.48-1.761-1.653-2.059-.173-.297
        -.018-.458.13-.606.134-.133.298-.347
        .446-.52.149-.174.198-.298.298-.497
        .099-.198.05-.371-.025-.52-.075-.149
        -.669-1.612-.916-2.207-.242-.579
        -.487-.501-.669-.51l-.57-.01c-.198
        0-.52.074-.792.372s-1.04 1.016
        -1.04 2.479 1.065 2.876 1.213 3.074
        c.149.198 2.096 3.2 5.077 4.487
        .709.306 1.262.489 1.694.625
        .712.227 1.36.195 1.871.118
        .571-.085 1.758-.719 2.006-1.413
        .248-.694.248-1.289.173-1.413
        -.074-.124-.272-.198-.57-.347z"
      />
    </svg>
  </a>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FotosView'
})

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type Categoria = 'vehiculos' | 'equipacion'

const categoria = ref<Categoria>('vehiculos')

const galeriaFotos = {
  vehiculos: [
    '/imagenes/galeria 1.jpeg',
    '/imagenes/galeria 2.jpeg',
    '/imagenes/galeria 3.jpeg',
    '/imagenes/galeria 4.jpeg',
    '/imagenes/galeria 5.jpeg',
    '/imagenes/galeria 6.jpeg',
    '/imagenes/galeria 7.jpeg',
    '/imagenes/galeria 8.jpeg',
    '/imagenes/galeria 9.jpeg',
    '/imagenes/galeria 10.jpeg',
    '/imagenes/galeria 11.jpeg',
    '/imagenes/galeria 12.jpeg',
    '/imagenes/galeria 14.jpeg',
    '/imagenes/galeria 15.jpeg',
    '/imagenes/galeria 16 (1).jpeg',
    '/imagenes/galeria 17.jpeg',
    '/imagenes/galeria 18.jpeg',
    '/imagenes/pisos (2).jpeg'
  ],

  equipacion: [
    '/imagenes/galeria equipacopn.jpeg',
    '/imagenes/galeria equip2.jpeg',
    '/imagenes/galeria equipo 3.jpeg',
    '/imagenes/galeria equip 4.jpeg',
    '/imagenes/galeria 13.jpeg',
    '/imagenes/pisos (3).jpeg',
    '/imagenes/pisos (6).jpeg',
    '/imagenes/pisos (5).jpeg',
    '/imagenes/pisos (8).jpeg',
    '/imagenes/pisos (10).jpeg',
    '/imagenes/pisos (11).jpeg'
  ]
}

const imagenesFiltradas = computed(() => {
  return galeriaFotos[categoria.value]
})

const imagenActiva = ref<string | null>(null)

function abrir(img: string) {
  imagenActiva.value = img
  document.body.style.overflow = 'hidden'
}

function cerrar() {
  imagenActiva.value = null
  document.body.style.overflow = ''
}

function manejarEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && imagenActiva.value) {
    cerrar()
  }
}

function makeSrcset(
  imgPath: string,
  fmt: 'avif' | 'webp'
) {
  try {
    const base = imgPath
      .replace(/^\/imagenes\//, '')
      .replace(/\.[^/.]+$/, '')

    const enc = encodeURIComponent(base)

    return [400, 800, 1200]
      .map(function (size) {
        return `/imagenes/${enc}-${size}.${fmt} ${size}w`
      })
      .join(', ')
  } catch (error) {
    return imgPath
  }
}

onMounted(() => {
  window.addEventListener('keydown', manejarEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', manejarEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* =========================================================
   VARIABLES GENERALES
========================================================= */

.main-container {
  --black: #050505;
  --black-soft: #090909;
  --black-card: #101010;

  --gray-dark: #171717;
  --gray: #6b6b6b;
  --gray-light: #a7a7a7;

  --white: #ffffff;
  --white-soft: #eeeeee;

  --border: rgba(255, 255, 255, 0.10);
  --border-soft: rgba(255, 255, 255, 0.055);

  --ease: cubic-bezier(0.16, 1, 0.3, 1);

  position: relative;
  min-height: 100vh;
  width: 100%;

  background:
    radial-gradient(
      circle at 20% 15%,
      rgba(255, 255, 255, 0.035),
      transparent 28%
    ),
    radial-gradient(
      circle at 80% 75%,
      rgba(255, 255, 255, 0.025),
      transparent 30%
    ),
    var(--black);

  color: var(--white);

  padding-top: clamp(100px, 9vw, 145px);

  overflow: hidden;
}


/* =========================================================
   FONDO
========================================================= */

.background-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.background-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.08;
}

.glow-one {
  top: 5%;
  left: -250px;
  background: #ffffff;
}

.glow-two {
  bottom: 10%;
  right: -300px;
  background: #ffffff;
}

.background-line {
  position: absolute;
  width: 1px;
  height: 120%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.06),
    transparent
  );
}

.line-one {
  left: 12%;
  top: -10%;
  transform: rotate(18deg);
}

.line-two {
  right: 15%;
  top: -10%;
  transform: rotate(-18deg);
}


/* =========================================================
   GALERÍA
========================================================= */

.galeria {
  position: relative;
  z-index: 2;

  width: min(1400px, calc(100% - 80px));

  margin: 0 auto;

  padding-bottom: 120px;
}


/* =========================================================
   HEADER
========================================================= */

.gallery-header {
  max-width: 850px;
  margin: 0 auto 65px auto;
  text-align: center;
}

.header-label {
  display: inline-flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 20px;

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 4px;

  color: var(--gray-light);
}

.label-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #ffffff;

  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.06);
}

.titulo {
  margin: 0;

  font-size: clamp(48px, 7vw, 86px);

  line-height: 0.95;

  font-weight: 900;

  letter-spacing: -0.065em;

  color: var(--white);
}

.titulo span {
  display: block;

  color: transparent;

  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.55);

  text-shadow: none;
}

.intro-text {
  max-width: 560px;

  margin: 27px auto 0 auto;

  color: var(--gray-light);

  font-size: 15px;

  line-height: 1.7;
}


/* =========================================================
   BOTONES / CATEGORÍAS
========================================================= */

.category-selector {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  max-width: 900px;

  margin: 0 auto 45px auto;

  gap: 14px;
}

.category-button {
  position: relative;

  display: flex;
  align-items: center;

  min-height: 92px;

  padding: 17px 18px;

  border: 1px solid var(--border-soft);

  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.055),
      rgba(255, 255, 255, 0.018)
    );

  color: var(--white);

  cursor: pointer;

  text-align: left;

  overflow: hidden;

  transition:
    transform 0.45s var(--ease),
    border-color 0.45s var(--ease),
    background 0.45s var(--ease),
    box-shadow 0.45s var(--ease);
}

.category-button::before {
  content: "";

  position: absolute;

  left: 0;
  top: 0;

  width: 4px;
  height: 100%;

  background: #ffffff;

  transform: scaleY(0);

  transform-origin: bottom;

  transition: transform 0.45s var(--ease);
}

.category-button:hover {
  transform: translateY(-5px);

  border-color: rgba(255, 255, 255, 0.22);

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.09),
      rgba(255, 255, 255, 0.025)
    );

  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.35);
}

.category-button:hover::before {
  transform: scaleY(1);
}

.category-button.activo {
  background: #ffffff;

  color: #050505;

  border-color: #ffffff;

  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.35);
}

.category-button.activo::before {
  background: #050505;

  transform: scaleY(1);
}

.button-number {
  display: flex;

  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 43px;
  height: 43px;

  margin-right: 14px;

  border-radius: 50%;

  border: 1px solid rgba(255, 255, 255, 0.15);

  color: var(--gray-light);

  font-size: 11px;
  font-weight: 800;

  transition:
    transform 0.45s var(--ease),
    background 0.45s ease,
    color 0.45s ease;
}

.category-button:hover .button-number {
  transform: rotate(-8deg) scale(1.08);
}

.category-button.activo .button-number {
  background: #050505;

  border-color: #050505;

  color: #ffffff;
}

.button-content {
  display: flex;

  flex-direction: column;

  gap: 5px;

  min-width: 0;
}

.button-content strong {
  font-size: 13px;

  line-height: 1.2;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: 0.05em;
}

.button-content small {
  color: var(--gray-light);

  font-size: 11px;

  line-height: 1.3;
}

.category-button.activo .button-content small {
  color: #666666;
}

.button-arrow {
  margin-left: auto;

  font-size: 22px;

  font-weight: 300;

  transform: translate(-3px, 3px);

  transition:
    transform 0.45s var(--ease);
}

.category-button:hover .button-arrow {
  transform: translate(0, 0) rotate(3deg);
}

.category-button.activo .button-arrow {
  transform: translate(0, 0);
}


/* =========================================================
   META
========================================================= */

.gallery-meta {
  display: flex;

  align-items: center;

  gap: 18px;

  margin-bottom: 22px;

  color: #666666;

  font-size: 9px;

  font-weight: 800;

  letter-spacing: 2px;
}

.gallery-meta strong {
  color: #aaaaaa;

  font-weight: 800;
}

.meta-line {
  flex: 1;

  height: 1px;

  background: rgba(255, 255, 255, 0.09);
}


/* =========================================================
   GRID
========================================================= */

.grid {
  display: grid;

  grid-template-columns: repeat(12, 1fr);

  gap: 18px;

  align-items: start;
}

.item {
  position: relative;

  cursor: pointer;

  overflow: hidden;

  border-radius: 14px;

  background: #111111;

  border: 1px solid rgba(255, 255, 255, 0.06);

  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.35);

  transition:
    transform 0.55s var(--ease),
    border-color 0.45s ease,
    box-shadow 0.55s var(--ease);
}

/* Distribución irregular para que no parezca una grilla genérica */

.item-1 {
  grid-column: span 5;
}

.item-2 {
  grid-column: span 7;
}

.item-3 {
  grid-column: span 4;
}

.item-4 {
  grid-column: span 4;
}

.item-5 {
  grid-column: span 4;
}

.item-6 {
  grid-column: span 7;
}

.item-1 .image-wrapper,
.item-2 .image-wrapper,
.item-6 .image-wrapper {
  aspect-ratio: 16 / 10;
}

.item-3 .image-wrapper,
.item-4 .image-wrapper,
.item-5 .image-wrapper {
  aspect-ratio: 4 / 4.6;
}

.item:hover {
  transform: translateY(-7px);

  border-color: rgba(255, 255, 255, 0.22);

  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.55);
}


/* =========================================================
   IMÁGENES
========================================================= */

.image-wrapper {
  position: relative;

  width: 100%;

  overflow: hidden;

  background: #111111;
}

.item img {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;

  /*
   * SIN ESCALA DE GRISES.
   * Las fotografías se muestran a color.
   */
  filter: saturate(1.04) contrast(1.01);

  transition:
    transform 0.8s var(--ease),
    filter 0.8s var(--ease);
}

.item:hover img {
  transform: scale(1.045);

  filter: saturate(1.1) contrast(1.04);
}


/* =========================================================
   SOMBRA DE IMAGEN
========================================================= */

.image-shade {
  position: absolute;

  inset: 0;

  background:
    linear-gradient(
      to top,
      rgba(0, 0, 0, 0.72) 0%,
      rgba(0, 0, 0, 0.12) 40%,
      transparent 70%
    );

  opacity: 0.72;

  transition: opacity 0.5s ease;

  pointer-events: none;
}

.item:hover .image-shade {
  opacity: 0.9;
}


/* =========================================================
   NUMERACIÓN
========================================================= */

.image-number {
  position: absolute;

  top: 15px;
  left: 15px;

  display: flex;

  align-items: center;
  justify-content: center;

  width: 35px;
  height: 35px;

  border-radius: 50%;

  background: rgba(0, 0, 0, 0.55);

  border: 1px solid rgba(255, 255, 255, 0.18);

  backdrop-filter: blur(8px);

  color: #ffffff;

  font-size: 10px;

  font-weight: 800;

  z-index: 2;

  transition:
    transform 0.45s var(--ease),
    background 0.45s ease;
}

.item:hover .image-number {
  transform: rotate(-8deg);

  background: #ffffff;

  color: #050505;
}


/* =========================================================
   BOTÓN VER
========================================================= */

.view-button {
  position: absolute;

  top: 50%;
  left: 50%;

  display: flex;

  align-items: center;
  justify-content: center;

  gap: 8px;

  min-width: 88px;
  height: 42px;

  padding: 0 13px;

  border-radius: 30px;

  background: #ffffff;

  color: #050505;

  transform:
    translate(-50%, -50%)
    scale(0.72);

  opacity: 0;

  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.4);

  transition:
    opacity 0.4s ease,
    transform 0.5s var(--ease);
}

.item:hover .view-button {
  opacity: 1;

  transform:
    translate(-50%, -50%)
    scale(1);
}

.view-button span {
  font-size: 10px;

  font-weight: 900;

  letter-spacing: 1px;
}

.view-icon {
  width: 16px;
  height: 16px;

  fill: #050505;
}


/* =========================================================
   TEXTO SOBRE IMAGEN
========================================================= */

.image-caption {
  position: absolute;

  left: 17px;
  right: 17px;
  bottom: 15px;

  display: flex;

  align-items: center;
  justify-content: space-between;

  z-index: 3;

  color: #ffffff;

  font-size: 9px;

  font-weight: 800;

  letter-spacing: 2px;

  transform: translateY(5px);

  opacity: 0.75;

  transition:
    opacity 0.4s ease,
    transform 0.4s var(--ease);
}

.item:hover .image-caption {
  opacity: 1;

  transform: translateY(0);
}

.caption-arrow {
  font-size: 17px;

  font-weight: 300;

  transition:
    transform 0.4s var(--ease);
}

.item:hover .caption-arrow {
  transform: translate(3px, -3px);
}


/* =========================================================
   TRANSICIÓN GALERÍA
========================================================= */

.gallery-change-enter-active,
.gallery-change-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.45s var(--ease);
}

.gallery-change-enter-from {
  opacity: 0;

  transform: translateY(18px);
}

.gallery-change-leave-to {
  opacity: 0;

  transform: translateY(-15px);
}


/* =========================================================
   MODAL
========================================================= */

.modal {
  position: fixed;

  inset: 0;

  z-index: 2000;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 70px 40px;

  background:
    rgba(0, 0, 0, 0.96);

  backdrop-filter: blur(15px);
}

.modal-topbar {
  position: absolute;

  top: 25px;
  left: 35px;
  right: 35px;

  display: flex;

  align-items: center;
  justify-content: space-between;

  color: #777777;

  font-size: 9px;

  font-weight: 800;

  letter-spacing: 3px;
}

.modal-content {
  max-width: 1200px;
  max-height: 82vh;

  display: flex;

  align-items: center;
  justify-content: center;
}

.modal-img {
  display: block;

  max-width: 100%;
  max-height: 82vh;

  object-fit: contain;

  border-radius: 8px;

  box-shadow:
    0 40px 100px rgba(0, 0, 0, 0.85);

  border: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-bottom {
  position: absolute;

  left: 35px;
  right: 35px;
  bottom: 25px;

  display: flex;

  justify-content: space-between;

  color: #555555;

  font-size: 8px;

  font-weight: 800;

  letter-spacing: 2px;
}

.cerrar {
  position: relative;

  width: 44px;
  height: 44px;

  border-radius: 50%;

  border: 1px solid rgba(255, 255, 255, 0.16);

  background: rgba(255, 255, 255, 0.04);

  cursor: pointer;

  transition:
    transform 0.4s var(--ease),
    background 0.3s ease,
    border-color 0.3s ease;
}

.cerrar span {
  position: absolute;

  top: 50%;
  left: 50%;

  width: 17px;
  height: 1px;

  background: #ffffff;
}

.cerrar span:first-child {
  transform: translate(-50%, -50%) rotate(45deg);
}

.cerrar span:last-child {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.cerrar:hover {
  transform: rotate(90deg);

  background: #ffffff;

  border-color: #ffffff;
}

.cerrar:hover span {
  background: #050505;
}


/* =========================================================
   MODAL TRANSITION
========================================================= */

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.4s ease;
}

.modal-enter-active .modal-img,
.modal-leave-active .modal-img {
  transition:
    transform 0.5s var(--ease),
    opacity 0.4s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .modal-img {
  opacity: 0;

  transform: scale(0.94);
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .modal-img {
  opacity: 0;

  transform: scale(0.96);
}


/* =========================================================
   FOOTER
========================================================= */

.footer {
  position: relative;

  z-index: 3;

  background-color: #020202;

  padding: 80px 0;

  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-row {
  display: flex;

  justify-content: space-between;
  align-items: center;

  max-width: 1400px;

  margin: 0 auto;

  padding: 0 40px;

  gap: 40px;
}

.brand-info {
  flex: 1.2;
}

.social-hub {
  display: flex;

  flex-direction: column;

  align-items: flex-end;

  gap: 16px;
}

.footer-title {
  font-size: 12px;

  font-weight: 800;

  color: #ffffff;

  letter-spacing: 3px;

  text-transform: uppercase;

  margin: 0 0 12px 0;
}

.footer-highlight {
  font-size: 13.5px;

  color: #ffffff;

  font-weight: 700;

  margin: 0 0 10px 0;
}

.footer-text {
  font-size: 13.5px;

  color: #666666;

  max-width: 420px;

  margin: 0;

  line-height: 1.6;
}

.social-icons {
  display: flex;

  gap: 12px;
}

.social-icons a {
  display: flex;

  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  border-radius: 8px;

  background-color: #080808;

  border: 1px solid rgba(255, 255, 255, 0.07);

  color: #666666;

  transition:
    all 0.4s var(--ease);
}

.svg-icon {
  width: 15px;
  height: 15px;

  fill: currentColor;
}

.social-icons a:hover {
  color: #050505;

  background-color: #ffffff;

  border-color: #ffffff;

  transform: translateY(-4px);

  box-shadow:
    0 12px 25px rgba(0, 0, 0, 0.5);
}


/* =========================================================
   WHATSAPP
========================================================= */

.whatsapp-floating-btn {
  position: fixed;

  bottom: 35px;
  right: 35px;

  width: 56px;
  height: 56px;

  background-color: #25d366;

  border-radius: 50%;

  display: flex;

  align-items: center;
  justify-content: center;

  box-shadow:
    0 10px 25px rgba(37, 211, 102, 0.3);

  z-index: 999;

  cursor: pointer;

  transition:
    transform 0.3s cubic-bezier(
      0.175,
      0.885,
      0.32,
      1.2
    );
}

.whatsapp-icon {
  width: 26px;
  height: 26px;

  fill: #ffffff;
}

.pulse-ring {
  position: absolute;

  inset: 0;

  border-radius: 50%;

  border: 2px solid #25d366;

  animation: geoPulse 2s infinite ease-out;

  pointer-events: none;
}

.whatsapp-floating-btn:hover {
  transform:
    scale(1.08)
    translate3d(0, -3px, 0);

  box-shadow:
    0 15px 30px rgba(37, 211, 102, 0.4);
}


/* =========================================================
   ANIMACIONES
========================================================= */

@keyframes geoPulse {
  0% {
    transform: scale(1);

    opacity: 1;
  }

  100% {
    transform: scale(1.4);

    opacity: 0;
  }
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1024px) {
  .galeria {
    width: min(100% - 48px, 900px);
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .item-1,
  .item-2,
  .item-3,
  .item-4,
  .item-5,
  .item-6 {
    grid-column: span 1;
  }

  .item-1 .image-wrapper,
  .item-2 .image-wrapper,
  .item-3 .image-wrapper,
  .item-4 .image-wrapper,
  .item-5 .image-wrapper,
  .item-6 .image-wrapper {
    aspect-ratio: 4 / 3;
  }

  .footer-row {
    flex-direction: column;

    text-align: center;

    gap: 30px;
  }

  .social-hub {
    align-items: center;
  }

  .footer-text {
    margin: 0 auto;
  }
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 700px) {
  .main-container {
    padding-top: 95px;
  }

  .galeria {
    width: calc(100% - 32px);

    padding-bottom: 80px;
  }

  .gallery-header {
    margin-bottom: 45px;
  }

  .header-label {
    font-size: 8px;

    letter-spacing: 3px;
  }

  .titulo {
    font-size: clamp(44px, 14vw, 65px);
  }

  .intro-text {
    font-size: 13px;

    padding: 0 10px;
  }

  .category-selector {
    grid-template-columns: 1fr;

    gap: 10px;

    margin-bottom: 35px;
  }

  .category-button {
    min-height: 82px;
  }

  .button-content strong {
    font-size: 11px;
  }

  .button-content small {
    font-size: 10px;
  }

  .gallery-meta {
    gap: 10px;

    font-size: 8px;

    letter-spacing: 1px;
  }

  .grid {
    grid-template-columns: 1fr;

    gap: 14px;
  }

  .item-1,
  .item-2,
  .item-3,
  .item-4,
  .item-5,
  .item-6 {
    grid-column: span 1;
  }

  .item-1 .image-wrapper,
  .item-2 .image-wrapper,
  .item-3 .image-wrapper,
  .item-4 .image-wrapper,
  .item-5 .image-wrapper,
  .item-6 .image-wrapper {
    aspect-ratio: 4 / 3;
  }

  /*
   * En móvil mostramos el botón VER
   * de forma más sutil porque no existe hover real.
   */
  .view-button {
    opacity: 0.92;

    transform:
      translate(-50%, -50%)
      scale(0.9);
  }

  .image-caption {
    opacity: 1;

    transform: translateY(0);
  }

  .modal {
    padding: 60px 15px;
  }

  .modal-topbar {
    left: 18px;
    right: 18px;

    top: 18px;
  }

  .modal-bottom {
    left: 18px;
    right: 18px;

    bottom: 18px;
  }

  .cerrar {
    width: 40px;
    height: 40px;
  }

  .modal-img {
    max-width: 100%;
    max-height: 76vh;
  }

  .footer {
    padding: 65px 0;
  }

  .footer-row {
    padding: 0 24px;
  }

  .whatsapp-floating-btn {
    bottom: 20px;

    right: 20px;

    width: 50px;

    height: 50px;
  }

  .whatsapp-icon {
    width: 24px;

    height: 24px;
  }
}


/* =========================================================
   REDUCCIÓN DE MOVIMIENTO
========================================================= */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;

    animation-iteration-count: 1 !important;

    scroll-behavior: auto !important;

    transition-duration: 0.01ms !important;
  }
}
</style>/// <reference types="C:/Users/Usuario/Desktop/nueva pagina web/vue-project/node_modules/.vue-global-types/vue_3.5_0.d.ts" />

defineOptions({
    name: 'FotosView'
});
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
const categoria = ref('vehiculos');
const galeriaFotos = {
    vehiculos: [
        '/imagenes/galeria 1.jpeg',
        '/imagenes/galeria 2.jpeg',
        '/imagenes/galeria 3.jpeg',
        '/imagenes/galeria 4.jpeg',
        '/imagenes/galeria 5.jpeg',
        '/imagenes/galeria 6.jpeg',
        '/imagenes/galeria 7.jpeg',
        '/imagenes/galeria 8.jpeg',
        '/imagenes/galeria 9.jpeg',
        '/imagenes/galeria 10.jpeg',
        '/imagenes/galeria 11.jpeg',
        '/imagenes/galeria 12.jpeg',
        '/imagenes/galeria 14.jpeg',
        '/imagenes/galeria 15.jpeg',
        '/imagenes/galeria 16 (1).jpeg',
        '/imagenes/galeria 17.jpeg',
        '/imagenes/galeria 18.jpeg',
        '/imagenes/pisos (2).jpeg'
    ],
    equipacion: [
        '/imagenes/galeria equipacopn.jpeg',
        '/imagenes/galeria equip2.jpeg',
        '/imagenes/galeria equipo 3.jpeg',
        '/imagenes/galeria equip 4.jpeg',
        '/imagenes/galeria 13.jpeg',
        '/imagenes/pisos (3).jpeg',
        '/imagenes/pisos (6).jpeg',
        '/imagenes/pisos (5).jpeg',
        '/imagenes/pisos (8).jpeg',
        '/imagenes/pisos (10).jpeg',
        '/imagenes/pisos (11).jpeg'
    ]
};
const imagenesFiltradas = computed(() => {
    return galeriaFotos[categoria.value];
});
const imagenActiva = ref(null);
function abrir(img) {
    imagenActiva.value = img;
    document.body.style.overflow = 'hidden';
}
function cerrar() {
    imagenActiva.value = null;
    document.body.style.overflow = '';
}
function manejarEscape(event) {
    if (event.key === 'Escape' && imagenActiva.value) {
        cerrar();
    }
}
function makeSrcset(imgPath, fmt) {
    try {
        const base = imgPath
            .replace(/^\/imagenes\//, '')
            .replace(/\.[^/.]+$/, '');
        const enc = encodeURIComponent(base);
        return [400, 800, 1200]
            .map(function (size) {
            return `/imagenes/${enc}-${size}.${fmt} ${size}w`;
        })
            .join(', ');
    }
    catch (error) {
        return imgPath;
    }
}
onMounted(() => {
    window.addEventListener('keydown', manejarEscape);
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', manejarEscape);
    document.body.style.overflow = '';
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['titulo']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['activo']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-number']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['activo']} */ ;
/** @type {__VLS_StyleScopedClasses['button-number']} */ ;
/** @type {__VLS_StyleScopedClasses['button-content']} */ ;
/** @type {__VLS_StyleScopedClasses['button-content']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['activo']} */ ;
/** @type {__VLS_StyleScopedClasses['button-content']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['activo']} */ ;
/** @type {__VLS_StyleScopedClasses['button-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['item-1']} */ ;
/** @type {__VLS_StyleScopedClasses['item-2']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-6']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-3']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-4']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-5']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['image-shade']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['image-number']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['view-button']} */ ;
/** @type {__VLS_StyleScopedClasses['view-button']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['caption-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['cerrar']} */ ;
/** @type {__VLS_StyleScopedClasses['cerrar']} */ ;
/** @type {__VLS_StyleScopedClasses['cerrar']} */ ;
/** @type {__VLS_StyleScopedClasses['cerrar']} */ ;
/** @type {__VLS_StyleScopedClasses['cerrar']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-enter-active']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-img']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-leave-active']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-img']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-enter-from']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-img']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-leave-to']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-img']} */ ;
/** @type {__VLS_StyleScopedClasses['social-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['social-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-floating-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['galeria']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['item-1']} */ ;
/** @type {__VLS_StyleScopedClasses['item-2']} */ ;
/** @type {__VLS_StyleScopedClasses['item-3']} */ ;
/** @type {__VLS_StyleScopedClasses['item-4']} */ ;
/** @type {__VLS_StyleScopedClasses['item-5']} */ ;
/** @type {__VLS_StyleScopedClasses['item-6']} */ ;
/** @type {__VLS_StyleScopedClasses['item-1']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-2']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-3']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-4']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-5']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-6']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-row']} */ ;
/** @type {__VLS_StyleScopedClasses['social-hub']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-text']} */ ;
/** @type {__VLS_StyleScopedClasses['main-container']} */ ;
/** @type {__VLS_StyleScopedClasses['galeria']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-label']} */ ;
/** @type {__VLS_StyleScopedClasses['titulo']} */ ;
/** @type {__VLS_StyleScopedClasses['intro-text']} */ ;
/** @type {__VLS_StyleScopedClasses['category-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-content']} */ ;
/** @type {__VLS_StyleScopedClasses['button-content']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['item-1']} */ ;
/** @type {__VLS_StyleScopedClasses['item-2']} */ ;
/** @type {__VLS_StyleScopedClasses['item-3']} */ ;
/** @type {__VLS_StyleScopedClasses['item-4']} */ ;
/** @type {__VLS_StyleScopedClasses['item-5']} */ ;
/** @type {__VLS_StyleScopedClasses['item-6']} */ ;
/** @type {__VLS_StyleScopedClasses['item-1']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-2']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-3']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-4']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-5']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['item-6']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['view-button']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['cerrar']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-img']} */ ;
/** @type {__VLS_StyleScopedClasses['footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-row']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-floating-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)({
    ...{ class: "main-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "background-decoration" },
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "background-glow glow-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "background-glow glow-two" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "background-line line-one" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "background-line line-two" },
});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "galeria" },
});
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: "gallery-header" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header-label" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "label-dot" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "titulo" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "intro-text" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "category-selector" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.categoria = 'vehiculos';
            // @ts-ignore
            [categoria,];
        } },
    type: "button",
    ...{ class: ([
            'category-button',
            { activo: __VLS_ctx.categoria === 'vehiculos' }
        ]) },
});
// @ts-ignore
[categoria,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "button-number" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "button-content" },
});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
__VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "button-arrow" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.categoria = 'equipacion';
            // @ts-ignore
            [categoria,];
        } },
    type: "button",
    ...{ class: ([
            'category-button',
            { activo: __VLS_ctx.categoria === 'equipacion' }
        ]) },
});
// @ts-ignore
[categoria,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "button-number" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "button-content" },
});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
__VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "button-arrow" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "gallery-meta" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.categoria === 'vehiculos'
    ? 'TRABAJOS REALIZADOS'
    : 'STOCK / EQUIPAMIENTO');
// @ts-ignore
[categoria,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "meta-line" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
(__VLS_ctx.imagenesFiltradas.length);
// @ts-ignore
[imagenesFiltradas,];
const __VLS_0 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "gallery-change",
    mode: "out-in",
}));
const __VLS_2 = __VLS_1({
    name: "gallery-change",
    mode: "out-in",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "grid" },
    key: (__VLS_ctx.categoria),
});
// @ts-ignore
[categoria,];
for (const [img, index] of __VLS_getVForSourceType((__VLS_ctx.imagenesFiltradas))) {
    // @ts-ignore
    [imagenesFiltradas,];
    __VLS_asFunctionalElement(__VLS_elements.article, __VLS_elements.article)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.abrir(img);
                // @ts-ignore
                [abrir,];
            } },
        key: (`${__VLS_ctx.categoria}-${index}`),
        ...{ class: "item" },
        ...{ class: (`item-${(index % 6) + 1}`) },
    });
    // @ts-ignore
    [categoria,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "image-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_elements.picture, __VLS_elements.picture)({});
    __VLS_asFunctionalElement(__VLS_elements.source)({
        srcset: (__VLS_ctx.makeSrcset(img, 'avif')),
        type: "image/avif",
        sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    });
    // @ts-ignore
    [makeSrcset,];
    __VLS_asFunctionalElement(__VLS_elements.source)({
        srcset: (__VLS_ctx.makeSrcset(img, 'webp')),
        type: "image/webp",
        sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    });
    // @ts-ignore
    [makeSrcset,];
    __VLS_asFunctionalElement(__VLS_elements.img)({
        src: (img),
        alt: "Trabajo realizado por Beta Gráfica",
        loading: "lazy",
        decoding: "async",
        fetchpriority: "low",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "image-shade" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "image-number" },
    });
    (String(index + 1).padStart(2, '0'));
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "view-button" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        ...{ class: "view-icon" },
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "\u004d\u0031\u0032\u0020\u0035\u0063\u002d\u0035\u002e\u0035\u0020\u0030\u002d\u0039\u002e\u0035\u0020\u0034\u002e\u0035\u002d\u0031\u0030\u002e\u0035\u0020\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0043\u0032\u002e\u0035\u0020\u0031\u0033\u0020\u0036\u002e\u0035\u0020\u0031\u0039\u0020\u0031\u0032\u0020\u0031\u0039\u0073\u0039\u002e\u0035\u002d\u0034\u002e\u0035\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0031\u0030\u002e\u0035\u002d\u0037\u0043\u0032\u0031\u002e\u0035\u0020\u0039\u002e\u0035\u0020\u0031\u0037\u002e\u0035\u0020\u0035\u0020\u0031\u0032\u0020\u0035\u007a\u006d\u0030\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0031\u0031\u0061\u0034\u0020\u0034\u0020\u0030\u0020\u0031\u0020\u0031\u0020\u0030\u002d\u0038\u0020\u0034\u0020\u0034\u0020\u0030\u0020\u0030\u0020\u0031\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0030\u0020\u0038\u007a\u006d\u0030\u002d\u0032\u002e\u0032\u0061\u0031\u002e\u0038\u0020\u0031\u002e\u0038\u0020\u0030\u0020\u0031\u0020\u0030\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0030\u002d\u0033\u002e\u0036\u0020\u0031\u002e\u0038\u0020\u0031\u002e\u0038\u0020\u0030\u0020\u0030\u0020\u0030\u0020\u0030\u0020\u0033\u002e\u0036\u007a",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "image-caption" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.categoria === 'vehiculos'
        ? 'TRABAJO REALIZADO'
        : 'EQUIPAMIENTO');
    // @ts-ignore
    [categoria,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "caption-arrow" },
    });
}
var __VLS_3;
const __VLS_5 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    name: "modal",
}));
const __VLS_7 = __VLS_6({
    name: "modal",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_9 } = __VLS_8.slots;
if (__VLS_ctx.imagenActiva) {
    // @ts-ignore
    [imagenActiva,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (__VLS_ctx.cerrar) },
        ...{ class: "modal" },
    });
    // @ts-ignore
    [cerrar,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-topbar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.cerrar) },
        type: "button",
        ...{ class: "cerrar" },
        'aria-label': "Cerrar imagen",
    });
    // @ts-ignore
    [cerrar,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.img)({
        src: (__VLS_ctx.imagenActiva),
        alt: "Imagen ampliada",
        ...{ class: "modal-img" },
    });
    // @ts-ignore
    [imagenActiva,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-bottom" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
}
var __VLS_8;
__VLS_asFunctionalElement(__VLS_elements.footer, __VLS_elements.footer)({
    ...{ class: "footer" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "footer-row" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "footer-col brand-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "footer-title" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "footer-highlight" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "footer-text" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "footer-col social-hub" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "footer-title" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "social-icons" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://www.facebook.com/share/1BDXuPqTHn/",
    target: "_blank",
    rel: "noopener noreferrer",
    'aria-label': "Facebook",
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    ...{ class: "svg-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z",
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://www.instagram.com/beta_grafica/?next=%2F",
    target: "_blank",
    rel: "noopener noreferrer",
    'aria-label': "Instagram",
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    ...{ class: "svg-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "\u004d\u0031\u0032\u0020\u0032\u002e\u0031\u0036\u0033\u0063\u0033\u002e\u0032\u0030\u0034\u0020\u0030\u0020\u0033\u002e\u0035\u0038\u0034\u002e\u0030\u0031\u0032\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0034\u002e\u0038\u0035\u002e\u0030\u0037\u0020\u0033\u002e\u0032\u0035\u0032\u002e\u0031\u0034\u0038\u0020\u0034\u002e\u0037\u0037\u0031\u0020\u0031\u002e\u0036\u0039\u0031\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0034\u002e\u0039\u0031\u0039\u0020\u0034\u002e\u0039\u0031\u0039\u002e\u0030\u0035\u0038\u0020\u0031\u002e\u0032\u0036\u0035\u002e\u0030\u0036\u0039\u0020\u0031\u002e\u0036\u0034\u0035\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0030\u0036\u0039\u0020\u0034\u002e\u0038\u0034\u0039\u0020\u0030\u0020\u0033\u002e\u0032\u0030\u0035\u002d\u002e\u0030\u0031\u0032\u0020\u0033\u002e\u0035\u0038\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u002e\u0030\u0036\u0039\u0020\u0034\u002e\u0038\u0034\u0039\u002d\u002e\u0031\u0034\u0039\u0020\u0033\u002e\u0032\u0032\u0035\u002d\u0031\u002e\u0036\u0036\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0034\u002e\u0037\u0037\u0031\u002d\u0034\u002e\u0039\u0031\u0039\u0020\u0034\u002e\u0039\u0031\u0039\u002d\u0031\u002e\u0032\u0036\u0036\u002e\u0030\u0035\u0038\u002d\u0031\u002e\u0036\u0034\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0030\u0037\u002d\u0034\u002e\u0038\u0035\u002e\u0030\u0037\u002d\u0033\u002e\u0032\u0030\u0034\u0020\u0030\u002d\u0033\u002e\u0035\u0038\u0034\u002d\u002e\u0030\u0031\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0034\u002e\u0038\u0034\u0039\u002d\u002e\u0030\u0037\u002d\u0033\u002e\u0032\u0036\u002d\u002e\u0031\u0034\u0039\u002d\u0034\u002e\u0037\u0037\u0031\u002d\u0031\u002e\u0036\u0039\u0039\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0034\u002e\u0039\u0031\u0039\u002d\u0034\u002e\u0039\u0032\u002d\u002e\u0030\u0035\u0038\u002d\u0031\u002e\u0032\u0038\u002d\u002e\u0030\u0037\u002d\u0031\u002e\u0036\u0034\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u002e\u0030\u0037\u002d\u0034\u002e\u0038\u0034\u0039\u0020\u0030\u002d\u0033\u002e\u0032\u0030\u0034\u002e\u0030\u0031\u0033\u002d\u0033\u002e\u0035\u0038\u0033\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0030\u0037\u002d\u0034\u002e\u0038\u0034\u0039\u002e\u0031\u0034\u0039\u002d\u0033\u002e\u0032\u0032\u0037\u0020\u0031\u002e\u0036\u0036\u0034\u002d\u0034\u002e\u0037\u0037\u0031\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0034\u002e\u0039\u0031\u0039\u002d\u0034\u002e\u0039\u0031\u0039\u0043\u0038\u002e\u0033\u0033\u0033\u002e\u0030\u0031\u0034\u0020\u0038\u002e\u0037\u0034\u0031\u0020\u0030\u0020\u0031\u0032\u0020\u0030\u007a\u006d\u0030\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0035\u002e\u0038\u0033\u0038\u0061\u0036\u002e\u0031\u0036\u0032\u0020\u0036\u002e\u0031\u0036\u0032\u0020\u0030\u0020\u0031\u0030\u0030\u0020\u0031\u0032\u002e\u0033\u0032\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0036\u002e\u0031\u0036\u0032\u0020\u0036\u002e\u0031\u0036\u0032\u0020\u0030\u0020\u0030\u0030\u0030\u002d\u0031\u0032\u002e\u0033\u0032\u0034\u007a\u004d\u0031\u0032\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0031\u0036\u0061\u0034\u0020\u0034\u0020\u0030\u0020\u0031\u0031\u0030\u002d\u0038\u0020\u0034\u0020\u0034\u0020\u0030\u0020\u0030\u0031\u0030\u0020\u0038\u007a\u006d\u0036\u002e\u0034\u0030\u0036\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0031\u0031\u002e\u0038\u0034\u0035\u0061\u0031\u002e\u0034\u0034\u0020\u0031\u002e\u0034\u0034\u0020\u0030\u0020\u0031\u0030\u0030\u0020\u0032\u002e\u0038\u0038\u0031\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0031\u002e\u0034\u0034\u0020\u0031\u002e\u0034\u0034\u0020\u0030\u0020\u0030\u0030\u0030\u002d\u0032\u002e\u0038\u0038\u0031\u007a",
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://www.tiktok.com/@beta.grafica?_t=ZM-909zpyOoHTI&_r=1",
    target: "_blank",
    rel: "noopener noreferrer",
    'aria-label': "TikTok",
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    ...{ class: "svg-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "\u004d\u0031\u0032\u002e\u0035\u0032\u0035\u002e\u0030\u0032\u0063\u0031\u002e\u0033\u0031\u002d\u002e\u0030\u0032\u0020\u0032\u002e\u0036\u0031\u002d\u002e\u0030\u0031\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0033\u002e\u0039\u0031\u002d\u002e\u0030\u0032\u002e\u0030\u0038\u0020\u0031\u002e\u0035\u0033\u002e\u0036\u0033\u0020\u0033\u002e\u0030\u0032\u0020\u0031\u002e\u0035\u0039\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0034\u002e\u0032\u0033\u002e\u0039\u0034\u0020\u0031\u002e\u0031\u0035\u0020\u0032\u002e\u0032\u0035\u0020\u0031\u002e\u0039\u0033\u0020\u0033\u002e\u0036\u0039\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0032\u002e\u0032\u0033\u0076\u0033\u002e\u0037\u0034\u0063\u002d\u0031\u002e\u0035\u002d\u002e\u0030\u0034\u002d\u0032\u002e\u0039\u0039\u002d\u002e\u0034\u0038\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0034\u002e\u0032\u0036\u002d\u0031\u002e\u0033\u002d\u002e\u0037\u0037\u002d\u002e\u0035\u002d\u0031\u002e\u0034\u0034\u002d\u0031\u002e\u0031\u0033\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0031\u002e\u0039\u0037\u002d\u0031\u002e\u0038\u0037\u0076\u0036\u002e\u0039\u0037\u0063\u002d\u002e\u0030\u0033\u0020\u0032\u002e\u0031\u002d\u002e\u0038\u0031\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0034\u002e\u0031\u0034\u002d\u0032\u002e\u0031\u0038\u0020\u0035\u002e\u0036\u0032\u002d\u0031\u002e\u0035\u0034\u0020\u0031\u002e\u0037\u0034\u002d\u0033\u002e\u0038\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0032\u002e\u0037\u0036\u002d\u0036\u002e\u0031\u0033\u0020\u0032\u002e\u0038\u002d\u0032\u002e\u0031\u0033\u002e\u0030\u0036\u002d\u0034\u002e\u0032\u0034\u002d\u002e\u0036\u0035\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0035\u002e\u0038\u0035\u002d\u0032\u002e\u0030\u0031\u0043\u002d\u002e\u0030\u0034\u0020\u0031\u0038\u002e\u0039\u0031\u002d\u002e\u0034\u0035\u0020\u0031\u0036\u002e\u0032\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0032\u0039\u0020\u0031\u0033\u002e\u0039\u0031\u0063\u002e\u0036\u0034\u002d\u0032\u002e\u0031\u0020\u0032\u002e\u0033\u0038\u002d\u0033\u002e\u0037\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0034\u002e\u0035\u0034\u002d\u0034\u002e\u0033\u0033\u002e\u0036\u002d\u002e\u0031\u0037\u0020\u0031\u002e\u0032\u0033\u002d\u002e\u0032\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0031\u002e\u0038\u0035\u002d\u002e\u0032\u0034\u0056\u0031\u0033\u0063\u002d\u002e\u0039\u0032\u002d\u002e\u0030\u0031\u002d\u0031\u002e\u0038\u0035\u002e\u0032\u0038\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0032\u002e\u0035\u0035\u002e\u0038\u0038\u002d\u002e\u0037\u0033\u002e\u0036\u0031\u002d\u0031\u002e\u0031\u0034\u0020\u0031\u002e\u0035\u0034\u002d\u0031\u002e\u0031\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0032\u002e\u0034\u0038\u002e\u0030\u0035\u0020\u0031\u002e\u0030\u0035\u002e\u0036\u0032\u0020\u0032\u002e\u0030\u0033\u0020\u0031\u002e\u0035\u0031\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0032\u002e\u0035\u0038\u002e\u0039\u0031\u002e\u0035\u0038\u0020\u0032\u002e\u0030\u0036\u002e\u0036\u0036\u0020\u0033\u002e\u0030\u0033\u002e\u0032\u0032\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0039\u0035\u002d\u002e\u0034\u0031\u0020\u0031\u002e\u0036\u0035\u002d\u0031\u002e\u0032\u0038\u0020\u0031\u002e\u0038\u0038\u002d\u0032\u002e\u0032\u0039\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0030\u0037\u002d\u002e\u0033\u0036\u002e\u0031\u002d\u002e\u0037\u0033\u002e\u0030\u0039\u002d\u0031\u002e\u0031\u0056\u0030\u006c\u002e\u0030\u0031\u002e\u0030\u0032\u007a",
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "https://wa.me/5493564652137",
    target: "_blank",
    rel: "noopener noreferrer",
    ...{ class: "whatsapp-floating-btn" },
    'aria-label': "Contactar por WhatsApp",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "pulse-ring" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
    ...{ class: "whatsapp-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "\u004d\u002e\u0030\u0035\u0037\u0020\u0032\u0034\u006c\u0031\u002e\u0036\u0038\u0037\u002d\u0036\u002e\u0031\u0036\u0033\u0063\u002d\u0031\u002e\u0030\u0034\u0031\u002d\u0031\u002e\u0038\u0030\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0031\u002e\u0035\u0038\u0038\u002d\u0033\u002e\u0038\u0034\u0039\u002d\u0031\u002e\u0035\u0038\u0037\u002d\u0035\u002e\u0039\u0034\u0036\u0043\u002e\u0030\u0036\u0020\u0035\u002e\u0033\u0034\u0038\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0035\u002e\u0033\u0039\u0037\u002e\u0030\u0031\u0020\u0031\u0032\u002e\u0030\u0030\u0038\u002e\u0030\u0031\u0063\u0033\u002e\u0032\u0030\u0032\u002e\u0030\u0030\u0031\u0020\u0036\u002e\u0032\u0031\u0032\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0031\u002e\u0032\u0034\u0036\u0020\u0038\u002e\u0034\u0037\u0037\u0020\u0033\u002e\u0035\u0031\u0033\u0020\u0032\u002e\u0032\u0036\u0036\u0020\u0032\u002e\u0032\u0036\u0038\u0020\u0033\u002e\u0035\u0030\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0035\u002e\u0032\u0038\u0020\u0033\u002e\u0035\u0030\u0035\u0020\u0038\u002e\u0034\u0038\u0034\u002d\u002e\u0030\u0030\u0034\u0020\u0036\u002e\u0036\u0035\u0037\u002d\u0035\u002e\u0033\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0031\u0031\u002e\u0039\u0039\u0037\u002d\u0031\u0031\u002e\u0039\u0035\u0033\u0020\u0031\u0031\u002e\u0039\u0039\u0037\u002d\u0032\u002e\u0030\u0030\u0035\u002d\u002e\u0030\u0030\u0031\u002d\u0033\u002e\u0039\u0037\u0033\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u002e\u0035\u0030\u0032\u002d\u0035\u002e\u0037\u0031\u0033\u002d\u0031\u002e\u0034\u0035\u0035\u004c\u0030\u0020\u0032\u0034\u007a\u006d\u0036\u002e\u0035\u0039\u002d\u0034\u002e\u0038\u0034\u0036\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0063\u0031\u002e\u0036\u0036\u002e\u0039\u0038\u0036\u0020\u0033\u002e\u0032\u0039\u0032\u0020\u0031\u002e\u0034\u0039\u0033\u0020\u0034\u002e\u0037\u0034\u0031\u0020\u0031\u002e\u0034\u0039\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0035\u002e\u0034\u0032\u0038\u0020\u0030\u0020\u0039\u002e\u0038\u0034\u0037\u002d\u0034\u002e\u0034\u0031\u0020\u0039\u002e\u0038\u0034\u0039\u002d\u0039\u002e\u0038\u0033\u0036\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0030\u0030\u0031\u002d\u0032\u002e\u0036\u0032\u0038\u002d\u0031\u002e\u0030\u0032\u002d\u0035\u002e\u0031\u002d\u0032\u002e\u0038\u0037\u0037\u002d\u0036\u002e\u0039\u0036\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0043\u0031\u0036\u002e\u0034\u0034\u0034\u0020\u0031\u002e\u0039\u0038\u0020\u0031\u0033\u002e\u0039\u0037\u0034\u0020\u0031\u002e\u0035\u0037\u0020\u0031\u0032\u002e\u0030\u0030\u0038\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0031\u002e\u0035\u0037\u0063\u002d\u0035\u002e\u0034\u0033\u0020\u0030\u002d\u0039\u002e\u0038\u0035\u0020\u0034\u002e\u0034\u0031\u002d\u0039\u002e\u0038\u0035\u0032\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0039\u002e\u0038\u0033\u0037\u002d\u002e\u0030\u0030\u0031\u0020\u0031\u002e\u0038\u0031\u0032\u002e\u0034\u0038\u0037\u0020\u0033\u002e\u0035\u0039\u0031\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0031\u002e\u0034\u0031\u0031\u0020\u0035\u002e\u0031\u0037\u006c\u002d\u002e\u0039\u0035\u0033\u0020\u0033\u002e\u0034\u0037\u0038\u0020\u0033\u002e\u0035\u0033\u0033\u002d\u002e\u0039\u0032\u0035\u007a\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u004d\u0031\u0037\u002e\u0034\u0036\u0037\u0020\u0031\u0034\u002e\u0033\u0063\u002d\u002e\u0032\u0039\u0037\u002d\u002e\u0031\u0034\u0039\u002d\u0031\u002e\u0037\u0035\u0038\u002d\u002e\u0038\u0036\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0032\u002e\u0030\u0033\u002d\u002e\u0039\u0036\u0037\u002d\u002e\u0032\u0037\u0033\u002d\u002e\u0030\u0039\u0039\u002d\u002e\u0034\u0037\u0031\u002d\u002e\u0031\u0034\u0038\u002d\u002e\u0036\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0031\u0035\u002d\u002e\u0031\u0039\u0037\u002e\u0032\u0039\u0037\u002d\u002e\u0037\u0036\u0037\u002e\u0039\u0036\u0036\u002d\u002e\u0039\u0034\u0020\u0031\u002e\u0031\u0036\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u002e\u0031\u0037\u0033\u002e\u0031\u0039\u0039\u002d\u002e\u0033\u0034\u0037\u002e\u0032\u0032\u0033\u002d\u002e\u0036\u0034\u0034\u002e\u0030\u0037\u0035\u002d\u002e\u0032\u0039\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u002e\u0031\u0035\u002d\u0031\u002e\u0032\u0035\u0035\u002d\u002e\u0034\u0036\u0033\u002d\u0032\u002e\u0033\u0039\u002d\u0031\u002e\u0034\u0037\u0035\u002d\u002e\u0038\u0038\u0033\u002d\u002e\u0037\u0038\u0038\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0031\u002e\u0034\u0038\u002d\u0031\u002e\u0037\u0036\u0031\u002d\u0031\u002e\u0036\u0035\u0033\u002d\u0032\u002e\u0030\u0035\u0039\u002d\u002e\u0031\u0037\u0033\u002d\u002e\u0032\u0039\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u002e\u0030\u0031\u0038\u002d\u002e\u0034\u0035\u0038\u002e\u0031\u0033\u002d\u002e\u0036\u0030\u0036\u002e\u0031\u0033\u0034\u002d\u002e\u0031\u0033\u0033\u002e\u0032\u0039\u0038\u002d\u002e\u0033\u0034\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0034\u0034\u0036\u002d\u002e\u0035\u0032\u002e\u0031\u0034\u0039\u002d\u002e\u0031\u0037\u0034\u002e\u0031\u0039\u0038\u002d\u002e\u0032\u0039\u0038\u002e\u0032\u0039\u0038\u002d\u002e\u0034\u0039\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0030\u0039\u0039\u002d\u002e\u0031\u0039\u0038\u002e\u0030\u0035\u002d\u002e\u0033\u0037\u0031\u002d\u002e\u0030\u0032\u0035\u002d\u002e\u0035\u0032\u002d\u002e\u0030\u0037\u0035\u002d\u002e\u0031\u0034\u0039\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u002e\u0036\u0036\u0039\u002d\u0031\u002e\u0036\u0031\u0032\u002d\u002e\u0039\u0031\u0036\u002d\u0032\u002e\u0032\u0030\u0037\u002d\u002e\u0032\u0034\u0032\u002d\u002e\u0035\u0037\u0039\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u002e\u0034\u0038\u0037\u002d\u002e\u0035\u0030\u0031\u002d\u002e\u0036\u0036\u0039\u002d\u002e\u0035\u0031\u006c\u002d\u002e\u0035\u0037\u002d\u002e\u0030\u0031\u0063\u002d\u002e\u0031\u0039\u0038\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0030\u002d\u002e\u0035\u0032\u002e\u0030\u0037\u0034\u002d\u002e\u0037\u0039\u0032\u002e\u0033\u0037\u0032\u0073\u002d\u0031\u002e\u0030\u0034\u0020\u0031\u002e\u0030\u0031\u0036\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u0031\u002e\u0030\u0034\u0020\u0032\u002e\u0034\u0037\u0039\u0020\u0031\u002e\u0030\u0036\u0035\u0020\u0032\u002e\u0038\u0037\u0036\u0020\u0031\u002e\u0032\u0031\u0033\u0020\u0033\u002e\u0030\u0037\u0034\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0063\u002e\u0031\u0034\u0039\u002e\u0031\u0039\u0038\u0020\u0032\u002e\u0030\u0039\u0036\u0020\u0033\u002e\u0032\u0020\u0035\u002e\u0030\u0037\u0037\u0020\u0034\u002e\u0034\u0038\u0037\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0037\u0030\u0039\u002e\u0033\u0030\u0036\u0020\u0031\u002e\u0032\u0036\u0032\u002e\u0034\u0038\u0039\u0020\u0031\u002e\u0036\u0039\u0034\u002e\u0036\u0032\u0035\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0037\u0031\u0032\u002e\u0032\u0032\u0037\u0020\u0031\u002e\u0033\u0036\u002e\u0031\u0039\u0035\u0020\u0031\u002e\u0038\u0037\u0031\u002e\u0031\u0031\u0038\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0035\u0037\u0031\u002d\u002e\u0030\u0038\u0035\u0020\u0031\u002e\u0037\u0035\u0038\u002d\u002e\u0037\u0031\u0039\u0020\u0032\u002e\u0030\u0030\u0036\u002d\u0031\u002e\u0034\u0031\u0033\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002e\u0032\u0034\u0038\u002d\u002e\u0036\u0039\u0034\u002e\u0032\u0034\u0038\u002d\u0031\u002e\u0032\u0038\u0039\u002e\u0031\u0037\u0033\u002d\u0031\u002e\u0034\u0031\u0033\u000d\u000a\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u002d\u002e\u0030\u0037\u0034\u002d\u002e\u0031\u0032\u0034\u002d\u002e\u0032\u0037\u0032\u002d\u002e\u0031\u0039\u0038\u002d\u002e\u0035\u0037\u002d\u002e\u0033\u0034\u0037\u007a",
});
/** @type {__VLS_StyleScopedClasses['main-container']} */ ;
/** @type {__VLS_StyleScopedClasses['background-decoration']} */ ;
/** @type {__VLS_StyleScopedClasses['background-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['glow-one']} */ ;
/** @type {__VLS_StyleScopedClasses['background-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['glow-two']} */ ;
/** @type {__VLS_StyleScopedClasses['background-line']} */ ;
/** @type {__VLS_StyleScopedClasses['line-one']} */ ;
/** @type {__VLS_StyleScopedClasses['background-line']} */ ;
/** @type {__VLS_StyleScopedClasses['line-two']} */ ;
/** @type {__VLS_StyleScopedClasses['galeria']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-label']} */ ;
/** @type {__VLS_StyleScopedClasses['label-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['titulo']} */ ;
/** @type {__VLS_StyleScopedClasses['intro-text']} */ ;
/** @type {__VLS_StyleScopedClasses['category-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['activo']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-number']} */ ;
/** @type {__VLS_StyleScopedClasses['button-content']} */ ;
/** @type {__VLS_StyleScopedClasses['button-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['activo']} */ ;
/** @type {__VLS_StyleScopedClasses['category-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-number']} */ ;
/** @type {__VLS_StyleScopedClasses['button-content']} */ ;
/** @type {__VLS_StyleScopedClasses['button-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-line']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['image-shade']} */ ;
/** @type {__VLS_StyleScopedClasses['image-number']} */ ;
/** @type {__VLS_StyleScopedClasses['view-button']} */ ;
/** @type {__VLS_StyleScopedClasses['view-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['caption-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cerrar']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-img']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-row']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-col']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-info']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-text']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-col']} */ ;
/** @type {__VLS_StyleScopedClasses['social-hub']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
/** @type {__VLS_StyleScopedClasses['social-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-floating-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        categoria: categoria,
        imagenesFiltradas: imagenesFiltradas,
        imagenActiva: imagenActiva,
        abrir: abrir,
        cerrar: cerrar,
        makeSrcset: makeSrcset,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
