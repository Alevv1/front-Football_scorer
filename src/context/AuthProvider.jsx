import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from './authContext';

const CLAVE_STORAGE = 'sesion';

const USUARIOS_SIMULADOS = {
  CLIENTE: { id: 2, nombre: 'Juan', apellido: 'Pérez', email: 'juan@mail.com', rol: 'CLIENTE' },
  ADMIN: { id: 1, nombre: 'Admin', apellido: 'Tienda', email: 'admin@mail.com', rol: 'ADMIN' },
};

function leerSesionGuardada() {
  try {
    const guardada = localStorage.getItem(CLAVE_STORAGE);
    return guardada ? JSON.parse(guardada) : null;
  } catch {
    return null;
  }
}

function guardarSesion(sesion) {
  try {
    if (sesion) localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesion));
    else localStorage.removeItem(CLAVE_STORAGE);
    return true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesionGuardada);

  const actualizarSesion = useCallback((nueva) => {
    guardarSesion(nueva);
    setSesion(nueva);
  }, []);

  const iniciarSesion = useCallback(
    (authResponse, usuario) => {
      actualizarSesion({ token: authResponse.token, tipo: authResponse.tipo, usuario });
    },
    [actualizarSesion],
  );

  const cerrarSesion = useCallback(() => actualizarSesion(null), [actualizarSesion]);

  const simularSesion = useCallback(
    (rol) => {
      if (!rol) return actualizarSesion(null);
      actualizarSesion({ token: 'token-simulado', tipo: 'Bearer', usuario: USUARIOS_SIMULADOS[rol] });
    },
    [actualizarSesion],
  );

  const valor = useMemo(() => {
    const usuario = sesion?.usuario ?? null;
    return {
      usuario,
      token: sesion?.token ?? null,
      rol: usuario?.rol ?? null,
      estaLogueado: usuario != null,
      esAdmin: usuario?.rol === 'ADMIN',
      iniciarSesion,
      cerrarSesion,
      simularSesion,
    };
  }, [sesion, iniciarSesion, cerrarSesion, simularSesion]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
