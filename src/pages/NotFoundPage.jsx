import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';

export default function NotFoundPage() {
  return (
    <EmptyState
      icono="🥅"
      titulo="Esta página no existe"
      mensaje="Puede que el link esté mal o que la página se haya movido."
      accion={<Link to="/">Volver al catálogo</Link>}
    />
  );
}
