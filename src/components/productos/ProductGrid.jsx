import ProductCard from './ProductCard';
import './ProductGrid.css';

// `renderAccion(producto)` es opcional: devuelve lo que va en el lugar de acción de cada card.
export default function ProductGrid({ productos, renderAccion }) {
  return (
    <ul className="producto-grid">
      {productos.map((producto) => (
        <li key={producto.id}>
          <ProductCard producto={producto} accion={renderAccion?.(producto)} />
        </li>
      ))}
    </ul>
  );
}
