export interface Formato {
  codigo_formato_pk: number;
  nombre: string;
  titulo: string;
  contenido: string;
  contenido_externo: string;
  etiquetas: string;
  tamano_papel: string;
  orientacion_papel: string;
  tamanio_fuente: string;
  nombre_firma: string;
  cargo_firma: string;
  nombre_firma_otro: string;
  cargo_firma_otro: string;
  nombre_firma_otro_dos: string;
  cargo_firma_otro_dos: string;
  nombre_empresa: boolean;
  nit_empresa: boolean;
  huella: boolean;
  codigo_modelo_fk: string;
  version: string;
  codigo: string;
}

