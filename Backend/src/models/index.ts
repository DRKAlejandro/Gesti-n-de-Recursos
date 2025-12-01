import sequelize from '../config/database';

// Importar modelos
import Equipo from './Equipo';
import Empleado from './Empleado';
import Rol from './Rol';
import PerfilRequerimiento from './PerfilRequerimiento';
import SolicitudEquipamiento from './SolicitudEquipamiento';
import DetalleSolicitud from './DetalleSolicitud';
import HistorialAsignacion from './HistorialAsignacion';

// Relaciones
Equipo.belongsTo(Empleado, { foreignKey: 'empleado_id', as: 'empleado' });
Empleado.hasMany(Equipo, { foreignKey: 'empleado_id', as: 'equipos' });

Rol.hasMany(PerfilRequerimiento, {
    foreignKey: 'rol_id',
    as: 'requerimientos'
});
PerfilRequerimiento.belongsTo(Rol, {
    foreignKey: 'rol_id',
    as: 'rol'
});

Rol.hasMany(DetalleSolicitud, {
    foreignKey: 'rol_id',
    as: 'detalles_solicitud'
});
DetalleSolicitud.belongsTo(Rol, {
    foreignKey: 'rol_id',
    as: 'rol'
});

SolicitudEquipamiento.belongsTo(Empleado, {
    foreignKey: 'creado_por',
    as: 'creador'
});
Empleado.hasMany(SolicitudEquipamiento, {
    foreignKey: 'creado_por',
    as: 'solicitudes'
});

SolicitudEquipamiento.hasMany(DetalleSolicitud, {
    foreignKey: 'solicitud_id',
    as: 'detalles'
});
DetalleSolicitud.belongsTo(SolicitudEquipamiento, {
    foreignKey: 'solicitud_id',
    as: 'solicitud'
});

Equipo.hasMany(HistorialAsignacion, {
    foreignKey: 'equipo_id',
    as: 'historial'
});
HistorialAsignacion.belongsTo(Equipo, {
    foreignKey: 'equipo_id',
    as: 'equipo'
});

HistorialAsignacion.belongsTo(Empleado, {
    foreignKey: 'empleado_id',
    as: 'empleado'
});
Empleado.hasMany(HistorialAsignacion, {
    foreignKey: 'empleado_id',
    as: 'historial_asignaciones'
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