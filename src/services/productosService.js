import { obtenerJson } from './http';
import { listarClubes } from './catalogoService';

// Se carga una sola vez por sesión: así las escrituras del admin (que se agregan al final de
// este archivo) modifican la misma lista que después leen el catálogo y el detalle.
let productos = null;
let productosCategorias = null;

function cargarProductos() {
  productos ??= obtenerJson('productos.json').catch((error) => {
    productos = null;
    throw error;
  });
  return productos;
}

// Simula la tabla productos_categorias del back. ProductoResponse no trae las categorías,
// así que este archivo solo lo lee el service para resolver ?categoriaId=, nunca un componente.
function cargarProductosCategorias() {
  productosCategorias ??= obtenerJson('productos-categorias.json').catch((error) => {
    productosCategorias = null;
    throw error;
  });
  return productosCategorias;
}

function noEncontrado(mensaje, path) {
  return {
    timestamp: new Date().toISOString().slice(0, 19),
    status: 404,
    error: 'Not Found',
    mensaje,
    path,
  };
}

function tieneValor(valor) {
  return valor != null && String(valor).trim() !== '';
}

// Mismas reglas que ProductoRepository.buscar(): solo activos, nombre "contiene" sin
// distinguir mayúsculas y precio menor o igual.
// En la 4ª entrega esto se reemplaza por GET /api/productos?nombre=&clubId=&categoriaId=&precioMax=
export async function listarProductos(filtros = {}) {
  const { nombre, clubId, categoriaId, precioMax } = filtros;
  let resultado = (await cargarProductos()).filter((producto) => producto.activo);

  if (tieneValor(nombre)) {
    const buscado = nombre.trim().toLowerCase();
    resultado = resultado.filter((producto) => producto.nombre.toLowerCase().includes(buscado));
  }
  if (tieneValor(clubId)) {
    resultado = resultado.filter((producto) => producto.club?.id === Number(clubId));
  }
  if (tieneValor(categoriaId)) {
    const asociaciones = await cargarProductosCategorias();
    const ids = new Set(
      asociaciones
        .filter((asociacion) => asociacion.categoriaId === Number(categoriaId))
        .map((asociacion) => asociacion.productoId),
    );
    resultado = resultado.filter((producto) => ids.has(producto.id));
  }
  if (tieneValor(precioMax)) {
    resultado = resultado.filter((producto) => producto.precio <= Number(precioMax));
  }

  return structuredClone(resultado);
}

// Igual que el back, un producto dado de baja (activo: false) responde 404.
export async function obtenerProducto(id) {
  const producto = (await cargarProductos()).find((p) => p.id === Number(id) && p.activo);
  if (!producto) {
    throw noEncontrado(`Producto ${id} no encontrado`, `/api/productos/${id}`);
  }
  return structuredClone(producto);
}

export async function descontarStock(id, cantidad) {
  const producto = (await cargarProductos()).find((p) => p.id === Number(id) && p.activo);
  if (!producto) {
    throw noEncontrado(`Producto ${id} no encontrado`, `/api/productos/${id}`);
  }
  if (cantidad > producto.stock) {
    throw {
      timestamp: new Date().toISOString().slice(0, 19),
      status: 400,
      error: 'Bad Request',
      mensaje: `Stock insuficiente para ${producto.nombre}: disponible ${producto.stock}, pedido ${cantidad}`,
      path: '/api/ordenes',
    };
  }
  producto.stock -= cantidad;
}

// ---- Escrituras del panel admin (simulan POST/PUT/DELETE/PATCH de ProductoController) ----

function datosInvalidos(mensaje, path) {
  return {
    timestamp: new Date().toISOString().slice(0, 19),
    status: 400,
    error: 'Bad Request',
    mensaje,
    path,
  };
}

async function buscarProducto(id) {
  const producto = (await cargarProductos()).find((p) => p.id === Number(id));
  if (!producto) {
    throw noEncontrado(`Producto ${id} no encontrado`, `/api/productos/${id}`);
  }
  return producto;
}

// Mismas reglas que ProductoRequest: nombre obligatorio, precio > 0, stock >= 0, club obligatorio.
async function armarDatos(request, path) {
  const { nombre, descripcion, precio, stock, imagenUrl, clubId } = request;
  if (!tieneValor(nombre)) throw datosInvalidos('El nombre es obligatorio', path);
  if (!(Number(precio) > 0)) throw datosInvalidos('El precio debe ser mayor a 0', path);
  if (!(Number(stock) >= 0)) throw datosInvalidos('El stock no puede ser negativo', path);

  const club = (await listarClubes()).find((c) => c.id === Number(clubId));
  if (!club) throw noEncontrado(`Club ${clubId} no encontrado`, path);

  return {
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() ?? '',
    precio: Number(precio),
    stock: Number(stock),
    imagenUrl: imagenUrl?.trim() ?? '',
    club: structuredClone(club),
  };
}

// A diferencia de listarProductos, incluye los dados de baja (activo: false).
export async function listarProductosAdmin() {
  return structuredClone(await cargarProductos());
}

// POST /api/productos
export async function crearProducto(request) {
  const lista = await cargarProductos();
  const datos = await armarDatos(request, '/api/productos');
  const nuevo = { id: Math.max(0, ...lista.map((p) => p.id)) + 1, ...datos, activo: true };
  lista.push(nuevo);
  return structuredClone(nuevo);
}

// PUT /api/productos/{id}
export async function actualizarProducto(id, request) {
  const producto = await buscarProducto(id);
  Object.assign(producto, await armarDatos(request, `/api/productos/${id}`));
  return structuredClone(producto);
}

// DELETE /api/productos/{id}: baja lógica, el producto queda con activo: false.
export async function eliminarProducto(id) {
  (await buscarProducto(id)).activo = false;
}

// PATCH /api/productos/{id}/stock
export async function actualizarStock(id, stock) {
  const producto = await buscarProducto(id);
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    throw datosInvalidos('El stock no puede ser negativo', `/api/productos/${id}/stock`);
  }
  producto.stock = Number(stock);
  return structuredClone(producto);
}

// Ids de las categorías del producto (para marcar los checkboxes del panel admin).
export async function listarCategoriaIdsDeProducto(id) {
  const asociaciones = await cargarProductosCategorias();
  return asociaciones
    .filter((asociacion) => asociacion.productoId === Number(id))
    .map((asociacion) => asociacion.categoriaId);
}

// POST /api/productos/{id}/categorias/{categoriaId}
export async function asociarCategoria(id, categoriaId) {
  await buscarProducto(id);
  const asociaciones = await cargarProductosCategorias();
  const existe = asociaciones.some(
    (a) => a.productoId === Number(id) && a.categoriaId === Number(categoriaId),
  );
  if (!existe) asociaciones.push({ productoId: Number(id), categoriaId: Number(categoriaId) });
}

// DELETE /api/productos/{id}/categorias/{categoriaId}
export async function desasociarCategoria(id, categoriaId) {
  await buscarProducto(id);
  const asociaciones = await cargarProductosCategorias();
  const indice = asociaciones.findIndex(
    (a) => a.productoId === Number(id) && a.categoriaId === Number(categoriaId),
  );
  if (indice !== -1) asociaciones.splice(indice, 1);
}
