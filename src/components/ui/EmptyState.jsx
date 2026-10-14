import './EmptyState.css';

export default function EmptyState({ icono = '⚽', titulo, mensaje, accion }) {
  return (
    <div className="vacio">
      <span className="vacio__icono" aria-hidden="true">
        {icono}
      </span>
      <h2 className="vacio__titulo">{titulo}</h2>
      {mensaje && <p className="vacio__mensaje">{mensaje}</p>}
      {accion && <div className="vacio__accion">{accion}</div>}
    </div>
  );
}
