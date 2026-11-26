import { configureStore } from '@reduxjs/toolkit';
import {
  createTransform,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import storageLocal from 'redux-persist/lib/storage';
import storageSession from 'redux-persist/lib/storage/session';
import { establecerUsuarioActual } from '../services/sesionActual';
import authReducer, { CLAVE_STORAGE_ANTERIOR, seleccionarUsuario, sesionVigente } from './slices/authSlice';
import carritoReducer from './slices/carritoSlice';
import clubesReducer from './slices/clubesSlice';
import preferenciasReducer from './slices/preferenciasSlice';
import productosReducer from './slices/productosSlice';

// Preferencias no sensibles (tema): localStorage, sobreviven a cerrar el navegador.
const preferenciasPersistidas = persistReducer(
  { key: 'preferencias', version: 1, storage: storageLocal },
  preferenciasReducer,
);

// Sesión (token + datos básicos del usuario): sessionStorage. Sobrevive a un F5 pero se
// borra al cerrar la pestaña, y no la comparten otras pestañas. Ver docs/persistencia-y-seguridad.md.
// Al recuperar la sesión guardada se descarta si el token venció o si fue alterada y le falta
// algo: mejor pedir login de nuevo que usar un token que el back va a rechazar.
const descartarSesionVencida = createTransform(
  (sesion) => sesion,
  (sesion) => (sesionVigente(sesion) ? sesion : null),
  { whitelist: ['sesion'] },
);

const authPersistido = persistReducer(
  {
    key: 'auth',
    version: 1,
    storage: storageSession,
    whitelist: ['sesion'],
    transforms: [descartarSesionVencida],
  },
  authReducer,
);

export const store = configureStore({
  reducer: {
    auth: authPersistido,
    carrito: carritoReducer,
    productos: productosReducer,
    clubes: clubesReducer,
    preferencias: preferenciasPersistidas,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Las acciones internas de redux-persist llevan funciones: no son serializables a propósito.
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);

// Antes la sesión (con el token) se guardaba a mano en localStorage: se borra para que no
// quede un token viejo olvidado ahí.
try {
  localStorage.removeItem(CLAVE_STORAGE_ANTERIOR);
} catch {
  // Sin acceso al storage no hay nada que limpiar.
}

// Los services simulados preguntan "quién está logueado" acá, no al storage.
let usuarioPrevio;
store.subscribe(() => {
  const usuario = seleccionarUsuario(store.getState());
  if (usuario === usuarioPrevio) return;
  usuarioPrevio = usuario;
  establecerUsuarioActual(usuario);
});
