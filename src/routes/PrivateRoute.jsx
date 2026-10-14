import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function PrivateRoute() {
  const { estaLogueado } = useAuth();
  const location = useLocation();

  if (!estaLogueado) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }
  return <Outlet />;
}
