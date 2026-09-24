<script setup>
import { ref } from 'vue'

const heroImage = ref('/imagenes/vinilos.jpeg')
const heroImageAlt = ref('Insumos gráficos')
</script>

<template>
  <div class="beta-home" id="inicio">
    <!-- HERO -->
    <main>
      <section class="hero">
        <div class="hero-image">
          <img :src="heroImage" :alt="heroImageAlt" />
        </div>

        <div class="hero-content container">
          <div class="hero-copy">
            <div class="hero-eyebrow eyebrow"></div>
            <div class="divider hero-divider"></div>

            <h1 class="hero-title">
              INSUMOS
              <span>GRÁFICOS</span>
            </h1>

            <p class="hero-subtitle">DE VANGUARDIA</p>

            <p class="hero-description">
              Como tu proveedor integral, ofrecemos una extensa gama de insumos para satisfacer tus necesidades creativas. Productos de alta calidad diseñados para la precisión milimétrica.
            </p>

            <div class="hero-actions">
              <a href="/ventas" class="btn btn-primary">
                <span>VER PRODUCTOS</span>
                <span class="btn-arrow">→</span>
              </a>

              <a href="https://wa.me/5493564652137" class="btn btn-link">
                <span>CONTACTANOS</span>
                <span class="external">↗</span>
              </a>
            </div>

            <div class="hero-stats">
              <div class="stat">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="5" width="16" height="16" rx="1.5"></rect>
                  <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5"></path>
                </svg>
                <span class="stat-value">27+</span>
                <span class="stat-label">AÑOS DE<br>EXPERIENCIA</span>
              </div>

              <div class="stat">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"></path>
                  <path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"></path>
                </svg>
                <span class="stat-value">2500+</span>
                <span class="stat-label">PRODUCTOS<br>DISPONIBLES</span>
              </div>

              <div class="stat">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="9" cy="8" r="3"></circle>
                  <path d="M3.5 20c0-3.1 2.4-5.5 5.5-5.5s5.5 2.4 5.5 5.5"></path>
                  <circle cx="17" cy="9" r="2.4"></circle>
                  <path d="M15 14.8c2.8-.7 5.5 1.3 5.5 4.2"></path>
                </svg>
                <span class="stat-value">5000+</span>
                <span class="stat-label">CLIENTES<br>SATISFECHOS</span>
              </div>

              <div class="stat">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3 19 6v5.4c0 4.5-2.9 7.7-7 9.6-4.1-1.9-7-5.1-7-9.6V6l7-3Z"></path>
                  <path d="m8.5 12 2.2 2.2 4.8-5"></path>
                </svg>
                <span class="stat-value">100%</span>
                <span class="stat-label">CALIDAD<br>GARANTIZADA</span>
              </div>
            </div>
          </div>
        </div>
</section>

      <!-- HISTORIA -->
      <section class="history" id="nosotros">
        <div class="container history-grid">
          <div class="history-heading">
            <div class="eyebrow">NUESTRA HISTORIA</div>
            <h2>
              EVOLUCIÓN
              <span>QUE NOS DEFINE</span>
            </h2>
            <div class="divider"></div>
          </div>

          <div class="history-copy">
            Nacimos como una propuesta dedicada exclusivamente a las rotulaciones adhesivas. Con el tiempo, incorporamos impresiones digitales y la venta mayorista de insumos.
          </div>

          <div class="history-highlight">
            Hoy, <strong>Beta Gráfica</strong> es la marca madre que une tres áreas complementarias para ofrecer una solución 360° en la industria gráfica integral.
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="footer" id="contacto">
        <div class="container footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              BETA
              <span>GRÁFICA</span>
            </div>
            <p>Industria Gráfica Integral<br>Desde 1997</p>
          </div>

          <div class="footer-links">
            <div>
              <h3 class="footer-title">ENLACES</h3>
              <a href="/">Inicio</a>
              <a href="/ventas">Productos</a>
              <a href="/beta">Nosotros</a>
            </div>
            <div>
              <h3 class="footer-title">&nbsp;</h3>
              <a href="https://wa.me/5493564652137">Contacto</a>
            </div>
          </div>

          <div class="footer-social">
            <h3 class="footer-title">SEGUINOS</h3>
            <div class="social-list">
              <a href="https://www.facebook.com/share/1BDXuPqTHn/" target="_blank" aria-label="Facebook" class="social-link">f</a>
              <a href="https://www.instagram.com/beta_grafica/?next=%2F" target="_blank" aria-label="Instagram" class="social-link">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6.5-8.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM12 2c3.27 0 3.67.01 4.96.07 1.2.05 2.03.25 2.75.53a5.56 5.56 0 0 1 1.99 1.3 5.56 5.56 0 0 1 1.3 1.99c.28.72.48 1.55.53 2.75.06 1.29.07 1.69.07 4.96s-.01 3.67-.07 4.96c-.05 1.2-.25 2.03-.53 2.75a5.56 5.56 0 0 1-1.3 1.99 5.56 5.56 0 0 1-1.99 1.3c-.72.28-1.55.48-2.75.53-1.29.06-1.69.07-4.96.07s-3.67-.01-4.96-.07c-1.2-.05-2.03-.25-2.75-.53a5.56 5.56 0 0 1-1.99-1.3A5.56 5.56 0 0 1 1 19.31c-.28-.72-.48-1.55-.53-2.75C.41 15.27.4 14.87.4 11.6s.01-3.67.07-4.96C.52 5.44.72 4.61 1 3.89a5.56 5.56 0 0 1 1.3-1.99A5.56 5.56 0 0 1 4.29.6C5.01.32 5.84.12 7.04.07 8.33.01 8.73 0 12 0Z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@beta.grafica" target="_blank" aria-label="TikTok" class="social-link">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2h3.1c.24 1.8 1.22 3.43 2.73 4.47A8.25 8.25 0 0 0 22 7.38v3.24a11.2 11.2 0 0 1-4.9-1.5v6.03A6.85 6.85 0 1 1 11.15 8.3v3.34a3.5 3.5 0 1 0 2.85 3.44V2Z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div class="container footer-bottom">
          <p class="copyright">© 2024 Beta Gráfica. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>

    <!-- WHATSAPP: URL ORIGINAL CONSERVADA -->
    <a
      href="https://wa.me/5493564652137"
      target="_blank"
      class="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.292 1.493 4.741 1.494 5.428 0 9.847-4.41 9.849-9.836.001-2.628-1.02-5.1-2.877-6.96C16.444 1.98 13.974 1.57 12.008 1.57c-5.43 0-9.85 4.41-9.852 9.837-.001 1.812.487 3.591 1.411 5.17l-.953 3.478 3.533-.925zM17.467 14.3c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      </svg>
    </a>
  </div>
</template>

<style scoped>
/* =========================================================
   BETA GRÁFICA — DESKTOP GRANDE + RESPONSIVE REAL
   Una sola imagen principal. Sin mini-carrusel.
   ========================================================= */

:global(*) {
  box-sizing: border-box;
}

:global(html) {
  scroll-behavior: smooth;
}

:global(body) {
  margin: 0;
  min-width: 320px;
  background: #101214;
  color: #f1f3f4;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

:global(img) {
  display: block;
  max-width: 100%;
}

.beta-home {
  --bg: #101214;
  --surface: #171a1d;
  --text: #f1f3f4;
  --muted: #aeb6bc;
  --accent: #650d20;
  --accent-dark: #430814;
  --line: #353b40;
  --content-max: 1480px;

  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
}

.container {
  width: min(calc(100% - clamp(44px, 8vw, 150px)), var(--content-max));
  margin-inline: auto;
}

/* =========================================================
   LOGO
   ========================================================= */

.site-header {
  position: absolute;
  z-index: 20;
  inset: 0 0 auto;
  height: clamp(90px, 8vw, 125px);
  pointer-events: none;
}

.header-container {
  width: min(calc(100% - clamp(44px, 7vw, 110px)), var(--content-max));
  height: 100%;
  margin-inline: auto;
  display: flex;
  align-items: flex-start;
}

.brand {
  display: flex;
  flex-direction: column;
  width: max-content;
  margin-top: clamp(28px, 3vw, 48px);
  color: #f0f2f3;
  font-size: clamp(21px, 2vw, 31px);
  font-weight: 800;
  letter-spacing: -.055em;
  line-height: .82;
  text-transform: uppercase;
  pointer-events: auto;
}

.brand span:last-child {
  font-weight: 800;
}

/* =========================================================
   GENERALES
   ========================================================= */

.eyebrow {
  color: #aeb7bd;
  font-size: clamp(12px, .95vw, 16px);
  font-weight: 400;
  letter-spacing: .18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.divider {
  width: clamp(32px, 3vw, 44px);
  height: 2px;
  background: var(--accent);
}

/* =========================================================
   HERO — ESCALA CON LA PANTALLA
   ========================================================= */

.hero {
  position: relative;
  min-height: clamp(720px, 91vh, 980px);
  overflow: hidden;
  background: #101214;
}

.hero-image {
  position: absolute;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 58% center;
  filter: saturate(.72) contrast(.97);
  transform: scale(1.015);
}

.hero-image::after {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background:
    linear-gradient(
      90deg,
      #101214 0%,
      rgba(16,18,20,.98) 7%,
      rgba(16,18,20,.91) 16%,
      rgba(16,18,20,.70) 27%,
      rgba(16,18,20,.34) 39%,
      rgba(16,18,20,0) 57%
    ),
    linear-gradient(
      180deg,
      rgba(0,0,0,.20),
      rgba(0,0,0,0) 34%,
      rgba(0,0,0,.12) 100%
    );
}

.hero::before {
  position: absolute;
  z-index: 1;
  inset: 0;
  content: "";
  pointer-events: none;
  background:
    radial-gradient(
      ellipse at 32% 72%,
      rgba(255,255,255,.055) 0%,
      rgba(255,255,255,.025) 18%,
      rgba(255,255,255,0) 42%
    );
}

.hero-content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: flex-start;
  min-height: clamp(720px, 91vh, 980px);
  padding-top: clamp(145px, 14vh, 205px);
}

.hero-copy {
  width: clamp(480px, 40vw, 610px);
  max-width: 48%;
}

.hero-eyebrow {
  margin-bottom: clamp(18px, 2vw, 28px);
}

.hero-title {
  max-width: 100%;
  margin: clamp(18px, 2vw, 28px) 0 0;
  color: #f5f6f7;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(68px, 6.2vw, 102px);
  font-weight: 800;
  letter-spacing: -.068em;
  line-height: .88;
  text-transform: uppercase;
}

.hero-title span {
  display: block;
  font-weight: 300;
  letter-spacing: -.055em;
}

.hero-subtitle {
  margin: clamp(14px, 1.4vw, 20px) 0 0;
  color: #d8dde0;
  font-size: clamp(23px, 2.2vw, 34px);
  font-weight: 300;
  letter-spacing: .19em;
  line-height: 1.05;
  text-transform: uppercase;
}

.hero-description {
  width: min(100%, 520px);
  margin: clamp(38px, 4vw, 58px) 0 0;
  color: #a8b1b7;
  font-size: clamp(13px, 1vw, 16px);
  font-weight: 400;
  line-height: 1.72;
}

.hero-description::before {
  display: block;
  width: clamp(145px, 15vw, 190px);
  height: 1px;
  margin-bottom: clamp(20px, 2vw, 28px);
  content: "";
  background: repeating-linear-gradient(
    90deg,
    #92979b 0 2px,
    transparent 2px 7px
  );
}

/* =========================================================
   BOTONES — UNO SOLO BORDÓ, SIN RECTÁNGULO EXTRA
   ========================================================= */

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(24px, 3vw, 46px);
  margin-top: clamp(24px, 2.5vw, 34px);
}

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(48px, 3.8vw, 58px);
  border-radius: 4px;
  font-size: clamp(11px, .85vw, 13px);
  font-weight: 700;
  letter-spacing: .01em;
  text-transform: uppercase;
  transition:
    transform .25s ease,
    background .25s ease,
    color .25s ease,
    box-shadow .25s ease;
}

.btn-primary {
  min-width: clamp(190px, 14vw, 225px);
  padding: 0 clamp(18px, 1.6vw, 25px);
  color: #fff;
  background: var(--accent);
  box-shadow: 0 10px 28px rgba(0,0,0,.30);
  overflow: hidden;
}

.btn-primary:hover {
  background: var(--accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 15px 34px rgba(0,0,0,.38);
}

.btn-primary > * {
  position: relative;
  z-index: 1;
}

.btn-arrow {
  margin-left: auto;
  padding-left: 18px;
  font-size: clamp(20px, 1.7vw, 26px);
  font-weight: 300;
  line-height: 1;
}

.btn-link {
  min-height: clamp(44px, 3.5vw, 54px);
  padding: 0;
  color: #fcfeff;
  background: transparent;
}

.btn-link::after {
  position: absolute;
  right: 0;
  bottom: 5px;
  left: 0;
  height: 1px;
  content: "";
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform .3s ease;
}

.btn-link:hover {
  color: var(--accent);
}

.btn-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.btn-link .external {
  margin-left: 12px;
  font-size: clamp(17px, 1.3vw, 21px);
}

/* =========================================================
   ESTADÍSTICAS — GRANDES EN ESCRITORIO, LIMPIAS EN CELULAR
   ========================================================= */

.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: min(100%, 700px);
  margin-top: clamp(52px, 6vw, 82px);
}

.stat {
  position: relative;
  min-width: 0;
  padding: 0 clamp(14px, 1.5vw, 25px);
}

.stat:first-child {
  padding-left: 0;
}

.stat + .stat {
  border-left: 1px solid rgba(190,198,203,.16);
}

.stat-icon {
  width: clamp(24px, 2vw, 30px);
  height: clamp(24px, 2vw, 30px);
  margin-bottom: clamp(10px, 1vw, 14px);
  color: var(--accent);
  stroke: currentColor;
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.stat-value {
  display: block;
  color: #e9edef;
  font-size: clamp(22px, 2vw, 30px);
  font-weight: 300;
  letter-spacing: -.045em;
  line-height: 1;
}

.stat-label {
  display: block;
  max-width: 130px;
  margin-top: 9px;
  color: #929da5;
  font-size: clamp(8px, .72vw, 11px);
  font-weight: 500;
  letter-spacing: .055em;
  line-height: 1.45;
  text-transform: uppercase;
}

/* =========================================================
   HISTORIA
   ========================================================= */

.history {
  position: relative;

  margin-top: clamp(0.55px, 10vw, 0px);
  margin-bottom: clamp(0.5px, 10vw, 0px);

  padding: clamp(55px, 5vw, 75px) 0;

  background: #171a1d;

  border-top: 1px solid rgba(101, 13, 32, 0.95);
  border-bottom: 1px solid rgba(101, 13, 32, 0.95);

  box-shadow:
    0 -4px 18px rgba(101, 13, 32, 0.08),
    0 4px 18px rgba(101, 13, 32, 0.08);
}

.history-grid {
  display: grid;
  grid-template-columns: 1.2fr .9fr 1.05fr;
  gap: clamp(35px, 5vw, 85px);
  align-items: start;
}

.history-heading .eyebrow {
  margin-bottom: 18px;
  font-size: clamp(11px, .8vw, 13px);
}

.history-heading h2 {
  margin: 0;
  color: #f0f2f3;
  font-size: clamp(39px, 4vw, 60px);
  font-weight: 800;
  letter-spacing: -.055em;
  line-height: .91;
  text-transform: uppercase;
}

.history-heading h2 span {
  display: block;
  font-weight: 300;
}

.history-heading .divider {
  margin-top: 15px;
  margin-top: 0px;
}

.history-copy {
  position: relative;
  padding-top: 43px;
  color: #eef0f1;
  font-size: clamp(11px, .82vw, 14px);
  line-height: 1.75;
}

.history-copy::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 34px;
  height: 2px;
  content: "";
  background: var(--accent);
}

.history-highlight {
  position: relative;
  padding: 43px 0 0 clamp(25px, 3vw, 45px);
  color: #aeb6bc;
  font-size: clamp(11px, .82vw, 14px);
  line-height: 1.75;
}

.history-highlight::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  content: "";
  background: #3a4146;
}

.history-highlight::after {
  position: absolute;
  top: 0;
  left: clamp(25px, 3vw, 45px);
  width: 34px;
  height: 2px;
  content: "";
  background: var(--accent);
}

.history-highlight strong {
  color: #e7eaec;
  font-weight: 700;
}

/* =========================================================
   FOOTER
   ========================================================= */

.footer {
  position: relative;
  padding: clamp(38px, 4vw, 58px) 0 22px;
  background: #171a1d;
  border-top: 1px solid #171a1d;
  
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr 1.35fr 1fr;
  gap: clamp(35px, 5vw, 80px);
  padding-bottom: 28px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.footer-logo {
  color: #f0f2f3;
  font-size: clamp(21px, 1.8vw, 27px);
  font-weight: 800;
  letter-spacing: -.05em;
  line-height: .88;
  text-transform: uppercase;
}

.footer-logo span {
  display: block;
  font-weight: 300;
}

.footer-brand p {
  margin: 13px 0 0;
  color: #f4f5f5;
  font-size: clamp(11px, .8vw, 13px);
  line-height: 1.55;
}

.footer-links {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 35px;
}

.footer-title {
  margin: 0 0 12px;
  color: #dfe5e9;
  font-size: clamp(10px, .75vw, 12px);
  font-weight: 700;
  text-transform: uppercase;
}

.footer-links a {
  display: block;
  width: max-content;
  max-width: 100%;
  margin-bottom: 7px;
  color: #eff1f3;
  font-size: clamp(11px, .8vw, 13px);
  transition: color .2s ease, transform .2s ease;
}

.footer-links a:hover {
  color: var(--accent);
  transform: translateX(2px);
}

.footer-social {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.social-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.social-link {
  display: grid;
  width: clamp(38px, 3vw, 46px);
  height: clamp(38px, 3vw, 46px);
  place-items: center;
  color: #c3c9cd;
  border: 1px solid #454b50;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 600;
  transition:
    color .25s ease,
    background .25s ease,
    border-color .25s ease,
    transform .25s ease;
}

.social-link svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

.social-link:hover {
  color: #fff;
  background: var(--accent);
  border-color: var(--accent);
  transform: translateY(-2px);
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #363c41;
}

.copyright {
  margin: 0;
  color: #7f898f;
  font-size: clamp(10px, .72vw, 12px);
}

/* =========================================================
   WHATSAPP
   ========================================================= */

.whatsapp-float {
  position: fixed;
  z-index: 1200;
  right: clamp(16px, 3vw, 46px);
  bottom: clamp(16px, 3vw, 44px);
  display: grid;
  width: clamp(58px, 5vw, 76px);
  height: clamp(58px, 5vw, 76px);
  place-items: center;
  color: #fff;
  background: #151719;
  border: 2px solid rgba(255,255,255,.20);
  border-radius: 50%;
  box-shadow: 0 9px 28px rgba(0,0,0,.22);
  transition: transform .3s ease, box-shadow .3s ease;
}

.whatsapp-float:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 15px 34px rgba(0,0,0,.28);
}

.whatsapp-float svg {
  width: 46%;
  height: 46%;
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 1050px) {
  .container {
    width: min(calc(100% - 64px), 900px);
  }

  .hero {
    min-height: 820px;
  }

  .hero-content {
    min-height: 820px;
    padding-top: 145px;
  }

  .hero-copy {
    width: 52%;
    max-width: 52%;
  }

  .hero-title {
    font-size: clamp(62px, 7.2vw, 82px);
  }

  .hero-description {
    width: min(100%, 440px);
  }

  .hero-stats {
    width: 100%;
  }

  .history-grid {
    gap: 32px;
  }

  .footer-grid {
    gap: 32px;
  }
}

/* =========================================================
   TABLET / MOBILE GRANDE
   La imagen pasa arriba y el contenido deja de competir
   con ella. Esto evita cortes horribles.
   ========================================================= */

@media (max-width: 760px) {
  .container {
    width: calc(100% - 44px);
  }

  .site-header {
    height: 84px;
  }

  .header-container {
    width: calc(100% - 44px);
  }

  .brand {
    margin-top: 27px;
    font-size: 23px;
  }

  .hero {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: #101214;
  }

  .hero-image {
    position: relative;
    inset: auto;
    order: 0;
    width: 100%;
    height: clamp(360px, 57vw, 500px);
  }

  .hero-image img {
    object-position: 57% center;
    transform: none;
  }

  .hero-image::after {
    background:
      linear-gradient(
        180deg,
        rgba(16,18,20,0) 48%,
        rgba(16,18,20,.25) 68%,
        #101214 100%
      );
  }

  .hero::before {
    display: none;
  }

  .hero-content {
    order: 1;
    display: block;
    min-height: 0;
    padding-top: 6px;
    padding-bottom: 58px;
  }

  .hero-copy {
    width: 100%;
    max-width: none;
  }

  .hero-eyebrow {
    margin-bottom: 17px;
  }

  .hero-title {
    max-width: 720px;
    margin-top: 16px;
    font-size: clamp(56px, 12vw, 82px);
    line-height: .87;
  }

  .hero-subtitle {
    font-size: clamp(19px, 4.5vw, 28px);
  }

  .hero-description {
    width: min(100%, 650px);
    margin-top: 34px;
    font-size: 14px;
  }

  .hero-actions {
    gap: 20px 28px;
    margin-top: 25px;
  }

  .btn-primary {
    min-width: 195px;
  }

  .hero-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: 100%;
    margin-top: 54px;
  }

  .stat {
    padding: 0 13px;
  }

  .stat:first-child {
    padding-left: 0;
  }

  .stat-value {
    font-size: clamp(19px, 3vw, 25px);
  }

  .stat-label {
    font-size: 8px;
  }

  .history {
    padding: 48px 0;
  }

  .history-grid {
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .history-heading h2 {
    font-size: clamp(40px, 9vw, 58px);
  }

  .history-copy,
  .history-highlight {
    padding-top: 30px;
  }

  .history-highlight {
    padding-left: 0;
  }

  .history-highlight::before {
    display: none;
  }

  .history-highlight::after {
    left: 0;
  }

  .footer {
    padding-top: 42px;
  }

  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 38px 28px;
  }

  .footer-social {
    grid-column: 1 / -1;
  }
}

/* =========================================================
   CELULAR
   ========================================================= */

@media (max-width: 520px) {
  .container,
  .header-container {
    width: calc(100% - 30px);
  }

  .site-header {
    height: 72px;
  }

  .brand {
    margin-top: 22px;
    font-size: 19px;
  }

  .hero-image {
    height: clamp(285px, 78vw, 380px);
  }

  .hero-image::after {
    background:
      linear-gradient(
        180deg,
        rgba(16,18,20,0) 44%,
        rgba(16,18,20,.34) 70%,
        #101214 100%
      );
  }

  .hero-content {
    padding-top: 0;
    padding-bottom: 44px;
  }

  .hero-eyebrow {
    font-size: 11px;
    letter-spacing: .16em;
  }

  .hero-title {
    margin-top: 14px;
    font-size: clamp(46px, 14.2vw, 67px);
    line-height: .86;
  }

  .hero-subtitle {
    margin-top: 12px;
    font-size: clamp(17px, 5vw, 22px);
    letter-spacing: .14em;
  }

  .hero-description {
    margin-top: 28px;
    font-size: 13px;
    line-height: 1.68;
  }

  .hero-description::before {
    width: 125px;
    margin-bottom: 19px;
  }

  .hero-actions {
    display: flex;
    align-items: stretch;
    gap: 14px 20px;
    margin-top: 23px;
  }

  .btn-primary {
    min-width: 0;
    flex: 0 1 auto;
    width: min(100%, 205px);
    min-height: 49px;
    padding-inline: 16px;
  }

  .btn-link {
    min-height: 49px;
    font-size: 10px;
  }

  .hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px 0;
    margin-top: 44px;
  }

  .stat {
    min-height: 76px;
    padding: 0 13px;
  }

  .stat:nth-child(3) {
    border-left: 0;
  }

  .stat:nth-child(odd) {
    padding-left: 0;
  }

  .stat-icon {
    width: 23px;
    height: 23px;
    margin-bottom: 9px;
  }

  .stat-value {
    font-size: 21px;
  }

  .stat-label {
    margin-top: 7px;
    font-size: 8px;
    line-height: 1.4;
  }

  .history {
    padding: 42px 0;
  }

  .history-heading .eyebrow {
    font-size: 10px;
  }

  .history-heading h2 {
    font-size: clamp(36px, 11vw, 48px);
  }

  .history-copy,
  .history-highlight {
    font-size: 12px;
    line-height: 1.7;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 31px;
  }

  .footer-social {
    grid-column: auto;
  }

  .footer-links {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .footer-bottom {
    align-items: flex-start;
  }

  .copyright {
    max-width: 90%;
    line-height: 1.5;
  }
}

/* =========================================================
   CELULAR MUY CHICO
   ========================================================= */

@media (max-width: 360px) {
  .container,
  .header-container {
    width: calc(100% - 24px);
  }

  .brand {
    font-size: 17px;
  }

  .hero-image {
    height: 270px;
  }

  .hero-title {
    font-size: 43px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .btn-primary {
    width: 100%;
  }

  .btn-link {
    align-self: flex-start;
  }

  .hero-stats {
    gap: 22px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(html) {
    scroll-behavior: auto !important;
  }

  :global(*) {
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}

@media (max-width: 760px) {
  .history {
    margin-top: 35px;
    margin-bottom: 35px;
    padding: 48px 0;
  }
}

@media (max-width: 520px) {
  .history {
    margin-top: 28px;
    margin-bottom: 28px;
    padding: 42px 0;
  }
}
</style>