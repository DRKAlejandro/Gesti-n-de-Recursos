import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RolAttributes {
    id: number;
    nombre_rol: string;
    descripcion?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface RolCreationAttributes extends Optional<RolAttributes, 'id'> { }

class Rol extends Model<RolAttributes, RolCreationAttributes>
    implements RolAttributes {
    public id!: number;
    public nombre_rol!: string;
    public descripcion!: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Rol.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre_rol: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [2, 50],
            },
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'roles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default Rol;