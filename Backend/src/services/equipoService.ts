import { Equipo } from '../models';
import { Op } from 'sequelize';

// Interfaz para filtros
export interface FiltrosEquipos {
    estado?: string;
    tipo_equipo?: string;
}

// Interfaz para creación de equipo
export interface EquipoInput {
    tipo_equipo: string;

    modelo: string;
    numero_serie: string;
    estado?: 'disponible' | 'asignado' | 'baja' | 'mantenimiento';
    costo: number;
}

// Interfaz para actualizar (Continuar funcionalidad más adelante en caso de ser necesaria)
export interface EquipoUpdateInput {
    tipo_equipo?: string;
    modelo?: string;
    numero_serie?: string;
    estado?: 'disponible' | 'asignado' | 'baja' | 'mantenimiento';
    costo?: number;
}

// Función para listar equipos con filtros
export async function listarEquipos(filtros: any = {}) {
    try {
        const whereClause: any = {};

        // Validación de estado
        if (filtros.estado) {
            const estadosValidos = ['disponible', 'asignado', 'baja', 'mantenimiento'];
            if (!estadosValidos.includes(filtros.estado)) {
                throw new Error(`Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`);
            }
            whereClause.estado = filtros.estado;
        }

        // Filtro para tipo_equipo
        if (filtros.tipo_equipo) {
            whereClause.tipo_equipo = {
                [Op.like]: `%${filtros.tipo_equipo}%`,
            };
        }

        // Filtros para cualquier otro campo del modelo
        const camposModelo = Object.keys(Equipo.getAttributes());

        for (const key of Object.keys(filtros)) {
            if (["estado", "tipo_equipo"].includes(key)) continue; 

            if (camposModelo.includes(key)) {
                whereClause[key] = {
                    [Op.like]: `%${filtros[key]}%`,
                };
            }
        }

        const equipos = await Equipo.findAll({
            where: whereClause,
            order: [
                ["estado", "ASC"],
                ["tipo_equipo", "ASC"],
                ["created_at", "DESC"],
            ],
        });

        return equipos;

    } catch (error) {
        console.error("Error en listarEquipos:", error);
        throw error;
    }
}


// Función para crear un nuevo equipo
export async function crearEquipo(equipoData: EquipoInput) {
    try {
        const errores: string[] = [];

        // Campos requeridos
        if (!equipoData.tipo_equipo?.trim()) {
            errores.push('El tipo de equipo es requerido');
        }

        if (!equipoData.modelo?.trim()) {
            errores.push('El modelo es requerido');
        }

        if (!equipoData.numero_serie?.trim()) {
            errores.push('El número de serie es requerido');
        }

        if (equipoData.costo === undefined || equipoData.costo === null) {
            errores.push('El costo es requerido');
        } else if (typeof equipoData.costo !== 'number' || equipoData.costo < 0) {
            errores.push('El costo debe ser un número positivo');
        }

        // Validar estado (solo si se proporciona) 
        if (equipoData.estado) {
            const estadosValidos = ['disponible', 'asignado', 'baja', 'mantenimiento'];
            if (!estadosValidos.includes(equipoData.estado)) {
                errores.push(`Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`);
            }
        }

        if (errores.length > 0) {
            return {
                success: false,
                error: 'Error de validación',
                messages: errores,
            };
        }

        // Verificar si el número de serie ya existe
        const equipoExistente = await Equipo.findOne({
            where: { numero_serie: equipoData.numero_serie },
        });

        if (equipoExistente) {
            return { 
                success: false,
                error: 'Conflicto',
                message: `Ya existe un equipo con el número de serie: ${equipoData.numero_serie}`,
            };
        }

        // Crear el equipo
        const nuevoEquipo = await Equipo.create({
            tipo_equipo: equipoData.tipo_equipo.trim(),
            modelo: equipoData.modelo.trim(),
            numero_serie: equipoData.numero_serie.trim(),
            estado: equipoData.estado || 'disponible',
            costo: Number(equipoData.costo.toFixed(2)),
        });

        const equipoCreado = await Equipo.findByPk(nuevoEquipo.id);

        return {
            success: true,
            message: 'Equipo creado exitosamente',
            data: equipoCreado,
        };
    } catch (error: any) {
        console.error('Error en crearEquipo:', error);

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


