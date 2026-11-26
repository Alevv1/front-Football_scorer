import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cerrarSesion, seleccionarSesion } from './slices/authSlice';

// Mayor demora que acepta setTimeout (unos 24 días).
const DEMORA_MAXIMA_MS = 2 ** 31 - 1;

// Cierra la sesión justo cuando vence el token, aunque la pestaña siga abierta: un token
// robado o viejo deja de servir en el front al mismo tiempo que en el back.
export default function CerrarSesionVencida() {
  const dispatch = useDispatch();
  const sesion = useSelector(seleccionarSesion);
  const haySesion = sesion != null;
  const expiraEn = sesion?.expiraEn;

  useEffect(() => {
    if (!haySesion) return undefined;
    const restante = (expiraEn ?? 0) - Date.now();
    if (restante <= 0) {
      dispatch(cerrarSesion());
      return undefined;
    }
    const temporizador = setTimeout(() => dispatch(cerrarSesion()), Math.min(restante, DEMORA_MAXIMA_MS));
    return () => clearTimeout(temporizador);
  }, [haySesion, expiraEn, dispatch]);

  return null;
}
