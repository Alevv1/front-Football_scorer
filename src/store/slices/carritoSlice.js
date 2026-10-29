import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as carritoService from '../../services/carritoService';
import { crearOrden } from '../../services/ordenesService';
import { cerrarSesion, seleccionarUsuario } from './authSlice';

// Los services rechazan con un ErrorResponse plano; rejectWithValue lo conserva tal cual
// para que `.unwrap()` lo devuelva a quien lo llama.
function crearThunk(tipo, operacion) {
  return createAsyncThunk(`carrito/${tipo}`, async (argumento, { getState, rejectWithValue }) => {
    try {
      return await operacion(seleccionarUsuario(getState()), argumento);
    } catch (error) {
      return rejectWithValue(error);
    }
  });
}

export const cargarCarrito = crearThunk('cargar', (usuario) => carritoService.obtenerCarrito(usuario));

export const agregarItem = crearThunk('agregarItem', (usuario, { productoId, cantidad = 1 }) =>
  carritoService.agregarItem(usuario, { productoId, cantidad }),
);

export const actualizarCantidad = crearThunk('actualizarCantidad', (usuario, { itemId, cantidad }) =>
  carritoService.actualizarCantidad(usuario, itemId, { cantidad }),
);

export const eliminarItem = crearThunk('eliminarItem', async (usuario, itemId) => {
  await carritoService.eliminarItem(usuario, itemId);
  return carritoService.obtenerCarrito(usuario);
});

export const vaciar = crearThunk('vaciar', async (usuario) => {
  await carritoService.vaciarCarrito(usuario);
  return carritoService.obtenerCarrito(usuario);
});

export const confirmarCompra = crearThunk('confirmarCompra', async (usuario) => {
  const orden = await crearOrden(usuario);
  return { orden, carrito: await carritoService.obtenerCarrito(usuario) };
});

const initialState = { carrito: null, cargando: false, error: null };

const carritoSlice = createSlice({
  name: 'carrito',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(cerrarSesion, () => initialState)
      .addCase(cargarCarrito.pending, (state) => {
        state.carrito = null;
        state.error = null;
        state.cargando = true;
      })
      .addCase(cargarCarrito.fulfilled, (state, action) => {
        state.carrito = action.payload;
        state.cargando = false;
      })
      .addCase(cargarCarrito.rejected, (state, action) => {
        state.error = action.payload ?? action.error;
        state.cargando = false;
      })
      .addCase(confirmarCompra.fulfilled, (state, action) => {
        state.carrito = action.payload.carrito;
      })
      .addMatcher(
        (action) =>
          [agregarItem, actualizarCantidad, eliminarItem, vaciar].some((thunk) => thunk.fulfilled.match(action)),
        (state, action) => {
          state.carrito = action.payload;
        },
      );
  },
});

export const seleccionarCarrito = (state) => state.carrito;
export const seleccionarCantidadTotal = (state) =>
  state.carrito.carrito?.items.reduce((suma, item) => suma + item.cantidad, 0) ?? 0;

export default carritoSlice.reducer;
