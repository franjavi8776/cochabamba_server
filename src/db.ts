import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const { DB_NAME, DB_USER, DB_PASSWORD, DATABASE_URL } = process.env;

if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DATABASE_URL) {
  throw new Error(
    "Environment variables DB_NAME, DB_USER, and DB_PASSWORD must be defined"
  );
}

//! DEV
// export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
//   host: "localhost",
//   dialect: "postgres",
//   logging: false,
// });

//! PRODUCTION
export const sequelize = new Sequelize(DATABASE_URL, {
  logging: false,
  native: false,
  dialectModule: require("pg"),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
