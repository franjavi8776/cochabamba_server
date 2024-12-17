import { NextFunction, Request, Response } from "express";
import admin from "../configGoogleAuth/firebase-config";

const decodeToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: any = req.headers.authorization?.split(" ")[1];

    //console.log(token);
    const decodeValue = await admin.auth().verifyIdToken(token);

    //console.log(decodeValue);

    if (decodeValue) {
      req.body = decodeValue;
      //console.log("req.user", req.user);
      return next();
    }

    res.status(500).json({ message: "Sin permiso" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export default decodeToken;
