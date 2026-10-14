const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatearPrecio(valor) {
  if (valor == null) return '';
  return formatoPrecio.format(valor);
}

export function formatearFecha(fechaIso) {
  if (!fechaIso) return '';
  return formatoFecha.format(new Date(fechaIso));
}
