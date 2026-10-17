export const MINIMO_PASSWORD = 8;

export function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Mismas reglas que @NotBlank + @Email de los DTOs del back.
export function validarEmail(email) {
  if (email.trim() === '') return 'Ingresá tu email';
  if (!esEmailValido(email)) return 'El email no es válido';
  return undefined;
}

export function sinErrores(errores) {
  return Object.values(errores).every((error) => !error);
}
