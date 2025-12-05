// routes/customer.routes.js
import express from 'express';
import { CustomerController, getUserDetails, partialCustomerProfile } from '../controllers/customer.controller.js';
import { CustomerAuthMiddleware } from '../middlewares/customer.auth.middleware.js';
import { AppointmentController } from '../controllers/appointment.controller.js';
import { AppointmentNewController } from '../controllers/appointmentnew.controller.js';
import { ProfileController } from '../controllers/profile.controller.js';
import { logoutCustomer } from '../controllers/auth.controller.js';
import multer from "multer";
import path from 'path';
import fs from 'fs';
import { addReview, getAllActiveOffers, getUserReviews } from '../controllers/offer.controller.js';


const router = express.Router();



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


router.get("/offers/active",CustomerAuthMiddleware.checkAuth, getAllActiveOffers);

router.post('/customer/add/partial/profile', CustomerAuthMiddleware.checkAuth, partialCustomerProfile);


router.get('/customer/getdetails', CustomerAuthMiddleware.checkAuth, getUserDetails);

// router.post('/customer/add/profile', CustomerAuthMiddleware.checkAuth, CustomerController.addOrUpdateProfile);


router.post(
  "/customer/add/profile",
  CustomerAuthMiddleware.checkAuth,
  upload.single("profileImage"),  
  CustomerController.addOrUpdateProfile
);

router.put(
  '/customer/profile',
  CustomerAuthMiddleware.checkAuth,
  CustomerController.updateProfile
);

router.get(
  '/customer/fetch/profile',
  CustomerAuthMiddleware.checkAuth,
  CustomerController.getProfile
);

router.post(
  '/customer/appointment',
  CustomerAuthMiddleware.checkAuth,
  AppointmentController.addAppointment
);

router.post(
  '/customer/appointment/payment',
  CustomerAuthMiddleware.checkAuth,
  AppointmentNewController.addAppointmentWithPayment
);

router.get('/appointment/pending', CustomerAuthMiddleware.checkAuth, AppointmentNewController.getPendingAppointments);

router.get('/appointment/confirmed', CustomerAuthMiddleware.checkAuth, AppointmentNewController.getConfirmAppointments);

router.get('/appointments/:appointmentId',CustomerAuthMiddleware.checkAuth, AppointmentNewController.getAppointmentById);


router.get('/appointmentsec/:appointmentId',CustomerAuthMiddleware.checkAuth, AppointmentNewController.getAppointmentByIdSec);

router.get(
  '/customer/appointments', 
  CustomerAuthMiddleware.checkAuth, 
  AppointmentNewController.getAllAppointments
);

router.put(
  '/customer/appointments/update/:id', 
  CustomerAuthMiddleware.checkAuth, 
  AppointmentNewController.updateAppointment
);

router.put(
  '/customer/appointments/cancel/:id',
  CustomerAuthMiddleware.checkAuth, 
  AppointmentNewController.cancelAppointments
);


router.patch(
  '/appointment/:id/cancel',
  CustomerAuthMiddleware.checkAuth,
  AppointmentNewController.cancelAppointment
);

router.post('/favourite-saloons', CustomerAuthMiddleware.checkAuth, CustomerController.addFavouriteSaloon);

router.post('/favourite-saloons/delete', CustomerAuthMiddleware.checkAuth, CustomerController.removeFavouriteSaloon);



// Get favourite saloons (GET)
router.get('/favourite-saloons', CustomerAuthMiddleware.checkAuth, CustomerController.getFavouriteSaloons);

router.post('/favourites/remove', CustomerAuthMiddleware.checkAuth, CustomerController.removeFavouriteSaloon);

router.get('/profile', CustomerAuthMiddleware.checkAuth, ProfileController.getProfile);
router.patch('/profile', CustomerAuthMiddleware.checkAuth, ProfileController.updateProfile);


router.post('/logout', CustomerAuthMiddleware.checkAuth, logoutCustomer);

router.delete('/customer/account', CustomerController.deleteAccount);



router.post(
  "/reviews",
  CustomerAuthMiddleware.checkAuth,
  addReview
);

router.get(
  "/reviews",
  CustomerAuthMiddleware.checkAuth,
  getUserReviews
);






export default router;
