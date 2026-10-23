import { Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { BaseHttpService, PaginatedResponse, API_ENDPOINTS } from '../../../core';
import { FormatoImagen } from '../models/formato-imagen.model';

@Injectable({ providedIn: 'root' })
export class FormatoImagenService extends BaseHttpService {
  private readonly _imagenes = signal<FormatoImagen[]>([]);
  readonly imagenes = this._imagenes.asReadonly();

  getImagenes(codigoFormato: number): Observable<FormatoImagen[]> {
    return this.get<PaginatedResponse<FormatoImagen>>(API_ENDPOINTS.formatoImagen.list, {
      formato_id: codigoFormato,
    }).pipe(
      map((res) => res.items),
      tap((imagenes) => this._imagenes.set(imagenes)),
    );
  }

  crearImagen(data: {
    codigo_formato_fk: number;
    posicion_x: number;
    posicion_y: number;
    ancho: number;
    alto: number;
    visualizar_ultima_pagina: boolean;
    imagen: File;
  }): Observable<FormatoImagen> {
    const formData = new FormData();
    formData.append('codigo_formato_fk', String(data.codigo_formato_fk));
    formData.append('posicion_x', String(data.posicion_x));
    formData.append('posicion_y', String(data.posicion_y));
    formData.append('ancho', String(data.ancho));
    formData.append('alto', String(data.alto));
    formData.append('visualizar_ultima_pagina', String(data.visualizar_ultima_pagina));
    formData.append('imagen', data.imagen);

    return this.post<FormatoImagen>(API_ENDPOINTS.formatoImagen.create, formData).pipe(
      tap((imagen) => this._imagenes.update((list) => [...list, imagen])),
    );
  }

  eliminarImagen(formatoImagenId: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.formatoImagen.delete(formatoImagenId));
  }

  actualizarImagen(
    id: number,
    data: {
      posicion_x: number;
      posicion_y: number;
      ancho: number;
      alto: number;
      visualizar_ultima_pagina: boolean;
    },
  ): Observable<FormatoImagen> {
    return this.patch<FormatoImagen>(API_ENDPOINTS.formatoImagen.update(id), data).pipe(
      tap((updated) =>
        this._imagenes.update((list) =>
          list.map((img) => (img.codigo_formato_imagen_pk === id ? updated : img)),
        ),
      ),
    );
  }
}
