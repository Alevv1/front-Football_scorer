import { obtenerJson, simularError, simularRespuesta } from './http';

// Una sola carga por sesión, igual que productosService: así un usuario registrado puede
// loguearse después y los cambios de "Mi cuenta" se ven en el resto de la app.
// El password solo lo lee este service; ningún método lo devuelve.
let usuarios = null;

// Token simulado -> id del usuario. En el back el token es un JWT con el email adentro.
const sesiones = new Map();

const DURACION_TOKEN_MS = 24 * 60 * 60 * 1000;

function cargarUsuarios() {
  usuarios ??= obtenerJson('usuarios.json').catch((error) => {
    usuarios = null;
    throw error;
  });
  return usuarios;
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

// Mismo formato que UsuarioResponse del back: sin password.
function aUsuarioResponse({ id, nombre, apellido, email, rol }) {
  return { id, nombre, apellido, email, rol };
}

function estaVacio(valor) {
  return valor == null || String(valor).trim() === '';
}

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Replica las anotaciones @NotBlank/@Email/@Size de los DTOs del back y arma el mensaje
// igual que GlobalExceptionHandler: "campo: mensaje, campo: mensaje".
function validar(datos, { conPassword = false, minimoPassword = 0 } = {}) {
  const errores = [];

  if ('nombre' in datos && estaVacio(datos.nombre)) errores.push('nombre: El nombre es obligatorio');
  if ('apellido' in datos && estaVacio(datos.apellido)) errores.push('apellido: El apellido es obligatorio');

  if (estaVacio(datos.email)) errores.push('email: El email es obligatorio');
  else if (!esEmailValido(datos.email)) errores.push('email: El email no es valido');

  if (conPassword) {
    if (estaVacio(datos.password)) errores.push('password: El password es obligatorio');
    else if (datos.password.length < minimoPassword) {
      errores.push(`password: El password debe tener al menos ${minimoPassword} caracteres`);
    }
  }

  return errores.length > 0 ? errores.join(', ') : null;
}

// POST /api/auth/login -> AuthResponse { token, tipo, expiraEn }
export async function login({ email, password } = {}) {
  const path = '/api/auth/login';
  const invalido = validar({ email, password }, { conPassword: true });
  if (invalido) return simularError(errorResponse(400, 'Bad Request', invalido, path));

  const usuario = (await cargarUsuarios()).find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!usuario) {
    return simularError(errorResponse(401, 'Unauthorized', 'Email o password incorrectos', path));
  }

  const token = `token-simulado-${crypto.randomUUID()}`;
  sesiones.set(token, usuario.id);
  return simularRespuesta({ token, tipo: 'Bearer', expiraEn: Date.now() + DURACION_TOKEN_MS });
}

// POST /api/auth/register -> 201 UsuarioResponse. Siempre crea un CLIENTE.
export async function registrar({ nombre, apellido, email, password } = {}) {
  const path = '/api/auth/register';
  const invalido = validar({ nombre, apellido, email, password }, { conPassword: true, minimoPassword: 8 });
  if (invalido) return simularError(errorResponse(400, 'Bad Request', invalido, path));

  const lista = await cargarUsuarios();
  if (lista.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return simularError(errorResponse(409, 'Conflict', `Ya existe un usuario con el email ${email}`, path));
  }

  const nuevo = {
    id: Math.max(0, ...lista.map((u) => u.id)) + 1,
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    email: email.trim(),
    password,
    rol: 'CLIENTE',
  };
  lista.push(nuevo);
  return simularRespuesta(aUsuarioResponse(nuevo));
}

// OJO: este endpoint no existe en el back. AuthResponse solo trae el token, y para guardar la
// sesión (AuthProvider.iniciarSesion) necesitamos el usuario. Hay que acordar con el back un
// GET /api/usuarios/me o que el login devuelva también el usuario.
export async function obtenerUsuarioLogueado(token) {
  const id = sesiones.get(token);
  const usuario = (await cargarUsuarios()).find((u) => u.id === id);
  if (!usuario) {
    return simularError(errorResponse(401, 'Unauthorized', 'Sesión inválida o vencida', '/api/usuarios/me'));
  }
  return simularRespuesta(aUsuarioResponse(usuario));
}

// Igual que UsuarioService.verificarPropietarioOAdmin(): un cliente solo ve y edita su usuario.
function verificarPropietarioOAdmin(usuario, solicitante, path) {
  if (!solicitante) {
    return errorResponse(401, 'Unauthorized', 'Tenés que iniciar sesión', path);
  }
  if (solicitante.rol !== 'ADMIN' && solicitante.id !== usuario.id) {
    return errorResponse(403, 'Forbidden', 'No tenes permiso para acceder a este usuario', path);
  }
  return null;
}

// GET /api/usuarios/{id}. `solicitante` es el usuario de useAuth(), lo que en el back sale del token.
export async function obtenerUsuario(id, solicitante) {
  const path = `/api/usuarios/${id}`;
  const usuario = (await cargarUsuarios()).find((u) => u.id === Number(id));
  if (!usuario) return simularError(errorResponse(404, 'Not Found', `Usuario ${id} no encontrado`, path));

  const sinPermiso = verificarPropietarioOAdmin(usuario, solicitante, path);
  if (sinPermiso) return simularError(sinPermiso);

  return simularRespuesta(aUsuarioResponse(usuario));
}

// PUT /api/usuarios/{id} con ActualizarUsuarioRequest { nombre, apellido, email }
export async function actualizarUsuario(id, { nombre, apellido, email } = {}, solicitante) {
  const path = `/api/usuarios/${id}`;
  const invalido = validar({ nombre, apellido, email });
  if (invalido) return simularError(errorResponse(400, 'Bad Request', invalido, path));

  const lista = await cargarUsuarios();
  const usuario = lista.find((u) => u.id === Number(id));
  if (!usuario) return simularError(errorResponse(404, 'Not Found', `Usuario ${id} no encontrado`, path));

  const sinPermiso = verificarPropietarioOAdmin(usuario, solicitante, path);
  if (sinPermiso) return simularError(sinPermiso);

  usuario.nombre = nombre.trim();
  usuario.apellido = apellido.trim();
  usuario.email = email.trim();
  return simularRespuesta(aUsuarioResponse(usuario));
}
