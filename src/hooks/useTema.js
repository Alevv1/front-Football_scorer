import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cambiarTema, seleccionarTemaElegido } from '../store/slices/preferenciasSlice';

const CONSULTA_OSCURO = '(prefers-color-scheme: dark)';

function temaDelSistema() {
  return window.matchMedia?.(CONSULTA_OSCURO).matches ? 'oscuro' : 'claro';
}

// Tema efectivo: el que eligió la persona o, si nunca eligió, el del sistema operativo.
export function useTema() {
  const dispatch = useDispatch();
  const elegido = useSelector(seleccionarTemaElegido);
  const [sistema, setSistema] = useState(temaDelSistema);

  useEffect(() => {
    if (elegido) return undefined;
    const consulta = window.matchMedia?.(CONSULTA_OSCURO);
    if (!consulta) return undefined;
    const alCambiar = () => setSistema(temaDelSistema());
    consulta.addEventListener('change', alCambiar);
    return () => consulta.removeEventListener('change', alCambiar);
  }, [elegido]);

  const tema = elegido ?? sistema;

  return {
    tema,
    alternarTema: () => dispatch(cambiarTema(tema === 'oscuro' ? 'claro' : 'oscuro')),
  };
}
