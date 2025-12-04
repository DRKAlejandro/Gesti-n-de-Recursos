import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipo, EquipoService, FiltrosEquipos } from '../../services/equipo';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  equipos: Equipo[] = [];
  loading = false;
  errorMessage = '';
  filtros: FiltrosEquipos = {};

  constructor(private equipoService: EquipoService) { }

  ngOnInit(): void {
    this.cargarEquipos();
  }

  cargarEquipos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.equipoService.getEquipos(this.filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.equipos = response.data;
        } else {
          this.errorMessage = response.message || 'Error al cargar equipos';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error de conexión con el servidor';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  // Contar equipos por estado
  contarEquiposPorEstado(estado: string): number {
    if (!this.equipos || this.equipos.length === 0) return 0;

    return this.equipos.filter(equipo =>
      equipo.estado?.toLowerCase() === estado.toLowerCase()
    ).length;
  }

  // Calcular porcentaje por estado específico
  calcularPorcentajePorEstado(estado: string): number {
    if (this.equipos.length === 0) return 0;

    const cantidad = this.contarEquiposPorEstado(estado);
    return Math.round((cantidad / this.equipos.length) * 100);
  }

  // Calcular porcentaje de disponibilidad
  calcularPorcentajeDisponibilidad(): number {
    if (this.equipos.length === 0) return 0;

    const disponibles = this.contarEquiposPorEstado('disponible');
    return Math.round((disponibles / this.equipos.length) * 100);
  }
}
