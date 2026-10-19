import { useCallback, useEffect, useMemo, useState } from 'react';
import * as carritoService from '../services/carritoService';
import { crearOrden } from '../services/ordenesService';
import { CarritoContext } from './carritoContext';
import { useAuth } from './useAuth';

export function CarritoProvider({ children }) {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCarrito(null);
    setError(null);
    if (!usuario) return undefined;

    setCargando(true);
    carritoService
      .obtenerCarrito(usuario)
      .then((datos) => vigente && setCarrito(datos))
      .catch((err) => vigente && setError(err))
      .finally(() => vigente && setCargando(false));

    return () => {
      vigente = false;
    };
  }, [usuario, intento]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  const agregarItem = useCallback(
    async (productoId, cantidad = 1) => {
      const actualizado = await carritoService.agregarItem(usuario, { productoId, cantidad });
      setCarrito(actualizado);
      return actualizado;
    },
    [usuario],
  );

  const actualizarCantidad = useCallback(
    async (itemId, cantidad) => {
      const actualizado = await carritoService.actualizarCantidad(usuario, itemId, { cantidad });
      setCarrito(actualizado);
      return actualizado;
    },
    [usuario],
  );

  const eliminarItem = useCallback(
    async (itemId) => {
      await carritoService.eliminarItem(usuario, itemId);
      setCarrito(await carritoService.obtenerCarrito(usuario));
    },
    [usuario],
  );

  const vaciar = useCallback(async () => {
    await carritoService.vaciarCarrito(usuario);
    setCarrito(await carritoService.obtenerCarrito(usuario));
  }, [usuario]);

  const confirmarCompra = useCallback(async () => {
    const orden = await crearOrden(usuario);
    setCarrito(await carritoService.obtenerCarrito(usuario));
    return orden;
  }, [usuario]);

  const valor = useMemo(
    () => ({
      carrito,
      cantidadTotal: carrito?.items.reduce((suma, item) => suma + item.cantidad, 0) ?? 0,
      cargando,
      error,
      recargar,
      agregarItem,
      actualizarCantidad,
      eliminarItem,
      vaciar,
      confirmarCompra,
    }),
    [carrito, cargando, error, recargar, agregarItem, actualizarCantidad, eliminarItem, vaciar, confirmarCompra],
  );

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}
