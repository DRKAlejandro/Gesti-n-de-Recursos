import sequelize from '../config/database';

// Importar todos los modelos
import Equipo from './Equipo';
import Empleado from './Empleado';
import Rol from './Rol';
import PerfilRequerimiento from './PerfilRequerimiento';
import SolicitudEquipamiento from './SolicitudEquipamiento';
import DetalleSolicitud from './DetalleSolicitud';
import HistorialAsignacion from './HistorialAsignacion';



Rol.hasMany(PerfilRequerimiento, {
    foreignKey: 'rol_id',
    as: 'requerimientos',
});

PerfilRequerimiento.belongsTo(Rol, {
    foreignKey: 'rol_id',
    as: 'rol',
});

Rol.hasMany(DetalleSolicitud, {
    foreignKey: 'rol_id',
    as: 'detalles_solicitud',
});

DetalleSolicitud.belongsTo(Rol, {
    foreignKey: 'rol_id',
    as: 'rol',
});

SolicitudEquipamiento.hasMany(DetalleSolicitud, {
    foreignKey: 'solicitud_id',
    as: 'detalles',
});

DetalleSolicitud.belongsTo(SolicitudEquipamiento, {
    foreignKey: 'solicitud_id',
    as: 'solicitud',
});

Empleado.hasMany(SolicitudEquipamiento, {
    foreignKey: 'creado_por',
    as: 'solicitudes_creadas',
});

SolicitudEquipamiento.belongsTo(Empleado, {
    foreignKey: 'creado_por',
    as: 'creador',
});

Equipo.hasMany(HistorialAsignacion, {
    foreignKey: 'equipo_id',
    as: 'historial',
});

HistorialAsignacion.belongsTo(Equipo, {
    foreignKey: 'equipo_id',
    as: 'equipo',
});

Empleado.hasMany(HistorialAsignacion, {
    foreignKey: 'empleado_id',
    as: 'historial_asignaciones',
});

HistorialAsignacion.belongsTo(Empleado, {
    foreignKey: 'empleado_id',
    as: 'empleado',
});

export {
    sequelize,
    Equipo,
    Empleado,
    Rol,
    PerfilRequerimiento,
    SolicitudEquipamiento,
    DetalleSolicitud,
    HistorialAsignacion,
};