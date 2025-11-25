import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// service-account.json का path
const serviceAccountPath = path.join(__dirname, "./service-account.json");

const serviceAccount = JSON.parse(
  readFileSync(serviceAccountPath, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("🔥 Firebase Admin Connected");

export default admin;
