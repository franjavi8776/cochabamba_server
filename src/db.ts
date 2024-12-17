import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const { DB_NAME, DB_USER, DB_PASSWORD } = process.env;

if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
  throw new Error(
    "Environment variables DB_NAME, DB_USER, and DB_PASSWORD must be defined"
  );
}

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});
