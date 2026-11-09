import { Guia, GuiaDetalle } from '../guia.model';
import { getEstadoGuia, tieneNovedadAbierta } from './guia-estado';

describe('getEstadoGuia', () => {
  const guia = (campos: Partial<Guia> = {}): Guia => campos as Guia;

  it('muestra el estado más avanzado aunque los anteriores sigan marcados', () => {
    expect(getEstadoGuia(guia({ estado_ingreso: true, estado_despachado: true })).label).toBe(
      'Despachada',
    );
    expect(getEstadoGuia(guia({ estado_entregado: true, estado_cumplido: true })).label).toBe(
      'Cumplida',
    );
  });

  it('sin ningún estado queda pendiente', () => {
    expect(getEstadoGuia(guia()).label).toBe('Pendiente');
  });

  it('una guía anulada del detalle prevalece sobre su avance', () => {
    const anulada = { estado_entregado: true, estado_anulado: true } as GuiaDetalle;
    expect(getEstadoGuia(anulada)).toEqual({ label: 'Anulada', severity: 'danger' });
  });
});

describe('tieneNovedadAbierta', () => {
  it('solo cuenta las novedades sin solucionar', () => {
    const conNovedad = { estado_novedad: true, estado_novedad_solucion: false } as Guia;
    expect(tieneNovedadAbierta(conNovedad)).toBeTrue();
    expect(tieneNovedadAbierta({ ...conNovedad, estado_novedad_solucion: true })).toBeFalse();
  });
});
