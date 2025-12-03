import {
    SolicitudEquipamiento,
    DetalleSolicitud,
    Rol,
    PerfilRequerimiento,
    Equipo,
    Empleado
} from '../models';

// Interfaces 
export interface EquipoAsignado {
    equipo_id: number;
    tipo_equipo: string;
    costo: number;
}

export interface AsignacionPropuesta {
    rol: string;
    puesto: number; 
    equipos: EquipoAsignado[];
    costo_total_puesto: number;
}

export interface Faltante {
    rol: string;
    tipo_equipo: string;
    cantidad_faltante: number;
}

export interface PropuestaOptima {
    solicitud_id: number;
    asignaciones: AsignacionPropuesta[];
    costo_total_estimado: number;
    faltantes: Faltante[];
    mensaje: string;
}

export async function generarPropuestaOptima(solicitudId: number): Promise<PropuestaOptima> {
    let mensaje = '';
    mensaje = 'Pendiente';

    return {
            solicitud_id: 1,
            asignaciones: [],
            costo_total_estimado: 100,
            faltantes: [],
            mensaje
        };

}