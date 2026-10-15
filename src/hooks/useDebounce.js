import { useEffect, useState } from 'react';

// Devuelve `valor` recién cuando dejó de cambiar durante `demoraMs`.
// Evita pedir el catálogo en cada tecla que se escribe en el buscador.
export function useDebounce(valor, demoraMs = 300) {
  const [demorado, setDemorado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDemorado(valor), demoraMs);
    return () => clearTimeout(temporizador);
  }, [valor, demoraMs]);

  return demorado;
}
