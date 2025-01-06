import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";
import { User } from "./User";
import { Restaurant } from "./Restaurant";
import { Taxi } from "./Taxi";
import { Gym } from "./Gym";
import { Emergency } from "./Emergency";
import { Hotel } from "./Hotel";
import { Supermarket } from "./Supermarket";
import { Tourism } from "./Tourism";
import { MovieTheater } from "./MovieTheater";

interface ProjectComments {
  id: string;
  comments: string;
  stars: number;
  user_id: string;
  restaurant_id: string;
  taxi_id: string;
  gym_id: string;
  emergency_id: string;
  hotel_id: string;
  supermarket_id: string;
  tourism_id: string;
  movieTheater_id: string;
  isAnonymous: boolean;
  user?: { name: string };
}

interface ProjectCommentsCreation extends Optional<ProjectComments, "id"> {}

export const Comment = sequelize.define<
  Model<ProjectComments, ProjectCommentsCreation>
>("comment", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  comments: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stars: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: "id",
    },
    allowNull: true,
  },
  restaurant_id: {
    type: DataTypes.UUID,
    references: {
      model: Restaurant,
      key: "id",
    },
  },
  taxi_id: {
    type: DataTypes.UUID,
    references: {
      model: Taxi,
      key: "id",
    },
  },
  gym_id: {
    type: DataTypes.UUID,
    references: {
      model: Gym,
      key: "id",
    },
  },
  emergency_id: {
    type: DataTypes.UUID,
    references: {
      model: Emergency,
      key: "id",
    },
  },
  hotel_id: {
    type: DataTypes.UUID,
    references: {
      model: Hotel,
      key: "id",
    },
  },
  supermarket_id: {
    type: DataTypes.UUID,
    references: {
      model: Supermarket,
      key: "id",
    },
  },
  tourism_id: {
    type: DataTypes.UUID,
    references: {
      model: Tourism,
      key: "id",
    },
  },
  movieTheater_id: {
    type: DataTypes.UUID,
    references: {
      model: MovieTheater,
      key: "id",
    },
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Indica si el comentario es anónimo
  },
});
