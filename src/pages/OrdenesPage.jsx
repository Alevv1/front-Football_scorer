import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EstadoBadge from '../components/ordenes/EstadoBadge';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/useAuth';
import { listarMisOrdenes } from '../services/ordenesService';
import { formatearFecha, formatearPrecio } from '../utils/formato';
import './OrdenesPage.css';

const COLUMNAS = [
  { key: 'id', label: 'Orden', render: (orden) => `#${orden.id}` },
  { key: 'fecha', label: 'Fecha', render: (orden) => formatearFecha(orden.fecha) },
  { key: 'estado', label: 'Estado', render: (orden) => <EstadoBadge estado={orden.estado} /> },
  {
    key: 'productos',
    label: 'Productos',
    render: (orden) => orden.items.reduce((suma, item) => suma + item.cantidad, 0),
  },
  { key: 'total', label: 'Total', render: (orden) => formatearPrecio(orden.total) },
  {
    key: 'detalle',
    label: 'Detalle',
    render: (orden) => (
      <Link to={`/ordenes/${orden.id}`} className="ordenes__ver">
        Ver detalle
      </Link>
    ),
  },
];

export default function OrdenesPage() {
  const { usuario } = useAuth();
  const [ordenes, setOrdenes] = useState(null);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setOrdenes(null);
    setError(null);

    listarMisOrdenes(usuario)
      .then((lista) => vigente && setOrdenes(lista))
      .catch((err) => vigente && setError(err));

    return () => {
      vigente = false;
    };
  }, [usuario, intento]);

  let contenido;
  if (error) {
    contenido = <ErrorMessage error={error} onReintentar={() => setIntento((n) => n + 1)} />;
  } else if (ordenes === null) {
    contenido = <Spinner texto="Cargando órdenes..." />;
  } else if (ordenes.length === 0) {
    contenido = (
      <EmptyState
        icono="📦"
        titulo="Todavía no hiciste compras"
        mensaje="Cuando confirmes una compra desde el carrito, la vas a ver acá."
        accion={<Link to="/">Ver catálogo</Link>}
      />
    );
  } else {
    contenido = <DataTable columnas={COLUMNAS} filas={ordenes} />;
  }

  return (
    <section className="ordenes">
      <h1>Mis órdenes</h1>
      {contenido}
    </section>
  );
}
