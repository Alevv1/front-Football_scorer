import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function ClubDetallePage() {
  return (
    <PaginaPendiente
      titulo="Club"
      dueno="Mati"
      endpoints={[
        'GET /api/clubes/{id}',
        'GET /api/productos?clubId',
      ]}
    />
  );
}
