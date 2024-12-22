import dotenv from "dotenv";

dotenv.config();

const {
  FIREBASE_TYPE,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER,
  FIREBASE_CLIENT_URL,
  FIREBASE_UNIVERSE_DOMAIN,
} = process.env;

// interface ServiceAccount {
//   type: string | undefined;
//   project_id: string | undefined;
//   private_key_id: string | undefined;
//   private_key: string | undefined;
//   client_email: string | undefined;
//   client_id: string | undefined;
//   auth_uri: string | undefined;
//   token_uri: string | undefined;
//   auth_provider_x509_cert_url: string | undefined;
//   client_x509_cert_url: string | undefined;
//   universe_domain: string | undefined;
// }

const serviceAccount = {
  type: FIREBASE_TYPE,
  project_id: FIREBASE_PROJECT_ID,
  private_key_id: FIREBASE_PRIVATE_KEY_ID,
  private_key: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: FIREBASE_CLIENT_EMAIL,
  client_id: FIREBASE_CLIENT_ID,
  auth_uri: FIREBASE_AUTH_URI,
  token_uri: FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER,
  client_x509_cert_url: FIREBASE_CLIENT_URL,
  universe_domain: FIREBASE_UNIVERSE_DOMAIN,
};

export default serviceAccount;
