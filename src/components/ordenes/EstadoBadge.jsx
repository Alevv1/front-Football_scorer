import './EstadoBadge.css';

const ETIQUETAS = {
  PENDIENTE: 'Pendiente',
  PAGADA: 'Pagada',
  ENVIADA: 'Enviada',
  CANCELADA: 'Cancelada',
};

export default function EstadoBadge({ estado }) {
  const clase = ETIQUETAS[estado] ? estado.toLowerCase() : 'desconocido';
  return <span className={`estado-badge estado-badge--${clase}`}>{ETIQUETAS[estado] ?? estado}</span>;
}
