// routes/customerLocation.routes.js
import express from 'express';
import { CustomerLocationController } from '../controllers/customerLocation.controller.js';
import { CustomerAuthMiddleware } from '../middlewares/customer.auth.middleware.js';

const router = express.Router();


router.use(CustomerAuthMiddleware.checkAuth);


router.post(
  '/customer/location/add',
  CustomerLocationController.addLocation
);

router.post(
  '/customer/location/add1',
  CustomerLocationController.addLocation1
);


router.get(
  '/customer/location/fetch/all',
  CustomerLocationController.getLocations
);


router.put(
  '/customer/location/:locationId',
  CustomerLocationController.updateNewLocation
);


router.delete(
  '/customer/location/:locationId',
  CustomerLocationController.deleteLocation
);

export default router;

