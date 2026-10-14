import PaginaPendiente from '../../components/layout/PaginaPendiente';

export default function AdminCategoriasPage() {
  return (
    <PaginaPendiente
      titulo="Admin · Categorías"
      dueno="Yuyo"
      endpoints={[
        'POST /api/categorias',
        'PUT /api/categorias/{id}',
        'DELETE /api/categorias/{id}',
      ]}
    />
  );
}
