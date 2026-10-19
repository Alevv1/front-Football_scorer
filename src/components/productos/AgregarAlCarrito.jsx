import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useCarrito } from '../../context/useCarrito';

export default function AgregarAlCarrito({ producto, cantidad }) {
  const { estaLogueado } = useAuth();
  const { agregarItem } = useCarrito();
  const navigate = useNavigate();

  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const sinStock = producto.stock === 0;

  async function manejarAgregar() {
    if (!estaLogueado) {
      navigate('/login');
      return;
    }

    if (
      agregando ||
      sinStock ||
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > producto.stock
    ) {
      return;
    }

    setAgregando(true);
    setError('');
    setExito(false);

    try {
      await agregarItem(producto.id, cantidad);
      setExito(true);
    } catch (err) {
      setError(err.mensaje || err.message || 'No se pudo agregar al carrito.');
    } finally {
      setAgregando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="producto-detalle__boton"
        onClick={manejarAgregar}
        disabled={sinStock || agregando}
      >
        {sinStock
          ? 'Sin stock'
          : agregando
            ? 'Agregando...'
            : 'Agregar al carrito'}
      </button>

      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}
      {exito && (
        <p role="status" style={{ color: 'var(--color-exito)' }}>
          ¡Producto agregado al carrito!
        </p>
      )}
    </div>
  );
}
