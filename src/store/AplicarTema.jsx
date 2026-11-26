import { useEffect } from 'react';
import { useTema } from '../hooks/useTema';

// Pone el tema en <html data-tema="..."> para que variables.css cambie los colores.
export default function AplicarTema() {
  const { tema } = useTema();

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);

  return null;
}
