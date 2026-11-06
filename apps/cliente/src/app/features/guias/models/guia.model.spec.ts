import { Ciudad, GuiaTipo, Tercero } from '../../catalogos/models/catalogo.model';
import { Destinatario } from '../../destinatarios/models/destinatario.model';
import {
  cuerpoGuiaNueva,
  facturadoAlSalirDelFacturado,
  facturadoAlSalirDelVolumen,
  CondicionEspecialResponse,
  liquidacionesDisponibles,
  liquidarGuia,
  operacionPorDefecto,
  parametrosCondicion,
  pesoRealPorUnidades,
  pesosAlSalirDelReal,
  puedeCambiarAdquiriente,
  tipoIdentificacionGuia,
} from './guia.model';

describe('liquidarGuia (fórmulas de terbio)', () => {
  const condicion = (
    campos: Partial<CondicionEspecialResponse> = {},
  ): CondicionEspecialResponse => ({
    error: false,
    error_mensaje: null,
    condicion_especial_flete: false,
    condicion_especial_manejo: false,
    cobertura: null,
    vr_peso: 0,
    vr_unidad: 0,
    descuento_peso: 0,
    descuento_unidad: 0,
    peso_minimo: 0,
    peso_minimo_guia: 0,
    flete_minimo: 0,
    flete_minimo_guia: 0,
    porcentaje_manejo: 0,
    manejo_minimo_unidad: 0,
    manejo_minimo_guia: 0,
    reexpedicion: false,
    ...campos,
  });
  const valores = { tipo_liquidacion: 'K' as const, unidades: 1, peso_facturado: 10 };

  it('no liquida sin forma de liquidar o sin unidades', () => {
    expect(liquidarGuia({ ...valores, tipo_liquidacion: null }, condicion())).toBeNull();
    expect(liquidarGuia({ ...valores, unidades: 0 }, condicion())).toBeNull();
  });

  it('calcula el manejo con el porcentaje sobre el declarado', () => {
    const c = condicion({ porcentaje_manejo: 5, manejo_minimo_guia: 1250 });
    expect(liquidarGuia({ ...valores, vr_declara: 100000 }, c)?.manejo).toBe(5000);
  });

  it('el manejo no baja de los mínimos por unidad y por guía', () => {
    const conMinimos = { ...valores, unidades: 3, vr_declara: 1000 };
    const porUnidad = condicion({ porcentaje_manejo: 1, manejo_minimo_unidad: 300 });
    expect(liquidarGuia(conMinimos, porUnidad)?.manejo).toBe(900);
    const porGuia = condicion({ porcentaje_manejo: 1, manejo_minimo_guia: 1500 });
    expect(liquidarGuia(conMinimos, porGuia)?.manejo).toBe(1500);
  });

  it('por kilo usa el peso facturado digitado y el descuento por peso', () => {
    const c = condicion({
      vr_peso: 100,
      vr_unidad: 1000,
      descuento_peso: 10,
      descuento_unidad: 50,
    });
    expect(liquidarGuia({ ...valores, peso_facturado: 30 }, c)).toEqual({
      flete: 2700,
      manejo: 0,
      peso_facturado: 30,
    });
  });

  it('por unidad usa las unidades y el descuento por unidad', () => {
    const c = condicion({
      vr_peso: 100,
      vr_unidad: 1000,
      descuento_peso: 50,
      descuento_unidad: 10,
    });
    expect(liquidarGuia({ ...valores, tipo_liquidacion: 'U', unidades: 2 }, c)?.flete).toBe(1800);
  });

  it('el peso facturado sube a los mínimos de la condición', () => {
    const c = condicion({ vr_peso: 100, peso_minimo: 10 });
    expect(liquidarGuia({ ...valores, unidades: 2, peso_facturado: 5 }, c)).toEqual({
      flete: 2000,
      manejo: 0,
      peso_facturado: 20,
    });
  });

  it('aplica el flete mínimo de la guía y no el de la unidad', () => {
    const porUnidad = { ...valores, tipo_liquidacion: 'U' as const, unidades: 2 };
    expect(liquidarGuia(porUnidad, condicion({ vr_unidad: 100, flete_minimo: 500 }))?.flete).toBe(
      200,
    );
    expect(
      liquidarGuia(porUnidad, condicion({ vr_unidad: 100, flete_minimo_guia: 500 }))?.flete,
    ).toBe(500);
  });

  it('redondea como Math.round', () => {
    const c = condicion({ porcentaje_manejo: 100 });
    expect(liquidarGuia({ ...valores, vr_declara: 1250.5 }, c)?.manejo).toBe(1251);
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

  it('invierte el origen y el destino si el usuario lo tiene configurado', () => {
    const parametros = parametrosCondicion(
      { codigo_ciudad_destino_fk: '478' },
      tercero,
      '385',
      true,
    );
    expect(parametros?.origen).toBe('478');
    expect(parametros?.destino).toBe('385');
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
    adquiriente: 93497,
    operacionIngreso: '11001',
    origen: '1',
    ciudades: [{ codigo_ciudad_pk: '14', codigo_zona_fk: '9' }] as Ciudad[],
    flete: 19468,
    manejo: 1250,
    destinatario: null,
    estadoRecogido: true,
    estadoIngreso: true,
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

  it('factura al adquiriente del contexto', () => {
    expect(cuerpoGuiaNueva(valores, ctx).codigo_adquiriente_fk).toBe(93497);
    expect(cuerpoGuiaNueva(valores, { ...ctx, adquiriente: 55 }).codigo_adquiriente_fk).toBe(55);
    expect(cuerpoGuiaNueva(valores, { ...ctx, adquiriente: 55 }).codigo_tercero_fk).toBe(93497);
  });

  it('nace con los estados de la configuración del usuario', () => {
    const cuerpo = cuerpoGuiaNueva(valores, {
      ...ctx,
      estadoRecogido: false,
      estadoIngreso: false,
    });
    expect(cuerpo.estado_recogido).toBeFalse();
    expect(cuerpo.estado_ingreso).toBeFalse();
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

describe('puedeCambiarAdquiriente (lupa de terbio)', () => {
  const credito = { codigo_guia_tipo_pk: 'COR', codigo_pago_fk: 'COR' } as GuiaTipo;
  const contado = { codigo_guia_tipo_pk: 'CON', codigo_pago_fk: 'CON' } as GuiaTipo;

  it('sin permite_cambiar_adquiriente nunca se puede cambiar', () => {
    const permisos = { permite_cambiar_adquiriente: false, bloquear_adquiriente_credito: false };
    expect(puedeCambiarAdquiriente(permisos, contado)).toBeFalse();
  });

  it('con permiso se cambia en cualquier tipo si no se bloquea el crédito', () => {
    const permisos = { permite_cambiar_adquiriente: true, bloquear_adquiriente_credito: false };
    expect(puedeCambiarAdquiriente(permisos, credito)).toBeTrue();
    expect(puedeCambiarAdquiriente(permisos, contado)).toBeTrue();
  });

  it('con bloquear_adquiriente_credito no se cambia en los tipos a crédito', () => {
    const permisos = { permite_cambiar_adquiriente: true, bloquear_adquiriente_credito: true };
    expect(puedeCambiarAdquiriente(permisos, credito)).toBeFalse();
    expect(puedeCambiarAdquiriente(permisos, contado)).toBeTrue();
    expect(puedeCambiarAdquiriente(permisos, undefined)).toBeTrue();
  });
});
