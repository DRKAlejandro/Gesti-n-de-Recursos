import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipoService, Equipo, FiltrosEquipos, EquipoResponse } from '../../services/equipo';

@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.css']
})
export class Inventario implements OnInit {
  equipos: Equipo[] = [];
  filtros: FiltrosEquipos = {};
  loading = false;
  error = '';

  // Estados disponibles
  estados = [
    { value: 'disponible', label: 'Disponible', color: 'green' },
    { value: 'asignado', label: 'Asignado', color: 'blue' },
    { value: 'mantenimiento', label: 'Mantenimiento', color: 'yellow' },
    { value: 'baja', label: 'Baja', color: 'gray' }
  ];

  // Tipos de equipos comunes
  // Aquí deberían basarse en los de la Base de datos, una tabla de tipos para asegurar mejor el tipo
  // por el diseño realizado se omitira temporalmente y se mantendra esta logica lo mismo con la seccion de estados
  tiposEquipo = [
    'Laptop', 'Desktop', 'Monitor', 'Impresora', 'Tablet',
    'Teléfono', 'Router', 'Switch', 'Servidor', 'UPS', 'Tableta Gráfica', 'Dock'
  ];

  // Paginación
  page = 1;
  pageSize = 10;
  totalEquipos = 0;
  totalPages = 1;

  constructor(private equipoService: EquipoService) { }

  ngOnInit(): void {
    this.cargarEquipos();
  }

  cargarEquipos(): void {
    this.loading = true;
    this.error = '';

    this.equipoService.getEquipos(this.filtros).subscribe({
      next: (response: EquipoResponse) => {
        if (response.success) {
          this.equipos = response.data;
          this.totalEquipos = response.count || response.data.length;
          this.totalPages = Math.ceil(this.totalEquipos / this.pageSize);
        } else {
          this.error = response.message || 'Error al cargar los equipos';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error de conexión con el servidor';
        this.loading = false;
        console.error('Error al cargar equipos:', err);
      }
    });
  }

  aplicarFiltros(): void {
    this.page = 1;
    this.cargarEquipos();
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.page = 1;
    this.cargarEquipos();
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.page = pagina;
      this.cargarEquipos();
    }
  }

  getEstadoColor(estado: string): string {
    const estadoObj = this.estados.find(e => e.value === estado.toLowerCase());
    return estadoObj?.color || 'gray';
  }

  getEstadoLabel(estado: string): string {
    const estadoObj = this.estados.find(e => e.value === estado.toLowerCase());
    return estadoObj?.label || estado;
  }

  get equiposPaginados(): Equipo[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.equipos.slice(startIndex, startIndex + this.pageSize);
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  getPaginasArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
