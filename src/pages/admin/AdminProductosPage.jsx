import PaginaPendiente from '../../components/layout/PaginaPendiente';

export default function AdminProductosPage() {
  return (
    <PaginaPendiente
      titulo="Admin · Productos"
      dueno="Kiki"
      endpoints={[
        'POST /api/productos',
        'PUT /api/productos/{id}',
        'DELETE /api/productos/{id}',
        'PATCH /api/productos/{id}/stock',
        'POST /api/productos/{id}/categorias/{categoriaId}',
        'DELETE /api/productos/{id}/categorias/{categoriaId}',
      ]}
    />
  );
}
