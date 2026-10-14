import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function ProductoDetallePage() {
  return (
    <PaginaPendiente
      titulo="Detalle de producto"
      dueno="Mati"
      endpoints={[
        'GET /api/productos/{id}',
        'POST /api/carrito/items',
        'POST /api/favoritos/{productoId}',
        'DELETE /api/favoritos/{productoId}',
      ]}
    />
  );
}
