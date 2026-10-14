import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function ClubesPage() {
  return (
    <PaginaPendiente
      titulo="Clubes"
      dueno="Mati"
      endpoints={[
        'GET /api/clubes?pais',
      ]}
    />
  );
}
