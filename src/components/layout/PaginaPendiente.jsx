import './PaginaPendiente.css';

export default function PaginaPendiente({ titulo, dueno, endpoints = [] }) {
  return (
    <section className="pendiente">
      <h1>{titulo}</h1>
      <p className="pendiente__dueno">
        Pantalla en construcción · <strong>{dueno}</strong>
      </p>
      {endpoints.length > 0 && (
        <>
          <h2 className="pendiente__subtitulo">Endpoints que cubre</h2>
          <ul className="pendiente__endpoints">
            {endpoints.map((endpoint) => (
              <li key={endpoint}>
                <code>{endpoint}</code>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
