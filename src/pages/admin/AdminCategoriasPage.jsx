import { useEffect, useMemo, useState } from 'react';
import CategoriaForm from '../../components/admin/CategoriaForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Spinner from '../../components/ui/Spinner';
import { eliminarCategoria, listarCategorias } from '../../services/catalogoService';
import './AdminGestion.css';

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState(null);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    let vigente = true;
    listarCategorias()
      .then((lista) => {
        if (vigente) { setCategorias(lista); setError(null); }
      })
      .catch((err) => { if (vigente) setError(err); });
    return () => { vigente = false; };
  }, [recarga]);

  function abrirFormulario(categoria = null) {
    setCategoriaEditada(categoria);
    setFormularioAbierto(true);
    setError(null);
  }

  function guardar() {
    setFormularioAbierto(false);
    setAviso(categoriaEditada ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.');
    setRecarga((valor) => valor + 1);
  }

  async function confirmarEliminar() {
    if (!porEliminar || eliminando) return;
    setEliminando(true);
    setError(null);
    try {
      await eliminarCategoria(porEliminar.id);
      setAviso(`Se eliminó la categoría «${porEliminar.nombre}».`);
      setRecarga((valor) => valor + 1);
    } catch (err) {
      setError(err);
      setAviso('');
    } finally {
      setEliminando(false);
    }
  }

  const visibles = useMemo(() => {
    const buscado = busqueda.trim().toLocaleLowerCase('es');
    return (categorias ?? []).filter((categoria) =>
      !buscado || `${categoria.nombre} ${categoria.descripcion ?? ''}`.toLocaleLowerCase('es').includes(buscado),
    );
  }, [categorias, busqueda]);

  const columnas = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción', render: (categoria) => categoria.descripcion || '—' },
    {
      key: 'acciones', label: 'Acciones',
      render: (categoria) => (
        <div className="admin-gestion__acciones">
          <Button variante="secundario" tamano="sm" onClick={() => abrirFormulario(categoria)}>Editar</Button>
          <Button variante="peligro" tamano="sm" disabled={eliminando} onClick={() => setPorEliminar(categoria)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  return (
    <section className="admin-gestion">
      <header className="admin-gestion__encabezado">
        <div><h1>Administrar categorías</h1><p>Organizá las categorías de los productos.</p></div>
        <Button onClick={() => abrirFormulario()}>+ Nueva categoría</Button>
      </header>

      {aviso && <Alert tipo="exito" onCerrar={() => setAviso('')}>{aviso}</Alert>}
      {error && categorias !== null && <ErrorMessage error={error} onReintentar={() => setRecarga((valor) => valor + 1)} />}

      <label className="admin-gestion__etiqueta-busqueda" htmlFor="buscar-categorias">Buscar categorías</label>
      <input id="buscar-categorias" type="search" placeholder="Nombre o descripción..." value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} className="admin-gestion__buscador" />

      {categorias === null && error
        ? <ErrorMessage error={error} onReintentar={() => setRecarga((valor) => valor + 1)} />
        : categorias === null
          ? <Spinner texto="Cargando categorías..." />
          : visibles.length === 0
            ? <EmptyState icono="🏷️" titulo={busqueda ? 'No hay categorías que coincidan' : 'No hay categorías'} mensaje={busqueda ? 'Probá con otra búsqueda.' : 'Creá la primera categoría con el botón de arriba.'} />
            : <DataTable columnas={columnas} filas={visibles} />}

      <CategoriaForm
        abierto={formularioAbierto}
        categoria={categoriaEditada}
        onCerrar={() => setFormularioAbierto(false)}
        onGuardado={guardar}
      />
      <ConfirmDialog
        abierto={porEliminar !== null}
        onCerrar={() => setPorEliminar(null)}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar categoría"
        mensaje={`¿Seguro que querés eliminar «${porEliminar?.nombre ?? ''}»? Esta acción no se puede deshacer durante esta sesión.`}
      />
    </section>
  );
}
