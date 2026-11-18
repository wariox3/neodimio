import { fichaGuia, seguimientoGuia, ultimoPasoCompletado } from './guia.format';
import { GuiaDetalle } from './guia.model';

const guia = (campos: Partial<GuiaDetalle> = {}): GuiaDetalle =>
  ({ codigo_guia_pk: 1, vr_otros: 0, cantidad_despachos: 0, ...campos }) as GuiaDetalle;

const valor = (seccion: { campos: { label: string; valor: unknown }[] }, label: string) =>
  seccion.campos.find((campo) => campo.label === label)?.valor;

describe('fichaGuia', () => {
  it('prefiere el nombre y cae al código', () => {
    const conNombre = guia({ servicio_nombre: 'Paqueteo', codigo_servicio_fk: 'PAQ' });
    expect(valor(fichaGuia(conNombre).informacion, 'Servicio')).toBe('Paqueteo');
    const sinNombre = guia({ servicio_nombre: null, codigo_servicio_fk: 'PAQ' });
    expect(valor(fichaGuia(sinNombre).informacion, 'Servicio')).toBe('PAQ');
  });

  it('arma el trayecto con los nombres de las ciudades', () => {
    const ficha = fichaGuia(guia({ ciudad_origen_nombre: 'Cali', ciudad_destino_nombre: 'Pasto' }));
    expect(valor(ficha.informacion, 'Trayecto')).toBe('Cali → Pasto');
  });

  it('une las partes presentes y deja nulo lo que no tiene ninguna', () => {
    const ficha = fichaGuia(guia({ documento_cliente_tipo: null, documento_cliente: 'FE-1' }));
    expect(valor(ficha.informacion, 'Documento cliente')).toBe('FE-1');
    const vacia = fichaGuia(guia({ documento_cliente_tipo: null, documento_cliente: null }));
    expect(valor(vacia.informacion, 'Documento cliente')).toBeNull();
  });

  it('solo incluye el comentario si existe', () => {
    expect(valor(fichaGuia(guia()).informacion, 'Comentario')).toBeUndefined();
    const conComentario = fichaGuia(guia({ comentario: 'Frágil' }));
    expect(valor(conComentario.informacion, 'Comentario')).toBe('Frágil');
  });

  it('no confunde un valor nulo con cero', () => {
    const { mercancia } = fichaGuia(guia({ vr_flete: null, unidades: null, peso_real: null }));
    expect(valor(mercancia, 'Flete')).toBeNull();
    expect(valor(mercancia, 'Unidades')).toBeNull();
    expect(valor(mercancia, 'Peso real')).toBeNull();
    const conCero = fichaGuia(guia({ vr_flete: 0 }));
    expect(valor(conCero.mercancia, 'Flete')).toBe('$ 0');
  });

  it('muestra pesos y cantidades sin decimales', () => {
    const { mercancia } = fichaGuia(guia({ peso_real: 1234.4, unidades: 2 }));
    expect(valor(mercancia, 'Peso real')).toBe('1.234 kg');
    expect(valor(mercancia, 'Unidades')).toBe('2');
  });

  it('calcula el total sumando flete, manejo y otros', () => {
    const { mercancia } = fichaGuia(guia({ vr_flete: 1000, vr_manejo: 200, vr_otros: 30 }));
    expect(valor(mercancia, 'Total')).toBe('$ 1.230');
  });
});

describe('seguimientoGuia', () => {
  it('cambia el título con el estado', () => {
    expect(seguimientoGuia(guia())[2].titulo).toBe('Pendiente de despacho');
    expect(seguimientoGuia(guia({ estado_despachado: true }))[2].titulo).toBe('Despachada');
  });

  it('informa el despacho y cuántos hubo', () => {
    const uno = guia({ codigo_despacho_fk: 7, cantidad_despachos: 1 });
    expect(seguimientoGuia(uno)[2].detalle).toBe('Despacho 7');
    const varios = guia({ codigo_despacho_fk: 7, cantidad_despachos: 3 });
    expect(seguimientoGuia(varios)[2].detalle).toBe('Despacho 7 · 3 despachos');
  });
});

describe('ultimoPasoCompletado', () => {
  const paso = (completado: boolean) =>
    ({ titulo: '', icono: '', fecha: null, completado }) as ReturnType<typeof seguimientoGuia>[0];

  it('devuelve -1 sin movimientos', () => {
    expect(ultimoPasoCompletado([paso(false), paso(false)])).toBe(-1);
    expect(ultimoPasoCompletado([])).toBe(-1);
  });

  it('devuelve el último cumplido aunque haya huecos', () => {
    expect(ultimoPasoCompletado([paso(false), paso(true), paso(false)])).toBe(1);
    expect(ultimoPasoCompletado([paso(true), paso(false), paso(true)])).toBe(2);
  });
});
