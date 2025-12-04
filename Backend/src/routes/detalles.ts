import { Router } from "express";
import { DetalleSolicitud } from "../models";
import { listarDetalles } from "../services/detalleService";

const router = Router();

// GET /api/detalels - Listado de detalles
router.get("/", async (req, res) => {
    try {
        const detalles = await listarDetalles();

        res.json({
            success: true,
            data: detalles,
            count: detalles.length,
        });
    } catch (error: any) {
        console.error("Error listando detalles:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            message: error.message,
        });
    }
});

export default router;
