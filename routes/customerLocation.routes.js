// routes/customerLocation.routes.js
import express from 'express';
import { CustomerLocationController } from '../controllers/customerLocation.controller.js';
import { CustomerAuthMiddleware } from '../middlewares/customer.auth.middleware.js';

const router = express.Router();

// ✅ Apply middleware to all routes in this file
router.use(CustomerAuthMiddleware.checkAuth);

/**
 * Add new customer location
 */
router.post(
  '/customer/location/add',
  CustomerLocationController.addLocation
);

/**
 * Alternate add route
 */
router.post(
  '/customer/location/add1',
  CustomerLocationController.addLocation1
);

/**
 * Fetch all customer locations
 */
router.get(
  '/customer/location/fetch/all',
  CustomerLocationController.getLocations
);

/**
 * Update location by ID
 */
router.put(
  '/customer/location/:locationId',
  CustomerLocationController.updateNewLocation
);

/**
 * Delete location by ID
 */
router.delete(
  '/customer/location/:locationId',
  CustomerLocationController.deleteLocation
);

export default router;

