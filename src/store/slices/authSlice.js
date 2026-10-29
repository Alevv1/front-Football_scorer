import { createSelector, createSlice } from '@reduxjs/toolkit';

export const CLAVE_STORAGE = 'sesion';

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

const authSlice = createSlice({
  name: 'auth',
  initialState: { sesion: leerSesionGuardada() },
  reducers: {
    iniciarSesion: {
      reducer(state, action) {
        state.sesion = action.payload;
      },
      prepare(authResponse, usuario) {
        return { payload: { token: authResponse.token, tipo: authResponse.tipo, usuario } };
      },
    },
    cerrarSesion(state) {
      state.sesion = null;
    },
    simularSesion(state, action) {
      const rol = action.payload;
      state.sesion = rol
        ? { token: 'token-simulado', tipo: 'Bearer', usuario: USUARIOS_SIMULADOS[rol] }
        : null;
    },
  },
});

export const { iniciarSesion, cerrarSesion, simularSesion } = authSlice.actions;

export const seleccionarSesion = (state) => state.auth.sesion;
export const seleccionarUsuario = (state) => state.auth.sesion?.usuario ?? null;
export const seleccionarAuth = createSelector(seleccionarSesion, (sesion) => {
  const usuario = sesion?.usuario ?? null;
  return {
    usuario,
    token: sesion?.token ?? null,
    rol: usuario?.rol ?? null,
    estaLogueado: usuario != null,
    esAdmin: usuario?.rol === 'ADMIN',
  };
});

export default authSlice.reducer;
