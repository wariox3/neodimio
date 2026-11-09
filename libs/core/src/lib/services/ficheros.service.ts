import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { Fichero } from '../models/fichero.model';

@Injectable({ providedIn: 'root' })
export class FicherosService extends BaseHttpService {
  private readonly FICHEROS_URL = '/doc/fichero/modelo';
  private readonly CARGAR_URL = '/doc/fichero/cargar';
  private readonly DESCARGAR_URL = '/doc/fichero/descargar-url';
  private readonly DESCARGAR_BINARIO_URL = '/doc/fichero/descargar';

  getFicheros(codigoModelo: string, codigo: string): Observable<Fichero[]> {
    return this.get<Fichero[]>(`${this.FICHEROS_URL}/${codigoModelo}/${codigo}`);
  }

  cargarFichero(codigoModelo: string, recordId: number | string, file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.http.post(
      `${this.baseUrl}${this.CARGAR_URL}/${codigoModelo}/${recordId}`,
      formData,
    );
  }

  /** Retorna la URL firmada de descarga. El componente es responsable de abrirla. */
  getDescargarUrl(pk: number): Observable<{ url: string }> {
    return this.get<{ url: string }>(`${this.DESCARGAR_URL}/${pk}`);
  }

  /**
   * Contenido del fichero. El nombre lo pone quien llama: fluor no expone `Content-Disposition`
   * por CORS, así que en producción esa cabecera no se puede leer.
   */
  descargar(pk: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.DESCARGAR_BINARIO_URL}/${pk}`, {
      responseType: 'blob',
    });
  }
}
