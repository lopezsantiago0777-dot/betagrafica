<template>
  <Header />


  <transition name="toast-slide">
    <div v-if="notification.show" class="custom-toast" :class="notification.type">
      <div class="toast-accent"></div>
      <span class="toast-icon">
        {{ notification.type === 'success' ? '⚡' : '⚠️' }}
      </span>
      <div class="toast-body">
        <p class="toast-title">{{ notification.type === 'success' ? 'Operación Exitosa' : 'Aviso del Sistema' }}</p>
        <p class="toast-message">{{ notification.message }}</p>
      </div>
      <button @click="notification.show = false" class="toast-close-btn">✕</button>
    </div>
  </transition>

  <div class="ventas-container" :class="{ 'cart-is-open': isCartOpen && !isAdmin }">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando panel...</p>
    </div>

    <div v-else-if="isAdmin" class="admin-panel">
      <div class="panel-header">
        <h2>Panel de Administración</h2>
        <p class="subtitle">Monitoreo global de pedidos, compras y alertas por vencimiento</p>
      </div>

      <div class="admin-views-switcher" role="tablist" aria-label="Secciones del admin">
        <button
          type="button"
          class="admin-view-tab"
          :class="{ active: adminTab === 'ventas' }"
          @click="adminTab = 'ventas'"
        >
          Panel de ventas
        </button>
        <button
          type="button"
          class="admin-view-tab"
          :class="{ active: adminTab === 'estadisticas' }"
          @click="adminTab = 'estadisticas'"
        >
          📦 Stock
        </button>
        <button
          type="button"
          class="admin-view-tab"
          :class="{ active: adminTab === 'calendario' }"
          @click="abrirCalendarioAdmin"
        >
          📅 Calendario
        </button>
      </div>

      <transition name="admin-calendar-slide" mode="out-in">
        <section v-if="adminTab === 'calendario'" key="calendario" class="admin-calendar-view admin-section">
          <div class="calendar-header">
            <div>
              <h3>Agenda del administrador</h3>
              <p class="section-desc">Guardá tareas, trabajos, visitas y recordatorios. Las más próximas aparecen primero.</p>
            </div>
            <div class="calendar-header-actions">
              <div class="calendar-view-switch">
                <button type="button" :class="{ active: vistaCalendarioAdmin === 'semana' }" @click="cambiarVistaCalendarioAdmin('semana')">Semana</button>
                <button type="button" :class="{ active: vistaCalendarioAdmin === 'mes' }" @click="cambiarVistaCalendarioAdmin('mes')">Mes</button>
              </div>

              <template v-if="vistaCalendarioAdmin === 'semana'">
                <button type="button" class="calendar-nav-btn" @click="cambiarSemanaAdmin(-1)">‹ Semana anterior</button>
                <button type="button" class="calendar-today-btn" @click="irASemanaActualAdmin">Hoy</button>
                <button type="button" class="calendar-nav-btn" @click="cambiarSemanaAdmin(1)">Semana siguiente ›</button>
              </template>

              <template v-else>
                <button type="button" class="calendar-nav-btn" @click="cambiarMesCalendarioAdmin(-1)">‹ Mes anterior</button>
                <button type="button" class="calendar-today-btn" @click="irAlMesActualAdmin">Hoy</button>
                <button type="button" class="calendar-nav-btn" @click="cambiarMesCalendarioAdmin(1)">Mes siguiente ›</button>
              </template>
            </div>
          </div>

          <div v-if="tareasProximasAdmin.length" class="calendar-upcoming-alert">
            <div class="calendar-upcoming-title">
              <span>⏰</span>
              <strong>Próximas tareas</strong>
            </div>
            <div class="calendar-upcoming-list">
              <div
                v-for="tarea in tareasProximasAdmin.slice(0, 4)"
                :key="`upcoming-${tarea.id}`"
                class="calendar-upcoming-item"
                :class="estadoTareaAdmin(tarea).clase"
              >
                <div>
                  <strong>{{ prioridadTareaAdmin(tarea).icono }} {{ tarea.titulo }}</strong>
                  <small>{{ formatearFechaTareaAdmin(tarea.fecha) }}{{ tarea.hora ? ` · ${tarea.hora}` : '' }}{{ tarea.lugar ? ` · ${tarea.lugar}` : '' }}</small>
                </div>
                <span class="calendar-upcoming-priority" :class="prioridadTareaAdmin(tarea).clase">{{ prioridadTareaAdmin(tarea).texto }}</span>
                <span>{{ estadoTareaAdmin(tarea).texto }}</span>
              </div>
            </div>
          </div>

          <div class="calendar-toolbar">
            <div>
              <strong>{{ vistaCalendarioAdmin === 'semana' ? rangoSemanaAdmin : mesCalendarioAdmin.nombre }}</strong>
              <span>{{ tareasPendientesAdmin.length }} tarea(s) pendiente(s)</span>
            </div>
            <button type="button" class="calendar-add-btn" @click="abrirNuevaTareaAdmin()">
              ＋ Nueva tarea
            </button>
          </div>

          
          <div v-if="vistaCalendarioAdmin === 'mes'" class="calendar-month-view">
            <div class="calendar-month-weekdays">
              <span v-for="dia in ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']" :key="dia">{{ dia }}</span>
            </div>

            <div class="calendar-month-grid">
              <button
                v-for="dia in diasMesCalendarioAdmin"
                :key="`month-${dia.clave}`"
                type="button"
                class="calendar-month-day"
                :class="{
                  'calendar-month-day-outside': !dia.esDelMes,
                  'calendar-month-day-today': dia.esHoy,
                  'calendar-month-day-selected': dia.seleccionado,
                  'calendar-month-day-has-tasks': dia.cantidadTareas > 0,
                  'calendar-month-day-high': dia.tieneAlta
                }"
                @click="seleccionarDiaCalendarioAdmin(dia.clave)"
              >
                <span class="calendar-month-number">{{ dia.numero }}</span>

                <div v-if="dia.cantidadTareas" class="calendar-month-task-summary">
                  <span
                    v-for="tarea in dia.tareas.slice(0, 3)"
                    :key="tarea.id"
                    class="calendar-month-task-dot"
                    :class="prioridadTareaAdmin(tarea).clase"
                  >
                    {{ prioridadTareaAdmin(tarea).icono }} {{ tarea.titulo }}
                  </span>
                  <small v-if="dia.cantidadTareas > 3">+{{ dia.cantidadTareas - 3 }} más</small>
                </div>
                <span v-else class="calendar-month-empty">—</span>
              </button>
            </div>
          </div>

          <div v-else class="calendar-week">

            <article
              v-for="dia in diasSemanaAdmin"
              :key="dia.clave"
              class="calendar-day"
              :class="{ 'calendar-day-today': dia.esHoy }"
            >
              <div class="calendar-day-header">
                <span>{{ dia.nombre }}</span>
                <strong>{{ dia.numero }}</strong>
              </div>

              <div class="calendar-day-tasks">
                <button
                  v-for="tarea in tareasPendientesPorDiaAdmin(dia.clave)"
                  :key="tarea.id"
                  type="button"
                  class="calendar-task-card"
                  :class="estadoTareaAdmin(tarea).clase"
                  @click="abrirEditarTareaAdmin(tarea)"
                >
                  <span class="calendar-task-time">{{ tarea.hora || 'Sin hora' }}</span>
                  <strong>{{ prioridadTareaAdmin(tarea).icono }} {{ tarea.titulo }}</strong>
                  <small v-if="tarea.lugar">📍 {{ tarea.lugar }}</small>
                  <small v-if="tarea.descripcion">{{ tarea.descripcion }}</small>
                  <span class="calendar-task-priority" :class="prioridadTareaAdmin(tarea).clase">{{ prioridadTareaAdmin(tarea).texto }}</span>
                  <span class="calendar-task-status">{{ estadoTareaAdmin(tarea).texto }}</span>
                </button>

                <div v-if="!tareasPendientesPorDiaAdmin(dia.clave).length" class="calendar-empty-day">
                  Sin tareas
                </div>
              </div>

              <button type="button" class="calendar-day-add" @click="abrirNuevaTareaAdmin(dia.clave)">
                ＋ Agregar
              </button>
            </article>
          </div>


          <div v-if="vistaCalendarioAdmin === 'mes'" class="calendar-selected-day-panel">
            <div class="calendar-selected-day-header">
              <div>
                <span>📌 Día seleccionado</span>
                <h4>{{ fechaSeleccionadaCalendarioAdmin }}</h4>
              </div>
              <button type="button" class="calendar-add-btn" @click="abrirNuevaTareaAdmin(diaCalendarioSeleccionado)">
                ＋ Agregar tarea este día
              </button>
            </div>

            <div v-if="tareasDiaCalendarioSeleccionado.length" class="calendar-selected-day-tasks">
              <button
                v-for="tarea in tareasDiaCalendarioSeleccionado"
                :key="`selected-${tarea.id}`"
                type="button"
                class="calendar-task-card"
                :class="[estadoTareaAdmin(tarea).clase, prioridadTareaAdmin(tarea).clase]"
                @click="abrirEditarTareaAdmin(tarea)"
              >
                <span class="calendar-task-time">{{ tarea.hora || 'Sin hora' }}</span>
                <strong>{{ prioridadTareaAdmin(tarea).icono }} {{ tarea.titulo }}</strong>
                <small v-if="tarea.lugar">📍 {{ tarea.lugar }}</small>
                <small v-if="tarea.descripcion">{{ tarea.descripcion }}</small>
                <span class="calendar-task-priority" :class="prioridadTareaAdmin(tarea).clase">{{ prioridadTareaAdmin(tarea).texto }}</span>
                <span class="calendar-task-status">{{ estadoTareaAdmin(tarea).texto }}</span>
              </button>
            </div>
            <div v-else class="calendar-selected-day-empty">
              No hay tareas programadas para este día.
            </div>
          </div>

          <div class="calendar-completed-section">
            <div class="calendar-completed-header">
              <div>
                <h4>Historial de tareas completadas</h4>
                <p>Las tareas completadas desaparecen del calendario activo, pero quedan guardadas y tachadas acá.</p>
              </div>
              <span>{{ tareasCompletadasAdmin.length }} completada(s)</span>
            </div>

            <div v-if="tareasCompletadasAdmin.length" class="calendar-completed-list">
              <div v-for="tarea in tareasCompletadasAdmin" :key="`done-${tarea.id}`" class="calendar-completed-item">
                <div>
                  <strong>{{ prioridadTareaAdmin(tarea).icono }} {{ tarea.titulo }}</strong>
                  <span>{{ formatearFechaTareaAdmin(tarea.fecha) }}{{ tarea.hora ? ` · ${tarea.hora}` : '' }}{{ tarea.lugar ? ` · ${tarea.lugar}` : '' }}</span>
                  <small class="calendar-completed-priority" :class="prioridadTareaAdmin(tarea).clase">{{ prioridadTareaAdmin(tarea).texto }}</small>
                </div>
                <span class="calendar-completed-badge">✓ COMPLETADA</span>
              </div>
            </div>
            <div v-else class="calendar-completed-empty">Todavía no hay tareas completadas.</div>
          </div>

          <div v-if="modalTareaAdmin" class="calendar-task-modal-overlay" @click.self="cerrarModalTareaAdmin">
            <div class="calendar-task-modal">
              <div class="calendar-task-modal-header">
                <div>
                  <h3>{{ tareaAdminEditando ? 'Editar tarea' : 'Nueva tarea' }}</h3>
                  <p>{{ tareaAdminEditando ? 'Modificá los datos y guardá los cambios.' : 'Agregá una actividad a tu agenda.' }}</p>
                </div>
                <button type="button" class="calendar-modal-close" @click="cerrarModalTareaAdmin">✕</button>
              </div>

              <div class="calendar-task-form">
                <label>
                  Título de la tarea
                  <input v-model="formTareaAdmin.titulo" type="text" class="pro-input" placeholder="Ej. Ir a trabajar a San Francisco" />
                </label>

                <div class="calendar-form-grid">
                  <label>
                    Fecha
                    <input v-model="formTareaAdmin.fecha" type="date" class="pro-input" />
                  </label>
                  <label>
                    Hora
                    <input v-model="formTareaAdmin.hora" type="time" class="pro-input" />
                  </label>
                </div>

                <label>
                  Lugar
                  <input v-model="formTareaAdmin.lugar" type="text" class="pro-input" placeholder="Ej. Local de Beta Gráfica" />
                </label>

                <label>
                  Prioridad
                  <select v-model="formTareaAdmin.prioridad" class="pro-input calendar-priority-select">
                    <option value="alta">🔴 Alta — hacerlo cuanto antes</option>
                    <option value="media">🟠 Media — prioridad normal</option>
                    <option value="baja">⚪ Baja — puede esperar</option>
                  </select>
                </label>

                <label>
                  Descripción
                  <textarea v-model="formTareaAdmin.descripcion" class="pro-input calendar-task-textarea" placeholder="Detalles, materiales que tenés que llevar, persona a contactar, etc."></textarea>
                </label>

                <div class="calendar-modal-actions">
                  <button v-if="tareaAdminEditando" type="button" class="calendar-delete-btn" @click="eliminarTareaAdmin">
                    🗑 Eliminar
                  </button>
                  <div class="calendar-modal-actions-right">
                    <button type="button" class="calendar-cancel-btn" @click="cerrarModalTareaAdmin">Cancelar</button>
                    <button type="button" class="calendar-save-btn" @click="guardarTareaAdmin">
                      💾 {{ tareaAdminEditando ? 'Guardar cambios' : 'Guardar tarea' }}
                    </button>
                  </div>
                </div>

                <button
                  v-if="tareaAdminEditando && !tareaAdminEditando.completada"
                  type="button"
                  class="calendar-complete-btn"
                  @click="completarTareaAdmin"
                >
                  ✓ Marcar como completada
                </button>
              </div>
            </div>
          </div>
        </section>

        <template v-else>
          <div v-if="adminTab === 'ventas'" key="ventas"></div>
          <div v-else key="estadisticas"></div>
        </template>
      </transition>

      <section v-if="adminTab === 'ventas'" class="admin-sales-view">
        <div class="alert-vencimiento-container">
          <div class="alert-vencimiento-header">
            <span class="alert-icon">⚠️</span>
            <h3>ALERTA: PEDIDOS PRÓXIMOS A VENCER (MENOS DE 48HS)</h3>
          </div>

          <div class="alert-vencimiento-list">
            <div v-for="p in pedidosPorVencer" :key="p.id" class="alert-vencimiento-card">
              <div class="card-main-info">
                <div class="info-row">
                  <span class="info-label">Cliente:</span>
                  <span class="info-value text-highlight">{{ p.nombre }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Producto:</span>
                  <span class="info-value">{{ p.pedido }}</span>
                </div>
              </div>

              <div class="card-badge-zone">
                <span class="badge-vence-danger">
                  <span class="clock-icon">🕒</span>
                  Entrega: {{ p.fechaEntregaFormateada }}
                  <span class="days-remaining">({{ p.diasRestantes }} días)</span>
                </span>
                <button @click.stop="marcarPedidoCompletado(p)" class="btn-alert-completar">
                  ✓ Completar
                </button>
              </div>
            </div>
          </div>
        </div>

        <section class="admin-section billing-workspace">


        <div class="filtro-clientes-sidebar">
          <div class="sidebar-header">
            <h3>Filtrar por Cliente</h3>
            <button v-if="clienteFiltrado" @click="limpiarFiltroCliente" class="btn-clear-inline" title="Quitar Filtro">
              ✕ Limpiar
            </button>
          </div>

          <div class="search-customer-wrapper" style="padding: 0 15px 10px 15px;">
            <input 
              v-model="filtroBusquedaClientes" 
              type="text" 
              placeholder="🔍 Buscar cliente por nombre de usuario..." 
              class="pro-input" 
              style="font-size: 0.85rem; padding: 8px 12px; width: 100%; box-sizing: border-box;" 
            />
          </div>

          <div class="sidebar-customers-list">
            <div 
              v-for="c in clientesFiltradosYOrdenados" 
              :key="c.id" 
              class="sidebar-customer-item" 
              :class="{ 'active': clienteFiltrado?.id === c.id }"
              @click="filtrarPorCliente(c)"
            >
              <div class="customer-mini-avatar">
                {{ (c.nombre || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="customer-mini-details">
                <span class="name">{{ c.nombre }}</span>
                <span class="email">{{ c.email }}</span>
              </div>
            </div>
            <p v-if="clientesFiltradosYOrdenados.length === 0" class="muted text-center mini-text" style="padding: 10px;">
              No se encontraron clientes.
            </p>
          </div>
        </div>

        <div class="facturas-carousel-zone">
          <div class="section-header-flex" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div>
              <h3>Registros de Compra</h3>
              <p class="section-desc">
                {{ clienteFiltrado
                  ? (mostrarTodosRegistrosCliente
                    ? `Todos los registros de: ${clienteFiltrado.nombre}`
                    : `Compras pendientes de: ${clienteFiltrado.nombre}`)
                  : 'Compras pendientes de completar. Seleccioná un cliente para consultar todo su historial.' }}
              </p>
            </div>

            <div v-if="clienteFiltrado" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
              <button
                v-if="!mostrarTodosRegistrosCliente"
                @click="verTodosLosRegistrosCliente"
                class="btn"
                style="background:#2563eb; color:white; border:none; padding:8px 14px; border-radius:7px; cursor:pointer; font-weight:700;"
              >
                📋 Ver todos los registros
              </button>
              <button
                v-else
                @click="mostrarTodosRegistrosCliente = false; paginaActual = 1; registroVistaPrevia = null"
                class="btn"
                style="background:#475569; color:white; border:none; padding:8px 14px; border-radius:7px; cursor:pointer; font-weight:700;"
              >
                ← Ver pendientes
              </button>
            </div>
          </div>

          <div class="facturas-carousel">
            <div v-for="p in pedidosPaginados" :key="p.id" class="mini-factura-card">
              <div class="factura-header">
                <span class="factura-id">REG-#{{ String(p.id).padStart(4, '0') }}</span>
                <span class="factura-fecha">📅 {{ p.fechaEntregaFormateada || p.fecha_entrega || 'Sin fecha' }}</span>
              </div>

              <div class="factura-body">
                <div class="factura-cliente">
                  <p class="label">Cliente</p>
                  <p class="value-highlight">{{ p.nombre }}</p>
                  <p class="sub-value">{{ p.email || 'Sin correo' }}</p>
                </div>

                <div class="factura-items">
                  <p class="label">Productos comprados</p>
                  <div class="factura-item-line">
                    <span class="item-name">📦 {{ p.cantidad_productos || p.items?.length || 1 }} producto(s)</span>
                    <span class="item-qty">{{ p.cantidad_unidades || p.unidades || 1 }} unidad(es)</span>
                  </div>
                </div>
              </div>


              <div class="factura-footer">
                <div>
                  <span>Estado:</span>
                  <span class="factura-total" :class="{ 'estado-completado': String(p.estado || '').toLowerCase() === 'completado' }">
                    {{ p.estado || 'Pendiente' }}
                  </span>
                </div>

                <div style="display:flex; gap:7px; align-items:center;">
                  <button
                    @click="abrirPreviewRegistro(p)"
                    class="btn-vista-previa"
                    type="button"
                  >
                    👁 Vista previa
                  </button>

                  <button
                    v-if="String(p.estado || '').toLowerCase() !== 'completado'"
                    @click.stop="marcarPedidoCompletado(p)"
                    class="btn-alert-completar"
                    type="button"
                  >
                    ✓ Completar
                  </button>
                </div>
              </div>
            </div>

            <div v-if="pedidosPaginados.length === 0" class="factura-empty-carousel text-center muted">
              {{ mostrarTodosRegistrosCliente
                ? '📭 Este cliente no tiene registros de compra.'
                : '📭 No hay compras pendientes de completar.' }}
            </div>
          </div>
        </div>
      </section>


        </section>
      

      <section v-else-if="adminTab === 'estadisticas'" class="admin-stats-section admin-section">
        <div class="section-header-flex" style="margin-bottom: 18px;">
          <div>
            <h3>Stock del catálogo</h3>
            <p class="section-desc">Consultá el stock actual de los productos y detectá rápidamente los que están agotados.</p>
          </div>
        </div>

        <div class="stats-stock-card">
          <div class="stats-panel-header stock-header-row">
            <h4>Stock actual del catálogo</h4>
            <div class="stock-type-switcher">
              <button
                v-for="tipo in stockCategorias"
                :key="tipo.valor"
                type="button"
                class="stock-type-btn"
                :class="{ active: stockCategoriaSeleccionada === tipo.valor }"
                @click="stockCategoriaSeleccionada = tipo.valor"
              >
                {{ tipo.label }}
              </button>
            </div>
          </div>

          <div class="stats-stock-table-wrap">
            <table class="stats-stock-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Color</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="producto in productosStockPaginaActual"
                  :key="producto.id"
                  :class="{ 'stock-alert-row': Number(producto.stock || 0) <= 0 }"
                >
                  <td class="stock-product-name">{{ producto.nombre }}</td>
                  <td>{{ producto.codigo || 'Sin código' }}</td>
                  <td>{{ producto.color || 'Sin color' }}</td>
                  <td>
                    <span
                      class="stock-value"
                      :class="{ 'stock-empty': Number(producto.stock || 0) <= 0 }"
                    >
                      {{ Number(producto.stock || 0) > 0 ? `${Number(producto.stock || 0)} u.` : 'Sin stock' }}
                      <span
                        v-if="Number(producto.stock || 0) <= 0"
                        class="stock-warning"
                        title="Sin stock"
                      >!</span>
                    </span>
                  </td>
                </tr>

                <tr v-if="!productosStockPaginaActual.length">
                  <td colspan="4" class="stats-empty">No hay productos cargados.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="productosStockCategoria.length > stockPorPagina" class="stock-pagination">
            <button
              type="button"
              class="stock-page-btn"
              @click="paginaStockAnterior"
              :disabled="paginaStockActual === 1"
            >
              ←
            </button>

            <span class="stock-page-indicator">
              Página {{ paginaStockActual }} / {{ totalPaginasStock }}
            </span>

            <button
              type="button"
              class="stock-page-btn"
              @click="paginaStockSiguiente"
              :disabled="paginaStockActual >= totalPaginasStock"
            >
              →
            </button>
          </div>
        </div>
      </section>

      <div v-if="adminTab === 'ventas'" class="admin-grid-two-cols">
        

        <section class="admin-section">
          <h3>Gestión del Carrusel de Portada</h3>
          
          <div style="background: rgba(0,0,0,0.02); padding: 12px; border-radius: 8px; margin-bottom: 15px; border: 1px dashed #ccc;">
            <h4 style="margin-top: 0; margin-bottom: 8px; font-size: 0.95rem;">➕ Agregar nueva foto al carrusel</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; gap: 8px;">
                <input v-model="nuevoSlide.titulo" type="text" class="pro-input" placeholder="Título del slide" style="flex: 2;" />
                <input v-model="nuevoSlide.productoId" type="number" class="pro-input" placeholder="ID Producto (opcional)" style="flex: 1;" />
              </div>
              
              <div style="display: flex; gap: 8px; align-items: center;">
                <div class="file-upload-container" style="flex: 1;">
                  <label for="slide-upload" class="custom-file-upload" style="padding: 6px 10px; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="upload-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <span>Subir imagen</span>
                  </label>
                  <input id="slide-upload" type="file" @change="manejarSubidaSlide" accept="image/*" />
                  <div v-if="slidePreviewUrl" class="beta-slide-upload-preview">
                    <div class="beta-slide-upload-preview-image">
                      <img :src="slidePreviewUrl" alt="Vista previa del slide" />
                      <span class="beta-slide-preview-chip">VISTA PREVIA</span>
                    </div>
                    <div class="beta-slide-upload-preview-info">
                      <strong>Imagen seleccionada</strong>
                      <span>Se enviará al guardar el slide.</span>
                    </div>
                  </div>
                </div>
                <span style="font-size: 0.8rem; color: #888;">ó</span>
                <input v-model="nuevoSlide.imagenUrl" type="text" class="pro-input" placeholder="URL de imagen" style="flex: 2;" />
              </div>
              
              <button @click="agregarSlide" class="btn primary btn-block" style="padding: 6px;">Subir nueva imagen</button>
            </div>
          </div>

          <div class="admin-products-list" style="max-height: 380px; overflow-y: auto; padding-right: 5px;">
            <div v-for="slide in carouselItems" :key="slide.id" style="display:flex; gap:10px; align-items:center; margin-bottom:10px; border-bottom:1px solid #eee; background: transparent; padding: 8px; border-radius: 6px;">
              
              <div style="position: relative; width: 50px; height: 50px; flex-shrink: 0; border: 1px solid #444; border-radius: 6px; overflow: hidden; background: #2a2a2a;">
                <img 
                  :src="resolverImagen(slide.imagen)" 
                  loading="lazy" 
                  @error="manejarErrorImagen" 
                  style="width: 100%; height: 100%; object-fit: cover; display: block;" 
                />
              </div>
              
              <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
                <div style="display: flex; gap: 6px;">
                  <input v-model="slide.titulo" type="text" class="pro-input" placeholder="Título" style="flex:2; font-size: 0.85rem; padding: 4px 8px;" />
                  <input v-model="slide.producto_id" type="number" class="pro-input" placeholder="ID Prod." style="flex:1; font-size: 0.85rem; padding: 4px 8px;" />
                </div>
                
                <div style="display: flex; gap: 6px; align-items: center;">
                  <input v-model="slide.imagenUrl" type="text" class="pro-input" placeholder="URL Imagen" style="flex:1; font-size: 0.8rem; padding: 4px 8px;" />
                  <label style="font-size:0.75rem; color:#007bff; cursor:pointer; white-space:nowrap; text-decoration:underline;">
                    Cambiar Foto
                    <input type="file" @change="manejarSubidaSlideEdicion($event, slide.id)" accept="image/*" style="display:none;" />
                    <div v-if="slideEditPreviews[slide.id]" class="beta-slide-edit-preview">
                      <img :src="slideEditPreviews[slide.id]" alt="Vista previa del cambio" />
                      <span>Nueva imagen</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div style="display:flex; flex-direction:column; gap:4px; flex-shrink: 0;">
                <button @click="actualizarSlide(slide)" class="btn btn-sm btn-save" style="padding: 4px 8px; font-size: 0.75rem;">💾</button>
                <button @click="eliminarSlide(slide.id)" class="btn btn-sm btn-logout" style="background:#dc3545; color:white; padding: 4px 8px; font-size: 0.75rem;">🗑️</button>
              </div>
            </div>

            <p v-if="carouselItems.length === 0" class="muted" style="text-align: center; font-size: 0.85rem;">Aún no hay slides cargados.</p>
          </div>
        </section>


        <section class="admin-section">
          <h3>Pedidos Recientes e Indicador de Vencimiento</h3>
          <div class="table-container" style="height: 420px; min-height: 420px; overflow-y: auto;">
            <table class="pro-table" style="table-layout: fixed; width: 100%;">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Fecha Requerida</th>
                  <th>Prioridad / Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in pedidosPaginados" :key="p.id" :class="{ 'row-vencida-urgente': p.diasRestantes <= 2 && p.estado !== 'Completado' }">
                  <td class="font-medium">{{ p.nombre }}</td>
                  <td>{{ p.pedido }}</td>
                  <td>📅 {{ p.fechaEntregaFormateada }}</td>
                  <td>
                    <span class="status-badge" :class="getBadgeClassDinamico(p)">
                      {{ p.diasRestantes <= 2 && p.estado !== 'Completado' ? 'CRÍTICO / URGENTE' : (p.estado || 'Pendiente') }}
                    </span>
                  </td>
                </tr>
                <tr v-if="pedidos.length === 0">
                  <td colspan="4" class="text-center muted">No hay pedidos registrados.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="pedidosFiltradosPorFecha.length > itemsPorPagina" class="pagination-controls" style="margin-top: 10px;">
            <button @click="paginaAnterior" :disabled="paginaActual === 1" class="btn-nav">◀ Ant</button>
            <span class="page-indicator">Página <strong>{{ paginaActual }}</strong> de {{ Math.ceil(pedidosFiltradosPorFecha.length / itemsPorPagina) }}</span>
            <button @click="paginaSiguiente" :disabled="paginaActual >= Math.ceil(pedidosFiltradosPorFecha.length / itemsPorPagina)" class="btn-nav">Sig ▶</button>
          </div>
        </section>

      </div>


      <section v-if="adminTab === 'ventas'" class="admin-section">
        <h3>Gestión de Inventario</h3>

        <!-- Convertidor Directo de Imagen a Base64 -->
        <div class="box-convertidor-url" style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #444;">
          <h4 style="margin-top: 0; margin-bottom: 10px; color: #3b82f6;">🔗 Generador / Convertidor de URL de Imagen</h4>
          <p style="font-size: 0.85rem; color: #aaa; margin-top: 0; margin-bottom: 12px;">
            Subí un archivo local desde tu dispositivo para obtener su URL (Base64) y usarla donde quieras.
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div class="file-upload-container">
              <label for="file-convertidor" class="custom-file-upload" style="cursor: pointer; display: inline-flex; align-items: center; gap: 8px; background: #2563eb; color: #fff; padding: 8px 14px; border-radius: 6px; font-weight: 600; font-size: 0.9rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span>{{ cargandoImagenTool ? 'Procesando archivo...' : 'Seleccionar archivo local' }}</span>
              </label>
              <input 
                id="file-convertidor" 
                type="file" 
                accept="image/*" 
                @change="generarUrlDesdeArchivo" 
                style="display: none;" 
              />
            </div>

            <div v-if="urlGeneradaTool" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              <label style="font-size: 0.8rem; color: #22c55e; font-weight: bold;">¡URL Generada con éxito!</label>
              
              <div style="display: flex; gap: 8px;">
                <input 
                  type="text" 
                  :value="urlGeneradaTool" 
                  readonly 
                  class="pro-input" 
                  style="flex: 1; font-family: monospace; font-size: 0.8rem;" 
                />
                <button 
                  @click="copiarUrlAlPortapapeles" 
                  type="button" 
                  class="btn" 
                  style="background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; white-space: nowrap;"
                >
                  📋 Copiar URL
                </button>
              </div>

              <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                <span style="font-size: 0.8rem; color: #888;">Vista previa:</span>
                <img :src="urlGeneradaTool" alt="Preview" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #555;" />
              </div>
            </div>
          </div>
        </div>


        <!-- Asignación masiva de imágenes por nombre -->
        <div class="asignacion-masiva-imagenes" style="background: rgba(59,130,246,0.06); padding: 16px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(59,130,246,0.25);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
            <div>
              <h4 style="margin:0 0 5px; color:#e2e8f0;">🖼️ Asignación automática de imágenes</h4>
              <p style="margin:0; font-size:0.82rem; color:#94a3b8;">
                Elegí una palabra o frase del nombre y una sola imagen. Se aplicará a todos los productos que coincidan.
              </p>
            </div>
            <span v-if="productosCoincidentesImagenMasiva.length" style="font-size:0.78rem; font-weight:700; color:#86efac; background:rgba(34,197,94,0.10); padding:6px 9px; border-radius:999px;">
              {{ productosCoincidentesImagenMasiva.length }} coincidencia{{ productosCoincidentesImagenMasiva.length === 1 ? '' : 's' }}
            </span>
          </div>

          <div style="display:grid; grid-template-columns:minmax(180px,1fr) minmax(220px,1.3fr) auto; gap:10px; align-items:end;">
            <div style="display:flex; flex-direction:column; gap:5px;">
              <label style="font-size:0.75rem; color:#cbd5e1; font-weight:700;">Nombre contiene</label>
              <input
                v-model="asignacionMasivaTexto"
                type="text"
                class="pro-input inline"
                placeholder="Ej.: Mc Cal"
              />
            </div>

            <div style="display:flex; flex-direction:column; gap:5px;">
              <label style="font-size:0.75rem; color:#cbd5e1; font-weight:700;">Imagen</label>
              <label class="custom-file-upload" style="cursor:pointer; background:#2563eb; color:#fff; padding:9px 12px; border-radius:6px; font-size:0.82rem; display:flex; align-items:center; gap:8px; justify-content:center; min-height:38px; box-sizing:border-box;">
                📁 {{ asignacionMasivaArchivo?.name || 'Seleccionar imagen' }}
                <input type="file" accept="image/*" @change="seleccionarImagenMasiva" style="display:none;" />
              </label>
            </div>

            <button
              type="button"
              class="btn primary"
              @click="asignarImagenMasiva"
              :disabled="asignandoImagenMasiva || !asignacionMasivaTexto.trim() || !asignacionMasivaArchivo || !productosCoincidentesImagenMasiva.length"
              style="min-height:38px; white-space:nowrap;"
            >
              {{ asignandoImagenMasiva ? 'Aplicando...' : '⚡ Aplicar a todos' }}
            </button>
          </div>

          <div v-if="asignacionMasivaArchivo" style="display:flex; align-items:center; gap:10px; margin-top:10px;">
            <img :src="asignacionMasivaPreview" alt="Vista previa" style="width:52px; height:52px; object-fit:cover; border-radius:7px; border:1px solid rgba(255,255,255,.15);" />
            <div style="font-size:0.78rem; color:#94a3b8;">
              <strong style="display:block; color:#e2e8f0;">{{ asignacionMasivaArchivo.name }}</strong>
              La imagen se guardará una sola vez y se asignará a los productos encontrados.
            </div>
          </div>

          <div v-if="asignacionMasivaTexto.trim() && productosCoincidentesImagenMasiva.length === 0" style="margin-top:10px; font-size:0.78rem; color:#fca5a5;">
            No se encontraron productos cuyo nombre contenga “{{ asignacionMasivaTexto.trim() }}”.
          </div>
        </div>

        <div class="nuevo-producto-form" style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px dashed #ccc;">
          <h4 style="margin-top: 0; margin-bottom: 10px;">✨ Registrar Nuevo Producto</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            
            <div style="display: grid; grid-template-columns: minmax(180px, 2fr) minmax(180px, 1fr); gap: 10px; align-items: end;">
              <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-size:0.78rem; font-weight:700; color:#cbd5e1;">Nombre</label>
                <input v-model="nuevoProducto.nombre" type="text" placeholder="Nombre del producto" class="pro-input inline" />
              </div>
              <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-size:0.78rem; font-weight:700; color:#cbd5e1;">¿Tiene código?</label>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; min-height:38px;">
                  <button type="button" @click="nuevoProducto.tieneCodigo = true" :style="{ minHeight:'38px', border:'1px solid ' + (nuevoProducto.tieneCodigo ? '#22c55e' : '#475569'), borderRadius:'6px', cursor:'pointer', background:nuevoProducto.tieneCodigo ? 'rgba(34,197,94,0.16)' : 'rgba(15,23,42,0.35)', color:nuevoProducto.tieneCodigo ? '#86efac' : '#cbd5e1', fontWeight:'700' }">Sí</button>
                  <button type="button" @click="nuevoProducto.tieneCodigo = false; nuevoProducto.codigo = ''" :style="{ minHeight:'38px', border:'1px solid ' + (!nuevoProducto.tieneCodigo ? '#ef4444' : '#475569'), borderRadius:'6px', cursor:'pointer', background:!nuevoProducto.tieneCodigo ? 'rgba(239,68,68,0.16)' : 'rgba(15,23,42,0.35)', color:!nuevoProducto.tieneCodigo ? '#fca5a5' : '#cbd5e1', fontWeight:'700' }">No</button>
                </div>
              </div>
              <div style="grid-column:1 / -1; display:flex; flex-direction:column; gap:5px;">
                <label style="font-size:0.78rem; font-weight:700; color:#cbd5e1;">Código del producto</label>
                <input v-model="nuevoProducto.codigo" type="text" placeholder="Código (puede contener letras y números)" class="pro-input inline" style="text-align:center;" :disabled="!nuevoProducto.tieneCodigo" />
                <small style="color:#94a3b8;">Si seleccionás “No”, el campo queda bloqueado. Podés usar códigos numéricos o alfanuméricos.</small>
              </div>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <input v-model="nuevoProducto.color" type="text" placeholder="Color (ej. Rojo)" class="pro-input inline" style="flex: 1; min-width: 140px;" />
              <input v-model="nuevoProducto.medida" type="text" placeholder="Medida (ej. XL, 40cm)" class="pro-input inline" style="flex: 1; min-width: 140px;" />
              <select v-model="nuevoProducto.categoria" class="pro-input inline" style="flex: 1; min-width: 170px;">
                <option value="vinilos">Vinilos de corte</option>
                <option value="impresiones">Impresiones</option>
                <option value="pisos">Pisos adhesivos</option>
              </select>
              <input v-model.number="nuevoProducto.stock" type="number" placeholder="Stock" class="pro-input inline" style="flex: 1; min-width: 100px;" />
            </div>
        
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; gap: 10px; align-items: center;">
                <input 
                  v-model="nuevoProducto.imagen" 
                  type="text" 
                  class="pro-input" 
                  style="flex: 1;"
                  placeholder="Pega la URL de la imagen (https://... o data:image/...)" 
                />

                <label class="custom-file-upload" style="cursor: pointer; background: #2563eb; color: white; padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
                  📁 Subir imagen
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="convertirEImagenAUrl($event, nuevoProducto)" 
                    style="display: none;" 
                  />
                </label>
              </div>

              <div v-if="nuevoProducto.imagen" style="margin-top: 5px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.8rem; color: #888;">Vista previa:</span>
                <img :src="resolverImagen(nuevoProducto.imagen)" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;" />
              </div>
            </div>

            <button @click="agregarProductoNuevo" class="btn primary btn-block" style="margin-top: 5px;" :disabled="creandoProducto">
              {{ creandoProducto ? 'Guardando...' : 'Subir nuevo producto' }}
            </button>
          </div>
        </div>

        <div class="catalog-filter-header" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px;">
          <div>
            <h4 style="margin: 0;">Productos del Catálogo</h4>
            <p class="muted" style="margin: 4px 0 0; font-size: 0.82rem;">
              Filtrá los productos según el tipo de material.
            </p>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button
              v-for="categoria in categoriasCliente"
              :key="`admin-${categoria.valor}`"
              @click="cambiarCategoriaAdminProductos(categoria.valor)"
              class="btn"
              :class="categoriaAdminSeleccionada === categoria.valor ? 'primary' : 'btn-secondary'"
              style="padding: 7px 11px; font-size: 0.82rem;"
            >
              {{ categoria.label }}
            </button>
          </div>
        </div>

        <div class="admin-products-container" style="width: 100%; overflow-x: auto; box-sizing: border-box; margin-bottom: 20px;">
          <div style="min-width: 900px; width: 100%;">
            
            <div class="admin-product-header" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px; padding-bottom: 8px; font-weight: bold; font-size: 0.85rem; border-bottom: 2px solid #444; color: #ccc; width: 100%; box-sizing: border-box;">
              <span style="width: 42px; flex-shrink: 0; text-align: center;">Foto</span>
              <span style="flex: 2; min-width: 140px; text-align: left;">Nombre</span>
              <span style="flex: 0.9; min-width: 100px; text-align: center;">Código</span>
              <span style="flex: 1; min-width: 100px; text-align: center;">Color</span>
              <span style="flex: 1; min-width: 100px; text-align: center;">Medida</span>
              <span style="flex: 0.8; min-width: 80px; text-align: center;">Stock</span>
              <span style="flex: 1.2; min-width: 140px; text-align: center;">URL Imagen</span>
              <span style="min-width: 120px; text-align: center;">Acciones</span>
            </div>

            <div v-for="p in productosAdminPaginados" :key="p.id" class="admin-product-row" style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; width: 100%; box-sizing: border-box;">
              
              <div class="product-mini-img-wrapper" style="position: relative; width: 42px; height: 42px; flex-shrink: 0; border: 1px solid #444; border-radius: 4px; overflow: hidden; background: #2a2a2a;" title="Hacé clic para cambiar la foto desde tu equipo">
                <img 
                  :src="p.imagen ? resolverImagen(p.imagen) : 'https://placehold.co/100x100/333/fff?text=Sin+Foto'" 
                  loading="lazy" 
                  @error="e => e.target.src = 'https://placehold.co/100x100/333/fff?text=Error'" 
                  style="width: 100%; height: 100%; object-fit: cover; display: block;" 
                />
                <input 
                  type="file" 
                  @change="manejarEdicionImagen($event, p)" 
                  accept="image/*" 
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" 
                />
              </div>

              <input v-model.lazy="p.nombre" type="text" class="pro-input inline" placeholder="Nombre" style="flex: 2; min-width: 140px;" />
              <div style="flex: 0.9; min-width: 100px; display:flex; flex-direction:column; gap:4px;">
                <label style="display:flex; align-items:center; justify-content:center; gap:5px; font-size:0.7rem; color:#94a3b8; cursor:pointer;">
                  <input v-model="p.tieneCodigo" type="checkbox" /> Código
                </label>
                <input v-model.lazy="p.codigo" type="text" class="pro-input inline" placeholder="Sin código" style="width:100%; box-sizing:border-box; text-align:center;" :disabled="!p.tieneCodigo" />
              </div>
              <input v-model.lazy="p.color" type="text" class="pro-input inline" placeholder="Color" style="flex: 1; min-width: 100px; text-align:center;" />
              <input v-model.lazy="p.medida" type="text" class="pro-input inline" placeholder="Medida" style="flex: 1; min-width: 100px; text-align:center;" />
              <input v-model.number.lazy="p.stock" type="number" min="0" class="pro-input inline" placeholder="Stock" style="flex: 0.8; min-width: 80px; text-align:center;" />

              <input v-model="p.imagen" type="text" class="pro-input inline" placeholder="URL de imagen" style="flex: 1.2; min-width: 140px; text-align:center;" />
              
              <div style="display: flex; gap: 4px; min-width: 120px; justify-content: center;">
                <button @click="updateProduct(p)" class="btn btn-sm btn-save" style="background-color: #28a745; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
                <button @click="eliminarProducto(p.id, p.nombre)" class="btn btn-sm btn-logout" style="background-color: #dc3545; color: white; padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer;" title="Eliminar Producto">🗑️</button>
              </div>

            </div>

          </div>
        </div>

        <div
          v-if="productosFiltradosAdmin.length > productosAdminPorPagina"
          class="pagination-controls"
          style="margin-top: 15px; display: flex; justify-content: center; align-items: center; gap: 8px; width: 100%; flex-wrap: wrap;"
        >
          <button
            @click="paginaPrimeraAdminProductos"
            :disabled="paginaActualAdminProductos === 1"
            class="btn-nav"
            title="Ir a la primera página"
          >
            ⏮ Primera
          </button>

          <button
            @click="paginaAnteriorAdminProductos"
            :disabled="paginaActualAdminProductos === 1"
            class="btn-nav"
          >
            ◀ Ant
          </button>

          <span class="page-indicator">
            Página <strong>{{ paginaActualAdminProductos }}</strong>
            de {{ totalPaginasAdminProductos }}
          </span>

          <button
            @click="paginaSiguienteAdminProductos"
            :disabled="paginaActualAdminProductos === totalPaginasAdminProductos"
            class="btn-nav"
          >
            Sig ▶
          </button>

          <button
            @click="paginaUltimaAdminProductos"
            :disabled="paginaActualAdminProductos === totalPaginasAdminProductos"
            class="btn-nav"
            title="Ir a la última página"
          >
            Última ⏭
          </button>
        </div>
      </section>

      <section v-if="false">
        <h2 style="font-size: 1rem; color: #888; margin-bottom: 12px;">Vista previa del catálogo de productos</h2>
        
        <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
          <div 
            v-for="p in productosPaginadosCarrito" 
            :key="p.id" 
            :id="`producto-${p.id}`" 
            class="product-card"
            style="padding: 8px; font-size: 0.75rem;"
          >
            <div class="product-image-wrapper" style="height: 90px; overflow: hidden; border-radius: 4px; position: relative;">
              <img 
                :src="p.imagen ? resolverImagen(p.imagen) : 'https://placehold.co/150x150/333/fff?text=Sin+Imagen'" 
                :alt="p.nombre" 
                class="product-image" 
                loading="lazy" 
                style="width: 100%; height: 100%; object-fit: cover;"
                @error="e => e.target.src = 'https://placehold.co/150x150/333/fff?text=Error'" 
              />
              <div class="product-tag-overlay" v-if="p.precio > 50000" style="font-size: 0.65rem; padding: 2px 4px;">Premium</div>
              <div class="product-tag-overlay stock-out" v-if="p.stock <= 0" style="background: #dc3545; top: 5px; right: 5px; font-size: 0.65rem; padding: 2px 4px;">Sin Stock</div>
            </div>

            <div class="product-body" style="padding-top: 6px;">
              <div class="product-info">
                <h3 style="font-size: 0.82rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="p.nombre">
                  {{ p.nombre }}
                </h3>

                <p v-if="p.codigo" class="product-code" style="font-size: 0.68rem; font-weight: 700; color: #2d6cdf; margin: 2px 0 1px;">
                  Código: {{ p.codigo }}
                </p>
                
                <p class="product-specs" style="font-size: 0.7rem; color: #aaa; margin: 2px 0;" v-if="p.color || p.medida || p.categoria">
                  <span v-if="p.color">🎨 {{ p.color }}</span>
                  <span v-if="p.color && (p.medida || p.categoria)"> | </span>
                  <span v-if="p.medida">📐 {{ p.medida }}</span>
                  <span v-if="p.medida && p.categoria"> | </span>
                  <span v-if="p.categoria">📦 {{ p.categoria }}</span>
                </p>

                <p class="stock-info" style="font-size: 0.7rem; margin-bottom: 4px;" :style="{ color: p.stock > 0 ? '#28a745' : '#dc3545' }">
                  {{ p.stock > 0 ? `Stock: ${p.stock} u.` : 'Agotado' }}
                </p>

                <p class="price" style="font-size: 0.9rem; font-weight: bold; margin: 2px 0; color: #1f7a1f;">
                  {{ formatearPrecio(p.precio) }}
                </p>
              </div>

              <div class="product-actions" style="margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
                <div class="quantity-selector" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <button @click="decrease(p)" class="qty-btn" :disabled="p.stock <= 0" style="padding: 2px 6px; font-size: 0.7rem;">-</button>
                  <span class="qty-number" style="font-size: 0.75rem;">{{ p.qty || 1 }}</span>
                  <button @click="increase(p)" class="qty-btn" :disabled="p.stock <= 0 || (p.qty || 1) >= p.stock" style="padding: 2px 6px; font-size: 0.7rem;">+</button>
                </div>

                <div class="action-buttons-group" style="display: flex; gap: 4px; margin-top: 4px;">
                  <button @click="addToCart(p)" class="btn btn-secondary btn-add" :disabled="p.stock <= 0" style="padding: 4px; font-size: 0.68rem; flex: 1;">Añadir 🛒</button>
                  <button @click="abrirModalComprarYa(p)" class="btn primary btn-buy-now" :disabled="p.stock <= 0" style="padding: 4px; font-size: 0.68rem; flex: 1;">Comprar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>


    <div v-else class="shop-panel">
      <!-- Header -->
      <div class="panel-header shop-layout-header">
        <div>
          <h2>Catálogo de Productos</h2>
          <p class="subtitle">Selecciona los artículos para generar tu orden de inmediato</p>
        </div>
        <div class="cart-status-indicator" @click="isCartOpen = !isCartOpen" :class="{ 'has-items': cart.length > 0 }">
          <span class="cart-icon">🛒</span>
          <span class="cart-badge-count" v-if="cart.length > 0">{{ cart.length }}</span>
        </div>
      </div>

      <div v-if="carouselItems.length" class="hero-carousel">
        <div class="hero-carousel-viewport">
          <div class="hero-carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="slide in carouselItems" :key="slide.id" class="hero-carousel-card">
              <img 
                :src="slide.imagen ? resolverImagen(slide.imagen) : 'https://placehold.co/600x400/333/fff?text=Sin+Imagen'" 
                loading="lazy" 
                @error="e => e.target.src = 'https://placehold.co/600x400/333/fff?text=Error+al+cargar'" 
                :alt="slide.titulo || 'Producto destacado'" 
              />
              <div class="hero-carousel-overlay">
                <div>
                  <h3>{{ slide.titulo || 'Producto destacado' }}</h3>
                  <p v-if="slide.producto_id">Producto relacionado: #{{ slide.producto_id }}</p>
                </div>
                <button v-if="slide.producto_id" @click="irAlProducto(slide.producto_id)" class="btn primary">Consultar ya 💬</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="carouselItems.length > 1" class="hero-carousel-controls">
          <button @click="prevSlide" class="hero-carousel-btn">‹</button>
          <div class="hero-carousel-dots">
            <button
              v-for="(slide, index) in carouselItems"
              :key="slide.id"
              class="hero-carousel-dot"
              :class="{ active: index === currentSlide }"
              @click="currentSlide = index"
            />
          </div>
          <button @click="nextSlide" class="hero-carousel-btn">›</button>
        </div>
      </div> 

      <!-- NAVBAR DE CONSULTA RAPIDA POR CODIGO -->
      <div v-if="!isAdmin" class="consulta-rapida-navbar">
        <div class="consulta-rapida-info">
          <strong>🔎 Consulta rápida</strong>
          <span>Buscá un producto por su código</span>
        </div>
        <div class="consulta-rapida-search">
          <input v-model="codigoConsultaRapida" @input="limpiarResultadoSiVacio" @keyup.enter="buscarProductoPorCodigo" type="text" class="pro-input" placeholder="Ingresá el código..." />
          <button @click="buscarProductoPorCodigo" class="btn primary">Buscar</button>
        </div>
        <div v-if="productoConsultaRapida" class="consulta-rapida-resultado">
          <img :src="resolverImagen(productoConsultaRapida.imagen)" :alt="productoConsultaRapida.nombre" @error="manejarErrorImagen" />
          <div class="consulta-rapida-producto">
            <strong>{{ productoConsultaRapida.nombre }}</strong>
            <small>Código: {{ productoConsultaRapida.codigo }}</small>
            <small v-if="productoConsultaRapida.color || productoConsultaRapida.medida">{{ productoConsultaRapida.color || '' }}{{ productoConsultaRapida.color && productoConsultaRapida.medida ? ' · ' : '' }}{{ productoConsultaRapida.medida || '' }}</small>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button @click="agregarProductoConsultaRapida(productoConsultaRapida)" class="btn btn-secondary">💬 Agregar a consulta</button>
            <button @click="agregarProductoAlCarritoDesdeBusqueda(productoConsultaRapida)" class="btn primary">🛒 Agregar al carrito</button>
          </div>
        </div>
        <div v-else-if="codigoConsultaRapidaBuscado" class="consulta-rapida-no-encontrado">
          ⚠️ No se encontró ningún producto con el código "{{ codigoConsultaRapidaBuscado }}".
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
        <button
          v-for="categoria in categoriasCliente"
          :key="categoria.valor"
          @click="categoriaSeleccionada = categoria.valor"
          class="btn"
          :class="categoriaSeleccionada === categoria.valor ? 'primary' : 'btn-secondary'"
          style="padding: 8px 12px; font-size: 0.9rem;"
        >
          {{ categoria.label }}
        </button>
      </div>

      <div v-if="productosPaginadosCliente.length" class="products-grid">
        <div v-for="p in productosPaginadosCliente" :key="p.id" :id="`producto-${p.id}`" class="product-card">
          <div class="product-image-wrapper">
            <img 
              :src="p.imagen ? resolverImagen(p.imagen) : 'https://placehold.co/300x300/333/fff?text=Sin+Imagen'" 
              :alt="p.nombre" 
              class="product-image" 
              loading="lazy" 
              @error="e => e.target.src = 'https://placehold.co/300x300/333/fff?text=Error+al+cargar'" 
            />
            <div class="product-tag-overlay" v-if="p.precio > 50000">Premium</div>
            <div class="product-tag-overlay stock-out" v-if="p.stock <= 0" style="background: #dc3545; top: 10px; right: 10px;">Sin Stock</div>
          </div>

          <div class="product-body">
            <div class="product-info">
              <h3>{{ p.nombre }}</h3>

              <p v-if="p.codigo" class="product-code" style="font-size: 0.8rem; font-weight: 700; color: #2d6cdf; margin: 4px 0 2px;">
                Código: {{ p.codigo }}
              </p>
              
              <p class="product-specs" style="font-size: 0.85rem; color: #aaa; margin: 4px 0;" v-if="p.color || p.medida || p.categoria">
                <span v-if="p.color">🎨 {{ p.color }}</span>
                <span v-if="p.color && (p.medida || p.categoria)"> | </span>
                <span v-if="p.medida">📐 {{ p.medida }}</span>
                <span v-if="p.medida && p.categoria"> | </span>
                <span v-if="p.categoria">📦 {{ p.categoria }}</span>
              </p>

              <p class="stock-info" style="font-size: 0.8rem; margin-bottom: 6px;" :style="{ color: p.stock > 0 ? '#28a745' : '#dc3545' }">
                {{ p.stock > 0 ? `Stock disponible: ${p.stock} u.` : 'Agotado' }}
              </p>

              <p class="price" style="font-size: 1rem; font-weight: 700; color: #1f7a1f; margin: 8px 0 0;">
                {{ formatearPrecio(p.precio) }}
              </p>
            </div>

            <div class="product-actions">
              <div class="quantity-selector">
                <button @click="decrease(p)" class="qty-btn" :disabled="p.stock <= 0">-</button>
                <span class="qty-number">{{ p.qty || 1 }}</span>
                <button @click="increase(p)" class="qty-btn" :disabled="p.stock <= 0 || (p.qty || 1) >= p.stock">+</button>
              </div>

              <div class="action-buttons-group">
                <button @click="addToCart(p)" class="btn btn-secondary btn-add" :disabled="p.stock <= 0">Añadir 🛒</button>
                <button @click.stop="abrirConsultaCliente(p)" type="button" class="btn primary btn-buy-now" :disabled="p.stock <= 0">Consultar ya 💬</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state" style="padding: 24px; text-align: center; color: #666;">
        No hay productos disponibles en esta categoría por el momento.
      </div>


      <div
        v-if="productosFiltradosCliente.length > productosClientePorPagina"
        class="pagination-controls"
        style="margin: 20px 0; display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;"
      >
        <button
          @click="paginaPrimeraClienteProductos"
          :disabled="paginaActualClienteProductos === 1"
          class="btn-nav"
          title="Ir a la primera página"
        >
          ⏮ Primera
        </button>

        <button
          @click="paginaAnteriorClienteProductos"
          :disabled="paginaActualClienteProductos === 1"
          class="btn-nav"
        >
          ◀ Ant
        </button>

        <span class="page-indicator">
          Página <strong>{{ paginaActualClienteProductos }}</strong>
          de {{ totalPaginasClienteProductos }}
        </span>

        <button
          @click="paginaSiguienteClienteProductos"
          :disabled="paginaActualClienteProductos === totalPaginasClienteProductos"
          class="btn-nav"
        >
          Sig ▶
        </button>

        <button
          @click="paginaUltimaClienteProductos"
          :disabled="paginaActualClienteProductos === totalPaginasClienteProductos"
          class="btn-nav"
          title="Ir a la última página"
        >
          Última ⏭
        </button>
      </div>

    </div>


    <transition name="slide-panel">
      <div 
        v-if="isCartOpen" 
        id="main-shop-cart" 
        class="side-cart-panel" 
        style="position: fixed; top: 0; right: 0; height: 100%; max-height: 100vh; max-width: 400px; width: 100%; z-index: 9999; display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden;"
      >
        <div class="cart-header-wrapper" style="flex-shrink: 0;">
          <div class="cart-title">🛒 Mi Carrito ({{ cart.length }})</div>
          <div class="cart-header-actions">
            <button @click="clearCart" class="btn-clear-cart" v-if="cart.length > 0">Vaciar Todo</button>
            <button @click="isCartOpen = false" class="btn-close-cart">✕</button>
          </div>
        </div>

        <div v-if="cart.length === 0" class="cart-empty-state">
          <p>Tu carrito está vacío</p>
        </div>

        <div v-else style="display: flex; flex-direction: column; flex: 1; min-height: 0;">
          <div class="cart-items-list" style="flex: 1; overflow-y: auto; min-height: 0;">
            <div v-for="c in cart" :key="c.id" class="cart-item-row-advanced">
              <div class="cart-item-details">
                <span class="cart-item-name">{{ c.nombre }}</span>
                <div class="cart-item-meta">
                  <span class="cart-item-qty">Cantidad: <strong>{{ c.qty }}</strong></span>
                </div>
              </div>
              <div class="cart-item-actions">
                <button @click="removeOneFromCart(c.id)" class="btn-action-cart min">-1</button>
                <button @click="removeFromCartCompletely(c.id)" class="btn-action-cart del">🗑️</button>
              </div>
            </div>
          </div>

          <div style="flex-shrink: 0;">
            <div class="cart-deadline-selector">
              <label for="cart-date"><strong>📅 Fecha requerida de entrega:</strong></label>
              <input 
                type="date" 
                id="cart-date" 
                v-model="fechaEntregaRequerida" 
                :min="minFechaPermitida" 
                :class="['pro-input deadline-field', { 'field-invalid': !fechaEntregaRequerida }]"
              />
              <p class="mini-text field-helper" style="margin-top:4px;">Indicá para qué fecha necesitás que esté listo el pedido. La hora se coordina por WhatsApp.</p>
              <p class="mini-text field-helper" :class="{ 'text-danger': !fechaEntregaRequerida }" v-if="!fechaEntregaRequerida">
                * Este campo es obligatorio para coordinar logística.
              </p>
            </div>

            <div class="cart-footer">
              <button
                @click="executeCheckout"
                type="button"
                class="btn primary btn-block btn-checkout-execute"
                :disabled="!fechaEntregaRequerida || cart.length === 0 || procesandoCheckout || redireccionandoWhatsApp"
              >
                {{ procesandoCheckout ? 'Confirmando pedido...' : 'Confirmar Registro de Compra' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>


    <transition name="fade">
      <div v-if="modalComprarYaShow" class="modal-overlay" @click.self="modalComprarYaShow = false">
        <div class="modal-card consulta-modal-card">
          <div class="modal-header">
            <div><h3>💬 Consulta rápida</h3><p class="consulta-modal-subtitle">Agregá todos los productos que quieras consultar.</p></div>
            <button @click="modalComprarYaShow = false" class="btn-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="consulta-modal-search">
              <label>🔎 Buscar otro producto por código</label>
              <div style="display:flex; gap:8px;">
                <input v-model="codigoConsultaRapida" @keyup.enter="agregarCodigoDesdeModal" type="text" class="pro-input" placeholder="Código del producto..." style="flex:1;" />
                <button @click="agregarCodigoDesdeModal" class="btn primary">Agregar</button>
              </div>
            </div>
            <div class="consulta-productos-lista">
              <div v-for="p in modalComprarYaProductos" :key="p.id" class="consulta-producto-item">
                <img :src="resolverImagen(p.imagen)" :alt="p.nombre" @error="manejarErrorImagen" />
                <div class="consulta-producto-info">
                  <strong>{{ p.nombre || p.producto }}</strong>
                  <small v-if="p.codigo">Código: {{ p.codigo }}</small>
                  <small v-if="p.color || p.medida">{{ p.color || '' }}{{ p.color && p.medida ? ' · ' : '' }}{{ p.medida || '' }}</small>
                </div>
                <div class="consulta-producto-cantidad">
                  <button @click="disminuirCantidadConsulta(p)">−</button><span>{{ p.qty || 1 }}</span><button @click="aumentarCantidadConsulta(p)">+</button>
                </div>
                <button @click="eliminarProductoConsulta(p)" class="consulta-producto-eliminar">✕</button>
              </div>
              <div v-if="!modalComprarYaProductos.length" class="consulta-vacia">No hay productos en la consulta. Buscá uno por código para agregarlo.</div>
            </div>
            <div class="form-group consulta-fecha-group" style="margin-top:15px;">
              <label>📅 ¿Para qué fecha necesitás el pedido?</label>
              <input v-model="modalComprarYaFecha" type="date" :min="minFechaPermitida" class="pro-input" />
              <small>La fecha requerida quedará incluida en el mensaje de WhatsApp. La hora se coordina por WhatsApp.</small>
            </div>
            <div class="form-group" style="margin-top:15px;">
              <label>¿Alguna duda o especificación particular?</label>
              <textarea v-model="modalComprarYaMensaje" rows="3" placeholder="Ej: ¿Qué demora tienen para entregar? / ¿Hacen envíos?" class="pro-input" style="resize:none;"></textarea>
            </div>
          </div>
          <div class="modal-actions" style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
            <button @click="modalComprarYaShow = false" class="btn btn-logout">Cancelar</button>
            <button @click="enviarConsultaWhatsApp" class="btn btn-whatsapp" :disabled="!modalComprarYaProductos.length">📲 Enviar Consulta por WhatsApp</button>
          </div>
        </div>
      </div>
    </transition>


    <transition name="fade">
      <div v-if="registroVistaPrevia" class="registro-preview-overlay" @click.self="registroVistaPrevia = null">
        <div class="registro-preview-modal" :key="registroVistaPrevia?.id ?? 'preview-modal'">
          <div class="registro-preview-modal-header">
            <div>
              <span class="registro-preview-kicker">REGISTRO DE COMPRA</span>
              <h3>Registro #{{ String(registroVistaPrevia.id).padStart(4, '0') }}</h3>
            </div>
            <button type="button" class="btn-close" @click="registroVistaPrevia = null">✕</button>
          </div>

          <div class="registro-preview-meta">
            <div><span>Cliente</span><strong>{{ registroVistaPrevia.nombre || 'Sin nombre' }}</strong></div>
            <div><span>Pedido realizado</span><strong>{{ formatearFechaRegistro(registroVistaPrevia.fecha_pedido) }}</strong></div>
            <div><span>Entrega requerida</span><strong>{{ formatearFechaRegistro(registroVistaPrevia.fecha_entrega) }}</strong></div>
          </div>

          <div class="registro-preview-products">
            <div class="registro-preview-products-title">
              <div>
                <strong>Productos solicitados</strong>
                <small v-if="registroVistaPrevia.cargandoDetalle" class="registro-preview-loading">
                  Cargando detalle...
                </small>
              </div>
              <span>{{ obtenerItemsPreview(registroVistaPrevia).length }} producto(s)</span>
            </div>
            <div v-if="obtenerItemsPreview(registroVistaPrevia).length" class="registro-preview-product-list">
              <div v-for="(item, index) in obtenerItemsPreview(registroVistaPrevia)" :key="`${registroVistaPrevia.id}-${item.producto_id || item.id || index}`" class="registro-preview-product-row">
                <div class="registro-preview-number">{{ index + 1 }}</div>
                <img :src="item.imagen ? resolverImagen(item.imagen) : (registroVistaPrevia.imagen ? resolverImagen(registroVistaPrevia.imagen) : 'https://placehold.co/64x64/111827/ffffff?text=Sin+Foto')" :alt="item.nombre || 'Producto'" @error="manejarErrorImagen" />
                <div class="registro-preview-product-info">
                  <strong>{{ item.nombre || 'Producto' }}</strong>
                  <span v-if="item.codigo">Código: <b>{{ item.codigo }}</b></span>
                  <span v-if="item.color || item.medida">{{ item.color || '' }}{{ item.color && item.medida ? ' · ' : '' }}{{ item.medida || '' }}</span>
                </div>
                <div class="registro-preview-quantity">
                  <small>CANTIDAD</small>
                  <strong>× {{ Number(item.unidades || item.cantidad || item.qty || 1) }}</strong>
                </div>
              </div>
            </div>
            <div v-else class="registro-preview-empty">No hay productos detallados para este registro.</div>
          </div>

          <div class="registro-preview-footer">
            <div>
              <span>Estado: <b>{{ registroVistaPrevia.estado || 'Pendiente' }}</b></span>
              <span>Total de unidades: <b>{{ obtenerItemsPreview(registroVistaPrevia).reduce((s, i) => s + Number(i.unidades || i.cantidad || i.qty || 1), 0) }}</b></span>
            </div>

            <button
              v-if="String(registroVistaPrevia.estado || '').toLowerCase() !== 'completado'"
              type="button"
              class="btn-alert-completar registro-preview-completar"
              :disabled="registroVistaPrevia.cargandoDetalle"
              @click="marcarPedidoCompletado(registroVistaPrevia)"
            >
              ✓ Completar registro
            </button>
          </div>
        </div>
      </div>
    </transition>

    <footer v-if="!isAdmin" class="footer" style="margin-top: 40px;">
      <div class="footer-row">
        <div class="footer-col brand-col">
          <h3>Beta Gráfica</h3>
          <p class="footer-highlight">Industria Gráfica Integral</p>
          <p class="footer-desc">Calidad premium y precisión milimétrica en cada impresión desde 1997.</p>
        </div>
        <div class="footer-col social-col">
          <span class="social-label">REDES SOCIALES</span>
          <div class="social-icons">
            <a href="https://www.facebook.com/share/1BDXuPqTHn/" target="_blank" aria-label="Facebook">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/></svg>
            </a>
            <a href="https://www.instagram.com/beta_grafica/?next=%2F" target="_blank" aria-label="Instagram">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@beta.grafica" target="_blank" aria-label="TikTok">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.15 2.25 1.93 3.69 2.23v3.74c-1.5-.04-2.99-.48-4.26-1.3-.77-.5-1.44-1.13-1.97-1.87v6.97c-.03 2.1-.81 4.14-2.18 5.62-1.54 1.74-3.8 2.76-6.13 2.8-2.13.06-4.24-.65-5.85-2.01C-.04 18.91-.45 16.2.29 13.91c.64-2.1 2.38-3.77 4.54-4.33.6-.17 1.23-.24 1.85-.24V13c-.92-.01-1.85.28-2.55.88-.73.61-1.14 1.54-1.1 2.48.05 1.05.62 2.03 1.51 2.58.91.58 2.06.66 3.03.22.95-.41 1.65-1.28 1.88-2.29.07-.36.1-.73.09-1.1V0l.01.02z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>


    <a
      v-if="!isAdmin"
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
    <transition name="whatsapp-redirect-fade">
      <div
        v-if="redireccionandoWhatsApp"
        class="whatsapp-redirect-overlay"
        role="status"
        aria-live="polite"
        aria-label="Redireccionando a WhatsApp"
      >
        <div class="whatsapp-redirect-card">
          <div class="whatsapp-redirect-icon" aria-hidden="true">
            <span>↗</span>
          </div>

          <div class="whatsapp-redirect-spinner" aria-hidden="true"></div>

          <h2>Redireccionando a WhatsApp</h2>
          <p>
            {{ redireccionWhatsAppTipo === 'pedido'
              ? 'Tu pedido fue confirmado correctamente.'
              : 'Tu consulta está lista para enviar.' }}
          </p>
          <small>Esperá un momento, muchas gracias.</small>
        </div>
      </div>
    </transition>

</template>

<script setup lang="ts">

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'

const router = useRouter()


const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
const API_URL = import.meta.env.VITE_API_URL || ''

const cargandoImagen = ref(false)
const urlGeneradaTool = ref('')
const cargandoImagenTool = ref(false)

const user = ref({})
const productos = ref([])
const pedidos = ref([])
const clientes = ref([])
const facturas = ref([])
const carouselItems = ref([])
const currentSlide = ref(0)
const nuevoSlide = ref({ titulo: '', imagenUrl: '', productoId: '' })
const slideArchivo = ref(null)
const slideEditFiles = ref({})


const slidePreviewUrl = ref('')
const slideEditPreviews = ref({})
let carouselInterval = null
const cart = ref([])
const loading = ref(true)
const isCartOpen = ref(false)
const isLoadingProducts = ref(false)
const isRefreshingAdmin = ref(false)
let lastAdminRefresh = 0
const searchDebounceTimer = null


const clienteFiltrado = ref(null)
const filtroBusquedaClientes = ref('')
const correoFiltroActivo = ref('')
const paginaActual = ref(1)
const itemsPorPagina = 10
const mostrarTodosRegistrosCliente = ref(false)
const registroVistaPrevia = ref(null)

const adminTab = ref('ventas')

// ============================================================================
// AGENDA / CALENDARIO DEL ADMIN
// ============================================================================

const TAREAS_ADMIN_STORAGE_KEY = 'beta_grafica_admin_tareas_v1'
const modalTareaAdmin = ref(false)
const tareaAdminEditando = ref(null)
const tareasAdmin = ref([])
const semanaAdminActual = ref(new Date())
const vistaCalendarioAdmin = ref('semana')
const diaCalendarioSeleccionado = ref('')
const formTareaAdmin = ref({
  titulo: '',
  fecha: '',
  hora: '',
  lugar: '',
  descripcion: '',
  prioridad: 'media',
  completada: false,
  completadaEn: null
})

const obtenerFechaLocalAdmin = (fecha = new Date()) => {
  const f = fecha instanceof Date ? fecha : new Date(fecha)
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`
}

const normalizarFechaTareaAdmin = (valor) => {
  const texto = String(valor || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto
  return obtenerFechaLocalAdmin(new Date(valor))
}

const guardarTareasAdminLocal = () => {
  try {
    localStorage.setItem(TAREAS_ADMIN_STORAGE_KEY, JSON.stringify(tareasAdmin.value))
  } catch (error) {
    console.error('No se pudieron guardar las tareas del admin:', error)
  }
}

const cargarTareasAdminLocal = () => {
  try {
    const guardadas = JSON.parse(localStorage.getItem(TAREAS_ADMIN_STORAGE_KEY) || '[]')
    tareasAdmin.value = Array.isArray(guardadas)
      ? guardadas.map(tarea => ({
          ...tarea,
          fecha: normalizarFechaTareaAdmin(tarea.fecha),
          prioridad: ['alta', 'media', 'baja'].includes(String(tarea?.prioridad)) ? String(tarea.prioridad) : 'media',
          completada: Boolean(tarea.completada)
        }))
      : []
  } catch (error) {
    console.error('No se pudieron cargar las tareas del admin:', error)
    tareasAdmin.value = []
  }
}

const inicioSemanaAdmin = computed(() => {
  const fecha = new Date(semanaAdminActual.value)
  fecha.setHours(0, 0, 0, 0)
  const dia = fecha.getDay()
  const diferencia = dia === 0 ? -6 : 1 - dia
  fecha.setDate(fecha.getDate() + diferencia)
  return fecha
})

const diasSemanaAdmin = computed(() => {
  const inicio = inicioSemanaAdmin.value
  return Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date(inicio)
    fecha.setDate(inicio.getDate() + indice)
    const clave = obtenerFechaLocalAdmin(fecha)
    const nombreCompleto = fecha.toLocaleDateString('es-AR', { weekday: 'long' })
    return {
      clave,
      numero: fecha.getDate(),
      nombre: nombreCompleto.charAt(0).toUpperCase() + nombreCompleto.slice(1, 3),
      esHoy: clave === obtenerFechaLocalAdmin()
    }
  })
})

const rangoSemanaAdmin = computed(() => {
  const dias = diasSemanaAdmin.value
  if (!dias.length) return ''
  const primera = new Date(`${dias[0].clave}T00:00:00`)
  const ultima = new Date(`${dias[6].clave}T00:00:00`)
  const opciones = { day: '2-digit', month: 'short' }
  return `${primera.toLocaleDateString('es-AR', opciones)} — ${ultima.toLocaleDateString('es-AR', opciones)}`
})


const mesCalendarioAdmin = computed(() => {
  const fecha = new Date(semanaAdminActual.value)
  return {
    mes: fecha.getMonth(),
    anio: fecha.getFullYear(),
    nombre: fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  }
})

const diasMesCalendarioAdmin = computed(() => {
  const { mes, anio } = mesCalendarioAdmin.value
  const primerDia = new Date(anio, mes, 1)
  const ultimoDia = new Date(anio, mes + 1, 0)
  const offset = (primerDia.getDay() + 6) % 7
  const totalCeldas = Math.ceil((offset + ultimoDia.getDate()) / 7) * 7

  return Array.from({ length: totalCeldas }, (_, indice) => {
    const fecha = new Date(anio, mes, indice - offset + 1)
    const clave = obtenerFechaLocalAdmin(fecha)
    const esDelMes = fecha.getMonth() === mes
    const tareas = tareasPendientesAdmin.value.filter(tarea => tarea.fecha === clave)
    const fechaHoy = obtenerFechaLocalAdmin()
    return {
      clave,
      numero: fecha.getDate(),
      esDelMes,
      esHoy: clave === fechaHoy,
      seleccionado: clave === diaCalendarioSeleccionado.value,
      tareas,
      cantidadTareas: tareas.length,
      tieneAlta: tareas.some(tarea => prioridadTareaAdmin(tarea).valor === 3)
    }
  })
})

const tareasDiaCalendarioSeleccionado = computed(() => {
  const clave = diaCalendarioSeleccionado.value || obtenerFechaLocalAdmin()
  return tareasPendientesAdmin.value.filter(tarea => tarea.fecha === clave)
})

const fechaSeleccionadaCalendarioAdmin = computed(() => {
  const clave = diaCalendarioSeleccionado.value || obtenerFechaLocalAdmin()
  return formatearFechaTareaAdmin(clave)
})

const seleccionarDiaCalendarioAdmin = (clave) => {
  diaCalendarioSeleccionado.value = clave
}

const cambiarMesCalendarioAdmin = (direccion) => {
  const fecha = new Date(semanaAdminActual.value)
  fecha.setDate(1)
  fecha.setMonth(fecha.getMonth() + direccion)
  semanaAdminActual.value = fecha
  const hoy = obtenerFechaLocalAdmin()
  const mesActual = new Date()
  const esMesActual = fecha.getMonth() === mesActual.getMonth() && fecha.getFullYear() === mesActual.getFullYear()
  diaCalendarioSeleccionado.value = esMesActual ? hoy : obtenerFechaLocalAdmin(fecha)
}

const irAlMesActualAdmin = () => {
  const hoy = new Date()
  semanaAdminActual.value = hoy
  diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin(hoy)
}

const cambiarVistaCalendarioAdmin = (vista) => {
  vistaCalendarioAdmin.value = vista
  if (vista === 'mes') {
    if (!diaCalendarioSeleccionado.value) diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin()
  }
}

const prioridadTareaAdmin = (tarea) => {
  const prioridad = String(tarea?.prioridad || 'media').toLowerCase()
  if (prioridad === 'alta') return { texto: '🔴 PRIORIDAD ALTA', icono: '🔴', clase: 'calendar-priority-alta', valor: 3 }
  if (prioridad === 'baja') return { texto: '⚪ PRIORIDAD BAJA', icono: '⚪', clase: 'calendar-priority-baja', valor: 1 }
  return { texto: '🟠 PRIORIDAD MEDIA', icono: '🟠', clase: 'calendar-priority-media', valor: 2 }
}

const tareasPendientesAdmin = computed(() => {
  return tareasAdmin.value
    .filter(tarea => !tarea.completada)
    .sort((a, b) => {
      const prioridad = prioridadTareaAdmin(b).valor - prioridadTareaAdmin(a).valor
      if (prioridad !== 0) return prioridad
      const aFecha = new Date(`${a.fecha}T${a.hora || '23:59'}`).getTime()
      const bFecha = new Date(`${b.fecha}T${b.hora || '23:59'}`).getTime()
      return aFecha - bFecha
    })
})

const tareasCompletadasAdmin = computed(() => {
  return tareasAdmin.value
    .filter(tarea => tarea.completada)
    .sort((a, b) => {
      const aFecha = new Date(a.completadaEn || `${a.fecha}T${a.hora || '23:59'}`).getTime()
      const bFecha = new Date(b.completadaEn || `${b.fecha}T${b.hora || '23:59'}`).getTime()
      return bFecha - aFecha
    })
})

const tareasProximasAdmin = computed(() => tareasPendientesAdmin.value)

const tareasPendientesPorDiaAdmin = (clave) => {
  return tareasPendientesAdmin.value.filter(tarea => tarea.fecha === clave)
}

const estadoTareaAdmin = (tarea) => {
  const ahora = new Date()
  const fechaTarea = new Date(`${tarea.fecha}T${tarea.hora || '23:59'}`)
  const diferencia = fechaTarea.getTime() - ahora.getTime()
  const horas = diferencia / 3600000

  if (diferencia < 0) return { texto: 'ATRASADA', clase: 'calendar-task-overdue' }
  if (horas <= 24) return { texto: 'HOY / MUY PRÓXIMA', clase: 'calendar-task-urgent' }
  if (horas <= 48) return { texto: 'PRÓXIMA', clase: 'calendar-task-soon' }
  return { texto: 'PROGRAMADA', clase: 'calendar-task-normal' }
}

const formatearFechaTareaAdmin = (valor) => {
  if (!valor) return 'Sin fecha'
  const fecha = new Date(`${normalizarFechaTareaAdmin(valor)}T00:00:00`)
  if (Number.isNaN(fecha.getTime())) return String(valor)
  return fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const limpiarFormTareaAdmin = (fecha = '') => {
  formTareaAdmin.value = {
    titulo: '',
    fecha: fecha || obtenerFechaLocalAdmin(),
    hora: '',
    lugar: '',
    descripcion: '',
    prioridad: 'media',
    completada: false,
    completadaEn: null
  }
}

const abrirCalendarioAdmin = () => {
  adminTab.value = 'calendario'
  if (!tareasAdmin.value.length) cargarTareasAdminLocal()
  if (!diaCalendarioSeleccionado.value) diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin()
}

const abrirNuevaTareaAdmin = (fecha = '') => {
  tareaAdminEditando.value = null
  limpiarFormTareaAdmin(fecha)
  modalTareaAdmin.value = true
}

const abrirEditarTareaAdmin = (tarea) => {
  tareaAdminEditando.value = tarea
  formTareaAdmin.value = { ...tarea }
  modalTareaAdmin.value = true
}

const cerrarModalTareaAdmin = () => {
  modalTareaAdmin.value = false
  tareaAdminEditando.value = null
}

const guardarTareaAdmin = () => {
  const titulo = String(formTareaAdmin.value.titulo || '').trim()
  const fecha = normalizarFechaTareaAdmin(formTareaAdmin.value.fecha)

  if (!titulo) {
    triggerAlert('Escribí un título para la tarea.', 'error')
    return
  }

  if (!fecha || Number.isNaN(new Date(`${fecha}T00:00:00`).getTime())) {
    triggerAlert('Seleccioná una fecha válida para la tarea.', 'error')
    return
  }

  const datos = {
    ...formTareaAdmin.value,
    titulo,
    fecha,
    hora: String(formTareaAdmin.value.hora || '').trim(),
    lugar: String(formTareaAdmin.value.lugar || '').trim(),
    descripcion: String(formTareaAdmin.value.descripcion || '').trim(),
    prioridad: ['alta', 'media', 'baja'].includes(String(formTareaAdmin.value.prioridad)) ? String(formTareaAdmin.value.prioridad) : 'media'
  }

  const estabaEditando = Boolean(tareaAdminEditando.value)

  if (tareaAdminEditando.value) {
    const indice = tareasAdmin.value.findIndex(tarea => tarea.id === tareaAdminEditando.value.id)
    if (indice !== -1) tareasAdmin.value[indice] = { ...tareasAdmin.value[indice], ...datos }
  } else {
    tareasAdmin.value.push({
      ...datos,
      id: `tarea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      completada: false,
      completadaEn: null,
      creadaEn: new Date().toISOString()
    })
  }

  guardarTareasAdminLocal()
  cerrarModalTareaAdmin()
  semanaAdminActual.value = new Date(`${fecha}T00:00:00`)
  triggerAlert(estabaEditando ? 'Tarea actualizada correctamente.' : 'Tarea guardada en el calendario.', 'success')
}

const completarTareaAdmin = () => {
  if (!tareaAdminEditando.value) return
  const indice = tareasAdmin.value.findIndex(tarea => tarea.id === tareaAdminEditando.value.id)
  if (indice === -1) return

  tareasAdmin.value[indice] = {
    ...tareasAdmin.value[indice],
    completada: true,
    completadaEn: new Date().toISOString()
  }

  guardarTareasAdminLocal()
  cerrarModalTareaAdmin()
  triggerAlert('Tarea completada. Quedó guardada en el historial.', 'success')
}

const eliminarTareaAdmin = () => {
  if (!tareaAdminEditando.value) return
  if (!confirm(`¿Eliminar la tarea "${tareaAdminEditando.value.titulo}"?`)) return

  tareasAdmin.value = tareasAdmin.value.filter(tarea => tarea.id !== tareaAdminEditando.value.id)
  guardarTareasAdminLocal()
  cerrarModalTareaAdmin()
  triggerAlert('Tarea eliminada.', 'success')
}

const cambiarSemanaAdmin = (direccion) => {
  const nueva = new Date(inicioSemanaAdmin.value)
  nueva.setDate(nueva.getDate() + (direccion * 7))
  semanaAdminActual.value = nueva
  diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin(nueva)
}

const irASemanaActualAdmin = () => {
  semanaAdminActual.value = new Date()
  diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin()
}

const clientesFiltradosYOrdenados = computed(() => {
  if (!filtroBusquedaClientes.value.trim()) return clientes.value
  const query = filtroBusquedaClientes.value.toLowerCase().trim()
  return clientes.value.filter(c => (c.nombre || '').toLowerCase().includes(query))
})

const filtrarPorCliente = (cliente) => {
  clienteFiltrado.value = cliente
  correoFiltroActivo.value = cliente.email
  mostrarTodosRegistrosCliente.value = false
  registroVistaPrevia.value = null
  paginaActual.value = 1
}

const limpiarFiltroCliente = () => {
  clienteFiltrado.value = null
  correoFiltroActivo.value = ''
  mostrarTodosRegistrosCliente.value = false
  registroVistaPrevia.value = null
  paginaActual.value = 1
}

const pedidosFiltradosPorFecha = computed(() => {
  let resultado = pedidos.value

  if (clienteFiltrado.value) {

    const emailCliente = (clienteFiltrado.value.email || '').trim().toLowerCase()
    resultado = resultado.filter(p => {
      const pEmail = (p.email || '').trim().toLowerCase()
      return emailCliente && pEmail === emailCliente
    })
  }


  if (!mostrarTodosRegistrosCliente.value) {
    resultado = resultado.filter(p => String(p.estado || 'Pendiente').trim().toLowerCase() !== 'completado')
  }

  return resultado
})

const pedidosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  return pedidosFiltradosPorFecha.value.slice(inicio, fin)
})

const verTodosLosRegistrosCliente = () => {
  if (!clienteFiltrado.value) return
  mostrarTodosRegistrosCliente.value = true
  paginaActual.value = 1
  registroVistaPrevia.value = null
}

const obtenerItemsPreview = (registro) => {
  if (!registro) return []

  let items = registro.items
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items)
    } catch {
      items = []
    }
  }

  const lista = Array.isArray(items) ? items : []
  if (lista.length) {
    return lista.map((item, index) => ({
      ...item,
      producto_id: item.producto_id ?? item.productoId ?? item.id ?? registro.producto_id ?? index,
      nombre: item.nombre || item.producto_nombre || item.producto || 'Producto',
      codigo: item.codigo || item.codigo_producto || '',
      unidades: Number(item.unidades || item.cantidad || item.qty || 1),
      imagen: item.imagen || registro.imagen || '',
      color: item.color || registro.color || '',
      medida: item.medida || registro.medida || ''
    }))
  }

  const nombreFallback = registro.producto || registro.pedido || 'Producto'
  const unidadesFallback = Number(registro.unidades || registro.cantidad_unidades || registro.qty || 1)

  if (registro.producto_id || registro.producto || registro.pedido || registro.unidades || registro.cantidad_unidades) {
    return [{
      producto_id: registro.producto_id ?? registro.id ?? 0,
      nombre: nombreFallback,
      codigo: registro.codigo || '',
      unidades: unidadesFallback,
      imagen: registro.imagen || '',
      color: registro.color || '',
      medida: registro.medida || ''
    }]
  }

  return []
}

const abrirPreviewRegistro = (registro) => {
  if (!registro) return

  // Los registros que devuelve /todos-pedidos ya vienen agrupados por factura
  // y contienen TODOS los productos de esa compra en registro.items.
  // Por eso la vista previa se arma directamente con esos datos, sin depender
  // de otra petición que pueda fallar o dejar la ventana sin abrir.
  const registroId = registro.factura_id ?? registro.id ?? registro.pedido_id
  const items = obtenerItemsPreview(registro)

  registroVistaPrevia.value = {
    ...registro,
    id: registroId ?? null,
    items,
    cantidad_productos: items.length,
    cantidad_unidades: items.reduce(
      (sum, item) => sum + Number(item.unidades || item.cantidad || item.qty || 1),
      0
    ),
    cargandoDetalle: false
  }
}

const formatearFechaRegistro = (valor) => {
  if (!valor) return 'Sin registrar'
  const fecha = convertirFechaCalendario(valor)
  if (Number.isNaN(fecha.getTime())) return String(valor)
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const asignacionMasivaTexto = ref('')
const asignacionMasivaArchivo = ref(null)
const asignacionMasivaPreview = ref('')
const asignandoImagenMasiva = ref(false)

const productosCoincidentesImagenMasiva = computed(() => {
  const termino = normalizarTextoCategoria(asignacionMasivaTexto.value.trim())
  if (!termino) return []
  return productos.value.filter((producto) => {
    const nombre = normalizarTextoCategoria(producto?.nombre || '')
    return nombre.includes(termino)
  })
})

const seleccionarImagenMasiva = (event) => {
  const archivo = event?.target?.files?.[0] || null
  asignacionMasivaArchivo.value = archivo

  if (asignacionMasivaPreview.value) {
    URL.revokeObjectURL(asignacionMasivaPreview.value)
    asignacionMasivaPreview.value = ''
  }

  if (archivo) {
    asignacionMasivaPreview.value = URL.createObjectURL(archivo)
  }
}

const asignarImagenMasiva = async () => {
  const termino = asignacionMasivaTexto.value.trim()
  const archivo = asignacionMasivaArchivo.value

  if (!termino) {
    triggerAlert('Ingresá qué nombre querés buscar.', 'error')
    return
  }

  if (!archivo) {
    triggerAlert('Seleccioná una imagen.', 'error')
    return
  }

  const coincidencias = productosCoincidentesImagenMasiva.value
  if (!coincidencias.length) {
    triggerAlert(`No hay productos que coincidan con "${termino}".`, 'error')
    return
  }

  const confirmado = confirm(
    `Se encontraron ${coincidencias.length} producto${coincidencias.length === 1 ? '' : 's'} que contienen "${termino}".\n\n` +
    'La imagen seleccionada reemplazará la imagen actual de todos ellos.\n\n¿Continuar?'
  )
  if (!confirmado) return

  asignandoImagenMasiva.value = true

  try {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append('termino', termino)
    formData.append('imagen', archivo)
    formData.append('sobrescribir', 'true')

    const res = await fetch(`${API}/productos/asignar-imagen-masiva`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'No se pudieron actualizar los productos')
    }

    await loadProducts()
    await loadAdmin(true)

    triggerAlert(
      `Imagen asignada a ${data.actualizados ?? coincidencias.length} producto${(data.actualizados ?? coincidencias.length) === 1 ? '' : 's'}.`,
      'success'
    )

    asignacionMasivaArchivo.value = null
    if (asignacionMasivaPreview.value) {
      URL.revokeObjectURL(asignacionMasivaPreview.value)
      asignacionMasivaPreview.value = ''
    }
  } catch (e) {
    triggerAlert(e.message || 'Error al asignar la imagen masivamente', 'error')
  } finally {
    asignandoImagenMasiva.value = false
  }
}

const nuevoProducto = ref({
  nombre: '',
  codigo: '',
  tieneCodigo: false,
  precio: null,
  color: '',
  medida: '',
  categoria: 'vinilos',
  stock: null,
  imagen: ''
})
const creandoProducto = ref(false)

const paginaAnterior = () => { if (paginaActual.value > 1) paginaActual.value-- }
const paginaSiguiente = () => {
  const total = Math.ceil(pedidosFiltradosPorFecha.value.length / itemsPorPagina)
  if (paginaActual.value < total) paginaActual.value++
}


const paginaActualAdminProductos = ref(1)
const productosAdminPorPagina = 10
const categoriaAdminSeleccionada = ref('todos')

const productosFiltradosAdmin = computed(() => {
  const categoria = categoriaAdminSeleccionada.value

  return productos.value.filter((producto) => {
    const texto = normalizarTextoCategoria(
      `${producto.categoria || ''} ${producto.nombre || ''}`
    )

    if (/transferencia/.test(texto)) return false
    if (categoria === 'todos') return true
    if (categoria === 'vinilos') return /vinilo|corte/.test(texto)
    if (categoria === 'impresiones') return /impresion/.test(texto)
    if (categoria === 'pisos') return /piso|adhesivo/.test(texto)

    return true
  })
})

const totalPaginasAdminProductos = computed(() =>
  Math.max(
    1,
    Math.ceil(
      productosFiltradosAdmin.value.length / productosAdminPorPagina
    )
  )
)

const productosAdminPaginados = computed(() => {
  const inicio =
    (paginaActualAdminProductos.value - 1) * productosAdminPorPagina

  return productosFiltradosAdmin.value.slice(
    inicio,
    inicio + productosAdminPorPagina
  )
})

const stockCategorias = [
  { valor: 'vinilos', label: 'Vinilos de corte' },
  { valor: 'impresiones', label: 'Impresiones' },
  { valor: 'pisos', label: 'Pisos adhesivos' }
]

const stockCategoriaSeleccionada = ref('vinilos')
const paginaStockActual = ref(1)
const stockPorPagina = 10

const productosStockCategoria = computed(() => {
  const categoria = stockCategoriaSeleccionada.value

  return productos.value.filter((producto) => {
    const texto = normalizarTextoCategoria(`${producto.categoria || ''} ${producto.nombre || ''}`)

    if (categoria === 'vinilos') return /vinilo|corte/.test(texto)
    if (categoria === 'impresiones') return /impresion/.test(texto)
    if (categoria === 'pisos') return /piso|adhesivo/.test(texto)

    return true
  })
})

const totalPaginasStock = computed(() => Math.max(1, Math.ceil(productosStockCategoria.value.length / stockPorPagina)))

const productosStockPaginaActual = computed(() => {
  const inicio = (paginaStockActual.value - 1) * stockPorPagina
  return productosStockCategoria.value.slice(inicio, inicio + stockPorPagina)
})

const paginaStockAnterior = () => {
  if (paginaStockActual.value > 1) paginaStockActual.value--
}

const paginaStockSiguiente = () => {
  if (paginaStockActual.value < totalPaginasStock.value) paginaStockActual.value++
}

watch(stockCategoriaSeleccionada, () => {
  paginaStockActual.value = 1
})

const cambiarCategoriaAdminProductos = (categoria) => {
  categoriaAdminSeleccionada.value = categoria
  paginaActualAdminProductos.value = 1
}


const paginaPrimeraAdminProductos = () => {
  paginaActualAdminProductos.value = 1
}


const paginaUltimaAdminProductos = () => {
  paginaActualAdminProductos.value = totalPaginasAdminProductos.value
}


const paginaAnteriorAdminProductos = () => {
  if (paginaActualAdminProductos.value > 1) {
    paginaActualAdminProductos.value--
  }
}


const paginaSiguienteAdminProductos = () => {
  if (paginaActualAdminProductos.value < totalPaginasAdminProductos.value) {
    paginaActualAdminProductos.value++
  }
}



const paginaActualClienteProductos = ref(1)
const productosClientePorPagina = 12
const categoriaSeleccionada = ref('todos')
const categoriasCliente = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'vinilos', label: 'Vinilos de corte' },
  { valor: 'impresiones', label: 'Impresiones' },
  { valor: 'pisos', label: 'Pisos adhesivos' }
]

const normalizarTextoCategoria = (valor) => String(valor ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const productosFiltradosCliente = computed(() => {
  const categoria = categoriaSeleccionada.value
  return productos.value.filter((producto) => {
    const texto = normalizarTextoCategoria(`${producto.categoria || ''} ${producto.nombre || ''}`)
    if (/transferencia/.test(texto)) return false
    if (categoria === 'todos') return true
    if (categoria === 'vinilos') return /vinilo|corte/.test(texto)
    if (categoria === 'impresiones') return /impresion/.test(texto)
    if (categoria === 'pisos') return /piso|adhesivo/.test(texto)
    return true
  })
})

const totalPaginasClienteProductos = computed(() => Math.max(1, Math.ceil(productosFiltradosCliente.value.length / productosClientePorPagina)))
const productosPaginadosCliente = computed(() => {
  const inicio = (paginaActualClienteProductos.value - 1) * productosClientePorPagina
  return productosFiltradosCliente.value.slice(inicio, inicio + productosClientePorPagina)
})

const productosPaginadosCarrito = computed(() => {
  const inicio = (paginaActualClienteProductos.value - 1) * productosClientePorPagina
  return productos.value.slice(inicio, inicio + productosClientePorPagina)
})

const paginaPrimeraClienteProductos = () => {
  paginaActualClienteProductos.value = 1
}

const paginaUltimaClienteProductos = () => {
  paginaActualClienteProductos.value = totalPaginasClienteProductos.value
}

const paginaSiguienteClienteProductos = () => {
  if (paginaActualClienteProductos.value < totalPaginasClienteProductos.value) {
    paginaActualClienteProductos.value++
  }
}

const paginaAnteriorClienteProductos = () => {
  if (paginaActualClienteProductos.value > 1) {
    paginaActualClienteProductos.value--
  }
}

watch(categoriaSeleccionada, () => {
  paginaActualClienteProductos.value = 1
})

watch(categoriaAdminSeleccionada, () => {
  paginaActualAdminProductos.value = 1
})

const fechaEntregaRequerida = ref('')
const ahoraParaInput = new Date()
const pad2 = (n) => String(n).padStart(2, '0')
const formatearParaFechaInput = (fecha) => `${fecha.getFullYear()}-${pad2(fecha.getMonth() + 1)}-${pad2(fecha.getDate())}`
const minFechaPermitida = ref(formatearParaFechaInput(ahoraParaInput))

const convertirFechaCalendario = (valor) => {
  if (valor instanceof Date) return valor

  const texto = String(valor ?? '').trim()
  const coincidencia = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/)
  if (coincidencia) {
    return new Date(
      Number(coincidencia[1]),
      Number(coincidencia[2]) - 1,
      Number(coincidencia[3])
    )
  }

  return new Date(valor)
}

const formatearFechaMensaje = () => new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const formatearFechaRequerida = (valor) => {
  if (!valor) return 'Sin fecha'
  const fecha = convertirFechaCalendario(valor)
  if (Number.isNaN(fecha.getTime())) return String(valor)
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const codigoConsultaRapida = ref('')
const codigoConsultaRapidaBuscado = ref('')
const productoConsultaRapida = ref(null)

const normalizarCodigoProducto = (valor) => String(valor ?? '').trim().replace(/\s+/g, '').toLowerCase()

const modalComprarYaShow = ref(false)
const modalComprarYaProductos = ref([])
const modalComprarYaMensaje = ref('')
const modalComprarYaFecha = ref('')

// Estado de la pantalla de transición antes de abrir WhatsApp.
const redireccionandoWhatsApp = ref(false)
const redireccionWhatsAppTipo = ref('pedido')
let redireccionWhatsAppTimer = null

const mostrarRedireccionWhatsApp = (url, tipo = 'pedido') => {
  if (!url) return

  if (redireccionWhatsAppTimer) {
    clearTimeout(redireccionWhatsAppTimer)
    redireccionWhatsAppTimer = null
  }

  redireccionWhatsAppTipo.value = tipo
  redireccionandoWhatsApp.value = true

  // Dejamos que la pantalla se vea antes de cambiar a WhatsApp.
  redireccionWhatsAppTimer = setTimeout(() => {
    window.location.href = url
    redireccionWhatsAppTimer = null
  }, 1400)
}

const buscarProductoPorCodigo = () => {
  const codigo = String(codigoConsultaRapida.value || '').trim()
  codigoConsultaRapidaBuscado.value = codigo
  productoConsultaRapida.value = null

  if (!codigo) {
    triggerAlert('Ingresá el código del producto.', 'error')
    return
  }

  const codigoNormalizado = normalizarCodigoProducto(codigo)
  const encontrado = productos.value.find(p => normalizarCodigoProducto(p.codigo) === codigoNormalizado)

  if (!encontrado) {
    triggerAlert(`No se encontró ningún producto con el código ${codigo}.`, 'error')
    return
  }

  productoConsultaRapida.value = { ...encontrado, qty: 1 }
}

const limpiarResultadoSiVacio = () => {
  if (!String(codigoConsultaRapida.value || '').trim()) {
    productoConsultaRapida.value = null
    codigoConsultaRapidaBuscado.value = ''
  }
}

const agregarProductoConsultaRapida = (producto) => {
  if (!producto) return

  const productosConsulta = Array.isArray(modalComprarYaProductos.value) ? [...modalComprarYaProductos.value] : []
  const stockDisponible = Number(producto.stock || 0)
  const existente = productosConsulta.find(p => Number(p.id) === Number(producto.id))

  if (existente) {
    const nuevaCantidad = Number(existente.qty || 1) + 1
    if (stockDisponible > 0 && nuevaCantidad > stockDisponible) {
      triggerAlert(`Solo hay ${stockDisponible} unidades disponibles de ${producto.nombre}.`, 'error')
      return
    }
    existente.qty = nuevaCantidad
  } else {
    const cantidadInicial = Math.min(1, Math.max(1, Number(producto.qty || 1)))
    if (stockDisponible > 0 && cantidadInicial > stockDisponible) {
      triggerAlert(`Solo hay ${stockDisponible} unidades disponibles de ${producto.nombre}.`, 'error')
      return
    }
    productosConsulta.push({ ...producto, qty: cantidadInicial })
  }

  modalComprarYaProductos.value = productosConsulta
  modalComprarYaShow.value = true
  modalComprarYaFecha.value = modalComprarYaFecha.value || fechaEntregaRequerida.value || ''

  productoConsultaRapida.value = null
  codigoConsultaRapida.value = ''
  codigoConsultaRapidaBuscado.value = ''
  triggerAlert(`${producto.nombre} agregado a la consulta.`, 'success')
}

const agregarProductoAlCarritoDesdeBusqueda = (producto) => {
  if (!producto) return

  const stock = Number(producto.stock || 0)
  if (stock <= 0) {
    triggerAlert(`No hay stock disponible de ${producto.nombre}.`, 'error')
    return
  }

  const itemCarrito = cart.value.find(item => Number(item.id) === Number(producto.id))
  const cantidadActual = Number(itemCarrito?.qty || 0)
  const cantidadNueva = cantidadActual + 1

  if (cantidadNueva > stock) {
    triggerAlert(`Solo hay ${stock} unidades disponibles de ${producto.nombre}.`, 'error')
    return
  }

  if (itemCarrito) {
    itemCarrito.qty = cantidadNueva
  } else {
    cart.value.push({ ...producto, qty: 1 })
  }

  triggerAlert(`${producto.nombre} agregado al carrito.`, 'success')
  productoConsultaRapida.value = null
  codigoConsultaRapida.value = ''
  codigoConsultaRapidaBuscado.value = ''
}

const abrirConsultaCliente = (producto) => {
  if (!producto) return

  // Abrimos la consulta de forma atómica para evitar que el modal quede sin mostrar.
  const cantidad = Math.max(1, Number(producto.qty || 1))
  modalComprarYaShow.value = true
  modalComprarYaProductos.value = [{ ...producto, qty: cantidad }]
  modalComprarYaMensaje.value = ''
  modalComprarYaFecha.value = fechaEntregaRequerida.value || ''

  // Dejamos el código libre para poder agregar otro producto dentro del modal.
  codigoConsultaRapida.value = ''
  codigoConsultaRapidaBuscado.value = ''
  productoConsultaRapida.value = null
}

// Compatibilidad con cualquier parte del template/código que todavía llame al nombre anterior.
const abrirModalComprarYa = abrirConsultaCliente

const aumentarCantidadConsulta = (producto) => {
  const max = Number(producto.stock || 0)
  if (max > 0 && Number(producto.qty || 1) >= max) return triggerAlert(`No podés superar el stock de ${max} unidades de ${producto.nombre}.`, 'error')
  producto.qty = Number(producto.qty || 1) + 1
}
const disminuirCantidadConsulta = (producto) => { producto.qty = Math.max(1, Number(producto.qty || 1) - 1) }
const eliminarProductoConsulta = (producto) => {
  modalComprarYaProductos.value = modalComprarYaProductos.value.filter(p => Number(p.id) !== Number(producto.id))
}

const agregarCodigoDesdeModal = () => {
  const codigo = String(codigoConsultaRapida.value || '').trim()
  if (!codigo) { triggerAlert('Ingresá un código para buscar otro producto.', 'error'); return }

  const codigoNormalizado = normalizarCodigoProducto(codigo)
  const encontrado = productos.value.find(p => normalizarCodigoProducto(p.codigo) === codigoNormalizado)
  codigoConsultaRapidaBuscado.value = codigo

  if (!encontrado) {
    triggerAlert(`No se encontró ningún producto con el código ${codigo}.`, 'error')
    return
  }

  agregarProductoConsultaRapida(encontrado)
}

const enviarConsultaWhatsApp = () => {
  if (redireccionandoWhatsApp.value) return

  const lista = Array.isArray(modalComprarYaProductos.value) ? modalComprarYaProductos.value : []
  if (!lista.length) {
    triggerAlert('Agregá al menos un producto a la consulta.', 'error')
    return
  }

  const nota = (modalComprarYaMensaje.value || '').trim()
  const fecha = modalComprarYaFecha.value || fechaEntregaRequerida.value || ''
  const TELEFONO_WHATSAPP = '5493564652137'
  const fechaConsulta = formatearFechaMensaje()

  let mensaje = `Hola! Quisiera consultar por los siguientes productos:\n\n`
  lista.forEach((p, index) => {
    mensaje += `*${index + 1}. ${p.nombre || p.producto}*\n`
    if (p.codigo) mensaje += `Código: ${p.codigo}\n`
    mensaje += `Cantidad: ${Number(p.qty || 1)}\n`
    if (p.color) mensaje += `Color: ${p.color}\n`
    if (p.medida) mensaje += `Medida: ${p.medida}\n`
    mensaje += `\n`
  })

  mensaje += `📅 *Fecha de la consulta:* ${fechaConsulta}\n`
  if (fecha) mensaje += `📅 *Fecha requerida:* ${formatearFechaRequerida(fecha)}\n`
  if (nota) mensaje += `📝 *Consulta/Detalle:* ${nota}\n`
  mensaje += `\n¿Tienen disponibilidad / tiempo de entrega?`

  const urlWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`

  modalComprarYaShow.value = false
  modalComprarYaFecha.value = ''
  mostrarRedireccionWhatsApp(urlWhatsApp, 'consulta')
}


const notification = ref({ show: false, message: '', type: 'success' })
const triggerAlert = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => { notification.value.show = false }, 4000)
}

const resolverImagen = (imagen) => {
  if (!imagen || imagen === 'null' || imagen === 'undefined' || typeof imagen !== 'string' || !imagen.trim()) {
    return 'https://placehold.co/100x100/1a1a1a/cccccc?text=Sin+Foto'
  }
  if (imagen.includes('localhost:5000/uploads/')) {
    imagen = imagen.replace('localhost:5000/uploads/', 'localhost:5000/static/uploads/')
  }
  if (imagen.includes('localhost:5000')) {
    imagen = imagen.replace(/^https?:\/\/localhost:5000/, '')
  }
  if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('data:image')) {
    return imagen
  }
  const rutaLimpia = imagen.startsWith('/') ? imagen.slice(1) : imagen
  return API_URL ? `${API_URL}/static/uploads/${rutaLimpia}` : `/static/uploads/${rutaLimpia}`
}

const manejarErrorImagen = (e) => {
  e.target.onerror = null
  e.target.src = 'https://placehold.co/100x100/1a1a1a/cccccc?text=Sin+Foto'
}

const getAuthToken = () => {
  let token = localStorage.getItem('token')
  if (!token) {
    try {
      const sesion = localStorage.getItem('sesion_usuario')
      if (sesion) {
        const parsed = JSON.parse(sesion)
        token = parsed.token || parsed.user?.token || ''
      }
    } catch (e) {
      console.warn('No se pudo leer la sesión guardada:', e)
    }
  }
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1)
  }
  return token || ''
}

const isAdmin = computed(() => (user.value?.role || '').trim().toLowerCase() === 'admin')
const pedidosPorVencer = computed(() => {
  if (!Array.isArray(pedidos.value)) return []
  return pedidos.value.filter(p => {
    const estado = String(p.estado || '').trim().toLowerCase()
    const dias = Number(p.diasRestantes ?? 999)
    return estado !== 'completado' && estado !== 'cancelado' && dias <= 2 && Boolean(p.fecha_entrega)
  }).slice(0, 8)
})

const imagenesBackup = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
]

const formatearFechaEntrega = (valor) => {
  if (!valor) return 'Sin fecha'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return 'Sin fecha'
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatearPrecio = (valor) => {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero <= 0) return 'Consultar precio'
  return `$${numero.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const procesarMetadatosPedido = (ped) => {
  // El backend es la fuente de verdad del estado. Cualquier valor distinto
  // de Completado se trata como Pendiente para evitar falsos completados.
  const estadoNormalizado = String(ped?.estado || '').trim().toLowerCase() === 'completado'
    ? 'Completado'
    : 'Pendiente'

  if (ped.diasRestantes !== undefined) {
    const entrega = ped.fecha_entrega ? convertirFechaCalendario(ped.fecha_entrega) : null
    return {
      ...ped,
      estado: estadoNormalizado,
      fechaEntregaFormateada: entrega && !Number.isNaN(entrega.getTime())
        ? formatearFechaEntrega(entrega)
        : (ped.fechaEntregaFormateada || 'Sin fecha')
    }
  }
  const hoy = new Date()
  let dias = 0
  let fechaEntregaFormateada = 'Sin fecha'
  if (ped.fecha_entrega) {
    const entrega = convertirFechaCalendario(ped.fecha_entrega)
    if (!Number.isNaN(entrega.getTime())) {
      const diff = entrega.getTime() - hoy.getTime()
      dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
      fechaEntregaFormateada = formatearFechaEntrega(entrega)
    }
  }
  return { ...ped, estado: estadoNormalizado, diasRestantes: dias, fechaEntregaFormateada }
}

const loadProducts = async () => {
  if (isLoadingProducts.value) return
  isLoadingProducts.value = true
  try {
    const res = await fetch(`${API}/productos`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    productos.value = data.map((prod, index) => ({
      ...prod,
      tieneCodigo: Boolean(String(prod.codigo ?? '').trim()),
      qty: 1,
      precio: Number(prod.precio ?? prod.precio_unitario ?? 0) || 0,
      stock: Number(prod.stock ?? 0) || 0,
      imagen: resolverImagen(prod.imagen) || imagenesBackup[index % imagenesBackup.length]
    }))
  } catch (e) {
    console.error("Error al traer productos:", e)
  } finally {
    isLoadingProducts.value = false
  }
}

const startCarousel = () => {
  stopCarousel()
  if (carouselItems.value.length <= 1) return
  carouselInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length
  }, 4500)
}

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

const nextSlide = () => { if (carouselItems.value.length) currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length }
const prevSlide = () => { if (carouselItems.value.length) currentSlide.value = (currentSlide.value - 1 + carouselItems.value.length) % carouselItems.value.length }

const loadCarousel = async () => {
  try {
    const res = await fetch(`${API}/carousel`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    carouselItems.value = Array.isArray(data) ? data.map(item => ({
      ...item,
      imagen: resolverImagen(item.imagen) || imagenesBackup[0]
    })) : []
    currentSlide.value = 0
    startCarousel()
  } catch {
    carouselItems.value = []
  }
}

const loadPedidosGlobales = async () => {
  try {
    const token = getAuthToken()
    if (!token) return
    const endpoint = isAdmin.value ? `${API}/todos-pedidos` : `${API}/mis-pedidos-usuario`
    const res = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      pedidos.value = Array.isArray(data) ? data.map(p => procesarMetadatosPedido(p)) : []
    }
  } catch (e) {
    console.error("Error al cargar pedidos:", e)
  }
}

const loadAdmin = async (force = false) => {
  if (isRefreshingAdmin.value && !force) return
  const now = Date.now()
  if (!force && now - lastAdminRefresh < 45000) return
  isRefreshingAdmin.value = true

  try {
    const token = getAuthToken()
    if (!token) return
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    const [pRes, fRes] = await Promise.all([
      fetch(`${API}/todos-pedidos`, { method: 'GET', headers }),
      fetch(`${API}/facturas`, { method: 'GET', headers })
    ])
    
    if (pRes.ok) {
      const pedidosData = await pRes.json()
      pedidos.value = Array.isArray(pedidosData) ? pedidosData.map(ped => procesarMetadatosPedido(ped)) : []
    }
    if (fRes.ok) {
      const facturasData = await fRes.json()
      facturas.value = Array.isArray(facturasData) ? facturasData : []
    }

    lastAdminRefresh = now
  } catch (e) {
    console.error("Error en loadAdmin:", e)
  } finally {
    isRefreshingAdmin.value = false
  }
}

let realtimeInterval = null
const startRealtimeUpdates = () => {
  if (realtimeInterval) clearInterval(realtimeInterval)

  realtimeInterval = setInterval(async () => {
    if (document.hidden) return

    await Promise.allSettled([
      loadProducts(),
      loadPedidosGlobales(),
      isAdmin.value ? loadAdmin(true) : Promise.resolve()
    ])
  }, 30000)
}

onMounted(async () => {
  try {
    const sesion = localStorage.getItem('sesion_usuario')
    if (!sesion) { router.push('/clientes'); return }
    const parsedSession = JSON.parse(sesion)
    user.value = parsedSession.user || parsedSession

    if (isAdmin.value) cargarTareasAdminLocal()

    await Promise.allSettled([loadProducts(), loadPedidosGlobales(), loadCarousel()])

    if (isAdmin.value) {
      await loadAdmin(true)
      startRealtimeUpdates()
      const token = getAuthToken()
      if (token) {
        fetch(`${API}/clientes`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : [])
          .then(d => { clientes.value = Array.isArray(d) ? d : [] })
      }
    }
  } catch (error) {
    console.error("Error al inicializar:", error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (realtimeInterval) clearInterval(realtimeInterval)
  stopCarousel()
  clearTimeout(searchDebounceTimer)
})

const marcarPedidoCompletado = async (pedido) => {
  if (!pedido?.id && !pedido?.factura_id) return

  try {
    const token = getAuthToken()
    if (!token) {
      triggerAlert('Tu sesión expiró. Volvé a iniciar sesión.', 'error')
      return
    }

    const endpoint = pedido.factura_id
      ? `${API}/facturas/${pedido.factura_id}/completar`
      : `${API}/pedidos/${pedido.id}/completar`

    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.error || 'No se pudo completar el registro.')
    }

    // Recargamos inmediatamente pedidos + productos + estadísticas.
    // "productos" es la misma fuente usada por Gestión de Inventario,
    // por lo que el stock visible cambia en pantalla sin esperar al intervalo.
    await Promise.allSettled([
      loadProducts(),
      loadPedidosGlobales(),
      loadAdminStats(),
      loadAdmin(true)
    ])

    registroVistaPrevia.value = null
    triggerAlert('Registro completado. El stock fue actualizado.', 'success')
  } catch (error) {
    console.error('Error al completar registro:', error)
    triggerAlert(error?.message || 'No se pudo completar el registro.', 'error')
  }
}

const increase = (p) => {
  const stock = Number(p?.stock || 0)
  const actual = Number(p?.qty || 1)
  if (stock > 0 && actual >= stock) {
    triggerAlert(`No podés superar el stock de ${stock} unidades de ${p.nombre}.`, 'error')
    return
  }
  p.qty = actual + 1
}
const decrease = (p) => p.qty = Math.max(1, (p.qty || 1) - 1)

const addToCart = (p) => {
  if (!p) return
  const cantidad = Math.max(1, Number(p.qty || 1))
  const stock = Number(p.stock || 0)
  const item = cart.value.find(i => i.id === p.id)
  const cantidadActual = Number(item?.qty || 0)
  if (stock > 0 && cantidadActual + cantidad > stock) {
    triggerAlert(`Solo hay ${stock} unidades disponibles de ${p.nombre}.`, 'error')
    return
  }
  if (item) item.qty = cantidadActual + cantidad
  else cart.value.push({ ...p, qty: cantidad })
  p.qty = 1
  triggerAlert(`Añadido: ${p.nombre}`, 'success')
}

const removeOneFromCart = (productId) => {
  const item = cart.value.find(i => i.id === productId)
  if (item) {
    if (item.qty > 1) item.qty -= 1
    else removeFromCartCompletely(productId)
  }
}

const removeFromCartCompletely = (productId) => { cart.value = cart.value.filter(i => i.id !== productId) }
const clearCart = () => { cart.value = [] }

const procesandoCheckout = ref(false)

const executeCheckout = async () => {
  if (procesandoCheckout.value || redireccionandoWhatsApp.value) return

  if (!fechaEntregaRequerida.value) {
    triggerAlert('Seleccioná una fecha requerida para poder confirmar el pedido.', 'error')
    return
  }

  if (!Array.isArray(cart.value) || cart.value.length === 0) {
    triggerAlert('El carrito está vacío.', 'error')
    return
  }

  procesandoCheckout.value = true

  try {
    // Copiamos el carrito ANTES de enviarlo porque checkoutProcess lo limpia
    // únicamente cuando el servidor confirma que creó el pedido.
    const copiaCarrito = cart.value.map(item => ({ ...item }))
    const fechaOriginal = fechaEntregaRequerida.value
    const fechaFormateada = formatearFechaRequerida(fechaOriginal)

    const resultado = await checkoutProcess(fechaOriginal)

    if (!resultado) return

    const TELEFONO_WHATSAPP = '5493564652137'
    const fechaPedido = formatearFechaMensaje()
    let mensaje = ` *NUEVA ORDEN DE COMPRA*\n *Pedido realizado:* ${fechaPedido}\n📅 *Fecha requerida:* ${fechaFormateada}\n\n📦 *Detalle:*\n`

    copiaCarrito.forEach((item, index) => {
      mensaje += `${index + 1}. ${item.nombre} | Código: ${item.codigo || 'Sin código'} | Cantidad: ${Number(item.qty || 1)}\n`
    })

    fechaEntregaRequerida.value = ''
    isCartOpen.value = false

    const urlWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
    mostrarRedireccionWhatsApp(urlWhatsApp, 'pedido')
  } catch (error) {
    console.error('Error inesperado en checkout:', error)
    triggerAlert(error?.message || 'No se pudo confirmar el pedido.', 'error')
  } finally {
    procesandoCheckout.value = false
  }
}

const checkoutProcess = async (fechaEntrega) => {
  const token = getAuthToken()

  if (!token) {
    triggerAlert('Tu sesión expiró. Volvé a iniciar sesión.', 'error')
    return false
  }

  try {
    const carritoMapeado = cart.value.map(item => ({
      producto_id: Number(item.id),
      nombre: item.nombre,
      precio: Number(item.precio || 0),
      imagen: item.imagen || null,
      unidades: Math.max(1, Number(item.qty || 1))
    }))

    if (!carritoMapeado.length) {
      throw new Error('El carrito está vacío.')
    }

    if (carritoMapeado.some(item => !Number.isInteger(item.producto_id) || item.producto_id <= 0)) {
      throw new Error('Hay un producto inválido en el carrito. Quitalo y agregalo nuevamente.')
    }

    const fecha = String(fechaEntrega || '').slice(0, 10)
    if (!fecha) {
      throw new Error('Seleccioná una fecha requerida para el pedido.')
    }

    const res = await fetch(`${API}/pedido`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        carrito: carritoMapeado,
        fecha_entrega: fecha
      })
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.error || 'El servidor no pudo registrar el pedido.')
    }

    // El pedido ya fue guardado correctamente. Las actualizaciones visuales
    // no deben impedir que el usuario continúe hacia WhatsApp.
    cart.value = []
    triggerAlert('¡Pedido confirmado correctamente!', 'success')

    await Promise.allSettled([
      loadProducts(),
      loadPedidosGlobales()
    ])

    return true
  } catch (error) {
    console.error('Error al registrar pedido:', error)
    triggerAlert(error?.message || 'No se pudo registrar el pedido.', 'error')
    return false
  }
}


const leerArchivoComoDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}


watch(slideArchivo, async (file) => {
  if (!file) {
    slidePreviewUrl.value = ''
    return
  }
  try {
    slidePreviewUrl.value = await leerArchivoComoDataURL(file)
  } catch (error) {
    slidePreviewUrl.value = ''
    console.warn('No se pudo generar la vista previa del slide:', error)
  }
})

watch(slideEditFiles, async (files) => {
  for (const [slideId, file] of Object.entries(files || {})) {
    if (!file) continue
    try {
      slideEditPreviews.value[slideId] = await leerArchivoComoDataURL(file)
    } catch (error) {
      console.warn('No se pudo generar la vista previa del slide editado:', error)
    }
  }
}, { deep: true })

const generarUrlDesdeArchivo = async (event) => {
  const file = event.target?.files?.[0]
  if (!file) return
  cargandoImagenTool.value = true
  try {
    urlGeneradaTool.value = await leerArchivoComoDataURL(file)
    triggerAlert('¡URL Base64 lista!', 'success')
  } catch {
    triggerAlert('Error procesando archivo.', 'error')
  } finally {
    cargandoImagenTool.value = false
  }
}

const copiarUrlAlPortapapeles = async () => {
  if (!urlGeneradaTool.value) return
  await navigator.clipboard.writeText(urlGeneradaTool.value)
  triggerAlert('📋 Copiada al portapapeles', 'success')
}

const convertirEImagenAUrl = async (event, productoTarget = null) => {
  const file = event.target?.files?.[0]
  if (!file) return
  cargandoImagen.value = true
  try {
    const urlBase64 = await leerArchivoComoDataURL(file)
    if (productoTarget) productoTarget.imagen = urlBase64
    else nuevoProducto.value.imagen = urlBase64
  } catch {
    alert('Error al cargar la imagen.')
  } finally {
    cargandoImagen.value = false
  }
}

const agregarProductoNuevo = async () => {
  const nombre = (nuevoProducto.value.nombre || '').trim()
  const tieneCodigo = Boolean(nuevoProducto.value.tieneCodigo)
  const codigo = String(nuevoProducto.value.codigo || '').trim()
  if (!nombre) return triggerAlert('Completa un nombre.', 'error')
  if (tieneCodigo && !codigo) return triggerAlert('Marcaste que el producto tiene código. Ingresá el código.', 'error')
  const codigoExiste = tieneCodigo && codigo && productos.value.some(p => String(p.codigo || '').trim().toLowerCase() === codigo.toLowerCase())
  if (codigoExiste) return triggerAlert(`El código ${codigo} ya está utilizado por otro producto.`, 'error')
  creandoProducto.value = true
  try {
    const token = getAuthToken()
    const res = await fetch(`${API}/productos`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevoProducto.value, codigo: tieneCodigo ? codigo : null, precio: 0 })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    if (data.producto) productos.value.unshift({ ...data.producto, qty: 1 })
    nuevoProducto.value = { nombre: '', codigo: '', tieneCodigo: false, precio: null, color: '', medida: '', categoria: 'vinilos', stock: null, imagen: '' }
    await loadProducts()
    await loadAdmin(true)
    triggerAlert('¡Producto creado!', 'success')
  } catch (e) {
    triggerAlert(e.message || 'Error al crear', 'error')
  } finally {
    creandoProducto.value = false
  }
}

const manejarEdicionImagen = async (event, producto) => {
  const file = event.target?.files?.[0]
  if (file) producto.imagen = await leerArchivoComoDataURL(file)
}

const manejarSubidaSlide = (event) => {
  const file = event.target?.files?.[0]
  if (file) { slideArchivo.value = file; nuevoSlide.value.imagenUrl = '' }
}

const manejarSubidaSlideEdicion = (event, slideId) => {
  const file = event.target?.files?.[0]
  if (file) slideEditFiles.value[slideId] = file
}

const agregarSlide = async () => {
  try {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append('titulo', nuevoSlide.value.titulo || '')
    formData.append('producto_id', nuevoSlide.value.productoId || '')
    if (slideArchivo.value) formData.append('imagen', slideArchivo.value)
    else if (nuevoSlide.value.imagenUrl?.trim()) formData.append('imagen', nuevoSlide.value.imagenUrl.trim())

    const res = await fetch(`${API}/carousel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    if (!res.ok) throw new Error()
    nuevoSlide.value = { titulo: '', imagenUrl: '', productoId: '' }
    slideArchivo.value = null
    await loadCarousel()
    triggerAlert('Slide creado', 'success')
  } catch {
    triggerAlert('Error agregando slide', 'error')
  }
}

const actualizarSlide = async (slide) => {
  try {
    const token = getAuthToken()
    const file = slideEditFiles.value[slide.id] || null
    const formData = new FormData()
    formData.append('titulo', slide.titulo || '')
    formData.append('producto_id', slide.producto_id || '')
    if (file) formData.append('imagen', file)
    else if (slide.imagenUrl?.trim()) formData.append('imagen', slide.imagenUrl.trim())

    const res = await fetch(`${API}/carousel/${slide.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    if (!res.ok) throw new Error()
    await loadCarousel()
    triggerAlert('Slide actualizado', 'success')
  } catch {
    triggerAlert('Error al actualizar slide', 'error')
  }
}

const eliminarSlide = async (slideId) => {
  try {
    const token = getAuthToken()
    await fetch(`${API}/carousel/${slideId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    await loadCarousel()
    triggerAlert('Slide eliminado', 'success')
  } catch {
    triggerAlert('Error al eliminar slide', 'error')
  }
}

const irAlProducto = (productoId) => {
  const target = document.getElementById(`producto-${productoId}`)
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const eliminarProducto = async (productoId, nombre) => {
  if (!confirm(`¿Eliminar "${nombre}"?`)) return
  try {
    const token = getAuthToken()
    const res = await fetch(`${API}/productos/${productoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error()
    productos.value = productos.value.filter(p => p.id !== productoId)
    triggerAlert(`Eliminado: ${nombre}`, 'success')
  } catch {
    triggerAlert('No se pudo eliminar el producto', 'error')
  }
}

const updateProduct = async (producto) => {
  try {
    const token = getAuthToken()
    const formData = new FormData()

    const nombre = String(producto.nombre || '').trim()
    const codigo = String(producto.codigo || '').trim()
    const tieneCodigo = Boolean(producto.tieneCodigo)
    const stock = Number(producto.stock ?? 0)
    const categoria = String(producto.categoria || '').trim()
    const color = String(producto.color || '').trim()
    const medida = String(producto.medida || '').trim()

    if (!nombre) {
      triggerAlert('El nombre del producto es obligatorio.', 'error')
      return
    }

    if (tieneCodigo && !codigo) {
      triggerAlert('Marcaste que el producto tiene código. Ingresá el código.', 'error')
      return
    }

    formData.append('nombre', nombre)
    formData.append('codigo', tieneCodigo ? codigo : '')
    formData.append('precio', '0')
    formData.append('stock', String(Math.max(0, Number.isFinite(stock) ? stock : 0)))
    formData.append('categoria', categoria)
    formData.append('color', color)
    formData.append('medida', medida)

    if (producto.imagen) formData.append('imagen', producto.imagen)

    const res = await fetch(`${API}/productos/${producto.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al actualizar el producto')
    }

    await loadProducts()
    await loadAdmin(true)
    triggerAlert('Producto actualizado con éxito', 'success')
  } catch (e) {
    triggerAlert(e.message || 'Error al actualizar producto', 'error')
  }
}

const getBadgeClassDinamico = (pedido) => {
  const est = (pedido?.estado || '').trim().toLowerCase()
  const dias = Number(pedido?.diasRestantes ?? 999)
  if (est === 'completado') return 'badge-completado'
  if (est === 'cancelado') return 'badge-cancelado'
  if (dias <= 2) return 'badge-critico'
  if (dias <= 5) return 'badge-alta'
  return 'badge-general'
}
</script>


<style scoped>

.alert-vencimiento-container {
  background-color: #0b132b; 
  border: 1px solid #1c2541;
  border-radius: 8px;
  padding: 20px;
  max-width: 900px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}


.alert-vencimiento-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  border-bottom: 2px solid #ff3333;
  padding-bottom: 10px;
}

.alert-vencimiento-header h3 {
  color: #ff4d4d;
  margin: 0;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.factura-creator-modal {
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.factura-creator-modal .modal-body {
  overflow-y: auto;
  padding-bottom: 16px;
}

.modal-subtitle {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.factura-lines-card,
.preview-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.factura-lines-header,
.preview-title,
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.preview-title,
.factura-lines-header {
  font-weight: 700;
  color: #fff;
}

.factura-line-item {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 10px;
  background: rgba(255,255,255,0.03);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compact-grid {
  grid-template-columns: 1.2fr 0.8fr;
}

.line-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  color: #cbd5e1;
  font-size: 0.85rem;
}

.btn-small {
  padding: 7px 10px;
  font-size: 0.8rem;
}

.preview-line,
.preview-total {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.preview-total {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 8px;
}

.alert-icon {
  font-size: 1.3rem;
}


.alert-vencimiento-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px; 
  overflow-y: auto;  
  padding-right: 5px;
}


.alert-vencimiento-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1c2541;
  border-left: 4px solid #ff4d4d; 
  border-radius: 6px;
  padding: 12px 16px;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.alert-vencimiento-card:hover {
  transform: translateX(4px);
  background-color: #232e52;
}


.card-main-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-label {
  color: #6c7a9c;
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 600;
}

.info-value {
  color: #ffffff;
  font-size: 0.95rem;
}

.text-highlight {
  color: #48cae4; 
  font-weight: 600;
}


.badge-vence-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(255, 77, 77, 0.15);
  border: 1px solid rgba(255, 77, 77, 0.4);
  color: #ff4d4d;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.card-badge-zone {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.btn-alert-completar {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 7px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-alert-completar:hover:not(:disabled) {
  background: #16a34a !important;
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(22, 163, 74, 0.35);
}

.btn-alert-completar:active:not(:disabled) {
  background: #15803d !important;
  transform: translateY(0);
}

.btn-alert-completar:disabled {
  cursor: not-allowed;
  opacity: .6;
}

.clock-icon {
  font-size: 0.9rem;
}

.days-remaining {
  font-weight: 700;
  background-color: #ff4d4d;
  color: #ffffff;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 4px;
  font-size: 0.8rem;
}


.alert-vencimiento-list::-webkit-scrollbar {
  width: 6px;
}
.alert-vencimiento-list::-webkit-scrollbar-track {
  background: #0b132b;
}
.alert-vencimiento-list::-webkit-scrollbar-thumb {
  background: #1c2541;
  border-radius: 4px;
}
.ventas-container {
  --bg-main: #060813;
  --panel-bg: rgba(13, 18, 36, 0.7);
  --card-bg: rgba(20, 27, 54, 0.5);
  --border-color: rgba(255, 255, 255, 0.06);
  --border-focus: rgba(30, 144, 255, 0.4);
  
  --primary: #0070f3;
  --primary-hover: #1b86ff;
  --accent-cyan: #00dfd8;
  --danger: #ff334b;
  --danger-bg: rgba(255, 51, 75, 0.1);
  --success: #00e676;
  --warning: #ffb300;
  
  --text-main: #f3f4f6;
  --text-muted: #828fa9;

  min-height: 100vh;
  background-color: var(--bg-main);
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(0, 112, 243, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(0, 223, 216, 0.05) 0%, transparent 50%);
  
  padding: 80px 40px 40px 40px; 
  color: var(--text-main);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  letter-spacing: -0.2px;
  transition: padding-right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1;
}

.ventas-container.cart-is-open {
  padding-right: 460px;
}

.ventas-container *, 
.ventas-container *::before, 
.ventas-container *::after { 
  box-sizing: border-box; 
}

h2 {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.6px;
  background: linear-gradient(135deg, #ffffff 0%, var(--text-muted) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h3 {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
}

.subtitle {
  font-size: 13.5px;
  color: var(--text-muted);
  margin: 4px 0 0 0;
}

.section-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 2px 0 0 0;
}

.muted { color: var(--text-muted); }
.text-center { text-align: center; }
.font-medium { font-weight: 500; }
.text-right { text-align: right; }
.mini-text { font-size: 12px; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 16px;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.panel-header {
  background: var(--panel-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  padding: 20px 28px;
  border-radius: 16px;
  margin-bottom: 24px;
}

.shop-layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-status-indicator {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-status-indicator:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.cart-status-indicator.has-items {
  border-color: rgba(0, 112, 243, 0.4);
  background: rgba(0, 112, 243, 0.06);
}

.cart-icon { font-size: 16px; }

.cart-badge-count {
  background: var(--primary);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  padding: 2px 8px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(0, 112, 243, 0.4);
}


.billing-workspace {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  padding: 20px;
  align-items: stretch;
}


.filtro-clientes-sidebar {
  border-right: 1px solid var(--border-color);
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  max-height: 380px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sidebar-header h3 {
  margin: 0;
}

.btn-clear-inline {
  background: transparent;
  border: none;
  color: var(--danger);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s;
}

.btn-clear-inline:hover {
  background: var(--danger-bg);
}

.sidebar-customers-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 4px;
}

.sidebar-customer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sidebar-customer-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--border-color);
}

.sidebar-customer-item.active {
  background: rgba(0, 112, 243, 0.08);
  border-color: rgba(0, 112, 243, 0.3);
}

.customer-mini-avatar {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  color: #ffffff;
}

.sidebar-customer-item.active .customer-mini-avatar {
  background: var(--primary);
  border-color: var(--primary);
}

.customer-mini-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.customer-mini-details .name {
  font-size: 12.5px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.customer-mini-details .email {
  font-size: 10.5px;
  color: var(--text-muted);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}


.facturas-carousel-zone {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.section-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.facturas-carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 4px 4px 12px 4px;
  scroll-behavior: smooth;
}


.facturas-carousel::-webkit-scrollbar {
  height: 6px;
}
.facturas-carousel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.facturas-carousel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.facturas-carousel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-vista-previa {
  border: 1px solid rgba(59, 130, 246, 0.55);
  background: rgba(37, 99, 235, 0.14);
  color: #93c5fd;
  padding: 6px 9px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.btn-vista-previa:hover {
  background: rgba(37, 99, 235, 0.25);
}

.admin-views-switcher {
  display: inline-flex;
  gap: 8px;
  margin: 18px 0 22px;
  padding: 6px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.42);
}

.admin-view-tab {
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  padding: 9px 16px;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.82rem;
  transition: all 0.2s ease;
}

.admin-view-tab.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.26), rgba(14, 165, 233, 0.18));
  border-color: rgba(96, 165, 250, 0.45);
  color: #f8fafc;
}

.admin-stats-section {
  margin-top: 18px;
}

.stats-kpis-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stat-kpi-card {
  background: rgba(15, 23, 42, 0.62);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-kpi-label {
  color: var(--text-muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-kpi-value {
  color: #f8fafc;
  font-size: clamp(1rem, 1.8vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
}

.stat-kpi-note {
  color: #93c5fd;
  font-size: 0.72rem;
}

.stats-panels-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stats-panels-grid.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stats-panel-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 16px;
}

.stats-stock-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
}

.stock-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.stock-type-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stock-type-btn {
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(15, 23, 42, 0.56);
  color: #cbd5e1;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stock-type-btn.active {
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(96, 165, 250, 0.45);
  color: #f8fafc;
}

.stats-stock-table-wrap {
  overflow-x: auto;
}

.stats-stock-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  color: #e2e8f0;
  table-layout: fixed;
}

.stats-stock-table th,
.stats-stock-table td {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  text-align: left;
  font-size: 0.76rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-stock-table th {
  color: #cbd5e1;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stock-product-name {
  font-weight: 700;
  color: #f8fafc;
}

.stock-value {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #86efac;
  font-weight: 700;
}

.stock-empty {
  color: #fca5a5;
}

.stock-warning {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #dc2626;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
}

.stock-alert-row {
  background: rgba(220, 38, 38, 0.05);
}

.stock-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
}

.stock-page-btn {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.56);
  color: #f8fafc;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.stock-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.stock-page-indicator {
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 700;
}

.stats-panel-header {
  margin-bottom: 12px;
}

.stats-panel-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #f8fafc;
}

.stats-bars-list,
.stats-list,
.stats-summary-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stats-bar-row {
  display: grid;
  grid-template-columns: 92px minmax(120px, 1fr) auto;
  gap: 10px;
  align-items: center;
  color: var(--text-muted);
  font-size: 0.74rem;
}

.stats-bar-track {
  width: 100%;
  height: 10px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 999px;
  overflow: hidden;
}

.stats-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #60a5fa, #2563eb);
}

.stats-bar-fill.alt {
  background: linear-gradient(90deg, #34d399, #10b981);
}

.chart-panel-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.chart-caption {
  color: #68686e;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stats-horizontal-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 190px;
  justify-content: center;
}

.stats-horizontal-row {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.stats-horizontal-row > span {
  overflow: hidden;
  color: #89898f;
  font-size: 0.69rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-horizontal-track {
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: repeating-linear-gradient(90deg, #19191c 0, #19191c 24%, #222226 25%);
}

.stats-horizontal-fill {
  height: 100%;
  min-width: 8%;
  border-radius: inherit;
  background: linear-gradient(90deg, #77777d, #f5f5f5);
  box-shadow: 0 0 16px rgba(255,255,255,.1);
  transition: width .45s cubic-bezier(.16,1,.3,1);
}

.stats-horizontal-row > strong {
  color: #d8d8dc;
  font-size: 0.64rem;
  white-space: nowrap;
}

.stats-chart-tooltip {
  position: relative;
  outline: none;
}

.stats-chart-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  z-index: 20;
  left: 50%;
  bottom: calc(100% + 8px);
  width: max-content;
  max-width: 190px;
  padding: 7px 9px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 7px;
  background: #1b1b1e;
  color: #f5f5f5;
  box-shadow: 0 10px 24px rgba(0,0,0,.32);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.25;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 4px);
  transition: opacity .16s ease, transform .16s ease;
}

.stats-chart-tooltip:hover::after,
.stats-chart-tooltip:focus-visible::after,
.stats-chart-tooltip:active::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.stats-column-item::after {
  bottom: calc(100% + 4px);
}

.stats-legend-item::after {
  left: auto;
  right: 0;
  bottom: calc(100% + 6px);
  transform: translateY(4px);
}

.stats-legend-item:hover::after,
.stats-legend-item:focus-visible::after,
.stats-legend-item:active::after {
  transform: translateY(0);
}

.stats-visual-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  min-height: 0;
}

.stats-month-bars {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.stats-month-row {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  color: #89898f;
  font-size: 0.69rem;
}

.stats-month-row .stats-bar-track {
  height: 8px;
}

.stats-month-row .stats-bar-fill {
  transition: width .45s cubic-bezier(.16,1,.3,1);
}

.stats-month-row strong {
  color: #d5d5d9;
  font-size: 0.66rem;
  white-space: nowrap;
}

.stats-donut-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,.06);
}

.stats-donut-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
}

.stats-donut-copy strong {
  color: #ededed;
  font-size: 0.78rem;
}

.stats-donut-copy span {
  max-width: 210px;
  color: #77777d;
  font-size: 0.68rem;
  line-height: 1.35;
}

.stats-donut {
  position: relative;
  display: grid;
  flex: 0 0 126px;
  place-items: center;
  width: 126px;
  height: 126px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(255,255,255,.06), 0 12px 30px rgba(0,0,0,.25);
}

.stats-donut svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.stats-donut-sector {
  cursor: pointer;
  stroke: #101012;
  stroke-width: 1.2;
  transition: opacity .18s ease, filter .18s ease;
}

.stats-donut-sector:hover,
.stats-donut-sector:active {
  filter: brightness(1.2) saturate(1.15);
  opacity: .88;
}

.stats-donut-hole {
  position: absolute;
  inset: 50% auto auto 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 50%;
  background: #101012;
  text-align: center;
  transform: translate(-50%, -50%);
}

.stats-donut-hole strong {
  color: #f0f0f0;
  font-size: 0.78rem;
}

.stats-donut-hole span {
  color: #77777d;
  font-size: 0.58rem;
}

.stats-donut-legend {
  display: flex;
  flex: 1.3;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.stats-legend-item {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  color: #a4a4aa;
  font-size: 0.68rem;
}

.stats-legend-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.stats-legend-details strong {
  overflow: hidden;
  color: #dcdce0;
  font-size: 0.7rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-legend-details small {
  color: #77777d;
  font-size: 0.61rem;
  white-space: nowrap;
}

.stats-legend-item strong {
  color: #ededed;
  font-size: 0.65rem;
}

.stats-legend-swatch {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.chart-empty {
  min-height: 180px;
  display: grid;
  place-items: center;
}

.stats-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
}

.stats-list-item strong {
  display: block;
  color: #f8fafc;
  font-size: 0.82rem;
}

.stats-list-item small {
  display: block;
  color: var(--text-muted);
  margin-top: 3px;
  font-size: 0.7rem;
}

.stats-list-item span {
  color: #93c5fd;
  font-size: 0.72rem;
  font-weight: 700;
}

.stats-completed-month-chart {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: end;
  gap: 10px;
  min-height: 190px;
}

.stats-completed-month-item {
  display: grid;
  grid-template-rows: 18px 1fr 26px;
  align-items: end;
  gap: 7px;
  height: 180px;
  min-width: 0;
  text-align: center;
}

.stats-completed-month-item > strong {
  color: #dcdce0;
  font-size: 0.7rem;
}

.stats-completed-month-track {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
  border-bottom: 1px solid rgba(255,255,255,.12);
  background: repeating-linear-gradient(to top, transparent 0, transparent 38px, rgba(255,255,255,.045) 39px);
}

.stats-completed-month-fill {
  width: min(30px, 70%);
  min-height: 8%;
  border-radius: 5px 5px 1px 1px;
  background: linear-gradient(180deg, #22c55e, #0f766e);
  box-shadow: 0 0 16px rgba(34,197,94,.16);
  transition: height .45s cubic-bezier(.16,1,.3,1);
}

.stats-completed-month-item > span {
  overflow: hidden;
  color: #85858b;
  font-size: 0.67rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-status-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 190px;
  justify-content: center;
}

.stats-status-row {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.stats-status-label {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.stats-status-label strong {
  overflow: hidden;
  color: #dcdce0;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-status-row .stats-bar-track {
  height: 11px;
}

.stats-status-fill {
  height: 100%;
  min-width: 8%;
  border-radius: inherit;
  box-shadow: 0 0 14px rgba(255,255,255,.08);
  transition: width .45s cubic-bezier(.16,1,.3,1);
}

.stats-status-value {
  color: #a8a8ad;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
}

.stats-summary-list {
  gap: 8px;
}

.stats-summary-list div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-muted);
  font-size: 0.82rem;
  padding: 8px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.stats-summary-list div:last-child {
  border-bottom: none;
}

.stats-summary-list strong {
  color: #f8fafc;
}

.stats-empty {
  color: var(--text-muted);
  font-size: 0.78rem;
  padding: 8px 2px;
}

.estado-completado {
  color: #00e676 !important;
}

 .deadline-field[type="datetime-local"] { color-scheme: dark; }
.registro-preview-overlay {
  position: fixed; inset: 0; z-index: 12000; background: rgba(2, 6, 23, 0.78); backdrop-filter: blur(7px); display: flex; align-items: center; justify-content: center; padding: 20px;
}
.registro-preview-modal { width: min(760px, 96vw); max-height: 88vh; overflow: auto; background: linear-gradient(145deg, #0f172a, #111827); color: #e5e7eb; border: 1px solid rgba(96,165,250,.35); border-radius: 18px; box-shadow: 0 25px 80px rgba(0,0,0,.55); }
.registro-preview-modal-header { display:flex; justify-content:space-between; align-items:center; padding:20px 22px; border-bottom:1px solid rgba(255,255,255,.08); }
.registro-preview-kicker { font-size:.72rem; letter-spacing:1.5px; color:#60a5fa; font-weight:800; }
.registro-preview-modal-header h3 { margin:4px 0 0; font-size:1.35rem; }
.registro-preview-meta { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:16px 22px; background:rgba(255,255,255,.025); }
.registro-preview-meta div { display:flex; flex-direction:column; gap:4px; }
.registro-preview-meta span { font-size:.72rem; color:#94a3b8; text-transform:uppercase; font-weight:700; }
.registro-preview-meta strong { font-size:.88rem; color:#f8fafc; }
.registro-preview-products { padding:18px 22px; }
.registro-preview-products-title { display:flex; justify-content:space-between; margin-bottom:10px; }
.registro-preview-products-title span { color:#94a3b8; font-size:.8rem; }
.registro-preview-product-list { display:flex; flex-direction:column; gap:8px; }
.registro-preview-product-row { display:grid; grid-template-columns:28px 58px 1fr auto; gap:12px; align-items:center; padding:10px; border:1px solid rgba(255,255,255,.07); border-radius:11px; background:rgba(255,255,255,.035); }
.registro-preview-product-row img { width:58px; height:58px; object-fit:cover; border-radius:8px; border:1px solid rgba(255,255,255,.1); }
.registro-preview-number { color:#60a5fa; font-weight:800; text-align:center; }
.registro-preview-product-info { display:flex; flex-direction:column; gap:3px; min-width:0; }
.registro-preview-product-info strong { color:#fff; font-size:.92rem; }
.registro-preview-product-info span { color:#94a3b8; font-size:.76rem; }
.registro-preview-quantity { text-align:center; min-width:78px; padding:7px 10px; border-radius:9px; background:rgba(37,99,235,.12); border:1px solid rgba(96,165,250,.2); }
.registro-preview-quantity small { display:block; font-size:.58rem; color:#93c5fd; font-weight:800; }
.registro-preview-quantity strong { color:#fff; font-size:1rem; }
.registro-preview-empty { padding:20px; text-align:center; color:#94a3b8; }
.registro-preview-footer { display:flex; justify-content:space-between; gap:10px; padding:15px 22px; border-top:1px solid rgba(255,255,255,.08); color:#94a3b8; font-size:.82rem; }
.registro-preview-footer b { color:#fff; }
@media (max-width:700px){ .registro-preview-meta{grid-template-columns:1fr}.registro-preview-product-row{grid-template-columns:24px 52px 1fr}.registro-preview-product-row img{width:52px;height:52px}.registro-preview-quantity{grid-column:3; justify-self:start}.registro-preview-footer{flex-direction:column} }
.registro-preview-loading {
  display: inline-block;
  margin-left: 8px;
  color: #60a5fa;
  font-size: .7rem;
  font-weight: 700;
}

.registro-preview-footer > div {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.registro-preview-completar {
  min-width: 180px;
}

.registro-preview-completar:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.mini-factura-card {
  flex: 0 0 285px; 
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 270px;
  height: auto;
  transition: transform 0.15s, border-color 0.15s;
}

.mini-factura-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
}

.factura-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 10px;
}

.factura-id {
  font-family: monospace;
  font-weight: 700;
  color: var(--accent-cyan);
  font-size: 12px;
}

.factura-fecha {
  font-size: 11px;
  color: var(--text-muted);
}

.factura-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
}

.factura-cliente .label, 
.factura-items .label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin: 0 0 2px 0;
}

.value-highlight {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.sub-value {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.factura-item-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.01);
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.item-name {
  color: #d1d5db;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 150px;
}

.item-qty {
  font-weight: 600;
  color: var(--text-muted);
}

.factura-footer {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.factura-footer > div:first-child {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.factura-total {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  font-family: monospace;
}

.factura-actions {
  display: grid;
  grid-template-columns: 75px 1fr;
  gap: 6px;
}

.btn-factura-action {
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-main);
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-factura-action.btn-detail:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.btn-factura-action.btn-print:hover {
  background: rgba(0, 112, 243, 0.1);
  border-color: rgba(0, 112, 243, 0.3);
  color: var(--primary-hover);
}

.factura-empty-carousel {
  min-width: 100%;
  padding: 48px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 240px;
  border: 1px dashed var(--border-color);
}

.hero-carousel {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-carousel-viewport {
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
  background: #0f172a;
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
}

.hero-carousel-track {
  display: flex;
  transition: transform 0.6s ease-in-out;
}

.hero-carousel-card {
  position: relative;
  min-width: 100%;
  height: min(280px, 38vw);
  min-height: 220px;
  overflow: hidden;
  background: #111827;
}

.hero-carousel-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.hero-carousel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.25));
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
}

.hero-carousel-overlay h3 {
  margin: 0 0 6px;
  color: #ffffff;
}

.hero-carousel-overlay p {
  margin: 0;
  color: #e2e8f0;
}

.hero-carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.hero-carousel-btn {
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  color: white;
  cursor: pointer;
}

.hero-carousel-dots {
  display: flex;
  gap: 7px;
}

.hero-carousel-dot {
  width: 10px;
  height: 10px;
  border: none;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  cursor: pointer;
  padding: 0;
}

.hero-carousel-dot.active {
  background: var(--primary);
  transform: scale(1.1);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.product-card {
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  background: #03050d;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: opacity 0.2s ease;
}

.product-card:hover .product-image { opacity: 1; }

.product-tag-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 223, 216, 0.1);
  border: 1px solid rgba(0, 223, 216, 0.2);
  color: var(--accent-cyan);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.product-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-info { flex-grow: 1; }

.product-info h3 {
  font-size: 16.5px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px 0;
  text-transform: none;
  letter-spacing: -0.1px;
}

.product-description {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.45;
  margin: 0 0 16px 0;
}

.product-card .price {
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 16px 0;
  font-family: monospace;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 4px;
  border: 1px solid var(--border-color);
}

.qty-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}

.qty-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.qty-number {
  font-weight: 700;
  font-size: 13.5px;
  color: #ffffff;
  font-family: monospace;
}

.action-buttons-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.admin-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-section {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  margin: 0%;
  
}

.admin-grid-two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.table-container {
  overflow-x: auto;
  margin-top: 8px;
}

.pro-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13.5px;
}

.pro-table th {
  padding: 12px 16px;
  color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pro-table td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  color: #e2e8f0;
}

.pro-table tr:hover td { background: rgba(255, 255, 255, 0.01); }

.status-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.state-low {
  background: rgba(0, 230, 118, 0.1);
  color: var(--success);
  border: 1px solid rgba(0, 230, 118, 0.15);
}

.state-medium {
  background: rgba(255, 179, 0, 0.1);
  color: var(--warning);
  border: 1px solid rgba(255, 179, 0, 0.15);
}

.state-high {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid rgba(255, 51, 75, 0.15);
}

.state-pendiente {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.pagination-controls {
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.btn-nav {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
.page-indicator { font-size: 12.5px; color: var(--text-muted); }
.page-indicator strong { color: #ffffff; }

.admin-products-list {
  display:flex;
  flex-direction: column;
  gap: 12px;
  
}

.admin-product-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.15);
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  
}

.pro-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.15s ease;
}

.pro-input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 8px rgba(0, 112, 243, 0.2);
}

.pro-input.inline { flex: 1; }

.price-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding-left: 10px;
  width: 120px;
}

.price-input-wrapper span { color: var(--text-muted); font-size: 13px; }

.price-input-wrapper .pro-input.price {
  border: none;
  background: transparent;
  width: 100%;
  padding-left: 4px;
}

.btn-save {
  background: rgba(0, 230, 118, 0.1);
  color: var(--success);
  border: 1px solid rgba(0, 230, 118, 0.2);
}

.btn-save:hover {
  background: var(--success);
  color: #060813;
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.3);
}

.side-cart-panel {
  position: fixed;
  top: 0; right: 0; width: 420px; height: 100vh;
  background: rgba(6, 8, 19, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid var(--border-color);
  padding: 40px 24px;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
  z-index: 950; 
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cart-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}

.cart-title { font-weight: 700; font-size: 13.5px; text-transform: uppercase; letter-spacing: 0.5px; }
.cart-header-actions { display: flex; align-items: center; gap: 16px; }

.btn-clear-cart {
  background: transparent; border: none; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: color 0.15s;
}
.btn-clear-cart:hover { color: var(--danger); }

.btn-close-cart {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #94a3b8;
  border-radius: 9px;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.18s ease;
}
.btn-close-cart:hover {
  background: rgba(0, 223, 216, 0.10);
  border-color: rgba(0, 223, 216, 0.38);
  color: #00dfd8;
  transform: rotate(90deg);
  box-shadow: 0 0 14px rgba(0, 223, 216, 0.12);
}


.btn-close {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.035);
  color: #94a3b8;
  font-family: inherit;
  font-size: 19px;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}
.btn-close:hover {
  background: rgba(0, 223, 216, 0.10);
  border-color: rgba(0, 223, 216, 0.38);
  color: #00dfd8;
  transform: rotate(90deg);
  box-shadow: 0 0 14px rgba(0, 223, 216, 0.12);
}
.btn-close:active {
  transform: rotate(90deg) scale(0.94);
}
.btn-close:focus-visible,
.btn-close-cart:focus-visible {
  outline: 2px solid rgba(0, 223, 216, 0.55);
  outline-offset: 2px;
}

.cart-empty-state {
  flex-grow: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 13px;
}

.cart-items-list {
  flex-grow: 1; overflow-y: auto; margin: 20px 0; display: flex; flex-direction: column; gap: 12px;
}

.cart-item-row-advanced {
  display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.01); padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border-color);
}

.cart-item-details { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.cart-item-name { color: #ffffff; font-weight: 600; font-size: 13px; }
.cart-item-meta { display: flex; gap: 12px; font-size: 12px; }
.cart-item-qty { color: var(--text-muted); }
.cart-item-qty strong { color: var(--primary-hover); }
.cart-item-price { color: #ffffff; font-family: monospace; }

.cart-item-actions { display: flex; gap: 6px; }

.btn-action-cart {
  background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); color: var(--text-muted); padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.15s;
}
.btn-action-cart:hover { border-color: rgba(255, 255, 255, 0.15); color: #ffffff; }
.btn-action-cart.del:hover { background: var(--danger-bg); border-color: rgba(255, 51, 75, 0.2); color: var(--danger); }

.cart-footer { border-top: 1px solid var(--border-color); padding-top: 16px; }
.total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 13px; color: var(--text-muted); }
.total-amount { font-size: 24px; font-weight: 800; color: #ffffff; font-family: monospace; }

.btn {
  padding: 10px 16px; border: none; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); gap: 6px;
}
.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 8px; }
.btn-block { width: 100%; }
.primary { background: var(--primary); color: #ffffff; }
.primary:hover { background: var(--primary-hover); box-shadow: 0 4px 14px rgba(0, 112, 243, 0.3); }
.btn-secondary { background: transparent; color: var(--text-main); border: 1px solid var(--border-color); }
.btn-secondary:hover { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.15); }
.btn-logout { background: transparent; color: #64748b; border: 1px solid #e2e8f0; }
.btn-logout:hover { background: #f8fafc; color: #0f172a; }


.custom-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 1300; width: 340px; background: rgba(13, 18, 36, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.custom-toast.success { border-left: 3px solid var(--success); }
.custom-toast.error, .custom-toast.warning { border-left: 3px solid var(--danger); }
.toast-icon { font-size: 14px; font-weight: bold; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.custom-toast.success .toast-icon { background: rgba(0, 230, 118, 0.15); color: var(--success); }
.custom-toast.error .toast-icon, .custom-toast.warning .toast-icon { background: var(--danger-bg); color: var(--danger); }
.toast-body { flex-grow: 1; }
.toast-title { font-weight: 700; font-size: 12.5px; margin: 0; color: #ffffff; }
.toast-message { font-size: 12px; margin: 2px 0 0 0; color: var(--text-muted); }
.toast-close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px; }


.slide-panel-enter-active, .slide-panel-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-panel-enter-from, .slide-panel-leave-to { transform: translateX(100%); }
.toast-slide-enter-active, .toast-slide-leave-active { transition: transform 0.25s ease, opacity 0.2s; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateY(20px); opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }


.modal-overlay {
  position: fixed !important; inset: 0 !important; background: rgba(3, 5, 12, 0.8) !important; backdrop-filter: blur(6px) !important; -webkit-backdrop-filter: blur(6px) !important; z-index: 9999 !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 20px !important;
}
.modal-card-factura { width: 100%; max-width: 600px; background: #ffffff; color: #0f172a; border-radius: 12px; padding: 32px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); }
.modal-factura-header { display: flex; justify-content: space-between; align-items: flex-start; }
.modal-factura-header h2 { background: none; -webkit-text-fill-color: initial; color: #0f172a; font-size: 20px; font-weight: 800; margin: 0; }
.modal-factura-header .sub { color: #64748b; font-size: 12px; margin: 2px 0 0 0; }
.factura-num-title { margin: 0; font-size: 14px; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
.factura-num { font-size: 15px; font-weight: 700; color: var(--primary); margin: 1px 0; font-family: monospace; }
.factura-print-date { font-size: 12px; color: #64748b; margin: 0; }
.modal-divider { border: 0; border-top: 1px solid #e2e8f0; margin: 18px 0; }
.modal-factura-cliente-info h4 { margin: 0 0 6px 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
.modal-factura-cliente-info p { margin: 4px 0; font-size: 13.5px; color: #334155; }
.modal-factura-table-wrapper { margin-top: 20px; }
.modal-table-items { width: 100%; border-collapse: collapse; font-size: 13px; }
.modal-table-items th { background: #f8fafc; color: #64748b; padding: 8px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600; text-transform: uppercase; font-size: 11px; }
.modal-table-items td { padding: 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
.modal-table-items th.text-center, .modal-table-items td.text-center { text-align: center; }
.modal-table-items th.text-right, .modal-table-items td.text-right { text-align: right; }
.modal-factura-total-box { margin-top: 20px; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.total-row-modal { display: flex; width: 220px; justify-content: space-between; font-size: 13px; color: #475569; }
.total-row-modal.final { font-size: 15px; font-weight: 700; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 6px; font-family: monospace; }
.modal-factura-actions-footer { margin-top: 28px; display: flex; justify-content: flex-end; gap: 10px; }


@media (max-width: 950px) {
  .billing-workspace { grid-template-columns: 1fr; }
  .filtro-clientes-sidebar { border-right: none; border-bottom: 1px solid var(--border-color); padding-right: 0; padding-bottom: 16px; max-height: 180px; }
  .admin-grid-two-cols { grid-template-columns: 1fr; }
  .ventas-container, .ventas-container.cart-is-open { padding: 80px 20px 20px 20px; }
  .side-cart-panel { width: 100%; }
}


@media print {
  body *, .ventas-container, header, .no-print, .custom-toast { display: none !important; }
  .modal-overlay { position: absolute; left: 0; top: 0; background: #ffffff !important; padding: 0 !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
  #print-area-factura { display: block !important; width: 100% !important; max-width: 100% !important; box-shadow: none !important; padding: 0 !important; color: #000000 !important; }
  .modal-factura-actions-footer { display: none !important; }
}


.cart-deadline-selector, 
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 1.2rem 0;
}


.deadline-field,
.full-width-date {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  background-color: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #2d3748;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.7rem 1rem;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  

  display: flex;
  align-items: center;
  justify-content: space-between;
}


.deadline-field:hover,
.full-width-date:hover {
  border-color: #cbd5e1;
  background-color: #f8fafc;
}

.deadline-field:focus,
.full-width-date:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.25);
}


::-webkit-datetime-edit { padding: 0.2em 0; }
::-webkit-datetime-edit-fields-wrapper { background: transparent; }


::-webkit-calendar-picker-indicator {
  background-color: transparent;
  cursor: pointer;
  filter: invert(0.4) sepia(1) saturate(3) hue-rotate(195deg); 
  transform: scale(1.15);
  transition: transform 0.1s ease;
  margin: 0;
  padding: 0;
}

::-webkit-calendar-picker-indicator:hover {
  transform: scale(1.25);
}


.btn-checkout-execute,
.modal-factura-actions-footer .btn.primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #3182ce !important;
  color: #ffffff !important;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(49, 130, 206, 0.25);
}

.btn-checkout-execute:hover:not(:disabled),
.modal-factura-actions-footer .btn.primary:hover:not(:disabled) {
  background-color: #2b6cb0 !important;
  box-shadow: 0 6px 8px -1px rgba(49, 130, 206, 0.35);
}


.btn-checkout-execute:disabled,
.modal-factura-actions-footer .btn.primary:disabled {
  background-color: #cbd5e1 !important;
  color: #94a3b8 !important;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-checkout-execute:active:not(:disabled),
.modal-factura-actions-footer .btn.primary:active:not(:disabled) {
  transform: scale(0.98);
}


.file-upload-container {
  margin: 10px 0;
  display: inline-block;
}


.file-upload-container input[type="file"] {
  display: none;
}


.custom-file-upload {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #3be0a4; 
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.custom-file-upload:hover {
  background-color: #38caaf;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}


.custom-file-upload:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.upload-icon {
  transition: transform 0.2s ease;
}
.custom-file-upload:hover .upload-icon {
  transform: translateY(-2px);
}
.badge-pendiente { background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.badge-proceso { background-color: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.badge-completado { background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.badge-cancelado { background-color: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.badge-general { background-color: #6b7280; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.badge-critico { background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.badge-alta { background-color: #f97316; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.badge-media { background-color: #0ea5e9; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.badge-baja { background-color: #14b8a6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }

.whatsapp-floating-btn {
  position: fixed;
  bottom: 35px; right: 35px;
  width: 56px; height: 56px;
  background-color: #25d366;
  border-radius: 50%;
  display: flex;
  align-items: center; justify-content: center;
  box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);
  z-index: 999;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2);
}

.whatsapp-icon { width: 26px; height: 26px; fill: #ffffff; }

.pulse-ring {
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 2px solid #25d366;
  animation: geoPulse 2s infinite ease-out;
}

.whatsapp-floating-btn:hover {
  transform: scale(1.08) translate3d(0, -3px, 0);
}

@keyframes geoPulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

.footer {
  position: relative;
  z-index: 3;
  background-color: #040814;
  padding: 60px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  gap: 40px;
}

.brand-col {
  flex: 1.2;
}

.social-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 8px;
  margin-left: auto;
}

.footer h3 {
  font-size: 16px;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.footer-highlight {
  font-size: 13px;
  color: var(--accent-blue);
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 14px 0;
}

.footer-desc {
  max-width: 360px;
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.social-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.4);
  margin-bottom: 2px;
  text-align: right;
  margin-right: 6%;
}

.social-icons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #070d1e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.svg-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.social-icons a:hover {
  color: #fefefe;
  background-color: var(--accent-blue);
  border-color: var(--accent-blue);
  transform: translate3d(0, -3px, 0);
}




@media (max-width: 768px) {

  .footer-row {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .brand-col {
    width: 100%;
    text-align: center;
  }

  .social-col {
    width: 100%;
    margin-left: 0;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .social-label {
    width: 100%;
    margin-right: 0;
    text-align: center;
  }

  .social-icons {
    width: 100%;
    justify-content: center;
  }

}

@media (max-width: 992px) {
  .narrative-row, .narrative-row.layout-inverted { grid-template-columns: 1fr; gap: 40px; margin-bottom: 70px; }
  .narrative-row.layout-inverted .narrative-body,
  .narrative-row.layout-inverted .narrative-visual-wrapper { grid-column: unset; }
  
  .offset-down-right { top: 10px; left: 10px; }
  .offset-down-left { top: 10px; left: -10px; }
  
  .narrative-visual-wrapper { max-width: 500px; margin: 0 auto; width: calc(100% - 20px); }
  
  .float-animation { animation: none !important; }
  .nebula { animation: none !important; display: none; }
  
  .footer-row { flex-direction: column; text-align: center; }
  .social-col { align-items: center; }
  .whatsapp-floating-btn { bottom: 20px; right: 20px; width: 50px; height: 50px; }
}

@media (prefers-reduced-motion: reduce) {
  .nebula, .particulas-grid, .float-animation, .anim-reveal {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}

.factura-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 32px; /* Espacio para los tres puntitos */
  gap: 6px;
}

.btn-factura-action.btn-share {
  font-weight: 900;
  font-size: 14px;
  padding: 0;
  line-height: 1;
}

.btn-factura-action.btn-share:hover {
  background: rgba(0, 223, 216, 0.15);
  border-color: rgba(0, 223, 216, 0.4);
  color: var(--accent-cyan);
}



.consulta-fecha-group small{display:block;margin-top:5px;color:#94a3b8;font-size:.72rem}.consulta-rapida-navbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 18px;padding:14px;border:1px solid var(--border-color);border-radius:12px;background:rgba(255,255,255,.025)}
.consulta-rapida-info{display:flex;flex-direction:column;min-width:190px;gap:3px}.consulta-rapida-info strong{font-size:14px}.consulta-rapida-info span{font-size:11px;color:var(--text-muted)}
.consulta-rapida-search{display:flex;gap:7px;flex:1;min-width:260px}.consulta-rapida-search input{flex:1;min-width:0}
.consulta-rapida-resultado{width:100%;display:flex;align-items:center;gap:10px;padding:9px;border:1px solid rgba(45,108,223,.35);border-radius:9px;background:rgba(45,108,223,.07)}
.consulta-rapida-resultado img{width:48px;height:48px;object-fit:cover;border-radius:7px}.consulta-rapida-producto{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}.consulta-rapida-producto strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.consulta-rapida-producto small{color:var(--text-muted);font-size:11px}.consulta-rapida-no-encontrado{width:100%;padding:9px 11px;border-radius:8px;background:rgba(220,53,69,.08);color:#ff8c96;font-size:12px}
.consulta-modal-card{width:100%;max-width:600px;max-height:85vh;overflow-y:auto;background:linear-gradient(145deg,#0f172a,#111827);border:1px solid rgba(96,165,250,.35);border-radius:18px;box-shadow:0 25px 80px rgba(0,0,0,.55);color:#e5e7eb;padding:24px}
.consulta-modal-card .modal-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:15px;border-bottom:1px solid rgba(96,165,250,.2)}
.consulta-modal-card .modal-header h3{margin:0;font-size:18px;font-weight:700;color:#fff}
.consulta-modal-card .modal-body{display:flex;flex-direction:column;gap:15px}
.consulta-modal-subtitle{margin:3px 0 0;font-size:11px;color:var(--text-muted)}.consulta-modal-search{padding:11px;border:1px solid var(--border-color);border-radius:9px;background:rgba(255,255,255,.025);margin-bottom:12px}.consulta-modal-search label{display:block;margin-bottom:7px;font-size:12px;font-weight:600}.consulta-productos-lista{display:flex;flex-direction:column;gap:8px}.consulta-producto-item{display:flex;align-items:center;gap:10px;padding:9px;border:1px solid var(--border-color);border-radius:9px;background:rgba(255,255,255,.018)}.consulta-producto-item img{width:55px;height:55px;object-fit:cover;border-radius:7px}.consulta-producto-info{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}.consulta-producto-info strong{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.consulta-producto-info small{color:var(--text-muted);font-size:10.5px}.consulta-producto-cantidad{display:flex;align-items:center;gap:7px}.consulta-producto-cantidad button{width:27px;height:27px;border:1px solid var(--border-color);border-radius:6px;background:rgba(255,255,255,.04);color:var(--text-main);cursor:pointer;font-size:16px}.consulta-producto-cantidad span{min-width:22px;text-align:center;font-weight:700}.consulta-producto-eliminar{width:28px;height:28px;border:0;border-radius:6px;background:rgba(220,53,69,.1);color:#ff727d;cursor:pointer}.consulta-vacia{text-align:center;padding:25px 10px;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:9px;font-size:12px}
@media(max-width:650px){.consulta-rapida-resultado{flex-wrap:wrap}.consulta-rapida-resultado .btn{width:100%}.consulta-producto-item{flex-wrap:wrap}.consulta-producto-info{min-width:calc(100% - 75px)}.consulta-producto-cantidad{margin-left:65px}}



.admin-panel input[placeholder="URL de imagen"],
.admin-panel input[placeholder="URL Imagen"] {
  display: none !important;
}


.admin-panel .box-convertidor-url {
  display: none !important;
}


.admin-panel .admin-section:has(#slide-upload) {
  position: relative;
}

.admin-panel .admin-section:has(#slide-upload) > h3 {
  color: #f8fafc;
  font-size: 18px;
  letter-spacing: .3px;
  margin-bottom: 18px;
}

.admin-panel .admin-section:has(#slide-upload) .file-upload-container {
  min-height: 86px;
  border: 1px dashed rgba(6, 182, 212, .38);
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(6,182,212,.075), rgba(255,255,255,.018));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color .3s ease, background .3s ease, transform .3s ease;
}

.admin-panel .admin-section:has(#slide-upload) .file-upload-container:hover {
  border-color: rgba(6, 182, 212, .72);
  background: linear-gradient(145deg, rgba(6,182,212,.12), rgba(255,255,255,.025));
  transform: translateY(-1px);
}

.admin-panel .admin-section:has(#slide-upload) .custom-file-upload {
  width: 100%;
  min-height: 86px;
  border-radius: 14px;
  color: #e2e8f0 !important;
  background: transparent !important;
  text-decoration: none !important;
  font-weight: 800 !important;
  letter-spacing: .3px;
}

.admin-panel .admin-section:has(#slide-upload) .custom-file-upload:hover {
  color: #67e8f9 !important;
}


.beta-slide-upload-preview {
  display: grid;
  grid-template-columns: minmax(180px, 260px) 1fr;
  gap: 16px;
  align-items: center;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid rgba(6,182,212,.22);
  border-radius: 14px;
  background: rgba(2,6,23,.55);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
}

.beta-slide-upload-preview-image {
  position: relative;
  height: 120px;
  overflow: hidden;
  border-radius: 10px;
  background: #070b14;
}

.beta-slide-upload-preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.beta-slide-preview-chip {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(3,4,8,.78);
  border: 1px solid rgba(6,182,212,.45);
  color: #67e8f9;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.beta-slide-upload-preview-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.beta-slide-upload-preview-info strong {
  color: #f8fafc;
  font-size: 13px;
}

.beta-slide-upload-preview-info span {
  color: #64748b;
  font-size: 11px;
}


.beta-slide-edit-preview {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-left: 5px;
  padding: 4px 7px 4px 4px;
  border: 1px solid rgba(6,182,212,.28);
  border-radius: 8px;
  background: rgba(6,182,212,.06);
  color: #67e8f9;
  font-size: 9px;
  font-weight: 800;
}

.beta-slide-edit-preview img {
  width: 34px;
  height: 24px;
  object-fit: cover;
  border-radius: 5px;
}


.admin-panel .admin-section:has(#slide-upload) .admin-products-list {
  margin-top: 18px;
  padding: 8px !important;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 16px;
  background: rgba(3,4,8,.34);
}

.admin-panel .admin-section:has(#slide-upload) .admin-products-list > div[style*="display:flex"] {
  position: relative;
  min-height: 76px;
  padding: 10px !important;
  border: 1px solid rgba(6, 182, 212, 0.16) !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(0, 112, 243, 0.10)) !important;
  transition: transform .25s ease, border-color .25s ease, background .25s ease;
}

.admin-panel .admin-section:has(#slide-upload) .admin-products-list > div[style*="display:flex"]:hover {
  transform: translateY(-2px);
  border-color: rgba(6,182,212,.25) !important;
  background: rgba(6,182,212,.045) !important;
}

.admin-panel .admin-section:has(#slide-upload) .admin-products-list > div[style*="display:flex"] > div:first-child {
  width: 100px !important;
  height: 62px !important;
  border-radius: 9px !important;
  border-color: rgba(255,255,255,.1) !important;
}

.admin-panel .admin-section:has(#slide-upload) .admin-products-list .pro-input {
  background: rgba(255,255,255,.035);
  border-color: rgba(255,255,255,.08);
  color: #f8fafc;
}

.admin-panel .admin-section:has(#slide-upload) .admin-products-list .pro-input:focus {
  border-color: rgba(6,182,212,.6);
  box-shadow: 0 0 0 3px rgba(6,182,212,.08);
}

.hero-carousel {
  position: relative;
  margin: 0 auto 28px;
  width: min(1180px, 100%);
  gap: 0;
}

.hero-carousel-viewport {
  position: relative;
  max-width: none;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 20px;
  box-shadow: 0 25px 70px rgba(0,0,0,.42), 0 0 0 1px rgba(6,182,212,.035);
  background: #030408;
}

.hero-carousel-track {
  transition: transform .75s cubic-bezier(.16,1,.3,1);
}

.hero-carousel-card {
  height: clamp(300px, 38vw, 510px);
  min-height: 260px;
  background: #030408;
}

.hero-carousel-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(3,4,8,.04) 25%, rgba(3,4,8,.28) 55%, rgba(3,4,8,.94) 100%);
}

.hero-carousel-card img {
  transform: scale(1.015);
  transition: transform 1.2s cubic-bezier(.16,1,.3,1), filter .8s ease;
}

.hero-carousel-card:hover img {
  transform: scale(1.045);
}

.hero-carousel-overlay {
  z-index: 2;
  inset: auto 0 0;
  min-height: 48%;
  padding: 34px clamp(20px, 4vw, 48px) 28px;
  background: linear-gradient(180deg, transparent, rgba(3,4,8,.82) 35%, rgba(3,4,8,.96));
  align-items: flex-end;
}

.hero-carousel-overlay h3 {
  max-width: 720px;
  margin-bottom: 8px;
  font-size: clamp(24px, 3.2vw, 42px);
  line-height: 1.05;
  letter-spacing: -.8px;
}

.hero-carousel-overlay p {
  color: #94a3b8;
  font-size: 12px;
  letter-spacing: .5px;
}

.hero-carousel-overlay .btn.primary {
  position: relative;
  z-index: 3;
  border: 1px solid rgba(6,182,212,.48);
  background: rgba(6,182,212,.12);
  color: #67e8f9;
  backdrop-filter: blur(10px);
  border-radius: 9px;
  padding: 11px 16px;
  font-weight: 800;
  transition: transform .25s ease, background .25s ease, box-shadow .25s ease;
}

.hero-carousel-overlay .btn.primary:hover {
  transform: translateY(-2px);
  background: #06b6d4;
  color: #030408;
  box-shadow: 0 12px 30px rgba(6,182,212,.22);
}

.hero-carousel-controls {
  position: absolute;
  inset: 0;
  pointer-events: none;
  justify-content: space-between;
  padding: 0 14px;
}

.hero-carousel-btn {
  pointer-events: auto;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(3,4,8,.48);
  backdrop-filter: blur(12px);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  box-shadow: 0 8px 24px rgba(0,0,0,.3);
  transition: transform .25s ease, background .25s ease, border-color .25s ease;
}

.hero-carousel-btn:hover {
  transform: scale(1.07);
  background: rgba(6,182,212,.18);
  border-color: rgba(6,182,212,.5);
}

.hero-carousel-dots {
  position: absolute;
  left: 50%;
  bottom: 17px;
  transform: translateX(-50%);
  z-index: 4;
  gap: 6px;
  padding: 5px 8px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 999px;
  background: rgba(3,4,8,.45);
  backdrop-filter: blur(10px);
}

.hero-carousel-dot {
  width: 24px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255,255,255,.22);
  transition: width .35s ease, background .35s ease;
}

.hero-carousel-dot.active {
  width: 42px;
  background: #06b6d4;
  box-shadow: 0 0 12px rgba(6,182,212,.35);
}

@media (max-width: 700px) {
  .beta-slide-upload-preview {
    grid-template-columns: 1fr;
  }

  .beta-slide-upload-preview-image {
    height: 150px;
  }

  .hero-carousel-card {
    height: 390px;
  }

  .hero-carousel-overlay {
    min-height: 58%;
    padding: 25px 18px 24px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
  }

  .hero-carousel-overlay .btn.primary {
    width: auto;
  }

  .hero-carousel-controls {
    padding: 0 8px;
  }

  .hero-carousel-btn {
    width: 38px;
    height: 38px;
  }

  .admin-panel .admin-section:has(#slide-upload) .admin-products-list > div[style*="display:flex"] > div:first-child {
    width: 78px !important;
  }
}




.admin-panel .admin-products-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  max-height: 430px !important;
  padding: 10px !important;
  margin-top: 18px !important;
  overflow-y: auto !important;
  border: 1px solid rgba(255,255,255,.07) !important;
  border-radius: 18px !important;
  background: linear-gradient(180deg, rgba(255,255,255,.025), rgba(3,4,8,.55)) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 16px 45px rgba(0,0,0,.18) !important;
}


.admin-panel .admin-products-list > div[style*="display:flex"] {
  position: relative !important;
  display: grid !important;
  grid-template-columns: 112px minmax(0, 1fr) auto !important;
  align-items: center !important;
  gap: 14px !important;
  width: 100% !important;
  min-height: 92px !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 12px !important;
  border: 1px solid rgba(255,255,255,.075) !important;
  border-radius: 15px !important;
  background: linear-gradient(135deg, rgba(15,23,42,.92), rgba(3,7,18,.96)) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.025) !important;
  overflow: hidden !important;
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease, background .25s ease !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"]::before {
  content: 'SLIDE';
  position: absolute !important;
  top: 8px !important;
  left: 120px !important;
  z-index: 4 !important;
  padding: 3px 7px !important;
  border: 1px solid rgba(6,182,212,.22) !important;
  border-radius: 999px !important;
  background: rgba(3,4,8,.78) !important;
  color: #67e8f9 !important;
  font-size: 8px !important;
  font-weight: 900 !important;
  letter-spacing: 1.4px !important;
  pointer-events: none !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"]:hover {
  transform: translateY(-2px) !important;
  border-color: rgba(6,182,212,.32) !important;
  background: linear-gradient(135deg, rgba(8,47,73,.48), rgba(3,7,18,.98)) !important;
  box-shadow: 0 16px 38px rgba(0,0,0,.32), 0 0 25px rgba(6,182,212,.055) !important;
}


.admin-panel .admin-products-list > div[style*="display:flex"] > div:first-child {
  position: relative !important;
  width: 112px !important;
  height: 68px !important;
  flex-shrink: 0 !important;
  border: 1px solid rgba(255,255,255,.12) !important;
  border-radius: 11px !important;
  background: #030408 !important;
  box-shadow: 0 7px 18px rgba(0,0,0,.35) !important;
  overflow: hidden !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] > div:first-child::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(6,182,212,.10), transparent 55%);
}

.admin-panel .admin-products-list > div[style*="display:flex"] > div:first-child img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  transition: transform .35s ease, filter .35s ease !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"]:hover > div:first-child img {
  transform: scale(1.06) !important;
  filter: saturate(1.08) contrast(1.04) !important;
}


.admin-panel .admin-products-list > div[style*="display:flex"] > div:nth-child(2) {
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 9px !important;
  padding-top: 14px !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] > div:nth-child(2) > div {
  display: flex !important;
  gap: 8px !important;
  align-items: center !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] .pro-input {
  min-width: 0 !important;
  box-sizing: border-box !important;
  background: rgba(255,255,255,.035) !important;
  border: 1px solid rgba(255,255,255,.09) !important;
  color: #f8fafc !important;
  border-radius: 9px !important;
  padding: 8px 10px !important;
  font-size: 12px !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] .pro-input::placeholder {
  color: #64748b !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] .pro-input:focus {
  outline: none !important;
  border-color: rgba(6,182,212,.62) !important;
  background: rgba(6,182,212,.045) !important;
  box-shadow: 0 0 0 3px rgba(6,182,212,.07) !important;
}


.admin-panel .admin-products-list > div[style*="display:flex"] input[placeholder="URL Imagen"] {
  display: none !important;
}


.admin-panel .admin-products-list > div[style*="display:flex"] label {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  min-width: 112px !important;
  min-height: 34px !important;
  box-sizing: border-box !important;
  padding: 7px 10px !important;
  border: 1px solid rgba(6,182,212,.25) !important;
  border-radius: 8px !important;
  background: rgba(6,182,212,.055) !important;
  color: #67e8f9 !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: .35px !important;
  text-decoration: none !important;
  cursor: pointer !important;
  transition: all .22s ease !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] label::before {
  content: '↥';
  font-size: 15px;
  line-height: 1;
}

.admin-panel .admin-products-list > div[style*="display:flex"] label:hover {
  background: rgba(6,182,212,.13) !important;
  border-color: rgba(6,182,212,.55) !important;
  color: #fff !important;
  transform: translateY(-1px) !important;
}


.admin-panel .admin-products-list .beta-slide-edit-preview {
  position: absolute !important;
  left: 12px !important;
  bottom: 10px !important;
  z-index: 5 !important;
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  margin: 0 !important;
  padding: 3px 6px 3px 3px !important;
  border: 1px solid rgba(6,182,212,.42) !important;
  border-radius: 7px !important;
  background: rgba(3,4,8,.88) !important;
  color: #67e8f9 !important;
  font-size: 8px !important;
  box-shadow: 0 5px 15px rgba(0,0,0,.35) !important;
}

.admin-panel .admin-products-list .beta-slide-edit-preview img {
  width: 28px !important;
  height: 20px !important;
  border-radius: 4px !important;
  object-fit: cover !important;
}


.admin-panel .admin-products-list > div[style*="display:flex"] > div:last-child {
  display: flex !important;
  flex-direction: column !important;
  gap: 7px !important;
  align-items: center !important;
  justify-content: center !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] > div:last-child .btn {
  width: 42px !important;
  height: 38px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255,255,255,.08) !important;
  font-size: 15px !important;
  transition: all .22s ease !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] > div:last-child .btn-save {
  background: rgba(16,185,129,.10) !important;
  border-color: rgba(16,185,129,.24) !important;
  color: #6ee7b7 !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] > div:last-child .btn-save:hover {
  background: #10b981 !important;
  color: #03110b !important;
  box-shadow: 0 8px 20px rgba(16,185,129,.20) !important;
  transform: translateY(-1px) !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] > div:last-child .btn-logout {
  background: rgba(239,68,68,.08) !important;
  border-color: rgba(239,68,68,.20) !important;
  color: #fca5a5 !important;
}

.admin-panel .admin-products-list > div[style*="display:flex"] > div:last-child .btn-logout:hover {
  background: #ef4444 !important;
  color: #fff !important;
  box-shadow: 0 8px 20px rgba(239,68,68,.20) !important;
  transform: translateY(-1px) !important;
}


@media (max-width: 760px) {
  .admin-panel .admin-products-list > div[style*="display:flex"] {
    grid-template-columns: 82px minmax(0,1fr) auto !important;
    gap: 10px !important;
    min-height: 84px !important;
    padding: 10px !important;
  }

  .admin-panel .admin-products-list > div[style*="display:flex"] > div:first-child {
    width: 82px !important;
    height: 58px !important;
  }

  .admin-panel .admin-products-list > div[style*="display:flex"]::before {
    left: 90px !important;
    top: 7px !important;
  }

  .admin-panel .admin-products-list > div[style*="display:flex"] > div:nth-child(2) {
    padding-top: 16px !important;
  }

  .admin-panel .admin-products-list > div[style*="display:flex"] > div:nth-child(2) > div:first-child {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .admin-panel .admin-products-list > div[style*="display:flex"] label {
    min-width: 0 !important;
    width: 100% !important;
  }

  .admin-panel .admin-products-list > div[style*="display:flex"] > div:last-child .btn {
    width: 36px !important;
    height: 34px !important;
  }
}



.admin-panel .admin-products-list {
  background: rgba(3, 4, 8, 0.42) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 16px !important;
  padding: 10px !important;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"],
.admin-panel .admin-products-list > div[style*="background: #fafafa"] {
  display: grid !important;
  grid-template-columns: 112px minmax(0, 1fr) 52px !important;
  align-items: center !important;
  gap: 16px !important;
  min-height: 96px !important;
  margin-bottom: 12px !important;
  padding: 12px !important;
  box-sizing: border-box !important;

  background:
    linear-gradient(135deg, rgba(10, 17, 31, 0.98), rgba(4, 8, 16, 0.98)) !important;

  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07) !important;
  border-radius: 14px !important;

  color: #f8fafc !important;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;

  transition:
    transform .22s ease,
    border-color .22s ease,
    box-shadow .22s ease !important;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"]:hover,
.admin-panel .admin-products-list > div[style*="background: #fafafa"]:hover {
  transform: translateY(-2px) !important;
  background:
    linear-gradient(135deg, rgba(12, 25, 40, 0.99), rgba(4, 9, 18, 0.99)) !important;
  border-color: rgba(6, 182, 212, 0.30) !important;
  box-shadow:
    0 14px 35px rgba(0, 0, 0, 0.34),
    0 0 0 1px rgba(6, 182, 212, 0.05) inset !important;
}


.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] > div:first-child,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] > div:first-child {
  width: 104px !important;
  height: 68px !important;
  flex-shrink: 0 !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 10px !important;
  overflow: hidden !important;
  background: #070b14 !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.30) !important;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] > div:first-child img,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] > div:first-child img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}


.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] > div:nth-child(2),
.admin-panel .admin-products-list > div[style*="background: #fafafa"] > div:nth-child(2) {
  min-width: 0 !important;
  color: #e2e8f0 !important;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] .pro-input,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] .pro-input {
  box-sizing: border-box !important;
  min-height: 36px !important;
  background: rgba(255,255,255,.035) !important;
  border: 1px solid rgba(255,255,255,.09) !important;
  border-radius: 8px !important;
  color: #f8fafc !important;
  caret-color: #67e8f9 !important;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] .pro-input::placeholder,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] .pro-input::placeholder {
  color: #64748b !important;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] .pro-input:focus,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] .pro-input:focus {
  outline: none !important;
  background: rgba(6,182,212,.055) !important;
  border-color: rgba(6,182,212,.55) !important;
  box-shadow: 0 0 0 3px rgba(6,182,212,.08) !important;
}


.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] label,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] label {
  color: #67e8f9 !important;
  background: rgba(6,182,212,.055) !important;
  border: 1px solid rgba(6,182,212,.22) !important;
  border-radius: 8px !important;
  padding: 8px 11px !important;
  text-decoration: none !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: .4px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all .2s ease !important;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] label:hover,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] label:hover {
  background: rgba(6,182,212,.13) !important;
  border-color: rgba(6,182,212,.50) !important;
  color: #fff !important;
}


.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] > div:last-child .btn,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] > div:last-child .btn {
  width: 40px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 9px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: 1px solid rgba(255,255,255,.08) !important;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] > div:last-child .btn-save,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] > div:last-child .btn-save {
  background: rgba(16,185,129,.10) !important;
  color: #6ee7b7 !important;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] > div:last-child .btn-logout,
.admin-panel .admin-products-list > div[style*="background: #fafafa"] > div:last-child .btn-logout {
  background: rgba(239,68,68,.09) !important;
  color: #fca5a5 !important;
}

@media (max-width: 760px) {
  .admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"],
  .admin-panel .admin-products-list > div[style*="background: #fafafa"] {
    grid-template-columns: 82px minmax(0, 1fr) 42px !important;
    gap: 10px !important;
    min-height: 88px !important;
    padding: 10px !important;
  }

  .admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] > div:first-child,
  .admin-panel .admin-products-list > div[style*="background: #fafafa"] > div:first-child {
    width: 82px !important;
    height: 58px !important;
  }

  .admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"] > div:last-child .btn,
  .admin-panel .admin-products-list > div[style*="background: #fafafa"] > div:last-child .btn {
    width: 34px !important;
    height: 32px !important;
  }
}



/* ================================================================
   AESTHETIC DARK ANALYTICS / E-COMMERCE V2
   Intentional redesign: dark editorial dashboard, not glassmorphism.
   Palette: #050505 / #0b0b0c / #141416 / #f5f5f5 / #8b8b8f
   ================================================================ */

.ventas-container {
  --bg-main: #050505 !important;
  --panel-bg: #0b0b0c !important;
  --card-bg: #101012 !important;
  --surface-2: #151517;
  --surface-3: #1b1b1e;
  --border-color: rgba(255,255,255,.075) !important;
  --border-focus: rgba(255,255,255,.28) !important;
  --primary: #f5f5f5 !important;
  --primary-hover: #ffffff !important;
  --accent-cyan: #f5f5f5 !important;
  --danger: #d0d0d0 !important;
  --danger-bg: rgba(255,255,255,.06) !important;
  --success: #e9e9e9 !important;
  --warning: #a8a8ad !important;
  --text-main: #f1f1f1 !important;
  --text-muted: #85858b !important;

  min-height: 100vh;
  padding: 92px 42px 48px !important;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(900px 500px at 72% -10%, rgba(255,255,255,.055), transparent 65%),
    radial-gradient(700px 500px at -10% 72%, rgba(255,255,255,.025), transparent 65%),
    #050505 !important;
  color: #f1f1f1 !important;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: -.18px;
}

/* Fine editorial grid: visible only at the edges, so the content stays clean. */
.ventas-container::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  opacity: .22;
  background-image:
    linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
  -webkit-mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.ventas-container::after {
  content: "";
  position: absolute;
  z-index: -1;
  width: 520px;
  height: 520px;
  top: 110px;
  right: -250px;
  border: 1px solid rgba(255,255,255,.055);
  border-radius: 50%;
  box-shadow: 0 0 0 70px rgba(255,255,255,.012), 0 0 0 140px rgba(255,255,255,.008);
  pointer-events: none;
}

.ventas-container.cart-is-open {
  padding-right: 448px !important;
}

.ventas-container > * {
  position: relative;
  z-index: 1;
}

/* ---------------------- typography ---------------------- */
.ventas-container h2 {
  margin: 0 !important;
  color: #f7f7f7 !important;
  background: none !important;
  -webkit-text-fill-color: #f7f7f7 !important;
  font-size: 30px !important;
  font-weight: 760 !important;
  letter-spacing: -1.15px !important;
  line-height: 1.05 !important;
}

.ventas-container h3 {
  color: #ededed !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  letter-spacing: -.15px !important;
}

.section-desc,
.subtitle,
.muted,
.text-muted {
  color: #77777d !important;
}

/* ---------------------- header / command bar ---------------------- */
.panel-header {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px !important;
  padding: 20px 22px !important;
  background: linear-gradient(180deg, #101012 0%, #0a0a0b 100%) !important;
  border: 1px solid rgba(255,255,255,.09) !important;
  border-radius: 15px !important;
  box-shadow: 0 18px 50px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.035) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.panel-header::before {
  content: "WORKSPACE / 01";
  display: block;
  position: absolute;
  left: 22px;
  top: 8px;
  color: #56565c;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2.5px;
}

.panel-header::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 52px;
  height: 2px;
  background: #ededed;
  border-radius: 0 2px 2px 0;
}

/* ---------------------- section cards ---------------------- */
.admin-panel {
  gap: 16px !important;
}

.admin-section {
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,.038), rgba(255,255,255,.018)) !important;
  border: 1px solid rgba(255,255,255,.075) !important;
  border-radius: 15px !important;
  box-shadow: 0 12px 40px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.022) !important;
  overflow: hidden;
}

.admin-section::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(#f1f1f1, transparent 75%);
  opacity: .55;
}

.admin-section:hover {
  border-color: rgba(255,255,255,.12) !important;
  box-shadow: 0 16px 48px rgba(0,0,0,.23), inset 0 1px 0 rgba(255,255,255,.028) !important;
}

.admin-grid-two-cols {
  gap: 16px !important;
}

/* ---------------------- analytics alert module ---------------------- */
.alert-vencimiento-container {
  background: #0b0b0c !important;
  border: 1px solid rgba(255,255,255,.075) !important;
  border-radius: 15px !important;
  box-shadow: 0 14px 42px rgba(0,0,0,.2) !important;
  overflow: hidden;
}

.alert-vencimiento-header {
  min-height: 58px;
  padding: 0 18px !important;
  border-bottom: 1px solid rgba(255,255,255,.065) !important;
  background: linear-gradient(90deg, rgba(255,255,255,.025), transparent) !important;
}

.alert-vencimiento-header h3::before {
  content: "01";
  margin-right: 10px;
  color: #55555a;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
}

.alert-vencimiento-list {
  padding: 10px !important;
}

.alert-vencimiento-card {
  background: #111113 !important;
  border: 1px solid rgba(255,255,255,.06) !important;
  border-left: 2px solid #77777d !important;
  border-radius: 10px !important;
  transition: transform .18s ease, background .18s ease, border-color .18s ease !important;
}

.alert-vencimiento-card:hover {
  background: #151517 !important;
  border-color: rgba(255,255,255,.13) !important;
  transform: translateX(3px);
}

.info-label {
  color: #5f5f65 !important;
  text-transform: uppercase;
  letter-spacing: .65px;
  font-size: 9px !important;
}

.info-value,
.text-highlight {
  color: #e7e7e7 !important;
}

.badge-vence-danger {
  background: #18181a !important;
  border: 1px solid rgba(255,255,255,.08) !important;
  color: #b5b5ba !important;
}

.days-remaining {
  background: #ededed !important;
  color: #0a0a0a !important;
}

.btn-alert-completar {
  background: #ededed !important;
  color: #0a0a0a !important;
  border: 0 !important;
  box-shadow: none !important;
}

.btn-alert-completar:hover {
  background: #ffffff !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 7px 18px rgba(255,255,255,.08) !important;
}

.btn-alert-completar {
  background: #ededed !important;
  color: #0a0a0a !important;
  border: 0 !important;
  cursor: pointer !important;
}

.btn-alert-completar:hover:not(:disabled) {
  background: #16a34a !important;
  color: #ffffff !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 7px 18px rgba(22, 163, 74, 0.35) !important;
}

.btn-alert-completar:active:not(:disabled) {
  background: #15803d !important;
  color: #ffffff !important;
  transform: translateY(0) !important;
}

.btn-alert-completar:disabled {
  cursor: not-allowed !important;
  opacity: .6;
}

/* ---------------------- customer + purchases workspace ---------------------- */
.billing-workspace {
  display: grid !important;
  grid-template-columns: 235px minmax(0,1fr) !important;
  gap: 22px !important;
  padding: 18px !important;
  background: #0a0a0b !important;
  border: 1px solid rgba(255,255,255,.075) !important;
  border-radius: 15px !important;
}

.filtro-clientes-sidebar {
  border-right: 1px solid rgba(255,255,255,.065) !important;
  padding-right: 18px !important;
}

.sidebar-header {
  padding: 2px 0 11px;
}

.sidebar-header h3 {
  font-size: 10px !important;
  text-transform: uppercase !important;
  letter-spacing: 1.1px !important;
  color: #85858b !important;
}

.btn-clear-inline {
  color: #7b7b80 !important;
  background: transparent !important;
  border: 0 !important;
}

.btn-clear-inline:hover {
  color: #ffffff !important;
}

.sidebar-customers-list {
  scrollbar-width: thin;
}

.sidebar-customer-item {
  position: relative;
  min-height: 48px;
  padding: 7px !important;
  margin-bottom: 3px;
  border: 1px solid transparent !important;
  border-radius: 9px !important;
  background: transparent !important;
  transition: .18s ease !important;
}

.sidebar-customer-item:hover {
  background: #111113 !important;
  border-color: rgba(255,255,255,.055) !important;
}

.sidebar-customer-item.active {
  background: linear-gradient(90deg, #1b1b1e, #111113) !important;
  border-color: rgba(255,255,255,.10) !important;
  box-shadow: inset 2px 0 #f0f0f0 !important;
}

.customer-mini-avatar {
  background: #171719 !important;
  color: #bdbdc2 !important;
  border: 1px solid rgba(255,255,255,.08) !important;
}

.sidebar-customer-item.active .customer-mini-avatar {
  background: #ededed !important;
  color: #111111 !important;
  border-color: #ededed !important;
}

.customer-mini-details .name {
  color: #dcdce0 !important;
}

.customer-mini-details .email {
  color: #626268 !important;
}

.sidebar-customer-item.active .customer-mini-details .name {
  color: #ffffff !important;
}

/* ---------------------- purchase records ---------------------- */
.facturas-carousel-zone {
  min-width: 0;
}

.section-header-flex {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,.055);
}

.factura-header {
  background: transparent !important;
}

.factura-id {
  color: #ededed !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: .3px;
}

.factura-fecha {
  color: #626268 !important;
}

.mini-factura-card {
  background: #101012 !important;
  border: 1px solid rgba(255,255,255,.065) !important;
  border-radius: 11px !important;
  box-shadow: none !important;
  transition: .18s ease !important;
}

.mini-factura-card:hover {
  background: #141416 !important;
  border-color: rgba(255,255,255,.13) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 30px rgba(0,0,0,.22) !important;
}

.factura-total {
  color: #ededed !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* ---------------------- quick search ---------------------- */
.consulta-rapida-navbar {
  margin-bottom: 16px !important;
  padding: 11px !important;
  background: #0b0b0c !important;
  border: 1px solid rgba(255,255,255,.07) !important;
  border-radius: 12px !important;
}

.consulta-rapida-info strong {
  color: #e8e8e8 !important;
}

.consulta-rapida-info span {
  color: #636369 !important;
}

.consulta-rapida-resultado {
  background: #111113 !important;
  border-color: rgba(255,255,255,.10) !important;
}

.consulta-rapida-no-encontrado {
  background: rgba(255,255,255,.045) !important;
  color: #a0a0a5 !important;
}

/* ---------------------- hero carousel ---------------------- */
.hero-carousel {
  margin-bottom: 22px !important;
  gap: 9px !important;
}

.hero-carousel-viewport {
  max-width: none !important;
  border: 1px solid rgba(255,255,255,.09) !important;
  border-radius: 15px !important;
  background: #080809 !important;
  box-shadow: 0 22px 65px rgba(0,0,0,.34) !important;
}

.hero-carousel-card {
  height: min(330px, 38vw) !important;
  min-height: 255px !important;
  background: #080809 !important;
}

.hero-carousel-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 42%, rgba(0,0,0,.78) 100%);
  pointer-events: none;
}

.hero-carousel-card img {
  opacity: .82;
  filter: grayscale(.12) contrast(1.04);
  transition: transform .7s cubic-bezier(.16,1,.3,1), opacity .4s ease, filter .4s ease !important;
}

.hero-carousel-card:hover img {
  transform: scale(1.035) !important;
  opacity: .92 !important;
  filter: grayscale(0) contrast(1.06) !important;
}

.hero-carousel-overlay {
  z-index: 2;
  padding: 22px 24px !important;
  background: linear-gradient(90deg, rgba(0,0,0,.76), rgba(0,0,0,.16)) !important;
}

.hero-carousel-overlay h3 {
  font-size: 24px !important;
  letter-spacing: -.7px !important;
  text-shadow: 0 3px 18px rgba(0,0,0,.35);
}

.hero-carousel-overlay p {
  color: #c1c1c5 !important;
  font-size: 12px !important;
}

.hero-carousel-controls {
  margin-top: -3px;
}

.hero-carousel-btn {
  width: 32px !important;
  height: 32px !important;
  background: #111113 !important;
  border: 1px solid rgba(255,255,255,.09) !important;
  color: #e8e8e8 !important;
  transition: .18s ease;
}

.hero-carousel-btn:hover {
  background: #ededed !important;
  color: #0a0a0a !important;
}

.hero-carousel-dot {
  width: 6px !important;
  height: 6px !important;
  background: #3b3b3f !important;
}

.hero-carousel-dot.active {
  width: 18px !important;
  border-radius: 99px !important;
  background: #eeeeee !important;
  transform: none !important;
}

/* ---------------------- product catalog ---------------------- */
.products-grid {
  grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)) !important;
  gap: 14px !important;
  margin-bottom: 26px !important;
}

.product-card {
  position: relative;
  background: #0d0d0f !important;
  border: 1px solid rgba(255,255,255,.075) !important;
  border-radius: 13px !important;
  box-shadow: 0 12px 32px rgba(0,0,0,.18) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  transition: transform .24s cubic-bezier(.16,1,.3,1), border-color .24s ease, box-shadow .24s ease !important;
}

.product-card::before {
  content: "";
  position: absolute;
  z-index: 3;
  top: 0;
  left: 14px;
  right: 14px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent);
}

.product-card:hover {
  transform: translateY(-6px) !important;
  border-color: rgba(255,255,255,.15) !important;
  box-shadow: 0 24px 48px rgba(0,0,0,.35) !important;
}

.product-image-wrapper {
  height: 205px !important;
  background: #070708 !important;
}

.product-image {
  opacity: .83 !important;
  filter: saturate(.82) contrast(1.02);
  transition: transform .55s cubic-bezier(.16,1,.3,1), opacity .4s ease, filter .4s ease !important;
}

.product-card:hover .product-image {
  opacity: 1 !important;
  filter: saturate(1) contrast(1.04) !important;
  transform: scale(1.035) !important;
}

.product-tag-overlay {
  top: 10px !important;
  left: 10px !important;
  background: rgba(8,8,9,.82) !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  color: #e4e4e4 !important;
  border-radius: 6px !important;
  padding: 5px 8px !important;
  backdrop-filter: blur(8px);
}

.product-body {
  padding: 16px !important;
}

.product-info h3 {
  color: #eeeeee !important;
  font-size: 14px !important;
  font-weight: 680 !important;
}

.product-description {
  color: #707077 !important;
  font-size: 11.5px !important;
}

.product-card .price {
  color: #f2f2f2 !important;
  font-size: 20px !important;
  font-weight: 720 !important;
  letter-spacing: -.5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
}

.quantity-selector {
  background: #080809 !important;
  border: 1px solid rgba(255,255,255,.075) !important;
  border-radius: 8px !important;
}

.qty-btn {
  color: #77777d !important;
}

.qty-btn:hover {
  background: #1a1a1c !important;
  color: #ffffff !important;
}

.qty-number {
  color: #ededed !important;
}

/* ---------------------- all buttons ---------------------- */
.ventas-container .btn {
  border-radius: 8px !important;
  font-weight: 680 !important;
  transition: transform .16s ease, background .16s ease, border-color .16s ease, color .16s ease, box-shadow .16s ease !important;
}

.ventas-container .btn.primary,
.btn-checkout-execute,
.modal-factura-actions-footer .btn.primary {
  background: #ededed !important;
  color: #0a0a0a !important;
  border: 1px solid #ededed !important;
  box-shadow: none !important;
}

.ventas-container .btn.primary:hover,
.btn-checkout-execute:hover:not(:disabled),
.modal-factura-actions-footer .btn.primary:hover:not(:disabled) {
  background: #ffffff !important;
  color: #000000 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 8px 24px rgba(255,255,255,.06) !important;
}

.btn-secondary {
  background: #111113 !important;
  color: #c7c7cc !important;
  border: 1px solid rgba(255,255,255,.08) !important;
}

.btn-secondary:hover {
  background: #18181a !important;
  border-color: rgba(255,255,255,.15) !important;
  color: #ffffff !important;
}

.btn-save {
  background: #e8e8e8 !important;
  color: #080808 !important;
  border: 0 !important;
}

.btn-save:hover {
  background: #ffffff !important;
}

.btn-logout {
  background: #111113 !important;
  color: #8a8a90 !important;
  border: 1px solid rgba(255,255,255,.07) !important;
}

.btn-logout:hover {
  background: #18181a !important;
  color: #ffffff !important;
  border-color: rgba(255,255,255,.13) !important;
}

/* ---------------------- admin tables / inventory ---------------------- */
.table-container {
  border: 1px solid rgba(255,255,255,.065) !important;
  border-radius: 11px !important;
  overflow: auto;
}

.pro-table {
  background: transparent !important;
}

.pro-table th {
  background: #101012 !important;
  color: #5f5f65 !important;
  border-bottom: 1px solid rgba(255,255,255,.07) !important;
  font-size: 9px !important;
  letter-spacing: .8px !important;
  text-transform: uppercase;
}

.pro-table td {
  color: #c4c4c8 !important;
  border-bottom: 1px solid rgba(255,255,255,.045) !important;
}

.pro-table tr:hover td {
  background: #111113 !important;
}

.admin-products-list {
  background: transparent !important;
}

.admin-product-row {
  background: #101012 !important;
  border: 1px solid rgba(255,255,255,.06) !important;
  border-radius: 10px !important;
  transition: .18s ease !important;
}

.admin-product-row:hover {
  background: #151517 !important;
  border-color: rgba(255,255,255,.13) !important;
}

/* The original file has inline styles on the image-management list.
   These selectors deliberately override those white/light blocks. */
.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"],
.admin-panel .admin-products-list > div[style*="background: #fafafa"] {
  background: #101012 !important;
  border-color: rgba(255,255,255,.065) !important;
  color: #d0d0d4 !important;
  border-radius: 10px !important;
  margin-bottom: 7px;
}

.admin-panel .admin-products-list > div[style*="border-bottom:1px solid #eee"]:hover,
.admin-panel .admin-products-list > div[style*="background: #fafafa"]:hover {
  background: #151517 !important;
}

.admin-panel .admin-products-list .pro-input,
.admin-panel .admin-products-list input[placeholder="URL Imagen"],
.admin-panel input[placeholder="URL de imagen"] {
  background: #080809 !important;
  color: #ededed !important;
  border-color: rgba(255,255,255,.08) !important;
}

.admin-panel .admin-products-list label {
  color: #77777d !important;
}

/* ---------------------- pagination ---------------------- */
.pagination-controls {
  border-top: 1px solid rgba(255,255,255,.06) !important;
  padding-top: 13px !important;
}

.btn-nav {
  background: #101012 !important;
  color: #a7a7ac !important;
  border: 1px solid rgba(255,255,255,.075) !important;
}

.btn-nav:hover:not(:disabled) {
  background: #18181a !important;
  color: #ffffff !important;
  border-color: rgba(255,255,255,.14) !important;
}

.page-indicator {
  color: #65656b !important;
}

.page-indicator strong {
  color: #eeeeee !important;
}

/* ---------------------- side cart / purchase panel ---------------------- */
.side-cart-panel {
  width: 410px !important;
  background: #080809 !important;
  border-left: 1px solid rgba(255,255,255,.09) !important;
  box-shadow: -24px 0 70px rgba(0,0,0,.42) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.cart-header-wrapper {
  border-bottom: 1px solid rgba(255,255,255,.075) !important;
}

.cart-title {
  color: #f0f0f0 !important;
  letter-spacing: .8px !important;
}

.btn-clear-cart {
  color: #66666c !important;
}

.btn-clear-cart:hover {
  color: #ffffff !important;
}

.btn-close-cart,
.btn-close {
  background: #111113 !important;
  border: 1px solid rgba(255,255,255,.08) !important;
  color: #a4a4aa !important;
  border-radius: 8px !important;
}

.btn-close-cart:hover,
.btn-close:hover {
  background: #ededed !important;
  border-color: #ededed !important;
  color: #0a0a0a !important;
}

.cart-item-row-advanced {
  background: #101012 !important;
  border: 1px solid rgba(255,255,255,.065) !important;
  border-radius: 10px !important;
}

.cart-item-row-advanced:hover {
  background: #151517 !important;
}

.cart-item-name,
.cart-item-price {
  color: #ededed !important;
}

.cart-item-qty {
  color: #66666c !important;
}

.cart-item-qty strong {
  color: #d6d6da !important;
}

.btn-action-cart {
  background: #151517 !important;
  border: 1px solid rgba(255,255,255,.065) !important;
  color: #8e8e94 !important;
}

.btn-action-cart:hover {
  background: #1c1c1f !important;
  color: #ffffff !important;
  border-color: rgba(255,255,255,.14) !important;
}

.cart-footer {
  border-top: 1px solid rgba(255,255,255,.075) !important;
}

/* ---------------------- date / checkout fields ---------------------- */
.cart-deadline-selector,
.deadline-field,
.full-width-date {
  background: #101012 !important;
  color: #e8e8e8 !important;
  border: 1px solid rgba(255,255,255,.08) !important;
}

.field-helper {
  color: #5f5f65 !important;
}

/* ---------------------- modals ---------------------- */
.modal-overlay,
.registro-preview-overlay {
  background: rgba(0,0,0,.78) !important;
  backdrop-filter: blur(7px) !important;
  -webkit-backdrop-filter: blur(7px) !important;
}

.consulta-modal-card,
.registro-preview-modal {
  background: #0d0d0f !important;
  color: #ededed !important;
  border: 1px solid rgba(255,255,255,.09) !important;
  border-radius: 15px !important;
  box-shadow: 0 30px 90px rgba(0,0,0,.62) !important;
}

.consulta-modal-search,
.consulta-producto-item {
  background: #111113 !important;
  border-color: rgba(255,255,255,.07) !important;
}

.consulta-producto-item:hover {
  background: #161618 !important;
}

.consulta-producto-cantidad button,
.consulta-producto-eliminar {
  background: #18181a !important;
  color: #d5d5d9 !important;
  border: 1px solid rgba(255,255,255,.08) !important;
}

/* ---------------------- toast ---------------------- */
.custom-toast {
  background: #101012 !important;
  border: 1px solid rgba(255,255,255,.09) !important;
  border-left: 2px solid #e7e7e7 !important;
  border-radius: 10px !important;
  box-shadow: 0 18px 55px rgba(0,0,0,.45) !important;
}

.custom-toast .toast-icon {
  background: #1b1b1e !important;
  color: #ededed !important;
}

.toast-title {
  color: #ededed !important;
}

.toast-message {
  color: #77777d !important;
}

/* ---------------------- floating whatsapp ---------------------- */
.whatsapp-floating-btn {
  background: #ededed !important;
  box-shadow: 0 15px 40px rgba(0,0,0,.4) !important;
}

.whatsapp-icon {
  fill: #080808 !important;
}

.pulse-ring {
  border-color: #ededed !important;
}

/* ---------------------- scrollbars ---------------------- */
.ventas-container ::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.ventas-container ::-webkit-scrollbar-track {
  background: #080809;
}

.ventas-container ::-webkit-scrollbar-thumb {
  background: #333337;
  border-radius: 999px;
}

.ventas-container ::-webkit-scrollbar-thumb:hover {
  background: #55555a;
}

/* ---------------------- responsive ---------------------- */
@media (max-width: 1100px) {
  .ventas-container {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }
  .ventas-container.cart-is-open {
    padding-right: 24px !important;
  }
  .side-cart-panel {
    width: min(410px, 100vw) !important;
  }
}

@media (max-width: 900px) {
  .billing-workspace {
    grid-template-columns: 1fr !important;
  }
  .filtro-clientes-sidebar {
    border-right: 0 !important;
    border-bottom: 1px solid rgba(255,255,255,.065) !important;
    padding-right: 0 !important;
    padding-bottom: 14px !important;
  }
  .admin-grid-two-cols {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 650px) {
  .ventas-container {
    padding: 76px 13px 24px !important;
  }
  .panel-header {
    padding: 20px 17px !important;
  }
  .ventas-container h2 {
    font-size: 25px !important;
  }
  .products-grid {
    grid-template-columns: repeat(2, minmax(0,1fr)) !important;
    gap: 10px !important;
  }
  .product-image-wrapper {
    height: 160px !important;
  }
  .product-body {
    padding: 13px !important;
  }
  .product-actions {
    gap: 8px !important;
  }
  .action-buttons-group {
    grid-template-columns: 1fr !important;
  }
  .hero-carousel-card {
    min-height: 230px !important;
    height: 60vw !important;
  }

  .admin-panel {
    gap: 16px !important;
  }

  .admin-views-switcher {
    width: 100% !important;
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
  }

  .admin-view-tab {
    width: 100% !important;
    padding: 10px 8px !important;
    font-size: 0.72rem !important;
  }

  .admin-section {
    padding: 16px !important;
    border-radius: 12px !important;
  }

  .billing-workspace {
    grid-template-columns: 1fr !important;
    padding: 12px !important;
    gap: 14px !important;
  }

  .filtro-clientes-sidebar {
    border-right: none !important;
    border-bottom: 1px solid rgba(255,255,255,.08) !important;
    padding-right: 0 !important;
    padding-bottom: 12px !important;
    max-height: none !important;
  }

  .section-header-flex {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px !important;
  }

  .facturas-carousel {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    overflow: visible !important;
  }

  .mini-factura-card {
    flex: 1 1 auto !important;
    min-height: auto !important;
  }

  .factura-footer {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px !important;
  }

  .factura-footer > div:last-child {
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }

  .btn-vista-previa,
  .btn-alert-completar {
    width: 100% !important;
    justify-content: center !important;
  }

  .admin-grid-two-cols,
  .stats-panels-grid,
  .stats-panels-grid.two-columns,
  .stats-kpis-grid {
    grid-template-columns: 1fr !important;
  }

  .stats-kpis-grid {
    gap: 10px !important;
  }

  .stats-bar-row {
    grid-template-columns: 1fr !important;
    gap: 6px !important;
  }

  .stats-list-item {
    align-items: flex-start !important;
    flex-direction: column !important;
  }

  .stock-header-row {
    align-items: flex-start !important;
    flex-direction: column !important;
  }

  .stock-type-switcher {
    width: 100% !important;
  }

  .stock-type-btn {
    flex: 1 1 30% !important;
    min-width: 0 !important;
  }

  .stats-stock-table th,
  .stats-stock-table td {
    padding: 7px 8px !important;
    font-size: 0.69rem !important;
  }

  .registro-preview-modal {
    width: min(94vw, 100%) !important;
    border-radius: 14px !important;
  }

  .registro-preview-meta {
    grid-template-columns: 1fr !important;
  }

  .registro-preview-product-row {
    grid-template-columns: 52px 1fr auto !important;
  }

  .registro-preview-product-row img {
    width: 52px !important;
    height: 52px !important;
  }

  .registro-preview-footer {
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .registro-preview-footer > div {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
  }

  .registro-preview-completar {
    width: 100% !important;
  }

  .chart-panel-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .stats-column-chart {
    gap: 5px;
  }

  .stats-column-item > strong {
    font-size: 0.58rem;
  }

  .stats-visual-summary {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .stats-donut-section {
    align-items: flex-start;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .stats-donut-copy,
  .stats-donut-legend {
    flex-basis: 100%;
  }

  .stats-donut {
    margin: 0 auto;
  }
}


/* FIX FINAL: vista previa de registros */
.registro-preview-overlay {
  position: fixed !important;
  inset: 0 !important;
  z-index: 99999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px !important;
  pointer-events: auto !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.registro-preview-overlay .registro-preview-modal {
  position: relative !important;
  z-index: 100000 !important;
  pointer-events: auto !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.btn-vista-previa {
  position: relative !important;
  z-index: 2 !important;
  pointer-events: auto !important;
  cursor: pointer !important;
}

.btn-vista-previa:hover {
  background: rgba(37, 99, 235, 0.30) !important;
  transform: translateY(-1px);
}

.admin-sales-view {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.admin-sales-view > .alert-vencimiento-container,
.admin-sales-view > .billing-workspace {
  margin: 0;
}


/* ========================================================================== */
/* AGENDA / CALENDARIO DEL ADMIN                                             */
/* ========================================================================== */

.admin-calendar-slide-enter-active,
.admin-calendar-slide-leave-active {
  transition: opacity .28s ease, transform .34s cubic-bezier(.16,1,.3,1);
}
.admin-calendar-slide-enter-from { opacity:0; transform:translateX(70px); }
.admin-calendar-slide-leave-to { opacity:0; transform:translateX(-70px); }

.admin-calendar-view {
  position: relative;
  overflow: visible;
  margin-top: 18px;
  padding: 0;
}

/* ========================= CALENDARIO ADMIN ========================= */
.calendar-header {
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:18px;
  flex-wrap:wrap;
  margin-bottom:16px;
}
.calendar-header h3 { margin:0 0 5px; }
.calendar-header .section-desc { margin:0; max-width:720px; line-height:1.5; }

.calendar-header-actions {
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:7px;
  flex-wrap:wrap;
  margin-left:auto;
}

.calendar-view-switch {
  display:inline-flex;
  align-items:center;
  gap:3px;
  padding:3px;
  border:1px solid rgba(148,163,184,.2);
  border-radius:11px;
  background:rgba(2,6,23,.72);
  box-shadow:0 8px 24px rgba(0,0,0,.14);
}
.calendar-view-switch button {
  min-width:72px;
  border:0;
  border-radius:8px;
  padding:8px 12px;
  background:transparent;
  color:#94a3b8;
  cursor:pointer;
  font-size:.72rem;
  font-weight:850;
  transition:all .18s ease;
}
.calendar-view-switch button:hover { color:#e2e8f0; background:rgba(255,255,255,.045); }
.calendar-view-switch button.active {
  color:#fff;
  background:linear-gradient(135deg,rgba(37,99,235,.9),rgba(8,145,178,.78));
  box-shadow:0 4px 14px rgba(37,99,235,.25);
}

.calendar-nav-btn,
.calendar-today-btn,
.calendar-add-btn,
.calendar-save-btn,
.calendar-cancel-btn,
.calendar-delete-btn,
.calendar-complete-btn {
  border:1px solid rgba(148,163,184,.22);
  border-radius:9px;
  padding:9px 12px;
  cursor:pointer;
  font-weight:750;
  font-size:.76rem;
  line-height:1;
  transition:all .18s ease;
}
.calendar-nav-btn,
.calendar-today-btn {
  background:rgba(15,23,42,.68);
  color:#cbd5e1;
}
.calendar-nav-btn:hover,
.calendar-today-btn:hover {
  color:#fff;
  background:rgba(37,99,235,.13);
  border-color:rgba(96,165,250,.42);
  transform:translateY(-1px);
}
.calendar-today-btn {
  color:#93c5fd;
  border-color:rgba(59,130,246,.25);
}
.calendar-add-btn,
.calendar-save-btn {
  color:#fff;
  border-color:transparent;
  background:linear-gradient(135deg,#2563eb,#0891b2);
  box-shadow:0 7px 18px rgba(37,99,235,.16);
}
.calendar-add-btn:hover,
.calendar-save-btn:hover {
  transform:translateY(-1px);
  box-shadow:0 10px 24px rgba(37,99,235,.27);
}

/* Próximas */
.calendar-upcoming-alert {
  position:relative;
  overflow:hidden;
  margin-bottom:16px;
  padding:14px;
  border:1px solid rgba(245,158,11,.27);
  border-radius:15px;
  background:
    radial-gradient(circle at 100% 0,rgba(245,158,11,.09),transparent 35%),
    linear-gradient(135deg,rgba(245,158,11,.075),rgba(15,23,42,.68));
  box-shadow:0 10px 28px rgba(0,0,0,.12);
}
.calendar-upcoming-title {
  display:flex;
  align-items:center;
  gap:8px;
  margin-bottom:10px;
  color:#fbbf24;
}
.calendar-upcoming-title span { font-size:1rem; }
.calendar-upcoming-title strong { font-size:.78rem; letter-spacing:.02em; }
.calendar-upcoming-list {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:9px;
}
.calendar-upcoming-item {
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:7px;
  padding:10px;
  border:1px solid rgba(148,163,184,.13);
  border-radius:10px;
  background:rgba(2,6,23,.58);
  transition:transform .18s ease,border-color .18s ease;
}
.calendar-upcoming-item:hover { transform:translateY(-1px); border-color:rgba(96,165,250,.3); }
.calendar-upcoming-item > div { min-width:0; }
.calendar-upcoming-item strong {
  display:block;
  overflow:hidden;
  color:#f8fafc;
  font-size:.78rem;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.calendar-upcoming-item small {
  display:block;
  margin-top:3px;
  overflow:hidden;
  color:#94a3b8;
  font-size:.65rem;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.calendar-upcoming-item > span:last-child {
  align-self:flex-start;
  font-size:.59rem;
  font-weight:900;
  letter-spacing:.04em;
}
.calendar-upcoming-priority,
.calendar-task-priority,
.calendar-completed-priority {
  font-weight:900;
  letter-spacing:.03em;
}
.calendar-upcoming-priority { font-size:.58rem; }
.calendar-task-priority { font-size:.57rem; }
.calendar-completed-priority { display:inline-block; margin-top:3px; font-size:.58rem; }

.calendar-priority-alta { color:#f87171 !important; }
.calendar-priority-media { color:#fbbf24 !important; }
.calendar-priority-baja { color:#cbd5e1 !important; }

/* Toolbar */
.calendar-toolbar {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  flex-wrap:wrap;
  margin:18px 0 12px;
  padding:12px 14px;
  border:1px solid var(--border-color);
  border-radius:13px;
  background:linear-gradient(135deg,rgba(15,23,42,.58),rgba(15,23,42,.38));
}
.calendar-toolbar > div {
  display:flex;
  align-items:baseline;
  gap:10px;
  flex-wrap:wrap;
}
.calendar-toolbar strong {
  color:#f8fafc;
  font-size:.82rem;
  text-transform:capitalize;
}
.calendar-toolbar span {
  color:var(--text-muted);
  font-size:.7rem;
}

/* Vista semanal */
.calendar-week {
  display:grid;
  grid-template-columns:repeat(7,minmax(145px,1fr));
  gap:8px;
  overflow-x:auto;
  padding:2px 2px 8px;
}
.calendar-day {
  min-height:330px;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border:1px solid var(--border-color);
  border-radius:13px;
  background:linear-gradient(180deg,rgba(15,23,42,.62),rgba(15,23,42,.44));
  box-shadow:0 8px 20px rgba(0,0,0,.08);
}
.calendar-day-today {
  border-color:rgba(59,130,246,.58);
  box-shadow:inset 0 2px 0 rgba(59,130,246,.85),0 8px 22px rgba(37,99,235,.08);
}
.calendar-day-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  padding:10px;
  border-bottom:1px solid rgba(148,163,184,.12);
  background:rgba(255,255,255,.025);
}
.calendar-day-header span {
  color:#94a3b8;
  font-size:.67rem;
  font-weight:850;
  text-transform:uppercase;
}
.calendar-day-header strong {
  width:28px;
  height:28px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  color:#e2e8f0;
  background:rgba(148,163,184,.12);
  font-size:.74rem;
}
.calendar-day-today .calendar-day-header strong {
  color:#fff;
  background:#2563eb;
  box-shadow:0 4px 12px rgba(37,99,235,.3);
}
.calendar-day-tasks {
  flex:1;
  display:flex;
  flex-direction:column;
  gap:7px;
  padding:8px;
}
.calendar-task-card {
  width:100%;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:4px;
  padding:9px;
  border:1px solid rgba(148,163,184,.16);
  border-radius:9px;
  color:#e2e8f0;
  background:rgba(30,41,59,.7);
  text-align:left;
  cursor:pointer;
  transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease;
}
.calendar-task-card:hover {
  transform:translateY(-1px);
  border-color:rgba(96,165,250,.48);
  background:rgba(37,99,235,.1);
  box-shadow:0 6px 14px rgba(0,0,0,.12);
}
.calendar-task-card strong {
  width:100%;
  color:#f1f5f9;
  font-size:.76rem;
  line-height:1.28;
}
.calendar-task-card small {
  width:100%;
  overflow:hidden;
  color:#94a3b8;
  font-size:.65rem;
  line-height:1.3;
  text-overflow:ellipsis;
}
.calendar-task-time {
  color:#93c5fd;
  font-size:.62rem;
  font-weight:850;
}
.calendar-task-status {
  margin-top:3px;
  font-size:.58rem;
  font-weight:900;
  letter-spacing:.04em;
}
.calendar-task-overdue {
  border-color:rgba(239,68,68,.58);
  background:rgba(127,29,29,.19);
}
.calendar-task-overdue .calendar-task-status { color:#fca5a5; }
.calendar-task-urgent {
  border-color:rgba(245,158,11,.52);
  background:rgba(120,53,15,.17);
}
.calendar-task-urgent .calendar-task-status { color:#fcd34d; }
.calendar-task-soon { border-color:rgba(59,130,246,.43); }
.calendar-task-soon .calendar-task-status { color:#93c5fd; }
.calendar-task-normal .calendar-task-status { color:#86efac; }

.calendar-task-card.calendar-priority-alta {
  border-color:rgba(239,68,68,.62);
  box-shadow:inset 3px 0 0 rgba(239,68,68,.82);
}
.calendar-task-card.calendar-priority-media { box-shadow:inset 3px 0 0 rgba(245,158,11,.58); }
.calendar-task-card.calendar-priority-baja { box-shadow:inset 3px 0 0 rgba(148,163,184,.35); }
.calendar-priority-select { cursor:pointer; }

.calendar-empty-day {
  flex:1;
  min-height:100px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#64748b;
  font-size:.69rem;
}
.calendar-day-add {
  margin:0 8px 8px;
  padding:7px;
  border:1px dashed rgba(148,163,184,.25);
  border-radius:8px;
  color:#94a3b8;
  background:transparent;
  cursor:pointer;
  font-size:.67rem;
  font-weight:750;
  transition:all .16s ease;
}
.calendar-day-add:hover {
  color:#fff;
  border-color:rgba(96,165,250,.48);
  background:rgba(59,130,246,.08);
}

/* Vista mensual tipo calendario de celular */
.calendar-month-view {
  margin-top:4px;
  overflow:hidden;
  border:1px solid var(--border-color);
  border-radius:15px;
  background:#0b1220;
  box-shadow:0 12px 30px rgba(0,0,0,.12);
}
.calendar-month-weekdays {
  display:grid;
  grid-template-columns:repeat(7,minmax(0,1fr));
  border-bottom:1px solid rgba(148,163,184,.15);
  background:rgba(255,255,255,.025);
}
.calendar-month-weekdays span {
  padding:11px 5px;
  color:#94a3b8;
  text-align:center;
  font-size:.64rem;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:.06em;
}
.calendar-month-grid {
  display:grid;
  grid-template-columns:repeat(7,minmax(0,1fr));
}
.calendar-month-day {
  position:relative;
  min-width:0;
  min-height:126px;
  padding:8px;
  overflow:hidden;
  border:0;
  border-right:1px solid rgba(148,163,184,.1);
  border-bottom:1px solid rgba(148,163,184,.1);
  color:#e2e8f0;
  background:rgba(15,23,42,.38);
  text-align:left;
  cursor:pointer;
  transition:background .16s ease,box-shadow .16s ease,transform .16s ease;
}
.calendar-month-day:nth-child(7n) { border-right:0; }
.calendar-month-day:hover { background:rgba(37,99,235,.08); }
.calendar-month-day:focus-visible {
  outline:2px solid #60a5fa;
  outline-offset:-2px;
}
.calendar-month-day-outside {
  background:rgba(15,23,42,.18);
  opacity:.43;
}
.calendar-month-day-today {
  box-shadow:inset 0 3px 0 #2563eb;
}
.calendar-month-day-selected {
  z-index:1;
  background:rgba(37,99,235,.14);
  box-shadow:inset 0 0 0 2px rgba(59,130,246,.62);
}
.calendar-month-day-selected .calendar-month-number {
  color:#fff;
  background:#2563eb;
  box-shadow:0 4px 12px rgba(37,99,235,.28);
}
.calendar-month-day-has-tasks { background:rgba(15,23,42,.48); }
.calendar-month-day-high {
  box-shadow:inset 3px 0 0 rgba(239,68,68,.8);
}
.calendar-month-day-selected.calendar-month-day-high {
  box-shadow:inset 3px 0 0 rgba(239,68,68,.8),inset 0 0 0 2px rgba(59,130,246,.62);
}
.calendar-month-number {
  width:29px;
  height:29px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  color:#cbd5e1;
  font-size:.74rem;
  font-weight:900;
}
.calendar-month-day-today:not(.calendar-month-day-selected) .calendar-month-number {
  color:#60a5fa;
  background:rgba(37,99,235,.1);
}
.calendar-month-task-summary {
  display:flex;
  flex-direction:column;
  gap:4px;
  margin-top:7px;
}
.calendar-month-task-dot {
  display:block;
  max-width:100%;
  overflow:hidden;
  padding:4px 6px;
  border:1px solid rgba(148,163,184,.1);
  border-left:3px solid currentColor;
  border-radius:6px;
  color:#cbd5e1;
  background:rgba(30,41,59,.78);
  font-size:.59rem;
  font-weight:800;
  line-height:1.25;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.calendar-month-task-dot.calendar-priority-alta {
  color:#fca5a5 !important;
  background:rgba(127,29,29,.25);
}
.calendar-month-task-dot.calendar-priority-media {
  color:#fcd34d !important;
  background:rgba(120,53,15,.22);
}
.calendar-month-task-dot.calendar-priority-baja {
  color:#cbd5e1 !important;
  background:rgba(71,85,105,.2);
}
.calendar-month-task-summary small {
  color:#64748b;
  font-size:.58rem;
  font-weight:850;
}
.calendar-month-empty {
  display:block;
  margin-top:9px;
  color:#334155;
  font-size:.66rem;
}

/* Día seleccionado */
.calendar-selected-day-panel {
  margin-top:14px;
  padding:15px;
  border:1px solid rgba(59,130,246,.25);
  border-radius:15px;
  background:
    radial-gradient(circle at 100% 0,rgba(37,99,235,.1),transparent 32%),
    linear-gradient(135deg,rgba(37,99,235,.085),rgba(15,23,42,.52));
}
.calendar-selected-day-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:12px;
}
.calendar-selected-day-header > div > span {
  color:#60a5fa;
  font-size:.62rem;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:.06em;
}
.calendar-selected-day-header h4 {
  margin:3px 0 0;
  color:#f8fafc;
  font-size:.9rem;
  text-transform:capitalize;
}
.calendar-selected-day-tasks {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:8px;
}
.calendar-selected-day-empty {
  padding:18px;
  border:1px dashed rgba(148,163,184,.15);
  border-radius:10px;
  color:#64748b;
  background:rgba(2,6,23,.18);
  text-align:center;
  font-size:.72rem;
}

/* Historial */
.calendar-completed-section {
  margin-top:18px;
  padding:15px;
  border:1px solid var(--border-color);
  border-radius:14px;
  background:rgba(15,23,42,.4);
}
.calendar-completed-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
}
.calendar-completed-header h4 { margin:0 0 4px; color:#f8fafc; font-size:.92rem; }
.calendar-completed-header p { margin:0; color:#64748b; font-size:.68rem; }
.calendar-completed-header > span { color:#86efac; font-size:.67rem; font-weight:850; }
.calendar-completed-list {
  display:flex;
  flex-direction:column;
  gap:7px;
  margin-top:12px;
}
.calendar-completed-item {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:10px 11px;
  border:1px solid rgba(34,197,94,.1);
  border-radius:9px;
  background:rgba(34,197,94,.045);
}
.calendar-completed-item > div { min-width:0; }
.calendar-completed-item strong {
  display:block;
  overflow:hidden;
  color:#94a3b8;
  font-size:.76rem;
  white-space:nowrap;
  text-overflow:ellipsis;
  text-decoration:line-through;
  text-decoration-thickness:2px;
  text-decoration-color:#ef4444;
}
.calendar-completed-item span:not(.calendar-completed-badge) {
  display:block;
  margin-top:3px;
  color:#64748b;
  font-size:.63rem;
}
.calendar-completed-badge {
  flex-shrink:0;
  color:#86efac;
  font-size:.59rem;
  font-weight:900;
}
.calendar-completed-empty {
  margin-top:12px;
  padding:12px;
  border-radius:8px;
  color:#64748b;
  background:rgba(2,6,23,.16);
  text-align:center;
  font-size:.71rem;
}

/* Modal */
.calendar-task-modal-overlay {
  position:fixed;
  inset:0;
  z-index:100000;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  box-sizing:border-box;
  background:rgba(2,4,10,.8);
  backdrop-filter:blur(9px);
}
.calendar-task-modal {
  width:min(560px,100%);
  max-height:90vh;
  overflow-y:auto;
  border:1px solid rgba(96,165,250,.3);
  border-radius:18px;
  background:#0d1224;
  box-shadow:0 28px 90px rgba(0,0,0,.58);
}
.calendar-task-modal-header {
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:15px;
  padding:18px 18px 14px;
  border-bottom:1px solid var(--border-color);
}
.calendar-task-modal-header h3 { margin:0 0 4px; }
.calendar-task-modal-header p { margin:0; color:#64748b; font-size:.72rem; }
.calendar-modal-close {
  width:32px;
  height:32px;
  flex-shrink:0;
  border:1px solid rgba(148,163,184,.18);
  border-radius:8px;
  color:#cbd5e1;
  background:rgba(255,255,255,.03);
  cursor:pointer;
  transition:all .16s ease;
}
.calendar-modal-close:hover {
  color:#fff;
  background:rgba(239,68,68,.12);
  border-color:rgba(239,68,68,.3);
}
.calendar-task-form {
  display:flex;
  flex-direction:column;
  gap:13px;
  padding:18px;
}
.calendar-task-form label {
  display:flex;
  flex-direction:column;
  gap:6px;
  color:#cbd5e1;
  font-size:.72rem;
  font-weight:750;
}
.calendar-task-form .pro-input {
  width:100%;
  box-sizing:border-box;
}
.calendar-form-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}
.calendar-task-textarea {
  min-height:90px;
  resize:vertical;
  font-family:inherit;
}
.calendar-modal-actions {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin-top:4px;
}
.calendar-modal-actions-right {
  display:flex;
  justify-content:flex-end;
  gap:8px;
}
.calendar-cancel-btn {
  color:#cbd5e1;
  background:rgba(148,163,184,.08);
}
.calendar-cancel-btn:hover {
  background:rgba(148,163,184,.14);
}
.calendar-delete-btn {
  color:#fca5a5;
  border-color:rgba(239,68,68,.25);
  background:rgba(239,68,68,.1);
}
.calendar-delete-btn:hover { background:rgba(239,68,68,.18); }
.calendar-complete-btn {
  width:100%;
  color:#fff;
  border-color:transparent;
  background:linear-gradient(135deg,#10b981,#059669);
  box-shadow:0 7px 18px rgba(16,185,129,.16);
}
.calendar-complete-btn:hover {
  transform:translateY(-1px);
  box-shadow:0 10px 22px rgba(16,185,129,.23);
}

/* Responsive */
@media (max-width:1100px) {
  .calendar-upcoming-list { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width:900px) {
  .calendar-header-actions { width:100%; justify-content:flex-start; margin-left:0; }
  .calendar-month-day { min-height:112px; }
}
@media (max-width:760px) {
  .calendar-month-weekdays span { padding:9px 3px; font-size:.57rem; }
  .calendar-month-day { min-height:98px; padding:6px; }
  .calendar-month-number { width:26px; height:26px; font-size:.69rem; }
  .calendar-month-task-summary { gap:3px; margin-top:5px; }
  .calendar-month-task-dot {
    padding:3px 4px;
    border-left-width:2px;
    font-size:.52rem;
  }
  .calendar-month-empty { display:none; }
  .calendar-selected-day-tasks { grid-template-columns:1fr; }
}
@media (max-width:620px) {
  .calendar-header-actions { display:grid; grid-template-columns:1fr 1fr; }
  .calendar-view-switch { grid-column:1/-1; justify-self:stretch; }
  .calendar-view-switch button { flex:1; }
  .calendar-header-actions > .calendar-nav-btn,
  .calendar-header-actions > .calendar-today-btn { width:100%; }
  .calendar-upcoming-list { grid-template-columns:1fr; }
  .calendar-toolbar { align-items:stretch; }
  .calendar-toolbar > div { flex-direction:column; gap:3px; }
  .calendar-add-btn { width:100%; }
}
@media (max-width:560px) {
  .calendar-form-grid { grid-template-columns:1fr; }
  .calendar-modal-actions { align-items:stretch; flex-direction:column; }
  .calendar-modal-actions-right { width:100%; }
  .calendar-modal-actions-right > button { flex:1; }
  .calendar-task-modal-overlay { padding:10px; }
  .calendar-task-modal { max-height:94vh; border-radius:15px; }
  .calendar-task-form { padding:14px; }
  .calendar-task-modal-header { padding:15px 14px 12px; }
}
@media (max-width:430px) {
  .calendar-month-day { min-height:84px; padding:5px 4px; }
  .calendar-month-number { width:24px; height:24px; }
  .calendar-month-task-dot {
    padding:2px 3px;
    font-size:.47rem;
  }
  .calendar-month-task-summary { margin-top:4px; }
  .calendar-month-task-dot:nth-child(n+3) { display:none; }
}
/* ========================================================================== */
/* TRANSICIÓN DE REDIRECCIÓN A WHATSAPP                                      */
/* ========================================================================== */

.whatsapp-redirect-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgba(2, 4, 10, 0.88);
  backdrop-filter: blur(10px);
}

.whatsapp-redirect-card {
  width: min(430px, 100%);
  padding: 34px 28px 30px;
  border-radius: 22px;
  text-align: center;
  background: #101214;
  border: 1px solid rgba(37, 211, 102, 0.35);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
}

.whatsapp-redirect-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(37, 211, 102, 0.14);
  border: 1px solid rgba(37, 211, 102, 0.35);
  color: #25d366;
  font-size: 32px;
  font-weight: 800;
}

.whatsapp-redirect-spinner {
  width: 28px;
  height: 28px;
  margin: 0 auto 20px;
  border: 3px solid rgba(255, 255, 255, 0.16);
  border-top-color: #25d366;
  border-radius: 50%;
  animation: whatsappRedirectSpin 0.8s linear infinite;
}

.whatsapp-redirect-card h2 {
  margin: 0 0 9px;
  color: #f5f6f7;
  font-size: clamp(1.25rem, 3vw, 1.55rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.whatsapp-redirect-card p {
  margin: 0 0 8px;
  color: #d9dee2;
  font-size: 0.96rem;
  line-height: 1.5;
}

.whatsapp-redirect-card small {
  display: block;
  color: #aeb6bc;
  font-size: 0.82rem;
}

.whatsapp-redirect-fade-enter-active,
.whatsapp-redirect-fade-leave-active {
  transition: opacity 0.22s ease;
}

.whatsapp-redirect-fade-enter-from,
.whatsapp-redirect-fade-leave-to {
  opacity: 0;
}

@keyframes whatsappRedirectSpin {
  to {
    transform: rotate(360deg);
  }
}

.btn-checkout-execute:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 520px) {
  .whatsapp-redirect-card {
    padding: 28px 20px 25px;
    border-radius: 18px;
  }

  .whatsapp-redirect-icon {
    width: 62px;
    height: 62px;
    font-size: 28px;
  }
}

</style>