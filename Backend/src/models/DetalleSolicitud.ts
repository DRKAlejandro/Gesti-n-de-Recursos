import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DetalleSolicitudAttributes {
    id: number;
    solicitud_id: number;
    rol_id: number;
    cantidad_puestos: number;
    created_at?: Date;
    updated_at?: Date;
}

interface DetalleSolicitudCreationAttributes
    extends Optional<DetalleSolicitudAttributes, 'id'> { }

class DetalleSolicitud extends Model<
    DetalleSolicitudAttributes,
    DetalleSolicitudCreationAttributes
> implements DetalleSolicitudAttributes {
    public id!: number;
    public solicitud_id!: number;
    public rol_id!: number;
    public cantidad_puestos!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

DetalleSolicitud.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        solicitud_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'solicitudes_equipamiento',
                key: 'id',
            },
        },
        rol_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id',
            },
        },
        cantidad_puestos: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
                max: 50,
            },
        },
    },
    {
        sequelize,
        tableName: 'detalles_solicitud',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_detalle_solicitud',
                fields: ['solicitud_id'],
            },
            {
                name: 'idx_detalle_rol',
                fields: ['rol_id'],
            },
        ],
    }
);

export default DetalleSolicitud;