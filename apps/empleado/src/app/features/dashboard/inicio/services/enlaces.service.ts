import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHttpService, PaginatedResponse } from '../../../../core';
import { Enlace } from '../models/enlace.model';

@Injectable({ providedIn: 'root' })
export class EnlacesService extends BaseHttpService {
  private readonly BASE = '/gen/enlace';

  getEnlaces(): Observable<Enlace[]> {
    return this.get<PaginatedResponse<Enlace>>(`${this.BASE}/lista-portal`).pipe(
      map((res) => res.items),
    );
  }
}
