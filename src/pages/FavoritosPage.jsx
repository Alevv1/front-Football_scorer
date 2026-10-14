import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function FavoritosPage() {
  return (
    <PaginaPendiente
      titulo="Favoritos"
      dueno="Yuyo"
      endpoints={[
        'GET /api/favoritos',
        'DELETE /api/favoritos/{productoId}',
      ]}
    />
  );
}
