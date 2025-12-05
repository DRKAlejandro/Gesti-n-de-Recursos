import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

// Interfaces
export interface DetalleSolicitud {
  id?: number;
  solicitud_id?: number;
  rol_id: number;
  cantidad_puestos: number;
  rol?: {
    nombre_rol: string;
  };
}

export interface DetalleSolicitudResponse {
  success: boolean;
  data: DetalleSolicitud[];
  message?: string;
}
export interface Empleado {
  id: number;
  nombre_completo: string;
  email: string;
}

export interface Solicitud {
  id?: number;
  creado_por: number;
  estado: 'pendiente' | 'resuelta' | 'rechazada' | 'en_proceso';
  comentarios?: string;
  fecha: Date;
  createdAt?: Date;
  updatedAt?: Date;
  creador?: Empleado;
  detalles?: DetalleSolicitud[];
}

export interface SolicitudResponse {
  success: boolean;
  data: Solicitud[];
  message?: string;
}

export interface SolicitudSingleResponse {
  success: boolean;
  data: Solicitud;
  message?: string;
}

export interface SolicitudPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SolicitudListResponse {
  success: boolean;
  data: Solicitud[];
  pagination: SolicitudPagination;
  message?: string;
}

export interface FiltrosSolicitudes {
  estado?: string;
  creado_por?: number;
  page?: number;
  limit?: number;
}

// Interfaces para estadisticas
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

export interface PropuestaOptima {
  success: boolean;  // Agrega esta línea
  solicitud_id: number;
  asignaciones: Array<{
    rol: string;
    puesto: number;
    equipos: Array<{
      equipo_id: number;
      tipo_equipo: string;
      costo: number;
    }>;
    costo_total_puesto: number;
  }>;
  costo_total_estimado: number;
  faltantes: Array<{
    rol: string;
    tipo_equipo: string;
    cantidad_faltante: number;
  }>;
  mensaje: string;
}


export interface PropuestaOptimaResponse {
  success: boolean;
  data: PropuestaOptima;
  message?: string;
}
@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private endpoint = '/api/solicitudes';

  constructor(private apiService: ApiService) { }

  // Listar solicitudes con filtros y paginación
  getSolicitudes(filtros?: FiltrosSolicitudes): Observable<SolicitudListResponse> {
    return this.apiService.get<SolicitudListResponse>(this.endpoint, filtros);
  }

  // Buscar solicitud por ID
  getSolicitudById(id: number): Observable<SolicitudSingleResponse> {
    return this.apiService.get<SolicitudSingleResponse>(`${this.endpoint}/${id}`);
  }

  // Crear una nueva solicitud
  crearSolicitud(solicitud: Solicitud): Observable<SolicitudSingleResponse> {
    return this.apiService.post<SolicitudSingleResponse>(this.endpoint, solicitud);
  }

  // // Actualizar una solicitud existente
  // actualizarSolicitud(id: number, solicitud: Partial<Solicitud>): Observable<SolicitudSingleResponse> {
  //   return this.apiService.put<SolicitudSingleResponse>(`${this.endpoint}/${id}`, solicitud);
  // }

  // // Eliminar una solicitud
  // eliminarSolicitud(id: number): Observable<SolicitudSingleResponse> {
  //   return this.apiService.delete<SolicitudSingleResponse>(`${this.endpoint}/${id}`);
  // }

  // Obtener solicitudes por estado
  getSolicitudesPorEstado(estado: string): Observable<SolicitudListResponse> {
    return this.apiService.get<SolicitudListResponse>(this.endpoint, { estado });
  }

  // Obtener estadísticas de solicitudes
  getEstadisticasSolicitudes(): Observable<SolicitudStatsResponse> {
    return this.apiService.get<SolicitudStatsResponse>(`${this.endpoint}/stats`);
  }


  // Generar propuesta óptima para una solicitud
  generarPropuestaOptima(id: number): Observable<PropuestaOptimaResponse> {
    return this.apiService.get<PropuestaOptimaResponse>(`${this.endpoint}/${id}/propuesta-optima`);
  }

  // Métodos de conveniencia
  getSolicitudesPendientes(): Observable<SolicitudListResponse> {
    return this.getSolicitudesPorEstado('pendiente');
  }
}
