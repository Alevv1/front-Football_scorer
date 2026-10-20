import { useState } from 'react';
import { actualizarClub, crearClub } from '../../services/catalogoService';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import './AdminForms.css';

function Formulario({ club, onCerrar, onGuardado }) {
  const [valores, setValores] = useState(() => ({
    nombre: club?.nombre ?? '',
    pais: club?.pais ?? '',
    escudoUrl: club?.escudoUrl ?? '',
  }));
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function cambiar(evento) {
    setValores((actuales) => ({ ...actuales, [evento.target.name]: evento.target.value }));
    if (evento.target.name === 'nombre') setErrores({});
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (valores.nombre.trim() === '') {
      setErrores({ nombre: 'El nombre es obligatorio' });
      return;
    }
    setGuardando(true);
    setErrorServidor(null);
    try {
      const respuesta = club
        ? await actualizarClub(club.id, valores)
        : await crearClub(valores);
      onGuardado(respuesta);
    } catch (error) {
      setErrorServidor(error);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={enviar} noValidate>
      <ErrorMessage error={errorServidor} />
      <FormField label="Nombre" name="nombre" required value={valores.nombre} onChange={cambiar} error={errores.nombre} />
      <FormField label="País" name="pais" value={valores.pais} onChange={cambiar} ayuda="Opcional" />
      <FormField label="URL del escudo" name="escudoUrl" value={valores.escudoUrl} onChange={cambiar} ayuda="Opcional. Ejemplo: /img/escudos/boca-juniors.svg" />
      <div className="admin-form__acciones">
        <Button variante="secundario" onClick={onCerrar} disabled={guardando}>Cancelar</Button>
        <Button type="submit" cargando={guardando}>{club ? 'Guardar cambios' : 'Crear club'}</Button>
      </div>
    </form>
  );
}

export default function ClubForm({ abierto, onCerrar, club, onGuardado }) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={club ? 'Editar club' : 'Nuevo club'}>
      <Formulario club={club} onCerrar={onCerrar} onGuardado={onGuardado} />
    </Modal>
  );
}
