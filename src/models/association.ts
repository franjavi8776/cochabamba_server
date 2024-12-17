import { User } from "./User";
import { Restaurant } from "./Restaurant";
import { Comment } from "./Comment";

User.hasMany(Restaurant, { foreignKey: "user_id" });
Restaurant.belongsTo(User, { foreignKey: "user_id" });

Restaurant.hasMany(Comment, { foreignKey: "restaurant_id" });
Comment.belongsTo(Restaurant, { foreignKey: "restaurant_id" });

User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });
