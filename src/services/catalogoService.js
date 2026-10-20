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

// ---- Escrituras simuladas de ClubController y CategoriaController ----
// Usan los mismos caches que los GET; nada se escribe en public/data/ y F5 restaura el seed.
let siguienteIdClub = null;
let siguienteIdCategoria = null;

function generarId(lista, tipo) {
  // La identidad no se recicla al borrar el último elemento (como IDENTITY en el back).
  if (tipo === 'club') {
    siguienteIdClub ??= Math.max(0, ...lista.map((item) => item.id)) + 1;
    return siguienteIdClub++;
  }
  siguienteIdCategoria ??= Math.max(0, ...lista.map((item) => item.id)) + 1;
  return siguienteIdCategoria++;
}

function errorCatalogo(status, error, mensaje, path) {
  return {
    timestamp: new Date().toISOString().slice(0, 19),
    status,
    error,
    mensaje,
    path,
  };
}

function validarNombre(request, path) {
  if (typeof request?.nombre !== 'string' || request.nombre.trim() === '') {
    throw errorCatalogo(400, 'Bad Request', 'El nombre es obligatorio', path);
  }
  return request.nombre.trim();
}

function comprobarUnico(lista, nombre, id, tipo, path) {
  // En ClubService/CategoriaService se verifica el nombre tal cual, salvo el mismo id.
  if (lista.some((item) => item.nombre === nombre && item.id !== Number(id))) {
    throw errorCatalogo(409, 'Conflict', `Ya existe ${tipo === 'categoría' ? 'una' : 'un'} ${tipo} con el nombre ${nombre}`, path);
  }
}

function buscarEn(lista, id, tipo, ruta) {
  const elemento = lista.find((item) => item.id === Number(id));
  if (!elemento) {
    throw errorCatalogo(404, 'Not Found', `${tipo} ${id} no encontrado`, `${ruta}/${id}`);
  }
  return elemento;
}

// POST /api/clubes — ClubRequest { nombre, pais, escudoUrl } => ClubResponse.
export async function crearClub(request) {
  const lista = await cargarClubes();
  const path = '/api/clubes';
  const nombre = validarNombre(request, path);
  comprobarUnico(lista, nombre, null, 'club', path);
  const nuevo = {
    id: generarId(lista, 'club'),
    nombre,
    pais: request.pais?.trim() ?? null,
    escudoUrl: request.escudoUrl?.trim() ?? null,
  };
  lista.push(nuevo);
  return structuredClone(nuevo);
}

// PUT /api/clubes/{id}.
export async function actualizarClub(id, request) {
  const lista = await cargarClubes();
  const path = `/api/clubes/${id}`;
  const club = buscarEn(lista, id, 'Club', '/api/clubes');
  const nombre = validarNombre(request, path);
  comprobarUnico(lista, nombre, id, 'club', path);
  Object.assign(club, {
    nombre,
    pais: request.pais?.trim() ?? null,
    escudoUrl: request.escudoUrl?.trim() ?? null,
  });
  return structuredClone(club);
}

// DELETE /api/clubes/{id} — respuesta 204 sin cuerpo.
export async function eliminarClub(id) {
  const lista = await cargarClubes();
  const club = buscarEn(lista, id, 'Club', '/api/clubes');
  lista.splice(lista.indexOf(club), 1);
}

// POST /api/categorias — CategoriaRequest { nombre, descripcion } => CategoriaResponse.
export async function crearCategoria(request) {
  const lista = await cargarCategorias();
  const path = '/api/categorias';
  const nombre = validarNombre(request, path);
  comprobarUnico(lista, nombre, null, 'categoría', path);
  const nueva = {
    id: generarId(lista, 'categoria'),
    nombre,
    descripcion: request.descripcion?.trim() ?? null,
  };
  lista.push(nueva);
  return structuredClone(nueva);
}

// PUT /api/categorias/{id}.
export async function actualizarCategoria(id, request) {
  const lista = await cargarCategorias();
  const path = `/api/categorias/${id}`;
  const categoria = buscarEn(lista, id, 'Categoría', '/api/categorias');
  const nombre = validarNombre(request, path);
  comprobarUnico(lista, nombre, id, 'categoría', path);
  Object.assign(categoria, { nombre, descripcion: request.descripcion?.trim() ?? null });
  return structuredClone(categoria);
}

// DELETE /api/categorias/{id} — respuesta 204 sin cuerpo.
export async function eliminarCategoria(id) {
  const lista = await cargarCategorias();
  const categoria = buscarEn(lista, id, 'Categoría', '/api/categorias');
  lista.splice(lista.indexOf(categoria), 1);
}
