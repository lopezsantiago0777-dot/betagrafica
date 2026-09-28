<template>
  <div class="auth-container">

    <div v-if="isRegistering && !isLoggedIn" class="auth-card">
      <div class="auth-header">
        <h2>Crear cuenta</h2>
        <p class="subtitle">Comienza a gestionar tus ventas hoy mismo</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <input v-model="regNombre" type="text" placeholder="Nombre de usuario" maxlength="150" required />
        </div>

        <div class="input-group">
          <input v-model="regEmail" type="email" placeholder="Correo electrónico" required />
        </div>

        <div class="input-group password-wrapper">
          <input
            v-model="regPassword"
            :type="showRegPassword ? 'text' : 'password'"
            placeholder="Contraseña"
            minlength="6"
            required
          />
          <span class="eye-icon" @click="showRegPassword = !showRegPassword">
            {{ showRegPassword ? '🙈' : '👁️' }}
          </span>
        </div>

        <div v-if="regPassword" class="strength-meter">
          <div class="strength-bar-bg">
            <div class="strength-bar-fill" :class="passwordStrength.colorClass"></div>
          </div>
          <span class="strength-text" :class="passwordStrength.colorClass">
            Contraseña {{ passwordStrength.text }}
          </span>
        </div>

        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>

        <transition name="fade">
          <p v-if="errorMessage && !verificationPending" class="error-message">
            <span>⚠️</span> {{ errorMessage }}
          </p>
        </transition>

        <transition name="fade">
          <div v-if="verificationPending" class="verification-box">
            <p>
              <strong>{{ errorMessage || 'Cuenta creada correctamente.' }}</strong>
            </p>
            <p>
              Revisa <strong>{{ regEmail }}</strong> y verifica tu correo antes de iniciar sesión.
            </p>
            <button type="button" class="btn btn-small" @click="resetErrorAndSwitch(false)">
              Ya verifiqué mi cuenta
            </button>
          </div>
        </transition>
      </form>

      <p class="switch" @click="resetErrorAndSwitch(false)">
        ¿Ya tienes cuenta? <span class="highlight">Inicia sesión</span>
      </p>
    </div>

    <!-- LOGIN -->
    <div v-else-if="!isLoggedIn && recoveryStep === 0" class="auth-card">
      <div class="auth-header">
        <h2>¡Bienvenido!</h2>
        <p class="subtitle">Ingresa tus credenciales para acceder</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <input v-model="email" type="email" placeholder="Correo electrónico" required />
        </div>

        <div class="input-group password-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Contraseña"
            required
          />
          <span class="eye-icon" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </span>
        </div>

        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>

        <button type="button" class="forgot-link" @click="openRecovery">
          ¿Olvidaste tu contraseña?
        </button>

        <transition name="fade">
          <p v-if="errorMessage" class="error-message">
            <span>⚠️</span> {{ errorMessage }}
          </p>
        </transition>
      </form>

      <p class="switch" @click="resetErrorAndSwitch(true)">
        ¿No tienes cuenta? <span class="highlight">Regístrate aquí</span>
      </p>
    </div>


    <div v-else-if="!isLoggedIn && recoveryStep === 1" class="auth-card">
      <div class="auth-header">
        <h2>Recuperar contraseña</h2>
        <p class="subtitle">Te enviaremos un código de 6 dígitos a tu correo.</p>
      </div>

      <form @submit.prevent="requestRecoveryCode" class="auth-form">
        <div class="input-group">
          <input v-model="recoveryEmail" type="email" placeholder="Correo registrado" required />
        </div>

        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar código' }}
        </button>

        <p v-if="errorMessage" class="error-message">
          <span>⚠️</span> {{ errorMessage }}
        </p>
      </form>

      <p class="switch" @click="cancelRecovery">Volver a iniciar sesión</p>
    </div>

    <div v-else-if="!isLoggedIn && recoveryStep === 2" class="auth-card">
      <div class="auth-header">
        <h2>Ingresá el código</h2>
        <p class="subtitle">Revisa tu correo. El código vence en 10 minutos.</p>
      </div>

      <form @submit.prevent="verifyRecoveryCode" class="auth-form">
        <div class="input-group">
          <input
            v-model="recoveryCode"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="Código de 6 dígitos"
            autocomplete="one-time-code"
            required
          />
        </div>

        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? 'Verificando...' : 'Verificar código' }}
        </button>

        <button type="button" class="forgot-link" @click="requestRecoveryCode" :disabled="loading">
          Reenviar código
        </button>

        <p v-if="errorMessage" class="error-message">
          <span>⚠️</span> {{ errorMessage }}
        </p>
      </form>

      <p class="switch" @click="cancelRecovery">Cancelar</p>
    </div>


    <div v-else-if="!isLoggedIn && recoveryStep === 3" class="auth-card">
      <div class="auth-header">
        <h2>Nueva contraseña</h2>
        <p class="subtitle">Elegí una nueva contraseña para tu cuenta.</p>
      </div>

      <form @submit.prevent="resetPassword" class="auth-form">
        <div class="input-group password-wrapper">
          <input
            v-model="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            placeholder="Nueva contraseña"
            minlength="6"
            required
          />
          <span class="eye-icon" @click="showNewPassword = !showNewPassword">
            {{ showNewPassword ? '🙈' : '👁️' }}
          </span>
        </div>

        <div class="input-group password-wrapper">
          <input
            v-model="newPasswordConfirm"
            :type="showNewPasswordConfirm ? 'text' : 'password'"
            placeholder="Repetir nueva contraseña"
            minlength="6"
            required
          />
          <span class="eye-icon" @click="showNewPasswordConfirm = !showNewPasswordConfirm">
            {{ showNewPasswordConfirm ? '🙈' : '👁️' }}
          </span>
        </div>

        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Cambiar contraseña' }}
        </button>

        <p v-if="errorMessage" class="error-message">
          <span>⚠️</span> {{ errorMessage }}
        </p>
      </form>
    </div>

    <div v-else class="logged-user-area">
      <button
        class="user-icon-button"
        @click="profileMenuOpen = !profileMenuOpen"
        aria-label="Abrir menú de usuario"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.6-9 6v2h18v-2c0-3.4-4-6-9-6Z" />
        </svg>
      </button>

      <transition name="menu">
        <div v-if="profileMenuOpen" class="profile-menu">
          <div class="profile-menu-header">
            <div class="mini-avatar">
              {{ (usuario.nombre || 'U').charAt(0).toUpperCase() }}
            </div>

            <div>
              <strong>{{ usuario.nombre }}</strong>
              <small>{{ usuario.email }}</small>
            </div>
          </div>

          <button @click="goToDashboard" class="profile-action">
            📊 Panel de ventas
          </button>

          <button @click="handleLogout" class="profile-action logout-action">
            ↪ Cerrar sesión
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

const isRegistering = ref(false)
const isLoggedIn = ref(false)
const loading = ref(false)
const profileMenuOpen = ref(false)

const showPassword = ref(false)
const showRegPassword = ref(false)
const showNewPassword = ref(false)
const showNewPasswordConfirm = ref(false)

const email = ref('')
const password = ref('')

const regNombre = ref('')
const regEmail = ref('')
const regPassword = ref('')

const errorMessage = ref('')
const verificationPending = ref(false)
const usuario = ref({})


const recoveryStep = ref(0)
const recoveryEmail = ref('')
const recoveryCode = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const passwordStrength = computed(() => {
  const pass = regPassword.value

  if (!pass) {
    return {
      score: 0,
      text: '',
      colorClass: ''
    }
  }

  let score = 0

  if (pass.length >= 6) score++
  if (pass.length >= 10) score++
  if (/[A-Z]/.test(pass)) score++
  if (/[0-9]/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++

  if (score <= 2) {
    return {
      score: 1,
      text: 'No segura',
      colorClass: 'weak'
    }
  }

  if (score <= 4) {
    return {
      score: 2,
      text: 'Aceptable',
      colorClass: 'medium'
    }
  }

  return {
    score: 3,
    text: 'Muy segura',
    colorClass: 'strong'
  }
})

onMounted(() => {
  const sesion = localStorage.getItem('sesion_usuario')
  const token = localStorage.getItem('token')

  if (sesion && token) {
    try {
      usuario.value = JSON.parse(sesion)
      isLoggedIn.value = true
    } catch {
      handleLogout()
    }
  }
})

const resetErrorAndSwitch = (targetState) => {
  errorMessage.value = ''
  verificationPending.value = false
  isRegistering.value = targetState
  recoveryStep.value = 0
  profileMenuOpen.value = false

  showPassword.value = false
  showRegPassword.value = false
  showNewPassword.value = false
  showNewPasswordConfirm.value = false
}

const handleRegister = async () => {
  loading.value = true
  errorMessage.value = ''
  verificationPending.value = false

  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: regNombre.value.trim(),
        email: regEmail.value.trim().toLowerCase(),
        password: regPassword.value
      })
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      errorMessage.value = data.error || 'Error al registrarse'
      // El backend ya valida el nombre de usuario sin distinguir mayúsculas/minúsculas.
      if (res.status === 400 && /nombre de usuario ya está en uso/i.test(data.error || '')) {
        errorMessage.value = 'Este nombre de usuario ya esta en uso'
      }
      return
    }

    verificationPending.value = true
    errorMessage.value =
      data.message || 'Registro creado. Revisa tu correo para verificar la cuenta.'
  } catch {
    errorMessage.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value.trim().toLowerCase(),
        password: password.value
      })
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      errorMessage.value = data.error || 'Error al iniciar sesión'
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('sesion_usuario', JSON.stringify(data.user))
    window.dispatchEvent(new Event('auth-changed'))

    usuario.value = data.user
    isLoggedIn.value = true
    profileMenuOpen.value = false

    goToDashboard()
  } catch {
    errorMessage.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}

const openRecovery = () => {
  errorMessage.value = ''
  recoveryEmail.value = email.value.trim().toLowerCase()
  recoveryCode.value = ''
  newPassword.value = ''
  newPasswordConfirm.value = ''
  recoveryStep.value = 1
}

const cancelRecovery = () => {
  recoveryStep.value = 0
  errorMessage.value = ''
  recoveryCode.value = ''
  newPassword.value = ''
  newPasswordConfirm.value = ''
}

const requestRecoveryCode = async () => {
  if (!recoveryEmail.value.trim()) {
    errorMessage.value = 'Ingresá tu correo electrónico.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch(`${API}/olvide-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: recoveryEmail.value.trim().toLowerCase()
      })
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      errorMessage.value = data.error || 'No se pudo enviar el código.'
      return
    }

    recoveryStep.value = 2
    errorMessage.value = ''
  } catch {
    errorMessage.value = 'Error de conexión con el servidor.'
  } finally {
    loading.value = false
  }
}

const verifyRecoveryCode = async () => {
  if (!recoveryCode.value.trim()) {
    errorMessage.value = 'Ingresá el código que recibiste.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch(`${API}/verificar-codigo-recuperacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: recoveryEmail.value.trim().toLowerCase(),
        codigo: recoveryCode.value.trim()
      })
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      errorMessage.value = data.error || 'Código incorrecto o vencido.'
      return
    }

    recoveryStep.value = 3
  } catch {
    errorMessage.value = 'Error de conexión con el servidor.'
  } finally {
    loading.value = false
  }
}

const resetPassword = async () => {
  errorMessage.value = ''

  if (newPassword.value.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  if (newPassword.value !== newPasswordConfirm.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  loading.value = true

  try {
    const res = await fetch(`${API}/restablecer-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: recoveryEmail.value.trim().toLowerCase(),
        codigo: recoveryCode.value.trim(),
        password: newPassword.value
      })
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      errorMessage.value = data.error || 'No se pudo cambiar la contraseña.'
      return
    }

    recoveryStep.value = 0
    email.value = recoveryEmail.value
    password.value = ''

    recoveryEmail.value = ''
    recoveryCode.value = ''
    newPassword.value = ''
    newPasswordConfirm.value = ''

    alert('Contraseña cambiada correctamente. Ahora podés iniciar sesión.')
  } catch {
    errorMessage.value = 'Error de conexión con el servidor.'
  } finally {
    loading.value = false
  }
}

const goToDashboard = () => {
  profileMenuOpen.value = false
  router.push('/ventas')
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('sesion_usuario')
  window.dispatchEvent(new Event('auth-changed'))

  usuario.value = {}
  isLoggedIn.value = false
  profileMenuOpen.value = false

  email.value = ''
  password.value = ''

  resetErrorAndSwitch(false)
}
</script>

<style scoped>

/* =========================================================
   SISTEMA VISUAL
   BLACK / WHITE / GRAY — FUTURISTIC GLASS
   ========================================================= */

.auth-container {
  --white: #ffffff;
  --white-soft: #eeeeee;

  --gray-1: #cccccc;
  --gray-2: #999999;
  --gray-3: #666666;
  --gray-4: #333333;

  --black-1: #000000;
  --black-2: #050505;
  --black-3: #0b0b0b;
  --black-4: #111111;

  --glass: rgba(255, 255, 255, 0.055);
  --glass-strong: rgba(255, 255, 255, 0.09);

  --border: rgba(255, 255, 255, 0.13);

  min-height: 100vh;
  width: 100%;

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  padding: 30px;

  font-family:
    Inter,
    "SF Pro Display",
    "Segoe UI",
    system-ui,
    sans-serif;

  color: var(--white);

  background:
    radial-gradient(
      circle at 50% 45%,
      rgba(255,255,255,0.055),
      transparent 25%
    ),
    radial-gradient(
      circle at 10% 90%,
      rgba(255,255,255,0.04),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 10%,
      rgba(255,255,255,0.035),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #000000 0%,
      #070707 35%,
      #0d0d0d 70%,
      #030303 100%
    );

  box-sizing: border-box;
}


/* =========================================================
   GRID TECNOLÓGICO
   ========================================================= */

.auth-container::before {
  content: "";

  position: absolute;

  inset: 0;

  pointer-events: none;

  opacity: 0.16;

  background-image:
    linear-gradient(
      rgba(255,255,255,0.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,0.035) 1px,
      transparent 1px
    );

  background-size:
    45px 45px;

  mask-image:
    radial-gradient(
      ellipse at center,
      black 0%,
      transparent 75%
    );

  -webkit-mask-image:
    radial-gradient(
      ellipse at center,
      black 0%,
      transparent 75%
    );
}


/* =========================================================
   AMBIENTE / ORBES
   ========================================================= */

.auth-container::after {
  content: "";

  position: absolute;

  width: 650px;
  height: 650px;

  border-radius: 50%;

  left: 50%;
  top: 50%;

  transform: translate(-50%, -50%);

  border:
    1px solid rgba(255,255,255,0.035);

  box-shadow:
    0 0 0 80px rgba(255,255,255,0.012),
    0 0 0 160px rgba(255,255,255,0.008);

  pointer-events: none;

  animation:
    rotateOrb 30s linear infinite;
}


/* =========================================================
   BOX SIZING
   ========================================================= */

.auth-container *,
.auth-container *::before,
.auth-container *::after {
  box-sizing: border-box;
}


/* =========================================================
   DECORACIÓN EXTRA DEL FONDO
   ========================================================= */

/*
   Estas sombras crean pequeños puntos luminosos
   sin necesidad de imágenes.
*/

.auth-container {
  box-shadow:
    inset 0 0 180px rgba(0,0,0,0.75);

  isolation: isolate;
}


/* =========================================================
   TARJETA
   ========================================================= */

.auth-card {
  width: 100%;
  max-width: 410px;

  position: relative;
  z-index: 10;

  padding: 38px 38px 30px;

  border-radius: 22px;

  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,0.105),
      rgba(255,255,255,0.035) 50%,
      rgba(255,255,255,0.02)
    );

  border:
    1px solid rgba(255,255,255,0.15);

  backdrop-filter: blur(30px) saturate(120%);
  -webkit-backdrop-filter: blur(30px) saturate(120%);

  box-shadow:
    0 50px 100px rgba(0,0,0,0.75),
    0 15px 40px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.12),
    inset 0 -1px 0 rgba(255,255,255,0.035);

  overflow: hidden;

  animation:
    cardEntrance
    0.8s
    cubic-bezier(0.16,1,0.3,1)
    both;
}


/* =========================================================
   BORDE LUMINOSO
   ========================================================= */

.auth-card::before {
  content: "";

  position: absolute;

  width: 180px;
  height: 180px;

  top: -100px;
  left: 50%;

  transform: translateX(-50%);

  background:
    radial-gradient(
      circle,
      rgba(255,255,255,0.16),
      transparent 65%
    );

  filter: blur(10px);

  pointer-events: none;

  animation:
    cardGlow 5s ease-in-out infinite;
}


/* =========================================================
   SEGUNDO EFECTO DECORATIVO
   ========================================================= */

.auth-card::after {
  content: "";

  position: absolute;

  inset: 1px;

  border-radius: 21px;

  pointer-events: none;

  background:
    linear-gradient(
      120deg,
      transparent 30%,
      rgba(255,255,255,0.055),
      transparent 70%
    );

  background-size: 250% 100%;

  animation:
    glassSweep
    8s
    ease-in-out
    infinite;

  opacity: 0.45;
}


/* =========================================================
   HEADER
   ========================================================= */

.auth-header {
  position: relative;
  z-index: 2;

  margin-bottom: 28px;
}


/*
   Línea decorativa superior
*/

.auth-header::before {
  content: "●  SECURE ACCESS";

  display: block;

  margin-bottom: 18px;

  color: #777777;

  font-size: 8px;

  font-weight: 700;

  letter-spacing: 2.5px;

  text-transform: uppercase;
}


/* =========================================================
   TÍTULO
   ========================================================= */

.auth-header h2 {
  margin: 0;

  font-size: 28px;

  line-height: 1.1;

  font-weight: 750;

  letter-spacing: -1px;

  color: #ffffff;

  text-shadow:
    0 0 25px rgba(255,255,255,0.12);
}


/* =========================================================
   SUBTÍTULO
   ========================================================= */

.subtitle {
  margin: 9px 0 0;

  max-width: 290px;

  color: #8c8c8c;

  font-size: 12px;

  line-height: 1.55;
}


/* =========================================================
   FORM
   ========================================================= */

.auth-form {
  position: relative;
  z-index: 2;

  display: flex;

  flex-direction: column;

  gap: 14px;
}


/* =========================================================
   INPUT CONTAINER
   ========================================================= */

.input-group {
  position: relative;

  width: 100%;
}


/*
   Pequeño indicador lateral
*/

.input-group::before {
  content: "";

  position: absolute;

  left: 0;
  top: 50%;

  width: 2px;
  height: 0;

  transform: translateY(-50%);

  border-radius: 10px;

  background: #ffffff;

  z-index: 3;

  transition:
    height 0.25s ease;
}


.input-group:focus-within::before {
  height: 45%;
}


/* =========================================================
   INPUT
   ========================================================= */

.input-group input {
  width: 100%;

  height: 46px;

  padding:
    0
    14px;

  border-radius: 8px;

  border:
    1px solid rgba(255,255,255,0.13);

  background:
    rgba(255,255,255,0.075);

  color: #ffffff;

  outline: none;

  font-family: inherit;

  font-size: 12px;

  transition:
    background 0.25s ease,
    border 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}


.input-group input::placeholder {
  color: #777777;

  transition:
    color 0.2s ease;
}


.input-group input:hover {
  background:
    rgba(255,255,255,0.095);

  border-color:
    rgba(255,255,255,0.2);
}


.input-group input:focus {
  background:
    rgba(255,255,255,0.11);

  border-color:
    rgba(255,255,255,0.42);

  box-shadow:
    0 0 0 3px rgba(255,255,255,0.035),
    0 8px 25px rgba(0,0,0,0.25);

  transform:
    translateY(-1px);
}


.input-group input:focus::placeholder {
  color: #aaaaaa;
}


/* =========================================================
   PASSWORD
   ========================================================= */

.password-wrapper input {
  padding-right: 45px;
}


.eye-icon {
  position: absolute;

  right: 14px;
  top: 50%;

  transform:
    translateY(-50%);

  cursor: pointer;

  font-size: 14px;

  filter: grayscale(1);

  opacity: 0.45;

  user-select: none;

  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}


.eye-icon:hover {
  opacity: 1;

  transform:
    translateY(-50%)
    scale(1.1);
}


/* =========================================================
   BOTÓN PRINCIPAL
   ========================================================= */

.btn {
  position: relative;

  width: 100%;

  min-height: 45px;

  padding: 12px 15px;

  border: 0;

  border-radius: 8px;

  overflow: hidden;

  cursor: pointer;

  font-family: inherit;

  font-size: 12px;

  font-weight: 700;

  letter-spacing: 0.2px;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}


/*
   Luz que cruza el botón
*/

.btn::before {
  content: "";

  position: absolute;

  top: 0;
  left: -120%;

  width: 80%;
  height: 100%;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.5),
      transparent
    );

  transform: skewX(-20deg);

  transition:
    left 0.6s ease;
}


.btn:hover::before {
  left: 130%;
}


.btn:disabled {
  opacity: 0.4;

  cursor: not-allowed;
}


/* =========================================================
   PRIMARY
   ========================================================= */

.primary {
  background:
    linear-gradient(
      135deg,
      #ffffff,
      #d7d7d7
    );

  color: #050505;

  box-shadow:
    0 10px 30px rgba(0,0,0,0.45),
    inset 0 1px 0 rgba(255,255,255,0.9);
}


.primary:hover:not(:disabled) {
  background:
    linear-gradient(
      135deg,
      #ffffff,
      #eeeeee
    );

  transform:
    translateY(-2px);

  box-shadow:
    0 15px 35px rgba(0,0,0,0.55),
    0 0 30px rgba(255,255,255,0.08);
}


.primary:active:not(:disabled) {
  transform:
    translateY(0);
}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

.forgot-link {
  position: relative;

  align-self: center;

  background: transparent;

  border: none;

  color: #777777;

  cursor: pointer;

  font-family: inherit;

  font-size: 10px;

  padding: 3px;

  transition:
    color 0.2s ease;
}


.forgot-link:hover {
  color: #ffffff;

  text-decoration: none;
}


/* Línea animada */

.forgot-link::after {
  content: "";

  position: absolute;

  left: 50%;
  bottom: 0;

  width: 0;
  height: 1px;

  background: #ffffff;

  transform: translateX(-50%);

  transition:
    width 0.25s ease;
}


.forgot-link:hover::after {
  width: 100%;
}


/* =========================================================
   SWITCH LOGIN / REGISTER
   ========================================================= */

.switch {
  position: relative;
  z-index: 2;

  margin:
    22px
    0
    0;

  padding-top: 18px;

  border-top:
    1px solid rgba(255,255,255,0.07);

  font-size: 10px;

  line-height: 1.5;

  text-align: center;

  color: #666666;

  cursor: pointer;

  user-select: none;
}


.switch .highlight {
  color: #ffffff;

  font-weight: 650;

  transition:
    color 0.2s ease;
}


.switch:hover .highlight {
  text-decoration: none;

  color: #cccccc;
}


/* =========================================================
   ERROR
   ========================================================= */

.error-message {
  position: relative;

  display: flex;

  align-items: flex-start;

  gap: 7px;

  padding: 11px 12px;

  margin: 0;

  border-radius: 8px;

  background:
    rgba(255,255,255,0.045);

  border:
    1px solid rgba(255,255,255,0.12);

  color: #cccccc;

  font-size: 10px;

  line-height: 1.45;

  text-align: left;

  overflow: hidden;
}


.error-message::before {
  content: "";

  position: absolute;

  left: 0;
  top: 0;
  bottom: 0;

  width: 2px;

  background: #777777;
}


/* =========================================================
   VERIFICACIÓN
   ========================================================= */

.verification-box {
  padding: 12px 13px;

  border-radius: 8px;

  background:
    rgba(255,255,255,0.045);

  border:
    1px solid rgba(255,255,255,0.12);

  color: #999999;

  font-size: 10px;

  line-height: 1.5;
}


.verification-box strong {
  color: #ffffff;
}


.btn-small {
  width: auto;

  min-height: 32px;

  margin-top: 9px;

  padding:
    7px
    12px;

  font-size: 10px;
}


/* =========================================================
   PASSWORD STRENGTH
   ========================================================= */

.strength-meter {
  margin-top: -4px;

  display: flex;

  flex-direction: column;

  gap: 6px;
}


.strength-bar-bg {
  width: 100%;

  height: 3px;

  overflow: hidden;

  border-radius: 10px;

  background:
    rgba(255,255,255,0.08);
}


.strength-bar-fill {
  height: 100%;

  border-radius: inherit;

  transition:
    width 0.4s ease,
    background 0.3s ease;
}


.strength-bar-fill.weak {
  width: 33%;

  background: #555555;
}


.strength-bar-fill.medium {
  width: 66%;

  background: #999999;
}


.strength-bar-fill.strong {
  width: 100%;

  background: #ffffff;

  box-shadow:
    0 0 10px rgba(255,255,255,0.4);
}


.strength-text {
  font-size: 9px;

  font-weight: 600;

  text-align: right;
}


.strength-text.weak {
  color: #666666;
}


.strength-text.medium {
  color: #999999;
}


.strength-text.strong {
  color: #ffffff;
}


/* =========================================================
   USER MENU
   ========================================================= */

.logged-user-area {
  position: fixed;

  top: 22px;
  right: 25px;

  z-index: 1000;
}


.user-icon-button {
  width: 44px;
  height: 44px;

  padding: 0;

  border-radius: 50%;

  border:
    1px solid rgba(255,255,255,0.15);

  background:
    rgba(15,15,15,0.72);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  color: #ffffff;

  cursor: pointer;

  display: flex;

  align-items: center;
  justify-content: center;

  box-shadow:
    0 15px 35px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.08);

  transition:
    transform 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}


.user-icon-button:hover {
  transform:
    translateY(-2px)
    scale(1.04);

  background:
    rgba(255,255,255,0.10);

  box-shadow:
    0 20px 40px rgba(0,0,0,0.6),
    0 0 25px rgba(255,255,255,0.05);
}


.user-icon-button svg {
  width: 20px;
  height: 20px;

  fill: currentColor;
}


/* =========================================================
   PROFILE MENU
   ========================================================= */

.profile-menu {
  position: absolute;

  top: 55px;
  right: 0;

  width: 255px;

  padding: 10px;

  border-radius: 14px;

  background:
    rgba(10,10,10,0.94);

  border:
    1px solid rgba(255,255,255,0.13);

  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);

  box-shadow:
    0 30px 70px rgba(0,0,0,0.7),
    inset 0 1px 0 rgba(255,255,255,0.07);
}


.profile-menu-header {
  display: flex;

  align-items: center;

  gap: 10px;

  padding:
    9px
    8px
    14px;

  border-bottom:
    1px solid rgba(255,255,255,0.07);

  margin-bottom: 7px;
}


.profile-menu-header strong,
.profile-menu-header small {
  display: block;
}


.profile-menu-header strong {
  color: #ffffff;

  font-size: 12px;
}


.profile-menu-header small {
  color: #777777;

  font-size: 9px;

  margin-top: 4px;

  max-width: 170px;

  overflow: hidden;

  text-overflow: ellipsis;
}


.mini-avatar {
  width: 36px;
  height: 36px;

  flex: 0 0 36px;

  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      #ffffff,
      #999999
    );

  color: #000000;

  display: flex;

  align-items: center;
  justify-content: center;

  font-weight: 800;

  font-size: 12px;

  box-shadow:
    0 0 20px rgba(255,255,255,0.08);
}


/* =========================================================
   PROFILE BUTTONS
   ========================================================= */

.profile-action {
  width: 100%;

  border: none;

  background: transparent;

  color: #999999;

  text-align: left;

  padding: 10px 9px;

  border-radius: 7px;

  cursor: pointer;

  font-family: inherit;

  font-size: 10px;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}


.profile-action:hover {
  background:
    rgba(255,255,255,0.07);

  color: #ffffff;

  transform:
    translateX(2px);
}


.logout-action {
  color: #888888;
}


/* =========================================================
   MENÚ ANIMADO
   ========================================================= */

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}


.menu-enter-from,
.menu-leave-to {
  opacity: 0;

  transform:
    translateY(-10px)
    scale(0.97);
}


/* =========================================================
   FADE
   ========================================================= */

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}


.fade-enter-from,
.fade-leave-to {
  opacity: 0;

  transform:
    translateY(-4px);
}


/* =========================================================
   ANIMACIONES
   ========================================================= */

@keyframes cardEntrance {

  from {
    opacity: 0;

    transform:
      translateY(25px)
      scale(0.94);

    filter: blur(5px);
  }

  to {
    opacity: 1;

    transform:
      translateY(0)
      scale(1);

    filter: blur(0);
  }

}


@keyframes cardGlow {

  0%,
  100% {
    opacity: 0.45;

    transform:
      translateX(-50%)
      scale(0.8);
  }

  50% {
    opacity: 0.8;

    transform:
      translateX(-50%)
      scale(1.2);
  }

}


@keyframes glassSweep {

  0% {
    background-position:
      250% 0;
  }

  45%,
  100% {
    background-position:
      -150% 0;
  }

}


@keyframes rotateOrb {

  from {
    transform:
      translate(-50%, -50%)
      rotate(0deg);
  }

  to {
    transform:
      translate(-50%, -50%)
      rotate(360deg);
  }

}


/* =========================================================
   EFECTO DE RESPIRACIÓN
   ========================================================= */

.auth-card {
  animation:
    cardEntrance 0.8s cubic-bezier(0.16,1,0.3,1) both,
    cardFloat 7s ease-in-out 1s infinite;
}


@keyframes cardFloat {

  0%,
  100% {
    transform:
      translateY(0);
  }

  50% {
    transform:
      translateY(-5px);
  }

}


/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 600px) {

  .auth-container {
    padding: 18px;
  }


  .auth-card {
    max-width: 100%;

    padding:
      30px
      24px
      25px;

    border-radius: 18px;
  }


  .auth-header h2 {
    font-size: 24px;
  }


  .auth-container::after {
    width: 450px;
    height: 450px;
  }


  .logged-user-area {
    top: 15px;
    right: 15px;
  }


  .profile-menu {
    width:
      calc(100vw - 30px);
  }

}


@media (prefers-reduced-motion: reduce) {

  .auth-card,
  .auth-container::after,
  .auth-card::before,
  .auth-card::after {
    animation: none;
  }

}
</style>
