<template>
  <Teleport to="body">
    <div class="evolution-overlay" @click.self="$emit('close')">
      <section
        class="evolution-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evolution-title"
        aria-describedby="evolution-description"
      >
        <button
          ref="closeButton"
          class="evolution-close"
          type="button"
          aria-label="Cerrar evolución de máquinas"
          @click="$emit('close')"
        >
          ×
        </button>

        <header class="evolution-header">
          <span class="evolution-eyebrow">BETA GRÁFICA / NUESTRA HISTORIA</span>
          <h2 id="evolution-title">Evolución de nuestras máquinas</h2>
          <p id="evolution-description">
            Un recorrido por el crecimiento de nuestro equipamiento y nuestra capacidad de producción.
          </p>
        </header>

        <div class="evolution-timeline">
          <article
            v-for="(milestone, index) in milestones"
            :key="milestone.year"
            class="evolution-card"
          >
            <div class="evolution-image">
              <img :src="milestone.image" :alt="milestone.imageAlt" />
              <span class="evolution-index">{{ String(index + 1).padStart(2, '0') }}</span>
            </div>

            <div class="evolution-copy">
              <span class="evolution-year">{{ milestone.year }}</span>
              <h3>{{ milestone.title }}</h3>
              <p>{{ milestone.description }}</p>
            </div>
          </article>
        </div>

      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits(['close'])

const closeButton = ref(null)
const previousOverflow = document.body.style.overflow

const milestones = [
  {
    year: '2001',
    title: 'Los primeros pasos',
    description:
      'Comenzamos con un plotter de corte Roland y dos computadoras, poniendo en marcha nuestros primeros proyectos.',
    image: '/imagenes/equipoV.jpg',
    imageAlt: 'Imagen provisoria del equipamiento inicial'
  },
  {
    year: '2009',
    title: 'Más espacio para crecer',
    description:
      'La incorporación de un nuevo espacio productivo permitió ampliar la capacidad de trabajo y sumar nuevos desafíos.',
    image: '/imagenes/galeria equip2.jpeg',
    imageAlt: 'Imagen provisoria de máquinas de producción'
  },
  {
    year: '2023',
    title: 'Una planta más grande',
    description:
      'La planta del parque industrial acompañó el crecimiento de Beta y abrió una nueva etapa de producción.',
    image: '/imagenes/impresiones.jpg',
    imageAlt: 'Imagen provisoria de la planta de producción'
  },
  {
    year: 'HOY',
    title: 'Seguimos evolucionando',
    description:
      'Tecnología, experiencia y nuevas soluciones gráficas se combinan para responder a proyectos cada vez más grandes.',
    image: '/imagenes/vinilos.jpeg',
    imageAlt: 'Imagen provisoria de trabajos gráficos actuales'
  }
]

onMounted(() => {
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', handleKeydown)
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  document.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(event) {
  if (event.key === 'Escape') {
    emit('close')
  }
}
</script>

<style scoped>
.evolution-overlay {
  position: fixed;
  z-index: 2300;
  inset: 0;
  overflow-y: auto;
  padding: 0;
  background: rgba(5, 7, 9, 0.88);
  backdrop-filter: blur(12px);
}

.evolution-dialog {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(84px, 11vh, 120px) clamp(24px, 7vw, 108px) 56px;
  color: #f1f3f4;
  background:
    radial-gradient(circle at 90% 0, rgba(0, 174, 239, 0.14), transparent 30%),
    #101214;
}

.evolution-close {
  position: fixed;
  z-index: 2301;
  display: grid;
  place-items: center;
  top: 24px;
  right: 28px;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: inherit;
  background: transparent;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}

.evolution-close:hover {
  border-color: #00aeef;
  color: #00aeef;
}

.evolution-header {
  max-width: 680px;
  margin-bottom: 42px;
}

.evolution-eyebrow,
.evolution-year,
.evolution-footer > span {
  color: #00aeef;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.evolution-header h2 {
  margin: 14px 0;
  font-size: clamp(32px, 5vw, 58px);
  line-height: 1.02;
  text-transform: uppercase;
}

.evolution-header p,
.evolution-copy p {
  color: #a7adb3;
  font-size: 14px;
  line-height: 1.7;
}

.evolution-timeline {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.evolution-card {
  display: grid;
  grid-template-columns: minmax(130px, 0.9fr) 1.1fr;
  min-height: 210px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.025);
}

.evolution-image {
  position: relative;
  min-height: 210px;
  overflow: hidden;
  background: #202428;
}

.evolution-image::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.3), transparent 65%);
  content: '';
}

.evolution-image img {
  width: 100%;
  height: 100%;
  min-height: 210px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.evolution-card:hover .evolution-image img {
  transform: scale(1.05);
}

.evolution-index {
  position: absolute;
  z-index: 1;
  bottom: 14px;
  left: 16px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
}

.evolution-copy {
  align-self: center;
  padding: 22px;
}

.evolution-copy h3 {
  margin: 10px 0 8px;
  font-size: 19px;
  text-transform: uppercase;
}

.evolution-copy p {
  margin: 0;
  font-size: 13px;
}

@media (max-width: 760px) {
  .evolution-dialog {
    padding: 88px 20px 36px;
  }

  .evolution-close {
    top: 18px;
    right: 18px;
  }

  .evolution-timeline {
    grid-template-columns: 1fr;
  }

  .evolution-card {
    grid-template-columns: 0.8fr 1.2fr;
  }
}

@media (min-width: 1100px) {
  .evolution-header {
    margin-bottom: 28px;
  }

  .evolution-timeline {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .evolution-card {
    grid-template-columns: 1fr;
    align-content: start;
  }

  .evolution-image,
  .evolution-image img {
    height: clamp(150px, 22vh, 220px);
    min-height: 0;
  }

  .evolution-copy {
    padding: 18px;
  }

  .evolution-copy h3 {
    font-size: 17px;
  }
}

@media (max-width: 460px) {
  .evolution-card {
    grid-template-columns: 1fr;
  }

  .evolution-image,
  .evolution-image img {
    height: 190px;
    min-height: 190px;
  }

}
</style>
