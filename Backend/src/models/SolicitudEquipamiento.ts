import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SolicitudEquipamientoAttributes {
    id: number;
    nombre_solicitud: string;
    estado: 'pendiente' | 'resuelta' | 'rechazada' | 'en_proceso';
    creado_por: number;
    fecha: Date;
    comentarios?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface SolicitudEquipamientoCreationAttributes
    extends Optional<SolicitudEquipamientoAttributes, 'id'> { }

class SolicitudEquipamiento extends Model<
    SolicitudEquipamientoAttributes,
    SolicitudEquipamientoCreationAttributes
> implements SolicitudEquipamientoAttributes {
    public id!: number;
    public nombre_solicitud!: string;
    public estado!: 'pendiente' | 'resuelta' | 'rechazada' | 'en_proceso';
    public creado_por!: number;
    public comentarios!: string;
    public fecha!: Date;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

SolicitudEquipamiento.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre_solicitud: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [3, 200],
            },
        },
        estado: {
            type: DataTypes.ENUM('pendiente', 'resuelta', 'rechazada', 'en_proceso'),
            defaultValue: 'pendiente',
            validate: {
                isIn: [['pendiente', 'resuelta', 'rechazada', 'en_proceso']],
            },
        },
        creado_por: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'empleados',
                key: 'id',
            },
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        comentarios: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'solicitudes_equipamiento',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_solicitud_estado',
                fields: ['estado'],
            },
            {
                name: 'idx_solicitud_fecha',
                fields: ['fecha'],
            },
            {
                name: 'idx_solicitud_creado_por',
                fields: ['creado_por'],
            },
        ],
    }
);

export default SolicitudEquipamiento;