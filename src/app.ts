import express from "express";
import morgan from "morgan";
import cors from "cors";

import decodeToken from "./middleware/authGoogle";

import userRoutes from "./routes/user.routes";
import loginUserRoutes from "./routes/loginByEmail.routes";
import loginGoogleRoutes from "./routes/loginByGoogle.routes";
import restaurantRoutes from "./routes/restaurant.routes";
import commentRoutes from "./routes/comment.routes";
import taxiRoutes from "./routes/taxi.routes";
import movieTheaterRoutes from "./routes/movieTheater.routes";
import supermarketRoutes from "./routes/supermarket.routes";
import tourismRoutes from "./routes/tourism.routes";
import gymRoutes from "./routes/gym.routes";
import hotelRoutes from "./routes/hotel.routes";
import emergencyRoutes from "./routes/emergency.routes";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use(userRoutes);
app.use(loginUserRoutes);
app.use(restaurantRoutes);
app.use(commentRoutes);
app.use(taxiRoutes);
app.use(movieTheaterRoutes);
app.use(supermarketRoutes);
app.use(tourismRoutes);
app.use(gymRoutes);
app.use(hotelRoutes);
app.use(emergencyRoutes);

app.use(decodeToken);
app.use(loginGoogleRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error en el servidor:", err);
  res.status(500).send("Error interno del servidor");
});

export default app;
