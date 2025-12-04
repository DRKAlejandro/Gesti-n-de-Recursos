import { Router } from "express";
import { Rol } from "../models";
import { listarRoles } from "../services/roleService";

const router = Router();

// GET /api/roles - Listado de roles
router.get("/", async (req, res) => {
    try {
        const roles = await listarRoles();

        res.json({
            success: true,
            data: roles,
            count: roles.length,
        });
    } catch (error: any) {
        console.error("Error listando roles:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            message: error.message,
        });
    }
});

export default router;
