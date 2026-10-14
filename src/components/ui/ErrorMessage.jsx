import Alert from './Alert';
import Button from './Button';

const TITULOS = {
  0: 'Sin conexión',
  400: 'Datos inválidos',
  401: 'Tenés que iniciar sesión',
  403: 'No tenés permiso para esto',
  404: 'No encontrado',
  409: 'Ya existe',
};

export default function ErrorMessage({ error, onReintentar }) {
  if (!error) return null;

  const status = error.status;
  const titulo = TITULOS[status] ?? 'Algo salió mal';
  const mensaje = error.mensaje ?? error.message ?? 'Probá de nuevo en unos minutos';

  return (
    <Alert tipo="error" titulo={titulo}>
      <p style={{ margin: 0 }}>{mensaje}</p>
      {onReintentar && (
        <Button variante="secundario" tamano="sm" onClick={onReintentar} style={{ marginTop: 'var(--espacio-3)' }}>
          Reintentar
        </Button>
      )}
    </Alert>
  );
}
