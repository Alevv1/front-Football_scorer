import { carritoParaCheckout } from './carritoService';
import { obtenerJson, simularError, simularRespuesta } from './http';
import { descontarStock, obtenerProducto } from './productosService';

let ordenes = null;

function cargarOrdenes() {
  ordenes ??= obtenerJson('ordenes.json').catch((error) => {
    ordenes = null;
    throw error;
  });
  return ordenes;
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

function ahoraLocal() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

export async function crearOrden(usuario) {
  const path = '/api/ordenes';
  if (!usuario) return simularError(sinSesion(path));

  try {
    const [lista, carrito] = await Promise.all([cargarOrdenes(), carritoParaCheckout(usuario)]);
    if (!carrito) {
      throw errorResponse(404, 'Not Found', `El usuario ${usuario.email} no tiene carrito`, path);
    }
    if (carrito.items.length === 0) {
      throw errorResponse(400, 'Bad Request', 'El carrito está vacío', path);
    }

    const productos = await Promise.all(carrito.items.map((item) => obtenerProducto(item.productoId)));
    carrito.items.forEach((item, i) => {
      if (item.cantidad > productos[i].stock) {
        throw errorResponse(
          400,
          'Bad Request',
          `Stock insuficiente para ${productos[i].nombre}: disponible ${productos[i].stock}, pedido ${item.cantidad}`,
          path,
        );
      }
    });
    for (const item of carrito.items) {
      await descontarStock(item.productoId, item.cantidad);
    }

    let proximoItemId = Math.max(0, ...lista.flatMap((o) => o.items.map((item) => item.itemId))) + 1;
    const items = carrito.items.map((item, i) => ({
      itemId: proximoItemId++,
      productoId: item.productoId,
      nombreProducto: productos[i].nombre,
      precioUnitario: productos[i].precio,
      cantidad: item.cantidad,
      subtotal: productos[i].precio * item.cantidad,
    }));

    const orden = {
      id: Math.max(0, ...lista.map((o) => o.id)) + 1,
      usuarioId: usuario.id,
      fecha: ahoraLocal(),
      estado: 'PENDIENTE',
      items,
      total: items.reduce((suma, item) => suma + item.subtotal, 0),
    };
    lista.push(orden);

    carrito.items = [];
    carrito.total = 0;

    return simularRespuesta(orden);
  } catch (error) {
    return simularError(error);
  }
}

export async function listarMisOrdenes(usuario) {
  if (!usuario) return simularError(sinSesion('/api/ordenes'));

  const mias = (await cargarOrdenes())
    .filter((orden) => orden.usuarioId === usuario.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  return simularRespuesta(mias);
}

export async function obtenerOrden(id, usuario) {
  const path = `/api/ordenes/${id}`;
  if (!usuario) return simularError(sinSesion(path));

  const orden = (await cargarOrdenes()).find((o) => o.id === Number(id));
  if (!orden) {
    return simularError(errorResponse(404, 'Not Found', `Orden ${id} no encontrada`, path));
  }
  if (orden.usuarioId !== usuario.id) {
    return simularError(errorResponse(403, 'Forbidden', `La orden ${id} no pertenece a este usuario`, path));
  }
  return simularRespuesta(orden);
}
