import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

interface ProjectUser {
  id: string;
  name: string;
  email: string;
  password: string;
  codArea: string;
  phone: string;
  city: string;
  country: string;
  isAdmin: boolean;
  isActive: boolean;
}

interface ProjectUserCreation extends Optional<ProjectUser, "id"> {}

export const User = sequelize.define<Model<ProjectUser, ProjectUserCreation>>(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
    },
    codArea: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }
);
