import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FiltrosCatalogo from '../components/productos/FiltrosCatalogo';
import ProductGrid from '../components/productos/ProductGrid';
import FavoritoButton from '../components/productos/FavoritoButton';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import Spinner from '../components/ui/Spinner';
import { useDebounce } from '../hooks/useDebounce';
import { listarCategorias, listarClubes } from '../services/catalogoService';
import { listarProductos } from '../services/productosService';
import './CatalogoPage.css';

const CLAVES_FILTRO = ['nombre', 'clubId', 'categoriaId', 'precioMax'];

function leerFiltros(searchParams) {
  return Object.fromEntries(CLAVES_FILTRO.map((clave) => [clave, searchParams.get(clave) ?? '']));
}

// Los filtros viven en la URL (/?clubId=1&precioMax=50000): se pueden compartir, sobreviven
// a un F5 y tienen los mismos nombres que los query params que va a recibir el back.
export default function CatalogoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtros = leerFiltros(searchParams);
  const consulta = useDebounce(searchParams.toString(), 300);

  const [clubes, setClubes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    // Si fallan, los selects quedan solo con "Todos": el catálogo se puede usar igual.
    listarClubes()
      .then((lista) => vigente && setClubes(lista))
      .catch(() => {});
    listarCategorias()
      .then((lista) => vigente && setCategorias(lista))
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    listarProductos(leerFiltros(new URLSearchParams(consulta)))
      .then((lista) => vigente && setProductos(lista))
      .catch((err) => vigente && setError(err))
      .finally(() => vigente && setCargando(false));

    return () => {
      vigente = false;
    };
  }, [consulta, intento]);

  const cambiarFiltro = (clave, valor) => {
    setSearchParams(
      (actuales) => {
        const nuevos = new URLSearchParams(actuales);
        if (valor === '') nuevos.delete(clave);
        else nuevos.set(clave, valor);
        return nuevos;
      },
      { replace: true },
    );
  };

  const limpiarFiltros = () => setSearchParams({}, { replace: true });

  const hayFiltros = Object.values(filtros).some(Boolean);

  let contenido;
  if (error) {
    contenido = <ErrorMessage error={error} onReintentar={() => setIntento((n) => n + 1)} />;
  } else if (productos === null) {
    contenido = <Spinner texto="Cargando productos..." />;
  } else if (productos.length === 0) {
    contenido = hayFiltros ? (
      <EmptyState
        icono="🔍"
        titulo="No encontramos productos"
        mensaje="Probá con otro nombre, otro club o un precio máximo más alto."
        accion={
          <Button variante="secundario" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        }
      />
    ) : (
      <EmptyState titulo="Todavía no hay productos" mensaje="Volvé a pasar en unos días." />
    );
  } else {
    contenido = <ProductGrid productos={productos} renderAccion={(producto) => <FavoritoButton productoId={producto.id} />} />;
  }

  return (
    <section className="catalogo">
      <header className="catalogo__encabezado">
        <h1>Catálogo</h1>
        {productos && !error && (
          <p className="catalogo__cantidad" aria-live="polite">
            {productos.length === 1 ? '1 producto' : `${productos.length} productos`}
          </p>
        )}
      </header>

      <div className="catalogo__cuerpo">
        <FiltrosCatalogo
          valores={filtros}
          clubes={clubes}
          categorias={categorias}
          onCambiar={cambiarFiltro}
          onLimpiar={limpiarFiltros}
        />

        <div
          className={`catalogo__resultados ${cargando && productos ? 'catalogo__resultados--actualizando' : ''}`}
          aria-busy={cargando}
        >
          {contenido}
        </div>
      </div>
    </section>
  );
}
