import { createSlice } from '@reduxjs/toolkit';

// Solo datos no sensibles: este slice se guarda en localStorage (ver store/index.js) y
// sobrevive a cerrar el navegador. Nunca guardar acá nada de la sesión.
export const TEMAS = ['claro', 'oscuro'];

const preferenciasSlice = createSlice({
  name: 'preferencias',
  // null = la persona todavía no eligió: se usa el tema del sistema operativo.
  initialState: { tema: null },
  reducers: {
    cambiarTema(state, action) {
      state.tema = TEMAS.includes(action.payload) ? action.payload : null;
    },
  },
});

export const { cambiarTema } = preferenciasSlice.actions;

export const seleccionarTemaElegido = (state) => state.preferencias.tema;

export default preferenciasSlice.reducer;
