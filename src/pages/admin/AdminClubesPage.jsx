import PaginaPendiente from '../../components/layout/PaginaPendiente';

export default function AdminClubesPage() {
  return (
    <PaginaPendiente
      titulo="Admin · Clubes"
      dueno="Yuyo"
      endpoints={[
        'POST /api/clubes',
        'PUT /api/clubes/{id}',
        'DELETE /api/clubes/{id}',
      ]}
    />
  );
}
