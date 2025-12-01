import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EmpleadoAttributes {
    id: number;
    nombre_completo: string;
    rol_actual: string;
    email: string;
    activo: boolean;
    created_at?: Date;
    updated_at?: Date;
}

interface EmpleadoCreationAttributes extends Optional<EmpleadoAttributes, 'id'> { }

class Empleado extends Model<EmpleadoAttributes, EmpleadoCreationAttributes>
    implements EmpleadoAttributes {
    public id!: number;
    public nombre_completo!: string;
    public rol_actual!: string;
    public email!: string;
    public activo!: boolean;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Empleado.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre_completo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100],
            },
        },
        rol_actual: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true,
            },
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'empleados',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_empleado_email',
                fields: ['email'],
                unique: true,
            },
        ],
    }
);

export default Empleado;