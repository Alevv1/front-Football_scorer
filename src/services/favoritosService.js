import { obtenerJson, simularRespuesta } from './http';
import { listarProductos, obtenerProducto } from './productosService';

// Mock de GET/POST/DELETE /api/favoritos. Cada sesión simulada tiene su propia lista
// en memoria; al recargar se reponen los datos de ejemplo de favoritos.json.
// El DTO de GET y POST es ProductoResponse, no una entidad Favorito.
const estados = new Map();
const oyentes = new Set();
let revision = 0;

function notificar() {
  revision += 1;
  oyentes.forEach((oyente) => oyente());
}

export function suscribirFavoritos(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function obtenerRevisionFavoritos() {
  return revision;
}

function errorResponse(status, error, mensaje, path) {
  return {
    timestamp: new Date().toISOString().slice(0, 19),
    status,
    error,
    mensaje,
    path,
  };
}

function usuarioActual() {
  let sesion = null;
  try {
    sesion = JSON.parse(localStorage.getItem('sesion') || 'null');
  } catch {
    // Sesión dañada: se maneja igual que si no se hubiera iniciado sesión.
  }
  const identificador = sesion?.usuario?.id ?? sesion?.usuario?.email;
  if (identificador == null) {
    throw errorResponse(401, 'Unauthorized', 'Tenés que iniciar sesión', '/api/favoritos');
  }
  return String(identificador);
}

function cargarEstado(usuario) {
  if (!estados.has(usuario)) {
    const carga = obtenerJson('favoritos.json')
      .then((productos) => new Map(productos.map((producto) => [producto.id, producto])))
      .catch((error) => {
        estados.delete(usuario);
        throw error;
      });
    estados.set(usuario, carga);
  }
  return estados.get(usuario);
}

// GET /api/favoritos — exclusivamente productos activos, actualizados según el catálogo.
export async function listar() {
  const usuario = usuarioActual();
  const [favoritos, productos] = await Promise.all([cargarEstado(usuario), listarProductos()]);
  const activos = new Map(productos.map((producto) => [producto.id, producto]));
  const visibles = [...favoritos.keys()].map((id) => activos.get(id)).filter(Boolean);
  return structuredClone(visibles);
}

// POST /api/favoritos/{productoId} — 201 ProductoResponse; 404 o 409 cuando corresponda.
export async function agregar(productoId) {
  const usuario = usuarioActual();
  const producto = await obtenerProducto(productoId);
  const favoritos = await cargarEstado(usuario);
  if (favoritos.has(producto.id)) {
    throw errorResponse(
      409, 'Conflict', `El producto ${producto.id} ya está en favoritos`,
      `/api/favoritos/${producto.id}`,
    );
  }
  favoritos.set(producto.id, producto);
  const respuesta = await simularRespuesta(producto);
  notificar();
  return respuesta;
}

// DELETE /api/favoritos/{productoId} — 204 sin cuerpo; 404 si no era favorito.
export async function eliminar(productoId) {
  const usuario = usuarioActual();
  const favoritos = await cargarEstado(usuario);
  if (!favoritos.delete(Number(productoId))) {
    throw errorResponse(
      404, 'Not Found', `El producto ${productoId} no está en favoritos`,
      `/api/favoritos/${productoId}`,
    );
  }
  await simularRespuesta(undefined);
  notificar();
}
