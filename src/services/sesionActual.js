// Usuario logueado, para los services que todavía simulan el back y necesitan saber quién
// hace la request (en el back real eso sale del token). Lo mantiene actualizado el store:
// los services no leen la sesión del storage por su cuenta.
let usuarioActual = null;

export function establecerUsuarioActual(usuario) {
  usuarioActual = usuario ?? null;
}

export function obtenerUsuarioActual() {
  return usuarioActual;
}
