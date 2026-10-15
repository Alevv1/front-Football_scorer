import { Link } from 'react-router-dom';
import { formatearPrecio } from '../../utils/formato';
import './ProductCard.css';

const SIN_IMAGEN = '/img/productos/sin-imagen.svg';

function usarImagenDeRespaldo(evento) {
  const imagen = evento.currentTarget;
  if (!imagen.src.endsWith(SIN_IMAGEN)) imagen.src = SIN_IMAGEN;
}

// `accion` es un lugar libre arriba a la derecha de la imagen: ahí va el FavoritoButton
// en el catálogo, o el botón "Quitar" en Favoritos.
export default function ProductCard({ producto, accion }) {
  const sinStock = producto.stock === 0;

  return (
    <article className={`producto-card ${sinStock ? 'producto-card--sin-stock' : ''}`}>
      <Link to={`/productos/${producto.id}`} className="producto-card__enlace">
        <div className="producto-card__imagen">
          <img
            src={producto.imagenUrl || SIN_IMAGEN}
            alt={producto.nombre}
            loading="lazy"
            onError={usarImagenDeRespaldo}
          />
          {sinStock && <span className="producto-card__etiqueta">Sin stock</span>}
        </div>

        <div className="producto-card__cuerpo">
          {producto.club && <p className="producto-card__club">{producto.club.nombre}</p>}
          <h3 className="producto-card__nombre">{producto.nombre}</h3>
          <p className="producto-card__precio">{formatearPrecio(producto.precio)}</p>
        </div>
      </Link>

      {accion && <div className="producto-card__accion">{accion}</div>}
    </article>
  );
}
