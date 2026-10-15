import { obtenerJson } from './http';

// Igual que en productosService: una sola carga por sesión, para que las escrituras del admin
// (crearClub, actualizarCategoria, etc., al final de este archivo) se vean en el resto de la app.
let clubes = null;
let categorias = null;

function cargarClubes() {
  clubes ??= obtenerJson('clubes.json').catch((error) => {
    clubes = null;
    throw error;
  });
  return clubes;
}

function cargarCategorias() {
  categorias ??= obtenerJson('categorias.json').catch((error) => {
    categorias = null;
    throw error;
  });
  return categorias;
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

// GET /api/clubes?pais=
export async function listarClubes(pais) {
  const lista = await cargarClubes();
  if (pais == null || pais.trim() === '') return structuredClone(lista);

  const buscado = pais.trim().toLowerCase();
  return structuredClone(lista.filter((club) => club.pais?.toLowerCase() === buscado));
}

// GET /api/clubes/{id}
export async function obtenerClub(id) {
  const club = (await cargarClubes()).find((c) => c.id === Number(id));
  if (!club) throw noEncontrado(`Club ${id} no encontrado`, `/api/clubes/${id}`);
  return structuredClone(club);
}

// GET /api/categorias
export async function listarCategorias() {
  return structuredClone(await cargarCategorias());
}

// GET /api/categorias/{id}
export async function obtenerCategoria(id) {
  const categoria = (await cargarCategorias()).find((c) => c.id === Number(id));
  if (!categoria) throw noEncontrado(`Categoría ${id} no encontrada`, `/api/categorias/${id}`);
  return structuredClone(categoria);
}
