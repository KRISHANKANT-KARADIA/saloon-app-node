// routes/location.routes.js
import express from 'express';
 import { AuthMiddlewares } from '../middlewares/auth.middleware.js';


import Location from '../models/location.model.js'; 

const router = express.Router();

router.post('/save-location', AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const { mobile } = res.locals.user;
    const { lat, long, address, pincode } = req.body;

 
    if (!lat || !long || !address || !pincode) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

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
    next(error);
  }
});
router.get('/locations', AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 }); 

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
