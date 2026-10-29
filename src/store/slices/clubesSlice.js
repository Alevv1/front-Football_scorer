import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { listarClubesApi } from '../../services/apiService';

export const cargarClubes = createAsyncThunk('clubes/cargarClubes', async (pais, { rejectWithValue }) => {
  try {
    return await listarClubesApi(pais);
  } catch (error) {
    return rejectWithValue(error);
  }
});

const clubesSlice = createSlice({
  name: 'clubes',
  initialState: { lista: null, cargando: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(cargarClubes.pending, (state) => {
        state.lista = null;
        state.error = null;
        state.cargando = true;
      })
      .addCase(cargarClubes.fulfilled, (state, action) => {
        state.lista = action.payload;
        state.cargando = false;
      })
      .addCase(cargarClubes.rejected, (state, action) => {
        state.error = action.payload ?? action.error;
        state.cargando = false;
      });
  },
});

export const seleccionarClubes = (state) => state.clubes;

export default clubesSlice.reducer;
