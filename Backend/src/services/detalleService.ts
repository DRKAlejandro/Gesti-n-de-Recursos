import { DetalleSolicitud } from '../models';
import { Op } from 'sequelize';

// Función para listar dealles
export async function listarDetalles() {
    try {
        const dealles = await DetalleSolicitud.findAll();

        return dealles;

    } catch (error) {
        console.error("Error en listarDetalleSolicitud:", error);
        throw error;
    }
}
