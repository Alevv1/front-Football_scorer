import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function AdminRoute() {
  const { estaLogueado, esAdmin } = useAuth();
  const location = useLocation();

  if (!estaLogueado) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }
  if (!esAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
