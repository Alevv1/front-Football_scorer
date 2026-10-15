import { obtenerJson } from './http';

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
