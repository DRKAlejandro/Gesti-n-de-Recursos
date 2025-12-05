import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipoService, EquipoStats } from '../../services/equipo';
import { SolicitudService, SolicitudStats } from '../../services/solicitud';
import { RolService, Rol } from '../../services/rol';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  estadisticas: EquipoStats | null = null;
  estadisticasSolicitud: SolicitudStats | null = null;
  roles: Rol | null = null;
  loading = false;
  loadingEstadisticas = false;
  loadingSolicitudes = false;
  errorMessage = '';
  errorEstadisticas = '';
  errorSolicitudes = '';
  currentDate = new Date();

  constructor(private equipoService: EquipoService, private solicitudService: SolicitudService,) { }

  ngOnInit(): void {
    this.cargarEstadisticasEquipos();
    this.cargarEstadisticasSolicitudes();
  }

  cargarEstadisticasSolicitudes(): void {
    this.loadingSolicitudes = true;
    this.errorSolicitudes = '';
    this.solicitudService.getEstadisticasSolicitudes().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticasSolicitud = response.data;
        } else {
          this.errorSolicitudes = response.message || 'Error al cargar estadísticas de solicitudes';
        }
        this.loadingSolicitudes = false;
      },
      error: (error) => {
        this.errorSolicitudes = error.message || 'Error de conexión con el servidor';
        this.loadingSolicitudes = false;
        console.error('Error al obtener estadisticas de solicitudes:', error);
      }
    });
  }

  cargarEstadisticasEquipos(): void {
    this.loadingEstadisticas = true;
    this.errorEstadisticas = '';
    this.equipoService.getEstadisticasEquipos().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticas = response.data;
        } else {
          this.errorEstadisticas = response.message || 'Error al cargar estadísticas';
        }
        this.loadingEstadisticas = false;
      },
      error: (error) => {
        this.errorEstadisticas = error.message || 'Error de conexión con el servidor';
        this.loadingEstadisticas = false;
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  get totalEquipos(): number {
    return this.estadisticas?.total_equipos || 0;
  }

  get totalDisponible(): number {
    return this.estadisticas?.total_disponible || 0;
  }

  get totalAsignado(): number {
    return this.estadisticas?.total_asignado || 0;
  }

  get totalMantenimiento(): number {
    return this.estadisticas?.total_mantenimiento || 0;
  }

  get totalBaja(): number {
    return this.estadisticas?.total_baja || 0;
  }

  get porcentajeDisponible(): number {
    return this.estadisticas?.porcentaje_disponible || 0;
  }

  get porcentajeAsignado(): number {
    return this.estadisticas?.porcentaje_asignado || 0;
  }

  get porcentajeMantenimiento(): number {
    return this.estadisticas?.porcentaje_mantenimiento || 0;
  }

  get porcentajeBaja(): number {
    return this.estadisticas?.porcentaje_baja || 0;
  }

  getPorcentaje(estado: string): number {
    switch (estado.toLowerCase()) {
      case 'disponible':
        return this.porcentajeDisponible;
      case 'asignado':
        return this.porcentajeAsignado;
      case 'mantenimiento':
        return this.porcentajeMantenimiento;
      case 'baja':
        return this.porcentajeBaja;
      default:
        return 0;
    }
  }

  getTotal(estado: string): number {
    switch (estado.toLowerCase()) {
      case 'disponible':
        return this.totalDisponible;
      case 'asignado':
        return this.totalAsignado;
      case 'mantenimiento':
        return this.totalMantenimiento;
      case 'baja':
        return this.totalBaja;
      default:
        return 0;
    }
  }

  recargarDatos(): void {
    this.cargarEstadisticasEquipos();
    this.cargarEstadisticasSolicitudes();

  }
}
