import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function RegistroPage() {
  return (
    <PaginaPendiente
      titulo="Crear cuenta"
      dueno="Johnny"
      endpoints={[
        'POST /api/auth/register',
      ]}
    />
  );
}
