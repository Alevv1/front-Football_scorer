import { Link } from 'react-router-dom';
import { formatearPrecio } from '../../utils/formato';
import './CarritoItem.css';

export default function CarritoItem({ item, ocupado = false, onCambiarCantidad, onEliminar }) {
  return (
    <li className="carrito-item">
      <div className="carrito-item__datos">
        <Link to={`/productos/${item.productoId}`} className="carrito-item__nombre">
          {item.nombreProducto}
        </Link>
        <span className="carrito-item__precio">{formatearPrecio(item.precioUnitario)} c/u</span>
      </div>

      <div className="carrito-item__cantidad" aria-label={`Cantidad de ${item.nombreProducto}`}>
        <button
          type="button"
          onClick={() => onCambiarCantidad(item.cantidad - 1)}
          disabled={ocupado || item.cantidad <= 1}
          aria-label="Restar uno"
        >
          −
        </button>
        <span aria-live="polite">{item.cantidad}</span>
        <button
          type="button"
          onClick={() => onCambiarCantidad(item.cantidad + 1)}
          disabled={ocupado}
          aria-label="Sumar uno"
        >
          +
        </button>
      </div>

      <strong className="carrito-item__subtotal">{formatearPrecio(item.subtotal)}</strong>

      <button
        type="button"
        className="carrito-item__eliminar"
        onClick={onEliminar}
        disabled={ocupado}
        aria-label={`Eliminar ${item.nombreProducto}`}
      >
        Eliminar
      </button>
    </li>
  );
}
