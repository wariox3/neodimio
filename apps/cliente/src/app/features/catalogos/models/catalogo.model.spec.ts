import { GuiaTipo, opcionesProducto, Tercero, tiposDisponibles } from './catalogo.model';

describe('opcionesProducto', () => {
  it('ofrece VARIOS aunque el tercero no tenga productos', () => {
    expect(opcionesProducto([])).toEqual([{ value: 'VARIOS', label: 'VARIOS' }]);
  });

  it('agrega los productos del tercero después de VARIOS, sin repetirlo', () => {
    const opciones = opcionesProducto([
      { codigo_producto_fk: '5', producto_nombre: 'CAJA' },
      { codigo_producto_fk: 'VARIOS', producto_nombre: 'VARIOS' },
      { codigo_producto_fk: '17', producto_nombre: null },
      { codigo_producto_fk: null, producto_nombre: 'Sin código' },
    ]);

    expect(opciones).toEqual([
      { value: 'VARIOS', label: 'VARIOS' },
      { value: '5', label: 'CAJA' },
      { value: '17', label: '17' },
    ]);
  });
});

const tipo = (codigo: string, codigoPago: string | null): GuiaTipo => ({
  codigo_guia_tipo_pk: codigo,
  nombre: codigo,
  codigo_pago_fk: codigoPago,
  validar_flete: false,
});

const TIPOS = [
  tipo('CREDITO', 'COR'),
  tipo('CONTADO', 'CON'),
  tipo('DESTINO', 'DES'),
  tipo('CORTESIA', 'CTS'),
  tipo('SIN_PAGO', null),
];

const tercero = (permisos: Partial<Tercero>): Tercero => ({
  codigo_tercero_pk: 2,
  codigo_identificacion_fk: 'NI',
  numero_identificacion: '890985122',
  nombre_corto: 'Cliente',
  codigo_operacion_fk: null,
  codigo_condicion_fk: null,
  condicion_codigo_precio_fk: null,
  guia_pago_credito: false,
  guia_pago_contado: false,
  guia_pago_destino: false,
  guia_pago_cortesia: false,
  liquidar_guia_peso: true,
  liquidar_guia_unidad: false,
  ...permisos,
});

const codigos = (tipos: GuiaTipo[]) => tipos.map((t) => t.codigo_guia_tipo_pk);

describe('tiposDisponibles', () => {
  it('con solo crédito deja los tipos corrientes y los que no tienen forma de pago', () => {
    const resultado = tiposDisponibles(TIPOS, tercero({ guia_pago_credito: true }));
    expect(codigos(resultado)).toEqual(['CREDITO', 'SIN_PAGO']);
  });

  it('relaciona cada código de pago con su permiso', () => {
    const permisos: [keyof Tercero, string][] = [
      ['guia_pago_contado', 'CONTADO'],
      ['guia_pago_destino', 'DESTINO'],
      ['guia_pago_cortesia', 'CORTESIA'],
    ];
    for (const [permiso, esperado] of permisos) {
      const resultado = tiposDisponibles(TIPOS, tercero({ [permiso]: true }));
      expect(codigos(resultado)).toEqual([esperado, 'SIN_PAGO']);
    }
  });

  it('trata un permiso nulo como no habilitado', () => {
    const resultado = tiposDisponibles(TIPOS, tercero({ guia_pago_credito: null }));
    expect(codigos(resultado)).toEqual(['SIN_PAGO']);
  });
});
