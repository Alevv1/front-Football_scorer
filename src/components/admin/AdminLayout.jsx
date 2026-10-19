import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const SECCIONES = [
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/clubes', label: 'Clubes' },
  { to: '/admin/categorias', label: 'Categorías' },
];

export default function AdminLayout() {
  return (
    <div className="admin">
      <nav className="admin__menu" aria-label="Administración">
        <h2 className="admin__titulo">Administración</h2>
        {SECCIONES.map((seccion) => (
          <NavLink
            key={seccion.to}
            to={seccion.to}
            className={({ isActive }) =>
              `admin__enlace ${isActive ? 'admin__enlace--activo' : ''}`
            }
          >
            {seccion.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin__contenido">
        <Outlet />
      </div>
    </div>
  );
}
