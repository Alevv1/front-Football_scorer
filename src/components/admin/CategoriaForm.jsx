import { useState } from 'react';
import { actualizarCategoria, crearCategoria } from '../../services/catalogoService';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import './AdminForms.css';

function Formulario({ categoria, onCerrar, onGuardado }) {
  const [valores, setValores] = useState(() => ({
    nombre: categoria?.nombre ?? '',
    descripcion: categoria?.descripcion ?? '',
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
      const respuesta = categoria
        ? await actualizarCategoria(categoria.id, valores)
        : await crearCategoria(valores);
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
      <FormField label="Descripción" name="descripcion" as="textarea" rows={4} value={valores.descripcion} onChange={cambiar} ayuda="Opcional" />
      <div className="admin-form__acciones">
        <Button variante="secundario" onClick={onCerrar} disabled={guardando}>Cancelar</Button>
        <Button type="submit" cargando={guardando}>{categoria ? 'Guardar cambios' : 'Crear categoría'}</Button>
      </div>
    </form>
  );
}

export default function CategoriaForm({ abierto, onCerrar, categoria, onGuardado }) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={categoria ? 'Editar categoría' : 'Nueva categoría'}>
      <Formulario categoria={categoria} onCerrar={onCerrar} onGuardado={onGuardado} />
    </Modal>
  );
}
