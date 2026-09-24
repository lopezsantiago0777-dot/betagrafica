
<template>
  <section class="pantalla bloque-equipo" id="equipo">


    <div class="equipo-background" aria-hidden="true">
      <div class="grid-equipo"></div>
      <div class="light-orb orb-one"></div>
      <div class="light-orb orb-two"></div>
      <div class="light-line line-one"></div>
      <div class="light-line line-two"></div>

      <!-- DECORACIONES BORDÓ -->
      <div class="decor-x x-one">×</div>
      <div class="decor-x x-two">×</div>
      <div class="decor-square square-one"></div>
      <div class="decor-square square-two"></div>
      <div class="decor-circle circle-one"></div>
      <div class="decor-circle circle-two"></div>
    </div>

    <div class="container equipo-container">

      
      <div class="equipo-heading">

        <div class="heading-index">
          <span>04</span>
          <div></div>
          <small>PEOPLE / BETA</small>
        </div>

        <div class="heading-main">
          <span class="section-tag">DETRÁS DE LA MARCA</span>

          <h3 class="texto-grande">
            Las personas detrás
            <span>de cada proyecto.</span>
          </h3>

          <p class="heading-description">
            Un equipo multidisciplinario que combina experiencia,
            creatividad y precisión para convertir ideas en piezas reales.
          </p>
        </div>

      </div>

      
      <div class="team-grid">

        <article
          v-for="(miembro, index) in equipo"
          :key="miembro.nombre"
          class="team-card"
          :class="`member-${index + 1}`"
        >

          
          <div class="card-number">
            0{{ index + 1 }}
          </div>

          
          <div class="card-x">×</div>

          
          <div class="image-wrapper">

            <picture>
              <source
                type="image/avif"
                :srcset="`
                  ${'/imagenes/' + miembro.imagenName}-400.avif 400w,
                  ${'/imagenes/' + miembro.imagenName}-800.avif 800w,
                  ${'/imagenes/' + miembro.imagenName}-1200.avif 1200w
                `"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              <source
                type="image/webp"
                :srcset="`
                  ${'/imagenes/' + miembro.imagenName}-400.webp 400w,
                  ${'/imagenes/' + miembro.imagenName}-800.webp 800w,
                  ${'/imagenes/' + miembro.imagenName}-1200.webp 1200w
                `"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              <img
                :src="miembro.imagen"
                :alt="miembro.nombre"
                loading="lazy"
                decoding="async"
                class="team-img"
              />
            </picture>

          
            <div class="image-gradient"></div>

            <!-- ETIQUETA SUPERIOR -->
            <div class="image-status">
              <span></span>
              DISPONIBLE
            </div>

          
            <div class="role-panel">

              <div class="role-label">
                PERFIL PROFESIONAL
              </div>

              <p>
                {{ miembro.rol }}
              </p>

              <div class="role-line"></div>

            </div>

          </div>

          
          <div class="card-info">

            <div class="name-row">

              <div>
                <h2 class="member-name">
                  {{ miembro.nombre }}
                </h2>

                <span class="member-location">
                  {{ miembro.localidad }}
                </span>
              </div>

              <span class="member-age">
                {{ miembro.edad }}
              </span>

            </div>

            
            <div
              v-if="miembro.esSuCumple"
              class="birthday-container"
            >
              <span class="birthday-icon">✦</span>

              <span class="birthday-tag">
                HOY ES SU CUMPLEAÑOS
              </span>

              <span class="birthday-icon">✦</span>
            </div>

            <div class="card-bottom">

              <span>
                EDAD
              </span>

              <span class="bottom-line"></span>

              <span>
                {{ miembro.edad }} AÑOS
              </span>

            </div>

          </div>

        </article>

      </div>

    </div>
  </section>

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

</template>


<script setup>

import { computed } from 'vue'

import pipi from '/imagenes/pipi.jpeg'
import pao from '/imagenes/paoactu.jpeg'
import german from '/imagenes/germanactu.jpeg'
import caro from '/imagenes/caroactu.jpeg'
import nahuel from '/imagenes/nahuel.jpg'
import guille from '/imagenes/guilleactu.jpeg'


function esCumpleañosHoy(fechaNacimiento) {

  const hoy = new Date()

  const [anio, mes, dia] = fechaNacimiento
    .split('-')
    .map(Number)

  return (
    hoy.getDate() === dia &&
    hoy.getMonth() + 1 === mes
  )

}


function calcularEdad(fechaNacimiento) {

  const hoy = new Date()

  const [anio, mes, dia] = fechaNacimiento
    .split('-')
    .map(Number)

  const cumpleEsteAño =
    new Date(
      hoy.getFullYear(),
      mes - 1,
      dia
    )

  let edad =
    hoy.getFullYear() - anio

  if (hoy < cumpleEsteAño) {
    edad--
  }

  return edad

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

]


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

      esSuCumple:
        esCumpleañosHoy(miembro.nacimiento)

    }

  })

})


function pathExt(importValue) {

  try {

    const s = String(importValue)

    const m =
      s.match(
        /\.(jpe?g|png|gif|webp|jpeg)$/i
      )

    return m
      ? `.${m[1]}`
      : '.jpg'

  } catch (e) {

    return '.jpg'

  }

}

</script>


<style scoped>


.bloque-equipo {

  --background: #101214;
  --surface: #171A1D;
  --surface-light: #1D2125;

  --white: #F5F5F5;
  --muted: #858A91;
  --soft: #B8BCC2;

  --accent: #650D20;
  --accent-dark: #430814;

  --line: rgba(101, 13, 32, .42);

  position: relative;

  width: 100%;
  min-height: 100vh;

  padding: 150px 0 120px;

  background:
    radial-gradient(
      circle at 15% 20%,
      rgba(101,13,32,.14),
      transparent 28%
    ),
    radial-gradient(
      circle at 85% 80%,
      rgba(67,8,20,.12),
      transparent 30%
    ),
    var(--background);

  overflow: hidden;

}



.equipo-background {

  position: absolute;
  inset: 0;

  pointer-events: none;

  overflow: hidden;

}


.grid-equipo {

  position: absolute;
  inset: 0;

  opacity: .32;

  background-image:
    linear-gradient(
      rgba(101,13,32,.12) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(101,13,32,.12) 1px,
      transparent 1px
    );

  background-size: 80px 80px;

  mask-image:
    radial-gradient(
      ellipse at center,
      black 0%,
      transparent 75%
    );

}


.light-orb {

  position: absolute;

  width: 500px;
  height: 500px;

  border-radius: 50%;

  filter: blur(130px);

  opacity: .16;

}


.orb-one {

  top: -250px;
  left: -180px;

  background: #650D20;

}


.orb-two {

  bottom: -300px;
  right: -200px;

  background: #430814;

}


.light-line {

  position: absolute;

  width: 1px;
  height: 70%;

  background:
    linear-gradient(
      transparent,
      rgba(101,13,32,.55),
      transparent
    );

  transform: rotate(22deg);

}


.line-one {

  left: 18%;
  top: 15%;

}


.line-two {

  right: 22%;
  top: 5%;

  transform: rotate(-22deg);

}



.decor-x {

  position: absolute;

  color: #650D20;

  font-family: Arial, sans-serif;

  font-size: 34px;

  font-weight: 300;

  line-height: 1;

  opacity: .65;

  text-shadow:
    0 0 18px rgba(101,13,32,.35);

}


.x-one {

  top: 18%;
  left: 6%;

  transform: rotate(12deg);

}


.x-two {

  right: 7%;
  bottom: 21%;

  font-size: 26px;

  transform: rotate(-15deg);

}

 

.decor-square {

  position: absolute;

  width: 14px;
  height: 14px;

  border: 2px solid #650D20;

  opacity: .75;

  transform: rotate(45deg);

}


.square-one {

  top: 35%;
  right: 8%;

}


.square-two {

  bottom: 12%;
  left: 9%;

  width: 9px;
  height: 9px;

  background: rgba(101,13,32,.25);

}

 

.decor-circle {

  position: absolute;

  width: 12px;
  height: 12px;

  border: 2px solid #650D20;

  border-radius: 50%;

  opacity: .7;

}


.circle-one {

  top: 62%;
  left: 4%;

}


.circle-two {

  top: 12%;
  right: 18%;

  width: 7px;
  height: 7px;

  background: #650D20;

}

 

.equipo-container {

  position: relative;

  z-index: 2;

  max-width: 1450px;

  margin: 0 auto;

  padding: 0 45px;

}

 

.equipo-heading {

  display: grid;

  grid-template-columns: 180px 1fr;

  gap: 60px;

  align-items: start;

  margin-bottom: 90px;

}


.heading-index {

  padding-top: 8px;

  display: flex;

  flex-direction: column;

  gap: 15px;

}


.heading-index span {

  position: relative;

  display: inline-flex;

  align-items: center;

  width: fit-content;

  padding: 6px 10px;

  font-family: monospace;

  font-size: 14px;

  color: #ffffff;

  letter-spacing: 3px;

  border-left: 3px solid #650D20;

  border-bottom: 1px solid rgba(101,13,32,.55);

}


.heading-index div {

  width: 55px;
  height: 2px;

  background: #650D20;

}


.heading-index small {

  color: #858A91;

  font-family: monospace;

  font-size: 9px;

  letter-spacing: 2px;

}


 

.heading-main {

  max-width: 850px;

}


.section-tag {

  position: relative;

  display: inline-block;

  margin-bottom: 18px;

  padding: 7px 12px;

  color: #B8BCC2;

  font-family: monospace;

  font-size: 10px;

  letter-spacing: 5px;

  font-weight: 700;

  border-left: 3px solid #650D20;

  border-right: 1px solid rgba(101,13,32,.45);

  background: rgba(101,13,32,.08);

}


.texto-grande {

  position: relative;

  margin: 0;

  max-width: 850px;

  padding-left: 22px;

  font-size: clamp(
    42px,
    5.2vw,
    76px
  );

  line-height: .98;

  letter-spacing: -.055em;

  font-weight: 850;

  color: #F5F5F5;

}


.texto-grande::before {

  content: '';

  position: absolute;

  left: 0;
  top: 5px;
  bottom: 5px;

  width: 4px;

  background: #650D20;

}


.texto-grande::after {

  content: '';

  position: absolute;

  width: 10px;
  height: 10px;

  left: -3px;
  top: -8px;

  border: 2px solid #650D20;

}


.texto-grande span {

  display: block;

  color: #858A91;

}


.heading-description {

  max-width: 560px;

  margin: 28px 0 0;

  padding-left: 22px;

  color: #858A91;

  font-size: 15px;

  line-height: 1.8;

  border-left: 1px solid rgba(101,13,32,.28);

}

 

.team-grid {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 26px;

}

 
.team-card {

  position: relative;

  background: var(--surface);

  border: 1px solid rgba(101,13,32,.38);

  overflow: hidden;

  transition:
    transform .55s cubic-bezier(.16,1,.3,1),
    border-color .4s ease,
    box-shadow .5s ease;

}


.team-card::before {

  content: '';

  position: absolute;

  top: 0;
  left: 0;

  width: 42px;
  height: 3px;

  background: #650D20;

  z-index: 8;

}


.team-card::after {

  content: '';

  position: absolute;

  right: 0;
  bottom: 0;

  width: 34px;
  height: 34px;

  border-right: 2px solid #650D20;
  border-bottom: 2px solid #650D20;

  z-index: 8;

  pointer-events: none;

}


.team-card:nth-child(2),
.team-card:nth-child(5) {

  transform: translateY(45px);

}


.team-card:hover {

  transform:
    translateY(-10px);

  border-color:
    #650D20;

  box-shadow:
    0 35px 80px rgba(0,0,0,.55),
    0 0 0 1px rgba(101,13,32,.18);

}


.team-card:nth-child(2):hover,
.team-card:nth-child(5):hover {

  transform:
    translateY(35px);

}
 

.card-x {

  position: absolute;

  top: 17px;
  left: 20px;

  z-index: 7;

  color: #650D20;

  font-size: 20px;

  line-height: 1;

  opacity: .9;

  transition:
    transform .35s ease,
    color .35s ease;

}


.team-card:hover .card-x {

  transform: rotate(90deg) scale(1.15);

  color: #8A1730;

}
 
.card-number {

  position: absolute;

  top: 18px;
  right: 20px;

  z-index: 7;

  font-family: monospace;

  font-size: 10px;

  color: rgba(255,255,255,.75);

  letter-spacing: 2px;

  padding: 5px 7px;

  border: 1px solid rgba(101,13,32,.65);

  background: rgba(16,18,20,.65);

}

 

.image-wrapper {

  position: relative;

  width: 100%;

  aspect-ratio: 1 / 1.12;

  overflow: hidden;

  background: #101214;

}


.team-img {

  width: 100%;
  height: 100%;

  object-fit: cover;

  filter:
    saturate(.95)
    contrast(1.03);

  transform: scale(1.001);

  transition:
    transform .9s cubic-bezier(.16,1,.3,1),
    filter .7s ease;

}


.team-card:hover .team-img {

  transform: scale(1.055);

  filter:
    saturate(1)
    contrast(1.06);

}

 

.image-gradient {

  position: absolute;

  inset: 0;

  background:
    linear-gradient(
      to bottom,
      rgba(16,18,20,.18),
      transparent 45%,
      rgba(10,7,9,.82)
    );

  z-index: 1;

}

 

.image-status {

  position: absolute;

  top: 20px;
  left: 20px;

  z-index: 4;

  display: flex;

  align-items: center;

  gap: 8px;

  padding: 7px 10px;

  background:
    rgba(16,18,20,.72);

  backdrop-filter: blur(8px);

  border:
    1px solid rgba(101,13,32,.7);

  color:
    rgba(255,255,255,.9);

  font-family: monospace;

  font-size: 8px;

  letter-spacing: 1.5px;

}


.image-status span {

  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #650D20;

  box-shadow:
    0 0 0 3px rgba(101,13,32,.16);

}

 

.role-panel {

  position: absolute;

  left: 20px;
  right: 20px;
  bottom: 20px;

  z-index: 3;

  padding: 18px;

  background:
    rgba(16,18,20,.92);

  backdrop-filter:
    blur(14px);

  border:
    1px solid rgba(101,13,32,.65);

  transform:
    translateY(20px);

  opacity: 0;

  transition:
    opacity .45s ease,
    transform .55s cubic-bezier(.16,1,.3,1);

}


.team-card:hover .role-panel {

  opacity: 1;

  transform:
    translateY(0);

}


.role-label {

  color: #858A91;

  font-family: monospace;

  font-size: 8px;

  letter-spacing: 2px;

  margin-bottom: 9px;

}


.role-panel p {

  margin: 0;

  color: #E4E5E7;

  font-size: 12px;

  line-height: 1.6;

}


.role-line {

  width: 35px;

  height: 2px;

  margin-top: 14px;

  background:
    #650D20;

}

 

.card-info {

  position: relative;

  padding:
    23px 22px 18px;

  background:
    linear-gradient(
      135deg,
      #171A1D,
      #101214
    );

}


.card-info::before {

  content: '';

  position: absolute;

  top: 0;
  left: 22px;

  width: 28px;
  height: 2px;

  background: #650D20;

}


.name-row {

  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 15px;

}


.member-name {

  margin: 0;

  color: #F5F5F5;

  font-size: 18px;

  line-height: 1.2;

  font-weight: 800;

  letter-spacing: -.025em;

  transition:
    color .3s ease;

}


.team-card:hover .member-name {

  color: #FFFFFF;

}


.member-location {

  display: block;

  margin-top: 7px;

  color: #858A91;

  font-family: monospace;

  font-size: 9px;

  letter-spacing: 1px;

}


.member-age {

  color: #858A91;

  font-family: monospace;

  font-size: 11px;

  padding: 4px 6px;

  border: 1px solid rgba(101,13,32,.4);

}

 

.birthday-container {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  margin-top: 15px;

  padding: 8px 10px;

  border:
    1px solid rgba(101,13,32,.7);

  background:
    rgba(101,13,32,.09);

}


.birthday-tag {

  color: #F5F5F5;

  font-family: monospace;

  font-size: 8px;

  letter-spacing: 1px;

}


.birthday-icon {

  color: #650D20;

  font-size: 10px;

}
 

.card-bottom {

  display: flex;

  align-items: center;

  gap: 9px;

  margin-top: 20px;

  color: #686E76;

  font-family: monospace;

  font-size: 8px;

  letter-spacing: 1px;

}


.bottom-line {

  flex: 1;

  height: 1px;

  background:
    rgba(101,13,32,.5);

}

 

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
  color: #650D20;
  background: ;
  border-color: #650D20;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(101, 13, 32, 0.25);
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

@media (max-width: 1100px) {

  .team-grid {

    grid-template-columns:
      repeat(2, 1fr);

  }

  .team-card:nth-child(2),
  .team-card:nth-child(5) {

    transform: none;

  }

  .team-card:nth-child(2):hover,
  .team-card:nth-child(5):hover {

    transform:
      translateY(-10px);

  }

}


 

@media (max-width: 768px) {

  .bloque-equipo {

    padding:
      110px 0 70px;

  }


  .equipo-container {

    padding:
      0 20px;

  }


  .equipo-heading {

    grid-template-columns: 1fr;

    gap: 25px;

    margin-bottom: 55px;

  }


  .heading-index {

    flex-direction: row;

    align-items: center;

    gap: 12px;

  }


  .heading-index div {

    width: 30px;

  }


  .texto-grande {

    font-size:
      clamp(40px, 12vw, 58px);

  }


  .heading-description {

    font-size: 14px;

  }


  .team-grid {

    grid-template-columns: 1fr;

    gap: 22px;

  }


  .team-card:nth-child(2),
  .team-card:nth-child(5) {

    transform: none;

  }


  .team-card:nth-child(2):hover,
  .team-card:nth-child(5):hover {

    transform:
      translateY(-8px);

  }


  /*
   * En celular el rol queda accesible
   * sin depender del hover.
   */

  .role-panel {

    opacity: 1;

    transform: translateY(0);

    bottom: 15px;

    left: 15px;
    right: 15px;

  }


  .footer {

    padding:
      60px 0;

  }


  .footer-row {

    flex-direction: column;

    text-align: center;

    padding:
      0 25px;

  }


  .social-hub {

    align-items: center;

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


  .decor-x {

    opacity: .4;

  }


  .grid-equipo {

    background-size: 55px 55px;

  }

}

</style>
