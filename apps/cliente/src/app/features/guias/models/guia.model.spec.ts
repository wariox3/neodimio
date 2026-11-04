import { Ciudad, Tercero } from '../../catalogos/models/catalogo.model';
import { Destinatario } from '../../destinatarios/models/destinatario.model';
import {
  cuerpoGuiaNueva,
  facturadoAlSalirDelFacturado,
  facturadoAlSalirDelVolumen,
  liquidacionesDisponibles,
  operacionPorDefecto,
  parametrosCondicion,
  parametrosLiquidacion,
  pesoRealPorUnidades,
  pesosAlSalirDelReal,
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
    peso_facturado: 15,
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
      peso_facturado: 15,
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

describe('parametrosCondicion', () => {
  const tercero = { codigo_tercero_pk: 2, condicion_codigo_precio_fk: 10 } as Tercero;

  it('arma la consulta con el tipo y el producto si los hay', () => {
    expect(
      parametrosCondicion(
        { codigo_guia_tipo_fk: 'COR', codigo_ciudad_destino_fk: '478', codigo_producto_fk: '17' },
        tercero,
        '385',
      ),
    ).toEqual({
      codigo_tercero: 2,
      origen: '385',
      destino: '478',
      precio: 10,
      guia_tipo: 'COR',
      producto: '17',
    });
  });

  it('envía null en lugar de cadenas vacías', () => {
    const parametros = parametrosCondicion(
      { codigo_guia_tipo_fk: '', codigo_ciudad_destino_fk: '478', codigo_producto_fk: '' },
      tercero,
      '385',
    );
    expect(parametros?.guia_tipo).toBeNull();
    expect(parametros?.producto).toBeNull();
  });

  it('devuelve null sin destino, origen o lista de precios', () => {
    expect(parametrosCondicion({ codigo_ciudad_destino_fk: null }, tercero, '385')).toBeNull();
    expect(parametrosCondicion({ codigo_ciudad_destino_fk: '478' }, tercero, null)).toBeNull();
    expect(
      parametrosCondicion(
        { codigo_ciudad_destino_fk: '478' },
        { ...tercero, condicion_codigo_precio_fk: null },
        '385',
      ),
    ).toBeNull();
  });
});

describe('pesos de la guía (reglas de terbio)', () => {
  /** FRENITECA a CALI en veloenvios: condición especial de flete. */
  const conMinimos = { peso_minimo: 25, peso_minimo_guia: 25 };
  const sinMinimoGuia = { peso_minimo: 30, peso_minimo_guia: 0 };

  it('al salir de unidades: unidades × peso mínimo, sin bajar del mínimo de la guía', () => {
    expect(pesoRealPorUnidades(2, conMinimos)).toBe(50);
    expect(pesoRealPorUnidades(1, { peso_minimo: 10, peso_minimo_guia: 25 })).toBe(25);
    // Como en terbio: sin peso mínimo el peso real queda en 0.
    expect(pesoRealPorUnidades(3, { peso_minimo: 0, peso_minimo_guia: 0 })).toBe(0);
  });

  it('al salir del peso real: el volumen en 0 lo copia y el facturado respeta el mínimo', () => {
    expect(pesosAlSalirDelReal(10, 0, conMinimos)).toEqual({
      peso_volumen: 10,
      peso_facturado: 25,
    });
    expect(pesosAlSalirDelReal(40, 0, conMinimos)).toEqual({
      peso_volumen: 40,
      peso_facturado: 40,
    });
    expect(pesosAlSalirDelReal(40, 60, conMinimos)).toEqual({
      peso_volumen: 60,
      peso_facturado: 60,
    });
  });

  it('al salir del volumen: solo sube el facturado, nunca lo baja', () => {
    expect(facturadoAlSalirDelVolumen(60, 40, 40, conMinimos)).toBe(60);
    expect(facturadoAlSalirDelVolumen(10, 40, 60, conMinimos)).toBe(60);
    expect(facturadoAlSalirDelVolumen(5, 10, 10, conMinimos)).toBe(25);
  });

  it('al salir del facturado: respeta lo digitado salvo que quede bajo los mínimos', () => {
    expect(facturadoAlSalirDelFacturado(80, 1, 10, conMinimos)).toBe(80);
    expect(facturadoAlSalirDelFacturado(10, 2, 0, sinMinimoGuia)).toBe(60);
    expect(facturadoAlSalirDelFacturado(10, 1, 45, conMinimos)).toBe(45);
    expect(facturadoAlSalirDelFacturado(10, 1, 0, { peso_minimo: 5, peso_minimo_guia: 25 })).toBe(
      25,
    );
  });
});

describe('cuerpoGuiaNueva', () => {
  const tercero = {
    codigo_tercero_pk: 93497,
    nombre_corto: 'FRENITECA SAS',
    codigo_condicion_fk: 3385,
    condicion_codigo_precio_fk: 21,
  } as Tercero;
  const valores = {
    codigo_guia_tipo_fk: 'COR',
    tipo_liquidacion: 'K' as const,
    codigo_tercero_operacion_fk: null,
    documento_cliente: '',
    remitente: '',
    codigo_identificacion_destinatario_fk: 'CC' as const,
    numero_identificacion_destinatario: '123',
    nombre_destinatario: 'Ana',
    direccion_destinatario: 'Calle 1',
    telefono_destinatario: '300',
    codigo_ciudad_destino_fk: '14',
    codigo_producto_fk: 'VARIOS',
    unidades: 1,
    peso_real: 10,
    peso_volumen: 10,
    peso_facturado: 25,
    vr_declara: 0,
    vr_recaudo: 0,
    devolver_documento_cliente: false,
    comentario: '',
  };
  const ctx = {
    tercero,
    operacionIngreso: '11001',
    origen: '1',
    ciudades: [{ codigo_ciudad_pk: '14', codigo_zona_fk: '9' }] as Ciudad[],
    flete: 19468,
    manejo: 1250,
    destinatario: null,
  };

  it('usa el nombre del cliente si no hay remitente y no reliquida', () => {
    const cuerpo = cuerpoGuiaNueva(valores, ctx);
    expect(cuerpo.remitente).toBe('FRENITECA SAS');
    expect(cuerpo.documento_cliente).toBeNull();
    expect(cuerpo.liquidar).toBeFalse();
    expect(cuerpo.condicion).toBe(3385);
    expect(cuerpo.precio).toBe(21);
    expect(cuerpo.zona).toBe('9');
    expect(cuerpo.peso_facturado).toBe(25);
  });

  it('enlaza el destinatario elegido solo si sigue siendo el de la guía', () => {
    const destinatario = {
      codigo_destinatario_pk: 7,
      numero_identificacion: '123',
    } as Destinatario;
    expect(cuerpoGuiaNueva(valores, { ...ctx, destinatario }).codigo_destinatario_fk).toBe(7);
    expect(
      cuerpoGuiaNueva(
        { ...valores, numero_identificacion_destinatario: '999' },
        { ...ctx, destinatario },
      ).codigo_destinatario_fk,
    ).toBeNull();
  });
});
