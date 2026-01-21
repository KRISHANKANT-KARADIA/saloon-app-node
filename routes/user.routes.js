import express from 'express';
import mongoose from 'mongoose';
import { AuthMiddlewares } from '../middlewares/auth.middleware.js';
import Location from '../models/location.model.js';
import Saloon from '../models/saloon.model.js'; 
import { getAllUsers, createUser ,getMySaloonProfile, updateSaloonInfo, getRegisteredMobileNumber} from '../controllers/user.controller.js';
import {  addSaloonContent,getPublicSaloonContent, deleteSaloonImage, getAllImages, getFullSaloonDetails, getFullSaloonDetailsUsingId, getOperatingHours, getPublicOperatingHours, getPublicOwnerLocation, getSaloonDetails, getSaloonUsingId, getSocialLinks, registerSaloon, updateOperatingHours, updateSaloonData, updateSaloonMobileNumber, updateSocialLinks, uploadSaloonImages, uploadSaloonLogo, getAppointmentsBySaloon, getSaloonDashboardStats, getLast7DaysDashboardStats, getUpcomingAppointments,getTodayRevenue,getTotalAppointments,getDashboardData,getPendingAppointments,getRevenueGrowth,getPastAppointments, addOfflineAppointment, getOfflineAppointments, deleteOfflineAppointment, updateOfflineAppointmentStatus, getOfflineAppointmentById, getAppointmentById, updateAppointmentStatus, filterAppointments, getOwnerSaloonContent, getServiceWiseCounts, getSaloonByOwnerId, getDashboardDataC, sayHello, getServiceWiseAppointmentsNe, getCumulativeDashboard, completeAppointmentByBookingRef, getCurrentsAppointments, getAllAppointments, getAppointmentByBookingRef, getPastAppointmentsProfessionalIdOnly, getPastAppointmentsFull, getUpcomingAppointmentsFull, getTodaysAppointmentsFull, getAllAppointmentsFull, generateReport, fullReport, getRejectedAppointments, getPublicOperatingBookingHours, deleteSaloonContent, getPublicOperatingBookingHoursP, filterSaloons, getAllSaloonss} from '../controllers/saloon.controller.js';
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
import { getTodayAppointments, getTodayReport } from '../controllers/appointment.controller.js';



const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads/saloon');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });



const uploadDirServices = path.join(process.cwd(), "uploads/services");
if (!fs.existsSync(uploadDirServices)) {
  fs.mkdirSync(uploadDirServices, { recursive: true });
}


const storageser = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirServices),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const uploadservice = multer({ storageser });



const uploadSaloonImageData = path.join(process.cwd(), "uploads/saloons");
if (!fs.existsSync(uploadSaloonImageData)) {
  fs.mkdirSync(uploadSaloonImageData, { recursive: true });
}


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
    cb(null, "uploads/saloonContent/"); 
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});



const uploadContent = multer({ storageContent });


export const uploadsaloonservice = multer({ storage: storageImageSaloon });



router.post(
  '/coupon/add',
  AuthMiddlewares.checkAuth,
 addCoupon
);


router.get(
  '/coupon/:code',
  AuthMiddlewares.checkAuth,
 getCoupon
);


router.post(
  '/coupon/verify',
 
verifyCoupon
);

router.get(
  '/coupon/all',

  getAllCoupons
);

router.put('/saloon/owner/update-mobile', AuthMiddlewares.checkAuth, async (req, res) => {
  try {
    const ownerId = res.locals.user.id;   
    const { newMobile } = req.body;

    if (!newMobile) {
      return res.status(400).json({ success: false, message: "New mobile number is required" });
    }

  
    const existingOwner = await ownerModel.findOne({ mobile: newMobile });
    if (existingOwner) {
      return res.status(400).json({ success: false, message: "This mobile number is already registered" });
    }

  
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

   
    const saloon = await Saloon.findOne({ owner: ownerId });

    const locations = await Location.find({ owner: ownerId })
      .populate('saloon') 
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


router.put(
  '/saloon/update/:id',
  AuthMiddlewares.checkAuth,
  upload.single('logo'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const ownerId = res.locals.user.id;
      const { name, ownerName, mobile } = req.body;

      const saloon = await Saloon.findOne({ _id: id, owner: ownerId });
      if (!saloon) {
        return res.status(404).json({
          success: false,
          message: 'Saloon not found or unauthorized',
        });
      }

    
      if (name) saloon.name = name;
      if (ownerName) saloon.ownerName = ownerName;
      if (mobile) saloon.mobile = mobile;

      const BASE_URL =
        'https://saloon-app-node-50470848550.asia-south1.run.app';

      if (req.file) {
        saloon.logo = `${BASE_URL}/uploads/saloon/${req.file.filename}`;
      }

      await saloon.save();

      return res.status(200).json({
        success: true,
        message: 'Saloon updated successfully',
        saloon,
      });
    } catch (error) {
      console.error('Saloon update error:', error);
      next(error);
    }
  }
);



router.get('/saloon/fetch/public/details', async (req, res, next) => {
  try {
  
    const saloons = await Saloon.find()
      .sort({ createdAt: -1 });

 
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
    
    const saloons = await Saloon.find({}, { _id: 1, name: 1, logo: 1 })
      .sort({ createdAt: -1 });

    
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


router.get('/saloon/fetch/top/twenty/public', async (req, res, next) => {
  try {
    const saloons = await Saloon.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select("name logo rating city owner description operatingHours"); 

    const saloonsWithLogo = saloons.map(saloon => ({
      _id: saloon._id,
      name: saloon.name,
      logo: saloon.logo
        ? saloon.logo.startsWith('http')
          ? saloon.logo
          : `https://saloon-app-node-50470848550.asia-south1.run.app/uploads/saloon/${saloon.logo}`
        : `https://saloon-app-node-50470848550.asia-south1.run.app/default-logo.jpg`,
      rating: saloon.rating || null,
      city: saloon.city || null,
      owner: saloon.owner || null,
      description: saloon.description || null,
      operatingHours: saloon.operatingHours || null,
    }));

    
    const locations = await Location.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select("_id owner address1 city lat long saloon");

    res.json({
      success: true,
      message: 'Top 20 saloons fetched successfully',
      count: saloonsWithLogo.length,
      saloons: saloonsWithLogo,
      locations
    });

  } catch (error) {
    console.error('Error fetching saloons:', error);
    next(error);
  }
});

router.get(
  "/saloon/fetch/top/twenty/public/city",
  async (req, res, next) => {
    try {
      const { city } = req.query;

      if (!city) {
        return res.status(400).json({
          success: false,
          message: "City query is required",
        });
      }

   
      const locations = await Location.find({
        address1: { $regex: city, $options: "i" },
      }).select("owner address1 city");

      if (!locations.length) {
        return res.json({
          success: true,
          message: `No saloons found in ${city}`,
          count: 0,
          saloons: [],
          locations: [],
        });
      }

    
      const ownerIds = locations.map(loc => loc.owner);

      const saloons = await Saloon.find({
        owner: { $in: ownerIds },
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("name logo rating owner description operatingHours");

   
      const saloonsWithLogo = saloons.map(saloon => ({
        _id: saloon._id,
        name: saloon.name,
        logo: saloon.logo
          ? saloon.logo.startsWith("http")
            ? saloon.logo
            : `https://saloon-app-node-50470848550.asia-south1.run.app/uploads/saloon/${saloon.logo}`
          : `https://saloon-app-node-50470848550.asia-south1.run.app/default-logo.jpg`,
        rating: saloon.rating || null,
        owner: saloon.owner,
        description: saloon.description || null,
        operatingHours: saloon.operatingHours || null,
      }));

      return res.json({
        success: true,
        message: `Top saloons in ${city}`,
        count: saloonsWithLogo.length,
        saloons: saloonsWithLogo,
        locations,
      });
    } catch (error) {
      console.error("City wise saloon error:", error);
      next(error);
    }
  }
);


router.post('/owner/location', AuthMiddlewares.checkAuth, addSaloonLocation);
router.get('/owner/location', AuthMiddlewares.checkAuth, getLocationBySaloonId);





router.get(
  '/saloon/:saloonId/appointments',
 
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
  "/saloon/getPastAppointmentsFull",
  AuthMiddlewares.checkAuth,
  getPastAppointmentsFull
);
router.get(
  "/saloon/getAllAppointmentsFull",
  AuthMiddlewares.checkAuth,
  getAllAppointmentsFull
);



router.get(
  "/saloon/current/appointment",
  AuthMiddlewares.checkAuth,
  getCurrentsAppointments
);

router.get(
  "/saloon/all/appointment",
  AuthMiddlewares.checkAuth,
  getAllAppointments 
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
  "/saloon/getCumulativeDashboard",
  AuthMiddlewares.checkAuth,
  getCumulativeDashboard
);


router.get(
  "/saloon/getCurrentAppointmentsWithProfessional",
  AuthMiddlewares.checkAuth,
  getPastAppointmentsProfessionalIdOnly

);


router.get(
  "/saloon/getUpcomingAppointmentsFull",
  AuthMiddlewares.checkAuth,
  getUpcomingAppointmentsFull
  
);

router.get(
  "/saloon/getRejectedAppointment",
  AuthMiddlewares.checkAuth,
  getRejectedAppointments
  
);





router.get(
  "/saloon/getTodaysAppointmentsFull",
  AuthMiddlewares.checkAuth,
  getTodaysAppointmentsFull
  
  
);








router.get(
  "/saloon/today-report",
  AuthMiddlewares.checkAuth,
 getDashboardDataC
);

router.get(
  "/saloon/appointmentwise/top/service",
  AuthMiddlewares.checkAuth,
 getServiceWiseAppointmentsNe

);


router.get("/hello", sayHello);




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

   
    const saloon = await Saloon.findOne({ owner: new mongoose.Types.ObjectId(ownerId) });
    if (!saloon) return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));

 
    const appointments = await Appointment.find({ saloonId: new mongoose.Types.ObjectId(saloon._id) })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

   
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todaysAppointments = appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      return appointmentDate >= startOfDay && appointmentDate <= endOfDay;
    });

    
    const totalAppointments = todaysAppointments.length;
    const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
    const confirmedCount = todaysAppointments.filter(a => ["confirmed", "accepted"].includes(a.status)).length;
    const todayRevenue = todaysAppointments
      .filter(a => ["confirmed", "completed"].includes(a.status))
      .reduce((sum, a) => sum + Number(a.price || 0), 0);

   
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

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingCount,
        confirmedCount,
        todayRevenue,
        growthRatio: growthRatio.toFixed(2),
      },
      recentAppointments: todaysAppointments.slice(-5).reverse() 
    });

  } catch (err) {
    next(err);
  }
});



router.get("/saloon/dashboard1", AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;


    const saloon = await Saloon.findOne({ owner: new mongoose.Types.ObjectId(ownerId) });

    if (!saloon) return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));

    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

   
    const today = new Date();
    const todayStr = today.toDateString(); 

    const todaysAppointments = appointments.filter(a => new Date(a.date).toDateString() === todayStr);

    const totalAppointments = todaysAppointments.length;
    const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
    const confirmedCount = todaysAppointments.filter(a => a.status === "confirmed").length;
    const todayRevenue = todaysAppointments
      .filter(a => a.status === "confirmed")
      .reduce((sum, a) => sum + Number(a.price || 0), 0);

 
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const yesterdayAppointments = appointments.filter(a => new Date(a.date).toDateString() === yesterdayStr);
    const growthRatio = yesterdayAppointments.length > 0
      ? ((totalAppointments - yesterdayAppointments.length) / yesterdayAppointments.length) * 100
      : 0;

  
    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingCount,
        confirmedCount,
        todayRevenue,
        growthRatio: growthRatio.toFixed(2),
      },
      recentAppointments: todaysAppointments.slice(-5).reverse(), 
    });

  } catch (err) {
    next(err);
  }
});



router.get(
  "/saloon/week/dashboard99",
  AuthMiddlewares.checkAuth,
  getTodayAppointments
);


router.get("/saloon/week/dashboard1", AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

   
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));


    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

   
    const today = new Date();

    
    const todaysAppointments = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return (
        apptDate.getDate() === today.getDate() &&
        apptDate.getMonth() === today.getMonth() &&
        apptDate.getFullYear() === today.getFullYear()
      );
    });

 
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const yesterdayAppointments = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return (
        apptDate.getDate() === yesterday.getDate() &&
        apptDate.getMonth() === yesterday.getMonth() &&
        apptDate.getFullYear() === yesterday.getFullYear()
      );
    });

    
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

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const revenueByWeek = [0, 0, 0, 0];

    appointments.forEach(a => {
      if (a.status === "confirmed") {
        const d = new Date(a.date);
        if (d.getMonth() === today.getMonth()) {
          const day = d.getDate();
          if (day <= 7) revenueByWeek[0] += Number(a.price || 0);
          else if (day <= 14) revenueByWeek[1] += Number(a.price || 0);
          else if (day <= 21) revenueByWeek[2] += Number(a.price || 0);
          else revenueByWeek[3] += Number(a.price || 0);
        }
      }
    });

   
    const recentAppointments = [...todaysAppointments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

  
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
      recentAppointments,
    });

  } catch (err) {
    next(err);
  }
});


router.get("/saloon/week/dashboard12", AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

  
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

 
    const convertDate = (input) => {
      if (!input) return null;

 
      if (typeof input === "string") {
        const [y, m, d] = input.split("-").map(Number);
        return new Date(y, m - 1, d);
      }

      
      return new Date(input);
    };

   
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

   
    const recentAppointments = [...todaysAppointments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    
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


router.get("/saloon/week/dashboard13", AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

  
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));

    
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    const today = new Date();
    const todayStr = today.toDateString(); 

    const todaysAppointments = appointments.filter(a => new Date(a.date).toDateString() === todayStr);

    const totalAppointments = todaysAppointments.length;
    const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
    const confirmedCount = todaysAppointments.filter(a => a.status === "confirmed").length;
    const todayRevenue = todaysAppointments
      .filter(a => a.status === "confirmed")
      .reduce((sum, a) => sum + Number(a.price || 0), 0);

   
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const yesterdayAppointments = appointments.filter(a => new Date(a.date).toDateString() === yesterdayStr);
    const growthRatio = yesterdayAppointments.length > 0
      ? ((totalAppointments - yesterdayAppointments.length) / yesterdayAppointments.length) * 100
      : 0;


    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const revenueByWeek = [0, 0, 0, 0]; 

    appointments.forEach(a => {
      if (a.status === "confirmed") {
        const date = new Date(a.date);
        if (date.getMonth() === today.getMonth()) {
          const day = date.getDate();
          if (day >= 1 && day <= 7) revenueByWeek[0] += Number(a.price || 0);
          else if (day >= 8 && day <= 14) revenueByWeek[1] += Number(a.price || 0);
          else if (day >= 15 && day <= 21) revenueByWeek[2] += Number(a.price || 0);
          else revenueByWeek[3] += Number(a.price || 0);
        }
      }
    });

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
      recentAppointments: todaysAppointments.slice(-5).reverse(), 
    });

  } catch (err) {
    next(err);
  }
});


router.get("/saloon/dashboard2", AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

   
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));

  
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    
    const today = new Date();
    const todayStr = today.toDateString(); 

    const todaysAppointments = appointments.filter(
      a => new Date(a.date).toDateString() === todayStr
    );

    const totalAppointments = todaysAppointments.length;
    const pendingCount = todaysAppointments.filter(a => a.status === "pending").length;
    const confirmedCount = todaysAppointments.filter(a => a.status === "confirmed").length;

  
    const todayRevenue = todaysAppointments.reduce((sum, a) => sum + Number(a.price || 0), 0);

  
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const yesterdayAppointments = appointments.filter(
      a => new Date(a.date).toDateString() === yesterdayStr
    );
    const growthRatio = yesterdayAppointments.length > 0
      ? ((totalAppointments - yesterdayAppointments.length) / yesterdayAppointments.length) * 100
      : 0;

   
    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingCount,
        confirmedCount,
        todayRevenue,
        growthRatio: growthRatio.toFixed(2),
      },
      recentAppointments: todaysAppointments.slice(-5).reverse(), 
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

router.get(
  "/saloon/appointment/ref/:bookingRef",
  AuthMiddlewares.checkAuth,
  getAppointmentByBookingRef
);

router.put(
  "/saloon/appointments/:id/status",
  AuthMiddlewares.checkAuth,
  updateAppointmentStatus
);

router.put("/saloon/appointments/completebyref", 
   AuthMiddlewares.checkAuth,
    completeAppointmentByBookingRef);



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



router.post('/saloon/appointments/filter', AuthMiddlewares.checkAuth, filterAppointments);


router.post('/saloon/filters', filterSaloons);
router.get("/saloonss", getAllSaloonss);

router.get('/saloon/:saloonId/report', 
  AuthMiddlewares.checkAuth,
  generateReport);



router.get('/saloon/fetch/location', AuthMiddlewares.checkAuth, async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

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


router.post(
  "/saloon/content",
  AuthMiddlewares.checkAuth,
  upload.single("profile"), 
  addSaloonContent
);
router.get('/saloon/content/:saloonId', getPublicSaloonContent);
router.get('/saloon/content', AuthMiddlewares.checkAuth, getOwnerSaloonContent);


router.delete("/saloon/content/:contentId", AuthMiddlewares.checkAuth, deleteSaloonContent);


router.get('/saloon/:saloonId/operating/hours', getPublicOperatingHours);
router.get('/saloon/:saloonId/operating/booking/hours', getPublicOperatingBookingHours);
router.get('/saloon/:saloonId/operating/booking/hoursP', getPublicOperatingBookingHoursP);



router.put(
  "/saloon/upload-logo",
  AuthMiddlewares.checkAuth,
  uploadsaloonservice.array("images", 5), 
  uploadSaloonImages
);

router.delete(
  '/saloon/image/:imageId',
  AuthMiddlewares.checkAuth,
  deleteSaloonImage
);


router.get('/saloon/fetch/photos', AuthMiddlewares.checkAuth, getAllImages);



router.post(
  '/saloon/team/member/registration',
  AuthMiddlewares.checkAuth,
  uploadTeamMemberProfile.single('profile'), 
  addTeamMember
);

router.get('/saloon/team/membe/list', AuthMiddlewares.checkAuth, getTeamMembers);

router.get('/saloon/team/member/performer', AuthMiddlewares.checkAuth, getTopPerformers);


router.put(
  '/saloon/team/member/update/:id',
  AuthMiddlewares.checkAuth,
  uploadTeamMemberProfile.single('profile'), 
  updateTeamMember
);
router.get('/saloon/team-members', AuthMiddlewares.checkAuth, getAllTeamMembers);

router.get("/saloon/team/member/:id", AuthMiddlewares.checkAuth, getTeamMemberById);

router.delete('/saloon/team-member/:id', AuthMiddlewares.checkAuth, deleteTeamMember);

router.post(
  '/saloon/service/registration',
  AuthMiddlewares.checkAuth,
  uploadServiceLogo.single('logo'), 
  createService
);



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



router.get(
  '/saloon/fetch/services',
  getAllRegisteredServices
);


router.get(
  '/saloon/fetch/active/services',
  getAllRegisteredActiveServices
);




  router.get("/report/files",fullReport);




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


router.get('/users', AuthMiddlewares.checkAuth, getAllUsers);


router.put('/:id/saloon', AuthMiddlewares.checkAuth, updateSaloonInfo);




router.get('/get/all/saloon/location/wise', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

   
    const locations = await Location.find({ city: city }).populate('saloon');

   
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


router.get("/offer/all", AuthMiddlewares.checkAuth, getOffers);
router.get("/offer/all/active", AuthMiddlewares.checkAuth, getOffersWithData);




router.get("/offer/:id", AuthMiddlewares.checkAuth,getOfferById);


router.put("/update/offer/:id", AuthMiddlewares.checkAuth, updateOffer);


router.delete("/offer/:id", AuthMiddlewares.checkAuth,deleteOffer);

router.put("/admin/trending/update", AuthMiddlewares.checkAuth,updateTrendingSaloons);


router.get("/saloons/trending", getTrendingSaloons);


 router.get("/saloons/:saloonId/reviews", forMultipleSaloonReview);
router.get("/saloons/:saloonId/reviews/list", forMultipleSaloonReviews);
router.post("/add-reply",  AuthMiddlewares.checkAuth ,addReply);

 router.get("/saloons/reply/:saloonId/reviews", getSaloonReview);


router.get('/saloon/filter', async (req, res, next) => {
  try {
    const { lat, long, type } = req.query;
    const userLat = parseFloat(lat);
    const userLong = parseFloat(long);
    const maxDistanceInMeters = 10 * 1000; // 10 KM radius

    let query = {};
    let sortOptions = { createdAt: -1 };

    // Basic Base URL for images
    const BASE_URL = "https://saloon-app-node-50470848550.asia-south1.run.app";

    // 1. Recommended: Top Rating + Near By (10KM)
    if (type === 'recommended') {
      query = { 
        rating: { $gte: 4 }, // High rating
        // Aap yahan 'totalAppointments' field bhi add kar sakte hain agar model mein hai
      };
      sortOptions = { rating: -1 };
    }

    // 2. Nearest: Distance wise (Requires lat/long)
    // 3. Price Wise: Low to High (Requires lat/long + 10KM radius)
    
    // Agar lat/long provide kiye gaye hain, toh hum Aggregation use karenge
    let aggregatePipeline = [];

    if (userLat && userLong) {
      aggregatePipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [userLong, userLat] },
          distanceField: "distance",
          maxDistance: maxDistanceInMeters,
          spherical: true
        }
      });
    }

    // Filter by type logic
    if (type === 'rating') {
      sortOptions = { rating: -1 };
    } else if (type === 'price') {
      sortOptions = { avgPrice: 1 }; // Maan lijiye field 'avgPrice' hai
    }

    const saloons = await Saloon.find(query)
      .sort(sortOptions)
      .limit(20)
      .select("name logo rating city owner description operatingHours avgPrice");

    const saloonsWithLogo = saloons.map(saloon => ({
      ...saloon._doc,
      logo: saloon.logo
        ? saloon.logo.startsWith('http')
          ? saloon.logo
          : `${BASE_URL}/uploads/saloon/${saloon.logo}`
        : `${BASE_URL}/default-logo.jpg`,
    }));

    res.json({
      success: true,
      count: saloonsWithLogo.length,
      data: saloonsWithLogo
    });

  } catch (error) {
    console.error('Filter Error:', error);
    next(error);
  }
});


router.get('/saloon/filter/advanced', async (req, res, next) => {
  try {
    const { 
      lat, 
      long, 
      type, // recommended, nearest, rating, price
      salonType // Male, Female, Unisex, Everyone
    } = req.query;

    const userLat = parseFloat(lat);
    const userLong = parseFloat(long);
    const radius = 10 * 1000; // 10 KM in meters
    const BASE_URL = "https://saloon-app-node-50470848550.asia-south1.run.app";

    // 1. Basic Query Object
    let query = {};
    if (salonType) {
      query.salonType = salonType;
    }

    // 2. Sorting Logic
    let sortOptions = { createdAt: -1 };

    if (type === 'recommended') {
      // Top bookings aur high rating ko prioritize karein
      sortOptions = { bookingsCount: -1, rating: -1 };
      query.rating = { $gte: 3.5 }; 
    } else if (type === 'rating') {
      sortOptions = { rating: -1 };
    } else if (type === 'price') {
      // Note: Aapke model mein price field nahi dikhi, 
      // isliye hum isse default sort par rakh rahe hain. 
      // Agar 'price' field add karein toh { price: 1 } use karein.
      sortOptions = { createdAt: -1 };
    }

    // 3. Execution (GeoNear if lat/long exists, else normal find)
    let saloons;

    if (userLat && userLong) {
      // Agar lat/long hai toh Location model se connect karke 10km filter
      // Ya Saloon model mein agar location field hai toh direct geoNear
      saloons = await Saloon.find(query)
        .sort(sortOptions)
        .limit(20);
        
      // Note: Professional approach ke liye 'location' field ko 2dsphere index dena zaruri hai
    } else {
      saloons = await Saloon.find(query)
        .sort(sortOptions)
        .limit(20);
    }

    // 4. Data Formatting (Logo and Fields)
    const formattedSaloons = saloons.map(saloon => ({
      _id: saloon._id,
      name: saloon.name,
      salonType: saloon.salonType,
      rating: saloon.rating,
      bookingsCount: saloon.bookingsCount,
      logo: saloon.logo
        ? saloon.logo.startsWith('http')
          ? saloon.logo
          : `${BASE_URL}/uploads/saloon/${saloon.logo}`
        : `${BASE_URL}/default-logo.jpg`,
      operatingHours: saloon.operatingHours,
      isTrending: saloon.isTrending
    }));

    res.json({
      success: true,
      message: `${type || 'Salons'} fetched successfully`,
      count: formattedSaloons.length,
      saloons: formattedSaloons
    });

  } catch (error) {
    console.error('Filter Error:', error);
    next(error);
  }
});
 



router.put(
  "/reviews/:reviewId/reply",
  AuthMiddlewares.checkAuth,
  replyToReview
);
router.get("/offers/active", getAllActiveOffers);
export default router;
