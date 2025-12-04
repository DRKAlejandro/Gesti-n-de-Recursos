import { Router } from "express";
import { Empleado } from "../models";
import { listarEmpleados } from "../services/empleadoService";

const router = Router();

// GET /api/empleados - Listado de empleados
router.get("/", async (req, res) => {
    try {
        const empleados = await listarEmpleados();

        res.json({
            success: true,
            data: empleados,
            count: empleados.length,
        });
    } catch (error: any) {
        console.error("Error listando empleados:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            message: error.message,
        });
    }
});

export default router;
