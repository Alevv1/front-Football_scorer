import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cargarCarrito } from './slices/carritoSlice';
import { seleccionarUsuario } from './slices/authSlice';

// Carga el carrito cada vez que cambia el usuario logueado (el logout lo limpia el slice).
export default function SincronizarCarrito() {
  const dispatch = useDispatch();
  const usuario = useSelector(seleccionarUsuario);

  useEffect(() => {
    if (usuario) dispatch(cargarCarrito());
  }, [usuario, dispatch]);

  return null;
}
