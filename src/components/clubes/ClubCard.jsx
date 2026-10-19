import { Link } from 'react-router-dom';
import './ClubCard.css';

export default function ClubCard({ club }) {
  return (
    <Link to={`/clubes/${club.id}`} className="club-card">
      <img className="club-card__escudo" src={club.escudoUrl} alt={`Escudo de ${club.nombre}`} />
      <h3 className="club-card__nombre">{club.nombre}</h3>
      <p className="club-card__pais">{club.pais}</p>
    </Link>
  );
}