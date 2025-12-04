import { Empleado } from '../models';
import { Op } from 'sequelize';

// Función para listar empleados
export async function listarEmpleados() {
    try {
        const empleados = await Empleado.findAll();

        return empleados;

    } catch (error) {
        console.error("Error en listarEmpleados:", error);
        throw error;
    }
}
