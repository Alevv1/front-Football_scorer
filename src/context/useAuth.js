import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  actualizarUsuarioSesion,
  cerrarSesion,
  iniciarSesion,
  seleccionarAuth,
  simularSesion,
} from '../store/slices/authSlice';

// Misma API que tenía el AuthContext, ahora respaldada por el slice `auth`.
export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector(seleccionarAuth);

  return useMemo(
    () => ({
      ...auth,
      iniciarSesion: (authResponse, usuario) => dispatch(iniciarSesion(authResponse, usuario)),
      actualizarUsuarioSesion: (usuario) => dispatch(actualizarUsuarioSesion(usuario)),
      cerrarSesion: () => dispatch(cerrarSesion()),
      simularSesion: (rol) => dispatch(simularSesion(rol)),
    }),
    [auth, dispatch],
  );
}
