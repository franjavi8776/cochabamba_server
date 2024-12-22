import * as admin from "firebase-admin";
import * as serviceAccount from "./serviceAccount.json";

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
} catch (error) {
  console.error("Firebase admin initialization error", error);
}

export default admin;
