import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CarritoItem from '../components/carrito/CarritoItem';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import Spinner from '../components/ui/Spinner';
import { useCarrito } from '../context/useCarrito';
import { formatearPrecio } from '../utils/formato';
import './CarritoPage.css';

export default function CarritoPage() {
  const { carrito, cantidadTotal, error, recargar, actualizarCantidad, eliminarItem, vaciar, confirmarCompra } =
    useCarrito();
  const navigate = useNavigate();

  const [ocupado, setOcupado] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  async function ejecutar(clave, accion) {
    setOcupado(clave);
    setErrorAccion(null);
    try {
      return await accion();
    } catch (err) {
      setErrorAccion(err);
      return null;
    } finally {
      setOcupado(null);
    }
  }

  async function comprar() {
    const orden = await ejecutar('comprar', confirmarCompra);
    if (orden) navigate(`/ordenes/${orden.id}`, { state: { recienCreada: true } });
  }

  if (error && !carrito) {
    return (
      <section className="carrito">
        <h1>Carrito</h1>
        <ErrorMessage error={error} onReintentar={recargar} />
      </section>
    );
  }

  if (!carrito) {
    return <Spinner texto="Cargando carrito..." />;
  }

  if (carrito.items.length === 0) {
    return (
      <section className="carrito">
        <h1>Carrito</h1>
        <EmptyState
          icono="🛒"
          titulo="Tu carrito está vacío"
          mensaje="Agregá camisetas, botines o lo que quieras desde el catálogo."
          accion={
            <Link to="/" className="carrito__ir-catalogo">
              Ver catálogo
            </Link>
          }
        />
      </section>
    );
  }

  const enCurso = ocupado !== null;

  return (
    <section className="carrito">
      <header className="carrito__encabezado">
        <h1>Carrito</h1>
        <Button variante="texto" tamano="sm" onClick={() => setConfirmarVaciar(true)} disabled={enCurso}>
          Vaciar carrito
        </Button>
      </header>

      <ErrorMessage error={errorAccion} />

      <div className="carrito__contenido">
        <ul className="carrito__items">
          {carrito.items.map((item) => (
            <CarritoItem
              key={item.itemId}
              item={item}
              ocupado={enCurso}
              onCambiarCantidad={(cantidad) => ejecutar(item.itemId, () => actualizarCantidad(item.itemId, cantidad))}
              onEliminar={() => ejecutar(item.itemId, () => eliminarItem(item.itemId))}
            />
          ))}
        </ul>

        <aside className="carrito__resumen" aria-label="Resumen de compra">
          <h2>Resumen</h2>
          <dl>
            <div>
              <dt>Productos</dt>
              <dd>{cantidadTotal}</dd>
            </div>
            <div className="carrito__total">
              <dt>Total</dt>
              <dd>{formatearPrecio(carrito.total)}</dd>
            </div>
          </dl>
          <Button bloque onClick={comprar} cargando={ocupado === 'comprar'} disabled={enCurso}>
            Confirmar compra
          </Button>
          <Link to="/" className="carrito__seguir">
            Seguir comprando
          </Link>
        </aside>
      </div>

      <ConfirmDialog
        abierto={confirmarVaciar}
        onCerrar={() => setConfirmarVaciar(false)}
        onConfirmar={() => ejecutar('vaciar', vaciar)}
        titulo="¿Vaciar el carrito?"
        mensaje={`Se van a quitar los ${carrito.items.length} productos del carrito.`}
      />
    </section>
  );
}
