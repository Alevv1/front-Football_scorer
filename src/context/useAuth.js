import { useContext } from 'react';
import { AuthContext } from './authContext';

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth se usa dentro de <AuthProvider>');
  return contexto;
}
