import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import FiltrosCatalogo from '../components/productos/FiltrosCatalogo';
import ProductGrid from '../components/productos/ProductGrid';
import FavoritoButton from '../components/productos/FavoritoButton';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import Spinner from '../components/ui/Spinner';
import { useDebounce } from '../hooks/useDebounce';
import { listarClubesApi } from '../services/apiService';
import { cargarCategorias, cargarProductos, seleccionarProductos } from '../store/slices/productosSlice';
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

  const dispatch = useDispatch();
  const { lista: productos, categorias, cargando, error } = useSelector(seleccionarProductos);

  const [clubes, setClubes] = useState([]);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    // Si fallan, los selects quedan solo con "Todos": el catálogo se puede usar igual.
    listarClubesApi()
      .then((lista) => vigente && setClubes(lista))
      .catch(() => {});
    dispatch(cargarCategorias());
    return () => {
      vigente = false;
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(cargarProductos(leerFiltros(new URLSearchParams(consulta))));
  }, [consulta, intento, dispatch]);

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
