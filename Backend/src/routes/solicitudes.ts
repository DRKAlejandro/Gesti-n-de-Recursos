import { Router } from 'express';
import {
    crearSolicitud,
    listarSolicitudes,
    obtenerSolicitudPorId,
    getEstadisticasSolicitudes
} from '../services/solicitudService';
import { generarPropuestaOptimaSolicitud } from "../services/solicitudService";

const router = Router();

// POST /api/solicitudes - Crear nueva solicitud
router.post('/', async (req, res) => {
    try {
        const solicitudData = req.body;

        // Validación básica del cuerpo
        if (!solicitudData || Object.keys(solicitudData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Cuerpo vacío',
                message: 'El cuerpo de la solicitud está vacío',
            });
        }

        const resultado = await crearSolicitud(solicitudData);

        if (!resultado.success) {
            const statusCode = resultado.error === 'No encontrado' ? 404 : 400;
            return res.status(statusCode).json(resultado);
        }

        res.status(201).json(resultado);
    } catch (error: any) {
        console.error('Error creando solicitud:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message,
        });
    }
});

// GET /api/solicitudes - Listar todas las solicitudes
router.get('/', async (req, res) => {
    try {
        const { estado, creado_por, page = 1, limit = 10 } = req.query;

        const resultado = await listarSolicitudes({
            estado: estado as string,
            creado_por: creado_por ? parseInt(creado_por as string) : undefined,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
        });

        res.json({
            success: true,
            data: resultado.solicitudes,
            pagination: resultado.pagination,
        });
    } catch (error: any) {
        console.error('Error listando solicitudes:', error);
        
        if (error.message.includes('Estado inválido')) {
            return res.status(400).json({
                success: false,
                error: 'Error de validación',
                message: error.message,
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message,
        });
    }
});

// GET /api/solicitudes/stats - Generar las estadisticas
router.get('/stats', async (req, res) => {
    try {
        const estadisticas = await getEstadisticasSolicitudes();
        
        res.json({
            success: true,
            data: estadisticas,
            message: 'Estadísticas obtenidas correctamente'
        });
    } catch (error: any) {
        console.error('Error al obtener estadísticas de solicitudes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
});

// GET /api/solicitudes/:id - Obtener solicitud específica por ID
router.get('/:id', async (req, res) => {
    try {
        const solicitudId = parseInt(req.params.id);

        // Validar que el ID sea un número válido
        if (isNaN(solicitudId) || solicitudId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido',
                message: 'El ID de la solicitud debe ser un número positivo',
            });
        }

        const resultado = await obtenerSolicitudPorId(solicitudId);

        if (!resultado.success) {
            return res.status(404).json(resultado);
        }

        res.json({
            success: true,
            data: resultado.data,
        });
    } catch (error: any) {
        console.error('Error obteniendo solicitud:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message,
        });
    }
});

// GET /api/solicitudes/:id/propuesta-optima - Generar propuesta óptima
router.get("/:id/propuesta-optima", async (req, res) => {
    try {
        const { id } = req.params;
        const solicitudId = parseInt(id);

        if (isNaN(solicitudId)) {
            return res.status(400).json({
                success: false,
                error: "ID inválido",
                message: "El ID debe ser un número válido"
            });
        }

        const resultado = await generarPropuestaOptimaSolicitud(solicitudId);

        if (!resultado.success) {
            return res.status(404).json(resultado);
        }

        res.json({
            success: true,
            ...resultado.data
        });
    } catch (error: any) {
        console.error("Error generando propuesta óptima:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            message: error.message,
        });
    }
});

export default router;