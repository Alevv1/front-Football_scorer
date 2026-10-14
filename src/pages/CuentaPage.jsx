import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function CuentaPage() {
  return (
    <PaginaPendiente
      titulo="Mi cuenta"
      dueno="Johnny"
      endpoints={[
        'GET /api/usuarios/{id}',
        'PUT /api/usuarios/{id}',
      ]}
    />
  );
}
