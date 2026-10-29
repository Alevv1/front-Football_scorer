import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ClubCard from '../components/clubes/ClubCard';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import Spinner from '../components/ui/Spinner';
import { cargarClubes, seleccionarClubes } from '../store/slices/clubesSlice';
import './ClubesPage.css';

export default function ClubesPage() {
  const dispatch = useDispatch();
  const { lista: clubes, error } = useSelector(seleccionarClubes);
  const [intento, setIntento] = useState(0);
  const [pais, setPais] = useState('');

  useEffect(() => {
    dispatch(cargarClubes(pais));
  }, [pais, intento, dispatch]);

  let contenido;
  if (error) {
    contenido = <ErrorMessage error={error} onReintentar={() => setIntento((n) => n + 1)} />;
  } else if (clubes === null) {
    contenido = <Spinner texto="Cargando clubes..." />;
  } else if (clubes.length === 0) {
    contenido = (
      <EmptyState
        icono="🛡️"
        titulo="No encontramos clubes"
        mensaje={pais ? 'Probá con otro país.' : 'Todavía no hay clubes cargados.'}
      />
    );
  } else {
    contenido = (
      <div className="clubes__grilla">
        {clubes.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    );
  }

  return (
    <section className="clubes">
      <header className="clubes__encabezado">
        <h1>Clubes</h1>
        <select
          className="clubes__filtro-pais"
          value={pais}
          onChange={(e) => setPais(e.target.value)}
        >
          <option value="">Todos los países</option>
          <option value="Argentina">Argentina</option>
          <option value="España">España</option>
        </select>
      </header>

      {contenido}
    </section>
  );
}