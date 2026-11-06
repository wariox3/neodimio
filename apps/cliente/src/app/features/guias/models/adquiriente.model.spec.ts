import { FormBuilder } from '@angular/forms';
import {
  cuerpoAdquirienteNuevo,
  digitoVerificacion,
  validarNit,
  ValoresAdquirienteNuevo,
} from './adquiriente.model';

describe('digitoVerificacion (devuelveDigitoVerificacion de holmio)', () => {
  it('calcula el dígito de la DIAN', () => {
    expect(digitoVerificacion('890903938')).toBe('8');
    expect(digitoVerificacion('900373913')).toBe('4');
    expect(digitoVerificacion('800197268')).toBe('4');
    expect(digitoVerificacion('1036123456')).toBe('5');
  });

  it('devuelve null si el número no es numérico o es muy largo', () => {
    expect(digitoVerificacion('AB123')).toBeNull();
    expect(digitoVerificacion('1234567890123456')).toBeNull();
  });
});

describe('validarNit', () => {
  const grupo = (tipo: string, numero: string) =>
    new FormBuilder().group({ codigo_identificacion_fk: tipo, numero_identificacion: numero });

  it('como terbio, exige 9 dígitos al NIT', () => {
    expect(validarNit(grupo('NI', '900373913'))).toBeNull();
    expect(validarNit(grupo('NI', '90037391'))).toEqual({ nit: true });
    expect(validarNit(grupo('NI', '9003739134'))).toEqual({ nit: true });
    expect(validarNit(grupo('NI', '90037391A'))).toEqual({ nit: true });
  });

  it('no valida la longitud de otros tipos ni un número vacío', () => {
    expect(validarNit(grupo('CC', '123'))).toBeNull();
    expect(validarNit(grupo('NI', ''))).toBeNull();
  });
});

describe('cuerpoAdquirienteNuevo (apiOxigenoNuevo de holmio)', () => {
  const valores: ValoresAdquirienteNuevo = {
    codigo_identificacion_fk: 'NI',
    numero_identificacion: '890903938',
    nombre_corto: 'BANCO SA',
    nombre1: 'ANA',
    nombre2: '',
    apellido1: 'PEREZ',
    apellido2: '',
    telefono: '6044000',
    celular: '3001234567',
    direccion: 'CALLE 1',
    correo: 'facturas@banco.co',
    codigo_ciudad_fk: 5001,
  };
  const ctx = { asesor: 3, condicion: 18, operacion: 'MED' };

  it('lo crea como cliente con los valores generales de la empresa', () => {
    expect(cuerpoAdquirienteNuevo(valores, ctx)).toEqual(
      jasmine.objectContaining({
        digito_verificacion: '8',
        nombre_extendido: 'BANCO SA',
        codigo_tipo_persona_fk: 'J',
        codigo_regimen_fk: 'O',
        nombre2: null,
        apellido2: null,
        codigo_ciudad_fk: 5001,
        codigo_asesor_fk: 3,
        codigo_condicion_fk: 18,
        codigo_operacion_fk: 'MED',
        cliente: true,
        guia_pago_contado: true,
        guia_pago_destino: true,
      }),
    );
  });

  it('asigna persona natural y régimen simplificado a una CC, y nada a otros tipos', () => {
    const cc = cuerpoAdquirienteNuevo({ ...valores, codigo_identificacion_fk: 'CC' }, ctx);
    expect(cc.codigo_tipo_persona_fk).toBe('N');
    expect(cc.codigo_regimen_fk).toBe('S');
    const ce = cuerpoAdquirienteNuevo({ ...valores, codigo_identificacion_fk: 'CE' }, ctx);
    expect(ce.codigo_tipo_persona_fk).toBeNull();
    expect(ce.codigo_regimen_fk).toBeNull();
  });
});
