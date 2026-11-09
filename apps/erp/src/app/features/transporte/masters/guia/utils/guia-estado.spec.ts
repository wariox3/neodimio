import { GuiaDetalle } from '../guia.model';
import { getIndicadoresGuia } from './guia-estado';

describe('getIndicadoresGuia', () => {
  const indicador = (guia: Partial<GuiaDetalle>, label: string) =>
    getIndicadoresGuia(guia as GuiaDetalle).find((i) => i.label === label);

  it('no activa un dato sin confirmar', () => {
    expect(indicador({ mercancia_peligrosa: null }, 'Mercancía peligrosa')?.activo).toBeFalse();
    expect(indicador({ mercancia_peligrosa: true }, 'Mercancía peligrosa')?.activo).toBeTrue();
  });

  it('alerta la novedad solo mientras siga abierta', () => {
    const abierta = { estado_novedad: true, estado_novedad_solucion: false };
    expect(indicador(abierta, 'Novedad')?.alerta).toBeTrue();
    expect(indicador({ ...abierta, estado_novedad_solucion: true }, 'Novedad')?.alerta).toBeFalse();
  });

  it('marca la anulación como alerta', () => {
    expect(indicador({ estado_anulado: true }, 'Anulada')?.alerta).toBeTrue();
  });
});
