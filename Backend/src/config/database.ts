import { Sequelize } from "sequelize";
import path from "path";

const databasePath = path.resolve(__dirname, "..", "..", "database.sqlite");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: databasePath,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

sequelize
    .authenticate()
    .then(() => console.log("Conexión a BD"))
    .catch((err: Error) => console.error("Error de conexión:", err));

export default sequelize;
