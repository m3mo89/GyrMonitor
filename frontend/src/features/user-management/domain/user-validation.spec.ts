import { describe, expect, it } from 'vitest';

import { minimumPasswordLength, validatePasswordLength, validateRequiredUserFields } from './user-validation';

describe('user-management validation', () => {
  it('requires name, email and password for user creation', () => {
    expect(validateRequiredUserFields('', 'admin@gyrmonitor.local', 'password123')).toBe('Nombre, correo y contrasena son obligatorios.');
    expect(validateRequiredUserFields('Admin', '', 'password123')).toBe('Nombre, correo y contrasena son obligatorios.');
    expect(validateRequiredUserFields('Admin', 'admin@gyrmonitor.local', '')).toBe('Nombre, correo y contrasena son obligatorios.');
    expect(validateRequiredUserFields('Admin', 'admin@gyrmonitor.local', 'password123')).toBeNull();
  });

  it('enforces the client-side minimum password length message', () => {
    expect(minimumPasswordLength).toBe(8);
    expect(validatePasswordLength('short')).toBe('La contrasena debe tener al menos 8 caracteres.');
    expect(validatePasswordLength('12345678')).toBeNull();
  });
});
