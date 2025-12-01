import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface HistorialAsignacionAttributes {
    id: number;
    equipo_id: number;
    empleado_id?: number;
    accion: 'asignado' | 'desasignado' | 'reservado';
    responsable: string;
    comentarios?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface HistorialAsignacionCreationAttributes
    extends Optional<HistorialAsignacionAttributes, 'id'> { }

class HistorialAsignacion extends Model<
    HistorialAsignacionAttributes,
    HistorialAsignacionCreationAttributes
> implements HistorialAsignacionAttributes {
    public id!: number;
    public equipo_id!: number;
    public empleado_id!: number;
    public accion!: 'asignado' | 'desasignado' | 'reservado';
    public responsable!: string;
    public comentarios!: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

HistorialAsignacion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        equipo_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'equipos',
                key: 'id',
            },
        },
        empleado_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'empleados',
                key: 'id',
            },
        },
        accion: {
            type: DataTypes.ENUM('asignado', 'desasignado', 'reservado'),
            allowNull: false,
            validate: {
                isIn: [['asignado', 'desasignado', 'reservado']],
            },
        },
        responsable: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        comentarios: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'historial_asignaciones',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_historial_equipo',
                fields: ['equipo_id'],
            },
            {
                name: 'idx_historial_fecha',
                fields: ['created_at'],
            },
        ],
    }
);

export default HistorialAsignacion;