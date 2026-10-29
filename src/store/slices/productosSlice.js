import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { listarCategoriasApi, listarProductosApi } from '../../services/apiService';

export const cargarProductos = createAsyncThunk(
  'productos/cargarProductos',
  async (filtros, { rejectWithValue }) => {
    try {
      return await listarProductosApi(filtros);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const cargarCategorias = createAsyncThunk('productos/cargarCategorias', () => listarCategoriasApi());

const productosSlice = createSlice({
  name: 'productos',
  initialState: { lista: null, categorias: [], cargando: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(cargarProductos.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(cargarProductos.fulfilled, (state, action) => {
        state.lista = action.payload;
        state.cargando = false;
      })
      .addCase(cargarProductos.rejected, (state, action) => {
        state.error = action.payload ?? action.error;
        state.cargando = false;
      })
      .addCase(cargarCategorias.fulfilled, (state, action) => {
        state.categorias = action.payload;
      });
  },
});

export const seleccionarProductos = (state) => state.productos;

export default productosSlice.reducer;
