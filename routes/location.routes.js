// routes/location.routes.js
import express from 'express';
 import { AuthMiddlewares } from '../middlewares/auth.middleware.js';
// import { checkAuth } from '../middlewares/auth.middleware.js';

import Location from '../models/location.model.js'; // ✅ Import the model

const router = express.Router();

router.post('/save-location', AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const { mobile } = res.locals.user;
    const { lat, long, address, pincode } = req.body;

    // Basic validation
    if (!lat || !long || !address || !pincode) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Save to DB
    const location = new Location({
      mobile,
      lat,
      long,
      address,
      pincode
    });

    await location.save();

    res.status(201).json({
      success: true,
      message: 'Location saved successfully',
      location
    });
  } catch (error) {
    console.error('Error saving location:', error);
    next(error); // Pass error to global error handler if you have one
  }
});
router.get('/locations', AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 }); // newest first

    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    next(error);
  }
});

export default router;
