import { obtenerJson, simularError, simularRespuesta } from './http';
import { obtenerProducto } from './productosService';

let carritoInicial = null;
const carritos = new Map();
let proximoCarritoId = 1;
let proximoItemId = 1;

function cargarCarritoInicial() {
  carritoInicial ??= obtenerJson('carrito.json')
    .then((carrito) => {
      carritos.set(carrito.usuarioId, carrito);
      proximoCarritoId = carrito.carritoId + 1;
      proximoItemId = Math.max(0, ...carrito.items.map((item) => item.itemId)) + 1;
    })
    .catch((error) => {
      carritoInicial = null;
      throw error;
    });
  return carritoInicial;
}

function errorResponse(status, error, mensaje, path) {
  return {
    timestamp: new Date().toISOString().slice(0, 19),
    status,
    error,
    mensaje,
    path,
  };
}

function sinSesion(path) {
  return errorResponse(401, 'Unauthorized', 'Tenés que iniciar sesión', path);
}

function recalcular(carrito) {
  carrito.items.forEach((item) => {
    item.subtotal = item.precioUnitario * item.cantidad;
  });
  carrito.total = carrito.items.reduce((suma, item) => suma + item.subtotal, 0);
  return carrito;
}

function buscarCarrito(usuario) {
  return carritos.get(usuario.id) ?? null;
}

function buscarItem(carrito, itemId, path) {
  const item = carrito.items.find((i) => i.itemId === Number(itemId));
  if (!item) {
    throw errorResponse(404, 'Not Found', `El item ${itemId} no pertenece a este carrito`, path);
  }
  return item;
}

function sinCarrito(usuario, path) {
  return errorResponse(404, 'Not Found', `El usuario ${usuario.email} no tiene carrito`, path);
}

function validarStock(producto, cantidadPedida, path) {
  if (cantidadPedida > producto.stock) {
    throw errorResponse(
      400,
      'Bad Request',
      `Stock insuficiente para ${producto.nombre}: disponible ${producto.stock}, pedido ${cantidadPedida}`,
      path,
    );
  }
}

function validarCantidad(cantidad) {
  if (cantidad == null) return 'cantidad: La cantidad es obligatoria';
  if (!(Number(cantidad) > 0)) return 'cantidad: La cantidad debe ser mayor a 0';
  return null;
}

export async function obtenerCarrito(usuario) {
  if (!usuario) return simularError(sinSesion('/api/carrito'));
  await cargarCarritoInicial();

  const carrito = buscarCarrito(usuario) ?? { carritoId: null, usuarioId: usuario.id, items: [], total: 0 };
  return simularRespuesta(carrito);
}

export async function agregarItem(usuario, { productoId, cantidad } = {}) {
  const path = '/api/carrito/items';
  if (!usuario) return simularError(sinSesion(path));

  const invalido = [productoId == null && 'productoId: El productoId es obligatorio', validarCantidad(cantidad)]
    .filter(Boolean)
    .join(', ');
  if (invalido) return simularError(errorResponse(400, 'Bad Request', invalido, path));

  await cargarCarritoInicial();
  try {
    const producto = await obtenerProducto(productoId);
    let carrito = buscarCarrito(usuario);
    const existente = carrito?.items.find((item) => item.productoId === producto.id);
    const cantidadTotal = (existente?.cantidad ?? 0) + Number(cantidad);

    validarStock(producto, cantidadTotal, path);

    if (!carrito) {
      carrito = { carritoId: proximoCarritoId++, usuarioId: usuario.id, items: [], total: 0 };
      carritos.set(usuario.id, carrito);
    }
    if (existente) {
      existente.cantidad = cantidadTotal;
    } else {
      carrito.items.push({
        itemId: proximoItemId++,
        productoId: producto.id,
        nombreProducto: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: Number(cantidad),
        subtotal: 0,
      });
    }
    return simularRespuesta(recalcular(carrito));
  } catch (error) {
    return simularError(error);
  }
}

export async function actualizarCantidad(usuario, itemId, { cantidad } = {}) {
  const path = `/api/carrito/items/${itemId}`;
  if (!usuario) return simularError(sinSesion(path));

  const invalido = validarCantidad(cantidad);
  if (invalido) return simularError(errorResponse(400, 'Bad Request', invalido, path));

  await cargarCarritoInicial();
  try {
    const carrito = buscarCarrito(usuario);
    if (!carrito) throw sinCarrito(usuario, path);
    const item = buscarItem(carrito, itemId, path);

    validarStock(await obtenerProducto(item.productoId), Number(cantidad), path);

    item.cantidad = Number(cantidad);
    return simularRespuesta(recalcular(carrito));
  } catch (error) {
    return simularError(error);
  }
}

export async function eliminarItem(usuario, itemId) {
  const path = `/api/carrito/items/${itemId}`;
  if (!usuario) return simularError(sinSesion(path));

  await cargarCarritoInicial();
  try {
    const carrito = buscarCarrito(usuario);
    if (!carrito) throw sinCarrito(usuario, path);
    const item = buscarItem(carrito, itemId, path);

    carrito.items = carrito.items.filter((i) => i !== item);
    recalcular(carrito);
    return simularRespuesta(undefined);
  } catch (error) {
    return simularError(error);
  }
}

export async function vaciarCarrito(usuario) {
  const path = '/api/carrito';
  if (!usuario) return simularError(sinSesion(path));

  await cargarCarritoInicial();
  const carrito = buscarCarrito(usuario);
  if (!carrito) return simularError(sinCarrito(usuario, path));

  carrito.items = [];
  recalcular(carrito);
  return simularRespuesta(undefined);
}

export async function carritoParaCheckout(usuario) {
  await cargarCarritoInicial();
  return buscarCarrito(usuario);
}
