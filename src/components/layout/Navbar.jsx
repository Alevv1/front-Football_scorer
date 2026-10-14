import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { IconoCarrito, IconoCerrar, IconoCorazon, IconoMenu } from './Iconos';
import './Navbar.css';

const claseLink = ({ isActive }) => `navbar__link ${isActive ? 'navbar__link--activo' : ''}`;

export default function Navbar() {
  const { usuario, estaLogueado, esAdmin, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  const salir = () => {
    cerrarSesion();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="contenedor navbar__barra">
        <Link to="/" className="navbar__marca">
          <span aria-hidden="true">⚽</span> Football Scorer
        </Link>

        <div className="navbar__iconos">
          {estaLogueado && (
            <NavLink to="/favoritos" className={claseLink} aria-label="Favoritos">
              <IconoCorazon />
            </NavLink>
          )}
          <NavLink to="/carrito" className={claseLink} aria-label="Carrito">
            <IconoCarrito />
          </NavLink>
          <button
            type="button"
            className="navbar__hamburguesa"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-expanded={menuAbierto}
            aria-controls="navbar-menu"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuAbierto ? <IconoCerrar /> : <IconoMenu />}
          </button>
        </div>

        <nav id="navbar-menu" className={`navbar__menu ${menuAbierto ? 'navbar__menu--abierto' : ''}`}>
          <ul className="navbar__lista">
            <li>
              <NavLink to="/" end className={claseLink}>
                Catálogo
              </NavLink>
            </li>
            <li>
              <NavLink to="/clubes" className={claseLink}>
                Clubes
              </NavLink>
            </li>
            {estaLogueado && (
              <li>
                <NavLink to="/ordenes" className={claseLink}>
                  Mis órdenes
                </NavLink>
              </li>
            )}
            {esAdmin && (
              <li>
                <NavLink to="/admin/productos" className={claseLink}>
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar__lista navbar__lista--cuenta">
            {estaLogueado ? (
              <>
                <li>
                  <NavLink to="/cuenta" className={claseLink}>
                    Hola, {usuario.nombre}
                  </NavLink>
                </li>
                <li>
                  <button type="button" className="navbar__link navbar__salir" onClick={salir}>
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login" className={claseLink}>
                    Ingresar
                  </NavLink>
                </li>
                <li>
                  <Link to="/registro" className="navbar__link navbar__link--destacado">
                    Crear cuenta
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
