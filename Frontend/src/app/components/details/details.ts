import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService, Solicitud } from '../../services/solicitud';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.html',
  styleUrls: ['./details.css']
})
export class DetailsComponent implements OnInit {
  @Input() solicitudId!: number;
  solicitud!: Solicitud;
  loading = false;
  error = '';

  constructor(private solicitudService: SolicitudService) { }

  ngOnInit(): void {
    if (this.solicitudId) {
      this.cargarDetalleSolicitud();
    }
  }

  cargarDetalleSolicitud(): void {
    this.loading = true;
    this.error = '';

    this.solicitudService.getSolicitudById(this.solicitudId).subscribe({
      next: (response) => {
        if (response.success) {
          this.solicitud = response.data;
        } else {
          this.error = response.message || 'Error al cargar los detalles';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error de conexión';
        this.loading = false;
        console.error('Error al cargar detalles:', err);
      }
    });
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalPuestos(): number {
    if (!this.solicitud?.detalles) return 0;
    return this.solicitud.detalles.reduce((total, detalle) => total + (detalle.cantidad_puestos || 0), 0);
  }
}
