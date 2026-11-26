import { configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storageLocal from 'redux-persist/lib/storage';
import authReducer, { CLAVE_STORAGE } from './slices/authSlice';
import carritoReducer from './slices/carritoSlice';
import clubesReducer from './slices/clubesSlice';
import preferenciasReducer from './slices/preferenciasSlice';
import productosReducer from './slices/productosSlice';

// Preferencias no sensibles (tema): localStorage, sobreviven a cerrar el navegador.
const preferenciasPersistidas = persistReducer(
  { key: 'preferencias', version: 1, storage: storageLocal },
  preferenciasReducer,
);

export const store = configureStore({
  reducer: {
    auth: authReducer,
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

// La sesión sobrevive a un F5: se persiste cada vez que cambia.
let sesionPrevia = store.getState().auth.sesion;
store.subscribe(() => {
  const sesion = store.getState().auth.sesion;
  if (sesion === sesionPrevia) return;
  sesionPrevia = sesion;
  try {
    if (sesion) localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesion));
    else localStorage.removeItem(CLAVE_STORAGE);
  } catch {
    // Sin storage disponible la sesión dura lo que dure la pestaña.
  }
});
