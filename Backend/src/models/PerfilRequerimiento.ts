import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PerfilRequerimientoAttributes {
    id: number;
    rol_id: number;
    tipo_equipo: string;
    cantidad_requerida: number;
    prioridad: number;
    created_at?: Date;
    updated_at?: Date;
}

interface PerfilRequerimientoCreationAttributes
    extends Optional<PerfilRequerimientoAttributes, "id"> { }

class PerfilRequerimiento
    extends Model<
        PerfilRequerimientoAttributes,
        PerfilRequerimientoCreationAttributes
    >
    implements PerfilRequerimientoAttributes {
    public id!: number;
    public rol_id!: number;
    public tipo_equipo!: string;
    public cantidad_requerida!: number;
    public prioridad!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

PerfilRequerimiento.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        rol_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "roles",
                key: "id",
            },
        },
        tipo_equipo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        cantidad_requerida: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
            },
        },
        prioridad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
                max:100
            },
        },
    },
    {
        sequelize,
        tableName: "perfiles_requerimientos",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            {
                name: "idx_perfil_rol",
                fields: ["rol_id"],
            },
            {
                name: "idx_perfil_tipo_equipo",
                fields: ["tipo_equipo"],
            },
        ],
    }
);

export default PerfilRequerimiento;
