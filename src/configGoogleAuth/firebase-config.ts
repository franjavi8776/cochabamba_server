import * as admin from "firebase-admin";
import serviceAccount from "./serviceAccount";

//console.log(serviceAccount.project_id);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
