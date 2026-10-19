import { useState } from 'react';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import { actualizarStock } from '../../services/productosService';
import './ProductoForm.css';

function Formulario({ producto, onCerrar, onGuardado }) {
  const [stock, setStock] = useState(String(producto.stock));
  const [error, setError] = useState();
  const [errorServidor, setErrorServidor] = useState(null);
  const [guardando, setGuardando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (stock === '' || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      setError('El stock debe ser un número entero de 0 o más');
      return;
    }
    setError(undefined);
    setGuardando(true);
    setErrorServidor(null);
    try {
      await actualizarStock(producto.id, Number(stock));
      onGuardado();
    } catch (err) {
      setErrorServidor(err);
      setGuardando(false);
    }
  }

  return (
    <form className="producto-form" onSubmit={enviar} noValidate>
      <ErrorMessage error={errorServidor} />
      <FormField
        label="Stock"
        name="stock"
        type="number"
        min="0"
        step="1"
        required
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        error={error}
      />
      <div className="producto-form__acciones">
        <Button variante="secundario" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" cargando={guardando}>
          Actualizar stock
        </Button>
      </div>
    </form>
  );
}

export default function StockModal({ abierto, onCerrar, producto, onGuardado }) {
  return (
    <Modal abierto={abierto && Boolean(producto)} onCerrar={onCerrar} titulo={`Stock · ${producto?.nombre ?? ''}`}>
      {producto && <Formulario producto={producto} onCerrar={onCerrar} onGuardado={onGuardado} />}
    </Modal>
  );
}
