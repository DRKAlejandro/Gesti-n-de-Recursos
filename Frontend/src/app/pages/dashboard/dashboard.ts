import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipo, EquipoService, FiltrosEquipos } from '../../services/equipo';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})

export class Dashboard {
  equipos: Equipo[] = [];
  loading = false;
  errorMessage = '';
  filtros: FiltrosEquipos = {
    estado: 'disponible',
  };
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
}
