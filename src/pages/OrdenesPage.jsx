import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function OrdenesPage() {
  return (
    <PaginaPendiente
      titulo="Mis órdenes"
      dueno="Parzival"
      endpoints={[
        'GET /api/ordenes',
      ]}
    />
  );
}
