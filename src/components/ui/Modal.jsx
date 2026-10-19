import { useEffect } from 'react';
import './Modal.css';

function Modal({ abierto, onCerrar, titulo, children }) {
  useEffect(() => {
    if (!abierto) return;

    function manejarEsc(e) {
      if (e.key === 'Escape') onCerrar();
    }

    document.addEventListener('keydown', manejarEsc);
    return () => document.removeEventListener('keydown', manejarEsc);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;