import { useAuth } from '../../context/useAuth';
import './Footer.css';

export default function Footer() {
  const { rol, simularSesion } = useAuth();

  return (
    <footer className="footer">
      <div className="contenedor footer__contenido">
        <p className="footer__texto">Football Scorer · Aplicaciones Interactivas · UADE 2026</p>

        <label className="footer__simulador">
          <span>Ver como</span>
          <select value={rol ?? ''} onChange={(evento) => simularSesion(evento.target.value || null)}>
            <option value="">Visitante</option>
            <option value="CLIENTE">Cliente</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
      </div>
    </footer>
  );
}
