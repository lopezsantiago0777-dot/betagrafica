<template>
  <header :class="['header', { scrolled: isScrolled }]">
    <div class="container header-flex">

      <!-- LOGO -->
      <RouterLink to="/" class="logo" aria-label="Ir a inicio">
        <img
          src="/imagenes/betalogo.png"
          alt="Logo Beta Gráfica"
          class="logo-img"
        />

        <span class="logo-main">Beta</span>
        <span class="logo-secondary">Gráfica</span>
      </RouterLink>

      <!-- NAVEGACIÓN -->
      <nav class="nav-menu">

        <ul :class="{ open: isMenuOpen }">

          <li>
            <RouterLink to="/" @click="closeMenu">
              Inicio
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/beta" @click="closeMenu">
              Beta Gráfica
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/vinyl" @click="closeMenu">
              Vinyl
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/plotear" @click="closeMenu">
              PloteAR
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/equipo" @click="closeMenu">
              Equipo
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/fotos" @click="closeMenu">
              Trabajos
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/ventas" @click="closeMenu">
              Productos
            </RouterLink>
          </li>

          <!-- LOGIN -->
          <li v-if="!isLoggedIn" class="nav-cta">
            <RouterLink to="/clientes" @click="closeMenu">
              Inicio Sesión
            </RouterLink>
          </li>

          <!-- USUARIO LOGUEADO -->
          <li v-else class="user-nav">

            <button
              class="user-button"
              @click="toggleProfileMenu"
              aria-label="Abrir menú de usuario"
              :aria-expanded="profileMenuOpen"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.6-9 6v2h18v-2c0-3.4-4-6-9-6Z"
                />
              </svg>
            </button>

            <transition name="profile-menu">
              <div
                v-if="profileMenuOpen"
                class="profile-dropdown"
              >

                <div class="profile-header">

                  <div class="mini-avatar">
                    {{ (usuario.nombre || 'U').charAt(0).toUpperCase() }}
                  </div>

                  <div class="profile-info">
                    <strong>
                      {{ usuario.nombre || 'Usuario' }}
                    </strong>

                    <small>
                      {{ usuario.email || '' }}
                    </small>
                  </div>

                </div>

                <button
                  class="profile-action"
                  @click="goToDashboard"
                >
                  <span class="action-icon">↗</span>
                  Panel de ventas
                </button>

                <button
                  class="profile-action logout"
                  @click="handleLogout"
                >
                  <span class="action-icon">×</span>
                  Cerrar sesión
                </button>

              </div>
            </transition>

          </li>

        </ul>

        <!-- MENÚ MOBILE -->
        <button
          class="mobile-toggle"
          :class="{ active: isMenuOpen }"
          @click="toggleMenu"
          aria-label="Abrir menú"
          :aria-expanded="isMenuOpen"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </nav>
    </div>
  </header>
</template>


<script setup lang="ts">

import {
  ref,
  onMounted,
  onBeforeUnmount
} from 'vue'

import { useRouter } from 'vue-router'


const router = useRouter()

const isScrolled = ref(false)
const isMenuOpen = ref(false)
const isLoggedIn = ref(false)
const profileMenuOpen = ref(false)

const usuario = ref<Record<string, any>>({})


/* =========================================================
   SCROLL
========================================================= */

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40
}


/* =========================================================
   SESIÓN
========================================================= */

const checkSession = () => {

  const token = localStorage.getItem('token')
  const sesion = localStorage.getItem('sesion_usuario')

  if (!token || !sesion) {

    isLoggedIn.value = false
    usuario.value = {}
    profileMenuOpen.value = false

    return
  }

  try {

    const data = JSON.parse(sesion)

    if (!data || typeof data !== 'object') {
      throw new Error('Sesión inválida')
    }

    usuario.value = data
    isLoggedIn.value = true

  } catch {

    localStorage.removeItem('token')
    localStorage.removeItem('sesion_usuario')

    isLoggedIn.value = false
    usuario.value = {}
    profileMenuOpen.value = false
  }
}


/* =========================================================
   MENÚ
========================================================= */

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}


/* =========================================================
   PERFIL
========================================================= */

function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value
}


/* =========================================================
   DASHBOARD
========================================================= */

function goToDashboard() {

  profileMenuOpen.value = false
  closeMenu()

  router.push('/ventas')
}


/* =========================================================
   LOGOUT
========================================================= */

function handleLogout() {

  localStorage.removeItem('token')
  localStorage.removeItem('sesion_usuario')

  isLoggedIn.value = false
  usuario.value = {}
  profileMenuOpen.value = false

  closeMenu()

  window.dispatchEvent(new Event('auth-changed'))

  router.push('/')
}


/* =========================================================
   MOUNT
========================================================= */

onMounted(() => {

  handleScroll()
  checkSession()

  window.addEventListener(
    'scroll',
    handleScroll,
    { passive: true }
  )

  window.addEventListener(
    'auth-changed',
    checkSession
  )

  window.addEventListener(
    'storage',
    checkSession
  )
})


/* =========================================================
   UNMOUNT
========================================================= */

onBeforeUnmount(() => {

  window.removeEventListener(
    'scroll',
    handleScroll
  )

  window.removeEventListener(
    'auth-changed',
    checkSession
  )

  window.removeEventListener(
    'storage',
    checkSession
  )
})

</script>


<style scoped>

/* =========================================================
   VARIABLES
========================================================= */

.header {
  --white: #ffffff;
  --text: #f5f5f5;
  --text-soft: #d0d0d0;

  --wine: #650d20;
  --wine-dark: #430814;

  --wine-light: rgba(101, 13, 32, 0.22);
  --wine-border: rgba(101, 13, 32, 0.55);

  --white-border: rgba(255, 255, 255, 0.18);

  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}


/* =========================================================
   RESET
========================================================= */

* {
  box-sizing: border-box;
}


/* =========================================================
   CONTAINER
========================================================= */

.container {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 0 42px;
}


/* =========================================================
   HEADER
   TRANSPARENTE REAL
========================================================= */

.header {
  position: fixed;
  inset: 0 0 auto 0;

  z-index: 2100;

  padding: 19px 0;

  /*
    IMPORTANTE:
    No usamos opacity.
    No usamos fondo sólido.
  */

  background: transparent;

  border-bottom: none;

  box-shadow: none;

  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  isolation: isolate;

  transition:
    padding 0.5s var(--ease);
}


/* =========================================================
   HEADER SCROLLED
========================================================= */

.header.scrolled {
  padding: 11px 0;

  background: transparent;

  border-bottom: none;

  box-shadow: none;

  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}


/* =========================================================
   HEADER FLEX
========================================================= */

.header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 40px;
}


/* =========================================================
   LOGO
========================================================= */

.logo {
  position: relative;

  display: inline-flex;
  align-items: center;

  gap: 7px;

  color: #ffffff;

  text-decoration: none;

  font-size: 17px;
  font-weight: 800;

  letter-spacing: 1.5px;

  white-space: nowrap;

  /*
    Sombra independiente para que el texto
    siga siendo visible sobre imágenes claras.
  */
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.75),
    0 4px 12px rgba(0, 0, 0, 0.45);

  transition:
    transform 0.35s var(--ease),
    text-shadow 0.3s ease;
}


.logo:hover {
  transform: translateX(2px);

  text-shadow:
    0 2px 5px rgba(0, 0, 0, 0.85),
    0 5px 15px rgba(0, 0, 0, 0.55);
}


/* =========================================================
   LOGO IMAGEN
========================================================= */

.logo-img {
  width: auto;
  height: 31px;

  display: block;

  object-fit: contain;

  filter:
    grayscale(1)
    brightness(1.15)
    drop-shadow(0 3px 5px rgba(0, 0, 0, 0.6));

  transition:
    transform 0.4s var(--ease),
    filter 0.4s ease;
}


.logo:hover .logo-img {
  transform:
    rotate(-3deg)
    scale(1.04);

  filter:
    grayscale(1)
    brightness(1.3)
    drop-shadow(0 4px 8px rgba(0, 0, 0, 0.7));
}


/* =========================================================
   TEXTO LOGO
========================================================= */

.logo-main {
  color: #ffffff;

  font-weight: 800;
}


.logo-secondary {
  color: #d0d0d0;

  font-weight: 400;

  letter-spacing: 1px;
}


/* =========================================================
   NAVEGACIÓN
========================================================= */

.nav-menu {
  display: flex;
  align-items: center;
}


/* =========================================================
   CONTENEDOR NAV
========================================================= */

.nav-menu > ul {
  display: flex;
  align-items: center;

  gap: 3px;

  list-style: none;

  margin: 0;
  padding: 4px;

  /*
    TOTALMENTE TRANSPARENTE
  */
  background: transparent;

  /*
    Solo dejamos una línea muy fina para
    separar visualmente la navegación.
  */
  border: 1px solid var(--white-border);

  border-radius: 13px;

  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08);
}


/* =========================================================
   LI
========================================================= */

.nav-menu > ul > li {
  position: relative;
}


/* =========================================================
   LINKS
========================================================= */

.nav-menu a {
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 34px;

  padding: 0 12px;

  /*
    Antes estaba demasiado gris.
    Ahora es casi blanco.
  */
  color: #f1f1f1;

  text-decoration: none;

  font-size: 9px;
  font-weight: 750;

  letter-spacing: 1.35px;

  text-transform: uppercase;

  border-radius: 9px;

  /*
    La sombra permite que el texto se vea
    incluso cuando detrás hay una imagen clara.
  */
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.85),
    0 4px 10px rgba(0, 0, 0, 0.45);

  transition:
    color 0.25s ease,
    background 0.3s var(--ease),
    transform 0.3s var(--ease),
    text-shadow 0.25s ease;
}


/* =========================================================
   HOVER
========================================================= */

.nav-menu a:hover {
  color: #ffffff;

  background:
    rgba(101, 13, 32, 0.25);

  transform:
    translateY(-1px);

  text-shadow:
    0 2px 5px rgba(0, 0, 0, 0.9),
    0 4px 12px rgba(0, 0, 0, 0.6);
}


/* =========================================================
   LINK ACTIVO
========================================================= */

.nav-menu a.router-link-active {
  color: #ffffff;

  background:
    rgba(101, 13, 32, 0.28);

  box-shadow:
    inset 0 -2px 0 #650d20;

  text-shadow:
    0 2px 5px rgba(0, 0, 0, 0.9),
    0 4px 12px rgba(0, 0, 0, 0.55);
}


/* =========================================================
   PUNTO LINK ACTIVO
========================================================= */

.nav-menu a.router-link-active::before {
  content: "";

  position: absolute;

  left: 50%;
  bottom: 3px;

  width: 4px;
  height: 4px;

  border-radius: 50%;

  background: #650d20;

  transform: translateX(-50%);

  box-shadow:
    0 0 7px rgba(101, 13, 32, 0.8);
}


/* =========================================================
   LOGIN CTA
========================================================= */

.nav-cta {
  margin-left: 5px;
}


.nav-cta a {
  min-height: 34px;

  padding: 0 15px;

  color: #ffffff !important;

  background: #650d20;

  border: 1px solid #650d20;

  border-radius: 9px;

  font-size: 9px;

  letter-spacing: 1.2px;

  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.5);

  box-shadow:
    0 5px 18px rgba(101, 13, 32, 0.3);

  transition:
    background 0.25s ease,
    color 0.25s ease,
    transform 0.3s var(--ease),
    box-shadow 0.3s ease;
}


.nav-cta a:hover {
  color: #ffffff !important;

  background: #430814;

  border-color: #430814;

  transform:
    translateY(-2px);

  box-shadow:
    0 9px 28px rgba(67, 8, 20, 0.45);
}


/* =========================================================
   USER
========================================================= */

.user-nav {
  position: relative;

  margin-left: 5px;
}


/* =========================================================
   USER BUTTON
========================================================= */

.user-button {
  position: relative;

  width: 34px;
  height: 34px;

  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  color: #f0f0f0;

  background: transparent;

  border:
    1px solid rgba(255, 255, 255, 0.25);

  border-radius: 9px;

  filter:
    drop-shadow(0 3px 5px rgba(0, 0, 0, 0.45));

  transition:
    color 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.3s var(--ease),
    box-shadow 0.3s ease;
}


.user-button:hover {
  color: #ffffff;

  background: #650d20;

  border-color: #650d20;

  transform:
    translateY(-2px);

  box-shadow:
    0 8px 25px rgba(101, 13, 32, 0.35);
}


.user-button svg {
  width: 16px;
  height: 16px;

  fill: currentColor;
}


/* =========================================================
   PROFILE DROPDOWN
========================================================= */

.profile-dropdown {
  position: absolute;

  top: calc(100% + 13px);
  right: 0;

  width: 285px;

  padding: 8px;

  overflow: hidden;

  /*
    El dropdown SÍ tiene fondo porque necesita
    máxima legibilidad.
  */
  background:
    rgba(16, 18, 20, 0.96);

  border:
    1px solid rgba(101, 13, 32, 0.6);

  border-radius: 14px;

  box-shadow:
    0 25px 70px rgba(0, 0, 0, 0.65);

  backdrop-filter:
    blur(25px);

  -webkit-backdrop-filter:
    blur(25px);
}


/* =========================================================
   PROFILE HEADER
========================================================= */

.profile-header {
  display: flex;
  align-items: center;

  gap: 11px;

  padding: 13px 10px;

  margin-bottom: 5px;

  border-bottom:
    1px solid rgba(101, 13, 32, 0.35);
}


/* =========================================================
   AVATAR
========================================================= */

.mini-avatar {
  width: 38px;
  height: 38px;

  flex: 0 0 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  color: #ffffff;

  background:
    linear-gradient(
      145deg,
      #650d20,
      #430814
    );

  font-size: 13px;
  font-weight: 850;

  box-shadow:
    0 4px 12px rgba(101, 13, 32, 0.3);
}


/* =========================================================
   PROFILE INFO
========================================================= */

.profile-info {
  min-width: 0;
}


.profile-info strong {
  display: block;

  color: #f4f4f4;

  font-size: 12px;
  font-weight: 700;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}


.profile-info small {
  display: block;

  color: #999999;

  font-size: 9px;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}


/* =========================================================
   PROFILE ACTION
========================================================= */

.profile-action {
  width: 100%;

  display: flex;
  align-items: center;

  gap: 10px;

  padding: 10px;

  border: 0;

  border-radius: 8px;

  background: transparent;

  color: #b5b5b5;

  text-align: left;

  cursor: pointer;

  font-family: inherit;

  font-size: 11px;
  font-weight: 650;

  transition:
    color 0.2s ease,
    background 0.2s ease,
    padding-left 0.3s var(--ease);
}


.profile-action:hover {
  color: #ffffff;

  background:
    rgba(101, 13, 32, 0.16);

  padding-left: 13px;
}


/* =========================================================
   ACTION ICON
========================================================= */

.action-icon {
  width: 23px;
  height: 23px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 23px;

  border-radius: 6px;

  background:
    rgba(101, 13, 32, 0.14);

  border:
    1px solid rgba(101, 13, 32, 0.3);

  color: #ffffff;

  font-size: 12px;
}


/* =========================================================
   LOGOUT
========================================================= */

.profile-action.logout {
  margin-top: 3px;

  color: #999999;
}


.profile-action.logout:hover {
  color: #ffffff;

  background:
    rgba(101, 13, 32, 0.14);
}


/* =========================================================
   PROFILE ANIMATION
========================================================= */

.profile-menu-enter-active,
.profile-menu-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.3s var(--ease);
}


.profile-menu-enter-from,
.profile-menu-leave-to {
  opacity: 0;

  transform:
    translateY(-8px)
    scale(0.97);
}


/* =========================================================
   MOBILE TOGGLE
========================================================= */

.mobile-toggle {
  position: relative;

  z-index: 2200;

  width: 38px;
  height: 38px;

  display: none;

  padding: 0;

  align-items: center;
  justify-content: center;

  flex-direction: column;

  gap: 5px;

  cursor: pointer;

  background: transparent;

  border:
    1px solid rgba(255, 255, 255, 0.25);

  border-radius: 9px;

  filter:
    drop-shadow(0 3px 5px rgba(0, 0, 0, 0.45));

  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.3s ease;
}


.mobile-toggle span {
  display: block;

  width: 15px;
  height: 1px;

  background: #ffffff;

  border-radius: 2px;

  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.7);

  transition:
    transform 0.35s var(--ease),
    opacity 0.25s ease;
}


.mobile-toggle:hover {
  background:
    rgba(101, 13, 32, 0.2);

  border-color:
    rgba(101, 13, 32, 0.8);
}


.mobile-toggle.active {
  background: #650d20;

  border-color: #650d20;
}


.mobile-toggle.active span {
  background: #ffffff;
}


/* =========================================================
   MOBILE TOGGLE ANIMATION
========================================================= */

.mobile-toggle.active span:nth-child(1) {
  transform:
    translateY(6px)
    rotate(45deg);
}


.mobile-toggle.active span:nth-child(2) {
  opacity: 0;
}


.mobile-toggle.active span:nth-child(3) {
  transform:
    translateY(-6px)
    rotate(-45deg);
}


/* =========================================================
   MOBILE MENU
========================================================= */

@media (max-width: 1100px) {

  .mobile-toggle {
    display: flex;
  }


  .nav-menu > ul {
    position: fixed;

    top: 0;
    right: 0;

    width: min(390px, 88vw);
    height: 100dvh;

    margin: 0;

    padding:
      105px 30px 35px;

    display: flex;

    flex-direction: column;

    align-items: stretch;

    justify-content: flex-start;

    gap: 5px;

    overflow-y: auto;

    /*
      Mobile menu precisa de fundo para
      manter a leitura perfeita.
    */
    background:
      rgba(12, 14, 16, 0.96);

    border: 0;

    border-left:
      1px solid rgba(101, 13, 32, 0.6);

    border-radius: 0;

    box-shadow:
      -25px 0 70px rgba(0, 0, 0, 0.5);

    backdrop-filter:
      blur(25px);

    -webkit-backdrop-filter:
      blur(25px);

    transform:
      translateX(100%);

    transition:
      transform 0.55s var(--ease);

    z-index: 2150;
  }


  .nav-menu > ul.open {
    transform:
      translateX(0);
  }


  .nav-menu > ul > li {
    width: 100%;
  }


  .nav-menu a {
    width: 100%;

    min-height: 48px;

    justify-content: flex-start;

    padding: 0 14px;

    border-radius: 9px;

    color: #e5e5e5;

    font-size: 10px;

    letter-spacing: 1.8px;

    text-shadow: none;
  }


  .nav-menu a:hover {
    color: #ffffff;

    background:
      rgba(101, 13, 32, 0.18);
  }


  .nav-menu a.router-link-active {
    color: #ffffff;

    background:
      rgba(101, 13, 32, 0.2);
  }


  .nav-cta {
    margin:
      13px 0 0;
  }


  .user-nav {
    margin:
      10px 0 0;
  }


  .user-button {
    width: 100%;
    height: 46px;

    justify-content: flex-start;

    padding-left: 14px;
  }


  .profile-dropdown {
    position: relative;

    top: auto;
    right: auto;

    width: 100%;

    margin-top: 8px;
  }
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 900px) {

  .container {
    padding:
      0 25px;
  }
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {

  .container {
    padding:
      0 17px;
  }


  .header {
    padding:
      14px 0;
  }


  .header.scrolled {
    padding:
      10px 0;
  }


  .logo {
    font-size: 15px;

    gap: 6px;

    letter-spacing: 1.2px;
  }


  .logo-img {
    height: 28px;
  }


  .mobile-toggle {
    width: 36px;
    height: 36px;
  }


  .nav-menu > ul {
    width: min(360px, 92vw);

    padding:
      95px 22px 30px;
  }
}


/* =========================================================
   MOBILE PEQUEÑO
========================================================= */

@media (max-width: 380px) {

  .container {
    padding:
      0 13px;
  }


  .logo {
    font-size: 14px;
  }


  .logo-img {
    height: 26px;
  }


  .nav-menu > ul {
    padding-left: 18px;
    padding-right: 18px;
  }
}

</style>