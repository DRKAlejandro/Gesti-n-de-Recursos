import {
    SolicitudEquipamiento,
    DetalleSolicitud,
    Rol,
    PerfilRequerimiento,
    Equipo,
    Empleado
} from '../models';

// Interfaces 
export interface EquipoAsignado {
    equipo_id: number;
    tipo_equipo: string;
    costo: number;
}

export interface AsignacionPropuesta {
    rol: string;
    puesto: number; 
    equipos: EquipoAsignado[];
    costo_total_puesto: number;
}

export interface Faltante {
    rol: string;
    tipo_equipo: string;
    cantidad_faltante: number;
}

export interface PropuestaOptima {
    solicitud_id: number;
    asignaciones: AsignacionPropuesta[];
    costo_total_estimado: number;
    faltantes: Faltante[];
    mensaje: string;
}

export async function generarPropuestaOptima(solicitudId: number): Promise<PropuestaOptima> {
    let mensaje = 'Pendiente';
    
    try {
        // Verificar que la solicitud existe
        const solicitud = await SolicitudEquipamiento.findByPk(solicitudId);
        
        if (!solicitud) {
            mensaje = `Solicitud con ID ${solicitudId} no encontrada`;
            return {
                solicitud_id: solicitudId,
                asignaciones: [],
                costo_total_estimado: 0,
                faltantes: [],
                mensaje
            };
        }
        
        // Obtene los detalles de la solicitud (roles y cantidades)
        const detallesSolicitud = await DetalleSolicitud.findAll({
            where: {
                solicitud_id: solicitudId
            },
            include: [
                {
                    model: Rol,
                    as: 'rol',
                    attributes: ['id', 'nombre_rol']
                }
            ],
            order: [['id', 'ASC']]
        });
        
        if (detallesSolicitud.length === 0) {
            mensaje = `La solicitud ${solicitudId} no tiene detalles (roles y cantidades) definidos`;            
            return {
                solicitud_id: solicitudId,
                asignaciones: [],
                costo_total_estimado: 0,
                faltantes: [],
                mensaje
            };
        }
        
        // Obtener inventario disponible
        const inventarioDisponible = await Equipo.findAll({
            where: {
                estado: 'disponible'
            },
            order: [
                ['tipo_equipo', 'ASC'],
                ['costo', 'ASC'] 
            ]
        });
        
        
        // Calcular costos promedios por tipo de equipo
        const costosPromedio = calcularCostosPromedio(inventarioDisponible);       
        
        const asignaciones: AsignacionPropuesta[] = [];
        const faltantes: Faltante[] = [];

        //  Detalle de cada en la solicitud
        for (const detalle of detallesSolicitud) {
            const rolId = detalle.rol_id;
            const rolNombre = (detalle as any).rol?.nombre_rol || `Rol ${rolId}`;
            const cantidadPuestos = detalle.cantidad_puestos;
                        
            // Obtener requerimientos del perfil para este rol
            const requerimientos = await PerfilRequerimiento.findAll({
                where: {
                    rol_id: rolId
                },
                order: [['prioridad', 'DESC']] // Prioridad alta primero
            });
            
            // Para cada puesto de este rol
            for (let puestoNum = 1; puestoNum <= cantidadPuestos; puestoNum++) {
                const equiposPuesto: EquipoAsignado[] = [];
                let costoTotalPuesto = 0;
                
                // Para cada tipo de equipo requerido para este rol
                for (const req of requerimientos) {
                    const tipoEquipo = req.tipo_equipo;
                    const cantidadRequerida = req.cantidad_requerida;
                    const prioridad = req.prioridad;
                                        
                    // Buscar equipos disponibles de este tipo
                    const equiposTipoDisponibles = inventarioDisponible.filter(
                        equipo => equipo.tipo_equipo === tipoEquipo
                    );
                    
                    if (equiposTipoDisponibles.length === 0) {
                        // No hay equipos de este tipo disponibles
                        const faltanteExistente = faltantes.find(
                            f => f.rol === rolNombre && f.tipo_equipo === tipoEquipo
                        );
                        
                        if (faltanteExistente) {
                            faltanteExistente.cantidad_faltante += cantidadRequerida;
                        } else {
                            faltantes.push({
                                rol: rolNombre,
                                tipo_equipo: tipoEquipo,
                                cantidad_faltante: cantidadRequerida
                            });
                        }
                        continue;
                    }
                    
                    // Calcular score para cada equipo disponible de este tipo
                    const equiposConScore = equiposTipoDisponibles.map(equipo => {
                        const score = calcularScoreAsignacion(
                            prioridad,
                            equipo.rendimiento,
                            equipo.costo,
                            costosPromedio[tipoEquipo] || equipo.costo,
                            0.3 // lambda
                        );
                        return { equipo, score };
                    });
                    
                    // Ordenar por score descendente 
                    equiposConScore.sort((a, b) => b.score - a.score);
                    
                    // Tomar los mejores equipos según cantidad requerida
                    const equiposSeleccionados = equiposConScore
                        .slice(0, cantidadRequerida)
                        .map(item => item.equipo);
                    
                    // Si no hay suficientes equipos, registrar faltante
                    if (equiposSeleccionados.length < cantidadRequerida) {
                        const faltanteCantidad = cantidadRequerida - equiposSeleccionados.length;
                        
                        const faltanteExistente = faltantes.find(
                            f => f.rol === rolNombre && f.tipo_equipo === tipoEquipo
                        );
                        
                        if (faltanteExistente) {
                            faltanteExistente.cantidad_faltante += faltanteCantidad;
                        } else {
                            faltantes.push({
                                rol: rolNombre,
                                tipo_equipo: tipoEquipo,
                                cantidad_faltante: faltanteCantidad
                            });
                        }
                    }
                    
                    // Agregar equipos seleccionados al puesto
                    for (const equipo of equiposSeleccionados) {
                        equiposPuesto.push({
                            equipo_id: equipo.id,
                            tipo_equipo: equipo.tipo_equipo,
                            costo: equipo.costo
                        });
                        
                        costoTotalPuesto += equipo.costo;
                        
                        // Remover del inventario disponible
                        const index = inventarioDisponible.findIndex(e => e.id === equipo.id);
                        if (index !== -1) {
                            inventarioDisponible.splice(index, 1);
                        }
                        
                    }
                }
                
                // Agregar asignación del puesto
                asignaciones.push({
                    rol: rolNombre,
                    puesto: puestoNum,
                    equipos: equiposPuesto,
                    costo_total_puesto: costoTotalPuesto
                });
            }
        }
        
        // Calcular costo total estimado
        const costoTotalEstimado = asignaciones.reduce(
            (total, asignacion) => total + asignacion.costo_total_puesto, 0
        );
        
        // Mensaje final
        if (faltantes.length === 0) {
            mensaje = 'Propuesta generada exitosamente. Todos los requerimientos pueden ser satisfechos.';
        } else {
            mensaje = `Propuesta generada con ${faltantes.length} tipo(s) de equipo faltante(s).`;
        }
        
        return {
            solicitud_id: solicitudId,
            asignaciones,
            costo_total_estimado: costoTotalEstimado,
            faltantes,
            mensaje
        };
        
    } catch (error) {
        mensaje = `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        
        return {
            solicitud_id: solicitudId,
            asignaciones: [],
            costo_total_estimado: 0,
            faltantes: [],
            mensaje
        };
    }
}

// Aqui se calcula el promedio por tipo de equipo
function calcularCostosPromedio(equipos: Equipo[]): Record<string, number> {
    const costosPorTipo: Record<string, { total: number, count: number }> = {};
    
    for (const equipo of equipos) {
        const tipo = equipo.tipo_equipo;
        if (!costosPorTipo[tipo]) {
            costosPorTipo[tipo] = { total: 0, count: 0 };
        }
        costosPorTipo[tipo].total += equipo.costo;
        costosPorTipo[tipo].count++;
    }
    
    const promedios: Record<string, number> = {};
    for (const [tipo, datos] of Object.entries(costosPorTipo)) {
        promedios[tipo] = datos.total / datos.count;
    }
    
    return promedios;
}

// Función para calcular el score de asignación (prioridad × rendimiento - costo penalizado)
function calcularScoreAsignacion(
    prioridad: number,          // 0-100 de PerfilRequerimiento
    rendimiento: number,        // 0-100 de Equipo
    costo: number,              // de Equipo
    costoPromedioTipo: number,  // promedio calculado
    lambda: number = 0.3        // factor de peso del costo (0-1)
): number {

    // Normalizar valores
    const factorNecesidad = prioridad / 100;
    const factorCalidad = rendimiento / 100;
    
    // Satisfacción = necesidad × calidad
    const satisfaccion = factorNecesidad * factorCalidad;
    
    // Penalización por costo (ajustada por necesidad)
    // Si es muy necesario (prioridad alta), penalizamos menos el costo
    const costoNormalizado = costo / costoPromedioTipo;
    const penalizacionCosto = lambda * costoNormalizado * (1 - factorNecesidad);
    
    return satisfaccion - penalizacionCosto;
}