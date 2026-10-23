export interface Enlace {
  codigo_enlace_pk: number;
  codigo_modelo_fk: number | null;
  codigo_documento: string | null;
  url: string;
  nombre: string;
  usuario: string | null;
  descripcion: string;
  fecha: string;
}
