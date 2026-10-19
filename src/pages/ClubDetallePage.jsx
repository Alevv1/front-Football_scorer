
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductGrid from '../components/productos/ProductGrid';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import { obtenerClub } from '../services/catalogoService';
import { listarProductos } from '../services/productosService';
import './ClubDetallePage.css';

export default function ClubDetallePage() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    setCargando(true);
    setError(null);
    setClub(null);
    setProductos([]);

    Promise.all([
      obtenerClub(id),
      listarProductos({ clubId: id }),
    ])
      .then(([datosClub, listaProductos]) => {
        if (!vigente) return;

        setClub(datosClub);
        setProductos(listaProductos);
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
    return <Spinner texto="Cargando información del club..." />;
  }

  if (error) {
    return (
      <section className="club-detalle">
        <ErrorMessage
          error={error}
          onReintentar={() => setIntento((n) => n + 1)}
        />
      </section>
    );
  }

  return (
    <section className="club-detalle">
      <Link to="/clubes" className="club-detalle__volver">
        ← Volver a clubes
      </Link>

      <header className="club-detalle__encabezado">
        <img
          src={club.escudoUrl}
          alt={`Escudo de ${club.nombre}`}
          className="club-detalle__escudo"
        />

        <div>
          <h1>{club.nombre}</h1>
          <p className="club-detalle__pais">{club.pais}</p>
        </div>
      </header>

      <div className="club-detalle__productos">
        <h2>Productos de {club.nombre}</h2>

        {productos.length === 0 ? (
          <EmptyState
            icono="⚽"
            titulo="No hay productos disponibles"
            mensaje="Este club todavía no tiene productos disponibles."
          />
        ) : (
          <ProductGrid productos={productos} />
        )}
      </div>
    </section>
  );
}
