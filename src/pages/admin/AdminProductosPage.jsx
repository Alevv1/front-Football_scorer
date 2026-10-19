import { useCallback, useEffect, useMemo, useState } from 'react';
import CategoriasProducto from '../../components/admin/CategoriasProducto';
import ProductoForm from '../../components/admin/ProductoForm';
import StockModal from '../../components/admin/StockModal';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useDebounce } from '../../hooks/useDebounce';
import { listarClubes } from '../../services/catalogoService';
import { eliminarProducto, listarProductosAdmin } from '../../services/productosService';
import { formatearPrecio } from '../../utils/formato';
import './AdminProductosPage.css';

// Los productos dados de baja (activo: false) se siguen viendo, en gris.
function gris(producto, contenido) {
  return <span className={producto.activo ? undefined : 'admin-productos__inactivo'}>{contenido}</span>;
}

export default function AdminProductosPage() {
  const [productos, setProductos] = useState(null);
  const [clubes, setClubes] = useState([]);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [intento, setIntento] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const buscado = useDebounce(busqueda).trim().toLowerCase();

  // formulario: false = cerrado, null = producto nuevo, objeto = edición
  const [formulario, setFormulario] = useState(false);
  const [paraStock, setParaStock] = useState(null);
  const [paraCategorias, setParaCategorias] = useState(null);
  const [paraBaja, setParaBaja] = useState(null);

  useEffect(() => {
    let vigente = true;
    Promise.all([listarProductosAdmin(), listarClubes()])
      .then(([lista, clubesLista]) => {
        if (!vigente) return;
        setProductos(lista);
        setClubes(clubesLista);
        setError(null);
      })
      .catch((err) => vigente && setError(err));
    return () => {
      vigente = false;
    };
  }, [intento]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  function guardado(mensaje) {
    setFormulario(false);
    setParaStock(null);
    setAviso(mensaje);
    recargar();
  }

  async function darDeBaja() {
    try {
      await eliminarProducto(paraBaja.id);
      setAviso(`"${paraBaja.nombre}" se dio de baja`);
      recargar();
    } catch (err) {
      setError(err);
    }
  }

  const columnas = [
    { key: 'nombre', label: 'Nombre', render: (p) => gris(p, p.nombre) },
    { key: 'club', label: 'Club', render: (p) => gris(p, p.club?.nombre ?? '') },
    { key: 'precio', label: 'Precio', render: (p) => gris(p, formatearPrecio(p.precio)) },
    { key: 'stock', label: 'Stock', render: (p) => gris(p, p.stock) },
    { key: 'estado', label: 'Estado', render: (p) => gris(p, p.activo ? 'Activo' : 'De baja') },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (p) => (
        <div className="admin-productos__acciones">
          <Button variante="secundario" tamano="sm" onClick={() => setFormulario(p)}>
            Editar
          </Button>
          <Button variante="secundario" tamano="sm" disabled={!p.activo} onClick={() => setParaStock(p)}>
            Stock
          </Button>
          <Button variante="secundario" tamano="sm" disabled={!p.activo} onClick={() => setParaCategorias(p)}>
            Categorías
          </Button>
          <Button variante="peligro" tamano="sm" disabled={!p.activo} onClick={() => setParaBaja(p)}>
            Dar de baja
          </Button>
        </div>
      ),
    },
  ];

  const filas = useMemo(
    () =>
      (productos ?? []).filter(
        (p) => buscado === '' || p.nombre.toLowerCase().includes(buscado),
      ),
    [productos, buscado],
  );

  let contenido;
  if (error && productos === null) {
    contenido = <ErrorMessage error={error} onReintentar={recargar} />;
  } else if (productos === null) {
    contenido = <Spinner texto="Cargando productos..." />;
  } else {
    contenido = <DataTable columnas={columnas} filas={filas} />;
  }

  return (
    <section className="admin-productos">
      <div className="admin-productos__cabecera">
        <h1>Productos</h1>
        <Button onClick={() => setFormulario(null)}>Nuevo producto</Button>
      </div>

      <input
        type="search"
        className="admin-productos__buscador"
        placeholder="Buscar por nombre"
        aria-label="Buscar producto por nombre"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {aviso && (
        <Alert tipo="exito" onCerrar={() => setAviso(null)}>
          {aviso}
        </Alert>
      )}
      {error && productos !== null && <ErrorMessage error={error} />}

      {contenido}

      <ProductoForm
        abierto={formulario !== false}
        onCerrar={() => setFormulario(false)}
        producto={formulario || null}
        clubes={clubes}
        onGuardado={() => guardado(formulario ? 'Producto actualizado' : 'Producto creado')}
      />
      <StockModal
        abierto={paraStock !== null}
        onCerrar={() => setParaStock(null)}
        producto={paraStock}
        onGuardado={() => guardado('Stock actualizado')}
      />
      <Modal
        abierto={paraCategorias !== null}
        onCerrar={() => setParaCategorias(null)}
        titulo={`Categorías · ${paraCategorias?.nombre ?? ''}`}
      >
        {paraCategorias && <CategoriasProducto producto={paraCategorias} />}
      </Modal>
      <ConfirmDialog
        abierto={paraBaja !== null}
        onCerrar={() => setParaBaja(null)}
        onConfirmar={darDeBaja}
        titulo="Dar de baja"
        mensaje={`¿Dar de baja "${paraBaja?.nombre ?? ''}"? Va a dejar de verse en el catálogo.`}
      />
    </section>
  );
}
