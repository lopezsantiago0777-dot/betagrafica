<template>
  <div class="services-view-container">
    
    <div class="services-page">
      <section class="about" id="about">
        <div class="container">
          <h2 class="heading"><span>Nuestros</span> Servicios...</h2>

          <div class="row fade-in">
            <div class="content">
              <p>Hoy nos encargamos de la identificación gráfica de vehículos de sanidad y seguridad de todo el país. Desde patrulleros hasta ambulancias, trabajamos con provincias como Córdoba, Salta, Jujuy, Santa Fe, Buenos Aires, Mendoza y más, incluyendo fuerzas como Policía Federal y Gendarmería Nacional.</p>
              <p>Una licitación para 700 vehículos de la Provincia de Córdoba marcó un antes y un después en nuestra historia. Con una estructura mínima, asumimos el desafío, y eso nos motivó a ir por más.</p>
              <p>En 2003 participamos en proyectos clave como los del Ministerio de Salud de la Nación. Desde entonces, nuestros trabajos parten de San Francisco y recorren todo el país y Latinoamérica.</p>
              <p><em>“Gracias a nuestra experiencia, optimizamos el tiempo de trabajo: contamos con una línea de montaje especial y un promedio de ploteado de 20 minutos por unidad, logrando hasta 36 vehículos diarios.”</em></p>
            </div>
            
            <div class="image image-right">
              <img src="/imagenes/ploteado.vehicular.jpg" alt="Producto Destacado" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <SiteFooter />
    <a 
      href="https://wa.me/5493564652137"
      target="_blank" 
      class="whatsapp-floating-btn" 
      aria-label="Contactar por WhatsApp"
    >
      <div class="pulse-ring"></div>
      <svg viewBox="0 0 24 24" class="whatsapp-icon">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.292 1.493 4.741 1.494 5.428 0 9.847-4.41 9.849-9.836.001-2.628-1.02-5.1-2.877-6.96C16.444 1.98 13.974 1.57 12.008 1.57c-5.43 0-9.85 4.41-9.852 9.837-.001 1.812.487 3.591 1.411 5.17l-.953 3.478 3.533-.925zM17.467 14.3c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      </svg>
    </a>

  </div>
</template>

<style scoped>

.services-view-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: url('/imagenes/fondoservicios.jpg'); 
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-color: #0d0d0d; 
}

.social-icons {
  display: flex;
  gap: 14px;
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgb(0, 0, 0);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  transition: all 0.4s var(--transition-smooth);
}

.svg-icon {
  width: 16px;
  height: 16px;
  fill: currentColor; 
  transition: fill 0.4s var(--transition-smooth);
}

.social-icons a:hover {
  color: var(--bg-primary);
  background-color: var(--accent);
  border-color: var(--accent);
  transform: translate3d(0, -4px, 0);
  box-shadow: 0 10px 20px var(--accent-glow);
}

.footer {
  position: relative;
  z-index: 3;
  background-color: var(--bg-surface);
  padding: clamp(65px, 6vw, 95px) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.footer-row {
  display: flex;
  flex-wrap: wrap;
  gap: 40px 60px;
  max-width: 1250px;
  margin: 0 auto;
  padding: 0 30px;
}

.footer-col {
  flex: 1 1 240px;
}

.footer-highlight {
  color: var(--text-main) !important;
  font-weight: 600;
}

.services-page {
  padding-top: 30px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}


.about {
  background-color: rgba(30, 30, 30, 0.75); 
  backdrop-filter: blur(8px);              
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  margin: 40px 0;
  padding: 50px 24px;
  text-align: left;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.heading {
  color: #ffffff; 
  font-size: 36px;
  margin-bottom: 25px;
}

.heading span {
  color: #007d44; 
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.fade-in {
  animation: fadeIn ease 1.2s forwards;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.image-right {
  flex: 1 1 300px;
  max-width: 400px;
  margin-left: 40px;
  margin-top: 30px;
}

.image-right img {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image, .image-right {
  flex: 1;
}

.image img, .image-right img {
  width: 300px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.content {
  flex: 2 1 600px;
  width: 100%;
  max-width: 800px;
  font-size: 19px;
  color: #e0e0e0; 
}

p {
  margin-bottom: 15px;
  line-height: 1.6;
}

.video {
  text-align: center;
  padding: 90px 20px;
}

.video video {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

h3 {
  color: #007d44;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007d44;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s ease-in-out;
}

.btn:hover {
  background-color: #005c2e;
}

.social-icons {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.social-icons a {
  margin: 0 10px;
}

.social-icons img {
  width: 25px;
  height: auto;
}

.product-list {
  columns: 2;
  column-gap: 40px;
  list-style: none;
  padding-left: 0;
}

.product-list li {
  margin-bottom: 10px;
}

@media only screen and (max-width: 768px) {
  .row {
    flex-direction: column;
  }
  .image-right {
    margin-left: 0;
    max-width: 100%;
  }
  .image {
    margin-top: 20px;
    text-align: center;
  }
  .image img {
    max-width: 100%;
    width: auto;
  }
}
</style>