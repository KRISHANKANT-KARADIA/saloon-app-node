import express from 'express';
import { addCountryForOwner } from '../controllers/ownerCountry.controller.js';
import { AuthMiddlewares } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', AuthMiddlewares.checkAuth, addCountryForOwner);



export default router;
