import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import EstadoBadge from '../components/ordenes/EstadoBadge';
import Alert from '../components/ui/Alert';
import DataTable from '../components/ui/DataTable';
import ErrorMessage from '../components/ui/ErrorMessage';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/useAuth';
import { obtenerOrden } from '../services/ordenesService';
import { formatearFecha, formatearPrecio } from '../utils/formato';
import './OrdenDetallePage.css';

const COLUMNAS = [
  {
    key: 'nombreProducto',
    label: 'Producto',
    render: (item) => <Link to={`/productos/${item.productoId}`}>{item.nombreProducto}</Link>,
  },
  { key: 'precioUnitario', label: 'Precio unitario', render: (item) => formatearPrecio(item.precioUnitario) },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'subtotal', label: 'Subtotal', render: (item) => formatearPrecio(item.subtotal) },
];

export default function OrdenDetallePage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const location = useLocation();
  const recienCreada = location.state?.recienCreada === true;

  const [orden, setOrden] = useState(null);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setOrden(null);
    setError(null);

    obtenerOrden(id, usuario)
      .then((datos) => vigente && setOrden(datos))
      .catch((err) => vigente && setError(err));

    return () => {
      vigente = false;
    };
  }, [id, usuario, intento]);

  let contenido;
  if (error) {
    const reintentable = error.status !== 404 && error.status !== 403;
    contenido = (
      <ErrorMessage error={error} onReintentar={reintentable ? () => setIntento((n) => n + 1) : undefined} />
    );
  } else if (orden === null) {
    contenido = <Spinner texto="Cargando orden..." />;
  } else {
    contenido = (
      <>
        {recienCreada && (
          <Alert tipo="exito" titulo="¡Compra confirmada!">
            Tu orden quedó pendiente de pago. Podés seguirla desde Mis órdenes.
          </Alert>
        )}

        <header className="orden-detalle__encabezado">
          <div>
            <h1>Orden #{orden.id}</h1>
            <p className="orden-detalle__fecha">{formatearFecha(orden.fecha)}</p>
          </div>
          <EstadoBadge estado={orden.estado} />
        </header>

        <DataTable columnas={COLUMNAS} filas={orden.items.map((item) => ({ ...item, id: item.itemId }))} />

        <p className="orden-detalle__total">
          <span>Total</span>
          <strong>{formatearPrecio(orden.total)}</strong>
        </p>
      </>
    );
  }

  return (
    <section className="orden-detalle">
      <Link to="/ordenes" className="orden-detalle__volver">
        ← Mis órdenes
      </Link>
      {contenido}
    </section>
  );
}
