import { Contenedor, puedeIngresar } from './contenedor.model';

describe('puedeIngresar', () => {
  const membresia: Contenedor = {
    id: 1,
    tenant_id: 1,
    tenant_nombre: 'Empresa',
    activo: true,
    control: false,
    cliente: true,
    cliente_id: 10,
    fecha_creacion: '2026-11-03T00:00:00',
  };

  it('permite una membresía activa de cliente con cliente_id', () => {
    expect(puedeIngresar(membresia)).toBeTrue();
  });

  it('rechaza una membresía sin cliente_id', () => {
    expect(puedeIngresar({ ...membresia, cliente_id: null })).toBeFalse();
  });

  it('rechaza una membresía que no es de cliente', () => {
    expect(puedeIngresar({ ...membresia, cliente: false })).toBeFalse();
  });

  it('rechaza una membresía inactiva', () => {
    expect(puedeIngresar({ ...membresia, activo: false })).toBeFalse();
  });
});
