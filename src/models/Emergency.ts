import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";
import { User } from "./User";

interface Location {
  latitude: number;
  longitude: number;
}

interface Time {
  weekdays: string;
  weekends: string;
}

type Zone = "Este" | "Norte" | "Sur" | "Oeste" | "Central";

type Category =
  | "Bomberos"
  | "Policia"
  | "Hospitales"
  | "SAR Bolivia"
  | "Defensa Civil"
  | "Cruz Roja"
  | "Compañia de Servicios"
  | "Ambulancias"
  | "Farmacias";

interface ProjectEmergency {
  id: string;
  name: string;
  location: Location;
  images: string[];
  offers: string[];
  codArea: string;
  phone: string;
  city: string;
  country: string;
  web: string;
  time: Time;
  zone: Zone;
  categories: Category[];
  isActive: boolean;
  user_id: string;
}

interface ProjectEmergencyCreation extends Optional<ProjectEmergency, "id"> {}

export const Emergency = sequelize.define<
  Model<ProjectEmergency, ProjectEmergencyCreation>
>("emergency", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.JSON,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
  offers: {
    type: DataTypes.ARRAY(DataTypes.STRING),
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
  web: {
    type: DataTypes.STRING,
  },
  time: {
    type: DataTypes.JSON,
  },
  zone: {
    type: DataTypes.ENUM("Este", "Norte", "Sur", "Oeste", "Central"),
    allowNull: false,
    defaultValue: "Central",
  },
  categories: {
    type: DataTypes.ARRAY(
      DataTypes.ENUM(
        "Bomberos",
        "Policia",
        "Hospitales",
        "SAR Bolivia",
        "Defensa Civil",
        "Cruz Roja",
        "Compañia de Servicios",
        "Ambulancias",
        "Farmacias"
      )
    ),
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: "id",
    },
  },
});
