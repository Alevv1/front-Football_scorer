import PaginaPendiente from '../components/layout/PaginaPendiente';

export default function CatalogoPage() {
  return (
    <PaginaPendiente
      titulo="Catálogo"
      dueno="Nicolás"
      endpoints={[
        'GET /api/productos?nombre&clubId&categoriaId&precioMax',
        'GET /api/clubes',
        'GET /api/categorias',
      ]}
    />
  );
}
