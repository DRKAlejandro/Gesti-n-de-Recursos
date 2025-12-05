import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService, PropuestaOptima } from '../../services/solicitud';

@Component({
  selector: 'app-propuesta-optima',
  imports: [CommonModule],
  templateUrl: './propuesta-optima.html',
  styleUrls: ['./propuesta-optima.css']
})
export class PropuestaOptimaComponent implements OnInit {
  @Input() solicitudId!: number;
  @Output() cerrar = new EventEmitter<void>();

  propuesta?: PropuestaOptima;
  loading = false;
  error = '';

  constructor(private solicitudService: SolicitudService) { }

  ngOnInit(): void {
    if (this.solicitudId) {
      this.cargarPropuestaOptima();
    }
  }

  cargarPropuestaOptima(): void {
    this.loading = true;
    this.error = '';
    this.propuesta = undefined;

    this.solicitudService.generarPropuestaOptima(this.solicitudId).subscribe({
      next: (response) => {

        if (response.success) {
          this.propuesta = response as any;
        }
        else if (response.data) {
          this.propuesta = response.data;
        }
        else {
          this.error = response.message || 'Error al cargar la propuesta óptima';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error de conexión';
        this.loading = false;
      }
    });
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}
