import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("Environment variable DATABASE_URL must be defined");
}

//! PRODUCTION
export const sequelize = new Sequelize(DATABASE_URL, {
  logging: false,
  native: false,
  dialectModule: require("pg"),
  dialectOptions: {
    ssl: {
      require: true, // Indicar que se requiere SSL
      rejectUnauthorized: false, // Para evitar errores en desarrollo (NO recomendado en producción)
    },
  },
});
