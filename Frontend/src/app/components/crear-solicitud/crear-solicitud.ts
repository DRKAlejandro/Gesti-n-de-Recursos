import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService, Solicitud } from '../../services/solicitud';
import { RolService, Rol } from '../../services/rol';

@Component({
  selector: 'app-crear-solicitud',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-solicitud.html',
  styleUrls: ['./crear-solicitud.css']
})
export class CrearSolicitudComponent implements OnInit {
  nombre_solicitud: string = '';
  creado_por: number = 2;
  comentarios: string = '';
  roles: Rol[] = [];
  loadingRoles: boolean = false;
  rolesSeleccionados: Array<{ rol_id: number, cantidad: number }> = [];
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';

  @Output() solicitudCreada = new EventEmitter<void>();

  constructor(
    private solicitudService: SolicitudService,
    private rolService: RolService
  ) { }

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.loadingRoles = true;
    this.rolService.getRoles().subscribe({
      next: (response) => {
        if (response.success) {
          this.roles = response.data;
        } else {
          this.error = response.message || 'Error al cargar los roles';
        }
        this.loadingRoles = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error de conexión';
        this.loadingRoles = false;
        console.error('Error al cargar roles:', err);
      }
    });
  }

  agregarRol(): void {
    this.rolesSeleccionados.push({ rol_id: 0, cantidad: 1 });
  }

  eliminarRol(index: number): void {
    this.rolesSeleccionados.splice(index, 1);
  }

  // Obtener roles disponibles
  getRolesDisponibles(): Rol[] {
    if (this.rolesSeleccionados.length === 0) {
      return this.roles;
    }
    const rolIdsSeleccionados = this.rolesSeleccionados.map(r => r.rol_id);
    return this.roles.filter(rol => !rolIdsSeleccionados.includes(rol.id));
  }

  // Verifica si un rol específico está disponible
  isRolDisponible(rolId: number): boolean {
    if (rolId === 0) return true;
    const rolIdsSeleccionados = this.rolesSeleccionados.map(r => r.rol_id);
    return !rolIdsSeleccionados.includes(rolId);
  }

  getNombreRol(rolId: number): string {
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.nombre_rol : 'Seleccione un rol';
  }

  // Calcular el total de puestos
  getTotalPuestos(): number {
    if (!this.rolesSeleccionados || this.rolesSeleccionados.length === 0) {
      return 0;
    }
    return this.rolesSeleccionados.reduce((total, rol) => total + rol.cantidad, 0);
  }

  validarFormulario(): boolean {
    if (!this.nombre_solicitud.trim()) {
      this.error = 'El nombre de la solicitud es requerido';
      return false;
    }

    if (this.rolesSeleccionados.length === 0) {
      this.error = 'Debe agregar al menos un rol solicitado';
      return false;
    }

    // Verificar roles duplicados
    const rolIds = this.rolesSeleccionados.map(r => r.rol_id);
    const rolIdsUnicos = [...new Set(rolIds)];
    if (rolIds.length !== rolIdsUnicos.length) {
      this.error = 'No puede seleccionar el mismo rol más de una vez';
      return false;
    }

    for (let i = 0; i < this.rolesSeleccionados.length; i++) {
      const rol = this.rolesSeleccionados[i];
      if (rol.rol_id === 0) {
        this.error = `Debe seleccionar un rol para el puesto ${i + 1}`;
        return false;
      }
      if (rol.cantidad < 1) {
        this.error = `La cantidad para el puesto ${i + 1} debe ser al menos 1`;
        return false;
      }
    }

    this.error = '';
    return true;
  }

  crearSolicitud(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.successMessage = '';

    // Crear el objeto de solicitud
    const solicitudData = {
      nombre_solicitud: this.nombre_solicitud,
      creado_por: this.creado_por,
      fecha: new Date().toISOString(),
      roles_solicitados: this.rolesSeleccionados
    };

    if (this.comentarios.trim()) {
      (solicitudData as any).comentarios = this.comentarios;
    }

    this.solicitudService.crearSolicitud(solicitudData as any).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Solicitud creada exitosamente';
          this.limpiarFormulario();
          setTimeout(() => {
            this.solicitudCreada.emit();
          }, 1500);
        } else {
          this.error = response.message || 'Error al crear la solicitud';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error de conexión con el servidor';
        this.loading = false;
        console.error('Error al crear solicitud:', err);
      }
    });
  }

  limpiarFormulario(): void {
    this.nombre_solicitud = '';
    this.comentarios = '';
    this.rolesSeleccionados = [];
  }

  obtenerFechaActual(): string {
    return new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
