import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

// Interfaces
export interface Rol {
  id: number;
  nombre_rol: string;
  descripcion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RolResponse {
  success: boolean;
  data: Rol[];
  count: number;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RolService {
  private endpoint = '/api/roles';

  constructor(private apiService: ApiService) { }
  // Listdao de equipos por filtros
    getRoles(): Observable<RolResponse> {
      return this.apiService.get<RolResponse>(this.endpoint);
    }
}
