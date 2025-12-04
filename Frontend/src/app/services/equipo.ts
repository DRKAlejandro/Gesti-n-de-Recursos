import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

// Interfaces
export interface Equipo {
  id?: number;
  tipo_equipo: string;
  modelo: string;
  numero_serie: string;
  estado: string;
  costo: number;
  rendimiento?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface EquipoResponse {
  success: boolean;
  data: Equipo[];
  count: number;
  message?: string;
}

export interface EquipoSingleResponse {
  success: boolean;
  data: Equipo;
  message?: string;
}

export interface FiltrosEquipos {
  estado?: string;
  modelo?: string;
  numero_serie?: string;
  tipo_equipo?: string;
  costo?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private endpoint = '/api/equipos';

  constructor(private apiService: ApiService) { }

  // Listdao de equipos por filtros
  getEquipos(filtros?: FiltrosEquipos): Observable<EquipoResponse> {
    return this.apiService.get<EquipoResponse>(this.endpoint, filtros);
  }

  // Buscar por ID
  getEquipoById(id: number): Observable<EquipoSingleResponse> {
    return this.apiService.get<EquipoSingleResponse>(`${this.endpoint}/${id}`);
  }

  // Crear un equipo
  crearEquipo(equipo: Equipo): Observable<EquipoSingleResponse> {
    return this.apiService.post<EquipoSingleResponse>(this.endpoint, equipo);
  }

  // Actualizar un equipo existente
  // actualizarEquipo(id: number, equipo: Equipo): Observable<EquipoSingleResponse> {
  //   return this.apiService.put<EquipoSingleResponse>(`${this.endpoint}/${id}`, equipo);
  // }

  // Eliminar un equipo
  // eliminarEquipo(id: number): Observable<EquipoSingleResponse> {
  //   return this.apiService.delete<EquipoSingleResponse>(`${this.endpoint}/${id}`);
  // }


  // Obtener equipos por su estado
  getEquiposPorEstado(estado: string): Observable<EquipoResponse> {
    return this.apiService.get<EquipoResponse>(this.endpoint, { estado });
  }

}
