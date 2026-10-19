import { useContext } from 'react';
import { CarritoContext } from './carritoContext';

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito se usa dentro de <CarritoProvider>');
  return contexto;
}
