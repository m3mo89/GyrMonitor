export const minimumPasswordLength = 8;

export function validateRequiredUserFields(name: string, email: string, password: string): string | null {
  return name.trim() && email.trim() && password ? null : 'Nombre, correo y contrasena son obligatorios.';
}

export function validatePasswordLength(password: string): string | null {
  return password.length >= minimumPasswordLength ? null : `La contrasena debe tener al menos ${minimumPasswordLength} caracteres.`;
}
