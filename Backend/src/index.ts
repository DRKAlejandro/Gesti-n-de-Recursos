import express from "express";
import cors from "cors";
import {
    sequelize,
    Equipo,
    Empleado,
    Rol,
    PerfilRequerimiento,
} from "./models";
import equiposRouter from "./routes/equipos";
import solicitudesRouter from "./routes/solicitudes";
import rolesRouter from "./routes/roles";
import empleadosRouter from "./routes/empleados";
import detallesRouter from "./routes/detalles";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rutas
app.use("/api/equipos", equiposRouter);
app.use("/api/solicitudes", solicitudesRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/empleados", empleadosRouter);
app.use("/api/detalles", detallesRouter);

app.get("/", (req, res) => {
    res.json({
        nombre: "API de Gestión de Recursos TI",
        version: "1.0.0",
        descripcion: "Sistema para gestión y optimización de equipos tecnológicos",
        endpoints: {
            equipos: {
                listar: {
                    method: "GET",
                    url: "/api/equipos",
                    query_params: {
                        estado: "opcional (disponible, asignado, baja, mantenimiento)",
                        tipo_equipo: "opcional (Laptop, Monitor, etc)",
                    },
                },
                crear: {
                    method: "POST",
                    url: "/api/equipos",
                    body_example: {
                        tipo_equipo: "Laptop",
                        modelo: "Dell XPS 15",
                        numero_serie: "XPS-001",
                        costo: 25000.5,
                        estado: "disponible",
                    },
                },
            },
            solicitudes: "Próximamente...",
        },
    });
});


app.get("/health", async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({
            status: "unhealthy",
            database: "disconnected",
            error: errorMessage,
        });
    }
});

// Ver tablas
app.get("/tables", async (req, res) => {
    try {
        const [tables] = await sequelize.query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        );
        res.json({ tables });
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ error: errorMessage });
    }
});

// Sincronizar base de datos
async function syncDatabase() {
    try {
        console.log("Sincronizando base de datos");

        const forceSync =
            process.env.NODE_ENV === "development" &&
            process.env.FORCE_SYNC === "true";

        await sequelize.sync({ force: forceSync });
        console.log("Base de datos sincronizada");

        // Ejecutar seeder en caso de no haber datos
        await seedDatabase();
    } catch (error) {
        console.error("Error sincronizando:", error);
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
            { nombre_rol: "Administrador", descripcion: "Administrador general" },
            { nombre_rol: "Desarrollador", descripcion: "Desarrollador de software" },
            { nombre_rol: "Diseñador", descripcion: "Diseñador UI/UX" },
            { nombre_rol: "Gerente", descripcion: "Gerente de proyecto" },
            { nombre_rol: "Soporte Técnico", descripcion: "Soporte TI" },
        ]);

        // Requerimientos
        await PerfilRequerimiento.bulkCreate([
            // Administrador
            { rol_id: 1, tipo_equipo: "Laptop", cantidad_requerida: 1, prioridad: 100 },
            { rol_id: 1, tipo_equipo: "Monitor", cantidad_requerida: 2, prioridad: 50 },
            // Desarrollador
            { rol_id: 2, tipo_equipo: "Laptop", cantidad_requerida: 1, prioridad: 100 },
            { rol_id: 2, tipo_equipo: "Monitor", cantidad_requerida: 2, prioridad: 70 },
            { rol_id: 2, tipo_equipo: "Dock", cantidad_requerida: 1, prioridad: 50 },
            // Diseñador
            { rol_id: 3, tipo_equipo: "Laptop", cantidad_requerida: 1, prioridad: 100 },
            { rol_id: 3, tipo_equipo: "Monitor", cantidad_requerida: 2, prioridad: 20 },
            { rol_id: 3, tipo_equipo: "Tableta Gráfica", cantidad_requerida: 1, prioridad: 100 },
            // Gerente
            { rol_id: 4, tipo_equipo: "Laptop", cantidad_requerida: 1, prioridad: 100 },
            { rol_id: 4, tipo_equipo: "Monitor", cantidad_requerida: 1, prioridad: 10 },
            // Soporte
            { rol_id: 5, tipo_equipo: "Laptop", cantidad_requerida: 1, prioridad: 50 },
            { rol_id: 5, tipo_equipo: "Monitor", cantidad_requerida: 1, prioridad: 50 },
        ]);

        // Empleados
        await Empleado.bulkCreate([
            {
                nombre_completo: "Administrador",
                rol_actual: "Admin",
                email: "admin@mail.com",
                activo: true,
            },
            {
                nombre_completo: "Juan Pérez López",
                rol_actual: "Desarrollador",
                email: "juan.perez@mail.com",
                activo: true,
            },
            {
                nombre_completo: "Ana Gómez Rodríguez",
                rol_actual: "Diseñador",
                email: "ana.gomez@mail.com",
                activo: true,
            },
            {
                nombre_completo: "Carlos Ruiz Martínez",
                rol_actual: "Gerente",
                email: "carlos.ruiz@mail.com",
                activo: true,
            },
            {
                nombre_completo: "María Torres Sánchez",
                rol_actual: "Soporte Técnico",
                email: "maria.torres@mail.com",
                activo: true,
            },
        ]);

        // Interfaces para los modelos
        interface ModeloData {
            marca: string;
            modelo: string;
            basePrice: number;
        }

        // Arreglos de datos para equipos 
        const laptopModels: ModeloData[] = [
            { marca: "Dell", modelo: "XPS 15", basePrice: 24500 },
            { marca: "Apple", modelo: "MacBook Pro 14", basePrice: 42999 },
            { marca: "Lenovo", modelo: "ThinkPad X1 Carbon", basePrice: 28900 },
            { marca: "HP", modelo: "Spectre x360", basePrice: 31900 },
            { marca: "ASUS", modelo: "ROG Zephyrus G14", basePrice: 32900 },
        ];

        const monitorModels: ModeloData[] = [
            { marca: "Dell", modelo: "UltraSharp U2723QE", basePrice: 8999 },
            { marca: "LG", modelo: "UltraGear 27GP850", basePrice: 7599 },
            { marca: "Samsung", modelo: "Odyssey G7", basePrice: 12999 },
            { marca: "ASUS", modelo: "ProArt PA279CV", basePrice: 11999 },
            { marca: "MSI", modelo: "Optix MAG274QRF", basePrice: 8499 },
        ];

        const tabletModels: ModeloData[] = [
            { marca: "Wacom", modelo: "Intuos Pro Medium", basePrice: 12499 },
            { marca: "Huion", modelo: "Kamvas 22 Plus", basePrice: 8999 },
            { marca: "XP-Pen", modelo: "Artist 24 Pro", basePrice: 11999 },
            { marca: "Wacom", modelo: "Cintiq 16", basePrice: 10999 },
            { marca: "Huion", modelo: "Inspiroy 2 M", basePrice: 2499 },
        ];

        const telefonoModels: ModeloData[] = [
            { marca: "Apple", modelo: "iPhone 15 Pro", basePrice: 27999 },
            { marca: "Samsung", modelo: "Galaxy S24 Ultra", basePrice: 29999 },
            { marca: "Google", modelo: "Pixel 8 Pro", basePrice: 24999 },
            { marca: "Xiaomi", modelo: "14 Pro", basePrice: 18999 },
            { marca: "OnePlus", modelo: "12", basePrice: 21999 },
        ];

        const impresoraModels: ModeloData[] = [
            { marca: "HP", modelo: "LaserJet Pro M404dn", basePrice: 7999 },
            { marca: "Epson", modelo: "EcoTank L3250", basePrice: 5499 },
            { marca: "Brother", modelo: "HL-L2395DW", basePrice: 4899 },
            { marca: "Canon", modelo: "PIXMA G3620", basePrice: 6299 },
            { marca: "Xerox", modelo: "VersaLink C405", basePrice: 11999 },
        ];

        const dockModels: ModeloData[] = [
            { marca: "Dell", modelo: "WD19TBS", basePrice: 4500 },
            { marca: "CalDigit", modelo: "TS4", basePrice: 6999 },
            { marca: "Anker", modelo: "777 Thunderbolt Dock", basePrice: 3799 },
            { marca: "Belkin", modelo: "Thunderbolt 3 Dock Core", basePrice: 4299 },
            { marca: "HP", modelo: "Thunderbolt Dock G2", basePrice: 5199 },
        ];

        // Función para generar equipos con tipos definidos
        async function generarEquipos(
            tipo: string,
            modelos: ModeloData[],
            cantidad: number,
            estados: ('disponible' | 'asignado' | 'baja' | 'mantenimiento')[] = ['disponible', 'asignado']
        ): Promise<any> {
            const equipos = [];

            for (let i = 1; i <= cantidad; i++) {
                const modeloIndex = Math.floor(Math.random() * modelos.length);
                const modeloData = modelos[modeloIndex];
                const estadoIndex = Math.floor(Math.random() * estados.length);
                const estado = estados[estadoIndex];

                // Generar número de serie único
                const numeroSerie = `${modeloData.marca.substring(0, 3).toUpperCase()}-${tipo.substring(0, 3).toUpperCase()}-${i.toString().padStart(3, '0')}-2025`;

                // Variar el precio +/- 10%
                const variacion = (Math.random() * 0.2) - 0.1;
                const costo = modeloData.basePrice * (1 + variacion);

                // Generar rendimiento aleatorio basado en el tipo
                let rendimiento: number;
                switch (tipo) {
                    case 'Laptop':
                        rendimiento = Math.floor(Math.random() * 30) + 70; // 70-100
                        break;
                    case 'Monitor':
                        rendimiento = Math.floor(Math.random() * 40) + 60; // 60-100
                        break;
                    case 'Tableta Gráfica':
                        rendimiento = Math.floor(Math.random() * 50) + 50; // 50-100
                        break;
                    default:
                        rendimiento = Math.floor(Math.random() * 60) + 40; // 40-100
                }

                equipos.push({
                    tipo_equipo: tipo,
                    modelo: `${modeloData.marca} ${modeloData.modelo}`,
                    numero_serie: numeroSerie,
                    estado: estado,
                    costo: parseFloat(costo.toFixed(2)),
                    rendimiento: rendimiento,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }

            return await Equipo.bulkCreate(equipos);
        }

        // Generar 20 de cada tipo
        await generarEquipos('Laptop', laptopModels, 20, ['disponible', 'asignado', 'mantenimiento']);

        await generarEquipos('Monitor', monitorModels, 20, ['disponible', 'asignado', 'baja']);

        await generarEquipos('Tableta Gráfica', tabletModels, 20, ['disponible', 'asignado']);

        await generarEquipos('Teléfono', telefonoModels, 20, ['disponible', 'asignado', 'mantenimiento']);

        await generarEquipos('Impresora', impresoraModels, 20, ['disponible', 'asignado', 'baja']);

        await generarEquipos('Dock', dockModels, 20, ['disponible', 'asignado']);


    } catch (error) {
        console.error("Error creando datos: ", error);
    }
}

// Iniciar servidor
async function startServer() {
    await syncDatabase();

    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}

process.on("SIGTERM", async () => {
    console.log("Recibida señal SIGTERM, cerrando servidor...");
    await sequelize.close();
    console.log("Conexión a BD cerrada");
    process.exit(0);
});

// Manejo de errores no capturados
process.on("uncaughtException", (error: Error) => {
    console.error("Error no capturado:", error);
});

process.on(
    "unhandledRejection",
    (reason: unknown, promise: Promise<unknown>) => {
        console.error("Promesa rechazada no manejada:", reason);
    }
);

// Iniciar aplicación
startServer().catch((error: Error) => {
    console.error("Error al iniciar servidor:", error);
    process.exit(1);
});
