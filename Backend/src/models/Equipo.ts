import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EquipoAttributes {
    id: number;
    tipo_equipo: string;
    modelo: string;
    numero_serie: string;
    estado: 'disponible' | 'asignado' | 'baja' | 'mantenimiento';
    costo: number;
    especificaciones: Record<string, any>;
    empleado_id?: number | null;
    created_at?: Date;
    updated_at?: Date;
}

interface EquipoCreationAttributes extends Optional<EquipoAttributes, 'id'> { }

class Equipo extends Model<EquipoAttributes, EquipoCreationAttributes>
    implements EquipoAttributes {
    public id!: number;
    public tipo_equipo!: string;
    public modelo!: string;
    public numero_serie!: string;
    public estado!: 'disponible' | 'asignado' | 'baja' | 'mantenimiento';
    public costo!: number;
    public especificaciones!: Record<string, any>;
    public empleado_id!: number | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Equipo.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tipo_equipo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        modelo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        numero_serie: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [3, 50],
            },
        },
        estado: {
            type: DataTypes.ENUM('disponible', 'asignado', 'baja', 'mantenimiento'),
            defaultValue: 'disponible',
            validate: {
                isIn: [['disponible', 'asignado', 'baja', 'mantenimiento']],
            },
        },
        costo: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0,
                isDecimal: true,
            },
        },
        especificaciones: {
            type: DataTypes.JSON,
            defaultValue: {},
            validate: {
                isObject(value: any) {
                    if (typeof value !== 'object' || Array.isArray(value)) {
                        throw new Error('Las especificaciones deben ser un objeto JSON');
                    }
                },
            },
        },
        empleado_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize,
        tableName: 'equipos',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_equipo_estado',
                fields: ['estado'],
            },
            {
                name: 'idx_equipo_tipo',
                fields: ['tipo_equipo'],
            },
        ],
    }
);

export default Equipo;