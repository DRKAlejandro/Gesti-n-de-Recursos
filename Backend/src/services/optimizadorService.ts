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
    let mensaje = 'Pendiente';
    
    try {
        // Verificar que la solicitud existe
        const solicitud = await SolicitudEquipamiento.findByPk(solicitudId);
        
        if (!solicitud) {
            mensaje = `Solicitud con ID ${solicitudId} no encontrada`;
            return {
                solicitud_id: solicitudId,
                asignaciones: [],
                costo_total_estimado: 0,
                faltantes: [],
                mensaje
            };
        }
        
        // Obtener los detalles de la solicitud (roles y cantidades)
        const detallesSolicitud = await DetalleSolicitud.findAll({
            where: {
                solicitud_id: solicitudId
            },
            include: [
                {
                    model: Rol,
                    as: 'rol',
                    attributes: ['id', 'nombre_rol']
                }
            ],
            order: [['id', 'ASC']]
        });
        
        if (detallesSolicitud.length === 0) {
            mensaje = `La solicitud ${solicitudId} no tiene detalles (roles y cantidades) definidos`;            
            return {
                solicitud_id: solicitudId,
                asignaciones: [],
                costo_total_estimado: 0,
                faltantes: [],
                mensaje
            };
        }
        
        const inventarioDisponible = await Equipo.findAll({
            where: {
                estado: 'disponible'
            },
            order: [
                ['tipo_equipo', 'ASC'],
                ['costo', 'ASC'] 
            ]
        });
        
        const faltantes: Faltante[] = [];

        return {
            solicitud_id: solicitudId,
            asignaciones: [], 
            costo_total_estimado: 0, 
            faltantes,
            mensaje
        };
        
    } catch (error) {
        console.error('Error al generar propuesta óptima:', error);
        mensaje = `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        
        return {
            solicitud_id: solicitudId,
            asignaciones: [],
            costo_total_estimado: 0,
            faltantes: [],
            mensaje
        };
    }
}0