// routes/country.routes.js
import express from 'express';
import { addCountry, getAllCountries } from '../controllers/country.controller.js';
import { CustomerAuthMiddleware } from '../middlewares/customer.auth.middleware.js';
const router = express.Router();

router.post('/add', CustomerAuthMiddleware.checkAuth, addCountry);
router.get('/all', CustomerAuthMiddleware.checkAuth ,getAllCountries); // public GET



export default router;

