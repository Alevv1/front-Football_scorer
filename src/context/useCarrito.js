import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  actualizarCantidad,
  agregarItem,
  cargarCarrito,
  confirmarCompra,
  eliminarItem,
  seleccionarCantidadTotal,
  seleccionarCarrito,
  vaciar,
} from '../store/slices/carritoSlice';

// Misma API que tenía el CarritoContext, ahora respaldada por el slice `carrito`.
// Las acciones devuelven una promesa que rechaza con el ErrorResponse del service.
export function useCarrito() {
  const dispatch = useDispatch();
  const { carrito, cargando, error } = useSelector(seleccionarCarrito);
  const cantidadTotal = useSelector(seleccionarCantidadTotal);

  return useMemo(
    () => ({
      carrito,
      cantidadTotal,
      cargando,
      error,
      recargar: () => dispatch(cargarCarrito()),
      agregarItem: (productoId, cantidad = 1) =>
        dispatch(agregarItem({ productoId, cantidad })).unwrap(),
      actualizarCantidad: (itemId, cantidad) =>
        dispatch(actualizarCantidad({ itemId, cantidad })).unwrap(),
      eliminarItem: (itemId) => dispatch(eliminarItem(itemId)).unwrap(),
      vaciar: () => dispatch(vaciar()).unwrap(),
      confirmarCompra: async () => (await dispatch(confirmarCompra()).unwrap()).orden,
    }),
    [carrito, cantidadTotal, cargando, error, dispatch],
  );
}
