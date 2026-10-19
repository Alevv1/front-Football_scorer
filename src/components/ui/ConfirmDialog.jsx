import Modal from './Modal';
import './ConfirmDialog.css';

function ConfirmDialog({ abierto, onCerrar, onConfirmar, titulo, mensaje }) {
  function manejarConfirmar() {
    onConfirmar();
    onCerrar();
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo || '¿Estás seguro?'}>
      <p className="confirm-dialog-mensaje">{mensaje}</p>
      <div className="confirm-dialog-acciones">
        <button className="confirm-dialog-cancelar" onClick={onCerrar}>
          Cancelar
        </button>
        <button className="confirm-dialog-confirmar" onClick={manejarConfirmar}>
          Confirmar
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;