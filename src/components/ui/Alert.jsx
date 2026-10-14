import './Alert.css';

export default function Alert({ tipo = 'info', titulo, onCerrar, children }) {
  return (
    <div className={`alerta alerta--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <div className="alerta__contenido">
        {titulo && <strong className="alerta__titulo">{titulo}</strong>}
        {children && <div>{children}</div>}
      </div>
      {onCerrar && (
        <button type="button" className="alerta__cerrar" onClick={onCerrar} aria-label="Cerrar">
          ×
        </button>
      )}
    </div>
  );
}
