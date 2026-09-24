import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Header from '@/components/Header.vue';
const router = useRouter();
const API = 'http://localhost:5000/api';
const API_URL = 'http://localhost:5000';
const cargandoImagen = ref(false);
const urlGeneradaTool = ref('');
const cargandoImagenTool = ref(false);
const user = ref({});
const productos = ref([]);
const pedidos = ref([]);
const clientes = ref([]);
const facturas = ref([]);
const carouselItems = ref([]);
const currentSlide = ref(0);
const nuevoSlide = ref({ titulo: '', imagenUrl: '', productoId: '' });
const slideArchivo = ref(null);
const slideEditFiles = ref({});
const slidePreviewUrl = ref('');
const slideEditPreviews = ref({});
let carouselInterval = null;
const cart = ref([]);
const loading = ref(true);
const isCartOpen = ref(false);
const isLoadingProducts = ref(false);
const isRefreshingAdmin = ref(false);
let lastAdminRefresh = 0;
const searchDebounceTimer = null;
const clienteFiltrado = ref(null);
const filtroBusquedaClientes = ref('');
const correoFiltroActivo = ref('');
const paginaActual = ref(1);
const itemsPorPagina = 10;
const mostrarTodosRegistrosCliente = ref(false);
const registroVistaPrevia = ref(null);
const adminTab = ref('ventas');
// ============================================================================
// AGENDA / CALENDARIO DEL ADMIN
// ============================================================================
const TAREAS_ADMIN_STORAGE_KEY = 'beta_grafica_admin_tareas_v1';
const modalTareaAdmin = ref(false);
const tareaAdminEditando = ref(null);
const tareasAdmin = ref([]);
const semanaAdminActual = ref(new Date());
const vistaCalendarioAdmin = ref('semana');
const diaCalendarioSeleccionado = ref('');
const formTareaAdmin = ref({
    titulo: '',
    fecha: '',
    hora: '',
    lugar: '',
    descripcion: '',
    prioridad: 'media',
    completada: false,
    completadaEn: null
});
const obtenerFechaLocalAdmin = (fecha = new Date()) => {
    const f = fecha instanceof Date ? fecha : new Date(fecha);
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
};
const normalizarFechaTareaAdmin = (valor) => {
    const texto = String(valor || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto))
        return texto;
    return obtenerFechaLocalAdmin(new Date(valor));
};
const guardarTareasAdminLocal = () => {
    try {
        localStorage.setItem(TAREAS_ADMIN_STORAGE_KEY, JSON.stringify(tareasAdmin.value));
    }
    catch (error) {
        console.error('No se pudieron guardar las tareas del admin:', error);
    }
};
const cargarTareasAdminLocal = () => {
    try {
        const guardadas = JSON.parse(localStorage.getItem(TAREAS_ADMIN_STORAGE_KEY) || '[]');
        tareasAdmin.value = Array.isArray(guardadas)
            ? guardadas.map(tarea => ({
                ...tarea,
                fecha: normalizarFechaTareaAdmin(tarea.fecha),
                prioridad: ['alta', 'media', 'baja'].includes(String(tarea?.prioridad)) ? String(tarea.prioridad) : 'media',
                completada: Boolean(tarea.completada)
            }))
            : [];
    }
    catch (error) {
        console.error('No se pudieron cargar las tareas del admin:', error);
        tareasAdmin.value = [];
    }
};
const inicioSemanaAdmin = computed(() => {
    const fecha = new Date(semanaAdminActual.value);
    fecha.setHours(0, 0, 0, 0);
    const dia = fecha.getDay();
    const diferencia = dia === 0 ? -6 : 1 - dia;
    fecha.setDate(fecha.getDate() + diferencia);
    return fecha;
});
const diasSemanaAdmin = computed(() => {
    const inicio = inicioSemanaAdmin.value;
    return Array.from({ length: 7 }, (_, indice) => {
        const fecha = new Date(inicio);
        fecha.setDate(inicio.getDate() + indice);
        const clave = obtenerFechaLocalAdmin(fecha);
        const nombreCompleto = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
        return {
            clave,
            numero: fecha.getDate(),
            nombre: nombreCompleto.charAt(0).toUpperCase() + nombreCompleto.slice(1, 3),
            esHoy: clave === obtenerFechaLocalAdmin()
        };
    });
});
const rangoSemanaAdmin = computed(() => {
    const dias = diasSemanaAdmin.value;
    if (!dias.length)
        return '';
    const primera = new Date(`${dias[0].clave}T00:00:00`);
    const ultima = new Date(`${dias[6].clave}T00:00:00`);
    const opciones = { day: '2-digit', month: 'short' };
    return `${primera.toLocaleDateString('es-AR', opciones)} — ${ultima.toLocaleDateString('es-AR', opciones)}`;
});
const mesCalendarioAdmin = computed(() => {
    const fecha = new Date(semanaAdminActual.value);
    return {
        mes: fecha.getMonth(),
        anio: fecha.getFullYear(),
        nombre: fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    };
});
const diasMesCalendarioAdmin = computed(() => {
    const { mes, anio } = mesCalendarioAdmin.value;
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const offset = (primerDia.getDay() + 6) % 7;
    const totalCeldas = Math.ceil((offset + ultimoDia.getDate()) / 7) * 7;
    return Array.from({ length: totalCeldas }, (_, indice) => {
        const fecha = new Date(anio, mes, indice - offset + 1);
        const clave = obtenerFechaLocalAdmin(fecha);
        const esDelMes = fecha.getMonth() === mes;
        const tareas = tareasPendientesAdmin.value.filter(tarea => tarea.fecha === clave);
        const fechaHoy = obtenerFechaLocalAdmin();
        return {
            clave,
            numero: fecha.getDate(),
            esDelMes,
            esHoy: clave === fechaHoy,
            seleccionado: clave === diaCalendarioSeleccionado.value,
            tareas,
            cantidadTareas: tareas.length,
            tieneAlta: tareas.some(tarea => prioridadTareaAdmin(tarea).valor === 3)
        };
    });
});
const tareasDiaCalendarioSeleccionado = computed(() => {
    const clave = diaCalendarioSeleccionado.value || obtenerFechaLocalAdmin();
    return tareasPendientesAdmin.value.filter(tarea => tarea.fecha === clave);
});
const fechaSeleccionadaCalendarioAdmin = computed(() => {
    const clave = diaCalendarioSeleccionado.value || obtenerFechaLocalAdmin();
    return formatearFechaTareaAdmin(clave);
});
const seleccionarDiaCalendarioAdmin = (clave) => {
    diaCalendarioSeleccionado.value = clave;
};
const cambiarMesCalendarioAdmin = (direccion) => {
    const fecha = new Date(semanaAdminActual.value);
    fecha.setDate(1);
    fecha.setMonth(fecha.getMonth() + direccion);
    semanaAdminActual.value = fecha;
    const hoy = obtenerFechaLocalAdmin();
    const mesActual = new Date();
    const esMesActual = fecha.getMonth() === mesActual.getMonth() && fecha.getFullYear() === mesActual.getFullYear();
    diaCalendarioSeleccionado.value = esMesActual ? hoy : obtenerFechaLocalAdmin(fecha);
};
const irAlMesActualAdmin = () => {
    const hoy = new Date();
    semanaAdminActual.value = hoy;
    diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin(hoy);
};
const cambiarVistaCalendarioAdmin = (vista) => {
    vistaCalendarioAdmin.value = vista;
    if (vista === 'mes') {
        if (!diaCalendarioSeleccionado.value)
            diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin();
    }
};
const prioridadTareaAdmin = (tarea) => {
    const prioridad = String(tarea?.prioridad || 'media').toLowerCase();
    if (prioridad === 'alta')
        return { texto: '🔴 PRIORIDAD ALTA', icono: '🔴', clase: 'calendar-priority-alta', valor: 3 };
    if (prioridad === 'baja')
        return { texto: '⚪ PRIORIDAD BAJA', icono: '⚪', clase: 'calendar-priority-baja', valor: 1 };
    return { texto: '🟠 PRIORIDAD MEDIA', icono: '🟠', clase: 'calendar-priority-media', valor: 2 };
};
const tareasPendientesAdmin = computed(() => {
    return tareasAdmin.value
        .filter(tarea => !tarea.completada)
        .sort((a, b) => {
        const prioridad = prioridadTareaAdmin(b).valor - prioridadTareaAdmin(a).valor;
        if (prioridad !== 0)
            return prioridad;
        const aFecha = new Date(`${a.fecha}T${a.hora || '23:59'}`).getTime();
        const bFecha = new Date(`${b.fecha}T${b.hora || '23:59'}`).getTime();
        return aFecha - bFecha;
    });
});
const tareasCompletadasAdmin = computed(() => {
    return tareasAdmin.value
        .filter(tarea => tarea.completada)
        .sort((a, b) => {
        const aFecha = new Date(a.completadaEn || `${a.fecha}T${a.hora || '23:59'}`).getTime();
        const bFecha = new Date(b.completadaEn || `${b.fecha}T${b.hora || '23:59'}`).getTime();
        return bFecha - aFecha;
    });
});
const tareasProximasAdmin = computed(() => tareasPendientesAdmin.value);
const tareasPendientesPorDiaAdmin = (clave) => {
    return tareasPendientesAdmin.value.filter(tarea => tarea.fecha === clave);
};
const estadoTareaAdmin = (tarea) => {
    const ahora = new Date();
    const fechaTarea = new Date(`${tarea.fecha}T${tarea.hora || '23:59'}`);
    const diferencia = fechaTarea.getTime() - ahora.getTime();
    const horas = diferencia / 3600000;
    if (diferencia < 0)
        return { texto: 'ATRASADA', clase: 'calendar-task-overdue' };
    if (horas <= 24)
        return { texto: 'HOY / MUY PRÓXIMA', clase: 'calendar-task-urgent' };
    if (horas <= 48)
        return { texto: 'PRÓXIMA', clase: 'calendar-task-soon' };
    return { texto: 'PROGRAMADA', clase: 'calendar-task-normal' };
};
const formatearFechaTareaAdmin = (valor) => {
    if (!valor)
        return 'Sin fecha';
    const fecha = new Date(`${normalizarFechaTareaAdmin(valor)}T00:00:00`);
    if (Number.isNaN(fecha.getTime()))
        return String(valor);
    return fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};
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
    };
};
const abrirCalendarioAdmin = () => {
    adminTab.value = 'calendario';
    if (!tareasAdmin.value.length)
        cargarTareasAdminLocal();
    if (!diaCalendarioSeleccionado.value)
        diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin();
};
const abrirNuevaTareaAdmin = (fecha = '') => {
    tareaAdminEditando.value = null;
    limpiarFormTareaAdmin(fecha);
    modalTareaAdmin.value = true;
};
const abrirEditarTareaAdmin = (tarea) => {
    tareaAdminEditando.value = tarea;
    formTareaAdmin.value = { ...tarea };
    modalTareaAdmin.value = true;
};
const cerrarModalTareaAdmin = () => {
    modalTareaAdmin.value = false;
    tareaAdminEditando.value = null;
};
const guardarTareaAdmin = () => {
    const titulo = String(formTareaAdmin.value.titulo || '').trim();
    const fecha = normalizarFechaTareaAdmin(formTareaAdmin.value.fecha);
    if (!titulo) {
        triggerAlert('Escribí un título para la tarea.', 'error');
        return;
    }
    if (!fecha || Number.isNaN(new Date(`${fecha}T00:00:00`).getTime())) {
        triggerAlert('Seleccioná una fecha válida para la tarea.', 'error');
        return;
    }
    const datos = {
        ...formTareaAdmin.value,
        titulo,
        fecha,
        hora: String(formTareaAdmin.value.hora || '').trim(),
        lugar: String(formTareaAdmin.value.lugar || '').trim(),
        descripcion: String(formTareaAdmin.value.descripcion || '').trim(),
        prioridad: ['alta', 'media', 'baja'].includes(String(formTareaAdmin.value.prioridad)) ? String(formTareaAdmin.value.prioridad) : 'media'
    };
    const estabaEditando = Boolean(tareaAdminEditando.value);
    if (tareaAdminEditando.value) {
        const indice = tareasAdmin.value.findIndex(tarea => tarea.id === tareaAdminEditando.value.id);
        if (indice !== -1)
            tareasAdmin.value[indice] = { ...tareasAdmin.value[indice], ...datos };
    }
    else {
        tareasAdmin.value.push({
            ...datos,
            id: `tarea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            completada: false,
            completadaEn: null,
            creadaEn: new Date().toISOString()
        });
    }
    guardarTareasAdminLocal();
    cerrarModalTareaAdmin();
    semanaAdminActual.value = new Date(`${fecha}T00:00:00`);
    triggerAlert(estabaEditando ? 'Tarea actualizada correctamente.' : 'Tarea guardada en el calendario.', 'success');
};
const completarTareaAdmin = () => {
    if (!tareaAdminEditando.value)
        return;
    const indice = tareasAdmin.value.findIndex(tarea => tarea.id === tareaAdminEditando.value.id);
    if (indice === -1)
        return;
    tareasAdmin.value[indice] = {
        ...tareasAdmin.value[indice],
        completada: true,
        completadaEn: new Date().toISOString()
    };
    guardarTareasAdminLocal();
    cerrarModalTareaAdmin();
    triggerAlert('Tarea completada. Quedó guardada en el historial.', 'success');
};
const eliminarTareaAdmin = () => {
    if (!tareaAdminEditando.value)
        return;
    if (!confirm(`¿Eliminar la tarea "${tareaAdminEditando.value.titulo}"?`))
        return;
    tareasAdmin.value = tareasAdmin.value.filter(tarea => tarea.id !== tareaAdminEditando.value.id);
    guardarTareasAdminLocal();
    cerrarModalTareaAdmin();
    triggerAlert('Tarea eliminada.', 'success');
};
const cambiarSemanaAdmin = (direccion) => {
    const nueva = new Date(inicioSemanaAdmin.value);
    nueva.setDate(nueva.getDate() + (direccion * 7));
    semanaAdminActual.value = nueva;
    diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin(nueva);
};
const irASemanaActualAdmin = () => {
    semanaAdminActual.value = new Date();
    diaCalendarioSeleccionado.value = obtenerFechaLocalAdmin();
};
const clientesFiltradosYOrdenados = computed(() => {
    if (!filtroBusquedaClientes.value.trim())
        return clientes.value;
    const query = filtroBusquedaClientes.value.toLowerCase().trim();
    return clientes.value.filter(c => (c.nombre || '').toLowerCase().includes(query));
});
const filtrarPorCliente = (cliente) => {
    clienteFiltrado.value = cliente;
    correoFiltroActivo.value = cliente.email;
    mostrarTodosRegistrosCliente.value = false;
    registroVistaPrevia.value = null;
    paginaActual.value = 1;
};
const limpiarFiltroCliente = () => {
    clienteFiltrado.value = null;
    correoFiltroActivo.value = '';
    mostrarTodosRegistrosCliente.value = false;
    registroVistaPrevia.value = null;
    paginaActual.value = 1;
};
const pedidosFiltradosPorFecha = computed(() => {
    let resultado = pedidos.value;
    if (clienteFiltrado.value) {
        const emailCliente = (clienteFiltrado.value.email || '').trim().toLowerCase();
        resultado = resultado.filter(p => {
            const pEmail = (p.email || '').trim().toLowerCase();
            return emailCliente && pEmail === emailCliente;
        });
    }
    if (!mostrarTodosRegistrosCliente.value) {
        resultado = resultado.filter(p => String(p.estado || 'Pendiente').trim().toLowerCase() !== 'completado');
    }
    return resultado;
});
const pedidosPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return pedidosFiltradosPorFecha.value.slice(inicio, fin);
});
const verTodosLosRegistrosCliente = () => {
    if (!clienteFiltrado.value)
        return;
    mostrarTodosRegistrosCliente.value = true;
    paginaActual.value = 1;
    registroVistaPrevia.value = null;
};
const obtenerItemsPreview = (registro) => {
    if (!registro)
        return [];
    let items = registro.items;
    if (typeof items === 'string') {
        try {
            items = JSON.parse(items);
        }
        catch {
            items = [];
        }
    }
    const lista = Array.isArray(items) ? items : [];
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
        }));
    }
    const nombreFallback = registro.producto || registro.pedido || 'Producto';
    const unidadesFallback = Number(registro.unidades || registro.cantidad_unidades || registro.qty || 1);
    if (registro.producto_id || registro.producto || registro.pedido || registro.unidades || registro.cantidad_unidades) {
        return [{
                producto_id: registro.producto_id ?? registro.id ?? 0,
                nombre: nombreFallback,
                codigo: registro.codigo || '',
                unidades: unidadesFallback,
                imagen: registro.imagen || '',
                color: registro.color || '',
                medida: registro.medida || ''
            }];
    }
    return [];
};
const abrirPreviewRegistro = (registro) => {
    if (!registro)
        return;
    // Los registros que devuelve /todos-pedidos ya vienen agrupados por factura
    // y contienen TODOS los productos de esa compra en registro.items.
    // Por eso la vista previa se arma directamente con esos datos, sin depender
    // de otra petición que pueda fallar o dejar la ventana sin abrir.
    const registroId = registro.factura_id ?? registro.id ?? registro.pedido_id;
    const items = obtenerItemsPreview(registro);
    registroVistaPrevia.value = {
        ...registro,
        id: registroId ?? null,
        items,
        cantidad_productos: items.length,
        cantidad_unidades: items.reduce((sum, item) => sum + Number(item.unidades || item.cantidad || item.qty || 1), 0),
        cargandoDetalle: false
    };
};
const formatearFechaRegistro = (valor) => {
    if (!valor)
        return 'Sin registrar';
    const fecha = convertirFechaCalendario(valor);
    if (Number.isNaN(fecha.getTime()))
        return String(valor);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const asignacionMasivaTexto = ref('');
const asignacionMasivaArchivo = ref(null);
const asignacionMasivaPreview = ref('');
const asignandoImagenMasiva = ref(false);
const productosCoincidentesImagenMasiva = computed(() => {
    const termino = normalizarTextoCategoria(asignacionMasivaTexto.value.trim());
    if (!termino)
        return [];
    return productos.value.filter((producto) => {
        const nombre = normalizarTextoCategoria(producto?.nombre || '');
        return nombre.includes(termino);
    });
});
const seleccionarImagenMasiva = (event) => {
    const archivo = event?.target?.files?.[0] || null;
    asignacionMasivaArchivo.value = archivo;
    if (asignacionMasivaPreview.value) {
        URL.revokeObjectURL(asignacionMasivaPreview.value);
        asignacionMasivaPreview.value = '';
    }
    if (archivo) {
        asignacionMasivaPreview.value = URL.createObjectURL(archivo);
    }
};
const asignarImagenMasiva = async () => {
    const termino = asignacionMasivaTexto.value.trim();
    const archivo = asignacionMasivaArchivo.value;
    if (!termino) {
        triggerAlert('Ingresá qué nombre querés buscar.', 'error');
        return;
    }
    if (!archivo) {
        triggerAlert('Seleccioná una imagen.', 'error');
        return;
    }
    const coincidencias = productosCoincidentesImagenMasiva.value;
    if (!coincidencias.length) {
        triggerAlert(`No hay productos que coincidan con "${termino}".`, 'error');
        return;
    }
    const confirmado = confirm(`Se encontraron ${coincidencias.length} producto${coincidencias.length === 1 ? '' : 's'} que contienen "${termino}".\n\n` +
        'La imagen seleccionada reemplazará la imagen actual de todos ellos.\n\n¿Continuar?');
    if (!confirmado)
        return;
    asignandoImagenMasiva.value = true;
    try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('termino', termino);
        formData.append('imagen', archivo);
        formData.append('sobrescribir', 'true');
        const res = await fetch(`${API}/productos/asignar-imagen-masiva`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || 'No se pudieron actualizar los productos');
        }
        await loadProducts();
        await loadAdmin(true);
        triggerAlert(`Imagen asignada a ${data.actualizados ?? coincidencias.length} producto${(data.actualizados ?? coincidencias.length) === 1 ? '' : 's'}.`, 'success');
        asignacionMasivaArchivo.value = null;
        if (asignacionMasivaPreview.value) {
            URL.revokeObjectURL(asignacionMasivaPreview.value);
            asignacionMasivaPreview.value = '';
        }
    }
    catch (e) {
        triggerAlert(e.message || 'Error al asignar la imagen masivamente', 'error');
    }
    finally {
        asignandoImagenMasiva.value = false;
    }
};
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
});
const creandoProducto = ref(false);
const paginaAnterior = () => { if (paginaActual.value > 1)
    paginaActual.value--; };
const paginaSiguiente = () => {
    const total = Math.ceil(pedidosFiltradosPorFecha.value.length / itemsPorPagina);
    if (paginaActual.value < total)
        paginaActual.value++;
};
const paginaActualAdminProductos = ref(1);
const productosAdminPorPagina = 10;
const categoriaAdminSeleccionada = ref('todos');
const productosFiltradosAdmin = computed(() => {
    const categoria = categoriaAdminSeleccionada.value;
    return productos.value.filter((producto) => {
        const texto = normalizarTextoCategoria(`${producto.categoria || ''} ${producto.nombre || ''}`);
        if (/transferencia/.test(texto))
            return false;
        if (categoria === 'todos')
            return true;
        if (categoria === 'vinilos')
            return /vinilo|corte/.test(texto);
        if (categoria === 'impresiones')
            return /impresion/.test(texto);
        if (categoria === 'pisos')
            return /piso|adhesivo/.test(texto);
        return true;
    });
});
const totalPaginasAdminProductos = computed(() => Math.max(1, Math.ceil(productosFiltradosAdmin.value.length / productosAdminPorPagina)));
const productosAdminPaginados = computed(() => {
    const inicio = (paginaActualAdminProductos.value - 1) * productosAdminPorPagina;
    return productosFiltradosAdmin.value.slice(inicio, inicio + productosAdminPorPagina);
});
const stockCategorias = [
    { valor: 'vinilos', label: 'Vinilos de corte' },
    { valor: 'impresiones', label: 'Impresiones' },
    { valor: 'pisos', label: 'Pisos adhesivos' }
];
const stockCategoriaSeleccionada = ref('vinilos');
const paginaStockActual = ref(1);
const stockPorPagina = 10;
const productosStockCategoria = computed(() => {
    const categoria = stockCategoriaSeleccionada.value;
    return productos.value.filter((producto) => {
        const texto = normalizarTextoCategoria(`${producto.categoria || ''} ${producto.nombre || ''}`);
        if (categoria === 'vinilos')
            return /vinilo|corte/.test(texto);
        if (categoria === 'impresiones')
            return /impresion/.test(texto);
        if (categoria === 'pisos')
            return /piso|adhesivo/.test(texto);
        return true;
    });
});
const totalPaginasStock = computed(() => Math.max(1, Math.ceil(productosStockCategoria.value.length / stockPorPagina)));
const productosStockPaginaActual = computed(() => {
    const inicio = (paginaStockActual.value - 1) * stockPorPagina;
    return productosStockCategoria.value.slice(inicio, inicio + stockPorPagina);
});
const paginaStockAnterior = () => {
    if (paginaStockActual.value > 1)
        paginaStockActual.value--;
};
const paginaStockSiguiente = () => {
    if (paginaStockActual.value < totalPaginasStock.value)
        paginaStockActual.value++;
};
watch(stockCategoriaSeleccionada, () => {
    paginaStockActual.value = 1;
});
const cambiarCategoriaAdminProductos = (categoria) => {
    categoriaAdminSeleccionada.value = categoria;
    paginaActualAdminProductos.value = 1;
};
const paginaPrimeraAdminProductos = () => {
    paginaActualAdminProductos.value = 1;
};
const paginaUltimaAdminProductos = () => {
    paginaActualAdminProductos.value = totalPaginasAdminProductos.value;
};
const paginaAnteriorAdminProductos = () => {
    if (paginaActualAdminProductos.value > 1) {
        paginaActualAdminProductos.value--;
    }
};
const paginaSiguienteAdminProductos = () => {
    if (paginaActualAdminProductos.value < totalPaginasAdminProductos.value) {
        paginaActualAdminProductos.value++;
    }
};
const paginaActualClienteProductos = ref(1);
const productosClientePorPagina = 12;
const categoriaSeleccionada = ref('todos');
const categoriasCliente = [
    { valor: 'todos', label: 'Todos' },
    { valor: 'vinilos', label: 'Vinilos de corte' },
    { valor: 'impresiones', label: 'Impresiones' },
    { valor: 'pisos', label: 'Pisos adhesivos' }
];
const normalizarTextoCategoria = (valor) => String(valor ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const productosFiltradosCliente = computed(() => {
    const categoria = categoriaSeleccionada.value;
    return productos.value.filter((producto) => {
        const texto = normalizarTextoCategoria(`${producto.categoria || ''} ${producto.nombre || ''}`);
        if (/transferencia/.test(texto))
            return false;
        if (categoria === 'todos')
            return true;
        if (categoria === 'vinilos')
            return /vinilo|corte/.test(texto);
        if (categoria === 'impresiones')
            return /impresion/.test(texto);
        if (categoria === 'pisos')
            return /piso|adhesivo/.test(texto);
        return true;
    });
});
const totalPaginasClienteProductos = computed(() => Math.max(1, Math.ceil(productosFiltradosCliente.value.length / productosClientePorPagina)));
const productosPaginadosCliente = computed(() => {
    const inicio = (paginaActualClienteProductos.value - 1) * productosClientePorPagina;
    return productosFiltradosCliente.value.slice(inicio, inicio + productosClientePorPagina);
});
const productosPaginadosCarrito = computed(() => {
    const inicio = (paginaActualClienteProductos.value - 1) * productosClientePorPagina;
    return productos.value.slice(inicio, inicio + productosClientePorPagina);
});
const paginaPrimeraClienteProductos = () => {
    paginaActualClienteProductos.value = 1;
};
const paginaUltimaClienteProductos = () => {
    paginaActualClienteProductos.value = totalPaginasClienteProductos.value;
};
const paginaSiguienteClienteProductos = () => {
    if (paginaActualClienteProductos.value < totalPaginasClienteProductos.value) {
        paginaActualClienteProductos.value++;
    }
};
const paginaAnteriorClienteProductos = () => {
    if (paginaActualClienteProductos.value > 1) {
        paginaActualClienteProductos.value--;
    }
};
watch(categoriaSeleccionada, () => {
    paginaActualClienteProductos.value = 1;
});
watch(categoriaAdminSeleccionada, () => {
    paginaActualAdminProductos.value = 1;
});
const fechaEntregaRequerida = ref('');
const ahoraParaInput = new Date();
const pad2 = (n) => String(n).padStart(2, '0');
const formatearParaFechaInput = (fecha) => `${fecha.getFullYear()}-${pad2(fecha.getMonth() + 1)}-${pad2(fecha.getDate())}`;
const minFechaPermitida = ref(formatearParaFechaInput(ahoraParaInput));
const convertirFechaCalendario = (valor) => {
    if (valor instanceof Date)
        return valor;
    const texto = String(valor ?? '').trim();
    const coincidencia = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
    if (coincidencia) {
        return new Date(Number(coincidencia[1]), Number(coincidencia[2]) - 1, Number(coincidencia[3]));
    }
    return new Date(valor);
};
const formatearFechaMensaje = () => new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatearFechaRequerida = (valor) => {
    if (!valor)
        return 'Sin fecha';
    const fecha = convertirFechaCalendario(valor);
    if (Number.isNaN(fecha.getTime()))
        return String(valor);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const codigoConsultaRapida = ref('');
const codigoConsultaRapidaBuscado = ref('');
const productoConsultaRapida = ref(null);
const normalizarCodigoProducto = (valor) => String(valor ?? '').trim().replace(/\s+/g, '').toLowerCase();
const modalComprarYaShow = ref(false);
const modalComprarYaProductos = ref([]);
const modalComprarYaMensaje = ref('');
const modalComprarYaFecha = ref('');
// Estado de la pantalla de transición antes de abrir WhatsApp.
const redireccionandoWhatsApp = ref(false);
const redireccionWhatsAppTipo = ref('pedido');
let redireccionWhatsAppTimer = null;
const mostrarRedireccionWhatsApp = (url, tipo = 'pedido') => {
    if (!url)
        return;
    if (redireccionWhatsAppTimer) {
        clearTimeout(redireccionWhatsAppTimer);
        redireccionWhatsAppTimer = null;
    }
    redireccionWhatsAppTipo.value = tipo;
    redireccionandoWhatsApp.value = true;
    // Dejamos que la pantalla se vea antes de cambiar a WhatsApp.
    redireccionWhatsAppTimer = setTimeout(() => {
        window.location.href = url;
        redireccionWhatsAppTimer = null;
    }, 1400);
};
const buscarProductoPorCodigo = () => {
    const codigo = String(codigoConsultaRapida.value || '').trim();
    codigoConsultaRapidaBuscado.value = codigo;
    productoConsultaRapida.value = null;
    if (!codigo) {
        triggerAlert('Ingresá el código del producto.', 'error');
        return;
    }
    const codigoNormalizado = normalizarCodigoProducto(codigo);
    const encontrado = productos.value.find(p => normalizarCodigoProducto(p.codigo) === codigoNormalizado);
    if (!encontrado) {
        triggerAlert(`No se encontró ningún producto con el código ${codigo}.`, 'error');
        return;
    }
    productoConsultaRapida.value = { ...encontrado, qty: 1 };
};
const limpiarResultadoSiVacio = () => {
    if (!String(codigoConsultaRapida.value || '').trim()) {
        productoConsultaRapida.value = null;
        codigoConsultaRapidaBuscado.value = '';
    }
};
const agregarProductoConsultaRapida = (producto) => {
    if (!producto)
        return;
    const productosConsulta = Array.isArray(modalComprarYaProductos.value) ? [...modalComprarYaProductos.value] : [];
    const stockDisponible = Number(producto.stock || 0);
    const existente = productosConsulta.find(p => Number(p.id) === Number(producto.id));
    if (existente) {
        const nuevaCantidad = Number(existente.qty || 1) + 1;
        if (stockDisponible > 0 && nuevaCantidad > stockDisponible) {
            triggerAlert(`Solo hay ${stockDisponible} unidades disponibles de ${producto.nombre}.`, 'error');
            return;
        }
        existente.qty = nuevaCantidad;
    }
    else {
        const cantidadInicial = Math.min(1, Math.max(1, Number(producto.qty || 1)));
        if (stockDisponible > 0 && cantidadInicial > stockDisponible) {
            triggerAlert(`Solo hay ${stockDisponible} unidades disponibles de ${producto.nombre}.`, 'error');
            return;
        }
        productosConsulta.push({ ...producto, qty: cantidadInicial });
    }
    modalComprarYaProductos.value = productosConsulta;
    modalComprarYaShow.value = true;
    modalComprarYaFecha.value = modalComprarYaFecha.value || fechaEntregaRequerida.value || '';
    productoConsultaRapida.value = null;
    codigoConsultaRapida.value = '';
    codigoConsultaRapidaBuscado.value = '';
    triggerAlert(`${producto.nombre} agregado a la consulta.`, 'success');
};
const agregarProductoAlCarritoDesdeBusqueda = (producto) => {
    if (!producto)
        return;
    const stock = Number(producto.stock || 0);
    if (stock <= 0) {
        triggerAlert(`No hay stock disponible de ${producto.nombre}.`, 'error');
        return;
    }
    const itemCarrito = cart.value.find(item => Number(item.id) === Number(producto.id));
    const cantidadActual = Number(itemCarrito?.qty || 0);
    const cantidadNueva = cantidadActual + 1;
    if (cantidadNueva > stock) {
        triggerAlert(`Solo hay ${stock} unidades disponibles de ${producto.nombre}.`, 'error');
        return;
    }
    if (itemCarrito) {
        itemCarrito.qty = cantidadNueva;
    }
    else {
        cart.value.push({ ...producto, qty: 1 });
    }
    triggerAlert(`${producto.nombre} agregado al carrito.`, 'success');
    productoConsultaRapida.value = null;
    codigoConsultaRapida.value = '';
    codigoConsultaRapidaBuscado.value = '';
};
const abrirConsultaCliente = (producto) => {
    if (!producto)
        return;
    // Abrimos la consulta de forma atómica para evitar que el modal quede sin mostrar.
    const cantidad = Math.max(1, Number(producto.qty || 1));
    modalComprarYaShow.value = true;
    modalComprarYaProductos.value = [{ ...producto, qty: cantidad }];
    modalComprarYaMensaje.value = '';
    modalComprarYaFecha.value = fechaEntregaRequerida.value || '';
    // Dejamos el código libre para poder agregar otro producto dentro del modal.
    codigoConsultaRapida.value = '';
    codigoConsultaRapidaBuscado.value = '';
    productoConsultaRapida.value = null;
};
// Compatibilidad con cualquier parte del template/código que todavía llame al nombre anterior.
const abrirModalComprarYa = abrirConsultaCliente;
const aumentarCantidadConsulta = (producto) => {
    const max = Number(producto.stock || 0);
    if (max > 0 && Number(producto.qty || 1) >= max)
        return triggerAlert(`No podés superar el stock de ${max} unidades de ${producto.nombre}.`, 'error');
    producto.qty = Number(producto.qty || 1) + 1;
};
const disminuirCantidadConsulta = (producto) => { producto.qty = Math.max(1, Number(producto.qty || 1) - 1); };
const eliminarProductoConsulta = (producto) => {
    modalComprarYaProductos.value = modalComprarYaProductos.value.filter(p => Number(p.id) !== Number(producto.id));
};
const agregarCodigoDesdeModal = () => {
    const codigo = String(codigoConsultaRapida.value || '').trim();
    if (!codigo) {
        triggerAlert('Ingresá un código para buscar otro producto.', 'error');
        return;
    }
    const codigoNormalizado = normalizarCodigoProducto(codigo);
    const encontrado = productos.value.find(p => normalizarCodigoProducto(p.codigo) === codigoNormalizado);
    codigoConsultaRapidaBuscado.value = codigo;
    if (!encontrado) {
        triggerAlert(`No se encontró ningún producto con el código ${codigo}.`, 'error');
        return;
    }
    agregarProductoConsultaRapida(encontrado);
};
const enviarConsultaWhatsApp = () => {
    if (redireccionandoWhatsApp.value)
        return;
    const lista = Array.isArray(modalComprarYaProductos.value) ? modalComprarYaProductos.value : [];
    if (!lista.length) {
        triggerAlert('Agregá al menos un producto a la consulta.', 'error');
        return;
    }
    const nota = (modalComprarYaMensaje.value || '').trim();
    const fecha = modalComprarYaFecha.value || fechaEntregaRequerida.value || '';
    const TELEFONO_WHATSAPP = '5493564652137';
    const fechaConsulta = formatearFechaMensaje();
    let mensaje = `Hola! Quisiera consultar por los siguientes productos:\n\n`;
    lista.forEach((p, index) => {
        mensaje += `*${index + 1}. ${p.nombre || p.producto}*\n`;
        if (p.codigo)
            mensaje += `Código: ${p.codigo}\n`;
        mensaje += `Cantidad: ${Number(p.qty || 1)}\n`;
        if (p.color)
            mensaje += `Color: ${p.color}\n`;
        if (p.medida)
            mensaje += `Medida: ${p.medida}\n`;
        mensaje += `\n`;
    });
    mensaje += `📅 *Fecha de la consulta:* ${fechaConsulta}\n`;
    if (fecha)
        mensaje += `📅 *Fecha requerida:* ${formatearFechaRequerida(fecha)}\n`;
    if (nota)
        mensaje += `📝 *Consulta/Detalle:* ${nota}\n`;
    mensaje += `\n¿Tienen disponibilidad / tiempo de entrega?`;
    const urlWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    modalComprarYaShow.value = false;
    modalComprarYaFecha.value = '';
    mostrarRedireccionWhatsApp(urlWhatsApp, 'consulta');
};
const notification = ref({ show: false, message: '', type: 'success' });
const triggerAlert = (message, type = 'success') => {
    notification.value = { show: true, message, type };
    setTimeout(() => { notification.value.show = false; }, 4000);
};
const resolverImagen = (imagen) => {
    if (!imagen || imagen === 'null' || imagen === 'undefined' || typeof imagen !== 'string' || !imagen.trim()) {
        return 'https://placehold.co/100x100/1a1a1a/cccccc?text=Sin+Foto';
    }
    if (imagen.includes('localhost:5000/uploads/')) {
        imagen = imagen.replace('localhost:5000/uploads/', 'localhost:5000/static/uploads/');
    }
    if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('data:image')) {
        return imagen;
    }
    const rutaLimpia = imagen.startsWith('/') ? imagen.slice(1) : imagen;
    return `${API_URL}/static/uploads/${rutaLimpia}`;
};
const manejarErrorImagen = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/100x100/1a1a1a/cccccc?text=Sin+Foto';
};
const getAuthToken = () => {
    let token = localStorage.getItem('token');
    if (!token) {
        try {
            const sesion = localStorage.getItem('sesion_usuario');
            if (sesion) {
                const parsed = JSON.parse(sesion);
                token = parsed.token || parsed.user?.token || '';
            }
        }
        catch (e) {
            console.warn('No se pudo leer la sesión guardada:', e);
        }
    }
    if (token && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }
    return token || '';
};
const isAdmin = computed(() => (user.value?.role || '').trim().toLowerCase() === 'admin');
const pedidosPorVencer = computed(() => {
    if (!Array.isArray(pedidos.value))
        return [];
    return pedidos.value.filter(p => {
        const estado = String(p.estado || '').trim().toLowerCase();
        const dias = Number(p.diasRestantes ?? 999);
        return estado !== 'completado' && estado !== 'cancelado' && dias <= 2 && Boolean(p.fecha_entrega);
    }).slice(0, 8);
});
const imagenesBackup = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
];
const formatearFechaEntrega = (valor) => {
    if (!valor)
        return 'Sin fecha';
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime()))
        return 'Sin fecha';
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const formatearPrecio = (valor) => {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0)
        return 'Consultar precio';
    return `$${numero.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const procesarMetadatosPedido = (ped) => {
    // El backend es la fuente de verdad del estado. Cualquier valor distinto
    // de Completado se trata como Pendiente para evitar falsos completados.
    const estadoNormalizado = String(ped?.estado || '').trim().toLowerCase() === 'completado'
        ? 'Completado'
        : 'Pendiente';
    if (ped.diasRestantes !== undefined) {
        const entrega = ped.fecha_entrega ? convertirFechaCalendario(ped.fecha_entrega) : null;
        return {
            ...ped,
            estado: estadoNormalizado,
            fechaEntregaFormateada: entrega && !Number.isNaN(entrega.getTime())
                ? formatearFechaEntrega(entrega)
                : (ped.fechaEntregaFormateada || 'Sin fecha')
        };
    }
    const hoy = new Date();
    let dias = 0;
    let fechaEntregaFormateada = 'Sin fecha';
    if (ped.fecha_entrega) {
        const entrega = convertirFechaCalendario(ped.fecha_entrega);
        if (!Number.isNaN(entrega.getTime())) {
            const diff = entrega.getTime() - hoy.getTime();
            dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
            fechaEntregaFormateada = formatearFechaEntrega(entrega);
        }
    }
    return { ...ped, estado: estadoNormalizado, diasRestantes: dias, fechaEntregaFormateada };
};
const loadProducts = async () => {
    if (isLoadingProducts.value)
        return;
    isLoadingProducts.value = true;
    try {
        const res = await fetch(`${API}/productos`);
        if (!res.ok)
            throw new Error();
        const data = await res.json();
        productos.value = data.map((prod, index) => ({
            ...prod,
            tieneCodigo: Boolean(String(prod.codigo ?? '').trim()),
            qty: 1,
            precio: Number(prod.precio ?? prod.precio_unitario ?? 0) || 0,
            stock: Number(prod.stock ?? 0) || 0,
            imagen: resolverImagen(prod.imagen) || imagenesBackup[index % imagenesBackup.length]
        }));
    }
    catch (e) {
        console.error("Error al traer productos:", e);
    }
    finally {
        isLoadingProducts.value = false;
    }
};
const startCarousel = () => {
    stopCarousel();
    if (carouselItems.value.length <= 1)
        return;
    carouselInterval = setInterval(() => {
        currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length;
    }, 4500);
};
const stopCarousel = () => {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
};
const nextSlide = () => { if (carouselItems.value.length)
    currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length; };
const prevSlide = () => { if (carouselItems.value.length)
    currentSlide.value = (currentSlide.value - 1 + carouselItems.value.length) % carouselItems.value.length; };
const loadCarousel = async () => {
    try {
        const res = await fetch(`${API}/carousel`);
        if (!res.ok)
            throw new Error();
        const data = await res.json();
        carouselItems.value = Array.isArray(data) ? data.map(item => ({
            ...item,
            imagen: resolverImagen(item.imagen) || imagenesBackup[0]
        })) : [];
        currentSlide.value = 0;
        startCarousel();
    }
    catch {
        carouselItems.value = [];
    }
};
const loadPedidosGlobales = async () => {
    try {
        const token = getAuthToken();
        if (!token)
            return;
        const endpoint = isAdmin.value ? `${API}/todos-pedidos` : `${API}/mis-pedidos-usuario`;
        const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            const data = await res.json();
            pedidos.value = Array.isArray(data) ? data.map(p => procesarMetadatosPedido(p)) : [];
        }
    }
    catch (e) {
        console.error("Error al cargar pedidos:", e);
    }
};
const loadAdmin = async (force = false) => {
    if (isRefreshingAdmin.value && !force)
        return;
    const now = Date.now();
    if (!force && now - lastAdminRefresh < 45000)
        return;
    isRefreshingAdmin.value = true;
    try {
        const token = getAuthToken();
        if (!token)
            return;
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        const [pRes, fRes] = await Promise.all([
            fetch(`${API}/todos-pedidos`, { method: 'GET', headers }),
            fetch(`${API}/facturas`, { method: 'GET', headers })
        ]);
        if (pRes.ok) {
            const pedidosData = await pRes.json();
            pedidos.value = Array.isArray(pedidosData) ? pedidosData.map(ped => procesarMetadatosPedido(ped)) : [];
        }
        if (fRes.ok) {
            const facturasData = await fRes.json();
            facturas.value = Array.isArray(facturasData) ? facturasData : [];
        }
        lastAdminRefresh = now;
    }
    catch (e) {
        console.error("Error en loadAdmin:", e);
    }
    finally {
        isRefreshingAdmin.value = false;
    }
};
let realtimeInterval = null;
const startRealtimeUpdates = () => {
    if (realtimeInterval)
        clearInterval(realtimeInterval);
    realtimeInterval = setInterval(async () => {
        if (document.hidden)
            return;
        await Promise.allSettled([
            loadProducts(),
            loadPedidosGlobales(),
            isAdmin.value ? loadAdmin(true) : Promise.resolve()
        ]);
    }, 30000);
};
onMounted(async () => {
    try {
        const sesion = localStorage.getItem('sesion_usuario');
        if (!sesion) {
            router.push('/clientes');
            return;
        }
        const parsedSession = JSON.parse(sesion);
        user.value = parsedSession.user || parsedSession;
        if (isAdmin.value)
            cargarTareasAdminLocal();
        await Promise.allSettled([loadProducts(), loadPedidosGlobales(), loadCarousel()]);
        if (isAdmin.value) {
            await loadAdmin(true);
            startRealtimeUpdates();
            const token = getAuthToken();
            if (token) {
                fetch(`${API}/clientes`, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then(r => r.ok ? r.json() : [])
                    .then(d => { clientes.value = Array.isArray(d) ? d : []; });
            }
        }
    }
    catch (error) {
        console.error("Error al inicializar:", error);
    }
    finally {
        loading.value = false;
    }
});
onUnmounted(() => {
    if (realtimeInterval)
        clearInterval(realtimeInterval);
    stopCarousel();
    clearTimeout(searchDebounceTimer);
});
const marcarPedidoCompletado = async (pedido) => {
    if (!pedido?.id && !pedido?.factura_id)
        return;
    try {
        const token = getAuthToken();
        if (!token) {
            triggerAlert('Tu sesión expiró. Volvé a iniciar sesión.', 'error');
            return;
        }
        const endpoint = pedido.factura_id
            ? `${API}/facturas/${pedido.factura_id}/completar`
            : `${API}/pedidos/${pedido.id}/completar`;
        const res = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || 'No se pudo completar el registro.');
        }
        // Recargamos inmediatamente pedidos + productos + estadísticas.
        // "productos" es la misma fuente usada por Gestión de Inventario,
        // por lo que el stock visible cambia en pantalla sin esperar al intervalo.
        await Promise.allSettled([
            loadProducts(),
            loadPedidosGlobales(),
            loadAdminStats(),
            loadAdmin(true)
        ]);
        registroVistaPrevia.value = null;
        triggerAlert('Registro completado. El stock fue actualizado.', 'success');
    }
    catch (error) {
        console.error('Error al completar registro:', error);
        triggerAlert(error?.message || 'No se pudo completar el registro.', 'error');
    }
};
const increase = (p) => {
    const stock = Number(p?.stock || 0);
    const actual = Number(p?.qty || 1);
    if (stock > 0 && actual >= stock) {
        triggerAlert(`No podés superar el stock de ${stock} unidades de ${p.nombre}.`, 'error');
        return;
    }
    p.qty = actual + 1;
};
const decrease = (p) => p.qty = Math.max(1, (p.qty || 1) - 1);
const addToCart = (p) => {
    if (!p)
        return;
    const cantidad = Math.max(1, Number(p.qty || 1));
    const stock = Number(p.stock || 0);
    const item = cart.value.find(i => i.id === p.id);
    const cantidadActual = Number(item?.qty || 0);
    if (stock > 0 && cantidadActual + cantidad > stock) {
        triggerAlert(`Solo hay ${stock} unidades disponibles de ${p.nombre}.`, 'error');
        return;
    }
    if (item)
        item.qty = cantidadActual + cantidad;
    else
        cart.value.push({ ...p, qty: cantidad });
    p.qty = 1;
    triggerAlert(`Añadido: ${p.nombre}`, 'success');
};
const removeOneFromCart = (productId) => {
    const item = cart.value.find(i => i.id === productId);
    if (item) {
        if (item.qty > 1)
            item.qty -= 1;
        else
            removeFromCartCompletely(productId);
    }
};
const removeFromCartCompletely = (productId) => { cart.value = cart.value.filter(i => i.id !== productId); };
const clearCart = () => { cart.value = []; };
const procesandoCheckout = ref(false);
const executeCheckout = async () => {
    if (procesandoCheckout.value || redireccionandoWhatsApp.value)
        return;
    if (!fechaEntregaRequerida.value) {
        triggerAlert('Seleccioná una fecha requerida para poder confirmar el pedido.', 'error');
        return;
    }
    if (!Array.isArray(cart.value) || cart.value.length === 0) {
        triggerAlert('El carrito está vacío.', 'error');
        return;
    }
    procesandoCheckout.value = true;
    try {
        // Copiamos el carrito ANTES de enviarlo porque checkoutProcess lo limpia
        // únicamente cuando el servidor confirma que creó el pedido.
        const copiaCarrito = cart.value.map(item => ({ ...item }));
        const fechaOriginal = fechaEntregaRequerida.value;
        const fechaFormateada = formatearFechaRequerida(fechaOriginal);
        const resultado = await checkoutProcess(fechaOriginal);
        if (!resultado)
            return;
        const TELEFONO_WHATSAPP = '5493564652137';
        const fechaPedido = formatearFechaMensaje();
        let mensaje = ` *NUEVA ORDEN DE COMPRA*\n *Pedido realizado:* ${fechaPedido}\n📅 *Fecha requerida:* ${fechaFormateada}\n\n📦 *Detalle:*\n`;
        copiaCarrito.forEach((item, index) => {
            mensaje += `${index + 1}. ${item.nombre} | Código: ${item.codigo || 'Sin código'} | Cantidad: ${Number(item.qty || 1)}\n`;
        });
        fechaEntregaRequerida.value = '';
        isCartOpen.value = false;
        const urlWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
        mostrarRedireccionWhatsApp(urlWhatsApp, 'pedido');
    }
    catch (error) {
        console.error('Error inesperado en checkout:', error);
        triggerAlert(error?.message || 'No se pudo confirmar el pedido.', 'error');
    }
    finally {
        procesandoCheckout.value = false;
    }
};
const checkoutProcess = async (fechaEntrega) => {
    const token = getAuthToken();
    if (!token) {
        triggerAlert('Tu sesión expiró. Volvé a iniciar sesión.', 'error');
        return false;
    }
    try {
        const carritoMapeado = cart.value.map(item => ({
            producto_id: Number(item.id),
            nombre: item.nombre,
            precio: Number(item.precio || 0),
            imagen: item.imagen || null,
            unidades: Math.max(1, Number(item.qty || 1))
        }));
        if (!carritoMapeado.length) {
            throw new Error('El carrito está vacío.');
        }
        if (carritoMapeado.some(item => !Number.isInteger(item.producto_id) || item.producto_id <= 0)) {
            throw new Error('Hay un producto inválido en el carrito. Quitalo y agregalo nuevamente.');
        }
        const fecha = String(fechaEntrega || '').slice(0, 10);
        if (!fecha) {
            throw new Error('Seleccioná una fecha requerida para el pedido.');
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
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || 'El servidor no pudo registrar el pedido.');
        }
        // El pedido ya fue guardado correctamente. Las actualizaciones visuales
        // no deben impedir que el usuario continúe hacia WhatsApp.
        cart.value = [];
        triggerAlert('¡Pedido confirmado correctamente!', 'success');
        await Promise.allSettled([
            loadProducts(),
            loadPedidosGlobales()
        ]);
        return true;
    }
    catch (error) {
        console.error('Error al registrar pedido:', error);
        triggerAlert(error?.message || 'No se pudo registrar el pedido.', 'error');
        return false;
    }
};
const leerArchivoComoDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};
watch(slideArchivo, async (file) => {
    if (!file) {
        slidePreviewUrl.value = '';
        return;
    }
    try {
        slidePreviewUrl.value = await leerArchivoComoDataURL(file);
    }
    catch (error) {
        slidePreviewUrl.value = '';
        console.warn('No se pudo generar la vista previa del slide:', error);
    }
});
watch(slideEditFiles, async (files) => {
    for (const [slideId, file] of Object.entries(files || {})) {
        if (!file)
            continue;
        try {
            slideEditPreviews.value[slideId] = await leerArchivoComoDataURL(file);
        }
        catch (error) {
            console.warn('No se pudo generar la vista previa del slide editado:', error);
        }
    }
}, { deep: true });
const generarUrlDesdeArchivo = async (event) => {
    const file = event.target?.files?.[0];
    if (!file)
        return;
    cargandoImagenTool.value = true;
    try {
        urlGeneradaTool.value = await leerArchivoComoDataURL(file);
        triggerAlert('¡URL Base64 lista!', 'success');
    }
    catch {
        triggerAlert('Error procesando archivo.', 'error');
    }
    finally {
        cargandoImagenTool.value = false;
    }
};
const copiarUrlAlPortapapeles = async () => {
    if (!urlGeneradaTool.value)
        return;
    await navigator.clipboard.writeText(urlGeneradaTool.value);
    triggerAlert('📋 Copiada al portapapeles', 'success');
};
const convertirEImagenAUrl = async (event, productoTarget = null) => {
    const file = event.target?.files?.[0];
    if (!file)
        return;
    cargandoImagen.value = true;
    try {
        const urlBase64 = await leerArchivoComoDataURL(file);
        if (productoTarget)
            productoTarget.imagen = urlBase64;
        else
            nuevoProducto.value.imagen = urlBase64;
    }
    catch {
        alert('Error al cargar la imagen.');
    }
    finally {
        cargandoImagen.value = false;
    }
};
const agregarProductoNuevo = async () => {
    const nombre = (nuevoProducto.value.nombre || '').trim();
    const tieneCodigo = Boolean(nuevoProducto.value.tieneCodigo);
    const codigo = String(nuevoProducto.value.codigo || '').trim();
    if (!nombre)
        return triggerAlert('Completa un nombre.', 'error');
    if (tieneCodigo && !codigo)
        return triggerAlert('Marcaste que el producto tiene código. Ingresá el código.', 'error');
    const codigoExiste = tieneCodigo && codigo && productos.value.some(p => String(p.codigo || '').trim().toLowerCase() === codigo.toLowerCase());
    if (codigoExiste)
        return triggerAlert(`El código ${codigo} ya está utilizado por otro producto.`, 'error');
    creandoProducto.value = true;
    try {
        const token = getAuthToken();
        const res = await fetch(`${API}/productos`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...nuevoProducto.value, codigo: tieneCodigo ? codigo : null, precio: 0 })
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data.error);
        if (data.producto)
            productos.value.unshift({ ...data.producto, qty: 1 });
        nuevoProducto.value = { nombre: '', codigo: '', tieneCodigo: false, precio: null, color: '', medida: '', categoria: 'vinilos', stock: null, imagen: '' };
        await loadProducts();
        await loadAdmin(true);
        triggerAlert('¡Producto creado!', 'success');
    }
    catch (e) {
        triggerAlert(e.message || 'Error al crear', 'error');
    }
    finally {
        creandoProducto.value = false;
    }
};
const manejarEdicionImagen = async (event, producto) => {
    const file = event.target?.files?.[0];
    if (file)
        producto.imagen = await leerArchivoComoDataURL(file);
};
const manejarSubidaSlide = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
        slideArchivo.value = file;
        nuevoSlide.value.imagenUrl = '';
    }
};
const manejarSubidaSlideEdicion = (event, slideId) => {
    const file = event.target?.files?.[0];
    if (file)
        slideEditFiles.value[slideId] = file;
};
const agregarSlide = async () => {
    try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('titulo', nuevoSlide.value.titulo || '');
        formData.append('producto_id', nuevoSlide.value.productoId || '');
        if (slideArchivo.value)
            formData.append('imagen', slideArchivo.value);
        else if (nuevoSlide.value.imagenUrl?.trim())
            formData.append('imagen', nuevoSlide.value.imagenUrl.trim());
        const res = await fetch(`${API}/carousel`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!res.ok)
            throw new Error();
        nuevoSlide.value = { titulo: '', imagenUrl: '', productoId: '' };
        slideArchivo.value = null;
        await loadCarousel();
        triggerAlert('Slide creado', 'success');
    }
    catch {
        triggerAlert('Error agregando slide', 'error');
    }
};
const actualizarSlide = async (slide) => {
    try {
        const token = getAuthToken();
        const file = slideEditFiles.value[slide.id] || null;
        const formData = new FormData();
        formData.append('titulo', slide.titulo || '');
        formData.append('producto_id', slide.producto_id || '');
        if (file)
            formData.append('imagen', file);
        else if (slide.imagenUrl?.trim())
            formData.append('imagen', slide.imagenUrl.trim());
        const res = await fetch(`${API}/carousel/${slide.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!res.ok)
            throw new Error();
        await loadCarousel();
        triggerAlert('Slide actualizado', 'success');
    }
    catch {
        triggerAlert('Error al actualizar slide', 'error');
    }
};
const eliminarSlide = async (slideId) => {
    try {
        const token = getAuthToken();
        await fetch(`${API}/carousel/${slideId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        await loadCarousel();
        triggerAlert('Slide eliminado', 'success');
    }
    catch {
        triggerAlert('Error al eliminar slide', 'error');
    }
};
const irAlProducto = (productoId) => {
    const target = document.getElementById(`producto-${productoId}`);
    if (target)
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
const eliminarProducto = async (productoId, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`))
        return;
    try {
        const token = getAuthToken();
        const res = await fetch(`${API}/productos/${productoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok)
            throw new Error();
        productos.value = productos.value.filter(p => p.id !== productoId);
        triggerAlert(`Eliminado: ${nombre}`, 'success');
    }
    catch {
        triggerAlert('No se pudo eliminar el producto', 'error');
    }
};
const updateProduct = async (producto) => {
    try {
        const token = getAuthToken();
        const formData = new FormData();
        const nombre = String(producto.nombre || '').trim();
        const codigo = String(producto.codigo || '').trim();
        const tieneCodigo = Boolean(producto.tieneCodigo);
        const stock = Number(producto.stock ?? 0);
        const categoria = String(producto.categoria || '').trim();
        const color = String(producto.color || '').trim();
        const medida = String(producto.medida || '').trim();
        if (!nombre) {
            triggerAlert('El nombre del producto es obligatorio.', 'error');
            return;
        }
        if (tieneCodigo && !codigo) {
            triggerAlert('Marcaste que el producto tiene código. Ingresá el código.', 'error');
            return;
        }
        formData.append('nombre', nombre);
        formData.append('codigo', tieneCodigo ? codigo : '');
        formData.append('precio', '0');
        formData.append('stock', String(Math.max(0, Number.isFinite(stock) ? stock : 0)));
        formData.append('categoria', categoria);
        formData.append('color', color);
        formData.append('medida', medida);
        if (producto.imagen)
            formData.append('imagen', producto.imagen);
        const res = await fetch(`${API}/productos/${producto.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al actualizar el producto');
        }
        await loadProducts();
        await loadAdmin(true);
        triggerAlert('Producto actualizado con éxito', 'success');
    }
    catch (e) {
        triggerAlert(e.message || 'Error al actualizar producto', 'error');
    }
};
const getBadgeClassDinamico = (pedido) => {
    const est = (pedido?.estado || '').trim().toLowerCase();
    const dias = Number(pedido?.diasRestantes ?? 999);
    if (est === 'completado')
        return 'badge-completado';
    if (est === 'cancelado')
        return 'badge-cancelado';
    if (dias <= 2)
        return 'badge-critico';
    if (dias <= 5)
        return 'badge-alta';
    return 'badge-general';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-header']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-creator-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-lines-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-total']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-card']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-list']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-list']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-list']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-clear-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-details']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-details']} */ ;
/** @type {__VLS_StyleScopedClasses['facturas-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['facturas-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['facturas-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['facturas-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-vista-previa']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-view-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-panels-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-type-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-stock-table']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-stock-table']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-stock-table']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-horizontal-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-horizontal-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-chart-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-chart-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-chart-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-chart-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-month-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-month-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-month-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut-sector']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut-sector']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut-hole']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut-hole']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-legend-details']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-legend-details']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-completed-month-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-completed-month-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-status-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-status-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-summary-list']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-summary-list']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-summary-list']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-summary-list']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-products-title']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-row']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-quantity']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-quantity']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-row']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-row']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-quantity']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-factura-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-factura-action']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-factura-action']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image']} */ ;
/** @type {__VLS_StyleScopedClasses['product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-table']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-table']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-table']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['page-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['price-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['price-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-clear-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-cliente-info']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-table-items']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-table-items']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-table-items']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-table-items']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-table-items']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-table-items']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['total-row-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['billing-workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['filtro-clientes-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-grid-two-cols']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-is-open']} */ ;
/** @type {__VLS_StyleScopedClasses['side-cart-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-actions-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['deadline-field']} */ ;
/** @type {__VLS_StyleScopedClasses['deadline-field']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width-date']} */ ;
/** @type {__VLS_StyleScopedClasses['deadline-field']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width-date']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-actions-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-checkout-execute']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-actions-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-checkout-execute']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-actions-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-checkout-execute']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-actions-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload-container']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-floating-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['footer']} */ ;
/** @type {__VLS_StyleScopedClasses['social-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['social-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-row']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-col']} */ ;
/** @type {__VLS_StyleScopedClasses['social-col']} */ ;
/** @type {__VLS_StyleScopedClasses['social-label']} */ ;
/** @type {__VLS_StyleScopedClasses['social-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-row']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-row']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-inverted']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-row']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-inverted']} */ ;
/** @type {__VLS_StyleScopedClasses['narrative-visual-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-row']} */ ;
/** @type {__VLS_StyleScopedClasses['social-col']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-floating-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nebula']} */ ;
/** @type {__VLS_StyleScopedClasses['float-animation']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-factura-action']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-factura-action']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-share']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-info']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-info']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-search']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-resultado']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-producto']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-producto']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-modal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-modal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-modal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-modal-search']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-item']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-info']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-info']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-cantidad']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-cantidad']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-resultado']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-resultado']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-item']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-info']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-cantidad']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload-container']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload-container']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-upload-preview-image']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-upload-preview-info']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-upload-preview-info']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-edit-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-viewport']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-track']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-dots']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-upload-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-upload-preview-image']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-edit-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-edit-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-is-open']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-grid-two-cols']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-container']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-header']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-header']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-list']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-card']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['text-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-vence-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['days-remaining']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['billing-workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['filtro-clientes-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-clear-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-clear-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customers-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-details']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-details']} */ ;
/** @type {__VLS_StyleScopedClasses['email']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-details']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['facturas-carousel-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-header']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-id']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-fecha']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-factura-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-factura-card']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-total']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-info']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-info']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-resultado']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-no-encontrado']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-viewport']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['products-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tag-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['product-body']} */ ;
/** @type {__VLS_StyleScopedClasses['product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['product-description']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['quantity-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-number']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-checkout-execute']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-actions-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-checkout-execute']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-factura-actions-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-table']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-table']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-table']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-table']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-product-row']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-product-row']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['page-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['page-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['side-cart-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-header-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-title']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-clear-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-clear-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-row-advanced']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-row-advanced']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-price']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-deadline-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['deadline-field']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width-date']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-modal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-modal-search']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-item']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-item']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-cantidad']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-eliminar']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-title']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-message']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-floating-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-is-open']} */ ;
/** @type {__VLS_StyleScopedClasses['side-cart-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['billing-workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['filtro-clientes-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-grid-two-cols']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['products-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['product-body']} */ ;
/** @type {__VLS_StyleScopedClasses['product-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons-group']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-views-switcher']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-view-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['billing-workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['filtro-clientes-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['facturas-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-factura-card']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-vista-previa']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-grid-two-cols']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-panels-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-panels-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['two-columns']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-kpis-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-kpis-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-bar-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-header-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-type-switcher']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-type-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-stock-table']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-stock-table']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-row']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-row']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-panel-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-column-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-visual-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut-section']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut-legend']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-donut']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-vista-previa']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-vista-previa']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-sales-view']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-container']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-sales-view']} */ ;
/** @type {__VLS_StyleScopedClasses['billing-workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-today-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-today-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-today-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-title']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-title']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day-today']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-overdue']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-status']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-urgent']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-status']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-soon']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-status']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-status']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-priority-alta']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-priority-media']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-priority-baja']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day-add']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-weekdays']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-selected']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-selected']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-high']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-number']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-today']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-selected']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-number']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-priority-alta']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-priority-media']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-priority-baja']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-selected-day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-selected-day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-modal-close']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-form']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-form']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-complete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-complete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-list']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-weekdays']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-number']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-selected-day-tasks']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-today-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-list']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-modal-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-modal-actions-right']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-modal-actions-right']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-form']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-number']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-redirect-card']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-redirect-card']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-redirect-card']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-checkout-execute']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-redirect-card']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-redirect-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof Header, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Header, new Header({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
const __VLS_4 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    name: "toast-slide",
}));
const __VLS_6 = __VLS_5({
    name: "toast-slide",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
const { default: __VLS_8 } = __VLS_7.slots;
if (__VLS_ctx.notification.show) {
    // @ts-ignore
    [notification,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "custom-toast" },
        ...{ class: (__VLS_ctx.notification.type) },
    });
    // @ts-ignore
    [notification,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "toast-accent" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "toast-icon" },
    });
    (__VLS_ctx.notification.type === 'success' ? '⚡' : '⚠️');
    // @ts-ignore
    [notification,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "toast-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "toast-title" },
    });
    (__VLS_ctx.notification.type === 'success' ? 'Operación Exitosa' : 'Aviso del Sistema');
    // @ts-ignore
    [notification,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "toast-message" },
    });
    (__VLS_ctx.notification.message);
    // @ts-ignore
    [notification,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.notification.show))
                    return;
                __VLS_ctx.notification.show = false;
                // @ts-ignore
                [notification,];
            } },
        ...{ class: "toast-close-btn" },
    });
}
var __VLS_7;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "ventas-container" },
    ...{ class: ({ 'cart-is-open': __VLS_ctx.isCartOpen && !__VLS_ctx.isAdmin }) },
});
// @ts-ignore
[isCartOpen, isAdmin,];
if (__VLS_ctx.loading) {
    // @ts-ignore
    [loading,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "spinner" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
else if (__VLS_ctx.isAdmin) {
    // @ts-ignore
    [isAdmin,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "admin-panel" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "panel-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "admin-views-switcher" },
        role: "tablist",
        'aria-label': "Secciones del admin",
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!(__VLS_ctx.isAdmin))
                    return;
                __VLS_ctx.adminTab = 'ventas';
                // @ts-ignore
                [adminTab,];
            } },
        type: "button",
        ...{ class: "admin-view-tab" },
        ...{ class: ({ active: __VLS_ctx.adminTab === 'ventas' }) },
    });
    // @ts-ignore
    [adminTab,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!(__VLS_ctx.isAdmin))
                    return;
                __VLS_ctx.adminTab = 'estadisticas';
                // @ts-ignore
                [adminTab,];
            } },
        type: "button",
        ...{ class: "admin-view-tab" },
        ...{ class: ({ active: __VLS_ctx.adminTab === 'estadisticas' }) },
    });
    // @ts-ignore
    [adminTab,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.abrirCalendarioAdmin) },
        type: "button",
        ...{ class: "admin-view-tab" },
        ...{ class: ({ active: __VLS_ctx.adminTab === 'calendario' }) },
    });
    // @ts-ignore
    [adminTab, abrirCalendarioAdmin,];
    const __VLS_9 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    Transition;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        name: "admin-calendar-slide",
        mode: "out-in",
    }));
    const __VLS_11 = __VLS_10({
        name: "admin-calendar-slide",
        mode: "out-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const { default: __VLS_13 } = __VLS_12.slots;
    if (__VLS_ctx.adminTab === 'calendario') {
        // @ts-ignore
        [adminTab,];
        __VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
            key: "calendario",
            ...{ class: "admin-calendar-view admin-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "calendar-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "section-desc" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "calendar-header-actions" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "calendar-view-switch" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.isAdmin))
                        return;
                    if (!(__VLS_ctx.adminTab === 'calendario'))
                        return;
                    __VLS_ctx.cambiarVistaCalendarioAdmin('semana');
                    // @ts-ignore
                    [cambiarVistaCalendarioAdmin,];
                } },
            type: "button",
            ...{ class: ({ active: __VLS_ctx.vistaCalendarioAdmin === 'semana' }) },
        });
        // @ts-ignore
        [vistaCalendarioAdmin,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.isAdmin))
                        return;
                    if (!(__VLS_ctx.adminTab === 'calendario'))
                        return;
                    __VLS_ctx.cambiarVistaCalendarioAdmin('mes');
                    // @ts-ignore
                    [cambiarVistaCalendarioAdmin,];
                } },
            type: "button",
            ...{ class: ({ active: __VLS_ctx.vistaCalendarioAdmin === 'mes' }) },
        });
        // @ts-ignore
        [vistaCalendarioAdmin,];
        if (__VLS_ctx.vistaCalendarioAdmin === 'semana') {
            // @ts-ignore
            [vistaCalendarioAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'calendario'))
                            return;
                        if (!(__VLS_ctx.vistaCalendarioAdmin === 'semana'))
                            return;
                        __VLS_ctx.cambiarSemanaAdmin(-1);
                        // @ts-ignore
                        [cambiarSemanaAdmin,];
                    } },
                type: "button",
                ...{ class: "calendar-nav-btn" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.irASemanaActualAdmin) },
                type: "button",
                ...{ class: "calendar-today-btn" },
            });
            // @ts-ignore
            [irASemanaActualAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'calendario'))
                            return;
                        if (!(__VLS_ctx.vistaCalendarioAdmin === 'semana'))
                            return;
                        __VLS_ctx.cambiarSemanaAdmin(1);
                        // @ts-ignore
                        [cambiarSemanaAdmin,];
                    } },
                type: "button",
                ...{ class: "calendar-nav-btn" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'calendario'))
                            return;
                        if (!!(__VLS_ctx.vistaCalendarioAdmin === 'semana'))
                            return;
                        __VLS_ctx.cambiarMesCalendarioAdmin(-1);
                        // @ts-ignore
                        [cambiarMesCalendarioAdmin,];
                    } },
                type: "button",
                ...{ class: "calendar-nav-btn" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.irAlMesActualAdmin) },
                type: "button",
                ...{ class: "calendar-today-btn" },
            });
            // @ts-ignore
            [irAlMesActualAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'calendario'))
                            return;
                        if (!!(__VLS_ctx.vistaCalendarioAdmin === 'semana'))
                            return;
                        __VLS_ctx.cambiarMesCalendarioAdmin(1);
                        // @ts-ignore
                        [cambiarMesCalendarioAdmin,];
                    } },
                type: "button",
                ...{ class: "calendar-nav-btn" },
            });
        }
        if (__VLS_ctx.tareasProximasAdmin.length) {
            // @ts-ignore
            [tareasProximasAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-upcoming-alert" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-upcoming-title" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-upcoming-list" },
            });
            for (const [tarea] of __VLS_getVForSourceType((__VLS_ctx.tareasProximasAdmin.slice(0, 4)))) {
                // @ts-ignore
                [tareasProximasAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    key: (`upcoming-${tarea.id}`),
                    ...{ class: "calendar-upcoming-item" },
                    ...{ class: (__VLS_ctx.estadoTareaAdmin(tarea).clase) },
                });
                // @ts-ignore
                [estadoTareaAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
                __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
                (__VLS_ctx.prioridadTareaAdmin(tarea).icono);
                (tarea.titulo);
                // @ts-ignore
                [prioridadTareaAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
                (__VLS_ctx.formatearFechaTareaAdmin(tarea.fecha));
                (tarea.hora ? ` · ${tarea.hora}` : '');
                (tarea.lugar ? ` · ${tarea.lugar}` : '');
                // @ts-ignore
                [formatearFechaTareaAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "calendar-upcoming-priority" },
                    ...{ class: (__VLS_ctx.prioridadTareaAdmin(tarea).clase) },
                });
                // @ts-ignore
                [prioridadTareaAdmin,];
                (__VLS_ctx.prioridadTareaAdmin(tarea).texto);
                // @ts-ignore
                [prioridadTareaAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                (__VLS_ctx.estadoTareaAdmin(tarea).texto);
                // @ts-ignore
                [estadoTareaAdmin,];
            }
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "calendar-toolbar" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.vistaCalendarioAdmin === 'semana' ? __VLS_ctx.rangoSemanaAdmin : __VLS_ctx.mesCalendarioAdmin.nombre);
        // @ts-ignore
        [vistaCalendarioAdmin, rangoSemanaAdmin, mesCalendarioAdmin,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.tareasPendientesAdmin.length);
        // @ts-ignore
        [tareasPendientesAdmin,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.isAdmin))
                        return;
                    if (!(__VLS_ctx.adminTab === 'calendario'))
                        return;
                    __VLS_ctx.abrirNuevaTareaAdmin();
                    // @ts-ignore
                    [abrirNuevaTareaAdmin,];
                } },
            type: "button",
            ...{ class: "calendar-add-btn" },
        });
        if (__VLS_ctx.vistaCalendarioAdmin === 'mes') {
            // @ts-ignore
            [vistaCalendarioAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-month-view" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-month-weekdays" },
            });
            for (const [dia] of __VLS_getVForSourceType((['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']))) {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    key: (dia),
                });
                (dia);
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-month-grid" },
            });
            for (const [dia] of __VLS_getVForSourceType((__VLS_ctx.diasMesCalendarioAdmin))) {
                // @ts-ignore
                [diasMesCalendarioAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!(__VLS_ctx.isAdmin))
                                return;
                            if (!(__VLS_ctx.adminTab === 'calendario'))
                                return;
                            if (!(__VLS_ctx.vistaCalendarioAdmin === 'mes'))
                                return;
                            __VLS_ctx.seleccionarDiaCalendarioAdmin(dia.clave);
                            // @ts-ignore
                            [seleccionarDiaCalendarioAdmin,];
                        } },
                    key: (`month-${dia.clave}`),
                    type: "button",
                    ...{ class: "calendar-month-day" },
                    ...{ class: ({
                            'calendar-month-day-outside': !dia.esDelMes,
                            'calendar-month-day-today': dia.esHoy,
                            'calendar-month-day-selected': dia.seleccionado,
                            'calendar-month-day-has-tasks': dia.cantidadTareas > 0,
                            'calendar-month-day-high': dia.tieneAlta
                        }) },
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "calendar-month-number" },
                });
                (dia.numero);
                if (dia.cantidadTareas) {
                    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                        ...{ class: "calendar-month-task-summary" },
                    });
                    for (const [tarea] of __VLS_getVForSourceType((dia.tareas.slice(0, 3)))) {
                        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                            key: (tarea.id),
                            ...{ class: "calendar-month-task-dot" },
                            ...{ class: (__VLS_ctx.prioridadTareaAdmin(tarea).clase) },
                        });
                        // @ts-ignore
                        [prioridadTareaAdmin,];
                        (__VLS_ctx.prioridadTareaAdmin(tarea).icono);
                        (tarea.titulo);
                        // @ts-ignore
                        [prioridadTareaAdmin,];
                    }
                    if (dia.cantidadTareas > 3) {
                        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
                        (dia.cantidadTareas - 3);
                    }
                }
                else {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                        ...{ class: "calendar-month-empty" },
                    });
                }
            }
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-week" },
            });
            for (const [dia] of __VLS_getVForSourceType((__VLS_ctx.diasSemanaAdmin))) {
                // @ts-ignore
                [diasSemanaAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.article, __VLS_elements.article)({
                    key: (dia.clave),
                    ...{ class: "calendar-day" },
                    ...{ class: ({ 'calendar-day-today': dia.esHoy }) },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "calendar-day-header" },
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                (dia.nombre);
                __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
                (dia.numero);
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "calendar-day-tasks" },
                });
                for (const [tarea] of __VLS_getVForSourceType((__VLS_ctx.tareasPendientesPorDiaAdmin(dia.clave)))) {
                    // @ts-ignore
                    [tareasPendientesPorDiaAdmin,];
                    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!!(__VLS_ctx.loading))
                                    return;
                                if (!(__VLS_ctx.isAdmin))
                                    return;
                                if (!(__VLS_ctx.adminTab === 'calendario'))
                                    return;
                                if (!!(__VLS_ctx.vistaCalendarioAdmin === 'mes'))
                                    return;
                                __VLS_ctx.abrirEditarTareaAdmin(tarea);
                                // @ts-ignore
                                [abrirEditarTareaAdmin,];
                            } },
                        key: (tarea.id),
                        type: "button",
                        ...{ class: "calendar-task-card" },
                        ...{ class: (__VLS_ctx.estadoTareaAdmin(tarea).clase) },
                    });
                    // @ts-ignore
                    [estadoTareaAdmin,];
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                        ...{ class: "calendar-task-time" },
                    });
                    (tarea.hora || 'Sin hora');
                    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
                    (__VLS_ctx.prioridadTareaAdmin(tarea).icono);
                    (tarea.titulo);
                    // @ts-ignore
                    [prioridadTareaAdmin,];
                    if (tarea.lugar) {
                        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
                        (tarea.lugar);
                    }
                    if (tarea.descripcion) {
                        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
                        (tarea.descripcion);
                    }
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                        ...{ class: "calendar-task-priority" },
                        ...{ class: (__VLS_ctx.prioridadTareaAdmin(tarea).clase) },
                    });
                    // @ts-ignore
                    [prioridadTareaAdmin,];
                    (__VLS_ctx.prioridadTareaAdmin(tarea).texto);
                    // @ts-ignore
                    [prioridadTareaAdmin,];
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                        ...{ class: "calendar-task-status" },
                    });
                    (__VLS_ctx.estadoTareaAdmin(tarea).texto);
                    // @ts-ignore
                    [estadoTareaAdmin,];
                }
                if (!__VLS_ctx.tareasPendientesPorDiaAdmin(dia.clave).length) {
                    // @ts-ignore
                    [tareasPendientesPorDiaAdmin,];
                    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                        ...{ class: "calendar-empty-day" },
                    });
                }
                __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!(__VLS_ctx.isAdmin))
                                return;
                            if (!(__VLS_ctx.adminTab === 'calendario'))
                                return;
                            if (!!(__VLS_ctx.vistaCalendarioAdmin === 'mes'))
                                return;
                            __VLS_ctx.abrirNuevaTareaAdmin(dia.clave);
                            // @ts-ignore
                            [abrirNuevaTareaAdmin,];
                        } },
                    type: "button",
                    ...{ class: "calendar-day-add" },
                });
            }
        }
        if (__VLS_ctx.vistaCalendarioAdmin === 'mes') {
            // @ts-ignore
            [vistaCalendarioAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-selected-day-panel" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-selected-day-header" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
            __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
            (__VLS_ctx.fechaSeleccionadaCalendarioAdmin);
            // @ts-ignore
            [fechaSeleccionadaCalendarioAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'calendario'))
                            return;
                        if (!(__VLS_ctx.vistaCalendarioAdmin === 'mes'))
                            return;
                        __VLS_ctx.abrirNuevaTareaAdmin(__VLS_ctx.diaCalendarioSeleccionado);
                        // @ts-ignore
                        [abrirNuevaTareaAdmin, diaCalendarioSeleccionado,];
                    } },
                type: "button",
                ...{ class: "calendar-add-btn" },
            });
            if (__VLS_ctx.tareasDiaCalendarioSeleccionado.length) {
                // @ts-ignore
                [tareasDiaCalendarioSeleccionado,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "calendar-selected-day-tasks" },
                });
                for (const [tarea] of __VLS_getVForSourceType((__VLS_ctx.tareasDiaCalendarioSeleccionado))) {
                    // @ts-ignore
                    [tareasDiaCalendarioSeleccionado,];
                    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!!(__VLS_ctx.loading))
                                    return;
                                if (!(__VLS_ctx.isAdmin))
                                    return;
                                if (!(__VLS_ctx.adminTab === 'calendario'))
                                    return;
                                if (!(__VLS_ctx.vistaCalendarioAdmin === 'mes'))
                                    return;
                                if (!(__VLS_ctx.tareasDiaCalendarioSeleccionado.length))
                                    return;
                                __VLS_ctx.abrirEditarTareaAdmin(tarea);
                                // @ts-ignore
                                [abrirEditarTareaAdmin,];
                            } },
                        key: (`selected-${tarea.id}`),
                        type: "button",
                        ...{ class: "calendar-task-card" },
                        ...{ class: ([__VLS_ctx.estadoTareaAdmin(tarea).clase, __VLS_ctx.prioridadTareaAdmin(tarea).clase]) },
                    });
                    // @ts-ignore
                    [estadoTareaAdmin, prioridadTareaAdmin,];
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                        ...{ class: "calendar-task-time" },
                    });
                    (tarea.hora || 'Sin hora');
                    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
                    (__VLS_ctx.prioridadTareaAdmin(tarea).icono);
                    (tarea.titulo);
                    // @ts-ignore
                    [prioridadTareaAdmin,];
                    if (tarea.lugar) {
                        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
                        (tarea.lugar);
                    }
                    if (tarea.descripcion) {
                        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
                        (tarea.descripcion);
                    }
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                        ...{ class: "calendar-task-priority" },
                        ...{ class: (__VLS_ctx.prioridadTareaAdmin(tarea).clase) },
                    });
                    // @ts-ignore
                    [prioridadTareaAdmin,];
                    (__VLS_ctx.prioridadTareaAdmin(tarea).texto);
                    // @ts-ignore
                    [prioridadTareaAdmin,];
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                        ...{ class: "calendar-task-status" },
                    });
                    (__VLS_ctx.estadoTareaAdmin(tarea).texto);
                    // @ts-ignore
                    [estadoTareaAdmin,];
                }
            }
            else {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "calendar-selected-day-empty" },
                });
            }
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "calendar-completed-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "calendar-completed-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.tareasCompletadasAdmin.length);
        // @ts-ignore
        [tareasCompletadasAdmin,];
        if (__VLS_ctx.tareasCompletadasAdmin.length) {
            // @ts-ignore
            [tareasCompletadasAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-completed-list" },
            });
            for (const [tarea] of __VLS_getVForSourceType((__VLS_ctx.tareasCompletadasAdmin))) {
                // @ts-ignore
                [tareasCompletadasAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    key: (`done-${tarea.id}`),
                    ...{ class: "calendar-completed-item" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
                __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
                (__VLS_ctx.prioridadTareaAdmin(tarea).icono);
                (tarea.titulo);
                // @ts-ignore
                [prioridadTareaAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                (__VLS_ctx.formatearFechaTareaAdmin(tarea.fecha));
                (tarea.hora ? ` · ${tarea.hora}` : '');
                (tarea.lugar ? ` · ${tarea.lugar}` : '');
                // @ts-ignore
                [formatearFechaTareaAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
                    ...{ class: "calendar-completed-priority" },
                    ...{ class: (__VLS_ctx.prioridadTareaAdmin(tarea).clase) },
                });
                // @ts-ignore
                [prioridadTareaAdmin,];
                (__VLS_ctx.prioridadTareaAdmin(tarea).texto);
                // @ts-ignore
                [prioridadTareaAdmin,];
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "calendar-completed-badge" },
                });
            }
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-completed-empty" },
            });
        }
        if (__VLS_ctx.modalTareaAdmin) {
            // @ts-ignore
            [modalTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ onClick: (__VLS_ctx.cerrarModalTareaAdmin) },
                ...{ class: "calendar-task-modal-overlay" },
            });
            // @ts-ignore
            [cerrarModalTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-task-modal" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-task-modal-header" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
            __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
            (__VLS_ctx.tareaAdminEditando ? 'Editar tarea' : 'Nueva tarea');
            // @ts-ignore
            [tareaAdminEditando,];
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
            (__VLS_ctx.tareaAdminEditando ? 'Modificá los datos y guardá los cambios.' : 'Agregá una actividad a tu agenda.');
            // @ts-ignore
            [tareaAdminEditando,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.cerrarModalTareaAdmin) },
                type: "button",
                ...{ class: "calendar-modal-close" },
            });
            // @ts-ignore
            [cerrarModalTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-task-form" },
            });
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
            __VLS_asFunctionalElement(__VLS_elements.input)({
                value: (__VLS_ctx.formTareaAdmin.titulo),
                type: "text",
                ...{ class: "pro-input" },
                placeholder: "Ej. Ir a trabajar a San Francisco",
            });
            // @ts-ignore
            [formTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-form-grid" },
            });
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
            __VLS_asFunctionalElement(__VLS_elements.input)({
                type: "date",
                ...{ class: "pro-input" },
            });
            (__VLS_ctx.formTareaAdmin.fecha);
            // @ts-ignore
            [formTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
            __VLS_asFunctionalElement(__VLS_elements.input)({
                type: "time",
                ...{ class: "pro-input" },
            });
            (__VLS_ctx.formTareaAdmin.hora);
            // @ts-ignore
            [formTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
            __VLS_asFunctionalElement(__VLS_elements.input)({
                value: (__VLS_ctx.formTareaAdmin.lugar),
                type: "text",
                ...{ class: "pro-input" },
                placeholder: "Ej. Local de Beta Gráfica",
            });
            // @ts-ignore
            [formTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
            __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
                value: (__VLS_ctx.formTareaAdmin.prioridad),
                ...{ class: "pro-input calendar-priority-select" },
            });
            // @ts-ignore
            [formTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
                value: "alta",
            });
            __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
                value: "media",
            });
            __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
                value: "baja",
            });
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
            __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
                value: (__VLS_ctx.formTareaAdmin.descripcion),
                ...{ class: "pro-input calendar-task-textarea" },
                placeholder: "Detalles, materiales que tenés que llevar, persona a contactar, etc.",
            });
            // @ts-ignore
            [formTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-modal-actions" },
            });
            if (__VLS_ctx.tareaAdminEditando) {
                // @ts-ignore
                [tareaAdminEditando,];
                __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                    ...{ onClick: (__VLS_ctx.eliminarTareaAdmin) },
                    type: "button",
                    ...{ class: "calendar-delete-btn" },
                });
                // @ts-ignore
                [eliminarTareaAdmin,];
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "calendar-modal-actions-right" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.cerrarModalTareaAdmin) },
                type: "button",
                ...{ class: "calendar-cancel-btn" },
            });
            // @ts-ignore
            [cerrarModalTareaAdmin,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.guardarTareaAdmin) },
                type: "button",
                ...{ class: "calendar-save-btn" },
            });
            // @ts-ignore
            [guardarTareaAdmin,];
            (__VLS_ctx.tareaAdminEditando ? 'Guardar cambios' : 'Guardar tarea');
            // @ts-ignore
            [tareaAdminEditando,];
            if (__VLS_ctx.tareaAdminEditando && !__VLS_ctx.tareaAdminEditando.completada) {
                // @ts-ignore
                [tareaAdminEditando, tareaAdminEditando,];
                __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                    ...{ onClick: (__VLS_ctx.completarTareaAdmin) },
                    type: "button",
                    ...{ class: "calendar-complete-btn" },
                });
                // @ts-ignore
                [completarTareaAdmin,];
            }
        }
    }
    else {
        if (__VLS_ctx.adminTab === 'ventas') {
            // @ts-ignore
            [adminTab,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: "ventas",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: "estadisticas",
            });
        }
    }
    var __VLS_12;
    if (__VLS_ctx.adminTab === 'ventas') {
        // @ts-ignore
        [adminTab,];
        __VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
            ...{ class: "admin-sales-view" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "alert-vencimiento-container" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "alert-vencimiento-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "alert-icon" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "alert-vencimiento-list" },
        });
        for (const [p] of __VLS_getVForSourceType((__VLS_ctx.pedidosPorVencer))) {
            // @ts-ignore
            [pedidosPorVencer,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (p.id),
                ...{ class: "alert-vencimiento-card" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "card-main-info" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "info-row" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "info-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "info-value text-highlight" },
            });
            (p.nombre);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "info-row" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "info-label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "info-value" },
            });
            (p.pedido);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "card-badge-zone" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "badge-vence-danger" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "clock-icon" },
            });
            (p.fechaEntregaFormateada);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "days-remaining" },
            });
            (p.diasRestantes);
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.marcarPedidoCompletado(p);
                        // @ts-ignore
                        [marcarPedidoCompletado,];
                    } },
                ...{ class: "btn-alert-completar" },
            });
        }
        __VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
            ...{ class: "admin-section billing-workspace" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "filtro-clientes-sidebar" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "sidebar-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        if (__VLS_ctx.clienteFiltrado) {
            // @ts-ignore
            [clienteFiltrado,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.limpiarFiltroCliente) },
                ...{ class: "btn-clear-inline" },
                title: "Quitar Filtro",
            });
            // @ts-ignore
            [limpiarFiltroCliente,];
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "search-customer-wrapper" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            value: (__VLS_ctx.filtroBusquedaClientes),
            type: "text",
            placeholder: "🔍 Buscar cliente por nombre de usuario...",
            ...{ class: "pro-input" },
            ...{ style: {} },
        });
        // @ts-ignore
        [filtroBusquedaClientes,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "sidebar-customers-list" },
        });
        for (const [c] of __VLS_getVForSourceType((__VLS_ctx.clientesFiltradosYOrdenados))) {
            // @ts-ignore
            [clientesFiltradosYOrdenados,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.filtrarPorCliente(c);
                        // @ts-ignore
                        [filtrarPorCliente,];
                    } },
                key: (c.id),
                ...{ class: "sidebar-customer-item" },
                ...{ class: ({ 'active': __VLS_ctx.clienteFiltrado?.id === c.id }) },
            });
            // @ts-ignore
            [clienteFiltrado,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "customer-mini-avatar" },
            });
            ((c.nombre || '?').charAt(0).toUpperCase());
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "customer-mini-details" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "name" },
            });
            (c.nombre);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "email" },
            });
            (c.email);
        }
        if (__VLS_ctx.clientesFiltradosYOrdenados.length === 0) {
            // @ts-ignore
            [clientesFiltradosYOrdenados,];
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "muted text-center mini-text" },
                ...{ style: {} },
            });
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "facturas-carousel-zone" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "section-header-flex" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "section-desc" },
        });
        (__VLS_ctx.clienteFiltrado
            ? (__VLS_ctx.mostrarTodosRegistrosCliente
                ? `Todos los registros de: ${__VLS_ctx.clienteFiltrado.nombre}`
                : `Compras pendientes de: ${__VLS_ctx.clienteFiltrado.nombre}`)
            : 'Compras pendientes de completar. Seleccioná un cliente para consultar todo su historial.');
        // @ts-ignore
        [clienteFiltrado, clienteFiltrado, clienteFiltrado, mostrarTodosRegistrosCliente,];
        if (__VLS_ctx.clienteFiltrado) {
            // @ts-ignore
            [clienteFiltrado,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            if (!__VLS_ctx.mostrarTodosRegistrosCliente) {
                // @ts-ignore
                [mostrarTodosRegistrosCliente,];
                __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                    ...{ onClick: (__VLS_ctx.verTodosLosRegistrosCliente) },
                    ...{ class: "btn" },
                    ...{ style: {} },
                });
                // @ts-ignore
                [verTodosLosRegistrosCliente,];
            }
            else {
                __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!(__VLS_ctx.isAdmin))
                                return;
                            if (!(__VLS_ctx.adminTab === 'ventas'))
                                return;
                            if (!(__VLS_ctx.clienteFiltrado))
                                return;
                            if (!!(!__VLS_ctx.mostrarTodosRegistrosCliente))
                                return;
                            __VLS_ctx.mostrarTodosRegistrosCliente = false;
                            __VLS_ctx.paginaActual = 1;
                            __VLS_ctx.registroVistaPrevia = null;
                            // @ts-ignore
                            [mostrarTodosRegistrosCliente, paginaActual, registroVistaPrevia,];
                        } },
                    ...{ class: "btn" },
                    ...{ style: {} },
                });
            }
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "facturas-carousel" },
        });
        for (const [p] of __VLS_getVForSourceType((__VLS_ctx.pedidosPaginados))) {
            // @ts-ignore
            [pedidosPaginados,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (p.id),
                ...{ class: "mini-factura-card" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "factura-header" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "factura-id" },
            });
            (String(p.id).padStart(4, '0'));
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "factura-fecha" },
            });
            (p.fechaEntregaFormateada || p.fecha_entrega || 'Sin fecha');
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "factura-body" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "factura-cliente" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "value-highlight" },
            });
            (p.nombre);
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "sub-value" },
            });
            (p.email || 'Sin correo');
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "factura-items" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "label" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "factura-item-line" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "item-name" },
            });
            (p.cantidad_productos || p.items?.length || 1);
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "item-qty" },
            });
            (p.cantidad_unidades || p.unidades || 1);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "factura-footer" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "factura-total" },
                ...{ class: ({ 'estado-completado': String(p.estado || '').toLowerCase() === 'completado' }) },
            });
            (p.estado || 'Pendiente');
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.abrirPreviewRegistro(p);
                        // @ts-ignore
                        [abrirPreviewRegistro,];
                    } },
                ...{ class: "btn-vista-previa" },
                type: "button",
            });
            if (String(p.estado || '').toLowerCase() !== 'completado') {
                __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!(__VLS_ctx.isAdmin))
                                return;
                            if (!(__VLS_ctx.adminTab === 'ventas'))
                                return;
                            if (!(String(p.estado || '').toLowerCase() !== 'completado'))
                                return;
                            __VLS_ctx.marcarPedidoCompletado(p);
                            // @ts-ignore
                            [marcarPedidoCompletado,];
                        } },
                    ...{ class: "btn-alert-completar" },
                    type: "button",
                });
            }
        }
        if (__VLS_ctx.pedidosPaginados.length === 0) {
            // @ts-ignore
            [pedidosPaginados,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "factura-empty-carousel text-center muted" },
            });
            (__VLS_ctx.mostrarTodosRegistrosCliente
                ? '📭 Este cliente no tiene registros de compra.'
                : '📭 No hay compras pendientes de completar.');
            // @ts-ignore
            [mostrarTodosRegistrosCliente,];
        }
    }
    else if (__VLS_ctx.adminTab === 'estadisticas') {
        // @ts-ignore
        [adminTab,];
        __VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
            ...{ class: "admin-stats-section admin-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "section-header-flex" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "section-desc" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stats-stock-card" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stats-panel-header stock-header-row" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stock-type-switcher" },
        });
        for (const [tipo] of __VLS_getVForSourceType((__VLS_ctx.stockCategorias))) {
            // @ts-ignore
            [stockCategorias,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        if (!(__VLS_ctx.adminTab === 'estadisticas'))
                            return;
                        __VLS_ctx.stockCategoriaSeleccionada = tipo.valor;
                        // @ts-ignore
                        [stockCategoriaSeleccionada,];
                    } },
                key: (tipo.valor),
                type: "button",
                ...{ class: "stock-type-btn" },
                ...{ class: ({ active: __VLS_ctx.stockCategoriaSeleccionada === tipo.valor }) },
            });
            // @ts-ignore
            [stockCategoriaSeleccionada,];
            (tipo.label);
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "stats-stock-table-wrap" },
        });
        __VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
            ...{ class: "stats-stock-table" },
        });
        __VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
        __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
        __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
        __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
        __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
        for (const [producto] of __VLS_getVForSourceType((__VLS_ctx.productosStockPaginaActual))) {
            // @ts-ignore
            [productosStockPaginaActual,];
            __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
                key: (producto.id),
                ...{ class: ({ 'stock-alert-row': Number(producto.stock || 0) <= 0 }) },
            });
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
                ...{ class: "stock-product-name" },
            });
            (producto.nombre);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (producto.codigo || 'Sin código');
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (producto.color || 'Sin color');
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "stock-value" },
                ...{ class: ({ 'stock-empty': Number(producto.stock || 0) <= 0 }) },
            });
            (Number(producto.stock || 0) > 0 ? `${Number(producto.stock || 0)} u.` : 'Sin stock');
            if (Number(producto.stock || 0) <= 0) {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "stock-warning" },
                    title: "Sin stock",
                });
            }
        }
        if (!__VLS_ctx.productosStockPaginaActual.length) {
            // @ts-ignore
            [productosStockPaginaActual,];
            __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
                colspan: "4",
                ...{ class: "stats-empty" },
            });
        }
        if (__VLS_ctx.productosStockCategoria.length > __VLS_ctx.stockPorPagina) {
            // @ts-ignore
            [productosStockCategoria, stockPorPagina,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "stock-pagination" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.paginaStockAnterior) },
                type: "button",
                ...{ class: "stock-page-btn" },
                disabled: (__VLS_ctx.paginaStockActual === 1),
            });
            // @ts-ignore
            [paginaStockAnterior, paginaStockActual,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "stock-page-indicator" },
            });
            (__VLS_ctx.paginaStockActual);
            (__VLS_ctx.totalPaginasStock);
            // @ts-ignore
            [paginaStockActual, totalPaginasStock,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.paginaStockSiguiente) },
                type: "button",
                ...{ class: "stock-page-btn" },
                disabled: (__VLS_ctx.paginaStockActual >= __VLS_ctx.totalPaginasStock),
            });
            // @ts-ignore
            [paginaStockActual, totalPaginasStock, paginaStockSiguiente,];
        }
    }
    if (__VLS_ctx.adminTab === 'ventas') {
        // @ts-ignore
        [adminTab,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "admin-grid-two-cols" },
        });
        __VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
            ...{ class: "admin-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            value: (__VLS_ctx.nuevoSlide.titulo),
            type: "text",
            ...{ class: "pro-input" },
            placeholder: "Título del slide",
            ...{ style: {} },
        });
        // @ts-ignore
        [nuevoSlide,];
        __VLS_asFunctionalElement(__VLS_elements.input)({
            type: "number",
            ...{ class: "pro-input" },
            placeholder: "ID Producto (opcional)",
            ...{ style: {} },
        });
        (__VLS_ctx.nuevoSlide.productoId);
        // @ts-ignore
        [nuevoSlide,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "file-upload-container" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            for: "slide-upload",
            ...{ class: "custom-file-upload" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            ...{ class: "upload-icon" },
        });
        __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
            d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
        });
        __VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
            points: "17 8 12 3 7 8",
        });
        __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
            x1: "12",
            y1: "3",
            x2: "12",
            y2: "15",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.input)({
            ...{ onChange: (__VLS_ctx.manejarSubidaSlide) },
            id: "slide-upload",
            type: "file",
            accept: "image/*",
        });
        // @ts-ignore
        [manejarSubidaSlide,];
        if (__VLS_ctx.slidePreviewUrl) {
            // @ts-ignore
            [slidePreviewUrl,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "beta-slide-upload-preview" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "beta-slide-upload-preview-image" },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                src: (__VLS_ctx.slidePreviewUrl),
                alt: "Vista previa del slide",
            });
            // @ts-ignore
            [slidePreviewUrl,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "beta-slide-preview-chip" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "beta-slide-upload-preview-info" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        }
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            value: (__VLS_ctx.nuevoSlide.imagenUrl),
            type: "text",
            ...{ class: "pro-input" },
            placeholder: "URL de imagen",
            ...{ style: {} },
        });
        // @ts-ignore
        [nuevoSlide,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.agregarSlide) },
            ...{ class: "btn primary btn-block" },
            ...{ style: {} },
        });
        // @ts-ignore
        [agregarSlide,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "admin-products-list" },
            ...{ style: {} },
        });
        for (const [slide] of __VLS_getVForSourceType((__VLS_ctx.carouselItems))) {
            // @ts-ignore
            [carouselItems,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (slide.id),
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (__VLS_ctx.manejarErrorImagen) },
                src: (__VLS_ctx.resolverImagen(slide.imagen)),
                loading: "lazy",
                ...{ style: {} },
            });
            // @ts-ignore
            [manejarErrorImagen, resolverImagen,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                value: (slide.titulo),
                type: "text",
                ...{ class: "pro-input" },
                placeholder: "Título",
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                type: "number",
                ...{ class: "pro-input" },
                placeholder: "ID Prod.",
                ...{ style: {} },
            });
            (slide.producto_id);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                value: (slide.imagenUrl),
                type: "text",
                ...{ class: "pro-input" },
                placeholder: "URL Imagen",
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.manejarSubidaSlideEdicion($event, slide.id);
                        // @ts-ignore
                        [manejarSubidaSlideEdicion,];
                    } },
                type: "file",
                accept: "image/*",
                ...{ style: {} },
            });
            if (__VLS_ctx.slideEditPreviews[slide.id]) {
                // @ts-ignore
                [slideEditPreviews,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "beta-slide-edit-preview" },
                });
                __VLS_asFunctionalElement(__VLS_elements.img)({
                    src: (__VLS_ctx.slideEditPreviews[slide.id]),
                    alt: "Vista previa del cambio",
                });
                // @ts-ignore
                [slideEditPreviews,];
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.actualizarSlide(slide);
                        // @ts-ignore
                        [actualizarSlide,];
                    } },
                ...{ class: "btn btn-sm btn-save" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.eliminarSlide(slide.id);
                        // @ts-ignore
                        [eliminarSlide,];
                    } },
                ...{ class: "btn btn-sm btn-logout" },
                ...{ style: {} },
            });
        }
        if (__VLS_ctx.carouselItems.length === 0) {
            // @ts-ignore
            [carouselItems,];
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "muted" },
                ...{ style: {} },
            });
        }
        __VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
            ...{ class: "admin-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "table-container" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
            ...{ class: "pro-table" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
        __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
        __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
        __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
        __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
        __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
        for (const [p] of __VLS_getVForSourceType((__VLS_ctx.pedidosPaginados))) {
            // @ts-ignore
            [pedidosPaginados,];
            __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
                key: (p.id),
                ...{ class: ({ 'row-vencida-urgente': p.diasRestantes <= 2 && p.estado !== 'Completado' }) },
            });
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
                ...{ class: "font-medium" },
            });
            (p.nombre);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (p.pedido);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            (p.fechaEntregaFormateada);
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "status-badge" },
                ...{ class: (__VLS_ctx.getBadgeClassDinamico(p)) },
            });
            // @ts-ignore
            [getBadgeClassDinamico,];
            (p.diasRestantes <= 2 && p.estado !== 'Completado' ? 'CRÍTICO / URGENTE' : (p.estado || 'Pendiente'));
        }
        if (__VLS_ctx.pedidos.length === 0) {
            // @ts-ignore
            [pedidos,];
            __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
            __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
                colspan: "4",
                ...{ class: "text-center muted" },
            });
        }
        if (__VLS_ctx.pedidosFiltradosPorFecha.length > __VLS_ctx.itemsPorPagina) {
            // @ts-ignore
            [pedidosFiltradosPorFecha, itemsPorPagina,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "pagination-controls" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.paginaAnterior) },
                disabled: (__VLS_ctx.paginaActual === 1),
                ...{ class: "btn-nav" },
            });
            // @ts-ignore
            [paginaActual, paginaAnterior,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "page-indicator" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
            (__VLS_ctx.paginaActual);
            // @ts-ignore
            [paginaActual,];
            (Math.ceil(__VLS_ctx.pedidosFiltradosPorFecha.length / __VLS_ctx.itemsPorPagina));
            // @ts-ignore
            [pedidosFiltradosPorFecha, itemsPorPagina,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.paginaSiguiente) },
                disabled: (__VLS_ctx.paginaActual >= Math.ceil(__VLS_ctx.pedidosFiltradosPorFecha.length / __VLS_ctx.itemsPorPagina)),
                ...{ class: "btn-nav" },
            });
            // @ts-ignore
            [paginaActual, pedidosFiltradosPorFecha, itemsPorPagina, paginaSiguiente,];
        }
    }
    if (__VLS_ctx.adminTab === 'ventas') {
        // @ts-ignore
        [adminTab,];
        __VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
            ...{ class: "admin-section" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "box-convertidor-url" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "file-upload-container" },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            for: "file-convertidor",
            ...{ class: "custom-file-upload" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement(__VLS_elements.path, __VLS_elements.path)({
            d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
        });
        __VLS_asFunctionalElement(__VLS_elements.polyline, __VLS_elements.polyline)({
            points: "17 8 12 3 7 8",
        });
        __VLS_asFunctionalElement(__VLS_elements.line, __VLS_elements.line)({
            x1: "12",
            y1: "3",
            x2: "12",
            y2: "15",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.cargandoImagenTool ? 'Procesando archivo...' : 'Seleccionar archivo local');
        // @ts-ignore
        [cargandoImagenTool,];
        __VLS_asFunctionalElement(__VLS_elements.input)({
            ...{ onChange: (__VLS_ctx.generarUrlDesdeArchivo) },
            id: "file-convertidor",
            type: "file",
            accept: "image/*",
            ...{ style: {} },
        });
        // @ts-ignore
        [generarUrlDesdeArchivo,];
        if (__VLS_ctx.urlGeneradaTool) {
            // @ts-ignore
            [urlGeneradaTool,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                type: "text",
                value: (__VLS_ctx.urlGeneradaTool),
                readonly: true,
                ...{ class: "pro-input" },
                ...{ style: {} },
            });
            // @ts-ignore
            [urlGeneradaTool,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.copiarUrlAlPortapapeles) },
                type: "button",
                ...{ class: "btn" },
                ...{ style: {} },
            });
            // @ts-ignore
            [copiarUrlAlPortapapeles,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                src: (__VLS_ctx.urlGeneradaTool),
                alt: "Preview",
                ...{ style: {} },
            });
            // @ts-ignore
            [urlGeneradaTool,];
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "asignacion-masiva-imagenes" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ style: {} },
        });
        if (__VLS_ctx.productosCoincidentesImagenMasiva.length) {
            // @ts-ignore
            [productosCoincidentesImagenMasiva,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ style: {} },
            });
            (__VLS_ctx.productosCoincidentesImagenMasiva.length);
            (__VLS_ctx.productosCoincidentesImagenMasiva.length === 1 ? '' : 's');
            // @ts-ignore
            [productosCoincidentesImagenMasiva, productosCoincidentesImagenMasiva,];
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            value: (__VLS_ctx.asignacionMasivaTexto),
            type: "text",
            ...{ class: "pro-input inline" },
            placeholder: "Ej.: Mc Cal",
        });
        // @ts-ignore
        [asignacionMasivaTexto,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "custom-file-upload" },
            ...{ style: {} },
        });
        (__VLS_ctx.asignacionMasivaArchivo?.name || 'Seleccionar imagen');
        // @ts-ignore
        [asignacionMasivaArchivo,];
        __VLS_asFunctionalElement(__VLS_elements.input)({
            ...{ onChange: (__VLS_ctx.seleccionarImagenMasiva) },
            type: "file",
            accept: "image/*",
            ...{ style: {} },
        });
        // @ts-ignore
        [seleccionarImagenMasiva,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.asignarImagenMasiva) },
            type: "button",
            ...{ class: "btn primary" },
            disabled: (__VLS_ctx.asignandoImagenMasiva || !__VLS_ctx.asignacionMasivaTexto.trim() || !__VLS_ctx.asignacionMasivaArchivo || !__VLS_ctx.productosCoincidentesImagenMasiva.length),
            ...{ style: {} },
        });
        // @ts-ignore
        [productosCoincidentesImagenMasiva, asignacionMasivaTexto, asignacionMasivaArchivo, asignarImagenMasiva, asignandoImagenMasiva,];
        (__VLS_ctx.asignandoImagenMasiva ? 'Aplicando...' : '⚡ Aplicar a todos');
        // @ts-ignore
        [asignandoImagenMasiva,];
        if (__VLS_ctx.asignacionMasivaArchivo) {
            // @ts-ignore
            [asignacionMasivaArchivo,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                src: (__VLS_ctx.asignacionMasivaPreview),
                alt: "Vista previa",
                ...{ style: {} },
            });
            // @ts-ignore
            [asignacionMasivaPreview,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({
                ...{ style: {} },
            });
            (__VLS_ctx.asignacionMasivaArchivo.name);
            // @ts-ignore
            [asignacionMasivaArchivo,];
        }
        if (__VLS_ctx.asignacionMasivaTexto.trim() && __VLS_ctx.productosCoincidentesImagenMasiva.length === 0) {
            // @ts-ignore
            [productosCoincidentesImagenMasiva, asignacionMasivaTexto,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            (__VLS_ctx.asignacionMasivaTexto.trim());
            // @ts-ignore
            [asignacionMasivaTexto,];
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "nuevo-producto-form" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            value: (__VLS_ctx.nuevoProducto.nombre),
            type: "text",
            placeholder: "Nombre del producto",
            ...{ class: "pro-input inline" },
        });
        // @ts-ignore
        [nuevoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.isAdmin))
                        return;
                    if (!(__VLS_ctx.adminTab === 'ventas'))
                        return;
                    __VLS_ctx.nuevoProducto.tieneCodigo = true;
                    // @ts-ignore
                    [nuevoProducto,];
                } },
            type: "button",
            ...{ style: ({ minHeight: '38px', border: '1px solid ' + (__VLS_ctx.nuevoProducto.tieneCodigo ? '#22c55e' : '#475569'), borderRadius: '6px', cursor: 'pointer', background: __VLS_ctx.nuevoProducto.tieneCodigo ? 'rgba(34,197,94,0.16)' : 'rgba(15,23,42,0.35)', color: __VLS_ctx.nuevoProducto.tieneCodigo ? '#86efac' : '#cbd5e1', fontWeight: '700' }) },
        });
        // @ts-ignore
        [nuevoProducto, nuevoProducto, nuevoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.isAdmin))
                        return;
                    if (!(__VLS_ctx.adminTab === 'ventas'))
                        return;
                    __VLS_ctx.nuevoProducto.tieneCodigo = false;
                    __VLS_ctx.nuevoProducto.codigo = '';
                    // @ts-ignore
                    [nuevoProducto, nuevoProducto,];
                } },
            type: "button",
            ...{ style: ({ minHeight: '38px', border: '1px solid ' + (!__VLS_ctx.nuevoProducto.tieneCodigo ? '#ef4444' : '#475569'), borderRadius: '6px', cursor: 'pointer', background: !__VLS_ctx.nuevoProducto.tieneCodigo ? 'rgba(239,68,68,0.16)' : 'rgba(15,23,42,0.35)', color: !__VLS_ctx.nuevoProducto.tieneCodigo ? '#fca5a5' : '#cbd5e1', fontWeight: '700' }) },
        });
        // @ts-ignore
        [nuevoProducto, nuevoProducto, nuevoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            value: (__VLS_ctx.nuevoProducto.codigo),
            type: "text",
            placeholder: "Código (puede contener letras y números)",
            ...{ class: "pro-input inline" },
            ...{ style: {} },
            disabled: (!__VLS_ctx.nuevoProducto.tieneCodigo),
        });
        // @ts-ignore
        [nuevoProducto, nuevoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            value: (__VLS_ctx.nuevoProducto.color),
            type: "text",
            placeholder: "Color (ej. Rojo)",
            ...{ class: "pro-input inline" },
            ...{ style: {} },
        });
        // @ts-ignore
        [nuevoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.input)({
            value: (__VLS_ctx.nuevoProducto.medida),
            type: "text",
            placeholder: "Medida (ej. XL, 40cm)",
            ...{ class: "pro-input inline" },
            ...{ style: {} },
        });
        // @ts-ignore
        [nuevoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
            value: (__VLS_ctx.nuevoProducto.categoria),
            ...{ class: "pro-input inline" },
            ...{ style: {} },
        });
        // @ts-ignore
        [nuevoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
            value: "vinilos",
        });
        __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
            value: "impresiones",
        });
        __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
            value: "pisos",
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            type: "number",
            placeholder: "Stock",
            ...{ class: "pro-input inline" },
            ...{ style: {} },
        });
        (__VLS_ctx.nuevoProducto.stock);
        // @ts-ignore
        [nuevoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            value: (__VLS_ctx.nuevoProducto.imagen),
            type: "text",
            ...{ class: "pro-input" },
            ...{ style: {} },
            placeholder: "Pega la URL de la imagen (https://... o data:image/...)",
        });
        // @ts-ignore
        [nuevoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "custom-file-upload" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            ...{ onChange: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.isAdmin))
                        return;
                    if (!(__VLS_ctx.adminTab === 'ventas'))
                        return;
                    __VLS_ctx.convertirEImagenAUrl($event, __VLS_ctx.nuevoProducto);
                    // @ts-ignore
                    [nuevoProducto, convertirEImagenAUrl,];
                } },
            type: "file",
            accept: "image/*",
            ...{ style: {} },
        });
        if (__VLS_ctx.nuevoProducto.imagen) {
            // @ts-ignore
            [nuevoProducto,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                src: (__VLS_ctx.resolverImagen(__VLS_ctx.nuevoProducto.imagen)),
                ...{ style: {} },
            });
            // @ts-ignore
            [resolverImagen, nuevoProducto,];
        }
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.agregarProductoNuevo) },
            ...{ class: "btn primary btn-block" },
            ...{ style: {} },
            disabled: (__VLS_ctx.creandoProducto),
        });
        // @ts-ignore
        [agregarProductoNuevo, creandoProducto,];
        (__VLS_ctx.creandoProducto ? 'Guardando...' : 'Subir nuevo producto');
        // @ts-ignore
        [creandoProducto,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "catalog-filter-header" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "muted" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        for (const [categoria] of __VLS_getVForSourceType((__VLS_ctx.categoriasCliente))) {
            // @ts-ignore
            [categoriasCliente,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.cambiarCategoriaAdminProductos(categoria.valor);
                        // @ts-ignore
                        [cambiarCategoriaAdminProductos,];
                    } },
                key: (`admin-${categoria.valor}`),
                ...{ class: "btn" },
                ...{ class: (__VLS_ctx.categoriaAdminSeleccionada === categoria.valor ? 'primary' : 'btn-secondary') },
                ...{ style: {} },
            });
            // @ts-ignore
            [categoriaAdminSeleccionada,];
            (categoria.label);
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "admin-products-container" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "admin-product-header" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ style: {} },
        });
        for (const [p] of __VLS_getVForSourceType((__VLS_ctx.productosAdminPaginados))) {
            // @ts-ignore
            [productosAdminPaginados,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (p.id),
                ...{ class: "admin-product-row" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "product-mini-img-wrapper" },
                ...{ style: {} },
                title: "Hacé clic para cambiar la foto desde tu equipo",
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (e => e.target.src = 'https://placehold.co/100x100/333/fff?text=Error') },
                src: (p.imagen ? __VLS_ctx.resolverImagen(p.imagen) : 'https://placehold.co/100x100/333/fff?text=Sin+Foto'),
                loading: "lazy",
                ...{ style: {} },
            });
            // @ts-ignore
            [resolverImagen,];
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.manejarEdicionImagen($event, p);
                        // @ts-ignore
                        [manejarEdicionImagen,];
                    } },
                type: "file",
                accept: "image/*",
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                value: (p.nombre),
                type: "text",
                ...{ class: "pro-input inline" },
                placeholder: "Nombre",
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                type: "checkbox",
            });
            (p.tieneCodigo);
            __VLS_asFunctionalElement(__VLS_elements.input)({
                value: (p.codigo),
                type: "text",
                ...{ class: "pro-input inline" },
                placeholder: "Sin código",
                ...{ style: {} },
                disabled: (!p.tieneCodigo),
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                value: (p.color),
                type: "text",
                ...{ class: "pro-input inline" },
                placeholder: "Color",
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                value: (p.medida),
                type: "text",
                ...{ class: "pro-input inline" },
                placeholder: "Medida",
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                type: "number",
                min: "0",
                ...{ class: "pro-input inline" },
                placeholder: "Stock",
                ...{ style: {} },
            });
            (p.stock);
            __VLS_asFunctionalElement(__VLS_elements.input)({
                value: (p.imagen),
                type: "text",
                ...{ class: "pro-input inline" },
                placeholder: "URL de imagen",
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.updateProduct(p);
                        // @ts-ignore
                        [updateProduct,];
                    } },
                ...{ class: "btn btn-sm btn-save" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.adminTab === 'ventas'))
                            return;
                        __VLS_ctx.eliminarProducto(p.id, p.nombre);
                        // @ts-ignore
                        [eliminarProducto,];
                    } },
                ...{ class: "btn btn-sm btn-logout" },
                ...{ style: {} },
                title: "Eliminar Producto",
            });
        }
        if (__VLS_ctx.productosFiltradosAdmin.length > __VLS_ctx.productosAdminPorPagina) {
            // @ts-ignore
            [productosFiltradosAdmin, productosAdminPorPagina,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "pagination-controls" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.paginaPrimeraAdminProductos) },
                disabled: (__VLS_ctx.paginaActualAdminProductos === 1),
                ...{ class: "btn-nav" },
                title: "Ir a la primera página",
            });
            // @ts-ignore
            [paginaPrimeraAdminProductos, paginaActualAdminProductos,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.paginaAnteriorAdminProductos) },
                disabled: (__VLS_ctx.paginaActualAdminProductos === 1),
                ...{ class: "btn-nav" },
            });
            // @ts-ignore
            [paginaActualAdminProductos, paginaAnteriorAdminProductos,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "page-indicator" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
            (__VLS_ctx.paginaActualAdminProductos);
            // @ts-ignore
            [paginaActualAdminProductos,];
            (__VLS_ctx.totalPaginasAdminProductos);
            // @ts-ignore
            [totalPaginasAdminProductos,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.paginaSiguienteAdminProductos) },
                disabled: (__VLS_ctx.paginaActualAdminProductos === __VLS_ctx.totalPaginasAdminProductos),
                ...{ class: "btn-nav" },
            });
            // @ts-ignore
            [paginaActualAdminProductos, totalPaginasAdminProductos, paginaSiguienteAdminProductos,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.paginaUltimaAdminProductos) },
                disabled: (__VLS_ctx.paginaActualAdminProductos === __VLS_ctx.totalPaginasAdminProductos),
                ...{ class: "btn-nav" },
                title: "Ir a la última página",
            });
            // @ts-ignore
            [paginaActualAdminProductos, totalPaginasAdminProductos, paginaUltimaAdminProductos,];
        }
    }
    if (false) {
        __VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({});
        __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "products-grid" },
            ...{ style: {} },
        });
        for (const [p] of __VLS_getVForSourceType((__VLS_ctx.productosPaginadosCarrito))) {
            // @ts-ignore
            [productosPaginadosCarrito,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (p.id),
                id: (`producto-${p.id}`),
                ...{ class: "product-card" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "product-image-wrapper" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (e => e.target.src = 'https://placehold.co/150x150/333/fff?text=Error') },
                src: (p.imagen ? __VLS_ctx.resolverImagen(p.imagen) : 'https://placehold.co/150x150/333/fff?text=Sin+Imagen'),
                alt: (p.nombre),
                ...{ class: "product-image" },
                loading: "lazy",
                ...{ style: {} },
            });
            // @ts-ignore
            [resolverImagen,];
            if (p.precio > 50000) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "product-tag-overlay" },
                    ...{ style: {} },
                });
            }
            if (p.stock <= 0) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "product-tag-overlay stock-out" },
                    ...{ style: {} },
                });
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "product-body" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "product-info" },
            });
            __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
                ...{ style: {} },
                title: (p.nombre),
            });
            (p.nombre);
            if (p.codigo) {
                __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                    ...{ class: "product-code" },
                    ...{ style: {} },
                });
                (p.codigo);
            }
            if (p.color || p.medida || p.categoria) {
                __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                    ...{ class: "product-specs" },
                    ...{ style: {} },
                });
                if (p.color) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                    (p.color);
                }
                if (p.color && (p.medida || p.categoria)) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                }
                if (p.medida) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                    (p.medida);
                }
                if (p.medida && p.categoria) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                }
                if (p.categoria) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                    (p.categoria);
                }
            }
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "stock-info" },
                ...{ style: {} },
                ...{ style: ({ color: p.stock > 0 ? '#28a745' : '#dc3545' }) },
            });
            (p.stock > 0 ? `Stock: ${p.stock} u.` : 'Agotado');
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "price" },
                ...{ style: {} },
            });
            (__VLS_ctx.formatearPrecio(p.precio));
            // @ts-ignore
            [formatearPrecio,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "product-actions" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "quantity-selector" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(false))
                            return;
                        __VLS_ctx.decrease(p);
                        // @ts-ignore
                        [decrease,];
                    } },
                ...{ class: "qty-btn" },
                disabled: (p.stock <= 0),
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "qty-number" },
                ...{ style: {} },
            });
            (p.qty || 1);
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(false))
                            return;
                        __VLS_ctx.increase(p);
                        // @ts-ignore
                        [increase,];
                    } },
                ...{ class: "qty-btn" },
                disabled: (p.stock <= 0 || (p.qty || 1) >= p.stock),
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "action-buttons-group" },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(false))
                            return;
                        __VLS_ctx.addToCart(p);
                        // @ts-ignore
                        [addToCart,];
                    } },
                ...{ class: "btn btn-secondary btn-add" },
                disabled: (p.stock <= 0),
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        if (!(false))
                            return;
                        __VLS_ctx.abrirModalComprarYa(p);
                        // @ts-ignore
                        [abrirModalComprarYa,];
                    } },
                ...{ class: "btn primary btn-buy-now" },
                disabled: (p.stock <= 0),
                ...{ style: {} },
            });
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "shop-panel" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "panel-header shop-layout-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!!(__VLS_ctx.isAdmin))
                    return;
                __VLS_ctx.isCartOpen = !__VLS_ctx.isCartOpen;
                // @ts-ignore
                [isCartOpen, isCartOpen,];
            } },
        ...{ class: "cart-status-indicator" },
        ...{ class: ({ 'has-items': __VLS_ctx.cart.length > 0 }) },
    });
    // @ts-ignore
    [cart,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "cart-icon" },
    });
    if (__VLS_ctx.cart.length > 0) {
        // @ts-ignore
        [cart,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "cart-badge-count" },
        });
        (__VLS_ctx.cart.length);
        // @ts-ignore
        [cart,];
    }
    if (__VLS_ctx.carouselItems.length) {
        // @ts-ignore
        [carouselItems,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "hero-carousel" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "hero-carousel-viewport" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "hero-carousel-track" },
            ...{ style: ({ transform: `translateX(-${__VLS_ctx.currentSlide * 100}%)` }) },
        });
        // @ts-ignore
        [currentSlide,];
        for (const [slide] of __VLS_getVForSourceType((__VLS_ctx.carouselItems))) {
            // @ts-ignore
            [carouselItems,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (slide.id),
                ...{ class: "hero-carousel-card" },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (e => e.target.src = 'https://placehold.co/600x400/333/fff?text=Error+al+cargar') },
                src: (slide.imagen ? __VLS_ctx.resolverImagen(slide.imagen) : 'https://placehold.co/600x400/333/fff?text=Sin+Imagen'),
                loading: "lazy",
                alt: (slide.titulo || 'Producto destacado'),
            });
            // @ts-ignore
            [resolverImagen,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "hero-carousel-overlay" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
            __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
            (slide.titulo || 'Producto destacado');
            if (slide.producto_id) {
                __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
                (slide.producto_id);
            }
            if (slide.producto_id) {
                __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!!(__VLS_ctx.isAdmin))
                                return;
                            if (!(__VLS_ctx.carouselItems.length))
                                return;
                            if (!(slide.producto_id))
                                return;
                            __VLS_ctx.irAlProducto(slide.producto_id);
                            // @ts-ignore
                            [irAlProducto,];
                        } },
                    ...{ class: "btn primary" },
                });
            }
        }
        if (__VLS_ctx.carouselItems.length > 1) {
            // @ts-ignore
            [carouselItems,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "hero-carousel-controls" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.prevSlide) },
                ...{ class: "hero-carousel-btn" },
            });
            // @ts-ignore
            [prevSlide,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "hero-carousel-dots" },
            });
            for (const [slide, index] of __VLS_getVForSourceType((__VLS_ctx.carouselItems))) {
                // @ts-ignore
                [carouselItems,];
                __VLS_asFunctionalElement(__VLS_elements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!!(__VLS_ctx.isAdmin))
                                return;
                            if (!(__VLS_ctx.carouselItems.length))
                                return;
                            if (!(__VLS_ctx.carouselItems.length > 1))
                                return;
                            __VLS_ctx.currentSlide = index;
                            // @ts-ignore
                            [currentSlide,];
                        } },
                    key: (slide.id),
                    ...{ class: "hero-carousel-dot" },
                    ...{ class: ({ active: index === __VLS_ctx.currentSlide }) },
                });
                // @ts-ignore
                [currentSlide,];
            }
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (__VLS_ctx.nextSlide) },
                ...{ class: "hero-carousel-btn" },
            });
            // @ts-ignore
            [nextSlide,];
        }
    }
    if (!__VLS_ctx.isAdmin) {
        // @ts-ignore
        [isAdmin,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "consulta-rapida-navbar" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "consulta-rapida-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "consulta-rapida-search" },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            ...{ onInput: (__VLS_ctx.limpiarResultadoSiVacio) },
            ...{ onKeyup: (__VLS_ctx.buscarProductoPorCodigo) },
            value: (__VLS_ctx.codigoConsultaRapida),
            type: "text",
            ...{ class: "pro-input" },
            placeholder: "Ingresá el código...",
        });
        // @ts-ignore
        [limpiarResultadoSiVacio, buscarProductoPorCodigo, codigoConsultaRapida,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.buscarProductoPorCodigo) },
            ...{ class: "btn primary" },
        });
        // @ts-ignore
        [buscarProductoPorCodigo,];
        if (__VLS_ctx.productoConsultaRapida) {
            // @ts-ignore
            [productoConsultaRapida,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "consulta-rapida-resultado" },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (__VLS_ctx.manejarErrorImagen) },
                src: (__VLS_ctx.resolverImagen(__VLS_ctx.productoConsultaRapida.imagen)),
                alt: (__VLS_ctx.productoConsultaRapida.nombre),
            });
            // @ts-ignore
            [manejarErrorImagen, resolverImagen, productoConsultaRapida, productoConsultaRapida,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "consulta-rapida-producto" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
            (__VLS_ctx.productoConsultaRapida.nombre);
            // @ts-ignore
            [productoConsultaRapida,];
            __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
            (__VLS_ctx.productoConsultaRapida.codigo);
            // @ts-ignore
            [productoConsultaRapida,];
            if (__VLS_ctx.productoConsultaRapida.color || __VLS_ctx.productoConsultaRapida.medida) {
                // @ts-ignore
                [productoConsultaRapida, productoConsultaRapida,];
                __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
                (__VLS_ctx.productoConsultaRapida.color || '');
                (__VLS_ctx.productoConsultaRapida.color && __VLS_ctx.productoConsultaRapida.medida ? ' · ' : '');
                (__VLS_ctx.productoConsultaRapida.medida || '');
                // @ts-ignore
                [productoConsultaRapida, productoConsultaRapida, productoConsultaRapida, productoConsultaRapida,];
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.isAdmin))
                            return;
                        if (!(!__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.productoConsultaRapida))
                            return;
                        __VLS_ctx.agregarProductoConsultaRapida(__VLS_ctx.productoConsultaRapida);
                        // @ts-ignore
                        [productoConsultaRapida, agregarProductoConsultaRapida,];
                    } },
                ...{ class: "btn btn-secondary" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.isAdmin))
                            return;
                        if (!(!__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.productoConsultaRapida))
                            return;
                        __VLS_ctx.agregarProductoAlCarritoDesdeBusqueda(__VLS_ctx.productoConsultaRapida);
                        // @ts-ignore
                        [productoConsultaRapida, agregarProductoAlCarritoDesdeBusqueda,];
                    } },
                ...{ class: "btn primary" },
            });
        }
        else if (__VLS_ctx.codigoConsultaRapidaBuscado) {
            // @ts-ignore
            [codigoConsultaRapidaBuscado,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "consulta-rapida-no-encontrado" },
            });
            (__VLS_ctx.codigoConsultaRapidaBuscado);
            // @ts-ignore
            [codigoConsultaRapidaBuscado,];
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ style: {} },
    });
    for (const [categoria] of __VLS_getVForSourceType((__VLS_ctx.categoriasCliente))) {
        // @ts-ignore
        [categoriasCliente,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.isAdmin))
                        return;
                    __VLS_ctx.categoriaSeleccionada = categoria.valor;
                    // @ts-ignore
                    [categoriaSeleccionada,];
                } },
            key: (categoria.valor),
            ...{ class: "btn" },
            ...{ class: (__VLS_ctx.categoriaSeleccionada === categoria.valor ? 'primary' : 'btn-secondary') },
            ...{ style: {} },
        });
        // @ts-ignore
        [categoriaSeleccionada,];
        (categoria.label);
    }
    if (__VLS_ctx.productosPaginadosCliente.length) {
        // @ts-ignore
        [productosPaginadosCliente,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "products-grid" },
        });
        for (const [p] of __VLS_getVForSourceType((__VLS_ctx.productosPaginadosCliente))) {
            // @ts-ignore
            [productosPaginadosCliente,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (p.id),
                id: (`producto-${p.id}`),
                ...{ class: "product-card" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "product-image-wrapper" },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (e => e.target.src = 'https://placehold.co/300x300/333/fff?text=Error+al+cargar') },
                src: (p.imagen ? __VLS_ctx.resolverImagen(p.imagen) : 'https://placehold.co/300x300/333/fff?text=Sin+Imagen'),
                alt: (p.nombre),
                ...{ class: "product-image" },
                loading: "lazy",
            });
            // @ts-ignore
            [resolverImagen,];
            if (p.precio > 50000) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "product-tag-overlay" },
                });
            }
            if (p.stock <= 0) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "product-tag-overlay stock-out" },
                    ...{ style: {} },
                });
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "product-body" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "product-info" },
            });
            __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
            (p.nombre);
            if (p.codigo) {
                __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                    ...{ class: "product-code" },
                    ...{ style: {} },
                });
                (p.codigo);
            }
            if (p.color || p.medida || p.categoria) {
                __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                    ...{ class: "product-specs" },
                    ...{ style: {} },
                });
                if (p.color) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                    (p.color);
                }
                if (p.color && (p.medida || p.categoria)) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                }
                if (p.medida) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                    (p.medida);
                }
                if (p.medida && p.categoria) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                }
                if (p.categoria) {
                    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                    (p.categoria);
                }
            }
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "stock-info" },
                ...{ style: {} },
                ...{ style: ({ color: p.stock > 0 ? '#28a745' : '#dc3545' }) },
            });
            (p.stock > 0 ? `Stock disponible: ${p.stock} u.` : 'Agotado');
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "price" },
                ...{ style: {} },
            });
            (__VLS_ctx.formatearPrecio(p.precio));
            // @ts-ignore
            [formatearPrecio,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "product-actions" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "quantity-selector" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.productosPaginadosCliente.length))
                            return;
                        __VLS_ctx.decrease(p);
                        // @ts-ignore
                        [decrease,];
                    } },
                ...{ class: "qty-btn" },
                disabled: (p.stock <= 0),
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "qty-number" },
            });
            (p.qty || 1);
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.productosPaginadosCliente.length))
                            return;
                        __VLS_ctx.increase(p);
                        // @ts-ignore
                        [increase,];
                    } },
                ...{ class: "qty-btn" },
                disabled: (p.stock <= 0 || (p.qty || 1) >= p.stock),
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "action-buttons-group" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.productosPaginadosCliente.length))
                            return;
                        __VLS_ctx.addToCart(p);
                        // @ts-ignore
                        [addToCart,];
                    } },
                ...{ class: "btn btn-secondary btn-add" },
                disabled: (p.stock <= 0),
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.isAdmin))
                            return;
                        if (!(__VLS_ctx.productosPaginadosCliente.length))
                            return;
                        __VLS_ctx.abrirConsultaCliente(p);
                        // @ts-ignore
                        [abrirConsultaCliente,];
                    } },
                type: "button",
                ...{ class: "btn primary btn-buy-now" },
                disabled: (p.stock <= 0),
            });
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "empty-state" },
            ...{ style: {} },
        });
    }
    if (__VLS_ctx.productosFiltradosCliente.length > __VLS_ctx.productosClientePorPagina) {
        // @ts-ignore
        [productosFiltradosCliente, productosClientePorPagina,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "pagination-controls" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.paginaPrimeraClienteProductos) },
            disabled: (__VLS_ctx.paginaActualClienteProductos === 1),
            ...{ class: "btn-nav" },
            title: "Ir a la primera página",
        });
        // @ts-ignore
        [paginaPrimeraClienteProductos, paginaActualClienteProductos,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.paginaAnteriorClienteProductos) },
            disabled: (__VLS_ctx.paginaActualClienteProductos === 1),
            ...{ class: "btn-nav" },
        });
        // @ts-ignore
        [paginaActualClienteProductos, paginaAnteriorClienteProductos,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "page-indicator" },
        });
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.paginaActualClienteProductos);
        // @ts-ignore
        [paginaActualClienteProductos,];
        (__VLS_ctx.totalPaginasClienteProductos);
        // @ts-ignore
        [totalPaginasClienteProductos,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.paginaSiguienteClienteProductos) },
            disabled: (__VLS_ctx.paginaActualClienteProductos === __VLS_ctx.totalPaginasClienteProductos),
            ...{ class: "btn-nav" },
        });
        // @ts-ignore
        [paginaActualClienteProductos, totalPaginasClienteProductos, paginaSiguienteClienteProductos,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.paginaUltimaClienteProductos) },
            disabled: (__VLS_ctx.paginaActualClienteProductos === __VLS_ctx.totalPaginasClienteProductos),
            ...{ class: "btn-nav" },
            title: "Ir a la última página",
        });
        // @ts-ignore
        [paginaActualClienteProductos, totalPaginasClienteProductos, paginaUltimaClienteProductos,];
    }
}
const __VLS_14 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    name: "slide-panel",
}));
const __VLS_16 = __VLS_15({
    name: "slide-panel",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_18 } = __VLS_17.slots;
if (__VLS_ctx.isCartOpen) {
    // @ts-ignore
    [isCartOpen,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        id: "main-shop-cart",
        ...{ class: "side-cart-panel" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "cart-header-wrapper" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "cart-title" },
    });
    (__VLS_ctx.cart.length);
    // @ts-ignore
    [cart,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "cart-header-actions" },
    });
    if (__VLS_ctx.cart.length > 0) {
        // @ts-ignore
        [cart,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.clearCart) },
            ...{ class: "btn-clear-cart" },
        });
        // @ts-ignore
        [clearCart,];
    }
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isCartOpen))
                    return;
                __VLS_ctx.isCartOpen = false;
                // @ts-ignore
                [isCartOpen,];
            } },
        ...{ class: "btn-close-cart" },
    });
    if (__VLS_ctx.cart.length === 0) {
        // @ts-ignore
        [cart,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "cart-empty-state" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "cart-items-list" },
            ...{ style: {} },
        });
        for (const [c] of __VLS_getVForSourceType((__VLS_ctx.cart))) {
            // @ts-ignore
            [cart,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (c.id),
                ...{ class: "cart-item-row-advanced" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "cart-item-details" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "cart-item-name" },
            });
            (c.nombre);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "cart-item-meta" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "cart-item-qty" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
            (c.qty);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "cart-item-actions" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isCartOpen))
                            return;
                        if (!!(__VLS_ctx.cart.length === 0))
                            return;
                        __VLS_ctx.removeOneFromCart(c.id);
                        // @ts-ignore
                        [removeOneFromCart,];
                    } },
                ...{ class: "btn-action-cart min" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isCartOpen))
                            return;
                        if (!!(__VLS_ctx.cart.length === 0))
                            return;
                        __VLS_ctx.removeFromCartCompletely(c.id);
                        // @ts-ignore
                        [removeFromCartCompletely,];
                    } },
                ...{ class: "btn-action-cart del" },
            });
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "cart-deadline-selector" },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            for: "cart-date",
        });
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        __VLS_asFunctionalElement(__VLS_elements.input)({
            type: "date",
            id: "cart-date",
            min: (__VLS_ctx.minFechaPermitida),
            ...{ class: (['pro-input deadline-field', { 'field-invalid': !__VLS_ctx.fechaEntregaRequerida }]) },
        });
        (__VLS_ctx.fechaEntregaRequerida);
        // @ts-ignore
        [minFechaPermitida, fechaEntregaRequerida, fechaEntregaRequerida,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "mini-text field-helper" },
            ...{ style: {} },
        });
        if (!__VLS_ctx.fechaEntregaRequerida) {
            // @ts-ignore
            [fechaEntregaRequerida,];
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "mini-text field-helper" },
                ...{ class: ({ 'text-danger': !__VLS_ctx.fechaEntregaRequerida }) },
            });
            // @ts-ignore
            [fechaEntregaRequerida,];
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "cart-footer" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.executeCheckout) },
            type: "button",
            ...{ class: "btn primary btn-block btn-checkout-execute" },
            disabled: (!__VLS_ctx.fechaEntregaRequerida || __VLS_ctx.cart.length === 0 || __VLS_ctx.procesandoCheckout || __VLS_ctx.redireccionandoWhatsApp),
        });
        // @ts-ignore
        [cart, fechaEntregaRequerida, executeCheckout, procesandoCheckout, redireccionandoWhatsApp,];
        (__VLS_ctx.procesandoCheckout ? 'Confirmando pedido...' : 'Confirmar Registro de Compra');
        // @ts-ignore
        [procesandoCheckout,];
    }
}
var __VLS_17;
const __VLS_19 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    name: "fade",
}));
const __VLS_21 = __VLS_20({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_23 } = __VLS_22.slots;
if (__VLS_ctx.modalComprarYaShow) {
    // @ts-ignore
    [modalComprarYaShow,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.modalComprarYaShow))
                    return;
                __VLS_ctx.modalComprarYaShow = false;
                // @ts-ignore
                [modalComprarYaShow,];
            } },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-card consulta-modal-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "consulta-modal-subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.modalComprarYaShow))
                    return;
                __VLS_ctx.modalComprarYaShow = false;
                // @ts-ignore
                [modalComprarYaShow,];
            } },
        ...{ class: "btn-close" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "consulta-modal-search" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        ...{ onKeyup: (__VLS_ctx.agregarCodigoDesdeModal) },
        value: (__VLS_ctx.codigoConsultaRapida),
        type: "text",
        ...{ class: "pro-input" },
        placeholder: "Código del producto...",
        ...{ style: {} },
    });
    // @ts-ignore
    [codigoConsultaRapida, agregarCodigoDesdeModal,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.agregarCodigoDesdeModal) },
        ...{ class: "btn primary" },
    });
    // @ts-ignore
    [agregarCodigoDesdeModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "consulta-productos-lista" },
    });
    for (const [p] of __VLS_getVForSourceType((__VLS_ctx.modalComprarYaProductos))) {
        // @ts-ignore
        [modalComprarYaProductos,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (p.id),
            ...{ class: "consulta-producto-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.img)({
            ...{ onError: (__VLS_ctx.manejarErrorImagen) },
            src: (__VLS_ctx.resolverImagen(p.imagen)),
            alt: (p.nombre),
        });
        // @ts-ignore
        [manejarErrorImagen, resolverImagen,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "consulta-producto-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (p.nombre || p.producto);
        if (p.codigo) {
            __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
            (p.codigo);
        }
        if (p.color || p.medida) {
            __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
            (p.color || '');
            (p.color && p.medida ? ' · ' : '');
            (p.medida || '');
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "consulta-producto-cantidad" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.modalComprarYaShow))
                        return;
                    __VLS_ctx.disminuirCantidadConsulta(p);
                    // @ts-ignore
                    [disminuirCantidadConsulta,];
                } },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (p.qty || 1);
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.modalComprarYaShow))
                        return;
                    __VLS_ctx.aumentarCantidadConsulta(p);
                    // @ts-ignore
                    [aumentarCantidadConsulta,];
                } },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.modalComprarYaShow))
                        return;
                    __VLS_ctx.eliminarProductoConsulta(p);
                    // @ts-ignore
                    [eliminarProductoConsulta,];
                } },
            ...{ class: "consulta-producto-eliminar" },
        });
    }
    if (!__VLS_ctx.modalComprarYaProductos.length) {
        // @ts-ignore
        [modalComprarYaProductos,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "consulta-vacia" },
        });
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group consulta-fecha-group" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "date",
        min: (__VLS_ctx.minFechaPermitida),
        ...{ class: "pro-input" },
    });
    (__VLS_ctx.modalComprarYaFecha);
    // @ts-ignore
    [minFechaPermitida, modalComprarYaFecha,];
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
        value: (__VLS_ctx.modalComprarYaMensaje),
        rows: "3",
        placeholder: "Ej: ¿Qué demora tienen para entregar? / ¿Hacen envíos?",
        ...{ class: "pro-input" },
        ...{ style: {} },
    });
    // @ts-ignore
    [modalComprarYaMensaje,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-actions" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.modalComprarYaShow))
                    return;
                __VLS_ctx.modalComprarYaShow = false;
                // @ts-ignore
                [modalComprarYaShow,];
            } },
        ...{ class: "btn btn-logout" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.enviarConsultaWhatsApp) },
        ...{ class: "btn btn-whatsapp" },
        disabled: (!__VLS_ctx.modalComprarYaProductos.length),
    });
    // @ts-ignore
    [modalComprarYaProductos, enviarConsultaWhatsApp,];
}
var __VLS_22;
const __VLS_24 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    name: "fade",
}));
const __VLS_26 = __VLS_25({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const { default: __VLS_28 } = __VLS_27.slots;
if (__VLS_ctx.registroVistaPrevia) {
    // @ts-ignore
    [registroVistaPrevia,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.registroVistaPrevia))
                    return;
                __VLS_ctx.registroVistaPrevia = null;
                // @ts-ignore
                [registroVistaPrevia,];
            } },
        ...{ class: "registro-preview-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "registro-preview-modal" },
        key: (__VLS_ctx.registroVistaPrevia?.id ?? 'preview-modal'),
    });
    // @ts-ignore
    [registroVistaPrevia,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "registro-preview-modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "registro-preview-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    (String(__VLS_ctx.registroVistaPrevia.id).padStart(4, '0'));
    // @ts-ignore
    [registroVistaPrevia,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.registroVistaPrevia))
                    return;
                __VLS_ctx.registroVistaPrevia = null;
                // @ts-ignore
                [registroVistaPrevia,];
            } },
        type: "button",
        ...{ class: "btn-close" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "registro-preview-meta" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (__VLS_ctx.registroVistaPrevia.nombre || 'Sin nombre');
    // @ts-ignore
    [registroVistaPrevia,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (__VLS_ctx.formatearFechaRegistro(__VLS_ctx.registroVistaPrevia.fecha_pedido));
    // @ts-ignore
    [registroVistaPrevia, formatearFechaRegistro,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (__VLS_ctx.formatearFechaRegistro(__VLS_ctx.registroVistaPrevia.fecha_entrega));
    // @ts-ignore
    [registroVistaPrevia, formatearFechaRegistro,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "registro-preview-products" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "registro-preview-products-title" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    if (__VLS_ctx.registroVistaPrevia.cargandoDetalle) {
        // @ts-ignore
        [registroVistaPrevia,];
        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
            ...{ class: "registro-preview-loading" },
        });
    }
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.obtenerItemsPreview(__VLS_ctx.registroVistaPrevia).length);
    // @ts-ignore
    [registroVistaPrevia, obtenerItemsPreview,];
    if (__VLS_ctx.obtenerItemsPreview(__VLS_ctx.registroVistaPrevia).length) {
        // @ts-ignore
        [registroVistaPrevia, obtenerItemsPreview,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "registro-preview-product-list" },
        });
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.obtenerItemsPreview(__VLS_ctx.registroVistaPrevia)))) {
            // @ts-ignore
            [registroVistaPrevia, obtenerItemsPreview,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (`${__VLS_ctx.registroVistaPrevia.id}-${item.producto_id || item.id || index}`),
                ...{ class: "registro-preview-product-row" },
            });
            // @ts-ignore
            [registroVistaPrevia,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "registro-preview-number" },
            });
            (index + 1);
            __VLS_asFunctionalElement(__VLS_elements.img)({
                ...{ onError: (__VLS_ctx.manejarErrorImagen) },
                src: (item.imagen ? __VLS_ctx.resolverImagen(item.imagen) : (__VLS_ctx.registroVistaPrevia.imagen ? __VLS_ctx.resolverImagen(__VLS_ctx.registroVistaPrevia.imagen) : 'https://placehold.co/64x64/111827/ffffff?text=Sin+Foto')),
                alt: (item.nombre || 'Producto'),
            });
            // @ts-ignore
            [registroVistaPrevia, registroVistaPrevia, manejarErrorImagen, resolverImagen, resolverImagen,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "registro-preview-product-info" },
            });
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
            (item.nombre || 'Producto');
            if (item.codigo) {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                __VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
                (item.codigo);
            }
            if (item.color || item.medida) {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                (item.color || '');
                (item.color && item.medida ? ' · ' : '');
                (item.medida || '');
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "registro-preview-quantity" },
            });
            __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
            __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
            (Number(item.unidades || item.cantidad || item.qty || 1));
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "registro-preview-empty" },
        });
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "registro-preview-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
    (__VLS_ctx.registroVistaPrevia.estado || 'Pendiente');
    // @ts-ignore
    [registroVistaPrevia,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.b, __VLS_elements.b)({});
    (__VLS_ctx.obtenerItemsPreview(__VLS_ctx.registroVistaPrevia).reduce((s, i) => s + Number(i.unidades || i.cantidad || i.qty || 1), 0));
    // @ts-ignore
    [registroVistaPrevia, obtenerItemsPreview,];
    if (String(__VLS_ctx.registroVistaPrevia.estado || '').toLowerCase() !== 'completado') {
        // @ts-ignore
        [registroVistaPrevia,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.registroVistaPrevia))
                        return;
                    if (!(String(__VLS_ctx.registroVistaPrevia.estado || '').toLowerCase() !== 'completado'))
                        return;
                    __VLS_ctx.marcarPedidoCompletado(__VLS_ctx.registroVistaPrevia);
                    // @ts-ignore
                    [marcarPedidoCompletado, registroVistaPrevia,];
                } },
            type: "button",
            ...{ class: "btn-alert-completar registro-preview-completar" },
            disabled: (__VLS_ctx.registroVistaPrevia.cargandoDetalle),
        });
        // @ts-ignore
        [registroVistaPrevia,];
    }
}
var __VLS_27;
if (!__VLS_ctx.isAdmin) {
    // @ts-ignore
    [isAdmin,];
    __VLS_asFunctionalElement(__VLS_elements.footer, __VLS_elements.footer)({
        ...{ class: "footer" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "footer-row" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "footer-col brand-col" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "footer-highlight" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "footer-desc" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "footer-col social-col" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "social-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "social-icons" },
    });
    __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
        href: "https://www.facebook.com/share/1BDXuPqTHn/",
        target: "_blank",
        'aria-label': "Facebook",
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        ...{ class: "svg-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z",
    });
    __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
        href: "https://www.instagram.com/beta_grafica/?next=%2F",
        target: "_blank",
        'aria-label': "Instagram",
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        ...{ class: "svg-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    });
    __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
        href: "https://www.tiktok.com/@beta.grafica",
        target: "_blank",
        'aria-label': "TikTok",
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        ...{ class: "svg-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.15 2.25 1.93 3.69 2.23v3.74c-1.5-.04-2.99-.48-4.26-1.3-.77-.5-1.44-1.13-1.97-1.87v6.97c-.03 2.1-.81 4.14-2.18 5.62-1.54 1.74-3.8 2.76-6.13 2.8-2.13.06-4.24-.65-5.85-2.01C-.04 18.91-.45 16.2.29 13.91c.64-2.1 2.38-3.77 4.54-4.33.6-.17 1.23-.24 1.85-.24V13c-.92-.01-1.85.28-2.55.88-.73.61-1.14 1.54-1.1 2.48.05 1.05.62 2.03 1.51 2.58.91.58 2.06.66 3.03.22.95-.41 1.65-1.28 1.88-2.29.07-.36.1-.73.09-1.1V0l.01.02z",
    });
}
if (!__VLS_ctx.isAdmin) {
    // @ts-ignore
    [isAdmin,];
    __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
        href: "https://wa.me/5493564652137",
        target: "_blank",
        ...{ class: "whatsapp-floating-btn" },
        'aria-label': "Contactar por WhatsApp",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pulse-ring" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        ...{ class: "whatsapp-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.292 1.493 4.741 1.494 5.428 0 9.847-4.41 9.849-9.836.001-2.628-1.02-5.1-2.877-6.96C16.444 1.98 13.974 1.57 12.008 1.57c-5.43 0-9.85 4.41-9.852 9.837-.001 1.812.487 3.591 1.411 5.17l-.953 3.478 3.533-.925zM17.467 14.3c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z",
    });
}
const __VLS_29 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    name: "whatsapp-redirect-fade",
}));
const __VLS_31 = __VLS_30({
    name: "whatsapp-redirect-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
const { default: __VLS_33 } = __VLS_32.slots;
if (__VLS_ctx.redireccionandoWhatsApp) {
    // @ts-ignore
    [redireccionandoWhatsApp,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "whatsapp-redirect-overlay" },
        role: "status",
        'aria-live': "polite",
        'aria-label': "Redireccionando a WhatsApp",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "whatsapp-redirect-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "whatsapp-redirect-icon" },
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "whatsapp-redirect-spinner" },
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
    (__VLS_ctx.redireccionWhatsAppTipo === 'pedido'
        ? 'Tu pedido fue confirmado correctamente.'
        : 'Tu consulta está lista para enviar.');
    // @ts-ignore
    [redireccionWhatsAppTipo,];
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
}
var __VLS_32;
/** @type {__VLS_StyleScopedClasses['custom-toast']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-accent']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-body']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-title']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-message']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ventas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-is-open']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-views-switcher']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-view-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-view-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-view-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-calendar-view']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-today-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-today-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-title']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-list']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-upcoming-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-view']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-weekdays']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-outside']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-today']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-selected']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-has-tasks']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-day-high']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-number']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-task-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-month-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-week']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day-today']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day-tasks']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-time']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-status']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-empty-day']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-day-add']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-selected-day-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-selected-day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-add-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-selected-day-tasks']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-time']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-status']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-selected-day-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-section']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-list']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-item']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-completed-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-modal-close']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-form']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-priority-select']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-task-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-modal-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-modal-actions-right']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-complete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-sales-view']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-container']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-header']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-list']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-vencimiento-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-main-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['text-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-vence-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['clock-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['days-remaining']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['billing-workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['filtro-clientes-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-clear-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['search-customer-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customers-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-customer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-mini-details']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['email']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-text']} */ ;
/** @type {__VLS_StyleScopedClasses['facturas-carousel-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['facturas-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-factura-card']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-header']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-id']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-fecha']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-body']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-cliente']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-value']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-items']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-item-line']} */ ;
/** @type {__VLS_StyleScopedClasses['item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['item-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-total']} */ ;
/** @type {__VLS_StyleScopedClasses['estado-completado']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-vista-previa']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['factura-empty-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-stats-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-stock-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-header-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-type-switcher']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-type-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-stock-table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-stock-table']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-alert-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-product-name']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-page-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-grid-two-cols']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload-container']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-upload-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-upload-preview-image']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-preview-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-upload-preview-info']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-block']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['beta-slide-edit-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-table']} */ ;
/** @type {__VLS_StyleScopedClasses['row-vencida-urgente']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['page-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['box-convertidor-url']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload-container']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['asignacion-masiva-imagenes']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['nuevo-producto-form']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-block']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-filter-header']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-products-container']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-product-header']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-product-row']} */ ;
/** @type {__VLS_StyleScopedClasses['product-mini-img-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['page-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['products-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tag-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tag-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-out']} */ ;
/** @type {__VLS_StyleScopedClasses['product-body']} */ ;
/** @type {__VLS_StyleScopedClasses['product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['product-code']} */ ;
/** @type {__VLS_StyleScopedClasses['product-specs']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-info']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['product-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['quantity-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-number']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons-group']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-buy-now']} */ ;
/** @type {__VLS_StyleScopedClasses['shop-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['shop-layout-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['has-items']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-badge-count']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-viewport']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-track']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-dots']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-carousel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-info']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-search']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-resultado']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-producto']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-rapida-no-encontrado']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['products-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['product-card']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['product-image']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tag-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tag-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-out']} */ ;
/** @type {__VLS_StyleScopedClasses['product-body']} */ ;
/** @type {__VLS_StyleScopedClasses['product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['product-code']} */ ;
/** @type {__VLS_StyleScopedClasses['product-specs']} */ ;
/** @type {__VLS_StyleScopedClasses['stock-info']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['product-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['quantity-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-number']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons-group']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-buy-now']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['page-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['side-cart-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-header-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-title']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-clear-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-items-list']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-row-advanced']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-details']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['min']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-cart']} */ ;
/** @type {__VLS_StyleScopedClasses['del']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-deadline-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['deadline-field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-invalid']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-text']} */ ;
/** @type {__VLS_StyleScopedClasses['field-helper']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-text']} */ ;
/** @type {__VLS_StyleScopedClasses['field-helper']} */ ;
/** @type {__VLS_StyleScopedClasses['text-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['cart-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-block']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-checkout-execute']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-modal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-modal-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-modal-search']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-productos-lista']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-item']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-info']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-cantidad']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-producto-eliminar']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-vacia']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['consulta-fecha-group']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['pro-input']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-logout']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-whatsapp']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-products']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-products-title']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-list']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-row']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-number']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-quantity']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-alert-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['registro-preview-completar']} */ ;
/** @type {__VLS_StyleScopedClasses['footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-row']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-col']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-col']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-col']} */ ;
/** @type {__VLS_StyleScopedClasses['social-col']} */ ;
/** @type {__VLS_StyleScopedClasses['social-label']} */ ;
/** @type {__VLS_StyleScopedClasses['social-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['svg-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-floating-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-redirect-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-redirect-card']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-redirect-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['whatsapp-redirect-spinner']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        Header: Header,
        urlGeneradaTool: urlGeneradaTool,
        cargandoImagenTool: cargandoImagenTool,
        pedidos: pedidos,
        carouselItems: carouselItems,
        currentSlide: currentSlide,
        nuevoSlide: nuevoSlide,
        slidePreviewUrl: slidePreviewUrl,
        slideEditPreviews: slideEditPreviews,
        cart: cart,
        loading: loading,
        isCartOpen: isCartOpen,
        clienteFiltrado: clienteFiltrado,
        filtroBusquedaClientes: filtroBusquedaClientes,
        paginaActual: paginaActual,
        itemsPorPagina: itemsPorPagina,
        mostrarTodosRegistrosCliente: mostrarTodosRegistrosCliente,
        registroVistaPrevia: registroVistaPrevia,
        adminTab: adminTab,
        modalTareaAdmin: modalTareaAdmin,
        tareaAdminEditando: tareaAdminEditando,
        vistaCalendarioAdmin: vistaCalendarioAdmin,
        diaCalendarioSeleccionado: diaCalendarioSeleccionado,
        formTareaAdmin: formTareaAdmin,
        diasSemanaAdmin: diasSemanaAdmin,
        rangoSemanaAdmin: rangoSemanaAdmin,
        mesCalendarioAdmin: mesCalendarioAdmin,
        diasMesCalendarioAdmin: diasMesCalendarioAdmin,
        tareasDiaCalendarioSeleccionado: tareasDiaCalendarioSeleccionado,
        fechaSeleccionadaCalendarioAdmin: fechaSeleccionadaCalendarioAdmin,
        seleccionarDiaCalendarioAdmin: seleccionarDiaCalendarioAdmin,
        cambiarMesCalendarioAdmin: cambiarMesCalendarioAdmin,
        irAlMesActualAdmin: irAlMesActualAdmin,
        cambiarVistaCalendarioAdmin: cambiarVistaCalendarioAdmin,
        prioridadTareaAdmin: prioridadTareaAdmin,
        tareasPendientesAdmin: tareasPendientesAdmin,
        tareasCompletadasAdmin: tareasCompletadasAdmin,
        tareasProximasAdmin: tareasProximasAdmin,
        tareasPendientesPorDiaAdmin: tareasPendientesPorDiaAdmin,
        estadoTareaAdmin: estadoTareaAdmin,
        formatearFechaTareaAdmin: formatearFechaTareaAdmin,
        abrirCalendarioAdmin: abrirCalendarioAdmin,
        abrirNuevaTareaAdmin: abrirNuevaTareaAdmin,
        abrirEditarTareaAdmin: abrirEditarTareaAdmin,
        cerrarModalTareaAdmin: cerrarModalTareaAdmin,
        guardarTareaAdmin: guardarTareaAdmin,
        completarTareaAdmin: completarTareaAdmin,
        eliminarTareaAdmin: eliminarTareaAdmin,
        cambiarSemanaAdmin: cambiarSemanaAdmin,
        irASemanaActualAdmin: irASemanaActualAdmin,
        clientesFiltradosYOrdenados: clientesFiltradosYOrdenados,
        filtrarPorCliente: filtrarPorCliente,
        limpiarFiltroCliente: limpiarFiltroCliente,
        pedidosFiltradosPorFecha: pedidosFiltradosPorFecha,
        pedidosPaginados: pedidosPaginados,
        verTodosLosRegistrosCliente: verTodosLosRegistrosCliente,
        obtenerItemsPreview: obtenerItemsPreview,
        abrirPreviewRegistro: abrirPreviewRegistro,
        formatearFechaRegistro: formatearFechaRegistro,
        asignacionMasivaTexto: asignacionMasivaTexto,
        asignacionMasivaArchivo: asignacionMasivaArchivo,
        asignacionMasivaPreview: asignacionMasivaPreview,
        asignandoImagenMasiva: asignandoImagenMasiva,
        productosCoincidentesImagenMasiva: productosCoincidentesImagenMasiva,
        seleccionarImagenMasiva: seleccionarImagenMasiva,
        asignarImagenMasiva: asignarImagenMasiva,
        nuevoProducto: nuevoProducto,
        creandoProducto: creandoProducto,
        paginaAnterior: paginaAnterior,
        paginaSiguiente: paginaSiguiente,
        paginaActualAdminProductos: paginaActualAdminProductos,
        productosAdminPorPagina: productosAdminPorPagina,
        categoriaAdminSeleccionada: categoriaAdminSeleccionada,
        productosFiltradosAdmin: productosFiltradosAdmin,
        totalPaginasAdminProductos: totalPaginasAdminProductos,
        productosAdminPaginados: productosAdminPaginados,
        stockCategorias: stockCategorias,
        stockCategoriaSeleccionada: stockCategoriaSeleccionada,
        paginaStockActual: paginaStockActual,
        stockPorPagina: stockPorPagina,
        productosStockCategoria: productosStockCategoria,
        totalPaginasStock: totalPaginasStock,
        productosStockPaginaActual: productosStockPaginaActual,
        paginaStockAnterior: paginaStockAnterior,
        paginaStockSiguiente: paginaStockSiguiente,
        cambiarCategoriaAdminProductos: cambiarCategoriaAdminProductos,
        paginaPrimeraAdminProductos: paginaPrimeraAdminProductos,
        paginaUltimaAdminProductos: paginaUltimaAdminProductos,
        paginaAnteriorAdminProductos: paginaAnteriorAdminProductos,
        paginaSiguienteAdminProductos: paginaSiguienteAdminProductos,
        paginaActualClienteProductos: paginaActualClienteProductos,
        productosClientePorPagina: productosClientePorPagina,
        categoriaSeleccionada: categoriaSeleccionada,
        categoriasCliente: categoriasCliente,
        productosFiltradosCliente: productosFiltradosCliente,
        totalPaginasClienteProductos: totalPaginasClienteProductos,
        productosPaginadosCliente: productosPaginadosCliente,
        productosPaginadosCarrito: productosPaginadosCarrito,
        paginaPrimeraClienteProductos: paginaPrimeraClienteProductos,
        paginaUltimaClienteProductos: paginaUltimaClienteProductos,
        paginaSiguienteClienteProductos: paginaSiguienteClienteProductos,
        paginaAnteriorClienteProductos: paginaAnteriorClienteProductos,
        fechaEntregaRequerida: fechaEntregaRequerida,
        minFechaPermitida: minFechaPermitida,
        codigoConsultaRapida: codigoConsultaRapida,
        codigoConsultaRapidaBuscado: codigoConsultaRapidaBuscado,
        productoConsultaRapida: productoConsultaRapida,
        modalComprarYaShow: modalComprarYaShow,
        modalComprarYaProductos: modalComprarYaProductos,
        modalComprarYaMensaje: modalComprarYaMensaje,
        modalComprarYaFecha: modalComprarYaFecha,
        redireccionandoWhatsApp: redireccionandoWhatsApp,
        redireccionWhatsAppTipo: redireccionWhatsAppTipo,
        buscarProductoPorCodigo: buscarProductoPorCodigo,
        limpiarResultadoSiVacio: limpiarResultadoSiVacio,
        agregarProductoConsultaRapida: agregarProductoConsultaRapida,
        agregarProductoAlCarritoDesdeBusqueda: agregarProductoAlCarritoDesdeBusqueda,
        abrirConsultaCliente: abrirConsultaCliente,
        abrirModalComprarYa: abrirModalComprarYa,
        aumentarCantidadConsulta: aumentarCantidadConsulta,
        disminuirCantidadConsulta: disminuirCantidadConsulta,
        eliminarProductoConsulta: eliminarProductoConsulta,
        agregarCodigoDesdeModal: agregarCodigoDesdeModal,
        enviarConsultaWhatsApp: enviarConsultaWhatsApp,
        notification: notification,
        resolverImagen: resolverImagen,
        manejarErrorImagen: manejarErrorImagen,
        isAdmin: isAdmin,
        pedidosPorVencer: pedidosPorVencer,
        formatearPrecio: formatearPrecio,
        nextSlide: nextSlide,
        prevSlide: prevSlide,
        marcarPedidoCompletado: marcarPedidoCompletado,
        increase: increase,
        decrease: decrease,
        addToCart: addToCart,
        removeOneFromCart: removeOneFromCart,
        removeFromCartCompletely: removeFromCartCompletely,
        clearCart: clearCart,
        procesandoCheckout: procesandoCheckout,
        executeCheckout: executeCheckout,
        generarUrlDesdeArchivo: generarUrlDesdeArchivo,
        copiarUrlAlPortapapeles: copiarUrlAlPortapapeles,
        convertirEImagenAUrl: convertirEImagenAUrl,
        agregarProductoNuevo: agregarProductoNuevo,
        manejarEdicionImagen: manejarEdicionImagen,
        manejarSubidaSlide: manejarSubidaSlide,
        manejarSubidaSlideEdicion: manejarSubidaSlideEdicion,
        agregarSlide: agregarSlide,
        actualizarSlide: actualizarSlide,
        eliminarSlide: eliminarSlide,
        irAlProducto: irAlProducto,
        eliminarProducto: eliminarProducto,
        updateProduct: updateProduct,
        getBadgeClassDinamico: getBadgeClassDinamico,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
