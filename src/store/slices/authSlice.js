import { createSelector, createSlice } from '@reduxjs/toolkit';

// Donde se guardaba la sesión antes de redux-persist. Solo se usa para borrarla.
export const CLAVE_STORAGE_ANTERIOR = 'sesion';

const USUARIOS_SIMULADOS = {
  CLIENTE: { id: 2, nombre: 'Juan', apellido: 'Pérez', email: 'juan@mail.com', rol: 'CLIENTE' },
  ADMIN: { id: 1, nombre: 'Admin', apellido: 'Tienda', email: 'admin@mail.com', rol: 'ADMIN' },
};

// Misma duración que el JWT del back (jwt.expiration-ms).
const DURACION_SESION_SIMULADA_MS = 24 * 60 * 60 * 1000;

// Una sesión sin token, sin usuario o con el token vencido no se usa (ni se recupera al recargar).
export function sesionVigente(sesion, ahora = Date.now()) {
  return Boolean(sesion?.token && sesion.usuario && Number.isFinite(sesion.expiraEn) && sesion.expiraEn > ahora);
}

// La sesión guardada la recupera redux-persist desde sessionStorage (ver store/index.js).
const authSlice = createSlice({
  name: 'auth',
  initialState: { sesion: null },
  reducers: {
    iniciarSesion: {
      reducer(state, action) {
        state.sesion = action.payload;
      },
      // expiraEn viene en el AuthResponse del login: se guarda para no usar un token vencido.
      prepare(authResponse, usuario) {
        const { token, tipo, expiraEn } = authResponse;
        return { payload: { token, tipo, expiraEn, usuario } };
      },
    },
    // Mi cuenta cambió nombre/apellido/email: mismo token, usuario nuevo.
    actualizarUsuarioSesion(state, action) {
      if (state.sesion) state.sesion.usuario = action.payload;
    },
    cerrarSesion(state) {
      state.sesion = null;
    },
    simularSesion: {
      reducer(state, action) {
        state.sesion = action.payload;
      },
      prepare(rol) {
        const sesion = rol
          ? {
              token: 'token-simulado',
              tipo: 'Bearer',
              expiraEn: Date.now() + DURACION_SESION_SIMULADA_MS,
              usuario: USUARIOS_SIMULADOS[rol],
            }
          : null;
        return { payload: sesion };
      },
    },
  },
});

export const { iniciarSesion, actualizarUsuarioSesion, cerrarSesion, simularSesion } = authSlice.actions;

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
