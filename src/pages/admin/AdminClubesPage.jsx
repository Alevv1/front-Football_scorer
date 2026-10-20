import { useEffect, useMemo, useState } from 'react';
import ClubForm from '../../components/admin/ClubForm';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Spinner from '../../components/ui/Spinner';
import { eliminarClub, listarClubes } from '../../services/catalogoService';
import './AdminGestion.css';

export default function AdminClubesPage() {
  const [clubes, setClubes] = useState(null);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [clubEditado, setClubEditado] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    let vigente = true;
    listarClubes()
      .then((lista) => {
        if (vigente) { setClubes(lista); setError(null); }
      })
      .catch((err) => { if (vigente) setError(err); });
    return () => { vigente = false; };
  }, [recarga]);

  function abrirFormulario(club = null) {
    setClubEditado(club);
    setFormularioAbierto(true);
    setError(null);
  }

  function guardar() {
    setFormularioAbierto(false);
    setAviso(clubEditado ? 'Club actualizado correctamente.' : 'Club creado correctamente.');
    setRecarga((valor) => valor + 1);
  }

  async function confirmarEliminar() {
    if (!porEliminar || eliminando) return;
    setEliminando(true);
    setError(null);
    try {
      await eliminarClub(porEliminar.id);
      setAviso(`Se eliminó el club «${porEliminar.nombre}».`);
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
    return (clubes ?? []).filter((club) =>
      !buscado || `${club.nombre} ${club.pais ?? ''}`.toLocaleLowerCase('es').includes(buscado),
    );
  }, [clubes, busqueda]);

  const columnas = [
    { key: 'id', label: 'ID' },
    {
      key: 'escudoUrl', label: 'Escudo',
      render: (club) => club.escudoUrl
        ? <img className="admin-gestion__escudo" src={club.escudoUrl} alt={`Escudo de ${club.nombre}`} loading="lazy" />
        : <span className="admin-gestion__sin-imagen">Sin escudo</span>,
    },
    { key: 'nombre', label: 'Nombre' },
    { key: 'pais', label: 'País', render: (club) => club.pais || '—' },
    {
      key: 'acciones', label: 'Acciones',
      render: (club) => (
        <div className="admin-gestion__acciones">
          <Button variante="secundario" tamano="sm" onClick={() => abrirFormulario(club)}>Editar</Button>
          <Button variante="peligro" tamano="sm" disabled={eliminando} onClick={() => setPorEliminar(club)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  return (
    <section className="admin-gestion">
      <header className="admin-gestion__encabezado">
        <div><h1>Administrar clubes</h1><p>Creá, editá y eliminá los clubes del catálogo.</p></div>
        <Button onClick={() => abrirFormulario()}>+ Nuevo club</Button>
      </header>

      {aviso && <Alert tipo="exito" onCerrar={() => setAviso('')}>{aviso}</Alert>}
      {error && clubes !== null && <ErrorMessage error={error} onReintentar={() => setRecarga((valor) => valor + 1)} />}

      <label className="admin-gestion__etiqueta-busqueda" htmlFor="buscar-clubes">Buscar clubes</label>
      <input id="buscar-clubes" type="search" placeholder="Nombre o país..." value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} className="admin-gestion__buscador" />

      {clubes === null && error
        ? <ErrorMessage error={error} onReintentar={() => setRecarga((valor) => valor + 1)} />
        : clubes === null
          ? <Spinner texto="Cargando clubes..." />
          : visibles.length === 0
            ? <EmptyState icono="🏟️" titulo={busqueda ? 'No hay clubes que coincidan' : 'No hay clubes'} mensaje={busqueda ? 'Probá con otra búsqueda.' : 'Creá el primer club con el botón de arriba.'} />
            : <DataTable columnas={columnas} filas={visibles} />}

      <ClubForm
        abierto={formularioAbierto}
        club={clubEditado}
        onCerrar={() => setFormularioAbierto(false)}
        onGuardado={guardar}
      />
      <ConfirmDialog
        abierto={porEliminar !== null}
        onCerrar={() => setPorEliminar(null)}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar club"
        mensaje={`¿Seguro que querés eliminar «${porEliminar?.nombre ?? ''}»? Esta acción no se puede deshacer durante esta sesión.`}
      />
    </section>
  );
}
