import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";

import decodeToken from "./middleware/authGoogle";

import userRoutes from "./routes/user.routes";
import loginUserRoutes from "./routes/loginByEmail.routes";
import loginGoogleRoutes from "./routes/loginByGoogle.routes";
import restaurantRoutes from "./routes/restaurant.routes";
import commentRoutes from "./routes/comment.routes";

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use(userRoutes);
app.use(loginUserRoutes);
app.use(restaurantRoutes);
app.use(commentRoutes);

app.use(decodeToken);
app.use(loginGoogleRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error en el servidor:", err);
  res.status(500).send("Error interno del servidor");
});

app.use("/uploads", (req, res, next) => {
  console.log("Petición para archivo estático:", req.url);
  next();
});

export default app;
