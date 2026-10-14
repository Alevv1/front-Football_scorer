import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function CarritoPage() {
  return (
    <PaginaPendiente
      titulo="Carrito"
      dueno="Parzival"
      endpoints={[
        'GET /api/carrito',
        'PUT /api/carrito/items/{itemId}',
        'DELETE /api/carrito/items/{itemId}',
        'DELETE /api/carrito',
        'POST /api/ordenes',
      ]}
    />
  );
}
