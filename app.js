
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
import customerAuthRoutes from './routes/customer.auth.routes.js';
import customerLocationRoutes from './routes/customerLocation.routes.js';
import authRoutes from './routes/auth.routes.js';
import countryRoutes from './routes/country.routes.js';
import customerRoutes from './routes/customer.routes.js';
import customerVersionRoutes from './routes/customerVersion.routes.js';
import ownerCountryRoutes from './routes/ownerCountry.routes.js';

dotenv.config();

const app = express();


connectDB();


const __dirname = path.resolve();


app.use("/uploads", express.static("uploads"));
app.use("/api/reports", express.static(path.join(process.cwd(), "public/reports")));
app.use('/public', express.static('public'));

app.use(express.json());
app.use(logger);
app.use(bodyParser.json());


app.use('/api', versionRoutes);
app.use('/api', otpRoutes);
app.use('/api', userRoutes);
app.use('/api/owner/countries', ownerCountryRoutes);
app.use('/api', locationRoutes);
app.use('/api', userRoutes);


app.use('/api', customerVersionRoutes);
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api', customerLocationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api', customerRoutes);


app.use((err, req, res, next) => {
  console.log("GLOBAL ERROR:", err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
});


app.use('/', (req, res) => {
  res.send(`Hello world - ${process.env.ENVIROMENT}`);
});



const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
