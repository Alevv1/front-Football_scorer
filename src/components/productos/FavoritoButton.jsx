import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  agregar,
  eliminar,
  listar,
  obtenerRevisionFavoritos,
  suscribirFavoritos,
} from '../../services/favoritosService';
import './FavoritoButton.css';

// Firma reutilizable para cards, detalle de producto y pagina de favoritos.
// La consulta se identifica por usuario, producto y revision para no mostrar
// el corazon de la sesion anterior mientras se cargan los favoritos actuales.
export default function FavoritoButton({ productoId, texto = false, onCambio }) {
  const { estaLogueado, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const revision = useSyncExternalStore(suscribirFavoritos, obtenerRevisionFavoritos);
  const [reintento, setReintento] = useState(0);
  const claveConsulta = estaLogueado
    ? `${usuario?.id ?? usuario?.email}:${Number(productoId)}:${revision}:${reintento}`
    : null;
  const [consulta, setConsulta] = useState({ clave: null, favorito: false, error: null });
  const [pendiente, setPendiente] = useState(false);
  const [errorAccion, setErrorAccion] = useState(null);

  const cargando = claveConsulta !== null && consulta.clave !== claveConsulta;
  const esFavorito = claveConsulta !== null && consulta.clave === claveConsulta && consulta.favorito;
  const error = errorAccion?.clave === claveConsulta
    ? errorAccion.error
    : (consulta.clave === claveConsulta ? consulta.error : null);

  useEffect(() => {
    if (claveConsulta === null) return undefined;
    let vigente = true;
    listar()
      .then((productos) => {
        if (vigente) {
          setConsulta({
            clave: claveConsulta,
            favorito: productos.some((producto) => producto.id === Number(productoId)),
            error: null,
          });
        }
      })
      .catch((err) => {
        if (vigente) setConsulta({ clave: claveConsulta, favorito: false, error: err });
      });
    return () => { vigente = false; };
  }, [claveConsulta, productoId]);

  async function alternar(evento) {
    evento.preventDefault();
    evento.stopPropagation();
    if (!estaLogueado) {
      navigate('/login', { state: { desde: `${location.pathname}${location.search}` } });
      return;
    }
    if (pendiente || cargando || error) return;
    setPendiente(true);
    setErrorAccion(null);
    try {
      if (esFavorito) await eliminar(productoId);
      else await agregar(productoId);
      setConsulta({ clave: claveConsulta, favorito: !esFavorito, error: null });
      onCambio?.(!esFavorito);
    } catch (err) {
      setErrorAccion({ clave: claveConsulta, error: err });
    } finally {
      setPendiente(false);
    }
  }

  const etiqueta = esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos';
  return (
    <span className={`favorito-contenedor ${texto ? 'favorito-contenedor--texto' : ''}`}>
      <button
        type="button"
        className={`favorito-boton ${esFavorito ? 'favorito-boton--activo' : ''} ${texto ? 'favorito-boton--texto' : ''}`}
        onClick={alternar}
        disabled={pendiente || cargando || Boolean(error)}
        aria-label={etiqueta}
        aria-pressed={esFavorito}
        aria-busy={pendiente || cargando}
        title={!estaLogueado ? 'Iniciá sesión para guardar favoritos' : etiqueta}
      >
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill={esFavorito ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
        {texto && <span>{etiqueta}</span>}
      </button>
      {error && (
        <span className="favorito-boton__error" role="alert">
          {error.mensaje ?? 'No se pudo actualizar favoritos'}
          <button
            type="button"
            className="favorito-boton__reintentar"
            onClick={() => { setErrorAccion(null); setReintento((actual) => actual + 1); }}
          >
            Reintentar
          </button>
        </span>
      )}
    </span>
  );
}
