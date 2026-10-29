import { configureStore } from '@reduxjs/toolkit';
import authReducer, { CLAVE_STORAGE } from './slices/authSlice';
import carritoReducer from './slices/carritoSlice';
import clubesReducer from './slices/clubesSlice';
import productosReducer from './slices/productosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    carrito: carritoReducer,
    productos: productosReducer,
    clubes: clubesReducer,
  },
});

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
