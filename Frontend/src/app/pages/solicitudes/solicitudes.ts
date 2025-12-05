import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService, Solicitud, FiltrosSolicitudes, SolicitudListResponse } from '../../services/solicitud';
import { RolService, Rol, RolResponse } from '../../services/rol';
import { DetailsComponent } from '../../components/details/details';
import { PropuestaOptimaComponent } from '../../components/propuesta-optima/propuesta-optima'; // Asegúrate de tener esta importación
import { CrearSolicitudComponent } from '../../components/crear-solicitud/crear-solicitud';


export interface NuevaSolicitudRequest {
  nombre_solicitud: string;
  creado_por: number;
  fecha: string;
  roles_solicitados: Array<{
    rol_id: number;
    cantidad: number;
  }>;
}
@Component({
  selector: 'app-solicitudes',
  imports: [CommonModule, FormsModule, DetailsComponent, PropuestaOptimaComponent, CrearSolicitudComponent],
  templateUrl: './solicitudes.html',
  styleUrls: ['./solicitudes.css']
})
export class Solicitudes implements OnInit {
  solicitudes: Solicitud[] = [];
  filtros: FiltrosSolicitudes = {};
  loading = false;
  error = '';
  roles: Rol[] = [];
  loadingRoles = false;
  successMessage = '';
  mostrarDetallesModal = false;
  mostrarPropuestaOptima = false;
  solicitudSeleccionadaId: number | null = null;
  mostrarCrearSolicitudModal = false;

  estados = [
    { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
    { value: 'en_proceso', label: 'En Proceso', color: 'blue' },
    { value: 'resuelta', label: 'Resuelta', color: 'green' },
    { value: 'rechazada', label: 'Rechazada', color: 'red' }
  ];

  showModal = false;
  modalTitle = 'Crear Nueva Solicitud';


  constructor(private solicitudService: SolicitudService, private rolService: RolService) { }

  ngOnInit(): void {
    this.cargarSolicitudes();
    this.cargarRoles();
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.error = '';

    this.solicitudService.getSolicitudes(this.filtros).subscribe({
      next: (response: SolicitudListResponse) => {
        if (response.success) {
          this.solicitudes = response.data;
        } else {
          this.error = response.message || 'Error al cargar las solicitudes';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error de conexión con el servidor';
        this.loading = false;
        console.error('Error al cargar solicitudes:', err);
      }
    });
  }

  cargarRoles(): void {
    this.loading = true;
    this.error = '';

    this.rolService.getRoles().subscribe({
      next: (response: RolResponse) => {
        if (response.success) {
          this.roles = response.data;
        } else {
          this.error = response.message || 'Error al cargar los roles';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error de conexión con el servidor';
        this.loading = false;
        console.error('Error al cargar los roles:', err);
      }
    });
  }


  aplicarFiltros(): void {
    this.cargarSolicitudes();
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.cargarSolicitudes();
  }

  getEstadoColor(estado: string): string {
    const estadoObj = this.estados.find(e => e.value === estado.toLowerCase());
    return estadoObj?.color || 'gray';
  }

  getEstadoLabel(estado: string): string {
    const estadoObj = this.estados.find(e => e.value === estado.toLowerCase());
    return estadoObj?.label || estado;
  }

  // Obtener total de puestos solicitados
  getTotalPuestosSolicitados(solicitud: Solicitud): number {
    if (!solicitud.detalles || solicitud.detalles.length === 0) return 0;
    return solicitud.detalles.reduce((total, detalle) => total + detalle.cantidad_puestos, 0);
  }

  // Formatear fecha
  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Obtener total de solicitudes
  get totalSolicitudes(): number {
    return this.solicitudes.length;
  }


  mostrarDetalles(solicitud: Solicitud): void {
    this.solicitudSeleccionadaId = solicitud.id ?? null;
    this.mostrarDetallesModal = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetallesModal = false;
    this.solicitudSeleccionadaId = null;
  }

  generarPropuestaOptima(solicitud: Solicitud): void {
    this.solicitudSeleccionadaId = solicitud.id ?? null;
    this.mostrarPropuestaOptima = true;
  }

  cerrarPropuestaOptima(): void {
    this.mostrarPropuestaOptima = false;
    this.solicitudSeleccionadaId = null;
  }

  mostrarModalCrearSolicitud(): void {
    this.mostrarCrearSolicitudModal = true;
  }

  cerrarModalCrearSolicitud(): void {
    this.mostrarCrearSolicitudModal = false;
    this.cargarSolicitudes();
  }
}
