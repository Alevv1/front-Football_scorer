import { useState } from 'react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import './FiltrosCatalogo.css';

// Los cuatro filtros son los @RequestParam de GET /api/productos, ni uno más.
// Es un componente controlado: los valores viven en la página (en la URL).
export default function FiltrosCatalogo({ valores, clubes, categorias, onCambiar, onLimpiar }) {
  const [abierto, setAbierto] = useState(false);
  const cantidadActivos = Object.values(valores).filter(Boolean).length;

  const cambiar = (evento) => onCambiar(evento.target.name, evento.target.value);

  const cerrarEnMobile = (evento) => {
    evento.preventDefault();
    setAbierto(false);
  };

  return (
    <aside className="filtros">
      <button
        type="button"
        className="filtros__toggle"
        onClick={() => setAbierto((estado) => !estado)}
        aria-expanded={abierto}
        aria-controls="filtros-panel"
      >
        <span>
          Filtros
          {cantidadActivos > 0 && <span className="filtros__contador">{cantidadActivos}</span>}
        </span>
        <span className="filtros__flecha" aria-hidden="true">
          ▾
        </span>
      </button>

      <form
        id="filtros-panel"
        className={`filtros__panel ${abierto ? 'filtros__panel--abierto' : ''}`}
        role="search"
        onSubmit={cerrarEnMobile}
      >
        <FormField
          label="Buscar"
          name="nombre"
          type="search"
          placeholder="Ej: camiseta"
          autoComplete="off"
          value={valores.nombre}
          onChange={cambiar}
        />

        <FormField as="select" label="Club" name="clubId" value={valores.clubId} onChange={cambiar}>
          <option value="">Todos los clubes</option>
          {clubes.map((club) => (
            <option key={club.id} value={club.id}>
              {club.nombre}
            </option>
          ))}
        </FormField>

        <FormField as="select" label="Categoría" name="categoriaId" value={valores.categoriaId} onChange={cambiar}>
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </FormField>

        <FormField
          label="Precio máximo"
          name="precioMax"
          type="number"
          min="0"
          step="1000"
          inputMode="numeric"
          placeholder="Sin límite"
          value={valores.precioMax}
          onChange={cambiar}
        />

        <div className="filtros__acciones">
          <Button type="submit" bloque className="filtros__ver">
            Ver resultados
          </Button>
          <Button variante="secundario" bloque onClick={onLimpiar} disabled={cantidadActivos === 0}>
            Limpiar filtros
          </Button>
        </div>
      </form>
    </aside>
  );
}
