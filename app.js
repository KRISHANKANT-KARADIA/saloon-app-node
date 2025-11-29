import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import path from "path";
import versionRoutes from './routes/version.routes.js';
import otpRoutes from './routes/otp.routes.js';
import { logger } from './middlewares/logger.js';
import bodyParser from 'body-parser';
import locationRoutes from './routes/location.routes.js';
import userRoutes from './routes/user.routes.js';
import customerAuthRoutes from './routes/customer.auth.routes.js'
import customerLocationRoutes from './routes/customerLocation.routes.js'
import authRoutes from './routes/auth.routes.js';
import countryRoutes from './routes/country.routes.js';
import customerRoutes from './routes/customer.routes.js';
import customerVersionRoutes from './routes/customerVersion.routes.js';
import ownerCountryRoutes from './routes/ownerCountry.routes.js'; //




dotenv.config();

const app = express();


// const __dirname = path.resolve();

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to DB
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
// Customer End

app.use('/api', customerVersionRoutes);
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api', customerLocationRoutes);



app.use('/api/auth', authRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api', customerRoutes);



app.use((err, req, res, next) => {
  // Global error handler
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});



app.use('/',(req ,res)=>{
res.send(`Hello world - ${process.env.ENVIROMENT}`);
});
       




// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// 10.223.66.210