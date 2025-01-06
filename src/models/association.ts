import { User } from "./User";
import { Restaurant } from "./Restaurant";
import { Comment } from "./Comment";
import { MovieTheater } from "./MovieTheater";
import { Hotel } from "./Hotel";
import { Taxi } from "./Taxi";
import { Supermarket } from "./Supermarket";
import { Tourism } from "./Tourism";
import { Gym } from "./Gym";
import { Emergency } from "./Emergency";

//! Restaurant - User - Comment
User.hasMany(Restaurant, { foreignKey: "user_id" });
Restaurant.belongsTo(User, { foreignKey: "user_id" });

Restaurant.hasMany(Comment, { foreignKey: "restaurant_id" });
Comment.belongsTo(Restaurant, { foreignKey: "restaurant_id" });

//! MovieTheater - User - Comment
User.hasMany(MovieTheater, { foreignKey: "user_id" });
MovieTheater.belongsTo(User, { foreignKey: "user_id" });

MovieTheater.hasMany(Comment, { foreignKey: "restaurant_id" });
Comment.belongsTo(MovieTheater, { foreignKey: "restaurant_id" });

//! Hotel - User - Comment
User.hasMany(Hotel, { foreignKey: "user_id" });
Hotel.belongsTo(User, { foreignKey: "user_id" });

Hotel.hasMany(Comment, { foreignKey: "restaurant_id" });
Comment.belongsTo(Hotel, { foreignKey: "restaurant_id" });

//! Taxi - User - Comment
User.hasMany(Taxi, { foreignKey: "user_id" });
Taxi.belongsTo(User, { foreignKey: "user_id" });

Taxi.hasMany(Comment, { foreignKey: "restaurant_id" });
Comment.belongsTo(Taxi, { foreignKey: "restaurant_id" });

//! Supermarket - User - Comment
User.hasMany(Supermarket, { foreignKey: "user_id" });
Supermarket.belongsTo(User, { foreignKey: "user_id" });

Supermarket.hasMany(Comment, { foreignKey: "restaurant_id" });
Comment.belongsTo(Supermarket, { foreignKey: "restaurant_id" });

//! Tourism - User - Comment
User.hasMany(Tourism, { foreignKey: "user_id" });
Tourism.belongsTo(User, { foreignKey: "user_id" });

Tourism.hasMany(Comment, { foreignKey: "restaurant_id" });
Comment.belongsTo(Tourism, { foreignKey: "restaurant_id" });

//! Gym - User - Comment
User.hasMany(Gym, { foreignKey: "user_id" });
Gym.belongsTo(User, { foreignKey: "user_id" });

Gym.hasMany(Comment, { foreignKey: "restaurant_id" });
Comment.belongsTo(Gym, { foreignKey: "restaurant_id" });

//! Emergency - User - Comment
User.hasMany(Emergency, { foreignKey: "user_id" });
Emergency.belongsTo(User, { foreignKey: "user_id" });

Emergency.hasMany(Comment, { foreignKey: "restaurant_id" });
Comment.belongsTo(Emergency, { foreignKey: "restaurant_id" });

//! User - Comment
User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });
