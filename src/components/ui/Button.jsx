import './Button.css';

export default function Button({
  variante = 'primario',
  tamano = 'md',
  bloque = false,
  cargando = false,
  type = 'button',
  disabled,
  className = '',
  children,
  ...resto
}) {
  const clases = [
    'boton',
    `boton--${variante}`,
    `boton--${tamano}`,
    bloque && 'boton--bloque',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={clases} disabled={disabled || cargando} aria-busy={cargando} {...resto}>
      {cargando && <span className="boton__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
