import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

// Interfaces
export interface SolicitudStatsResponse {
  success: boolean;
  data: SolicitudStats;
  message?: string;
}

export interface SolicitudStats {
  total_solicitudes: number;
  total_pendiente: number;
  total_en_proceso: number;
  total_resuelta: number;
  total_rechazada: number;
  porcentaje_pendiente: number;
  porcentaje_en_proceso: number;
  porcentaje_resuelta: number;
  porcentaje_rechazada: number;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private endpoint = '/api/solicitudes';

  constructor(private apiService: ApiService) { }

  getEstadisticasSolicitudes(): Observable<SolicitudStatsResponse> {
    return this.apiService.get<SolicitudStatsResponse>(`${this.endpoint}/stats`);
  }
}
