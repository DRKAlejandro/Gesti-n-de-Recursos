import {
    SolicitudEquipamiento,
    DetalleSolicitud,
    Empleado,
    Rol,
    PerfilRequerimiento
} from '../models';
import { generarPropuestaOptima } from './optimizadorService';
import { Sequelize } from 'sequelize';

// Interfaces
export interface SolicitudInput {
    nombre_solicitud: string;
    creado_por: number;
    comentarios?: string;
    roles_solicitados: Array<{
        rol_id: number;
        cantidad: number;
    }>;
}

export interface DetalleSolicitudInput {
    solicitud_id: number;
    rol_id: number;
    cantidad_puestos: number;
}

// Función para crear una nueva solicitud
export async function crearSolicitud(solicitudData: SolicitudInput) {
    try {
        // Validaciones básicas
        const errores: string[] = [];

        if (!solicitudData.nombre_solicitud?.trim()) {
            errores.push('El nombre de la solicitud es requerido');
        } else if (solicitudData.nombre_solicitud.trim().length < 3) {
            errores.push('El nombre de la solicitud debe tener al menos 3 caracteres');
        }

        if (!solicitudData.creado_por) {
            errores.push('El ID del creador es requerido');
        }

        if (!solicitudData.roles_solicitados || solicitudData.roles_solicitados.length === 0) {
            errores.push('Debe incluir al menos un rol solicitado');
        } else {
            // Validar los roles solicitados
            for (let i = 0; i < solicitudData.roles_solicitados.length; i++) {
                const rol = solicitudData.roles_solicitados[i];

                if (!rol.rol_id) {
                    errores.push(`El rol en la posición ${i + 1} no tiene ID`);
                }

                if (!rol.cantidad || rol.cantidad < 1) {
                    errores.push(`La cantidad para el rol en la posición ${i + 1} debe ser al menos 1`);
                } 
            }
        }

        if (errores.length > 0) {
            return {
                success: false,
                error: 'Error de validación',
                messages: errores,
            };
        }

        // Verificar que el usuario que creo la solicitud exista
        const empleado = await Empleado.findByPk(solicitudData.creado_por);
        if (!empleado) {
            return {
                success: false,
                error: 'No encontrado',
                message: `No se encontró el empleado con ID: ${solicitudData.creado_por}`,
            };
        }

        // Verificar que los roles existan
        for (const rolSolicitado of solicitudData.roles_solicitados) {
            const rol = await Rol.findByPk(rolSolicitado.rol_id);
            if (!rol) {
                return {
                    success: false,
                    error: 'No encontrado',
                    message: `No se encontró el rol con ID: ${rolSolicitado.rol_id}`,
                };
            }
        }

        // Crear la solicitud principal
        const nuevaSolicitud = await SolicitudEquipamiento.create({
            nombre_solicitud: solicitudData.nombre_solicitud.trim(),
            creado_por: solicitudData.creado_por,
            comentarios: solicitudData.comentarios ? solicitudData.comentarios.trim() : undefined,
            estado: 'pendiente',
        });

        // Detalles de la solicitud
        const detalles: DetalleSolicitudInput[] = solicitudData.roles_solicitados.map(rol => ({
            solicitud_id: nuevaSolicitud.id,
            rol_id: rol.rol_id,
            cantidad_puestos: rol.cantidad,
        }));

        await DetalleSolicitud.bulkCreate(detalles);

        // Solicitud completa con relaciones
        const solicitudCompleta = await SolicitudEquipamiento.findByPk(nuevaSolicitud.id, {
            include: [
                {
                    model: Empleado,
                    as: 'creador',
                    attributes: ['id', 'nombre_completo', 'email'],
                },
                {
                    model: DetalleSolicitud,
                    as: 'detalles',
                    include: [
                        {
                            model: Rol,
                            as: 'rol',
                            attributes: ['id', 'nombre_rol'],
                        },
                    ],
                },
            ],
        });

        return {
            success: true,
            message: 'Solicitud creada exitosamente',
            data: solicitudCompleta,
        };
    } catch (error: any) {
        console.error('Error en crearSolicitud:', error);

        if (error.name === 'SequelizeValidationError') {
            const errores = error.errors.map((err: any) => err.message);
            return {
                success: false,
                error: 'Error de validación',
                messages: errores,
            };
        }

        return {
            success: false,
            error: 'Error interno',
            message: error.message,
        };
    }
}

// Función para listar todas las solicitudes
export async function listarSolicitudes(filtros: {
    estado?: string;
    creado_por?: number;
    page?: number;
    limit?: number;
} = {}) {
    try {
        const whereClause: any = {};

        // Filtro por estado
        if (filtros.estado) {
            const estadosValidos = ['pendiente', 'resuelta', 'rechazada', 'en_proceso'];
            if (!estadosValidos.includes(filtros.estado)) {
                throw new Error(`Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`);
            }
            whereClause.estado = filtros.estado;
        }

        // Filtro por creador
        if (filtros.creado_por) {
            whereClause.creado_por = filtros.creado_por;
        }

        // Configurar paginación
        const page = filtros.page || 1;
        const limit = filtros.limit || 10;
        const offset = (page - 1) * limit;

        const { count, rows: solicitudes } = await SolicitudEquipamiento.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Empleado,
                    as: 'creador',
                    attributes: ['id', 'nombre_completo', 'email'],
                },
                {
                    model: DetalleSolicitud,
                    as: 'detalles',
                    attributes: ['id', 'rol_id', 'cantidad_puestos'],
                    include: [
                        {
                            model: Rol,
                            as: 'rol',
                            attributes: ['nombre_rol'],
                        },
                    ],
                },
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });

        return {
            solicitudes,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
                hasNextPage: page * limit < count,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        console.error('Error en listarSolicitudes:', error);
        throw error;
    }
}

//  Función para obtener la solicitud por ID
export async function obtenerSolicitudPorId(id: number) {
    try {
        const solicitud = await SolicitudEquipamiento.findByPk(id, {
            include: [
                {
                    model: Empleado,
                    as: 'creador',
                    attributes: ['id', 'nombre_completo', 'email', 'rol_actual', 'activo'],
                },
                {
                    model: DetalleSolicitud,
                    as: 'detalles',
                    include: [
                        {
                            model: Rol,
                            as: 'rol',
                            attributes: ['id', 'nombre_rol'],
                        },
                    ],
                },
            ],
        });

        if (!solicitud) {
            return {
                success: false,
                error: 'No encontrado',
                message: `No se encontró la solicitud con ID: ${id}`,
            };
        }

        return {
            success: true,
            data: solicitud,
        };
    } catch (error: any) {
        console.error('Error en obtenerSolicitudPorId:', error);
        return {
            success: false,
            error: 'Error interno',
            message: error.message,
        };
    }
}

// Función para generar propuesta óptima
export async function generarPropuestaOptimaSolicitud(solicitudId: number) {
    try {
        const propuesta = await generarPropuestaOptima(solicitudId);
        
        return {
            success: true,
            data: propuesta,
        };
    } catch (error: any) {
        console.error('Error generando propuesta óptima:', error);
        
        return {
            success: false,
            error: 'Error al generar propuesta',
            message: error.message,
        };
    }
}

// Función para generar totales
export async function getEstadisticasSolicitudes() {
    try {
        const resultados = await SolicitudEquipamiento.findAll({
            attributes: [
                'estado',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad']
            ],
            group: ['estado'],
            raw: true
        });

        let totalSolicitudes = 0;
        const conteoPorEstado: Record<string, number> = {
            'pendiente': 0,
            'en_proceso': 0,
            'resuelta': 0,
            'rechazada': 0
        };

        resultados.forEach((item: any) => {
            const estado = item.estado;
            const cantidad = parseInt(item.cantidad);
            
            if (conteoPorEstado.hasOwnProperty(estado)) {
                conteoPorEstado[estado] = cantidad;
            }
            totalSolicitudes += cantidad;
        });

        // Calcular porcentajes
        const calcularPorcentaje = (count: number) => {
            return totalSolicitudes > 0 ? (count / totalSolicitudes) * 100 : 0;
        };

        return {
            total_solicitudes: totalSolicitudes,
            total_pendiente: conteoPorEstado.pendiente,
            total_en_proceso: conteoPorEstado['en_proceso'],
            total_resuelta: conteoPorEstado.resuelta,
            total_rechazada: conteoPorEstado.rechazada,
            porcentaje_pendiente: calcularPorcentaje(conteoPorEstado.pendiente),
            porcentaje_en_proceso: calcularPorcentaje(conteoPorEstado['en_proceso']),
            porcentaje_resuelta: calcularPorcentaje(conteoPorEstado.resuelta),
            porcentaje_rechazada: calcularPorcentaje(conteoPorEstado.rechazada),
        };
    } catch (error) {
        console.error('Error en getEstadisticasSolicitudesOptimizado:', error);
        throw error;
    }
}