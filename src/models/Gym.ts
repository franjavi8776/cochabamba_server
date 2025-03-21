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
  | "Gimnacios"
  | "Calistenia"
  | "Boxeo"
  | "Karate"
  | "Natacion"
  | "MMA"
  | "Futbol"
  | "Otros";

interface ProjectGym {
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

interface ProjectGymCreation extends Optional<ProjectGym, "id"> {}

export const Gym = sequelize.define<Model<ProjectGym, ProjectGymCreation>>(
  "gym",
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
          "Gimnacios",
          "Calistenia",
          "Boxeo",
          "Karate",
          "Natacion",
          "MMA",
          "Futbol",
          "Otros"
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
  }
);
