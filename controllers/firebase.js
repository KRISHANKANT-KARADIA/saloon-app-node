import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Load service account file
const serviceAccount = require("./service-account.json");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
