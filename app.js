import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import versionRoutes from './routes/version.routes.js';
import otpRoutes from './routes/otp.routes.js';
import { logger } from './middlewares/logger.js';
import bodyParser from 'body-parser';
import locationRoutes from './routes/location.routes.js';
import userRoutes from './routes/user.routes.js';
import customerAuthRoutes from './routes/customer.auth.routes.js';
import customerLocationRoutes from './routes/customerLocation.routes.js';
import authRoutes from './routes/auth.routes.js';
import countryRoutes from './routes/country.routes.js';
import customerRoutes from './routes/customer.routes.js';
import customerVersionRoutes from './routes/customerVersion.routes.js';
import ownerCountryRoutes from './routes/ownerCountry.routes.js';

import admin from "firebase-admin";

import fs from "fs";
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use('/uploads', express.static('uploads'));

// Middlewares
app.use(express.json());
app.use(logger);
app.use(bodyParser.json());

// Routes
app.use('/api', versionRoutes);
app.use('/api', otpRoutes);
app.use('/api', userRoutes);
app.use('/api/owner/countries', ownerCountryRoutes);

app.use('/api', locationRoutes);
app.use('/api', userRoutes);

// Customer End Routes
app.use('/api', customerVersionRoutes);
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api', customerLocationRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api', customerRoutes);

// Firebase Admin Initialize
const serviceAccount = JSON.parse(
  fs.readFileSync("./routes/serviceAccountKey.json", "utf8")
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let deviceTokens = [];

// Save React Native FCM Token
app.post("/save-token", (req, res) => {
  const { token } = req.body;
  
  if (token && !deviceTokens.includes(token)) {
    deviceTokens.push(token);
  }

  console.log("📱 Saved Tokens =>", deviceTokens);
  res.json({ success: true });
});

// Send Push Notification
app.post("/send-notification", async (req, res) => {
  const { title, message, token } = req.body;

  if (!token) {
    return res.json({
      success: false,
      error: "Token is required"
    });
  }

  try {
    const response = await admin.messaging().send({
      token: token,   // EXACTLY ONE TOKEN HERE
      notification: {
        title,
        body: message,
      }
    });

    res.json({ success: true, response });

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});


app.get('/', (req, res) => {
  res.send(`Hello world - ${process.env.ENVIROMENT}`);
});

// Run Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
