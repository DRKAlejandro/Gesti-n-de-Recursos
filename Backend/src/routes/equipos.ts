import { Router } from "express";
import { Equipo, Empleado } from "../models";
import { crearEquipo, listarEquipos, obtenerDatosGeneralesEquipos } from "../services/equipoService";

const router = Router();

// GET /api/equipos - Listado de equipos basado en filtros
router.get("/", async (req, res) => {
    try {
        const filtros = req.query; 
        const equipos = await listarEquipos(filtros);

        res.json({
            success: true,
            data: equipos,
            count: equipos.length,
        });
    } catch (error: any) {
        console.error("Error listando equipos:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            message: error.message,
        });
    }
});

router.get("/stats", async (req, res) => {
    try {
        const datosGenerales = await obtenerDatosGeneralesEquipos();

        res.json({
            success: true,
            data: datosGenerales,
            message: "Estadísticas obtenidas exitosamente",
        });
    } catch (error: any) {
        console.error("Error obteniendo estadísticas de equipos:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            message: error.message,
        });
    }
});


// POST /api/equipos - Crear nuevo equipo
router.post("/", async (req, res) => {
    try {
        const equipoData = req.body;

        const resultado = await crearEquipo(equipoData);

        if (!resultado.success) {
            return res.status(400).json(resultado);
        }

        res.status(201).json(resultado);
    } catch (error: any) {
        console.error("Error creando equipo:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            message: error.message,
        });
    }
});

export default router;
