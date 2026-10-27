<template>
  <footer class="site-footer" id="contacto">
    <div class="site-footer-content">
      <div class="site-footer-grid">
        <div class="site-footer-brand">
          <RouterLink to="/" class="site-footer-logo" aria-label="Beta Gráfica, inicio">
            BETA
            <span>GRÁFICA</span>
          </RouterLink>
          <p>Industria Gráfica Integral<br>Desde 2001</p>
        </div>

        <div class="site-footer-links">
          <h2 class="site-footer-title">ENLACES</h2>
          <div class="site-footer-link-columns">
            <div>
              <RouterLink to="/">Inicio</RouterLink>
              <RouterLink to="/ventas">Productos</RouterLink>
              <RouterLink to="/beta">Nosotros</RouterLink>
            </div>
            <div>
              <a href="https://wa.me/5493564652137">Contacto</a>
            </div>
          </div>
        </div>

        <div class="site-footer-social">
          <h2 class="site-footer-title">SEGUINOS</h2>
          <div class="site-footer-social-list">
            <a href="https://www.facebook.com/share/1BDXuPqTHn/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="site-footer-social-link">f</a>
            <a href="https://www.instagram.com/beta_grafica/?next=%2F" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="site-footer-social-link">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6.5-8.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM12 2c3.27 0 3.67.01 4.96.07 1.2.05 2.03.25 2.75.53a5.56 5.56 0 0 1 1.99 1.3 5.56 5.56 0 0 1 1.3 1.99c.28.72.48 1.55.53 2.75.06 1.29.07 1.69.07 4.96s-.01 3.67-.07 4.96c-.05 1.2-.25 2.03-.53 2.75a5.56 5.56 0 0 1-1.3 1.99 5.56 5.56 0 0 1-1.99 1.3c-.72.28-1.55.48-2.75.53-1.29.06-1.69.07-4.96.07s-3.67-.01-4.96-.07c-1.2-.05-2.03-.25-2.75-.53a5.56 5.56 0 0 1-1.99-1.3A5.56 5.56 0 0 1 1 19.31c-.28-.72-.48-1.55-.53-2.75C.41 15.27.4 14.87.4 11.6s.01-3.67.07-4.96C.52 5.44.72 4.61 1 3.89a5.56 5.56 0 0 1 1.3-1.99A5.56 5.56 0 0 1 4.29.6C5.01.32 5.84.12 7.04.07 8.33.01 8.73 0 12 0Z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@beta.grafica" target="_blank" rel="noopener noreferrer" aria-label="TikTok" class="site-footer-social-link">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2h3.1c.24 1.8 1.22 3.43 2.73 4.47A8.25 8.25 0 0 0 22 7.38v3.24a11.2 11.2 0 0 1-4.9-1.5v6.03A6.85 6.85 0 1 1 11.15 8.3v3.34a3.5 3.5 0 1 0 2.85 3.44V2Z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div class="site-footer-bottom">
        <p>© 2024 Beta Gráfica. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  --footer-bg: #171a1d;
  --footer-text: #eff1f3;
  --footer-muted: #aeb6bc;
  --footer-line: #363c41;
  --footer-accent: #650d20;

  position: relative;
  padding: 46px 0 22px;
  background: var(--footer-bg);
  color: var(--footer-text);
  border-top: 1px solid var(--footer-line);
}

.site-footer-content {
  width: min(1240px, calc(100% - 84px));
  margin: 0 auto;
}

.site-footer-grid {
  display: grid;
  grid-template-columns: 1fr 1.35fr 1fr;
  gap: clamp(35px, 5vw, 80px);
  padding-bottom: 28px;
}

.site-footer-brand,
.site-footer-social {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.site-footer-logo {
  color: #f0f2f3;
  font-size: clamp(21px, 1.8vw, 27px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 0.88;
  text-decoration: none;
}

.site-footer-logo span {
  display: block;
  font-weight: 300;
}

.site-footer-brand p {
  margin: 13px 0 0;
  color: #f4f5f5;
  font-size: 13px;
  line-height: 1.55;
}

.site-footer-title {
  margin: 0 0 12px;
  color: #dfe5e9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.site-footer-link-columns {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 35px;
}

.site-footer-link-columns > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}

.site-footer-link-columns a {
  color: var(--footer-text);
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
}

.site-footer-link-columns a:hover {
  color: #fff;
  transform: translateX(2px);
}

.site-footer-social-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.site-footer-social-link {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  color: #c3c9cd;
  border: 1px solid #454b50;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}

.site-footer-social-link svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

.site-footer-social-link:hover {
  color: #fff;
  background: var(--footer-accent);
  border-color: var(--footer-accent);
  transform: translateY(-2px);
}

.site-footer-bottom {
  padding-top: 16px;
  border-top: 1px solid var(--footer-line);
}

.site-footer-bottom p {
  margin: 0;
  color: #7f898f;
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 800px) {
  .site-footer {
    padding-top: 38px;
  }

  .site-footer-content {
    width: calc(100% - 35px);
  }

  .site-footer-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 30px;
  }

  .site-footer-link-columns {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 20px;
  }

  .site-footer-bottom p {
    padding-right: 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-footer-link-columns a,
  .site-footer-social-link {
    transition: none;
  }
}
</style>