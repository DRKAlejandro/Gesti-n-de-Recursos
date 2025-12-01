import express from 'express';
import cors from 'cors';
import { sequelize, Equipo, Empleado, Rol, PerfilRequerimiento } from './models';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: errorMessage,
        });
    }
});

// Ver tablas
app.get('/tables', async (req, res) => {
    try {
        const [tables] = await sequelize.query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        );
        res.json({ tables });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({ error: errorMessage });
    }
});

// Sincronizar base de datos
async function syncDatabase() {
    try {
        console.log('Sincronizando base de datos');

        const forceSync = process.env.NODE_ENV === 'development' && process.env.FORCE_SYNC === 'true';

        await sequelize.sync({ force: forceSync });
        console.log('Base de datos sincronizada');

        // Ejecutar seeder en caso de no haber datos
        await seedDatabase();

    } catch (error) {
        console.error('Error sincronizando:', error);
        process.exit(1);
    }
}

// Seeder
async function seedDatabase() {
    try {
        const equipoCount = await Equipo.count();
        if (equipoCount > 0) {
            return;
        }

        

    } catch (error) {
        console.error('Error creando datos: ', error);
    }
}

// Iniciar servidor
async function startServer() {
    await syncDatabase();

    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}


process.on('SIGTERM', async () => {
    console.log('Recibida señal SIGTERM, cerrando servidor...');
    await sequelize.close();
    console.log('Conexión a BD cerrada');
    process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error: Error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('Promesa rechazada no manejada:', reason);
});

// Iniciar aplicación
startServer().catch((error: Error) => {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
});