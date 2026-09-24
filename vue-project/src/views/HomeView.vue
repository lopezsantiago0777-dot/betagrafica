
<template>
  <!-- CARRUSEL FULLSCREEN -->
  <div>
    <!-- CARRUSEL FULLSCREEN -->
    <main class="main-carousel">
      <div class="carousel-background">
        <div
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="carousel-slide"
          :class="{ active: currentSlide === index }"
        >
          <video
            v-if="slide.type === 'video'"
            autoplay
            muted
            loop
            playsinline
            class="carousel-media"
          >
            <source src="/imagenes/videobeta.mp4" type="video/mp4" />
          </video>

          <img
            v-else
            :src="makeImageSrc(slide.image ?? '')"
            :alt="slide.title"
            class="carousel-media"
          />
        </div>
      </div>

      <div class="carousel-overlay"></div>

      <div class="carousel-content">
        <Transition name="content-fade" mode="out-in">
          <div :key="slides[currentSlide].id" class="slide-info">
            <span class="slide-number">
              {{ String(currentSlide + 1).padStart(2, '0') }}
              /
              {{ String(slides.length).padStart(2, '0') }}
            </span>

            <h2>{{ slides[currentSlide].eyebrow }}</h2>
            <h1>{{ slides[currentSlide].title }}</h1>
            <p>{{ slides[currentSlide].description }}</p>

            <RouterLink
              v-if="slides[currentSlide].buttonText"
              :to="slides[currentSlide].buttonLink"
              class="carousel-button"
            >
              {{ slides[currentSlide].buttonText }}
            </RouterLink>
          </div>
        </Transition>
      </div>

      <button
        class="carousel-arrow carousel-arrow-left"
        @click="previousSlide"
        aria-label="Imagen anterior"
      >
        -
      </button>

      <button
        class="carousel-arrow carousel-arrow-right"
        @click="nextSlide"
        aria-label="Imagen siguiente"
      >
        +
      </button>

      <div class="carousel-dots">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="carousel-dot"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
          :aria-label="`Ir a slide ${index + 1}`"
        ></button>
      </div>

      <div class="scroll-indicator">
        <span></span>
        SCROLL
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isScrolled = ref(false)
const isMenuOpen = ref(false)
const currentSlide = ref(0)

let observer: IntersectionObserver
let carouselTimer: ReturnType<typeof setInterval> | null = null

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
    description:
      'Calidad premium y precisión milimétrica en cada impresión desde 1997.',
    buttonText: 'Conozca la Empresa',
    buttonLink: '/beta'
  },
  {
    id: 'servicios',
    type: 'image',
    image: 'fondoploteados.jpeg',
    eyebrow: 'SERVICIOS CORPORATIVOS',
    title: 'Precisión en cada detalle.',
    description:
      'Ingeniería en ploteado, corte computarizado y montaje industrial.',
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
    description:
      'Soluciones pensadas para soportar las condiciones más exigentes.',
    buttonText: 'Ver Catálogo',
    buttonLink: '/ventas'
  },
  {
    id: 'pisos-3',
    type: 'image',
    image: 'pisos (9).jpeg',
    eyebrow: 'DISEÑO ESPECIAL',
    title: 'Diseño que transforma espacios.',
    description:
      'Terminaciones especiales adaptadas a cada proyecto.',
    buttonText: 'Ver Catálogo',
    buttonLink: '/ventas'
  },
  {
    id: 'pisos-4',
    type: 'image',
    image: 'pisos (7).jpeg',
    eyebrow: 'REVESTIMIENTOS PREMIUM',
    title: 'Terminaciones de alto nivel.',
    description:
      'Revestimientos premium para proyectos que requieren máxima calidad.',
    buttonText: 'Ver Catálogo',
    buttonLink: '/ventas'
  }
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.length
  restartCarousel()
}

function previousSlide() {
  currentSlide.value =
    (currentSlide.value - 1 + slides.length) % slides.length
  restartCarousel()
}

function goToSlide(index: number) {
  currentSlide.value = index
  restartCarousel()
}

function startCarousel() {
  carouselTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 6500)
}

function restartCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer)
  }

  startCarousel()
}

function makeImageSrc(fileName: string) {
  return '/imagenes/' + encodeURIComponent(fileName)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })

  startCarousel()

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -20px 0px'
    }
  )

  document
    .querySelectorAll('.fade-in')
    .forEach(el => observer.observe(el))
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)

  if (observer) {
    observer.disconnect()
  }

  if (carouselTimer) {
    clearInterval(carouselTimer)
  }
})
</script>

<style>
:root {
  --canvas-dark: #030408;
  --panel-bg: rgba(10, 12, 22, 0.6);
  --neon-cyan: #06b6d4;
  --neon-blue: #2563eb;
  --text-primary: #f8fafc;
  --text-muted: #94a3b8;
  --premium-curve: cubic-bezier(0.16, 1, 0.3, 1);
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--canvas-dark);
  color: var(--text-primary);
  scroll-behavior: smooth;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  box-sizing: border-box;
}

/* =========================
   NAVBAR
   ========================= */

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2100;
  padding: 22px 0;
  background: rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  transition:
    padding 0.4s ease,
    background 0.4s ease;
}

.header.scrolled {
  padding: 14px 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #fff;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
  display: block;
}

.logo span {
  font-weight: 300;
  color: #cbd5e1;
}

.nav-menu ul {
  display: flex;
  align-items: center;
  gap: 30px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-menu a {
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: color 0.3s ease;
  position: relative;
  padding: 8px 0;
}

.nav-menu a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: #fff;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s var(--premium-curve);
}

.nav-menu a:hover {
  color: #fff;
}

.nav-menu a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.nav-cta a {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 8px 18px;
  border-radius: 999px;
  color: #fff;
}

.nav-cta a::after {
  display: none;
}

.nav-cta a:hover {
  background: #fff;
  border-color: #fff;
  color: #000;
}

/* =========================
   CARRUSEL FULLSCREEN
   ========================= */

.main-carousel {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 650px;
  overflow: hidden;
  background: #000;
}

.carousel-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  transform: scale(1.06);
  transition:
    opacity 1.4s ease,
    transform 7s cubic-bezier(0.16, 1, 0.3, 1),
    visibility 1.4s;
  z-index: 0;
}

.carousel-slide.active {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
  z-index: 1;
}

.carousel-media {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.78) 0%,
      rgba(0, 0, 0, 0.50) 35%,
      rgba(0, 0, 0, 0.20) 70%,
      rgba(0, 0, 0, 0.40) 100%
    );
  pointer-events: none;
}

.carousel-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.75) 0%,
    transparent 40%
  );
}

.carousel-content {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 120px clamp(30px, 8vw, 140px) 100px;
}

.slide-info {
  width: min(800px, 90vw);
}

.slide-number {
  display: block;
  margin-bottom: 25px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 4px;
}

.slide-info h2 {
  margin: 0 0 18px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 5px;
  text-transform: uppercase;
}

.slide-info h1 {
  margin: 0;
  max-width: 900px;
  color: #fff;
  font-size: clamp(45px, 7vw, 92px);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -3px;
  text-shadow: 0 5px 30px rgba(0, 0, 0, 0.4);
}

.slide-info p {
  max-width: 620px;
  margin: 28px 0 35px;
  color: rgba(255, 255, 255, 0.85);
  font-size: clamp(15px, 1.4vw, 19px);
  line-height: 1.7;
}

.carousel-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 190px;
  padding: 16px 28px;
  box-sizing: border-box;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition:
    background 0.35s ease,
    color 0.35s ease,
    transform 0.35s ease,
    border-color 0.35s ease;
}

.carousel-button:hover {
  color: #000;
  background: #fff;
  border-color: #fff;
  transform: translateY(-3px);
}

.content-fade-enter-active,
.content-fade-leave-active {
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* =========================
   FLECHAS
   ========================= */

.carousel-arrow {
  position: absolute;
  top: 50%;
  z-index: 10;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 35px;
  font-weight: 200;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    transform 0.3s ease;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-50%) scale(1.08);
}

.carousel-arrow-left {
  left: 30px;
}

.carousel-arrow-right {
  right: 30px;
}

/* =========================
   INDICADORES
   ========================= */

.carousel-dots {
  position: absolute;
  left: 50%;
  bottom: 35px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateX(-50%);
}

.carousel-dot {
  width: 28px;
  height: 2px;
  padding: 0;
  border: 0;
  background: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition:
    width 0.4s ease,
    background 0.4s ease;
}

.carousel-dot.active {
  width: 55px;
  background: #fff;
}

/* =========================
   SCROLL
   ========================= */

.scroll-indicator {
  position: absolute;
  right: 40px;
  bottom: 35px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 3px;
}

.scroll-indicator span {
  display: block;
  width: 35px;
  height: 1px;
  background: rgba(255, 255, 255, 0.6);
}

/* =========================
   FOOTER
   ========================= */

.footer {
  background-color: #020306;
  padding: 100px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.02);
  position: relative;
  z-index: 10;
}

.footer-row {
  display: flex;
  flex-wrap: wrap;
  gap: 50px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.footer-col {
  flex: 1 1 240px;
}

.footer h3 {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #fff;
  margin-top: 0;
  margin-bottom: 24px;
  text-transform: uppercase;
}

.footer p {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-muted);
  margin: 0 0 12px;
}

.footer-highlight {
  color: var(--neon-cyan) !important;
  font-weight: 700;
}

.footer a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer a:hover {
  color: #fff;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.social-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
  background-color: #05070c;
  border: 1px solid rgba(255, 255, 255, 0.03);
  color: var(--text-muted);
  transition: all 0.4s var(--premium-curve);
}

.svg-icon {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

.social-icons a:hover {
  color: #fff;
  background-color: var(--neon-blue);
  border-color: var(--neon-blue);
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(37, 99, 235, 0.3);
}

.mt-15 {
  margin-top: 15px;
}

.mt-25 {
  margin-top: 25px;
}

/* =========================
   RESPONSIVE
   ========================= */

.mobile-toggle {
  display: none;
  background: transparent;
  border: 0;
  cursor: pointer;
  position: relative;
  z-index: 2200;
  width: 24px;
  height: 16px;
  padding: 0;
}

.mobile-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background: #fff;
  position: absolute;
  transition:
    transform 0.3s var(--premium-curve),
    opacity 0.3s var(--premium-curve),
    top 0.3s var(--premium-curve);
}

.mobile-toggle span:nth-child(1) {
  top: 0;
}

.mobile-toggle span:nth-child(2) {
  top: 7px;
}

.mobile-toggle span:nth-child(3) {
  top: 14px;
}

.mobile-toggle.active span:nth-child(1) {
  top: 7px;
  transform: rotate(45deg);
}

.mobile-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active span:nth-child(3) {
  top: 7px;
  transform: rotate(-45deg);
}

@media (max-width: 1100px) {
  .mobile-toggle {
    display: block;
  }

  .nav-menu ul {
    display: flex;
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100vh;
    box-sizing: border-box;
    background: rgba(4, 6, 12, 0.96);
    backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    padding: 110px 40px;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    transform: translateX(100%);
    transition: transform 0.5s var(--premium-curve);
    z-index: 2150;
  }

  .nav-menu ul.open {
    transform: translateX(0);
  }

  .nav-menu a {
    width: 100%;
    display: block;
    padding: 10px 0;
    font-size: 13px;
  }

  .nav-menu a::after {
    bottom: 4px;
  }

  .nav-cta {
    width: 100%;
    margin-top: 10px;
  }

  .nav-cta a {
    text-align: center;
  }

  .footer-row {
    gap: 35px;
  }

  .social-col {
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 22px;
  }

  .header {
    padding: 18px 0;
  }

  .header.scrolled {
    padding: 12px 0;
  }

  .logo {
    font-size: 18px;
    gap: 10px;
  }

  .logo-img {
    height: 28px;
  }

  .main-carousel {
    min-height: 600px;
  }

  .carousel-content {
    align-items: center;
    padding: 110px 24px 100px;
  }

  .slide-info {
    width: 100%;
  }

  .slide-info h1 {
    font-size: clamp(42px, 13vw, 70px);
    letter-spacing: -2px;
  }

  .slide-info p {
    font-size: 15px;
    line-height: 1.6;
  }

  .carousel-arrow {
    width: 38px;
    height: 38px;
    font-size: 26px;
    border-width: 1px;
    background: rgba(0, 0, 0, 0.28);
  }

  .carousel-arrow-left {
    left: 12px;
    top: auto;
    bottom: 80px;
    transform: translateY(0);
  }

  .carousel-arrow-right {
    right: 12px;
    top: auto;
    bottom: 80px;
    transform: translateY(0);
  }

  .carousel-arrow:hover {
    transform: scale(1.04);
  }

  .carousel-dots {
    bottom: 22px;
  }

  .scroll-indicator {
    display: none;
  }

  .footer {
    padding: 70px 0;
  }

  .footer-row {
    padding: 0 24px;
  }
}
</style>
