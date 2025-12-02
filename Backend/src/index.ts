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

        // Roles
        const roles = await Rol.bulkCreate([
            { nombre_rol: 'Administrador', descripcion: 'Administrador general' },
            { nombre_rol: 'Desarrollador', descripcion: 'Desarrollador de software' },
            { nombre_rol: 'Diseñador', descripcion: 'Diseñador UI/UX' },
            { nombre_rol: 'Gerente', descripcion: 'Gerente de proyecto' },
            { nombre_rol: 'Soporte Técnico', descripcion: 'Soporte TI' },
        ]);

        // Requerimientos
        await PerfilRequerimiento.bulkCreate([
            // Desarrollador
            { rol_id: 1, tipo_equipo: 'Laptop', cantidad_requerida: 1 },
            { rol_id: 1, tipo_equipo: 'Monitor', cantidad_requerida: 2 },
            { rol_id: 1, tipo_equipo: 'Dock', cantidad_requerida: 1 },
            // Diseñador
            { rol_id: 2, tipo_equipo: 'Laptop', cantidad_requerida: 1 },
            { rol_id: 2, tipo_equipo: 'Monitor', cantidad_requerida: 2 },
            { rol_id: 2, tipo_equipo: 'Tableta Gráfica', cantidad_requerida: 1 },
            // Gerente

            
            { rol_id: 3, tipo_equipo: 'Laptop', cantidad_requerida: 1 },
            { rol_id: 3, tipo_equipo: 'Monitor', cantidad_requerida: 1 },
            // Soporte
            { rol_id: 4, tipo_equipo: 'Laptop', cantidad_requerida: 1 },
            { rol_id: 4, tipo_equipo: 'Monitor', cantidad_requerida: 1 },
        ]);

        // Empleados
        await Empleado.bulkCreate([
            {
                nombre_completo: 'Administrador',
                rol_actual: 'Admin',
                email: 'admin@mail.com',
                activo: true,
            },
            {
                nombre_completo: 'Juan Pérez López',
                rol_actual: 'Desarrollador',
                email: 'juan.perez@mail.com',
                activo: true,
            },
            {
                nombre_completo: 'Ana Gómez Rodríguez',
                rol_actual: 'Diseñador',
                email: 'ana.gomez@mail.com',
                activo: true,
            },
        ]);

        // Equipos
        await Equipo.bulkCreate([
            {
                tipo_equipo: 'Laptop',
                modelo: 'Dell XPS 15 9520',
                numero_serie: 'XPS-001-2024',
                estado: 'disponible',
                costo: 24500.00
            },
            {
                tipo_equipo: 'Monitor',
                modelo: 'Dell UltraSharp U2723QE',
                numero_serie: 'MON-001-2024',
                estado: 'disponible',
                costo: 8999.99,
            },
            {
                tipo_equipo: 'Laptop',
                modelo: 'Apple MacBook Pro 14"',
                numero_serie: 'MBP-001-2024',
                estado: 'asignado',
                costo: 42999.00,
            },
            {
                tipo_equipo: 'Tableta Gráfica',
                modelo: 'Wacom Intuos Pro Medium',
                numero_serie: 'WAC-001-2024',
                estado: 'disponible',
                costo: 12499.50
            },
        ]);

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