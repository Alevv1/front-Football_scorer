import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import FavoritoButton from '../components/productos/FavoritoButton';
import ProductGrid from '../components/productos/ProductGrid';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import Spinner from '../components/ui/Spinner';
import { listar, obtenerRevisionFavoritos, suscribirFavoritos } from '../services/favoritosService';
import './FavoritosPage.css';

export default function FavoritosPage() {
  const revision = useSyncExternalStore(suscribirFavoritos, obtenerRevisionFavoritos);
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  const reintentar = useCallback(() => setIntento((valor) => valor + 1), []);

  useEffect(() => {
    let vigente = true;
    listar()
      .then((lista) => {
        if (vigente) { setProductos(lista); setError(null); }
      })
      .catch((err) => { if (vigente) setError(err); });
    return () => { vigente = false; };
  }, [revision, intento]);

  let contenido;
  if (error) {
    contenido = <ErrorMessage error={error} onReintentar={reintentar} />;
  } else if (productos === null) {
    contenido = <Spinner texto="Cargando tus favoritos..." />;
  } else if (productos.length === 0) {
    contenido = (
      <EmptyState
        icono="♡"
        titulo="Todavía no guardaste favoritos"
        mensaje="Explorá el catálogo y tocá el corazón de los productos que te gusten."
        accion={<Link to="/" className="favoritos__ir-catalogo">Explorar catálogo</Link>}
      />
    );
  } else {
    contenido = (
      <ProductGrid
        productos={productos}
        renderAccion={(producto) => <FavoritoButton productoId={producto.id} />}
      />
    );
  }

  return (
    <section className="favoritos">
      <header className="favoritos__cabecera">
        <div>
          <h1>Mis favoritos</h1>
          {productos !== null && !error && <p className="favoritos__cantidad">{productos.length} {productos.length === 1 ? 'producto guardado' : 'productos guardados'}</p>}
        </div>
        <Button variante="secundario" onClick={() => { reintentar(); }}>
          Actualizar
        </Button>
      </header>
      {contenido}
    </section>
  );
}
