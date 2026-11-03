import { Ciudad, Tercero } from '../../catalogos/models/catalogo.model';
import {
  liquidacionesDisponibles,
  operacionPorDefecto,
  parametrosLiquidacion,
  tipoIdentificacionGuia,
} from './guia.model';

describe('parametrosLiquidacion', () => {
  const tercero = {
    codigo_tercero_pk: 2,
    codigo_condicion_fk: 18,
    condicion_codigo_precio_fk: 10,
  } as Tercero;
  const ciudades = [
    {
      codigo_ciudad_pk: '478',
      nombre: 'RIONEGRO',
      departamento_nombre: null,
      codigo_zona_fk: 'ORI2',
    },
  ] as Ciudad[];
  const valores = {
    codigo_ciudad_destino_fk: '478',
    codigo_producto_fk: '17',
    tipo_liquidacion: 'U' as const,
    unidades: 1,
    peso_real: 15,
    peso_volumen: 0,
    vr_declara: 1000,
  };

  it('arma la consulta con el tercero, el origen y la zona del destino', () => {
    expect(parametrosLiquidacion(valores, tercero, '385', ciudades)).toEqual({
      tercero: 2,
      condicion: 18,
      precio: 10,
      origen: '385',
      destino: '478',
      producto: '17',
      zona: 'ORI2',
      tipo_liquidacion: 'U',
      unidades: 1,
      peso: 15,
      volumen: 0,
      declarado: 1000,
    });
  });

  it('no liquida si falta un dato indispensable', () => {
    expect(parametrosLiquidacion(valores, null, '385', ciudades)).toBeNull();
    expect(parametrosLiquidacion(valores, tercero, null, ciudades)).toBeNull();
    expect(
      parametrosLiquidacion(valores, { ...tercero, condicion_codigo_precio_fk: null }, '385', []),
    ).toBeNull();
    expect(
      parametrosLiquidacion({ ...valores, codigo_ciudad_destino_fk: null }, tercero, '385', []),
    ).toBeNull();
    expect(parametrosLiquidacion({ ...valores, unidades: 0 }, tercero, '385', [])).toBeNull();
  });
});

describe('tipoIdentificacionGuia', () => {
  it('conserva CC y NI', () => {
    expect(tipoIdentificacionGuia('CC')).toBe('CC');
    expect(tipoIdentificacionGuia('NI')).toBe('NI');
  });

  it('no asume un tipo cuando es otro o no viene', () => {
    expect(tipoIdentificacionGuia('CE')).toBeNull();
    expect(tipoIdentificacionGuia(null)).toBeNull();
  });
});

describe('operacionPorDefecto', () => {
  const operaciones = [
    { value: 5, label: 'Bodega' },
    { value: 8, label: 'Planta' },
  ];

  it('usa la operación configurada si es del cliente', () => {
    expect(operacionPorDefecto(operaciones, 8)).toBe(8);
  });

  it('no selecciona nada si no es del cliente o no hay una configurada', () => {
    expect(operacionPorDefecto(operaciones, 99)).toBeNull();
    expect(operacionPorDefecto(operaciones, null)).toBeNull();
  });
});

const valores = (peso: boolean | null, unidad: boolean | null) =>
  liquidacionesDisponibles({
    liquidar_guia_peso: peso,
    liquidar_guia_unidad: unidad,
  } as Tercero).map((o) => o.value);

describe('liquidacionesDisponibles', () => {
  it('ofrece solo las formas de liquidar habilitadas', () => {
    expect(valores(true, false)).toEqual(['K']);
    expect(valores(false, true)).toEqual(['U']);
  });

  it('ofrece primero kilo cuando tiene las dos', () => {
    expect(valores(true, true)).toEqual(['K', 'U']);
  });

  it('no ofrece ninguna si no tiene permisos', () => {
    expect(valores(false, false)).toEqual([]);
    expect(valores(null, null)).toEqual([]);
  });
});
