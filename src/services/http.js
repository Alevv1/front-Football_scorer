const BASE = '/data';
const DEMORA_MS = 300;

export async function obtenerJson(archivo) {
  let respuesta;
  try {
    respuesta = await fetch(`${BASE}/${archivo}`);
  } catch {
    throw { status: 0, error: 'Sin conexión', mensaje: 'No se pudo conectar con el servidor' };
  }

  if (!respuesta.ok) {
    throw {
      status: respuesta.status,
      error: respuesta.statusText,
      mensaje: `No se pudo cargar ${archivo}`,
    };
  }
  return respuesta.json();
}

export function simularRespuesta(datos, demoraMs = DEMORA_MS) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(datos === undefined ? undefined : structuredClone(datos)), demoraMs);
  });
}

export function simularError(errorResponse, demoraMs = DEMORA_MS) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(errorResponse), demoraMs);
  });
}
