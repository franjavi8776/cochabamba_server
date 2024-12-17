import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";
import { User } from "./User";
import { Restaurant } from "./Restaurant";

interface ProjectComments {
  id: string;
  comments: string;
  stars: number;
  user_id: string;
  restaurant_id: string;
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
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Indica si el comentario es anónimo
  },
});
