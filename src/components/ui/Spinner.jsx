import './Spinner.css';

export default function Spinner({ texto = 'Cargando...' }) {
  return (
    <div className="spinner" role="status">
      <span className="spinner__circulo" aria-hidden="true" />
      <span className="spinner__texto">{texto}</span>
    </div>
  );
}
