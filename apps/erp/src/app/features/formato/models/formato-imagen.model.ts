export interface FormatoImagen {
  codigo_formato_imagen_pk: number;
  codigo_formato_fk: number;
  imagen: string;
  posicion_x: number;
  posicion_y: number;
  ancho: number;
  alto: number;
  extension: string;
  visualizar_ultima_pagina: boolean;
}

