import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function LoginPage() {
  return (
    <PaginaPendiente
      titulo="Ingresar"
      dueno="Johnny"
      endpoints={[
        'POST /api/auth/login',
      ]}
    />
  );
}
