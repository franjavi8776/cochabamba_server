import app from "./app";
import dotenv from "dotenv";
import { sequelize } from "./db";
import "./models/User";
import "./models/Restaurant";
import "./models/Comment";
import "./models/association";
import "./models/MovieTheater";
import "./models/Hotel";
import "./models/Taxi";
import "./models/Supermarket";
import "./models/Tourism";
import "./models/Gym";
import "./models/Emergency";

dotenv.config();

const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`server is running in port ${PORT}`);
  });
});
