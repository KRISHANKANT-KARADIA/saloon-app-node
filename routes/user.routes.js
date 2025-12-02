import express from 'express';
import mongoose from 'mongoose';
import { AuthMiddlewares } from '../middlewares/auth.middleware.js';
import Location from '../models/location.model.js';
import Saloon from '../models/saloon.model.js'; 
import { getAllUsers, createUser ,getMySaloonProfile, updateSaloonInfo, getRegisteredMobileNumber} from '../controllers/user.controller.js';
import {  addSaloonContent,getPublicSaloonContent, deleteSaloonImage, getAllImages, getFullSaloonDetails, getFullSaloonDetailsUsingId, getOperatingHours, getPublicOperatingHours, getPublicOwnerLocation, getSaloonDetails, getSaloonUsingId, getSocialLinks, registerSaloon, updateOperatingHours, updateSaloonData, updateSaloonMobileNumber, updateSocialLinks, uploadSaloonImages, uploadSaloonLogo, getAppointmentsBySaloon, getSaloonDashboardStats, getLast7DaysDashboardStats, getUpcomingAppointments,getTodayRevenue,getTotalAppointments,getDashboardData,getPendingAppointments,getRevenueGrowth,getPastAppointments, addOfflineAppointment, getOfflineAppointments, deleteOfflineAppointment, updateOfflineAppointmentStatus, getOfflineAppointmentById, getAppointmentById, updateAppointmentStatus, filterAppointments, getOwnerSaloonContent, getServiceWiseCounts, getSaloonByOwnerId } from '../controllers/saloon.controller.js';
import { addSaloonLocation, getSaloonLocation, putSaloonNewLocation } from '../controllers/location.controller.js';
import { updateSaloonDetails } from '../controllers/updateSaloonDetails.js';
import { deleteSaloonLocation, updateSaloonLocation } from '../controllers/updateSaloonLocation.js';
import { getSaloonRegisteredMobileNumber } from '../controllers/saloonUser.controller.js';
import { uploadSaloonImage } from '../middlewares/upload.middle.js';
import { addTeamMember, deleteTeamMember, getAllTeamMembers, getTeamMemberById, getTeamMembers, getTeamMembersBySaloonId, getTopPerformers, updateTeamMember } from '../controllers/team.controller.js';
import { uploadTeamMemberProfile } from '../middlewares/temUpload.middle.js';
import { createService, deleteService, getAllRegisteredActiveServices, getAllRegisteredServices, getPublicServicesBySaloonId, getSaloonsByCategory, getSaloonsByCategorys, getSaloonServices, searchSalons, updateService } from '../controllers/service.controller.js';
import { uploadServiceLogo } from '../middlewares/upload.middleware.js';
import { deleteHoliday, getHolidays, setHoliday, updateHoliday } from '../controllers/holiday.controller.js';
import { logout } from '../controllers/logout.controller.js';
import { SaloonsController } from '../controllers/saloons.controller.js';
import { LocationownerController } from '../controllers/locationowner.controller.js';
import { getNearbySalonsController } from '../controllers/nearby.controller.js';
import ownerModel from '../models/owner.model.js';
import Appointment from '../models/appointment.model.js';
import multer from "multer";
import path from 'path';
import fs from 'fs';
import { getLocationBySaloonId } from '../controllers/ownerCountry.controller.js';

import { saloonNotification } from "../middlewares/saloonNotification.js";
import { addCoupon, getAllCoupons, getCoupon, verifyCoupon } from '../controllers/couponController.js';
import { addOffer, deleteOffer, getAllActiveOffers, getOfferById, getOffers, getOffersWithData, getTrendingSaloons, replyToReview, updateOffer, updateTrendingSaloons ,forMultipleSaloonReview, forMultipleSaloonReviews, addReply, getSaloonReview} from '../controllers/offer.controller.js';



// import * as couponController from '../controllers/coupon.controller.js';
// import { addCoupon } from './../controllers/couponController';



const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads/saloon');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });



const uploadDirServices = path.join(process.cwd(), "uploads/services");
if (!fs.existsSync(uploadDirServices)) {
  fs.mkdirSync(uploadDirServices, { recursive: true });
}

// Multer setup
const storageser = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirServices),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const uploadservice = multer({ storageser });



const uploadSaloonImageData = path.join(process.cwd(), "uploads/saloons");
if (!fs.existsSync(uploadSaloonImageData)) {
  fs.mkdirSync(uploadSaloonImageData, { recursive: true });
}

// Multer storage
const storageImageSaloon = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadSaloonImageData);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});



const storageContent = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/saloonContent/"); // folder to store images
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});



const uploadContent = multer({ storageContent });

// Initialize
export const uploadsaloonservice = multer({ storage: storageImageSaloon });
// router.get('/me', AuthMiddlewares.checkAuth, async (req, res, next) => {
//   try {
//     const { mobile } = res.locals.user;

//     const locations = await Location.find({ mobile })
//       .sort({ createdAt: -1 }) // newest first :contentReference[oaicite:0]{index=0}

//     const lastCreated = locations.length > 0
//       ? locations[0].createdAt
//       : null;

//     res.json({
//       success: true,
//       user: res.locals.user,
//       locations,
//       lastCreated
//     });
//   } catch (error) {
//     next(error);
//   }
// });


// Saloon Details With Location





router.post(
  '/coupon/add',
  AuthMiddlewares.checkAuth,
 addCoupon
);

// ➤ Get coupon by code
router.get(
  '/coupon/:code',
  AuthMiddlewares.checkAuth,
 getCoupon
);

// ➤ Verify coupon at checkout
router.post(
  '/coupon/verify',
  // अगर public verify चाहिए तो हटा सकते हो
verifyCoupon
);

router.get(
  '/coupon/all',
  // AuthMiddlewares.checkAuth,
  getAllCoupons
);

// Update Mobile Number____________________________________________________

// Update owner mobile number
router.put('/saloon/owner/update-mobile', AuthMiddlewares.checkAuth, async (req, res) => {
  try {
    const ownerId = res.locals.user.id;   // user id from token
    const { newMobile } = req.body;

    if (!newMobile) {
      return res.status(400).json({ success: false, message: "New mobile number is required" });
    }

    // Check if new mobile already exists
    const existingOwner = await ownerModel.findOne({ mobile: newMobile });
    if (existingOwner) {
      return res.status(400).json({ success: false, message: "This mobile number is already registered" });
    }

    // Update mobile number
    const updatedOwner = await ownerModel.findByIdAndUpdate(
      ownerId,
      { mobile: newMobile },
      { new: true }
    );

    if (!updatedOwner) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }

    res.json({
      success: true,
      message: "Mobile number updated successfully",
      owner: {
        id: updatedOwner._id,
        mobile: updatedOwner.mobile,
        state_status: updatedOwner.owner_state_status,
      }
    });
  } catch (error) {
    console.error("Error updating mobile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});



router.get('/saloon/fetch/details', AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Fetch saloon for this owner
    const saloon = await Saloon.findOne({ owner: ownerId });

    // Fetch locations linked to this owner
    const locations = await Location.find({ owner: ownerId })
      .populate('saloon') // populate saloon details if linked
      .sort({ createdAt: -1 });

    const lastCreated = locations.length > 0 ? locations[0].createdAt : null;

const ownersId = res.locals.user.id;
const user = await ownerModel.findById(ownersId);
if (!user) throw new Error('User not found');

  res.json({
  success: true,
user,
  saloon,
  locations,
  owner_state_status: user.owner_state_status,
  lastCreated
});
  } catch (error) {
    next(error);
  }
});



// update 

// Update Saloon details
router.put(
  '/saloon/update/:id',
  AuthMiddlewares.checkAuth,
  upload.single('logo'), // multer for logo
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const ownerId = res.locals.user.id;
      const { name, ownerName, mobile } = req.body;

      // Check saloon exists & belongs to owner
      const saloon = await Saloon.findOne({ _id: id, owner: ownerId });
      if (!saloon) {
        return res.status(404).json({
          success: false,
          message: 'Saloon not found or unauthorized'
        });
      }

      // Update text fields
      if (name) saloon.name = name;
      if (ownerName) saloon.ownerName = ownerName;
      if (mobile) saloon.mobile = mobile;

      // Update logo if file uploaded
      if (req.file) {
        saloon.logo = `/uploads/saloon/${req.file.filename}`;
      }

      await saloon.save();

      res.json({
        success: true,
        message: 'Saloon updated successfully',
        saloon
      });
    } catch (error) {
      next(error);
    }
  }
);


// Saloon Details Without Auth

// Public API to fetch saloon details and locations
router.get('/saloon/fetch/public/details', async (req, res, next) => {
  try {
    // Fetch all saloons
    const saloons = await Saloon.find()
      .sort({ createdAt: -1 });

    // Fetch all locations linked to these saloons
    const locations = await Location.find()
      .populate('saloon')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      saloons,
      locations
    });
  } catch (error) {
    next(error);
  }
});


router.get('/saloon/fetch/public', async (req, res, next) => {
  try {
    // Fetch all saloons but only select _id, name, and logo
    const saloons = await Saloon.find({}, { _id: 1, name: 1, logo: 1 })
      .sort({ createdAt: -1 });

    // Optionally fetch locations if you want minimal info
    const locations = await Location.find({}, { _id: 1, owner: 1, address1: 1, city: 1, lat: 1, long: 1 })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      saloons,
      locations
    });
  } catch (error) {
    next(error);
  }
});

router.get('/saloon/fetch/top/five/public', async (req, res, next) => {
  try {
    // ✅ Fetch only top 5 latest saloons (id, name, logo)
    const saloons = await Saloon.find({}, { _id: 1, name: 1, logo: 1 })
      .sort({ createdAt: -1 })
      .limit(5);

    // ✅ Optional: agar locations bhi chahiye to unme bhi limit laga sakte ho
    const locations = await Location.find({}, { _id: 1, owner: 1, address1: 1, city: 1, lat: 1, long: 1 })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      message: "Top 5 saloons fetched successfully",
      count: saloons.length,
      saloons,
      locations
    });
  } catch (error) {
    next(error);
  }
});


router.post('/owner/location', AuthMiddlewares.checkAuth, addSaloonLocation);
router.get('/owner/location', AuthMiddlewares.checkAuth, getLocationBySaloonId);





// router.get(
//   '/owner/location/saloon/:saloonId',
//   AuthMiddlewares.checkAuth,
//   OwnerLocationController.getLocationBySaloonId
// );

// router.put(
//   '/owner/location/:saloonId',
//   AuthMiddlewares.checkAuth,
//   OwnerLocationController.updateLocationBySaloonId
// );



router.get(
  '/saloon/:saloonId/appointments',
  // AdminAuthMiddleware.checkAuth, // optional: only admin/saloon owner
getAppointmentsBySaloon
);

router.get(
  "/saloon/dashboard",
   AuthMiddlewares.checkAuth,
  getSaloonDashboardStats
);


router.get(
  "/saloon/upcomming/appointment",
  AuthMiddlewares.checkAuth,
  getUpcomingAppointments
);
router.get(
  "/saloon/getTodayRevenue",
  AuthMiddlewares.checkAuth,
  getTodayRevenue
);


router.get(
  "/saloon/getTotalAppointments",
  AuthMiddlewares.checkAuth,
  getTotalAppointments
);


router.get(
  "/saloon/getDashboardData",
  AuthMiddlewares.checkAuth,
  getDashboardData
);



router.get(
  "/saloon/getRevenueGrowth",
  AuthMiddlewares.checkAuth,
  getRevenueGrowth
);

router.get(
  "/saloon/getPendingAppointments",
  AuthMiddlewares.checkAuth,
  getPendingAppointments
);



router.get(
  "/saloon/past/appointment",
  AuthMiddlewares.checkAuth,
  getPastAppointments
);


// 


router.get('/saloon/dashboard/7days',  AuthMiddlewares.checkAuth, getLast7DaysDashboardStats);

router.get("/saloon/dashboard11", AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Find saloon of logged-in owner
    const saloon = await Saloon.findOne({ owner: new mongoose.Types.ObjectId(ownerId) });
    if (!saloon) return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));

    // 2️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: new mongoose.Types.ObjectId(saloon._id) })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    // 3️⃣ Compute today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todaysAppointments = appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      return appointmentDate >= startOfDay && appointmentDate <= endOfDay;
    });

    // 4️⃣ Calculate stats
    const totalAppointments = todaysAppointments.length;
    const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
    const confirmedCount = todaysAppointments.filter(a => ["confirmed", "accepted"].includes(a.status)).length;
    const todayRevenue = todaysAppointments
      .filter(a => ["confirmed", "completed"].includes(a.status))
      .reduce((sum, a) => sum + Number(a.price || 0), 0);

    // 5️⃣ Growth ratio (compared to yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    const yesterdayAppointments = appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      return appointmentDate >= startOfYesterday && appointmentDate <= endOfYesterday;
    });

    const growthRatio = yesterdayAppointments.length > 0
      ? ((totalAppointments - yesterdayAppointments.length) / yesterdayAppointments.length) * 100
      : 0;

    // 6️⃣ Build response
    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingCount,
        confirmedCount,
        todayRevenue,
        growthRatio: growthRatio.toFixed(2),
      },
      recentAppointments: todaysAppointments.slice(-5).reverse() // latest 5
    });

  } catch (err) {
    next(err);
  }
});



router.get("/saloon/dashboard1", AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: new mongoose.Types.ObjectId(ownerId) });

    if (!saloon) return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));

    // 2️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    // 3️⃣ Compute today's stats
    const today = new Date();
    const todayStr = today.toDateString(); // e.g., "Mon Sep 15 2025"

    const todaysAppointments = appointments.filter(a => new Date(a.date).toDateString() === todayStr);

    const totalAppointments = todaysAppointments.length;
    const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
    const confirmedCount = todaysAppointments.filter(a => a.status === "confirmed").length;
    const todayRevenue = todaysAppointments
      .filter(a => a.status === "confirmed")
      .reduce((sum, a) => sum + Number(a.price || 0), 0);

    // 4️⃣ Growth ratio (compared to yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const yesterdayAppointments = appointments.filter(a => new Date(a.date).toDateString() === yesterdayStr);
    const growthRatio = yesterdayAppointments.length > 0
      ? ((totalAppointments - yesterdayAppointments.length) / yesterdayAppointments.length) * 100
      : 0;

    // 5️⃣ Build dashboard response
    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingCount,
        confirmedCount,
        todayRevenue,
        growthRatio: growthRatio.toFixed(2),
      },
      recentAppointments: todaysAppointments.slice(-5).reverse(), // last 5
    });

  } catch (err) {
    next(err);
  }
});


// router.get("/saloon/week/dashboard1", AuthMiddlewares.checkAuth, async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Get saloon of the logged-in owner
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     // 2️⃣ Fetch all appointments for this saloon
//     const appointments = await Appointment.find({ saloonId: saloon._id })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       .populate("professionalId", "name")
//       .sort({ date: 1, time: 1 });

//       appointments.forEach(a => {
//   console.log(a.professionalId); // Check what is actually coming
// });

//     // ---------- Date ranges ----------
//     const today = new Date();
//     const todayStart = new Date(today);
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date(today);
//     todayEnd.setHours(23, 59, 59, 999);

//     const yesterdayStart = new Date(todayStart);
//     yesterdayStart.setDate(yesterdayStart.getDate() - 1);
//     const yesterdayEnd = new Date(todayEnd);
//     yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

//     // ---------- Filter appointments ----------
//     const todaysAppointments = appointments.filter(a => {
//       const apptDate = new Date(a.date);
//       return apptDate >= todayStart && apptDate <= todayEnd;
//     });

//     const yesterdayAppointments = appointments.filter(a => {
//       const apptDate = new Date(a.date);
//       return apptDate >= yesterdayStart && apptDate <= yesterdayEnd;
//     });

//     // ---------- Stats ----------
//     const totalAppointments = todaysAppointments.length;
//     const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
//     const confirmedCount = todaysAppointments.filter(a => a.status === "confirmed").length;

//     const todayRevenue = todaysAppointments
//       .filter(a => a.status === "confirmed")
//       .reduce((sum, a) => sum + Number(a.price || 0), 0);

//     const growthRatio = yesterdayAppointments.length > 0
//       ? ((totalAppointments - yesterdayAppointments.length) / yesterdayAppointments.length) * 100
//       : 0;

//     // ---------- Weekly Revenue ----------
//     const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//     const revenueByWeek = [0, 0, 0, 0]; // Week 1, 2, 3, 4

//     appointments.forEach(a => {
//       if (a.status === "confirmed") {
//         const date = new Date(a.date);
//         if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
//           const day = date.getDate();
//           if (day >= 1 && day <= 7) revenueByWeek[0] += Number(a.price || 0);
//           else if (day >= 8 && day <= 14) revenueByWeek[1] += Number(a.price || 0);
//           else if (day >= 15 && day <= 21) revenueByWeek[2] += Number(a.price || 0);
//           else revenueByWeek[3] += Number(a.price || 0);
//         }
//       }
//     });

//     // ---------- Build Response ----------
//     res.status(200).json({
//       success: true,
//       stats: {
//         totalAppointments,
//         pendingCount,
//         confirmedCount,
//         todayRevenue,
//         growthRatio: growthRatio.toFixed(2),
//       },
//       revenueByWeek: [
//         { week: "Week 1", revenue: revenueByWeek[0] },
//         { week: "Week 2", revenue: revenueByWeek[1] },
//         { week: "Week 3", revenue: revenueByWeek[2] },
//         { week: "Week 4", revenue: revenueByWeek[3] },
//       ],
//       recentAppointments: todaysAppointments.slice(-5).reverse(), // last 5
//     });

//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/saloon/week/dashboard1", AuthMiddlewares.checkAuth, async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Fetch Saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     // 2️⃣ Fetch Appointments
//     const appointments = await Appointment.find({ saloonId: saloon._id })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       .populate("professionalId", "name")
//       .sort({ date: 1, time: 1 });

//     // ---------- Today Calculation ----------
//     const today = new Date();

//     // Match only YEAR, MONTH, DAY (timezone safe)
//     const todaysAppointments = appointments.filter(a => {
//       const apptDate = new Date(a.date);
//       return (
//         apptDate.getDate() === today.getDate() &&
//         apptDate.getMonth() === today.getMonth() &&
//         apptDate.getFullYear() === today.getFullYear()
//       );
//     });

//     // ---------- Yesterday ----------
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);

//     const yesterdayAppointments = appointments.filter(a => {
//       const apptDate = new Date(a.date);
//       return (
//         apptDate.getDate() === yesterday.getDate() &&
//         apptDate.getMonth() === yesterday.getMonth() &&
//         apptDate.getFullYear() === yesterday.getFullYear()
//       );
//     });

//     // ---------- Stats ----------
//     const totalAppointments = todaysAppointments.length;
//     const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
//     const confirmedCount = todaysAppointments.filter(a => a.status === "confirmed").length;

//     const todayRevenue = todaysAppointments
//       .filter(a => a.status === "confirmed")
//       .reduce((sum, a) => sum + Number(a.price || 0), 0);

//     const growthRatio =
//       yesterdayAppointments.length > 0
//         ? ((totalAppointments - yesterdayAppointments.length) /
//             yesterdayAppointments.length) *
//           100
//         : 0;

//     // ---------- Weekly Revenue ----------
//     const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//     const revenueByWeek = [0, 0, 0, 0];

//     appointments.forEach(a => {
//       if (a.status === "confirmed") {
//         const d = new Date(a.date);
//         if (d.getMonth() === today.getMonth()) {
//           const day = d.getDate();
//           if (day <= 7) revenueByWeek[0] += Number(a.price || 0);
//           else if (day <= 14) revenueByWeek[1] += Number(a.price || 0);
//           else if (day <= 21) revenueByWeek[2] += Number(a.price || 0);
//           else revenueByWeek[3] += Number(a.price || 0);
//         }
//       }
//     });

//     // ---------- Recent Appointments (Today, Last 5 Sorted) ----------
//     const recentAppointments = [...todaysAppointments]
//       .sort((a, b) => new Date(b.date) - new Date(a.date))
//       .slice(0, 5);

//     // ---------- Response ----------
//     res.status(200).json({
//       success: true,
//       stats: {
//         totalAppointments,
//         pendingCount,
//         confirmedCount,
//         todayRevenue,
//         growthRatio: growthRatio.toFixed(2),
//       },
//       revenueByWeek: [
//         { week: "Week 1", revenue: revenueByWeek[0] },
//         { week: "Week 2", revenue: revenueByWeek[1] },
//         { week: "Week 3", revenue: revenueByWeek[2] },
//         { week: "Week 4", revenue: revenueByWeek[3] },
//       ],
//       recentAppointments,
//     });

//   } catch (err) {
//     next(err);
//   }
// });


router.get("/saloon/week/dashboard1", AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Fetch Saloon
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // 2️⃣ Fetch Appointments
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    // -------------------------------------------
    // 🔥 FIX: Convert DB date safely every time
    // -------------------------------------------
    const convertDate = (input) => {
      if (!input) return null;

      // If DB stores STRING → "2025-02-14"
      if (typeof input === "string") {
        const [y, m, d] = input.split("-").map(Number);
        return new Date(y, m - 1, d);
      }

      // If DB stores Date → convert directly
      return new Date(input);
    };

    // ---------- Today ----------
    const today = new Date();
    const tY = today.getFullYear();
    const tM = today.getMonth();
    const tD = today.getDate();

    const todaysAppointments = appointments.filter(a => {
      const d = convertDate(a.date);
      if (!d) return false;

      return (
        d.getFullYear() === tY &&
        d.getMonth() === tM &&
        d.getDate() === tD
      );
    });

    // ---------- Yesterday ----------
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yY = yesterday.getFullYear();
    const yM = yesterday.getMonth();
    const yD = yesterday.getDate();

    const yesterdayAppointments = appointments.filter(a => {
      const d = convertDate(a.date);
      if (!d) return false;

      return (
        d.getFullYear() === yY &&
        d.getMonth() === yM &&
        d.getDate() === yD
      );
    });

    // ---------- Stats ----------
    const totalAppointments = todaysAppointments.length;
    const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
    const confirmedCount = todaysAppointments.filter(a => a.status === "confirmed").length;

    const todayRevenue = todaysAppointments
      .filter(a => a.status === "confirmed")
      .reduce((sum, a) => sum + Number(a.price || 0), 0);

    const growthRatio =
      yesterdayAppointments.length > 0
        ? ((totalAppointments - yesterdayAppointments.length) /
            yesterdayAppointments.length) *
          100
        : 0;

    // ---------- Weekly Revenue ----------
    const revenueByWeek = [0, 0, 0, 0];

    appointments.forEach(a => {
      if (a.status === "confirmed") {
        const d = convertDate(a.date);
        if (!d) return;

        if (d.getMonth() === today.getMonth()) {
          const day = d.getDate();
          if (day <= 7) revenueByWeek[0] += Number(a.price || 0);
          else if (day <= 14) revenueByWeek[1] += Number(a.price || 0);
          else if (day <= 21) revenueByWeek[2] += Number(a.price || 0);
          else revenueByWeek[3] += Number(a.price || 0);
        }
      }
    });

    // ---------- Recent Appointments (Last 5 of Today) ----------
    const recentAppointments = [...todaysAppointments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // ---------- Response ----------
    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingCount,
        confirmedCount,
        todayRevenue,
        growthRatio: growthRatio.toFixed(2),
      },
      revenueByWeek: [
        { week: "Week 1", revenue: revenueByWeek[0] },
        { week: "Week 2", revenue: revenueByWeek[1] },
        { week: "Week 3", revenue: revenueByWeek[2] },
        { week: "Week 4", revenue: revenueByWeek[3] },
      ],
      todaysAppointments,
      recentAppointments,
      yesterdayAppointments,
    });

  } catch (err) {
    next(err);
  }
});


// router.get("/saloon/week/dashboard1", AuthMiddlewares.checkAuth, async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Get saloon of the logged-in owner
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));

//     // 2️⃣ Fetch all appointments for this saloon
//     const appointments = await Appointment.find({ saloonId: saloon._id })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       .populate("professionalId", "name")
//       .sort({ date: 1, time: 1 });

//     const today = new Date();
//     const todayStr = today.toDateString(); 

//     const todaysAppointments = appointments.filter(a => new Date(a.date).toDateString() === todayStr);

//     const totalAppointments = todaysAppointments.length;
//     const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
//     const confirmedCount = todaysAppointments.filter(a => a.status === "confirmed").length;
//     const todayRevenue = todaysAppointments
//       .filter(a => a.status === "confirmed")
//       .reduce((sum, a) => sum + Number(a.price || 0), 0);

//     // Growth ratio (compared to yesterday)
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     const yesterdayStr = yesterday.toDateString();

//     const yesterdayAppointments = appointments.filter(a => new Date(a.date).toDateString() === yesterdayStr);
//     const growthRatio = yesterdayAppointments.length > 0
//       ? ((totalAppointments - yesterdayAppointments.length) / yesterdayAppointments.length) * 100
//       : 0;

//     // =========================
//     // Weekly Revenue Calculation
//     // =========================
//     const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//     const revenueByWeek = [0, 0, 0, 0]; // Week 1, 2, 3, 4

//     appointments.forEach(a => {
//       if (a.status === "confirmed") {
//         const date = new Date(a.date);
//         if (date.getMonth() === today.getMonth()) {
//           const day = date.getDate();
//           if (day >= 1 && day <= 7) revenueByWeek[0] += Number(a.price || 0);
//           else if (day >= 8 && day <= 14) revenueByWeek[1] += Number(a.price || 0);
//           else if (day >= 15 && day <= 21) revenueByWeek[2] += Number(a.price || 0);
//           else revenueByWeek[3] += Number(a.price || 0);
//         }
//       }
//     });

//     // 5️⃣ Build dashboard response
//     res.status(200).json({
//       success: true,
//       stats: {
//         totalAppointments,
//         pendingCount,
//         confirmedCount,
//         todayRevenue,
//         growthRatio: growthRatio.toFixed(2),
//       },
//       revenueByWeek: [
//         { week: "Week 1", revenue: revenueByWeek[0] },
//         { week: "Week 2", revenue: revenueByWeek[1] },
//         { week: "Week 3", revenue: revenueByWeek[2] },
//         { week: "Week 4", revenue: revenueByWeek[3] },
//       ],
//       recentAppointments: todaysAppointments.slice(-5).reverse(), // last 5
//     });

//   } catch (err) {
//     next(err);
//   }
// });


router.get("/saloon/dashboard2", AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));

    // 2️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    // 3️⃣ Compute today's stats
    const today = new Date();
    const todayStr = today.toDateString(); // e.g., "Mon Sep 15 2025"

    const todaysAppointments = appointments.filter(
      a => new Date(a.date).toDateString() === todayStr
    );

    const totalAppointments = todaysAppointments.length;
    const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
    const confirmedCount = todaysAppointments.filter(a => a.status === "confirmed").length;

    // ✅ Revenue includes all appointments today (pending + confirmed)
    const todayRevenue = todaysAppointments.reduce((sum, a) => sum + Number(a.price || 0), 0);

    // 4️⃣ Growth ratio (compared to yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const yesterdayAppointments = appointments.filter(
      a => new Date(a.date).toDateString() === yesterdayStr
    );
    const growthRatio = yesterdayAppointments.length > 0
      ? ((totalAppointments - yesterdayAppointments.length) / yesterdayAppointments.length) * 100
      : 0;

    // 5️⃣ Build dashboard response
    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingCount,
        confirmedCount,
        todayRevenue,
        growthRatio: growthRatio.toFixed(2),
      },
      recentAppointments: todaysAppointments.slice(-5).reverse(), // last 5
    });

  } catch (err) {
    next(err);
  }
});


router.get(
  "/saloon/:saloonId/dashboard",
  AuthMiddlewares.checkAuth,
  getSaloonDashboardStats
);

router.get(
  "/saloon/appointments",
  AuthMiddlewares.checkAuth,
  getAppointmentsBySaloon
);

router.get(
  "/saloon/appointments/servicewise",
  AuthMiddlewares.checkAuth,
  getServiceWiseCounts
);


router.get(
  "/saloon/appointments/:id",
  AuthMiddlewares.checkAuth,
  getAppointmentById
);

router.put(
  "/saloon/appointments/:id/status",
  AuthMiddlewares.checkAuth,
  updateAppointmentStatus
);


router.post('/saloon/offline/appointments', AuthMiddlewares.checkAuth, addOfflineAppointment);
router.get('/saloon/offline/appointmentsssss',   AuthMiddlewares.checkAuth, getOfflineAppointments);

router.delete(
  '/saloon/offline/appointments/:id',
  AuthMiddlewares.checkAuth,
  deleteOfflineAppointment
);


router.put(
  "/saloon/offline/appointments/:id/status",
  AuthMiddlewares.checkAuth,
  updateOfflineAppointmentStatus
);

router.get(
  "/saloon/offline/appointments/:id",
  AuthMiddlewares.checkAuth,
  getOfflineAppointmentById
);




// router.get('/saloon/appointments/filter', AuthMiddlewares.checkAuth, filterAppointments);
router.post('/saloon/appointments/filter', AuthMiddlewares.checkAuth, filterAppointments);



// router.get(get
//   "/saloon/today-stats",
//   AuthMiddlewares.checkAuth,
//   getTodayAppointmentsStats
// );
// Saloon Location


router.get('/saloon/fetch/location', AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Get all locations for this owner
    const locations = await Location.find({ owner: ownerId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    next(error);
  }
});



// router.post('/user', createUser);

// router.post('/onwer/register', AuthMiddlewares.checkAuth,registerSaloon);


router.post('/onwer/register', AuthMiddlewares.checkAuth,
    upload.single("profileImage"),  registerSaloon);



router.get('/saloon/details', AuthMiddlewares.checkAuth, getSaloonDetails);
router.post('/saloon/location/add', AuthMiddlewares.checkAuth, addSaloonLocation);
router.get('/fetch/saloon/location', AuthMiddlewares.checkAuth, getSaloonLocation);
router.put('/update/saloon/location', AuthMiddlewares.checkAuth, putSaloonNewLocation);



router.get('/saloon/full-details', AuthMiddlewares.checkAuth, getFullSaloonDetails);
router.get('/saloon/full-details', AuthMiddlewares.checkAuth, getFullSaloonDetails);
router.get('/saloon/full/details/:saloonId', getFullSaloonDetailsUsingId);
router.get('/saloon/details/:saloonId', getSaloonUsingId);
router.get('/saloon/public/details/:saloonId', getPublicOwnerLocation);
router.get('/saloon/by-owner', getSaloonByOwnerId);


router.get('/nearby/salons', getNearbySalonsController);

router.put('/saloon/details/update', AuthMiddlewares.checkAuth, updateSaloonDetails);
router.put('/saloon/location/update', AuthMiddlewares.checkAuth, updateSaloonLocation);
router.delete('/saloon/location/delete', AuthMiddlewares.checkAuth, deleteSaloonLocation);
router.delete('/saloon/location/deletes',  deleteSaloonLocation);
router.get('/saloon/mobile/num', AuthMiddlewares.checkAuth, getRegisteredMobileNumber);
router.get('/saloon/register/mobile', AuthMiddlewares.checkAuth, getSaloonRegisteredMobileNumber);
router.put('/saloon/update-mobile', AuthMiddlewares.checkAuth, updateSaloonMobileNumber);
router.put('/saloon/data/update', AuthMiddlewares.checkAuth, updateSaloonData);
router.put('/saloon/operating-hours', AuthMiddlewares.checkAuth, updateOperatingHours);
router.get('/saloon/operating-hours', AuthMiddlewares.checkAuth, getOperatingHours);
router.put('/saloon/social-links', AuthMiddlewares.checkAuth, updateSocialLinks);
router.get('/saloon/fetch/social-links', AuthMiddlewares.checkAuth, getSocialLinks);

// router.post('/saloon/content', AuthMiddlewares.checkAuth, addSaloonContent);

router.post(
  "/saloon/content",
  AuthMiddlewares.checkAuth,
  upload.single("profile"), 
  addSaloonContent
);
router.get('/saloon/content/:saloonId', getPublicSaloonContent);
router.get('/saloon/content', AuthMiddlewares.checkAuth, getOwnerSaloonContent);


router.get('/saloon/:saloonId/operating/hours', getPublicOperatingHours);
// router.put('/saloon/upload-logo',
// AuthMiddlewares.checkAuth,
//   uploadSaloonImage.single('logo'),
//   uploadSaloonLogo
// );
// router.put(
//   '/saloon/upload-logo',
//   AuthMiddlewares.checkAuth,
//   uploadSaloonImage.array('images', 5),
//   uploadSaloonImages
// );

router.put(
  "/saloon/upload-logo",
  AuthMiddlewares.checkAuth,
  uploadsaloonservice.array("images", 5), // ✅ fixed
  uploadSaloonImages
);

router.delete(
  '/saloon/image/:imageId',
  AuthMiddlewares.checkAuth,
  deleteSaloonImage
);


router.get('/saloon/fetch/photos', AuthMiddlewares.checkAuth, getAllImages);

// router.delete(
//   '/saloon/delete/image/:imageName',
//   AuthMiddlewares.checkAuth,
//   deleteSaloonImage
// );


router.post(
  '/saloon/team/member/registration',
  AuthMiddlewares.checkAuth,
  uploadTeamMemberProfile.single('profile'), // single file named 'profile'
  addTeamMember
);

router.get('/saloon/team/membe/list', AuthMiddlewares.checkAuth, getTeamMembers);

router.get('/saloon/team/member/performer', AuthMiddlewares.checkAuth, getTopPerformers);


router.put(
  '/saloon/team/member/update/:id',
  AuthMiddlewares.checkAuth,
  uploadTeamMemberProfile.single('profile'),  // optional profile image update
  updateTeamMember
);
router.get('/saloon/team-members', AuthMiddlewares.checkAuth, getAllTeamMembers);

router.get("/saloon/team/member/:id", AuthMiddlewares.checkAuth, getTeamMemberById);

router.delete('/saloon/team-member/:id', AuthMiddlewares.checkAuth, deleteTeamMember);

router.post(
  '/saloon/service/registration',
  AuthMiddlewares.checkAuth,
  uploadServiceLogo.single('logo'), // 'logo' must match the file field name in Postman/form-data
  createService
);

// router.post(
//  '/saloon/service/registration',
//   AuthMiddlewares.checkAuth,
//  upload.single("logo"),
//   createService
// );


router.get('/saloon/:saloonId/team', getTeamMembersBySaloonId);


router.put(
  '/saloon/service/public/:serviceId',
  updateService
);

router.put(
  '/saloon/service/:serviceId',
  AuthMiddlewares.checkAuth,
  updateService
);


router.get(
  '/saloon/services',
  AuthMiddlewares.checkAuth,
  getSaloonServices
);


// router.get(
//   '/saloon/services/public',
//   getSaloonServices
// );

router.get(
  '/saloon/fetch/services',
  getAllRegisteredServices
);


router.get(
  '/saloon/fetch/active/services',
  getAllRegisteredActiveServices
);







router.get('/category/:category', getSaloonsByCategory);

router.get('/categorys/:category', getSaloonsByCategorys);


router.get("/saloon/public/:saloonId/services", getPublicServicesBySaloonId);

router.delete(
  '/saloon/service/:serviceId',
  AuthMiddlewares.checkAuth,
  deleteService
);

router.get('/custome/search', searchSalons);
router.post(
  '/saloon/holiday',
  AuthMiddlewares.checkAuth,
  setHoliday
);

router.get(
  '/saloon/fetch/holidays',
  AuthMiddlewares.checkAuth,
  getHolidays
);

router.delete(
  '/saloon/holiday/:holidayId',
  AuthMiddlewares.checkAuth,
  deleteHoliday
);

router.put(
  '/saloon/holiday/:holidayId',
  AuthMiddlewares.checkAuth,
  updateHoliday
);

router.get('/saloons/search', SaloonsController.searchSaloons);
router.get('/saloon/nearby', LocationownerController.getNearbySaloons);
router.get('/all-saloons', LocationownerController.getAllSaloons);




router.post(
  '/auth/logout',
  AuthMiddlewares.checkAuth,
  logout
);





router.post('/saloon/create', AuthMiddlewares.checkAuth, createUser);

// Get all users (protected)
router.get('/users', AuthMiddlewares.checkAuth, getAllUsers);


// router.get('/saloon/profile', AuthMiddlewares.checkAuth, getMySaloonProfile);


// router.get('/profile', AuthMiddlewares.checkAuth, getSaloonProfile);
router.put('/:id/saloon', AuthMiddlewares.checkAuth, updateSaloonInfo);















// Get All Saloon Using city name

router.get('/get/all/saloon/location/wise', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    // Find all locations in the given city
    const locations = await Location.find({ city: city }).populate('saloon');

    // Map locations to saloon details + location
    const saloonsInCity = locations.map((loc) => ({
      id: loc.saloon._id,
      name: loc.saloon.name,
      owner: loc.saloon.owner,
      services: loc.saloon.services || [],
      city: loc.city,
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address || ''
    }));

    res.json(saloonsInCity);

  } catch (error) {
    console.error("Error fetching salons:", error);
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/offer/add", AuthMiddlewares.checkAuth, addOffer);

// Get all offers for owner
router.get("/offer/all", AuthMiddlewares.checkAuth, getOffers);
router.get("/offer/all/active", AuthMiddlewares.checkAuth, getOffersWithData);



// Get single offer by ID
router.get("/offer/:id", AuthMiddlewares.checkAuth,getOfferById);

// Update an offer
router.put("/update/offer/:id", AuthMiddlewares.checkAuth, updateOffer);

// Delete an offer
router.delete("/offer/:id", AuthMiddlewares.checkAuth,deleteOffer);

router.put("/admin/trending/update", AuthMiddlewares.checkAuth,updateTrendingSaloons);

// Public or authenticated route to get trending saloons
router.get("/saloons/trending", getTrendingSaloons);

// Get reviews of a saloon
// router.get("/saloons/:saloonId/reviews", getSaloonReviews);

 router.get("/saloons/:saloonId/reviews", forMultipleSaloonReview);
router.get("/saloons/:saloonId/reviews/list", forMultipleSaloonReviews);
router.post("/add-reply",  AuthMiddlewares.checkAuth ,addReply);

 router.get("/saloons/reply/:saloonId/reviews", getSaloonReview);



 


// Saloon owner replies to review
router.put(
  "/reviews/:reviewId/reply",
  AuthMiddlewares.checkAuth,
  replyToReview
);
router.get("/offers/active", getAllActiveOffers);
export default router;
