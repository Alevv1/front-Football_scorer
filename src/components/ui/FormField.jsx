import './FormField.css';

export default function FormField({
  label,
  name,
  as = 'input',
  type = 'text',
  error,
  ayuda,
  required = false,
  children,
  ...resto
}) {
  const Campo = as;
  const idError = error ? `${name}-error` : undefined;
  const idAyuda = ayuda ? `${name}-ayuda` : undefined;

  return (
    <div className={`campo ${error ? 'campo--error' : ''}`}>
      <label className="campo__label" htmlFor={name}>
        {label}
        {required && <span className="campo__requerido" aria-hidden="true"> *</span>}
      </label>

      <Campo
        id={name}
        name={name}
        type={as === 'input' ? type : undefined}
        className="campo__control"
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={[idError, idAyuda].filter(Boolean).join(' ') || undefined}
        {...resto}
      >
        {children}
      </Campo>

      {ayuda && !error && (
        <p id={idAyuda} className="campo__ayuda">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="campo__mensaje-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
