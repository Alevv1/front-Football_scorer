import { useEffect, useState } from 'react';
import ErrorMessage from '../ui/ErrorMessage';
import Spinner from '../ui/Spinner';
import { listarCategorias } from '../../services/catalogoService';
import {
  asociarCategoria,
  desasociarCategoria,
  listarCategoriaIdsDeProducto,
} from '../../services/productosService';
import './CategoriasProducto.css';

// Cada checkbox asocia (POST) o desasocia (DELETE) la categoría al instante.
export default function CategoriasProducto({ producto }) {
  const [categorias, setCategorias] = useState(null);
  const [asociadas, setAsociadas] = useState(new Set());
  const [error, setError] = useState(null);
  const [pendiente, setPendiente] = useState(null);

  useEffect(() => {
    let vigente = true;
    Promise.all([listarCategorias(), listarCategoriaIdsDeProducto(producto.id)])
      .then(([lista, ids]) => {
        if (!vigente) return;
        setCategorias(lista);
        setAsociadas(new Set(ids));
      })
      .catch((err) => vigente && setError(err));
    return () => {
      vigente = false;
    };
  }, [producto.id]);

  async function alternar(categoria) {
    const estaAsociada = asociadas.has(categoria.id);
    setPendiente(categoria.id);
    setError(null);
    try {
      if (estaAsociada) await desasociarCategoria(producto.id, categoria.id);
      else await asociarCategoria(producto.id, categoria.id);
      setAsociadas((actuales) => {
        const nuevas = new Set(actuales);
        if (estaAsociada) nuevas.delete(categoria.id);
        else nuevas.add(categoria.id);
        return nuevas;
      });
    } catch (err) {
      setError(err);
    } finally {
      setPendiente(null);
    }
  }

  if (categorias === null && !error) return <Spinner texto="Cargando categorías..." />;

  return (
    <div className="categorias-producto">
      <ErrorMessage error={error} />
      {categorias?.map((categoria) => (
        <label key={categoria.id} className="categorias-producto__opcion">
          <input
            type="checkbox"
            checked={asociadas.has(categoria.id)}
            disabled={pendiente === categoria.id}
            onChange={() => alternar(categoria)}
          />
          {categoria.nombre}
        </label>
      ))}
    </div>
  );
}
