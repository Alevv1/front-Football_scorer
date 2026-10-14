import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function OrdenDetallePage() {
  return (
    <PaginaPendiente
      titulo="Detalle de orden"
      dueno="Parzival"
      endpoints={[
        'GET /api/ordenes/{id}',
      ]}
    />
  );
}
