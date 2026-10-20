// Lecturas contra el back real (Spring Boot). El resto de los services sigue con los JSON de
// public/data/ hasta que se conecten el login, el carrito y el panel admin.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

async function apiGet(ruta, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor != null && String(valor).trim() !== '') query.set(clave, String(valor).trim());
  });
  const url = `${API_URL}${ruta}${query.size ? `?${query}` : ''}`;

  let respuesta;
  try {
    respuesta = await fetch(url);
  } catch {
    throw { status: 0, error: 'Sin conexión', mensaje: 'No se pudo conectar con el servidor' };
  }

  if (!respuesta.ok) {
    // El back responde un ErrorResponse { timestamp, status, error, mensaje, path }.
    const cuerpo = await respuesta.json().catch(() => null);
    throw cuerpo ?? {
      status: respuesta.status,
      error: respuesta.statusText,
      mensaje: `No se pudo cargar ${ruta}`,
    };
  }
  return respuesta.json();
}

// GET /api/productos?nombre=&clubId=&categoriaId=&precioMax=
export function listarProductosApi(filtros = {}) {
  const { nombre, clubId, categoriaId, precioMax } = filtros;
  return apiGet('/productos', { nombre, clubId, categoriaId, precioMax });
}

// GET /api/productos/{id}
export function obtenerProductoApi(id) {
  return apiGet(`/productos/${id}`);
}

// GET /api/clubes?pais=
export function listarClubesApi(pais) {
  return apiGet('/clubes', { pais });
}

// GET /api/clubes/{id}
export function obtenerClubApi(id) {
  return apiGet(`/clubes/${id}`);
}

// GET /api/categorias
export function listarCategoriasApi() {
  return apiGet('/categorias');
}
