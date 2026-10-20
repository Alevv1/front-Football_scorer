
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerProductoApi } from '../services/apiService';
import FavoritoButton from '../components/productos/FavoritoButton';
import { formatearPrecio } from '../utils/formato';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import AgregarAlCarrito from '../components/productos/AgregarAlCarrito';
import './ProductoDetallePage.css';

const SIN_IMAGEN = '/img/productos/sin-imagen.svg';

export default function ProductoDetallePage() {
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    setCargando(true);
    setError(null);
    setProducto(null);
    setCantidad(1);

    obtenerProductoApi(id)
      .then((datos) => {
        if (vigente) setProducto(datos);
      })
      .catch((err) => {
        if (vigente) setError(err);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [id, intento]);

  if (cargando) {
    return <Spinner texto="Cargando producto..." />;
  }

  if (error) {
    return (
      <section className="producto-detalle">
        <ErrorMessage
          error={error}
          onReintentar={() => setIntento((n) => n + 1)}
        />
      </section>
    );
  }

  if (!producto) return null;

  const sinStock = producto.stock === 0;

  return (
    <section className="producto-detalle">
      <Link to="/" className="producto-detalle__volver">
        ← Volver al catálogo
      </Link>

      <div className="producto-detalle__contenido">
        <div className="producto-detalle__imagen">
          <img
            src={producto.imagenUrl || SIN_IMAGEN}
            alt={producto.nombre}
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(SIN_IMAGEN)) {
                e.currentTarget.src = SIN_IMAGEN;
              }
            }}
          />
        </div>

        <div className="producto-detalle__info">
          {producto.club && (
            <Link
              to={`/clubes/${producto.club.id}`}
              className="producto-detalle__club"
            >
              {producto.club.nombre}
            </Link>
          )}

          <h1>{producto.nombre}</h1>
          <FavoritoButton productoId={producto.id} texto />

          <p className="producto-detalle__precio">
            {formatearPrecio(producto.precio)}
          </p>

          <p className="producto-detalle__descripcion">
            {producto.descripcion}
          </p>

          <p
            className={
              sinStock
                ? 'producto-detalle__stock producto-detalle__stock--agotado'
                : 'producto-detalle__stock'
            }
          >
            {sinStock
              ? 'Sin stock disponible'
              : `Stock disponible: ${producto.stock}`}
          </p>

          <div className="producto-detalle__compra">
            <label htmlFor="cantidad-producto">
              Cantidad
            </label>

            <input
              id="cantidad-producto"
              type="number"
              min="1"
              max={producto.stock}
              step="1"
              value={cantidad}
              disabled={sinStock}
              onChange={(e) => {
                const valor = Number(e.target.value);

                if (Number.isInteger(valor) && valor >= 1) {
                  setCantidad(Math.min(valor, producto.stock));
                }
              }}
            />

            <AgregarAlCarrito
              producto={producto}
              cantidad={cantidad}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
