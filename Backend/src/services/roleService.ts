import { Rol } from '../models';
import { Op } from 'sequelize';

// Función para listar roles
export async function listarRoles() {
    try {
        const roles = await Rol.findAll();

        return roles;

    } catch (error) {
        console.error("Error en listarEquipos:", error);
        throw error;
    }
}
