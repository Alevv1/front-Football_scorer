import { useState } from 'react';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import { sinErrores } from '../../utils/validaciones';
import { actualizarProducto, crearProducto } from '../../services/productosService';
import './ProductoForm.css';

const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', imagenUrl: '', clubId: '' };

function valoresIniciales(producto) {
  if (!producto) return VACIO;
  return {
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? '',
    precio: String(producto.precio),
    stock: String(producto.stock),
    imagenUrl: producto.imagenUrl ?? '',
    clubId: String(producto.club?.id ?? ''),
  };
}

// Mismas reglas que ProductoRequest del back.
function validar(valores) {
  return {
    nombre: valores.nombre.trim() === '' ? 'El nombre es obligatorio' : undefined,
    precio: !(Number(valores.precio) > 0) ? 'El precio debe ser mayor a 0' : undefined,
    stock:
      valores.stock === '' || !(Number(valores.stock) >= 0)
        ? 'El stock debe ser 0 o más'
        : undefined,
    clubId: valores.clubId === '' ? 'Elegí un club' : undefined,
  };
}

function Formulario({ producto, clubes, onCerrar, onGuardado }) {
  const [valores, setValores] = useState(() => valoresIniciales(producto));
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function cambiar(e) {
    setValores((actuales) => ({ ...actuales, [e.target.name]: e.target.value }));
  }

  async function enviar(e) {
    e.preventDefault();
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (!sinErrores(nuevosErrores)) return;

    setGuardando(true);
    setErrorServidor(null);
    try {
      if (producto) await actualizarProducto(producto.id, valores);
      else await crearProducto(valores);
      onGuardado();
    } catch (err) {
      setErrorServidor(err);
      setGuardando(false);
    }
  }

  return (
    <form className="producto-form" onSubmit={enviar} noValidate>
      <ErrorMessage error={errorServidor} />
      <FormField label="Nombre" name="nombre" required value={valores.nombre} onChange={cambiar} error={errores.nombre} />
      <FormField label="Descripción" name="descripcion" as="textarea" rows={3} value={valores.descripcion} onChange={cambiar} />
      <div className="producto-form__fila">
        <FormField label="Precio" name="precio" type="number" min="0" step="0.01" required value={valores.precio} onChange={cambiar} error={errores.precio} />
        <FormField label="Stock" name="stock" type="number" min="0" step="1" required value={valores.stock} onChange={cambiar} error={errores.stock} />
      </div>
      <FormField label="Club" name="clubId" as="select" required value={valores.clubId} onChange={cambiar} error={errores.clubId}>
        <option value="">Elegí un club</option>
        {clubes.map((club) => (
          <option key={club.id} value={club.id}>
            {club.nombre}
          </option>
        ))}
      </FormField>
      <FormField label="URL de la imagen" name="imagenUrl" value={valores.imagenUrl} onChange={cambiar} />
      <div className="producto-form__acciones">
        <Button variante="secundario" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" cargando={guardando}>
          {producto ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}

// El formulario se monta al abrir el modal, así arranca siempre con los valores del producto.
export default function ProductoForm({ abierto, onCerrar, producto, clubes, onGuardado }) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={producto ? 'Editar producto' : 'Nuevo producto'}>
      <Formulario producto={producto} clubes={clubes} onCerrar={onCerrar} onGuardado={onGuardado} />
    </Modal>
  );
}
