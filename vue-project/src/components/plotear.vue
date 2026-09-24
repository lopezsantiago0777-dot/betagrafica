<template>
  <main class="plotear-page">

    <!-- =====================================================
         NOSOTROS
    ====================================================== -->
    <section class="about-section" id="about">

      <div class="about-bg" aria-hidden="true">
        <div class="bg-number">01</div>
        <div class="bg-grid bg-grid-top">
          <i v-for="n in 12" :key="'top-' + n"></i>
        </div>
        <div class="bg-grid bg-grid-bottom">
          <i v-for="n in 12" :key="'bottom-' + n"></i>
        </div>
        <div class="bg-circle bg-circle-a"></div>
        <div class="bg-circle bg-circle-b"></div>
        <div class="bg-cross bg-cross-a">+</div>
        <div class="bg-cross bg-cross-b">×</div>
        <div class="bg-lines bg-lines-a"></div>
        <div class="bg-lines bg-lines-b"></div>
      </div>

      <div class="about-container">

        <!-- CABECERA NUEVA -->
        <div class="about-topline">
          <div class="about-index">
            <span class="index-square"></span>
            <strong>01</strong>
            <span>/ NOSOTROS</span>
          </div>

          

          <div class="topline-number">2026</div>
        </div>


        <!-- HERO ASIMÉTRICO -->
        <div class="about-hero">

          <div class="hero-copy">

            <div class="micro-label">
              <span></span>
              INGENIERÍA VISUAL
            </div>

            <h1>
              ESTO ES
              <em>PLOTEAR.</em>
            </h1>

            <div class="hero-description">
              <span class="description-number">01</span>

              <p>
                Comenzamos con un plotter de corte y dos computadoras.
                Con el tiempo, adquirimos nuestro primer plotter de impresión,
                simplificamos procesos y transformamos una pequeña operación
                en una estructura preparada para crecer.
              </p>
            </div>

            <div class="hero-actions">
              <a href="#contacto" class="outline-button">
                <span>CONOCÉ MÁS</span>
                <b>↗</b>
              </a>

              <div class="hero-note">
                <span>DESDE</span>
                <strong>LA IDEA</strong>
                <span>AL IMPACTO</span>
              </div>
            </div>

          </div>


          <div class="hero-visual">

            <div class="visual-index">
              <span>02</span>
              <div>
                <strong>CREAMOS<br>IMPACTO</strong>
                <small>— — —</small>
              </div>
            </div>

            <div class="visual-frame">
              <div class="frame-label frame-label-top">PLOTEAR / VISUAL 02</div>

              <div class="photo">
                <img
                  src="/imagenes/foto.jpeg"
                  alt="Tecnología y producción gráfica de Plotear"
                />
              </div>

              <div class="frame-label frame-label-bottom">GRÁFICA · DISEÑO · PRODUCCIÓN</div>
            </div>

            <div class="visual-circle"></div>
            <div class="visual-cross">×</div>

            <div class="visual-dots">
              <i v-for="n in 9" :key="'visual-dot-' + n"></i>
            </div>

            <div class="visual-plus">+</div>
            <div class="visual-line"></div>

            <span class="spark spark-a">✦</span>
            <span class="spark spark-b">✦</span>
            <span class="spark spark-c">✦</span>

          </div>
        </div>


        <!-- FRANJA DE DATOS -->
        <div class="info-strip">
          <div class="strip-item">
            <span>01</span>
            <strong>TECNOLOGÍA</strong>
            <p>Equipos de última generación para impresión de alta calidad.</p>
          </div>

          <div class="strip-item">
            <span>02</span>
            <strong>DISEÑO</strong>
            <p>Soluciones visuales pensadas para comunicar y destacar.</p>
          </div>

          <div class="strip-item">
            <span>03</span>
            <strong>PRODUCCIÓN</strong>
            <p>Precisión y eficiencia para proyectos de cualquier formato.</p>
          </div>

          <div class="strip-mark">P.</div>
        </div>


        <!-- SERVICIOS / MANIFESTO -->
        <div class="services-section">

          <div class="services-intro">
            <span class="section-mini">03 / LO QUE HACEMOS</span>

            <h2>
              UNA IDEA.
              <br>
              <span>MUCHAS FORMAS.</span>
            </h2>

            <p>
              Combinamos tecnología, diseño y producción para convertir
              una idea en una pieza gráfica que funciona en el mundo real.
            </p>
          </div>

          <div class="service-rows">

            <article class="service-row">
              <div class="service-row-number">01</div>

              <div class="service-row-icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <rect x="10" y="12" width="28" height="20" rx="2"></rect>
                  <path d="M15 36h18"></path>
                  <path d="M19 32v4"></path>
                  <path d="M29 32v4"></path>
                  <path d="M15 17h18v10H15z"></path>
                </svg>
              </div>

              <div class="service-row-title">
                <h3>TECNOLOGÍA</h3>
                <span>PRECISIÓN / CALIDAD</span>
              </div>

              <p>
                Equipos de impresión y corte preparados para entregar
                resultados consistentes, definidos y profesionales.
              </p>

              <span class="row-arrow">↗</span>
            </article>


            <article class="service-row">
              <div class="service-row-number">02</div>

              <div class="service-row-icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M13 35L35 13"></path>
                  <path d="M17 13l18 18"></path>
                  <path d="M12 12l6 1 17 17-5 5-17-17z"></path>
                  <path d="M30 30l5 5"></path>
                </svg>
              </div>

              <div class="service-row-title">
                <h3>DISEÑO</h3>
                <span>CONCEPTO / IDENTIDAD</span>
              </div>

              <p>
                Creamos piezas visuales que respetan la identidad de cada
                marca y convierten mensajes en experiencias memorables.
              </p>

              <span class="row-arrow">↗</span>
            </article>


            <article class="service-row">
              <div class="service-row-number">03</div>

              <div class="service-row-icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <circle cx="24" cy="24" r="12"></circle>
                  <circle cx="24" cy="24" r="4"></circle>
                  <path d="M24 7v8"></path>
                  <path d="M24 33v8"></path>
                  <path d="M7 24h8"></path>
                  <path d="M33 24h8"></path>
                </svg>
              </div>

              <div class="service-row-title">
                <h3>PRODUCCIÓN</h3>
                <span>FORMATO / IMPACTO</span>
              </div>

              <p>
                Desde carteles y banners hasta soluciones de gran formato,
                cuidando cada detalle hasta la entrega final.
              </p>

              <span class="row-arrow">↗</span>
            </article>

          </div>
        </div>


        <!-- HISTORIA -->
        <div class="story-section">

          <div class="story-side">
            <span class="story-number">04</span>
            <span class="story-label">NUESTRA<br>EVOLUCIÓN</span>

            <div class="story-rule"></div>

            <span class="story-small">
              PLOTEAR SRL<br>
              TECNOLOGÍA GRÁFICA
            </span>
          </div>

          <div class="story-content">

            <div class="story-heading">
              <span>DE LA PRODUCCIÓN</span>
              <h2>A UNA <strong>MARCA.</strong></h2>
            </div>

            <div class="story-columns">
              <p>
                Gracias al constante desarrollo, incorporamos equipos de
                impresión de última generación como los <strong>Roland DGA</strong>.
                Con ello nació <strong>Plotear SRL</strong>, una nueva marca
                dedicada en exclusiva a la impresión de vinilos, optimizando
                costos y maximizando la productividad.
              </p>

              <p>
                Desde carteles y banners hasta material publicitario complejo,
                ofrecemos impresión con tecnología avanzada y una atención
                meticulosa a los detalles. Buscamos máxima fidelidad cromática
                para que cada mensaje sea vibrante, preciso y efectivo.
              </p>

              <p>
                También desarrollamos cartelería arquitectónica e industrial:
                estructuras de alto impacto visual que capturan la atención
                y transmiten el valor de una marca en promociones, eventos
                y señalización.
              </p>
            </div>

            <div class="story-footer">
              <span>05 / CONECTEMOS</span>
              <a href="#contacto">HABLEMOS <b>→</b></a>
            </div>

          </div>
        </div>

      </div>


      <!-- CINTA -->
      <div class="ticker-wrap">
        <div class="ticker">
          <div class="ticker-content">
            <span>PLOTEAR</span><b>•</b>
            <span>DISEÑO</span><b>•</b>
            <span>IMPRESIÓN</span><b>•</b>
            <span>CARTELERÍA</span><b>•</b>
            <span>PLOTEAR</span><b>•</b>
            <span>DISEÑO</span><b>•</b>
            <span>IMPRESIÓN</span><b>•</b>
            <span>CARTELERÍA</span><b>•</b>
            <span>PLOTEAR</span><b>•</b>
            <span>DISEÑO</span><b>•</b>
            <span>IMPRESIÓN</span>
          </div>
        </div>
      </div>

    </section>


    <!-- =====================================================
         FOOTER — MISMA ESTRUCTURA QUE VINIL.VUE
    ====================================================== -->
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


    <!-- WHATSAPP — MISMO BOTÓN QUE VINIL.VUE -->
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

  </main>
</template>


<style scoped>
/* =========================================================
   PLOTEAR / BETA GRÁFICA — SISTEMA VISUAL UNIFICADO
   Misma identidad de vinil.vue:
   grafito + negro + blanco frío + bordó profundo.
   ========================================================= */

.plotear-page {
  --bg: #101214;
  --bg-deep: #0b0d0f;
  --surface: #171a1d;
  --surface-2: #1c2024;
  --text: #f1f3f4;
  --text-soft: #d5dade;
  --muted: #9da6ad;
  --muted-2: #687178;
  --accent: #650d20;
  --accent-dark: #430814;
  --accent-light: #8a263d;
  --line: #353b40;
  --line-soft: rgba(190,198,203,.13);
  --white-line: rgba(255,255,255,.16);
  width:100%;
  min-height:100vh;
  overflow:hidden;
  color:var(--text);
  background:var(--bg);
  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased;
}

.plotear-page * { box-sizing:border-box; }
.plotear-page a { color:inherit; text-decoration:none; }
.plotear-page svg { display:block; }

/* ---------- FONDO / ATMÓSFERA ---------- */
.about-section {
  position:relative;
  min-height:100vh;
  padding:38px 0 105px;
  isolation:isolate;
  background:
    radial-gradient(ellipse at 72% 16%, rgba(101,13,32,.15), transparent 29%),
    radial-gradient(ellipse at 12% 72%, rgba(255,255,255,.025), transparent 31%),
    linear-gradient(135deg,#0a0c0e 0%,#101214 50%,#171a1d 100%);
}

.about-section::before {
  content:"";
  position:absolute;
  inset:0;
  z-index:-1;
  opacity:.34;
  pointer-events:none;
  background:
    linear-gradient(90deg, transparent 0 49.8%, rgba(255,255,255,.025) 50%, transparent 50.2%),
    linear-gradient(0deg, transparent 0 49.8%, rgba(255,255,255,.018) 50%, transparent 50.2%);
  background-size:140px 140px;
}

.about-bg { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
.bg-number {
  position:absolute; right:-1%; top:-65px;
  font-size:clamp(300px,42vw,690px); line-height:.8;
  font-weight:900; letter-spacing:-.12em;
  color:rgba(255,255,255,.018);
}
.bg-grid { position:absolute; display:grid; grid-template-columns:repeat(4,5px); gap:13px; }
.bg-grid i { width:5px;height:5px;border-radius:50%;background:rgba(101,13,32,.72); }
.bg-grid-top { top:110px; left:28px; }
.bg-grid-bottom { right:8%; bottom:250px; opacity:.65; }
.bg-circle { position:absolute; border:1px solid rgba(101,13,32,.38); border-radius:50%; }
.bg-circle-a { width:390px;height:390px;right:-190px;top:470px;box-shadow:0 0 80px rgba(101,13,32,.08); }
.bg-circle-b { width:110px;height:110px;left:41%;top:260px; }
.bg-cross { position:absolute;color:rgba(255,255,255,.28);font-weight:200; }
.bg-cross-a { top:185px;left:46%;font-size:34px; }
.bg-cross-b { right:3%;bottom:420px;font-size:70px;color:rgba(101,13,32,.5); }
.bg-lines {
  position:absolute;width:330px;height:330px;opacity:.08;
  background:repeating-linear-gradient(135deg,transparent 0,transparent 15px,rgba(255,255,255,.8) 16px,rgba(255,255,255,.8) 17px);
}
.bg-lines-a { left:-210px;top:350px; }
.bg-lines-b { right:-210px;bottom:70px; }

.about-container { position:relative;z-index:2;width:min(1380px,calc(100% - 96px));margin:auto; }

/* ---------- CABECERA ---------- */
.about-topline {
  display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:35px;
  margin-bottom:62px;
}
.about-index {
  display:inline-flex;align-items:center;width:max-content;min-height:38px;padding:0 17px;gap:10px;
  border:1px solid rgba(255,255,255,.24);
  background:rgba(16,18,20,.45);
  backdrop-filter:blur(10px);
  font-size:11px;font-weight:700;letter-spacing:2px;
}
.index-square { width:8px;height:8px;background:var(--accent);box-shadow:0 0 14px rgba(101,13,32,.8); }
.about-index span:last-child { color:var(--muted); }
.topline-copy { display:flex;flex-direction:column;align-items:flex-end;gap:4px;color:var(--muted);font-size:9px;letter-spacing:2.5px; }
.topline-number { padding-left:24px;border-left:1px solid var(--line);color:rgba(255,255,255,.32);font-size:11px;letter-spacing:3px; }

/* ---------- HERO ---------- */
.about-hero {
  display:grid;grid-template-columns:minmax(430px,.78fr) minmax(540px,1.22fr);
  gap:clamp(55px,7vw,115px);align-items:start;min-height:710px;
}
.hero-copy { padding-top:38px; }
.micro-label { display:flex;align-items:center;gap:12px;margin-bottom:20px;color:var(--muted);font-size:11px;font-weight:600;letter-spacing:5px; }
.micro-label span { width:34px;height:1px;background:var(--accent);box-shadow:0 0 12px rgba(101,13,32,.5); }
.hero-copy h1 {
  margin:0;max-width:720px;color:#f5f6f7;
  font-size:clamp(74px,8vw,128px);line-height:.83;letter-spacing:-.075em;font-weight:850;text-transform:uppercase;
}
.hero-copy h1 em {
  display:block;margin-left:clamp(25px,4.5vw,72px);color:transparent;font-style:normal;
  -webkit-text-stroke:1px rgba(255,255,255,.5);
  text-shadow:0 0 35px rgba(101,13,32,.12);
}
.hero-description { display:grid;grid-template-columns:40px 1fr;gap:18px;max-width:560px;margin:50px 0 0 5px; }
.description-number { color:var(--accent-light);font-size:25px;font-weight:800;font-style:italic; }
.hero-description p { margin:0;padding-left:19px;border-left:1px solid var(--accent);color:#aeb6bc;font-size:14px;line-height:1.75; }
.hero-actions { display:flex;align-items:center;gap:34px;margin:42px 0 0 5px; }
.outline-button {
  position:relative;display:inline-flex;align-items:center;justify-content:space-between;gap:34px;
  min-width:210px;height:50px;padding:0 14px 0 22px;
  border:1px solid var(--accent);background:var(--accent);color:#fff;
  box-shadow:0 12px 32px rgba(0,0,0,.28);font-size:10px;font-weight:800;letter-spacing:2.5px;transition:.3s ease;
}
.outline-button::before { content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.08),transparent);opacity:0;transition:.3s; }
.outline-button:hover { background:var(--accent-dark);border-color:var(--accent-light);transform:translateY(-3px);box-shadow:0 17px 38px rgba(0,0,0,.4); }
.outline-button:hover::before { opacity:1; }
.outline-button span,.outline-button b { position:relative;z-index:1; }
.outline-button b { font-size:22px;font-weight:300; }
.hero-note { display:flex;flex-direction:column;gap:2px;color:#687178;font-size:8px;line-height:1.3;letter-spacing:2px; }
.hero-note strong { color:#f1f3f4;font-size:10px; }

/* ---------- FOTO / MARCO ---------- */
.hero-visual { position:relative;height:700px;margin-top:-20px; }
.visual-frame {
  position:absolute;top:42px;right:12px;width:min(630px,94%);height:620px;padding:7px;
  background:linear-gradient(135deg,#e4e7e9,#70777c 48%,#171a1d 100%);
  clip-path:polygon(8% 0,79% 0,100% 14%,94% 47%,100% 83%,78% 100%,18% 94%,0 70%,6% 25%);
  box-shadow:0 35px 80px rgba(0,0,0,.52),0 0 80px rgba(101,13,32,.08);
}
.photo {
  position:relative;width:100%;height:100%;overflow:hidden;background:#111416;
  clip-path:polygon(9% 1.2%,78% 1.2%,98.8% 15.7%,92.7% 46%,98.8% 81.5%,77.5% 98.8%,18.5% 92.8%,1.2% 69.5%,7.2% 25.5%);
}
.photo::after {
  content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(135deg,rgba(16,18,20,.72),transparent 40%,rgba(101,13,32,.18)),linear-gradient(180deg,transparent 50%,rgba(0,0,0,.52));
  mix-blend-mode:multiply;
}
.photo img { width:100%;height:100%;object-fit:cover;filter:grayscale(.52) saturate(.58) contrast(1.12) brightness(.72);transform:scale(1.03);transition:1s cubic-bezier(.2,.8,.2,1); }
.visual-frame:hover .photo img { filter:grayscale(.15) saturate(.82) contrast(1.08) brightness(.84);transform:scale(1.09); }
.frame-label { position:absolute;z-index:8;color:#16191b;font-size:8px;font-weight:900;letter-spacing:2px; }
.frame-label-top { top:17px;left:28px; }.frame-label-bottom { right:32px;bottom:18px; }
.visual-index {
  position:absolute;z-index:15;top:-5px;right:63px;display:flex;align-items:center;justify-content:center;gap:10px;width:155px;height:155px;
  border:1px solid rgba(255,255,255,.34);border-radius:50%;background:rgba(16,18,20,.9);backdrop-filter:blur(12px);
  transform:rotate(4deg);box-shadow:0 20px 55px rgba(0,0,0,.5),inset 0 0 35px rgba(101,13,32,.12);
}
.visual-index::after { content:"";position:absolute;inset:10px;border:1px dashed rgba(101,13,32,.5);border-radius:50%; }
.visual-index > span,.visual-index div { position:relative;z-index:1; }.visual-index > span { font-size:43px;font-weight:900;line-height:.8;color:#f1f3f4; }
.visual-index strong { font-size:10px;line-height:1.15;letter-spacing:1px; }.visual-index small { margin-top:8px;color:var(--accent-light);font-size:8px;letter-spacing:3px; }
.visual-circle { position:absolute;left:-2px;top:190px;width:70px;height:70px;border:1px solid rgba(101,13,32,.7);border-radius:50%;box-shadow:inset 0 0 0 7px rgba(101,13,32,.05); }
.visual-cross { position:absolute;left:43px;top:110px;color:rgba(255,255,255,.35);font-size:52px;font-weight:200; }
.visual-dots { position:absolute;left:20px;bottom:78px;display:grid;grid-template-columns:repeat(3,5px);gap:13px; }.visual-dots i { width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px rgba(101,13,32,.55); }
.visual-plus { position:absolute;right:43px;bottom:28px;display:flex;align-items:center;justify-content:center;width:45px;height:45px;border:1px solid rgba(101,13,32,.75);color:#fff;font-size:35px;font-weight:200;background:rgba(16,18,20,.4); }
.visual-line { position:absolute;right:-35px;bottom:118px;width:190px;height:1px;background:linear-gradient(90deg,var(--accent),transparent);transform:rotate(-13deg); }
.spark { position:absolute;z-index:20;color:#cfd4d7;text-shadow:0 0 12px rgba(101,13,32,.8);animation:sparkle 2.5s ease-in-out infinite; }
.spark-a { top:235px;left:42%;font-size:27px; }.spark-b { top:315px;right:15%;font-size:19px;animation-delay:.5s; }.spark-c { top:400px;left:31%;font-size:17px;animation-delay:1s; }
@keyframes sparkle {0%,100%{opacity:.25;transform:scale(.85) rotate(0)}50%{opacity:1;transform:scale(1.18) rotate(22deg)}}

/* ---------- DATOS ---------- */
.info-strip {
  display:grid;grid-template-columns:1fr 1fr 1fr 95px;margin-top:12px;
  border-top:1px solid var(--accent);border-bottom:1px solid var(--line);background:rgba(23,26,29,.42);
}
.strip-item { position:relative;min-height:128px;padding:22px 27px 20px;border-right:1px solid var(--line); }
.strip-item span { display:block;margin-bottom:16px;color:var(--accent-light);font-size:10px;font-weight:900;letter-spacing:2px; }
.strip-item strong { display:block;margin-bottom:7px;color:#f1f3f4;font-size:12px;letter-spacing:1.5px; }
.strip-item p { max-width:250px;margin:0;color:#929da5;font-size:10px;line-height:1.55; }
.strip-mark { display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:47px;font-weight:900;letter-spacing:-5px; }

/* ---------- SERVICIOS ---------- */
.services-section { display:grid;grid-template-columns:minmax(300px,.62fr) minmax(600px,1.38fr);gap:42px;margin-top:85px; }
.services-intro { position:sticky;top:30px;align-self:start; }
.section-mini { color:var(--muted);font-size:9px;font-weight:800;letter-spacing:3px; }
.services-intro h2 { margin:28px 0 22px;color:#f1f3f4;font-size:clamp(46px,5vw,75px);line-height:.88;letter-spacing:-.06em;font-weight:900; }
.services-intro h2 span { color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.48); }
.services-intro p { max-width:340px;margin:0;color:#929da5;font-size:12px;line-height:1.7; }
.service-rows { border-top:1px solid var(--accent); }
.service-row { display:grid;grid-template-columns:45px 70px 175px 1fr 35px;gap:18px;align-items:center;min-height:145px;border-bottom:1px solid var(--line);transition:.3s ease; }
.service-row:hover { padding-left:15px;background:linear-gradient(90deg,rgba(101,13,32,.09),rgba(255,255,255,.012)); }
.service-row-number { align-self:start;padding-top:24px;color:rgba(255,255,255,.25);font-size:11px;font-weight:900; }
.service-row-icon { display:flex;align-items:center;justify-content:center;width:57px;height:57px;border:1px solid rgba(101,13,32,.72);border-radius:50%;background:rgba(101,13,32,.035);transition:.3s; }
.service-row:hover .service-row-icon { background:var(--accent);border-color:var(--accent);transform:rotate(-5deg);box-shadow:0 8px 25px rgba(0,0,0,.3); }
.service-row-icon svg { width:27px;height:27px;fill:none;stroke:#dfe3e6;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round; }
.service-row-title h3 { margin:0 0 8px;color:#f1f3f4;font-size:14px;letter-spacing:1.5px; }.service-row-title span{color:#6f797f;font-size:8px;letter-spacing:2px}.service-row p{max-width:330px;margin:0;color:#929da5;font-size:11px;line-height:1.6}.row-arrow{color:#727c82;font-size:23px;font-weight:200;transition:.3s}.service-row:hover .row-arrow{color:var(--accent-light);transform:translate(4px,-4px)}

/* ---------- HISTORIA ---------- */
.story-section { display:grid;grid-template-columns:180px 1fr;gap:40px;margin-top:90px;padding:50px 0 10px;border-top:1px solid var(--line);position:relative; }
.story-section::before { content:"";position:absolute;top:-1px;left:0;width:110px;height:2px;background:var(--accent); }
.story-number { color:rgba(255,255,255,.09);font-size:70px;line-height:.8;font-weight:900;font-style:italic; }.story-label{margin-top:16px;color:#dfe3e6;font-size:10px;font-weight:800;line-height:1.35;letter-spacing:2px}.story-rule{width:45px;height:1px;margin:28px 0;background:var(--accent)}.story-small{color:#697278;font-size:8px;line-height:1.7;letter-spacing:1.5px}
.story-heading > span{color:#737d83;font-size:10px;letter-spacing:4px}.story-heading h2{margin:12px 0 40px;color:#f1f3f4;font-size:clamp(48px,6vw,88px);line-height:.86;letter-spacing:-.065em;font-weight:900}.story-heading strong{color:transparent;-webkit-text-stroke:1px rgba(101,13,32,.9)}
.story-columns{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}.story-columns p{margin:0;color:#aeb6bc;font-size:11px;line-height:1.75}.story-columns strong{color:#f1f3f4}.story-footer{display:flex;align-items:center;justify-content:space-between;margin-top:52px;padding-top:20px;border-top:1px solid var(--line)}.story-footer > span{color:#697278;font-size:9px;letter-spacing:2px}.story-footer a{display:inline-flex;align-items:center;gap:30px;color:#fff;font-size:10px;font-weight:800;letter-spacing:2px;transition:.25s}.story-footer a:hover{color:var(--accent-light)}.story-footer a b{font-size:20px;font-weight:300}

/* ---------- CINTA ---------- */
.ticker-wrap{position:absolute;left:-2%;bottom:-28px;z-index:20;width:104%;height:62px;transform:rotate(-2.5deg)}
.ticker{display:flex;align-items:center;width:100%;height:100%;overflow:hidden;background:var(--accent);color:#fff;box-shadow:0 12px 35px rgba(0,0,0,.45)}
.ticker-content{display:flex;align-items:center;gap:22px;padding-left:35px;white-space:nowrap;font-size:20px;font-weight:900;letter-spacing:1px;animation:tickerMove 30s linear infinite}.ticker-content b{color:rgba(255,255,255,.35);font-size:14px}@keyframes tickerMove{from{transform:translateX(0)}to{transform:translateX(-28%)}}

/* ---------- FOOTER ---------- */
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
/* ---------- WHATSAPP ---------- */
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
   FOOTER — MISMA ESTRUCTURA VISUAL QUE VINIL.VUE
   ========================================================= */
.footer {
  position:relative;
  padding:clamp(38px,4vw,58px) 0 22px;
  background:#171a1d;
  border-top:1px solid #171a1d;
}
.footer-inner { width:min(1240px,calc(100% - 84px)); margin:0 auto; }
.footer-grid {
  display:grid;
  grid-template-columns:1fr 1.35fr 1fr;
  gap:clamp(28px,4vw,60px);
  padding-bottom:28px;
}
.footer-brand { display:flex; flex-direction:column; align-items:flex-start; }
.footer-logo {
  color:#f0f2f3;
  font-size:clamp(21px,1.8vw,27px);
  font-weight:800; letter-spacing:-.05em; line-height:.88;
  text-transform:uppercase;
}
.footer-logo span { display:block; font-weight:300; }
.footer-brand p { margin:13px 0 0; color:#f4f5f5; font-size:clamp(11px,.8vw,13px); line-height:1.55; }
.footer-links { display:grid; grid-template-columns:1fr 1.25fr; gap:28px; }
.footer-title { margin:0 0 12px; color:#dfe5e9; font-size:clamp(10px,.75vw,12px); font-weight:700; text-transform:uppercase; }
.footer-links a { display:block; width:max-content; max-width:100%; margin-bottom:7px; color:#eff1f3; font-size:clamp(11px,.8vw,13px); transition:color .2s ease,transform .2s ease; }
.footer-links a:hover { color:var(--accent); transform:translateX(2px); }
.footer-social { display:flex; flex-direction:column; align-items:flex-start; }
.social-list { display:flex; align-items:center; flex-wrap:wrap; gap:12px; }
.social-link {
  display:grid; width:clamp(38px,3vw,46px); height:clamp(38px,3vw,46px);
  place-items:center; color:#c3c9cd; background:transparent;
  border:1px solid #454b50; border-radius:50%; font-size:15px; font-weight:600;
  transition:color .25s ease,background .25s ease,border-color .25s ease,transform .25s ease;
}
.social-link svg { width:17px; height:17px; fill:currentColor; }
.social-link:hover { color:#fff; background:var(--accent); border-color:var(--accent); transform:translateY(-2px); }
.footer-bottom { display:flex; align-items:center; justify-content:space-between; padding-top:16px; border-top:1px solid #363c41; }
.copyright { margin:0; color:#7f898f; font-size:clamp(10px,.72vw,12px); }

/* WHATSAPP — MISMO BOTÓN QUE VINIL.VUE */
.whatsapp-floating-btn {
  position:fixed; z-index:1200;
  right:clamp(16px,3vw,46px); bottom:clamp(16px,3vw,44px);
  display:grid; width:clamp(58px,5vw,76px); height:clamp(58px,5vw,76px);
  place-items:center; color:#fff; background:#151719;
  border:2px solid rgba(255,255,255,.20); border-radius:50%;
  box-shadow:0 9px 28px rgba(0,0,0,.22);
  transition:transform .3s ease,box-shadow .3s ease;
}
.whatsapp-floating-btn:hover { transform:translateY(-4px) scale(1.04); box-shadow:0 15px 34px rgba(0,0,0,.28); }
.whatsapp-floating-btn .pulse-ring { display:none; }
.whatsapp-icon { width:46%; height:46%; fill:currentColor; }



/* =========================================================
   RESPONSIVE — COMPACTO
   ========================================================= */
@media (max-width:1200px){
  .about-container{width:min(1120px,calc(100% - 64px))}
  .about-hero{grid-template-columns:minmax(380px,.9fr) minmax(430px,1.1fr);gap:32px}
  .hero-copy h1{font-size:clamp(65px,8vw,105px)}
  .visual-frame{width:min(560px,92%);height:520px}
}
@media (max-width:992px){
  .about-section{padding-top:32px}
  .about-topline{margin-bottom:32px}
  .topline-copy{display:none}
  .about-hero{grid-template-columns:1fr;gap:15px;min-height:auto}
  .hero-copy{padding-top:0}
  .hero-copy h1{font-size:clamp(70px,13vw,112px)}
  .hero-visual{height:590px;margin-top:0}
  .visual-frame{right:50%;transform:translateX(50%);width:min(650px,92%);height:540px}
  .services-section{grid-template-columns:1fr;gap:32px;margin-top:70px}
  .services-intro{position:static}
  .story-section{grid-template-columns:125px 1fr;gap:30px;margin-top:75px}
  .story-columns{grid-template-columns:1fr 1fr;gap:20px}
}
@media (max-width:680px){
  .about-section{padding:28px 0 85px}
  .about-container{width:calc(100% - 30px)}
  .about-topline{margin-bottom:28px}
  .hero-copy h1{font-size:clamp(52px,15vw,78px)}
  .hero-description{margin-top:25px}
  .hero-actions{margin-top:22px}
  .hero-visual{height:490px;margin-top:10px}
  .visual-frame{top:35px;width:100%;height:450px}
  .visual-index{top:0;right:8px;width:112px;height:112px}
  .info-strip{grid-template-columns:1fr}
  .strip-item,.strip-item:nth-child(2),.strip-item:nth-child(3),.strip-mark{border-right:0;border-top:1px solid var(--line)}
  .strip-item:first-child{border-top:0}
  .services-section{margin-top:60px;gap:25px}
  .service-row{grid-template-columns:30px 50px 1fr 20px;gap:10px;padding:15px 0;min-height:135px}
  .service-row p{grid-column:3/5;margin-top:0}
  .story-section{grid-template-columns:1fr;gap:20px;margin-top:65px}
  .story-columns{grid-template-columns:1fr;gap:14px}
  .story-footer{margin-top:28px}
  .ticker-wrap{height:48px;bottom:-20px}
  .ticker-content{font-size:15px;gap:14px}
  .footer-inner{width:calc(100% - 35px);padding:35px 0}
  .footer-grid{grid-template-columns:1fr;gap:28px}
  .footer-links{grid-template-columns:1fr 1fr;gap:18px}
  .whatsapp-floating-btn{width:58px;height:58px;right:15px;bottom:15px}
}
@media (prefers-reduced-motion:reduce){
  .ticker-content,.spark{animation:none}
  .photo img,.service-row,.row-arrow,.outline-button,.social-link,.whatsapp-floating-btn{transition:none}
}

/* =========================================================
   RESPONSIVE — COMPACTO
   ========================================================= */
@media (max-width:1200px){
  .about-container{width:min(1120px,calc(100% - 64px))}
  .about-hero{grid-template-columns:minmax(380px,.9fr) minmax(430px,1.1fr);gap:32px}
  .hero-copy h1{font-size:clamp(65px,8vw,105px)}
  .visual-frame{width:min(560px,92%);height:520px}
}
@media (max-width:992px){
  .about-section{padding-top:32px}
  .about-topline{margin-bottom:32px}
  .topline-copy{display:none}
  .about-hero{grid-template-columns:1fr;gap:15px;min-height:auto}
  .hero-copy{padding-top:0}
  .hero-copy h1{font-size:clamp(70px,13vw,112px)}
  .hero-visual{height:590px;margin-top:0}
  .visual-frame{right:50%;transform:translateX(50%);width:min(650px,92%);height:540px}
  .services-section{grid-template-columns:1fr;gap:32px;margin-top:70px}
  .services-intro{position:static}
  .story-section{grid-template-columns:125px 1fr;gap:30px;margin-top:75px}
  .story-columns{grid-template-columns:1fr 1fr;gap:20px}
}
@media (max-width:680px){
  .about-section{padding:28px 0 85px}
  .about-container{width:calc(100% - 30px)}
  .about-topline{margin-bottom:28px}
  .hero-copy h1{font-size:clamp(52px,15vw,78px)}
  .hero-description{margin-top:25px}
  .hero-actions{margin-top:22px}
  .hero-visual{height:490px;margin-top:10px}
  .visual-frame{top:35px;width:100%;height:450px}
  .visual-index{top:0;right:8px;width:112px;height:112px}
  .info-strip{grid-template-columns:1fr}
  .strip-item,.strip-item:nth-child(2),.strip-item:nth-child(3),.strip-mark{border-right:0;border-top:1px solid var(--line)}
  .strip-item:first-child{border-top:0}
  .services-section{margin-top:60px;gap:25px}
  .service-row{grid-template-columns:30px 50px 1fr 20px;gap:10px;padding:15px 0;min-height:135px}
  .service-row p{grid-column:3/5;margin-top:0}
  .story-section{grid-template-columns:1fr;gap:20px;margin-top:65px}
  .story-columns{grid-template-columns:1fr;gap:14px}
  .story-footer{margin-top:28px}
  .ticker-wrap{height:48px;bottom:-20px}
  .ticker-content{font-size:15px;gap:14px}
  .footer-inner{width:calc(100% - 35px);padding:35px 0}
  .footer-grid{grid-template-columns:1fr;gap:28px}
  .footer-links{grid-template-columns:1fr 1fr;gap:18px}
  .whatsapp-floating-btn{width:58px;height:58px;right:15px;bottom:15px}
}
@media (prefers-reduced-motion:reduce){
  .ticker-content,.spark{animation:none}
  .photo img,.service-row,.row-arrow,.outline-button,.social-link,.whatsapp-floating-btn{transition:none}
}
</style>
