// import express from 'express';
// import { CustomerLocationController } from '../controllers/customerLocation.controller.js';
// import { CustomerAuthMiddleware } from '../middlewares/customer.auth.middleware.js'; // 👈 IMPORTANT: add .js

// const router = express.Router();

// // ✅ Protect all routes below with CustomerAuthMiddleware
// router.post(
//   '/customer/location/add',
//   CustomerAuthMiddleware,
//   CustomerLocationController.addLocation
// );

// router.post(
//   '/customer/location/add1',
//   CustomerAuthMiddleware,
//   CustomerLocationController.addLocation1
// );

// router.get(
//   '/customer/location/fetch/all',
//   CustomerAuthMiddleware,
//   CustomerLocationController.getLocations
// );

// router.put(
//   '/customer/location/:locationId',
//   CustomerAuthMiddleware,
//   CustomerLocationController.updateNewLocation
// );

// router.delete(
//   '/customer/location/:locationId',
//   CustomerAuthMiddleware,
//   CustomerLocationController.deleteLocation
// );

// export default router;


// // import express from 'express';
// // import { CustomerLocationController } from '../controllers/customerLocation.controller.js';
// // import { CustomerAuthMiddleware } from '../middlewares/customer.auth.middleware.js';

// // const router = express.Router();
// // router.use(CustomerAuthMiddleware.checkAuth);

// // // Add a new location
// // router.post('/customer/location/add', CustomerLocationController.addLocation);
// // router.post('/customer/location/add1', CustomerLocationController.addLocation1);

// // // Get all locations
// // router.get('/customer/location/fetch/all', CustomerLocationController.getLocations);

// // // Delete a location by ID
// // router.delete('/customer/location/:locationId', CustomerLocationController.deleteLocation);


// // router.put(
// //   "/customer/location/:locationId",
// //   CustomerAuthMiddleware.checkAuth,
// //   CustomerLocationController.updateNewLocation
// // );


// // export default router;


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

