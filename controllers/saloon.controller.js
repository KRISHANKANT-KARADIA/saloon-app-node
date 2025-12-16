import mongoose from "mongoose";
import Saloon from '../models/saloon.model.js';
import Location from '../models/location.model.js'; 
import Owner from '../models/owner.model.js'
import ownerModel from '../models/owner.model.js';
import OfflineBooking from "../models/OfflineBooking.js";
import fs from 'fs';
import path from 'path';
import Appointment from '../models/appointment.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';
import { v4 as uuidv4 } from 'uuid';
import SaloonContentModel from '../models/SaloonContent.model.js';

import OfflineAppointment from '../models/OfflineAppointment.js';
import { Parser } from 'json2csv';
import teamMemberModel from "../models/teamMember.model.js";
// const IMAGE_BASE_URL = "https://saloon-app-node-50470848550.asia-south1.run.app/uploads/saloon";
import { createObjectCsvWriter } from "csv-writer";
import PDFDocument from "pdfkit";
const IMAGE_BASE_URL = "https://saloon-app-node-50470848550.asia-south1.run.app/uploads/saloon";
// Path to store PDF/CSV reports

const reportsPath = path.join(process.cwd(), "public/reports");

// Ensure directory exists
if (!fs.existsSync(reportsPath)) {
  fs.mkdirSync(reportsPath, { recursive: true });
}


export const getSaloonUsingId = async (req, res, next) => {
  try {
    const { saloonId } = req.params; // saloonId comes from route /api/saloon/:saloonId

    if (!saloonId) {
      return res.status(400).json({ success: false, message: "Saloon ID is required" });
    }

    // 1. Find saloon by ID
    const saloon = await Saloon.findById(saloonId);
    if (!saloon) {
      return res.status(404).json({ success: false, message: "Saloon not found" });
    }

    // 2. Find location for this saloon
    // 👉 If Location schema has saloon field, use { saloon: saloon._id }
    // 👉 If Location schema has owner field, use { owner: saloon.owner }
    const location = await Location.findOne({ saloon: saloon._id }) || 
                     await Location.findOne({ owner: saloon.owner });

    // 3. Operating hours are already inside saloon.operatingHours
    const operatingHours = saloon.operatingHours || null;

    return res.status(200).json({
      success: true,
      message: "Saloon full details fetched successfully",
      saloon,
      location,
      operatingHours,
    });

  } catch (err) {
    console.error("Error fetching full saloon details:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSaloonByOwnerId = async (req, res) => {
  try {
    const { lat, long } = req.query;

    if (!lat || !long) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(long);
    const radiusInMeters = 40 * 1000; // 40 KM

    const userPoint = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    // ✅ STEP 1: Find ALL locations within 40km
    const locations = await Location.aggregate([
      {
        $geoNear: {
          near: userPoint,
          distanceField: "distance",
          spherical: true,
          maxDistance: radiusInMeters,
        },
      }
    ]);

    if (!locations.length) {
      return res.status(404).json({
        success: false,
        message: "No saloon found near your location",
      });
    }

    // ✅ STEP 2: Fetch saloon details for each location
    const saloonResults = [];

    for (const location of locations) {
      let saloon = null;

      if (location.saloon) {
        saloon = await Saloon.findById(location.saloon)
          .select("name logo rating city owner description operatingHours");
      }

      if (!saloon && location.owner) {
        saloon = await Saloon.findOne({ owner: location.owner })
          .select("name logo rating city owner description operatingHours");
      }

      if (saloon) {
        saloonResults.push({
          saloon: {
            ...saloon._doc,
            logo: saloon.logo
              ? saloon.logo.startsWith("http")
                ? saloon.logo
                : `${IMAGE_BASE_URL}/${saloon.logo}`
              : null,
          },
          location,
          distanceInKm: (location.distance / 1000).toFixed(2),
          operatingHours: saloon.operatingHours || null,
        });
      }
    }

    if (!saloonResults.length) {
      return res.status(404).json({
        success: false,
        message: "Saloon data missing for nearby locations",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Nearby saloons fetched successfully",
      userCoordinates: { latitude, longitude },
      totalSaloons: saloonResults.length,
      saloons: saloonResults,
    });

  } catch (err) {
    console.error("Error fetching saloons:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// export const getSaloonByOwnerId = async (req, res) => {
//   try {
//     const { lat, long } = req.query;

//     if (!lat || !long) {
//       return res.status(400).json({
//         success: false,
//         message: "Latitude and Longitude are required",
//       });
//     }

//     const latitude = parseFloat(lat);
//     const longitude = parseFloat(long);
//     const radiusInMeters = 40 * 1000; // 40 KM radius

//     const userPoint = {
//       type: "Point",
//       coordinates: [longitude, latitude],
//     };

//     // STEP 1: Find nearest location (without saloon filter)
//     const nearestLocation = await Location.aggregate([
//       {
//         $geoNear: {
//           near: userPoint,
//           distanceField: "distance",
//           spherical: true,
//           maxDistance: radiusInMeters,
//         },
//       },
//       { $limit: 1 },
//     ]);

//     if (!nearestLocation.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No saloon found near your location",
//       });
//     }

//     const location = nearestLocation[0];

//     // STEP 2: Fetch saloon details
//     // if saloon reference exists → fetch
//     let saloon = null;

//     if (location.saloon) {
//       saloon = await Saloon.findById(location.saloon)
//         .select("name logo rating city owner description operatingHours");
//     }

//     // fallback → find saloon using owner if needed
//     if (!saloon && location.owner) {
//       saloon = await Saloon.findOne({ owner: location.owner })
//         .select("name logo rating city owner description operatingHours");
//     }

//     if (!saloon) {
//       return res.status(404).json({
//         success: false,
//         message: "Saloon data missing for this location",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Nearest saloon fetched successfully",
//       userCoordinates: { latitude, longitude },
//       saloonCoordinates: location.geoLocation.coordinates,
//       distanceInKm: (location.distance / 1000).toFixed(2),

//       // full saloon data
//   //     saloon: {
//   //   ...saloon._doc,
//   //   logo: saloon.logo
//   //     ? `${IMAGE_BASE_URL}/${saloon.logo}`
//   //     : null
//   // },
//   saloon: {
//   ...saloon._doc,
//   logo: saloon.logo
//     ? saloon.logo.startsWith("http")
//       ? saloon.logo
//       : `${IMAGE_BASE_URL}/${saloon.logo}`
//     : null
// },


//       // full location data
//       location,

//       // saloon operating hours
//       operatingHours: saloon.operatingHours || null
//     });

//   } catch (err) {
//     console.error("Error fetching saloon:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };



export const addSaloonContent = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: "Saloon not found for this owner." });
    }

    // If file uploaded, store path
    let images = [];
    if (req.file) {
      images.push(`/uploads/saloonContent/${req.file.filename}`);
    }

    const content = new SaloonContentModel({
      saloon: saloon._id,
      title,
      description,
      images,
    });

    await content.save();
    res.status(201).json({ message: "Saloon content added successfully", content });
  } catch (error) {
    next(error);
  }
};


export const getPublicSaloonContent = async (req, res, next) => {
   try {
    const { saloonId } = req.params;
    const saloon = await Saloon.findById(saloonId);
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found.' });
    }
    const contents = await SaloonContentModel.find({ saloon: saloonId }).sort({ createdAt: -1 });

    res.status(200).json({ contents });
  } catch (error) {
    next(error);
  }
};


// Get content for the logged-in saloon owner
export const getOwnerSaloonContent = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id; // set by your AuthMiddleware
    const saloon = await Saloon.findOne({ owner: ownerId });

    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found for this owner.' });
    }

    const contents = await SaloonContentModel.find({ saloon: saloon._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ contents });
  } catch (error) {
    next(error);
  }
};



// export const getAppointmentsBySaloon = async (req, res, next) => {
//   try {
//     const { saloonId } = req.params;

//     if (!saloonId) {
//       return next(new AppError('saloonId is required', STATUS_CODES.BAD_REQUEST));
//     }

//     const appointments = await Appointment.find({ saloonId })
//       .populate('customer.id', 'name mobile') // optional: include customer info
//       .populate('serviceIds', 'name price')   // optional: include services
//       .populate('professionalId', 'name')    // optional: include professional
//       .sort({ date: 1, time: 1 });

//     return res.status(200).json({
//       success: true,
//       message: `Appointments for saloon ${saloonId} fetched successfully`,
//       data: appointments
//     });

//   } catch (err) {
//     next(err);
//   }
//   // try {
//   //   const { saloonId } = req.params;

//   //   if (!saloonId) {
//   //     return next(new AppError('saloonId is required', STATUS_CODES.BAD_REQUEST));
//   //   }

//   //   // Find all appointments for the given saloon
//   //   const appointments = await Appointment.find({ saloonId })
//   //     .populate('customer.id', 'name mobile') // optional: get customer info
//   //     .populate('serviceIds', 'name price') // optional: get service info
//   //     .populate('professionalId', 'name') // optional: get professional info
//   //     .sort({ date: 1, time: 1 }); // sort by date/time

//   //   return res.status(200).json({
//   //     success: true,
//   //     message: `Appointments for saloon ${saloonId} fetched successfully`,
//   //     data: appointments
//   //   });
//   // } catch (err) {
//   //   next(err);
//   // }
// };


export const getAppointmentsBySaloon = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id; // ✅ token se aaya
    if (!ownerId) {
      return next(new AppError("Unauthorized", STATUS_CODES.UNAUTHORIZED));
    }

    // Find saloon of this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));
    }

    // Find all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      message: `Appointments for saloon ${saloon._id} fetched successfully`,
      data: appointments,
    });
  } catch (err) {
    next(err);
  }
};

export const getServiceWiseCounts = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    if (!ownerId) {
      return next(new AppError("Unauthorized", 401));
    }

    // Find saloon of this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError("Saloon not found", 404));
    }

    // Define start and end of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Fetch appointments of this month
    const appointments = await Appointment.find({
      saloonId: saloon._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate("serviceIds", "name");

    // Initialize counts
    const counts = {
      Hair: 0,
      Nail: 0,
      Skin: 0,
      Other: 0,
    };

    appointments.forEach((appt) => {
      appt.serviceIds.forEach((service) => {
        const name = service.name.toLowerCase();
        if (name.includes("hair")) counts.Hair += 1;
        else if (name.includes("nail")) counts.Nail += 1;
        else if (name.includes("skin")) counts.Skin += 1;
        else counts.Other += 1;
      });
    });

    return res.status(200).json({
      success: true,
      totalAppointments: appointments.length,
      counts,
    });
  } catch (err) {
    next(err);
  }
};



// export const getAppointmentById = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user?.id; // ✅ token se aaya
//     if (!ownerId) {
//       return next(new AppError("Unauthorized", STATUS_CODES.UNAUTHORIZED));
//     }

//     // Find saloon of this owner
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));
//     }

//     const appointmentId = req.params.id;
//     if (!appointmentId) {
//       return next(new AppError("Appointment ID required", STATUS_CODES.BAD_REQUEST));
//     }

//     // Find single appointment by ID & saloon
//     const appointment = await Appointment.findOne({
//       _id: appointmentId,
//       saloonId: saloon._id,
//     })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       .populate("professionalId", "name");

//     if (!appointment) {
//       return next(
//         new AppError("Appointment not found or not authorized", STATUS_CODES.NOT_FOUND)
//       );
//     }

//     return res.status(200).json({
//       success: true,
//       message: `Appointment ${appointmentId} fetched successfully`,
//       data: appointment,
//     });
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// };


export const getAppointmentById = async (req, res, next) => {
  try {
    const ownerId = res.locals.user?.id;
    if (!ownerId) {
      return next(new AppError("Unauthorized", STATUS_CODES.UNAUTHORIZED));
    }

    // ⭐ Find saloon of this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));
    }

    const appointmentId = req.params.id;
    if (!appointmentId) {
      return next(new AppError("Appointment ID required", STATUS_CODES.BAD_REQUEST));
    }

    // ⭐ Appointment Find + Full Populate Fix
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      saloonId: saloon._id,   // ensure the appointment belongs to this saloon
    })
      .populate({
        path: "customer.id",
        select: "name mobile",
      })
      .populate({
        path: "serviceIds",
        select: "name price",
      })
      .populate({
        path: "professionalId",
        model: "Professional",  // ⭐ force correct model
        select: "name mobile role",
      });

    // ⭐ If appointment not found
    if (!appointment) {
      return next(
        new AppError("Appointment not found or not authorized", STATUS_CODES.NOT_FOUND)
      );
    }

    // ⭐ Debugging (optional but very useful)
    console.log("Professional ID in DB:", appointment.professionalId);

    return res.status(200).json({
      success: true,
      message: `Appointment ${appointmentId} fetched successfully`,
      data: appointment,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getAppointmentByBookingRef = async (req, res, next) => {
  try {
    const ownerId = res.locals.user?.id;
    if (!ownerId) {
      return next(new AppError("Unauthorized", 401));
    }

    // Find saloon for this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError("Saloon not found", 404));
    }

    const bookingRef = req.params.bookingRef;
    if (!bookingRef) {
      return next(new AppError("Booking Reference is required", 400));
    }

    // Search appointment by bookingRef
    const appointment = await Appointment.findOne({
      bookingRef: bookingRef,
      saloonId: saloon._id,
    })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name");

    if (!appointment) {
      return next(new AppError("Appointment not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: `Appointment fetched successfully`,
      data: {
        ...appointment._doc,
        professionalName: appointment.professionalId 
          ? appointment.professionalId.name
          : "Not Assigned"
      },
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};


export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const ownerId = res.locals.user?.id; // ✅ token se aaya
    if (!ownerId) {
      return next(new AppError("Unauthorized", STATUS_CODES.UNAUTHORIZED));
    }

    // Find saloon of this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));
    }

    const appointmentId = req.params.id;
    const { status } = req.body;

    if (!appointmentId) {
      return next(new AppError("Appointment ID required", STATUS_CODES.BAD_REQUEST));
    }

    if (!status) {
      return next(new AppError("Status is required", STATUS_CODES.BAD_REQUEST));
    }

    // Allowed statuses
const allowedStatuses = [
  "pending",
  "accepted",
  "confirmed",
  "completed",
  "cancelled",
  "Reschedule",
  "schedule",
];
    if (!allowedStatuses.includes(status)) {
      return next(
        new AppError(`Invalid status. Allowed: ${allowedStatuses.join(", ")}`, STATUS_CODES.BAD_REQUEST)
      );
    }

    // Update appointment if belongs to this saloon
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, saloonId: saloon._id },
      { status },
      { new: true }
    )
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name");

    if (!updatedAppointment) {
      return next(
        new AppError("Appointment not found or not authorized", STATUS_CODES.NOT_FOUND)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Appointment ${appointmentId} status updated to ${status}`,
      data: updatedAppointment,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};


export const completeAppointmentByBookingRef = async (req, res, next) => {
  try {
    const ownerId = res.locals.user?.id;
    if (!ownerId) {
      return next(new AppError("Unauthorized", STATUS_CODES.UNAUTHORIZED));
    }

    const { bookingRef } = req.body;

    if (!bookingRef) {
      return next(new AppError("BookingRef is required", STATUS_CODES.BAD_REQUEST));
    }

    // Find saloon for this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));
    }

    // Find appointment by bookingRef & saloon
    const appointment = await Appointment.findOneAndUpdate(
      { bookingRef: bookingRef, saloonId: saloon._id },
      { status: "completed" },
      { new: true }
    );

    if (!appointment) {
      return next(new AppError("Invalid Booking Ref", STATUS_CODES.NOT_FOUND));
    }

    res.status(200).json({
      success: true,
      message: "Appointment marked as completed",
      data: appointment
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};



export const getSaloonDashboardStats = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // Format today's date to match your stored date strings
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const todayStr = today.toDateString(); // e.g., "Mon Sep 15 2025"
    
    // Or if you want the exact format from your examples: "Mon, Sep 15, 2025"
    const todayStr2 = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');

    const todayAppointments = await Appointment.find({
      saloonId: saloon._id,
      date: { $regex: todayStr2 } // match today string
    });

    const totalAppointments = todayAppointments.length;
    const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
    const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length;

    const todayRevenue = todayAppointments
      .filter(a => a.status === 'confirmed')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    // Yesterday's appointments for growth ratio
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr2 = yesterday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');
    const yesterdayAppointmentsCount = await Appointment.countDocuments({
      saloonId: saloon._id,
      date: { $regex: yesterdayStr2 }
    });

    const growthRatio = yesterdayAppointmentsCount > 0
      ? ((totalAppointments - yesterdayAppointmentsCount) / yesterdayAppointmentsCount) * 100
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
      recentAppointments: todayAppointments.slice(-5).reverse(), // last 5
    });
  } catch (err) {
    next(err);
  }
};

export const getPendingAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get the saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // 2️⃣ Fetch pending appointments
    const pendingAppointments = await Appointment.find({
      saloonId: saloon._id,
      status: "pending", // sirf pending status
    })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      message: `Pending appointments for saloon ${saloon._id}`,
      data: pendingAppointments,
      count: pendingAppointments.length,
    });
  } catch (err) {
    next(err);
  }
};



export const getRevenueGrowth = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Fetch today's revenue
    const todayAppointments = await Appointment.find({
      saloonId: saloon._id,
      status: "completed",
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    }).populate("serviceIds", "price");

    let todayRevenue = 0;
    todayAppointments.forEach(app => app.serviceIds.forEach(s => todayRevenue += s.price));

    // Fetch yesterday's revenue
    const yesterdayAppointments = await Appointment.find({
      saloonId: saloon._id,
      status: "completed",
      date: { $gte: yesterday, $lt: today },
    }).populate("serviceIds", "price");

    let yesterdayRevenue = 0;
    yesterdayAppointments.forEach(app => app.serviceIds.forEach(s => yesterdayRevenue += s.price));

    // Calculate growth
    const revenueGrowth = yesterdayRevenue === 0 ? 100 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    res.status(200).json({
      success: true,
      data: {
        todayRevenue,
        yesterdayRevenue,
        revenueGrowthPercent: revenueGrowth.toFixed(2),
      },
    });
  } catch (err) {
    next(err);
  }
};



export const getDashboardDataStats = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get the saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // 2️⃣ Set date ranges
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // 3️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: -1, time: -1 });

    // 4️⃣ Stats calculations
    const totalAppointments = appointments.length;
    const pendingCount = appointments.filter(a => a.status === "pending").length;

    let todayRevenue = 0;
    let yesterdayRevenue = 0;

    appointments.forEach(a => {
      const appDate = new Date(a.date);
      if (a.status === "completed") {
        if (appDate >= todayStart && appDate <= todayEnd) {
          a.serviceIds.forEach(s => todayRevenue += s.price);
        } else if (appDate >= yesterdayStart && appDate <= yesterdayEnd) {
          a.serviceIds.forEach(s => yesterdayRevenue += s.price);
        }
      }
    });

    const growthRatio = yesterdayRevenue === 0
      ? 100
      : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    // 5️⃣ Get 5 most recent appointments
    const recentAppointments = appointments.slice(0, 5);

    // 6️⃣ Return response
    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingCount,
        todayRevenue,
        growthRatio: growthRatio.toFixed(2),
      },
      recentAppointments,
    });

  } catch (err) {
    next(err);
  }
};


// export const getDashboardDataC = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // GET SALOON
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     // 📅 TODAY DATE RANGE
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     // GET ALL APPOINTMENTS
//     const appointments = await Appointment.find({ saloonId: saloon._id })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       .populate("professionalId", "name")
//       .sort({ createdAt: -1 });

//     // -----------------------------------------
//     // 🟢 TOTAL APPOINTMENTS (All time)
//     // -----------------------------------------
//     const totalAppointments = appointments.length;

//     // -----------------------------------------
//     // 🟡 TOTAL PENDING (All time)
//     // -----------------------------------------
//     const pendingCount = appointments.filter(a => a.status === "pending").length;

//     // -----------------------------------------
//     // 🔵 TODAY APPOINTMENTS (Only today)
//     // -----------------------------------------
//     const todayAppointments = appointments.filter(a => {
//       const created = new Date(a.createdAt);
//       return created >= todayStart && created <= todayEnd;
//     });

//     // -----------------------------------------
//     // 🔴 TODAY PENDING APPOINTMENTS
//     // -----------------------------------------
//     const todayPending = todayAppointments.filter(a => a.status === "pending");

//     // -----------------------------------------
//     // 🟣 REVENUE CALCULATION FOR TODAY
//     // -----------------------------------------
//     let todayRevenue = 0;
//     todayAppointments.forEach(a => {
//       if (a.status === "completed") {
//         a.serviceIds.forEach(s => todayRevenue += s.price);
//       }
//     });

//     // -----------------------------------------
//     // 🟠 RECENT APPOINTMENTS (5)
//     // -----------------------------------------
//     const recentAppointments = appointments.slice(0, 5);

//     // -----------------------------------------
//     // RESPONSE
//     // -----------------------------------------
//     res.status(200).json({
//       success: true,
//       stats: {
//         totalAppointments,     // all appointments
//         pendingCount,          // all time pending
//         todayAppointments: todayAppointments.length,
//         todayPending: todayPending.length,
//         todayRevenue
//       },
//       recentAppointments,
//       todayAppointmentsList: todayAppointments,  // full list
//       todayPendingList: todayPending            // full list
//     });

//   } catch (err) {
//     next(err);
//   }
// };

// export const getDashboardDataC = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // GET SALOON
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     // GET ALL APPOINTMENTS
//     const appointments = await Appointment.find({ saloonId: saloon._id })
//       .populate({
//         path: "customer.id",
//         select: "name mobile",
//         strictPopulate: false
//       })
//       .populate({
//         path: "serviceIds",
//         select: "name price",
//         strictPopulate: false
//       })
//       .populate({
//         path: "professionalId",
//         select: "name",
//         strictPopulate: false
//       })
//       .sort({ createdAt: -1 });

//     const now = new Date();
//     const year = now.getFullYear();
//     const month = now.getMonth(); // 0-indexed

//     // Function to get start and end of a week in the current month
//     const getWeekRange = (weekNumber) => {
//       const start = new Date(year, month, (weekNumber - 1) * 7 + 1);
//       const end = new Date(year, month, weekNumber * 7);
//       end.setHours(23, 59, 59, 999);
//       return { start, end };
//     };

//     // Calculate revenue per week
//     const weeklyRevenue = {};
//     for (let i = 1; i <= 4; i++) {
//       const { start, end } = getWeekRange(i);
//       const weekAppointments = appointments.filter(a => {
//         const created = new Date(a.createdAt);
//         return created >= start && created <= end && a.status === "completed";
//       });

//       let revenue = 0;
//       weekAppointments.forEach(a => {
//         a.serviceIds?.forEach(s => revenue += s.price || 0);
//       });

//       weeklyRevenue[`week${i}`] = revenue;
//     }

//     // -----------------------------------------
//     // TODAY DATA (optional)
//     // -----------------------------------------
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const todayAppointments = appointments.filter(a => {
//       const created = new Date(a.createdAt);
//       return created >= todayStart && created <= todayEnd;
//     });

//     let todayRevenue = 0;
//     todayAppointments.forEach(a => {
//       if (a.status === "completed" ||a.status === "accepted"  || a.status === "schedule") {
//         a.serviceIds?.forEach(s => todayRevenue += s.price || 0);
//       }
//     });

//     // -----------------------------------------
//     // RESPONSE
//     ['pending','accepted','confirmed','completed','cancelled','Reschedule','schedule'],
//     // -----------------------------------------
//     res.status(200).json({
//       success: true,
//       stats: {
//         totalAppointments: appointments.length,
//         pendingCount: appointments.filter(a => a.status === "pending").length,
//         todayAppointments: todayAppointments.length,
//         todayPending: todayAppointments.filter(a => a.status === "pending").length,
//         todayRevenue,
//         weeklyRevenue // week1, week2, week3, week4
//       },
//       recentAppointments: appointments.slice(0, 5),
//       todayAppointmentsList: todayAppointments,
//       todayPendingList: todayAppointments.filter(a => a.status === "pending")
//     });

//   } catch (err) {
//     next(err);
//   }
// };


export const getDashboardDataC = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // FIND SALOON
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // GET ALL APPOINTMENTS
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate({
        path: "customer.id",
        select: "name mobile",
        strictPopulate: false
      })
      .populate({
        path: "serviceIds",
        select: "name price",
        strictPopulate: false
      })
      .populate({
        path: "professionalId",
        select: "name",
        strictPopulate: false
      })
      .sort({ createdAt: -1 });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // -----------------------------------------
    // WEEK RANGES OF CURRENT MONTH
    // -----------------------------------------
    const weekRanges = [
      { start: new Date(year, month, 1), end: new Date(year, month, 7, 23, 59, 59, 999) },
      { start: new Date(year, month, 8), end: new Date(year, month, 14, 23, 59, 59, 999) },
      { start: new Date(year, month, 15), end: new Date(year, month, 21, 23, 59, 59, 999) },
      { start: new Date(year, month, 22), end: new Date(year, month + 1, 0, 23, 59, 59, 999) } // last date of month
    ];

    // -----------------------------------------
    // WEEKLY REVENUE CALCULATION
    // -----------------------------------------
    const weeklyRevenue = {};

    weekRanges.forEach((range, index) => {
      const weekApps = appointments.filter(a => {
        const created = new Date(a.createdAt);
        return (
          created >= range.start &&
          created <= range.end &&
          a.status === "completed"
        );
      });

      let revenue = 0;
      weekApps.forEach(a => {
        a.serviceIds?.forEach(s => revenue += s.price || 0);
      });

      weeklyRevenue[`week${index + 1}`] = revenue;
    });

    // -----------------------------------------
    // MONTHLY TOTAL REVENUE
    // -----------------------------------------
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const monthlyApps = appointments.filter(a => {
      const created = new Date(a.createdAt);
      return (
        created >= monthStart &&
        created <= monthEnd &&
        a.status === "completed"
      );
    });

    let monthlyRevenue = 0;
    monthlyApps.forEach(a => {
      a.serviceIds?.forEach(s => monthlyRevenue += s.price || 0);
    });

    // -----------------------------------------
    // TODAY CALCULATION
    // -----------------------------------------
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = appointments.filter(a => {
      const created = new Date(a.createdAt);
      return created >= todayStart && created <= todayEnd;
    });

    let todayRevenue = 0;
    todayAppointments.forEach(a => {
      if (a.status === "completed" || a.status === "accepted" || a.status === "schedule") {
        a.serviceIds?.forEach(s => todayRevenue += s.price || 0);
      }
    });

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------
    return res.status(200).json({
      success: true,
      stats: {
        totalAppointments: appointments.length,
        pendingCount: appointments.filter(a => a.status === "pending").length,

        todayAppointments: todayAppointments.length,
        todayPending: todayAppointments.filter(a => a.status === "pending").length,
        todayRevenue,

        weeklyRevenue,      // week1, week2, week3, week4
        monthlyRevenue      // 🟢 TOTAL MONTH REVENUE
      },
      recentAppointments: appointments.slice(0, 5),
      todayAppointmentsList: todayAppointments,
      todayPendingList: todayAppointments.filter(a => a.status === "pending")
    });

  } catch (err) {
    next(err);
  }
};
export const getServiceWiseAppointmentsNe = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Get Saloon
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ success: false, message: "Saloon not found" });
    }

    // Get all appointments of this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("serviceIds", "name price");

    // Count map
    const serviceMap = {};

    appointments.forEach((a) => {
      a.serviceIds.forEach((service) => {
        if (!serviceMap[service.name]) {
          serviceMap[service.name] = { count: 0, revenue: 0 };
        }
        serviceMap[service.name].count += 1;
        serviceMap[service.name].revenue += service.price || 0;
      });
    });

    // Convert to array
    const serviceList = Object.keys(serviceMap).map((key) => ({
      service: key,
      count: serviceMap[key].count,
      revenue: serviceMap[key].revenue,
    }));

    // Sort descending by count
    serviceList.sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      services: serviceList,
    });
  } catch (err) {
    next(err);
  }
};



export const sayHello = (req, res) => {
  res.status(200).json({
    message: "Hello"
  });
};



// export const getDashboardData = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Get the saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     // 2️⃣ Fetch appointments
//     const appointments = await Appointment.find({ saloonId: saloon._id })
//       .populate("customer.id", "name")
//       .populate("serviceIds", "name price")
//       .sort({ date: -1, time: -1 }); // latest first

//     // 3️⃣ Calculate stats
//     const totalAppointments = appointments.length;
//     const pendingCount = appointments.filter(a => a.status === "pending").length;

//     let todayRevenue = 0;
//     appointments.forEach(a => {
//       const appDate = new Date(a.date);
//       if (a.status === "completed" && appDate >= todayStart && appDate <= todayEnd) {
//         a.serviceIds.forEach(s => todayRevenue += s.price);
//       }
//     });

//     // Growth calculation (compared to yesterday)
//     const yesterdayStart = new Date(todayStart);
//     yesterdayStart.setDate(yesterdayStart.getDate() - 1);
//     const yesterdayEnd = new Date(todayEnd);
//     yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

//     let yesterdayRevenue = 0;
//     appointments.forEach(a => {
//       const appDate = new Date(a.date);
//       if (a.status === "completed" && appDate >= yesterdayStart && appDate <= yesterdayEnd) {
//         a.serviceIds.forEach(s => yesterdayRevenue += s.price);
//       }
//     });

//     const growthRatio = yesterdayRevenue === 0 ? 100 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

//     // 4️⃣ Get 5 recent appointments
//     const recentAppointments = appointments.slice(0, 5);

//     res.status(200).json({
//       success: true,
//       stats: {
//         totalAppointments,
//         pendingCount,
//         todayRevenue,
//         growthRatio: growthRatio.toFixed(2),
//       },
//       recentAppointments,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


export const getDashboardData = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get the saloon
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // 2️⃣ Define today and yesterday ranges
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // 3️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name")
      .populate("serviceIds", "name price")
      .sort({ date: -1, time: -1 }); // latest first

    // 4️⃣ Calculate stats
    const totalAppointments = appointments.length;
    const pendingCount = appointments.filter(a => a.status === "pending").length;

    // 4a️⃣ Revenue for today
    let todayRevenue = 0;
    appointments.forEach(a => {
      const appDate = new Date(a.date);
      if (appDate >= todayStart && appDate <= todayEnd && ["completed", "accepted"].includes(a.status)) {
        if (Array.isArray(a.serviceIds) && a.serviceIds.length) {
          a.serviceIds.forEach(s => todayRevenue += Number(s.price || 0));
        } else {
          todayRevenue += Number(a.price || 0);
        }
      }
    });

    // 4b️⃣ Revenue for yesterday
    let yesterdayRevenue = 0;
    appointments.forEach(a => {
      const appDate = new Date(a.date);
      if (appDate >= yesterdayStart && appDate <= yesterdayEnd && ["completed", "accepted"].includes(a.status)) {
        if (Array.isArray(a.serviceIds) && a.serviceIds.length) {
          a.serviceIds.forEach(s => yesterdayRevenue += Number(s.price || 0));
        } else {
          yesterdayRevenue += Number(a.price || 0);
        }
      }
    });

    // 4c️⃣ Growth ratio
    const growthRatio = yesterdayRevenue === 0
      ? todayRevenue === 0 ? 0 : 100
      : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    // 5️⃣ Get 5 recent appointments
    const recentAppointments = appointments.slice(0, 5);

    // 6️⃣ Respond with stats
    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingCount,
        todayRevenue,
        growthRatio: growthRatio.toFixed(2),
      },
      recentAppointments,
    });
  } catch (err) {
    next(err);
  }
};


import Appointment from "../models/Appointment.js";
import Saloon from "../models/Saloon.js";
import AppError from "../utils/AppError.js";

// export const getPastAppointmentsProfessionalIdOnly = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Find saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     // 2️⃣ Today's date (00:00:00)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // 3️⃣ Fetch all appointments for this saloon
//     const appointments = await Appointment.find({ saloonId: saloon._id })
//       .populate("customer.id", "name mobile")   // customer details
//       .populate("serviceIds", "name price")     // services
//       .sort({ date: -1, time: -1 });

//     // 4️⃣ Filter past appointments (any status, including rejected)
//     const pastAppointments = appointments.filter(a => {
//       const appDate = new Date(a.date);
//       return appDate.getTime() < today.getTime();
//     });

//     // 5️⃣ Map to required fields
//     const response = pastAppointments.map(a => ({
//       _id: a._id,
//       bookingRef: a.bookingRef,
//       professionalId: a.professionalId, 
//       createdAt: a.createdAt,
//       discount: a.discount,
//       saloonId: a.saloonId,
//       serviceIds: a.serviceIds,
//       date: a.date,
//       time: a.time,
//       duration: a.duration,
//       price: a.price,
//       status: a.status,           // rejected, completed, pending etc.
//       discountCode: a.discountCode,
//       discountAmount: a.discountAmount,
//       discountCodeId: a.discountCodeId,
//       cardstatus: a.cardstatus,
//       notes: a.notes,
//       customer: a.customer
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Past appointments (including rejected) for professionalId",
//       data: response,
//     });

//   } catch (err) {
//     next(err);
//   }
// };


export const getPastAppointmentsProfessionalIdOnly = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Find saloon
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // 2️⃣ Define today's date for filtering past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
    .populate("customer.id", "name mobile")        // 🔥 Populate customer name & mobile
      .populate("serviceIds", "name price")          // 🔥 Populate service names & price
      
      .sort({ date: -1, time: -1 });

    // 4️⃣ Filter past appointments
    const pastAppointments = appointments.filter(a => {
      const appDate = new Date(a.date);
      return appDate.getTime() < today.getTime();
    });

    // 5️⃣ Map to only professionalId
    const response = pastAppointments.map(a => {
      return {
        _id: a._id,
        bookingRef: a.bookingRef,
        professionalId: a.professionalId, // raw ObjectId
        createdAt: a.createdAt,
            discount:a.discount,
            saloonId:a.saloonId,
            serviceIds:a.serviceIds,
            date:a.date,
            time:a.time,
            duration:a.duration,
            price:a.price,
            status:a.status,
            discountCode:a.discountCode,
            discountAmount:a.discountAmount,
            discountCodeId:a.discountCodeId,
            cardstatus:a.cardstatus,
            notes:a.notes,
            customer:a.customer
      };
    });

    return res.status(200).json({
      success: true,
      message: "Past appointments professionalId only",
      data: response,
    });

  } catch (err) {
    next(err);
  }
};



export const getUpcomingAppointmentsFull = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Find saloon
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // 2️⃣ Define tomorrow's date for filtering
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1); // move to next day

    // 3️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
    .populate("customer.id", "name mobile")        // 🔥 Populate customer name & mobile
      .populate("serviceIds", "name price")   
      .sort({ date: 1, time: 1 }); // earliest first

    // 4️⃣ Filter appointments starting from tomorrow
    const upcomingAppointments = appointments.filter(a => {
      const appDate = new Date(a.date);
      return appDate.getTime() >= tomorrow.getTime();
    });

    // 5️⃣ Map appointments with professionalId + all fields
    const response = upcomingAppointments.map(a => ({
      _id: a._id,
      bookingRef: a.bookingRef,
      professionalId: a.professionalId, // raw ObjectId
      createdAt: a.createdAt,
      discount: a.discount,
      saloonId: a.saloonId,
      serviceIds: a.serviceIds,
      date: a.date,
      time: a.time,
      duration: a.duration,
      price: a.price,
      status: a.status,
      discountCode: a.discountCode,
      discountAmount: a.discountAmount,
      discountCodeId: a.discountCodeId,
      cardstatus: a.cardstatus,
      notes: a.notes,
      customer:a.customer
    }));

    return res.status(200).json({
      success: true,
      message: "Upcoming appointments starting from tomorrow",
      data: response,
    });

  } catch (err) {
    next(err);
  }
};

export const getRejectedAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Find saloon by owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: "Saloon not found",
      });
    }

    // 2️⃣ Fetch ONLY rejected appointments
    const rejectedAppointments = await Appointment.find({
      saloonId: saloon._id,
      status: "rejected",
    })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: -1, time: -1 });

    // 3️⃣ Response
    return res.status(200).json({
      success: true,
      count: rejectedAppointments.length,
      data: rejectedAppointments,
    });

  } catch (err) {
    next(err);
  }
};



// export const getTodaysAppointmentsFull = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Find saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     // 2️⃣ Define start and end of today
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     // 3️⃣ Fetch appointments for today
//     const appointments = await Appointment.find({
//       saloonId: saloon._id,
//       date: { $gte: todayStart.toISOString(), $lte: todayEnd.toISOString() }
//     })

    
//     .populate("customer.id", "name mobile")
//     .populate("serviceIds", "name price")
//     .populate("professionalId", "name")
//     .sort({ time: 1 });

//     // 4️⃣ Map full details
//     const response = appointments.map(a => ({
//       _id: a._id,
//       bookingRef: a.bookingRef,
//       professionalId: a.professionalId?._id || a.professionalId,
//       professionalName: a.professionalId?.name || "Not Assigned",
//       createdAt: a.createdAt,
//       discount: a.discount,
//       saloonId: a.saloonId,
//       serviceIds: a.serviceIds,
//       date: a.date,
//       time: a.time,
//       duration: a.duration,
//       price: a.price,
//       status: a.status,
//       discountCode: a.discountCode,
//       discountAmount: a.discountAmount,
//       discountCodeId: a.discountCodeId,
//       cardstatus: a.cardstatus,
//       notes: a.notes,
//       customer: a.customer
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Today's appointments",
//       data: response
//     });

//   } catch (err) {
//     next(err);
//   }
// };


// export const getTodaysAppointmentsFull = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Find saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({
//         success: false,
//         message: "Saloon not found",
//       });
//     }

//     // 2️⃣ Today's date (date only)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // 3️⃣ Fetch all appointments of this saloon
//     const appointments = await Appointment.find({
//       saloonId: saloon._id,
//     })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       .populate("professionalId", "name");

//     // 4️⃣ Filter ONLY today's appointments (string-safe)
//     const todaysAppointments = appointments.filter(a => {
//       if (!a.date) return false;

//       // "Mon, Dec 15, 2025" ➜ safe Date
//       const appDate = new Date(a.date.replace(/,/g, ""));
//       appDate.setHours(0, 0, 0, 0);

//       return appDate.getTime() === today.getTime();
//     });

//     // 5️⃣ Sort by start time
//     todaysAppointments.sort((a, b) =>
//       (a.time || "").localeCompare(b.time || "")
//     );

//     // 6️⃣ Map response (ALL STATUSES)
//     const response = todaysAppointments.map(a => ({
//       _id: a._id,
//       bookingRef: a.bookingRef,
//       professionalId: a.professionalId?._id || a.professionalId,
//       professionalName: a.professionalId?.name || "Not Assigned",
//       createdAt: a.createdAt,
//       discount: a.discount,
//       saloonId: a.saloonId,
//       serviceIds: a.serviceIds,
//       date: a.date,
//       time: a.time,
//       duration: a.duration,
//       price: a.price,
//       status: a.status, // ✅ pending, confirmed, rejected, cancelled — ALL
//       discountCode: a.discountCode,
//       discountAmount: a.discountAmount,
//       discountCodeId: a.discountCodeId,
//       cardstatus: a.cardstatus,
//       notes: a.notes,
//       customer: a.customer,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Today's appointments (all statuses)",
//       count: response.length,
//       data: response,
//     });

//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// };


export const getTodaysAppointmentsFull = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Find saloon
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: "Saloon not found",
      });
    }

    // 2️⃣ Today's date (date only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3️⃣ Fetch all appointments of this saloon
    const appointments = await Appointment.find({
      saloonId: saloon._id,
    })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name");

    // 4️⃣ Filter ONLY today's appointments (string-safe)
    const todaysAppointments = appointments.filter(a => {
      if (!a.date) return false;

      // "Mon, Dec 15, 2025" ➜ safe Date
      const appDate = new Date(a.date.replace(/,/g, ""));
      appDate.setHours(0, 0, 0, 0);

      return appDate.getTime() === today.getTime();
    });

    // 5️⃣ Sort by start time
    todaysAppointments.sort((a, b) =>
      (a.time || "").localeCompare(b.time || "")
    );

    // 6️⃣ Map response (ALL STATUSES)
    const response = todaysAppointments.map(a => ({
      _id: a._id,
      bookingRef: a.bookingRef,
      professionalId: a.professionalId?._id || a.professionalId,
      professionalName: a.professionalId?.name || "Not Assigned",
      createdAt: a.createdAt,
      discount: a.discount,
      saloonId: a.saloonId,
      serviceIds: a.serviceIds,
      date: a.date,
      time: a.time,
      duration: a.duration,
      price: a.price,
      status: a.status, // ✅ pending, confirmed, rejected, cancelled — ALL
      discountCode: a.discountCode,
      discountAmount: a.discountAmount,
      discountCodeId: a.discountCodeId,
      cardstatus: a.cardstatus,
      notes: a.notes,
      customer: a.customer,
    }));

    return res.status(200).json({
      success: true,
      message: "Today's appointments (all statuses)",
      count: response.length,
      data: response,
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};



export const getAllAppointmentsFull = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Find the saloon of this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // 2️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: -1, time: -1 }); // latest first

    // 3️⃣ Map full details for response
    const response = appointments.map(a => ({
      _id: a._id,
      bookingRef: a.bookingRef,
      professionalId: a.professionalId?._id || a.professionalId,
      professionalName: a.professionalId?.name || "Not Assigned",
      createdAt: a.createdAt,
      discount: a.discount,
      saloonId: a.saloonId,
      serviceIds: a.serviceIds,
      date: a.date,
      time: a.time,
      duration: a.duration,
      price: a.price,
      status: a.status,
      discountCode: a.discountCode,
      discountAmount: a.discountAmount,
      discountCodeId: a.discountCodeId,
      cardstatus: a.cardstatus,
      notes: a.notes,
      customer: a.customer,
    }));

    return res.status(200).json({
      success: true,
      message: "All appointments with full details",
      data: response,
    });
  } catch (err) {
    next(err);
  }
};











// export const getCumulativeDashboard = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Get saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     // 2️⃣ Fetch all appointments for this saloon
//     const appointments = await Appointment.find({ saloonId: saloon._id });

//     // 3️⃣ Total appointments and pending
//     const totalAppointments = appointments.length;
//     const totalPending = appointments.filter(a => a.status === "pending").length;

//     // 4️⃣ Total revenue (all completed/accepted appointments)
//     const totalRevenue = appointments.reduce((sum, a) => {
//       if (["completed", "accepted"].includes(a.status)) {
//         if (Array.isArray(a.serviceIds) && a.serviceIds.length) {
//           return sum + a.serviceIds.reduce((s, svc) => s + Number(svc.price || 0), 0);
//         } else {
//           return sum + Number(a.price || 0);
//         }
//       }
//       return sum;
//     }, 0);

//     // 5️⃣ Today revenue for growth calculation
//     const todayStart = new Date();
//     todayStart.setHours(0,0,0,0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23,59,59,999);

//     const yesterdayStart = new Date(todayStart);
//     yesterdayStart.setDate(yesterdayStart.getDate() - 1);
//     const yesterdayEnd = new Date(todayEnd);
//     yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

//     const revenueInRange = (start, end) => {
//       return appointments.reduce((sum, a) => {
//         const appDate = new Date(a.date);
//         if (appDate >= start && appDate <= end && ["completed", "accepted"].includes(a.status)) {
//           if (Array.isArray(a.serviceIds) && a.serviceIds.length) {
//             return sum + a.serviceIds.reduce((s, svc) => s + Number(svc.price || 0), 0);
//           } else {
//             return sum + Number(a.price || 0);
//           }
//         }
//         return sum;
//       }, 0);
//     };

//     const todayRevenue = revenueInRange(todayStart, todayEnd);
//     const yesterdayRevenue = revenueInRange(yesterdayStart, yesterdayEnd);

//     const growthRatio = yesterdayRevenue === 0
//       ? todayRevenue === 0 ? 0 : 100
//       : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

//     // 6️⃣ Response
//     res.status(200).json({
//       success: true,
//       totalAppointments,
//       totalPending,
//       totalRevenue,
//       growthRatio: growthRatio.toFixed(2)
//     });

//   } catch (err) {
//     next(err);
//   }
// };
// export const getCumulativeDashboard = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Get saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({
//         success: false,
//         message: "Saloon not found",
//       });
//     }

//     // 2️⃣ Get all appointments
//     const appointments = await Appointment.find({ saloonId: saloon._id });

//     const totalAppointments = appointments.length;

//     const totalPending = appointments.filter(
//       a => a.status === "pending"
//     ).length;

//     // ✅ ONLY CONFIRMED
//     const CONFIRMED_STATUS = "completed";

//     // --------------------------------
//     // ⭐ TOTAL REVENUE (CONFIRMED ONLY)
//     // --------------------------------
//     let totalRevenue = 0;

//     appointments.forEach(a => {
//       if (a.status === CONFIRMED_STATUS) {
//         totalRevenue += Number(a.price || 0);
//       }
//     });

//     // --------------------------------
//     // ⭐ DATE RANGES
//     // --------------------------------
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const yesterdayStart = new Date(todayStart);
//     yesterdayStart.setDate(yesterdayStart.getDate() - 1);

//     const yesterdayEnd = new Date(todayEnd);
//     yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

//     let todayRevenue = 0;
//     let yesterdayRevenue = 0;

//     // --------------------------------
//     // ⭐ TODAY & YESTERDAY REVENUE (CONFIRMED ONLY)
//     // --------------------------------
//     appointments.forEach(a => {
//       if (a.status !== CONFIRMED_STATUS) return;

//       const appDate = new Date(a.date);
//       const amount = Number(a.price || 0);

//       // Today
//       if (appDate >= todayStart && appDate <= todayEnd) {
//         todayRevenue += amount;
//       }

//       // Yesterday
//       if (appDate >= yesterdayStart && appDate <= yesterdayEnd) {
//         yesterdayRevenue += amount;
//       }
//     });

//     // --------------------------------
//     // ⭐ GROWTH RATIO
//     // --------------------------------
//     let growthRatio = 0;

//     if (yesterdayRevenue === 0) {
//       growthRatio = todayRevenue > 0 ? 100 : 0;
//     } else {
//       growthRatio =
//         ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
//     }

//     return res.status(200).json({
//       success: true,
//       saloonId: saloon._id,
//       totalAppointments,
//       totalPending,
//       totalRevenue,
//       todayRevenue,
//       yesterdayRevenue,
//       growthRatio: growthRatio.toFixed(2),
//     });

//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// };
export const getCumulativeDashboard = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get saloon
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: "Saloon not found",
      });
    }

    // 2️⃣ Get all appointments
    const appointments = await Appointment.find({ saloonId: saloon._id });

    const totalAppointments = appointments.length;

    const totalPending = appointments.filter(
      a => a.status === "pending"
    ).length;

    // ✅ ONLY COMPLETED
    const CONFIRMED_STATUS = "completed";

    // --------------------------------
    // ⭐ TOTAL REVENUE (ALL COMPLETED)
    // --------------------------------
    let totalRevenue = 0;

    appointments.forEach(a => {
      if (a.status === CONFIRMED_STATUS) {
        totalRevenue += Number(a.price || 0);
      }
    });

    // --------------------------------
    // ⭐ TODAY & YESTERDAY (DATE ONLY)
    // --------------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let todayRevenue = 0;
    let yesterdayRevenue = 0;

    // --------------------------------
    // ⭐ TODAY & YESTERDAY REVENUE (COMPLETED ONLY)
    // --------------------------------
    appointments.forEach(a => {
      if (a.status !== CONFIRMED_STATUS || !a.date) return;

      // 🔥 STRING SAFE DATE PARSE
      const appDate = new Date(a.date.replace(/,/g, ""));
      appDate.setHours(0, 0, 0, 0);

      const amount = Number(a.price || 0);

      // Today revenue
      if (appDate.getTime() === today.getTime()) {
        todayRevenue += amount;
      }

      // Yesterday revenue
      if (appDate.getTime() === yesterday.getTime()) {
        yesterdayRevenue += amount;
      }
    });

    // --------------------------------
    // ⭐ GROWTH RATIO
    // --------------------------------
    let growthRatio = 0;

    if (yesterdayRevenue === 0) {
      growthRatio = todayRevenue > 0 ? 100 : 0;
    } else {
      growthRatio =
        ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    }

    return res.status(200).json({
      success: true,
      saloonId: saloon._id,
      totalAppointments,
      totalPending,
      totalRevenue,       // 🔥 all completed
      todayRevenue,       // 🔥 ONLY TODAY completed
      yesterdayRevenue,
      growthRatio: growthRatio.toFixed(2),
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};


// export const getCumulativeDashboard = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Get saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({
//         success: false,
//         message: "Saloon not found",
//       });
//     }

//     // 2️⃣ Get all appointments
//     const appointments = await Appointment.find({ saloonId: saloon._id });

//     const totalAppointments = appointments.length;
//     const totalPending = appointments.filter(
//       a => a.status === "pending"
//     ).length;

//     // ✅ confirmed statuses
//     const CONFIRMED_STATUSES = ["accepted", "completed"];

//     // --------------------------------
//     // ⭐ TOTAL REVENUE (ONLY CONFIRMED)
//     // --------------------------------
//     let totalRevenue = 0;

//     appointments.forEach(a => {
//       if (CONFIRMED_STATUSES.includes(a.status)) {
//         totalRevenue += Number(a.price || 0);
//       }
//     });

//     // --------------------------------
//     // ⭐ DATE RANGES
//     // --------------------------------
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const yesterdayStart = new Date(todayStart);
//     yesterdayStart.setDate(yesterdayStart.getDate() - 1);

//     const yesterdayEnd = new Date(todayEnd);
//     yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

//     let todayRevenue = 0;
//     let yesterdayRevenue = 0;

//     // --------------------------------
//     // ⭐ TODAY & YESTERDAY REVENUE (ONLY CONFIRMED)
//     // --------------------------------
//     appointments.forEach(a => {
//       if (!a.status==="confirmed") return;

//       const appDate = new Date(a.date);
//       const amount = Number(a.price || 0);

//       if (appDate >= todayStart && appDate <= todayEnd) {
//         todayRevenue += amount;
//       }

//       if (appDate >= yesterdayStart && appDate <= yesterdayEnd) {
//         yesterdayRevenue += amount;
//       }
//     });

//     // --------------------------------
//     // ⭐ GROWTH RATIO
//     // --------------------------------
//     let growthRatio = 0;

//     if (yesterdayRevenue === 0) {
//       growthRatio = todayRevenue > 0 ? 100 : 0;
//     } else {
//       growthRatio =
//         ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
//     }

//     return res.status(200).json({
//       success: true,
//       saloonId: saloon._id,
//       totalAppointments,
//       totalPending,
//       totalRevenue,
//       todayRevenue,
//       yesterdayRevenue,
//       growthRatio: growthRatio.toFixed(2),
//     });

//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// };

// export const getCumulativeDashboard = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Get saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon)
//       return res.status(404).json({ success: false, message: "Saloon not found" });

//     // 2️⃣ Get all appointments
//     const appointments = await Appointment.find({ saloonId: saloon._id });

//     const totalAppointments = appointments.length;
//     const totalPending = appointments.filter(a => a.status === "pending").length;

//     // --------------------------------
//     // ⭐ TOTAL REVENUE (Final amount customer paid)
//     // --------------------------------
//     let totalRevenue = 0;
//     appointments.forEach(a => {
//       totalRevenue += Number(a.price || 0);
//     });

//     // --------------------------------
//     // ⭐ GROWTH RATIO CALCULATION
//     // --------------------------------
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const yesterdayStart = new Date(todayStart);
//     yesterdayStart.setDate(yesterdayStart.getDate() - 1);

//     const yesterdayEnd = new Date(todayEnd);
//     yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

//     let todayRevenue = 0;
//     let yesterdayRevenue = 0;

//     appointments.forEach(a => {
//       const appDate = new Date(a.date);
//       const amount = Number(a.price || 0);

//       // Today revenue
//       if (appDate >= todayStart && appDate <= todayEnd) {
//         todayRevenue += amount;
//       }

//       // Yesterday revenue
//       if (appDate >= yesterdayStart && appDate <= yesterdayEnd) {
//         yesterdayRevenue += amount;
//       }
//     });

//     // Formula:
//     // ((today - yesterday) / yesterday) * 100
//     let growthRatio = 0;

//     if (yesterdayRevenue === 0) {
//       growthRatio = todayRevenue > 0 ? 100 : 0;
//     } else {
//       growthRatio = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
//     }

//     res.status(200).json({
//       success: true,
//             saloonId: saloon._id, 
//       totalAppointments,
//       totalPending,
//       totalRevenue,
//       todayRevenue,
//       yesterdayRevenue,
//       growthRatio: growthRatio.toFixed(2)
//     });

//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// };



// export const getCumulativeDashboard = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Get saloon
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon)
//       return res.status(404).json({ success: false, message: "Saloon not found" });

//     // 2️⃣ Fetch all appointments
//     const appointments = await Appointment.find({ saloonId: saloon._id });

//     // 3️⃣ Calculate totals
//     const totalAppointments = appointments.length;

//     const totalPending = appointments.filter(a => a.status === "pending").length;

//     // ⭐ Use appointment.price → NOT serviceIds.price
//     let totalRevenue = 0;

//     appointments.forEach(a => {
//       totalRevenue += Number(a.price || 0);
//     });

//     res.status(200).json({
//       success: true,
//       totalAppointments,
//       totalPending,
//       totalRevenue
//     });

//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// };

export const getTotalAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get the saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // 2️⃣ Count total appointments
    const totalAppointments = await Appointment.countDocuments({ saloonId: saloon._id });

    res.status(200).json({
      success: true,
      message: `Total appointments for saloon ${saloon._id}`,
      data: {
        totalAppointments,
      },
    });
  } catch (err) {
    next(err);
  }
};


export const getTodayRevenue = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get the saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 2️⃣ Fetch today's completed appointments
    const appointments = await Appointment.find({
      saloonId: saloon._id,
      status: "confirmed", // ya "paid", jo bhi aapke schema me hai
      date: { $gte: todayStart, $lte: todayEnd },
    }).populate("serviceIds", "price");

    // 3️⃣ Calculate total revenue
    let totalRevenue = 0;
    appointments.forEach(app => {
      app.serviceIds.forEach(service => {
        totalRevenue += service.price;
      });
    });

    res.status(200).json({
      success: true,
      message: `Today's revenue for saloon ${saloon._id}`,
      data: {
        totalRevenue,
        appointmentCount: appointments.length,
      },
    });
  } catch (err) {
    next(err);
  }
};


export const getDetailsAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get the saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time to start of today

    // 2️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    // 3️⃣ Filter appointments that are strictly in the future
    const upcomingAppointments = appointments.filter((a) => {
      const appDate = new Date(a.date);
      return appDate >= today; // include today if needed
    });

    // 4️⃣ Calculate counts
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(a => a.status === "pending").length;

    res.status(200).json({
      success: true,
      message: `Appointments summary for saloon ${saloon._id}`,
      data: {
        totalAppointments,
        pendingAppointments,
        upcomingAppointments,
      },
    });
  } catch (err) {
    next(err);
  }
};


export const getUpcomingAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get the saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time to start of today

    // 2️⃣ Fetch all appointments for this saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    // 3️⃣ Filter appointments that are strictly in the future
    const upcomingAppointments = appointments.filter((a) => {
      const appDate = new Date(a.date);
      return appDate > today; // strictly after today
    });

    res.status(200).json({
      success: true,
      message: `Upcoming appointments for saloon ${saloon._id}`,
      data: upcomingAppointments,
    });
  } catch (err) {
    next(err);
  }
};

export const getPastAppointmentsFull = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Find saloon
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    // 2️⃣ Define today's date for filtering past appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3️⃣ Fetch all appointments for this saloon with population
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")   // populate customer info
      .populate("serviceIds", "name price")     // populate services
      .populate("professionalId", "name _id")  // populate professional
      .sort({ date: -1, time: -1 });

    // 4️⃣ Filter past appointments
    const pastAppointments = appointments.filter(a => {
      const appDate = new Date(a.date);
      return appDate.getTime() < today.getTime();
    });

    // 5️⃣ Map appointments to include all fields + professional info
    const response = pastAppointments.map(a => {
      const prof = a.professionalId; // populated professional

      return {
        ...a.toObject(), // converts mongoose doc to plain object with all fields
        professionalId: prof?._id || a.professionalId || null,
        professionalName: prof?.name || "Not Assigned",
      };
    });

    return res.status(200).json({
      success: true,
      message: "Past appointments with full details",
      data: response,
    });

  } catch (err) {
    next(err);
  }
};

// export const getCurrentsAppointments = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const appointments = await Appointment.find({ saloonId: saloon._id })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       .populate("professionalId", "name")
//       .sort({ time: 1 });

//     const todayAppointments = appointments.filter((a) => {
//       const appDate = new Date(a.date);
//       return appDate.getTime() === today.getTime(); // SAME DATE ONLY
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Today's appointments",
//       data: todayAppointments,
//     });

//   } catch (err) {
//     next(err);
//   }
// };



export const getCurrentsAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name") // Make sure ref is correct
      .sort({ time: 1 });

   const todayAppointments = appointments.map(a => ({
  _id: a._id,
  bookingRef: a.bookingRef,
  customer: a.customer,
  serviceIds: a.serviceIds,
  professionalId: a.professionalId?._id || null,
  professionalName: a.professionalId?.name || "Not Assigned",
  date: a.date,
  time: a.time,
  status: a.status,
  price: a.price,
}));


    return res.status(200).json({
      success: true,
      message: "Today's appointments",
      data: todayAppointments,
    });

  } catch (err) {
    next(err);
  }
};


export const getPastAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Find the saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of the day

    // Fetch all appointments of the saloon
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: -1, time: 1 }); // Sort by date descending, then time ascending

    // Filter appointments that happened before today
    const pastAppointments = appointments.filter((a) => {
      const appDate = new Date(a.date);
      appDate.setHours(0, 0, 0, 0); // Ignore time part
      return appDate.getTime() < today.getTime();
    });

    return res.status(200).json({
      success: true,
      message: `Past appointments for saloon ${saloon._id}`,
      data: pastAppointments,
    });

  } catch (err) {
    next(err);
  }
};


export const getAllAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      message: "All appointments sorted by date & time",
      data: appointments,
    });

  } catch (err) {
    next(err);
  }
};


// export const getPastAppointments = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // 1️⃣ Get the saloon of the logged-in owner
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) return next(new AppError("Saloon not found", 404));

//     const today = new Date();
//     const todayStr = today.toDateString(); // e.g., "Mon Sep 15 2025"

//     // 2️⃣ Fetch past appointments (before today)
//     const pastAppointments = await Appointment.find({
//       saloonId: saloon._id,
//       date: { $lt: todayStr }, // only past dates
//     })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       .populate("professionalId", "name")
//       .sort({ date: -1, time: -1 }); // most recent first

//     // 3️⃣ Respond with data
//     res.status(200).json({
//       success: true,
//       message: `Past appointments for saloon ${saloon._id}`,
//       data: pastAppointments,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


export const getLast7DaysDashboardStats = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d.toDateString();
    }).reverse(); // oldest → newest

    const allAppointments = await Appointment.find({ saloonId: saloon._id })
      .populate('customer.id', 'name mobile');

    const statsPerDay = last7Days.map(dateStr => {
      const dayAppointments = allAppointments.filter(a => new Date(a.date).toDateString() === dateStr);
      const totalAppointments = dayAppointments.length;
      const pendingCount = dayAppointments.filter(a => a.status === 'pending').length;
      const confirmedCount = dayAppointments.filter(a => a.status === 'confirmed').length;
      const revenue = dayAppointments
        .filter(a => a.status === 'confirmed')
        .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

      return {
        date: dateStr,
        totalAppointments,
        pendingCount,
        confirmedCount,
        revenue
      };
    });

    res.status(200).json({
      success: true,
      last7DaysStats: statsPerDay
    });

  } catch (err) {
    next(err);
  }
};



export const addOfflineAppointment = async (req, res, next) => {
  try {
    const {
      customerName,
      contactNumber,
      serviceId,
      serviceName,
      teamMemberId,
      teamMemberName,
      date,
      time,
      notes,
    } = req.body;

    // ✅ Use res.locals.user for saloon ID
    const saloonId = res.locals.user?.id;
    if (!saloonId) {
      return next(new AppError('Unauthorized', STATUS_CODES.UNAUTHORIZED));
    }

    const appointment = new OfflineAppointment({
      saloonId,
      customerName,
      contactNumber,
      serviceId,
      serviceName,
      teamMemberId,
      teamMemberName,
      date,
      time,
      notes,
    });

    const savedAppointment = await appointment.save();
    res.status(201).json({ success: true, data: savedAppointment });
  } catch (error) {
    console.error(error);
    next(error);
  }
};



export const getOfflineAppointments = async (req, res, next) => {
  try {
    const saloonId = res.locals.user?.id; // must match what you used in add API
    if (!saloonId) return next(new AppError('Unauthorized', STATUS_CODES.UNAUTHORIZED));

    const appointments = await OfflineAppointment.find({ saloonId })
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error(error);
    next(error);
  }
};




export const updateOfflineAppointmentStatus = async (req, res, next) => {
  try {
    const saloonId = res.locals.user?.id; // 👈 ownerId hi store ho raha hai saloonId field me
    if (!saloonId) {
      return next(new AppError('Unauthorized', STATUS_CODES.UNAUTHORIZED));
    }

    const appointmentId = req.params.id;
    const { status } = req.body;

    if (!appointmentId) {
      return next(new AppError('Appointment ID is required', STATUS_CODES.BAD_REQUEST));
    }
    if (!status) {
      return next(new AppError('Status is required', STATUS_CODES.BAD_REQUEST));
    }

    // allowed statuses
    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return next(new AppError(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`, STATUS_CODES.BAD_REQUEST));
    }

    const updated = await OfflineAppointment.findOneAndUpdate(
      { _id: appointmentId, saloonId: saloonId }, // 👈 match with ownerId
      { status },
      { new: true }
    );

    if (!updated) {
      return next(new AppError('Appointment not found or not authorized', STATUS_CODES.NOT_FOUND));
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    next(error);
  }
};




export const getOfflineAppointmentById = async (req, res, next) => {
  try {
    const saloonId = res.locals.user?.id; // 👈 ownerId hi store hua hai saloonId field me
    if (!saloonId) {
      return next(new AppError('Unauthorized', STATUS_CODES.UNAUTHORIZED));
    }

    const appointmentId = req.params.id;
    if (!appointmentId) {
      return next(new AppError('Appointment ID is required', STATUS_CODES.BAD_REQUEST));
    }

    const appointment = await OfflineAppointment.findOne({
      _id: appointmentId,
      saloonId: saloonId, // 👈 ensure same owner
    });

    if (!appointment) {
      return next(new AppError('Appointment not found or not authorized', STATUS_CODES.NOT_FOUND));
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error(error);
    next(error);
  }
};




export const deleteOfflineAppointment = async (req, res, next) => {
  try {
    const saloonId = res.locals.user?.id; // same as add & get
    if (!saloonId) {
      return next(new AppError('Unauthorized', STATUS_CODES.UNAUTHORIZED));
    }

    const appointmentId = req.params.id;
    if (!appointmentId) {
      return next(new AppError('Appointment ID is required', STATUS_CODES.BAD_REQUEST));
    }

    const deleted = await OfflineAppointment.findOneAndDelete({
      _id: appointmentId,
      saloonId: saloonId, // 👈 owner id use karo, same flow
    });

    if (!deleted) {
      return next(new AppError('Appointment not found or not authorized', STATUS_CODES.NOT_FOUND));
    }

    res.status(200).json({
      success: true,
      message: 'Offline appointment deleted successfully',
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


export const getPublicOwnerLocation = async (req, res, next) => {
  try {
    const { saloonId } = req.params;

    if (!saloonId) {
      return res.status(400).json({
        success: false,
        message: "Saloon ID is required",
      });
    }

    // 1. Get saloon to extract owner
    const saloon = await Saloon.findById(saloonId).select("owner");
    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: "Saloon not found",
      });
    }

    // 2. Find location inserted by owner
    const location = await Location.findOne({ owner: saloon.owner });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found for this owner",
      });
    }

    // 3. Return location only
    return res.status(200).json({
      success: true,
      location,
    });
  } catch (err) {
    console.error("Error fetching owner location:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// export const registerSaloon = async (req, res, next) => {
//   try {
//     const { name, logo, ownerName, mobile } = req.body;
//     const ownerId = res.locals.user.id;

//     // Find existing Saloon for this owner (temporary or real)
//     let saloon = await Saloon.findOne({ owner: ownerId });

//     if (saloon) {
//       // Update the existing Saloon with profile info
//       saloon.name = name;
//       saloon.logo = logo;
//       saloon.ownerName = ownerName;
//       saloon.mobile = mobile;
//       saloon.status = 'active'; // Set status to active
//       await saloon.save();
//     } else {
//       // Create new Saloon if somehow none exists
//       saloon = new Saloon({
//         name,
//         logo,
//         ownerName,
//         mobile,
//         owner: ownerId,
//         status: 'active'
//       });
//       await saloon.save();
//     }

//     // Update owner's state status to 3 (profile completed)
//     await ownerModel.findByIdAndUpdate(ownerId, { owner_state_status: 3 });

//     return res.status(201).json({ 
//       message: 'Saloon registered successfully.', 
//       saloon,
//       owner_state_status: 4
//     });

//   } catch (err) {
//     next(err);
//   }
// };


export const registerSaloon = async (req, res, next) => {
  try {
    const { name, ownerName, mobile } = req.body;
    const ownerId = res.locals.user.id;

    // If an image was uploaded, get its filename or path
    const logo = req.file ? req.file.filename || req.file.path : null;

    // Validate required fields
    if (!name || !ownerName || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, ownerName, mobile) are required.'
      });
    }

    // Find existing Saloon for this owner (temporary or real)
    let saloon = await Saloon.findOne({ owner: ownerId });

    if (saloon) {
      // Update the existing Saloon with profile info
      saloon.name = name;
      if (logo) saloon.logo = logo; // only update if new image uploaded
      saloon.ownerName = ownerName;
      saloon.mobile = mobile;
      saloon.status = 'active'; // Set status to active
      await saloon.save();
    } else {
      // Create new Saloon if none exists
      saloon = new Saloon({
        name,
        logo,
        ownerName,
        mobile,
        owner: ownerId,
        status: 'active'
      });
      await saloon.save();
    }

    // Update owner's state status to 4 (profile completed)
    await ownerModel.findByIdAndUpdate(ownerId, { owner_state_status: 4 });

    return res.status(201).json({
      success: true,
      message: 'Saloon registered successfully.',
      saloon,
      owner_state_status: 4
    });

  } catch (err) {
    console.error('Error registering saloon:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while registering saloon.',
      error: err.message
    });
  }
};


// export const registerSaloon = async (req, res, next) => {
//   try {
//     const { name, ownerName, mobile } = req.body;
//     const ownerId = res.locals.user.id;

//     // If an image was uploaded, get its filename or path
//     const logo = req.file ? req.file.filename || req.file.path : null;

//     // Find existing Saloon for this owner (temporary or real)
//     let saloon = await Saloon.findOne({ owner: ownerId });

//     if (saloon) {
//       // Update the existing Saloon with profile info
//       saloon.name = name;
//       if (logo) saloon.logo = logo; // only update if new image uploaded
//       saloon.ownerName = ownerName;
//       saloon.mobile = mobile;
//       saloon.status = 'active'; // Set status to active
//       await saloon.save();
//     } else {
//       // Create new Saloon if none exists
//       saloon = new Saloon({
//         name,
//         logo,
//         ownerName,
//         mobile,
//         owner: ownerId,
//         status: 'active'
//       });
//       await saloon.save();
//     }

//     // Update owner's state status to 3 (profile completed)
//     await ownerModel.findByIdAndUpdate(ownerId, { owner_state_status: 4 });

//     return res.status(201).json({ 
//       message: 'Saloon registered successfully.', 
//       saloon,
      
//       owner_state_status: 4
//     });

//   } catch (err) {
//     next(err);
//   }
// };




export const getSaloonDetails = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });

    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found.' });
    }

    return res.status(200).json({
      message: 'Saloon details fetched successfully.',
      saloon,
    });
  } catch (err) {
    console.error('Error fetching saloon details:', err.message);
    next(err);
  }
};



export const getFullSaloonDetails = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Get saloon by owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    // Get location by saloon ID
    const location = await Location.findOne({ saloon: saloon._id });

    return res.status(200).json({
      message: 'Saloon full details fetched successfully',
      saloon,
      location
    });
  } catch (err) {
    console.error('Error fetching full saloon details:', err.message);
    next(err);
  }
};


// Get Full Saloon Details by Saloon ID
export const getFullSaloonDetailsUsingId = async (req, res, next) => {
  try {
    const { saloonId } = req.params; // or req.query if you're passing via query

    if (!saloonId) {
      return res.status(400).json({ message: 'Saloon ID is required' });
    }

    // Find saloon by ID
    const saloon = await Saloon.findById(saloonId);
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    // Find location for this saloon
    const location = await Location.findOne({ saloon: saloon._id });

    return res.status(200).json({
      success: true,
      message: 'Saloon full details fetched successfully',
      saloon,
      location
    });
  } catch (err) {
    console.error('Error fetching full saloon details:', err.message);
    next(err);
  }
};





export const updateSaloonMobileNumber = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { newMobile } = req.body;

    if (!newMobile) {
      return res.status(400).json({ message: 'New mobile number is required.' });
    }

    // Check if mobile number already exists (to avoid duplicate entries)
    const existingOwner = await Owner.findOne({ mobile: newMobile });
    if (existingOwner) {
      return res.status(409).json({ message: 'Mobile number already in use.' });
    }

    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found.' });
    }

    owner.mobile = newMobile;
    await owner.save();

    return res.status(200).json({ message: 'Mobile number updated successfully.', mobile: owner.mobile });
  } catch (err) {
    next(err);
  }
};

// export const updateOperatingHours = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;
//     const { openTime, closeTime, workingDays } = req.body;

//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({ message: 'Saloon not found' });
//     }

//     saloon.operatingHours = {
//       openTime,
//       closeTime,
//       workingDays
//     };

//     await saloon.save();

//     return res.status(200).json({
//       message: 'Operating hours updated successfully.',
//       operatingHours: saloon.operatingHours
//     });
//   } catch (err) {
//     next(err);
//   }
// };

export const updateOperatingHours = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { day, openTime, closeTime } = req.body;

    if (!day || !openTime || !closeTime) {
      return res.status(400).json({ message: 'Day, openTime, and closeTime are required' });
    }

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    // Initialize operatingHours if not set
    if (!saloon.operatingHours) {
      saloon.operatingHours = { workingDays: [] };
    }

    if (!saloon.operatingHours.workingDays) {
      saloon.operatingHours.workingDays = [];
    }

    // Check if day already exists in workingDays
    const existingDayIndex = saloon.operatingHours.workingDays.findIndex(
      (d) => d.day.toLowerCase() === day.toLowerCase()
    );

    if (existingDayIndex >= 0) {
      // Update existing day
      saloon.operatingHours.workingDays[existingDayIndex] = { day, openTime, closeTime };
    } else {
      // Add new day
      saloon.operatingHours.workingDays.push({ day, openTime, closeTime });
    }

    await saloon.save();

    return res.status(200).json({
      message: `Operating hours for ${day} updated successfully.`,
      operatingHours: saloon.operatingHours
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};



export const getOperatingHours = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId }).select('operatingHours');
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    return res.status(200).json({
      operatingHours: saloon.operatingHours
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/saloon/:saloonId/operating-hours
export const getPublicOperatingHours = async (req, res, next) => {
  try {
    const { saloonId } = req.params;

    const saloon = await Saloon.findById(saloonId).select("operatingHours");
    if (!saloon) {
      return res.status(404).json({ success: false, message: "Saloon not found" });
    }

    return res.status(200).json({
      success: true,
      operatingHours: saloon.operatingHours,
    });
  } catch (err) {
    next(err);
  }
};



export const getSocialLinks = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId }).select('socialLinks');
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    return res.status(200).json({ socialLinks: saloon.socialLinks });
  } catch (err) {
    next(err);
  }
};



export const uploadSaloonLogo = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Save the image path or full URL if using external storage
    saloon.logo = `/uploads/saloons/${req.file.filename}`;
    await saloon.save();

    res.status(200).json({
      message: 'Image uploaded successfully',
      logoUrl: saloon.logo
    });
  } catch (err) {
    next(err);
  }
};

// export const uploadSaloonImages = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({ message: 'Saloon not found' });
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'No images uploaded' });
//     }

//     // Map uploaded files to their paths
//     const imagePaths = req.files.map(file => `/uploads/saloons/${file.filename}`);

//     // Push new images to existing array
//     saloon.images = saloon.images.concat(imagePaths);

//     await saloon.save();

//     res.status(200).json({
//       message: 'Images uploaded successfully',
//       images: saloon.images
//     });
//   } catch (err) {
//     next(err);
//   }
// };






export const uploadSaloonImages = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Convert old string images to proper objects and filter invalid entries
    saloon.images = (saloon.images || [])
      .map(img => {
        if (!img) return null; // remove null / undefined
        if (typeof img === 'string') {
          return { id: uuidv4(), path: img };
        }
        if (img.id && img.path) return img; // valid object
        return null; // remove invalid objects
      })
      .filter(Boolean); // remove nulls

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageObjects = req.files.map(file => ({
      id: uuidv4(),
      path: `${baseUrl}/uploads/saloons/${file.filename}`
    }));

    saloon.images.push(...imageObjects);

    await saloon.save();

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: saloon.images
    });
  } catch (err) {
    console.error('Error uploading saloon images:', err);
    next(err);
  }
};




export const deleteSaloonImage = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { imageId } = req.params; // pass image ID in URL

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    // Find the image to delete
    const imageIndex = saloon.images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const [removedImage] = saloon.images.splice(imageIndex, 1);

    // Delete the file from the server
    const filePath = path.join(process.cwd(), removedImage.path.replace(`${req.protocol}://${req.get('host')}`, ''));
    fs.unlink(filePath, err => {
      if (err) console.warn('File deletion error:', err);
    });

    await saloon.save();

    res.status(200).json({
      message: 'Image deleted successfully',
      images: saloon.images
    });
  } catch (err) {
    console.error('Error deleting saloon image:', err);
    next(err);
  }
};



export const getAllImages = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Select logo and images array
    const saloon = await Saloon.findOne({ owner: ownerId }).select('logo images');
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    return res.status(200).json({
      logo: saloon.logo,
      images: saloon.images || []
    });
  } catch (err) {
    next(err);
  }
};

export const updateSocialLinks = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { instagram, facebook, twitter, linkedin, whatsapp } = req.body;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    saloon.socialLinks = {
      instagram,
      facebook,
      twitter,
      linkedin,
      whatsapp
    };

    await saloon.save();

    return res.status(200).json({
      message: 'Social media links updated successfully.',
      socialLinks: saloon.socialLinks
    });
  } catch (err) {
    next(err);
  }
};


// export const updateSaloonData = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;
//     const { newMobile, email } = req.body;

//     if (!newMobile) {
//       return res.status(400).json({ message: 'New mobile number is required.' });
//     }

//     const existingMobile = await Owner.findOne({ mobile: newMobile });
//     if (existingMobile && existingMobile._id.toString() !== ownerId) {
//       return res.status(409).json({ message: 'Mobile number already in use.' });
//     }

//     if (email) {
//       const existingEmail = await Owner.findOne({ email });
//       if (existingEmail && existingEmail._id.toString() !== ownerId) {
//         return res.status(409).json({ message: 'Email already in use.' });
//       }
//     }

//     const owner = await Owner.findById(ownerId);
//     if (!owner) {
//       return res.status(404).json({ message: 'Owner not found.' });
//     }

//     owner.mobile = newMobile;
//     if (email) owner.email = email;

//     await owner.save();

//     return res.status(200).json({
//       message: 'Mobile number and email updated successfully.',
//       mobile: owner.mobile,
//       email: owner.email || null
//     });
//   } catch (err) {
//     console.error(err.message);
//     next(err);
//   }
// };



// export const updateSaloonData = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;
//     const { newMobile, email } = req.body;

//     // At least one field should be provided
//     if (!newMobile && !email) {
//       return res.status(400).json({
//         message: "Please provide at least one field (mobile or email)."
//       });
//     }

//     // Check duplicate mobile only if mobile provided
//     if (newMobile) {
//       const existingMobile = await Owner.findOne({ mobile: newMobile });
//       if (existingMobile && existingMobile._id.toString() !== ownerId) {
//         return res.status(409).json({ message: "Mobile number already in use." });
//       }
//     }

//     // Check duplicate email only if email provided
//     if (email) {
//       const existingEmail = await Owner.findOne({ email });
//       if (existingEmail && existingEmail._id.toString() !== ownerId) {
//         return res.status(409).json({ message: "Email already in use." });
//       }
//     }

//     const owner = await Owner.findById(ownerId);
//     if (!owner) {
//       return res.status(404).json({ message: "Owner not found." });
//     }

//     // Update only provided fields
//     if (newMobile) owner.mobile = newMobile;
//     if (email) owner.email = email;

//     await owner.save();

//     return res.status(200).json({
//       message: "Profile updated successfully.",
//       mobile: owner.mobile,
//       email: owner.email || null
//     });

//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// };
export const updateSaloonData = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { newMobile, email } = req.body;

    // At least one required
    if (!newMobile && !email) {
      return res.status(400).json({
        message: "Provide at least mobile or email."
      });
    }

    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Update fields if provided (no duplicate validation)
    if (newMobile) owner.mobile = newMobile;
    if (email) owner.email = email;

    await owner.save();

    return res.status(200).json({
      message: "Updated successfully",
      mobile: owner.mobile,
      email: owner.email
    });

  } catch (err) {
    console.log(err);
    next(err);
  }
};

// Helper to merge online + offline appointments
const getAllAppointmentse = async (saloonId, filter = {}) => {
  const online = await Appointment.find({ saloonId, ...filter })
    .populate("customer.id", "name mobile")
    .populate("serviceIds", "name price")
    .populate("professionalId", "name");

  const offline = await OfflineAppointment.find({ saloonId, ...filter })
    .populate("customer.id", "name mobile")
    .populate("serviceIds", "name price")
    .populate("professionalId", "name");

  return [...online, ...offline];
};



// ---------------------------
// Controller: Generate Report
// ---------------------------
export const generateReport = async (req, res) => {
  try {
    const saloonId = req.params.saloonId;
    const { type, startDate, endDate } = req.query; // type = all, weekly, monthly, team, earnings, etc.

    let data = [];
    let fields = [];
    let fileName = 'report';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (type) {
      case 'all_appointments':
        data = await getAllAppointmentse(saloonId);
        fields = ['bookingRef', 'customer.id.name', 'customer.mobile', 'professionalId.name', 'date', 'time', 'status', 'price'];
        fileName = 'all_appointments';
        break;

      case 'weekly_appointments':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Sunday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        data = await getAllAppointmentse(saloonId, {
          realDate: { $gte: weekStart, $lte: weekEnd }
        });
        fields = ['bookingRef', 'customer.id.name', 'customer.mobile', 'professionalId.name', 'date', 'time', 'status', 'price'];
        fileName = 'weekly_appointments';
        break;

      case 'monthly_appointments':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        data = await getAllAppointmentse(saloonId, {
          realDate: { $gte: monthStart, $lte: monthEnd }
        });
        fields = ['bookingRef', 'customer.id.name', 'customer.mobile', 'professionalId.name', 'date', 'time', 'status', 'price'];
        fileName = 'monthly_appointments';
        break;

      case 'team_members':
        data = await TeamMember.find({ saloonId });
        fields = ['name', 'role', 'mobile', 'email'];
        fileName = 'team_members';
        break;

      case 'daywise_earning':
        data = await getAllAppointmentse(saloonId);
        const dayMap = {};
        data.forEach(a => {
          const day = new Date(a.date).toDateString();
          dayMap[day] = (dayMap[day] || 0) + Number(a.price);
        });
        data = Object.keys(dayMap).map(day => ({ day, earning: dayMap[day] }));
        fields = ['day', 'earning'];
        fileName = 'daywise_earning';
        break;

      case 'weekwise_earning':
        data = await getAllAppointmentse(saloonId);
        const weekEarnings = {};
        data.forEach(a => {
          const d = new Date(a.date);
          const weekNumber = Math.ceil((d.getDate() + 6 - d.getDay()) / 7);
          const key = `${d.getFullYear()}-W${weekNumber}`;
          weekEarnings[key] = (weekEarnings[key] || 0) + Number(a.price);
        });
        data = Object.keys(weekEarnings).map(week => ({ week, earning: weekEarnings[week] }));
        fields = ['week', 'earning'];
        fileName = 'weekwise_earning';
        break;

      case 'custom_range':
        if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'Start and end date required' });
        data = await getAllAppointmentse(saloonId, {
          realDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        fields = ['bookingRef', 'customer.id.name', 'customer.mobile', 'professionalId.name', 'date', 'time', 'status', 'price'];
        fileName = `appointments_${startDate}_to_${endDate}`;
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    generateCSV(data, fields, fileName, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// export const updateSaloonData = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;
//     const { newMobile, email } = req.body;

//     // At least one required
//     if (!newMobile && !email) {
//       return res.status(400).json({
//         message: "Provide at least mobile or email."
//       });
//     }

//     // Duplicate check for mobile
//     if (newMobile) {
//       const existMobile = await Owner.findOne({ mobile: newMobile });
//       if (existMobile && existMobile._id.toString() !== ownerId) {
//         return res.status(409).json({ message: "Mobile already in use." });
//       }
//     }

//     // Duplicate check for email
//     if (email) {
//       const existEmail = await Owner.findOne({ email: email });
//       if (existEmail && existEmail._id.toString() !== ownerId) {
//         return res.status(409).json({ message: "Email already in use." });
//       }
//     }

//     const owner = await Owner.findById(ownerId);

//     if (newMobile) owner.mobile = newMobile;
//     if (email) owner.email = email;  // <-- IMPORTANT FIX

//     await owner.save();

//     return res.status(200).json({
//       message: "Updated successfully",
//       mobile: owner.mobile,
//       email: owner.email
//     });

//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// };




// export const filterAppointments = async (req, res, next) => {
//   try {
//     const saloonId = res.locals.user?.id; // Saloon owner
//     const {
//       dateRange,
//       customerName,
//       staffId,
//       status,
//       serviceId,
//       paymentStatus,
//     } = req.query;

//     if (!saloonId) return res.status(401).json({ success: false, message: 'Unauthorized' });

//     // Date filter
//     let startDate, endDate;
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);

//     switch (dateRange) {
//       case 'today':
//         startDate = new Date(today.setHours(0,0,0,0));
//         endDate = new Date(today.setHours(23,59,59,999));
//         break;
//       case 'tomorrow':
//         startDate = new Date(tomorrow.setHours(0,0,0,0));
//         endDate = new Date(tomorrow.setHours(23,59,59,999));
//         break;
//       case 'this_week':
//         const first = today.getDate() - today.getDay(); // First day of week
//         startDate = new Date(today.setDate(first));
//         startDate.setHours(0,0,0,0);
//         endDate = new Date(today.setDate(first + 6));
//         endDate.setHours(23,59,59,999);
//         break;
//       case 'this_month':
//         startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//         endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23,59,59,999);
//         break;
//     }

//     // Build filter object
//     const filter = { saloonId: mongoose.Types.ObjectId(saloonId) };
//     if (startDate && endDate) filter.date = { $gte: startDate, $lte: endDate };
//     if (customerName) filter.customerName = { $regex: customerName, $options: 'i' };
//     if (staffId) filter.$or = [{ professionalId: staffId }, { teamMemberId: staffId }];
//     if (status) filter.status = status.toLowerCase();
//     if (serviceId) filter.$or = [{ serviceId }, { serviceIds: serviceId }]; // online/offline
//     if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

//     // Fetch online and offline appointments
//     const [onlineAppointments, offlineAppointments] = await Promise.all([
//       OnlineAppointment.find({ ...filter }),
//       OfflineAppointment.find({ ...filter })
//     ]);

//     res.status(200).json({ success: true, data: [...onlineAppointments, ...offlineAppointments] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };



// export const filterAppointments = async (req, res, next) => {
//   try {
//     const saloonId = res.locals.user?.id; // Saloon owner
//     const {
//       dateRange,
//       customerName,
//       staffId,
//       status,
//       serviceId,
//       paymentStatus,
//     } = req.query;

//     if (!saloonId) 
//       return res.status(401).json({ success: false, message: 'Unauthorized' });

//     // ---------- Date Filter ----------
//     let startDate, endDate;
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);

//     switch (dateRange) {
//       case 'today':
//         startDate = new Date(today.setHours(0,0,0,0));
//         endDate = new Date(today.setHours(23,59,59,999));
//         break;
//       case 'tomorrow':
//         startDate = new Date(tomorrow.setHours(0,0,0,0));
//         endDate = new Date(tomorrow.setHours(23,59,59,999));
//         break;
//       case 'this_week':
//         const first = today.getDate() - today.getDay();
//         startDate = new Date(today.setDate(first));
//         startDate.setHours(0,0,0,0);
//         endDate = new Date(today.setDate(first + 6));
//         endDate.setHours(23,59,59,999);
//         break;
//       case 'this_month':
//         startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//         endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23,59,59,999);
//         break;
//     }

//     // ---------- Build Filter ----------
//     const filter = { saloonId: mongoose.Types.ObjectId(saloonId) };
//     if (startDate && endDate) filter.date = { $gte: startDate, $lte: endDate };
//     if (customerName) filter.customerName = { $regex: customerName, $options: 'i' };
//     if (status) filter.status = status.toLowerCase();
//     if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

//     // ---------- Combine OR Conditions ----------
//     const orConditions = [];
//     if (staffId) {
//       orConditions.push({ professionalId: staffId }, { teamMemberId: staffId });
//     }
//     if (serviceId) {
//       orConditions.push({ serviceId }, { serviceIds: serviceId });
//     }
//     if (orConditions.length) {
//       filter.$or = orConditions;
//     }

//     // ---------- Fetch Appointments ----------
//     const [onlineAppointments, offlineAppointments] = await Promise.all([
//       OnlineAppointment.find(filter),
//       OfflineAppointment.find(filter)
//     ]);

//     res.status(200).json({ success: true, data: [...onlineAppointments, ...offlineAppointments] });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };



// export const filterAppointments = async (req, res, next) => {
//   try {
//     const saloonId = res.locals.user?.id; // Saloon owner
//     const {
//       dateRange,
//       startDate: customStartDate,
//       endDate: customEndDate,
//       customerName,
//       staffId,
//       status,
//       serviceId,
//       paymentStatus,
//     } = req.body;

//     if (!saloonId) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     // ---------- Date Filter ----------
//     let startDate, endDate;
//     const today = new Date();
//     const tomorrow = new Date();
//     tomorrow.setDate(today.getDate() + 1);

//     if (customStartDate && customEndDate) {
//       // अगर user ने manual date दी है
//       startDate = new Date(customStartDate);
//       startDate.setHours(0, 0, 0, 0);

//       endDate = new Date(customEndDate);
//       endDate.setHours(23, 59, 59, 999);
//     } else {
//       // Predefined ranges
//       switch (dateRange) {
//         case "today":
//           startDate = new Date();
//           startDate.setHours(0, 0, 0, 0);
//           endDate = new Date();
//           endDate.setHours(23, 59, 59, 999);
//           break;
//         case "tomorrow":
//           startDate = new Date(tomorrow.setHours(0, 0, 0, 0));
//           endDate = new Date(tomorrow.setHours(23, 59, 59, 999));
//           break;
//         case "this_week":
//           const first = today.getDate() - today.getDay();
//           startDate = new Date(today.setDate(first));
//           startDate.setHours(0, 0, 0, 0);
//           endDate = new Date(today.setDate(first + 6));
//           endDate.setHours(23, 59, 59, 999);
//           break;
//         case "this_month":
//           startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//           endDate = new Date(
//             today.getFullYear(),
//             today.getMonth() + 1,
//             0,
//             23,
//             59,
//             59,
//             999
//           );
//           break;
//       }
//     }

//     // ---------- Build Filter ----------
//     const filter = { saloonId: new mongoose.Types.ObjectId(saloonId) };

//     if (startDate && endDate) {
//       filter.date = { $gte: startDate, $lte: endDate };
//     }

//     if (customerName) {
//       filter.customerName = { $regex: customerName, $options: "i" };
//     }

//     if (status) {
//       filter.status = new RegExp(`^${status}$`, "i"); // case-insensitive
//     }

//     if (paymentStatus && paymentStatus !== "all") {
//       filter.paymentStatus = paymentStatus;
//     }

//     // ---------- Combine OR Conditions ----------
//     const orConditions = [];
//     if (staffId) {
//       orConditions.push(
//         { professionalId: new mongoose.Types.ObjectId(staffId) },
//         { teamMemberId: new mongoose.Types.ObjectId(staffId) }
//       );
//     }
//     if (serviceId) {
//       orConditions.push(
//         { serviceId: new mongoose.Types.ObjectId(serviceId) },
//         { serviceIds: new mongoose.Types.ObjectId(serviceId) }
//       );
//     }
//     if (orConditions.length) {
//       filter.$or = orConditions;
//     }

//     console.log("Final Filter:", filter);

//     // ---------- Fetch Appointments ----------
//     const [onlineAppointments, offlineAppointments] = await Promise.all([
//       Appointment.find(filter),
//       OfflineAppointment.find(filter),
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: [...onlineAppointments, ...offlineAppointments],
//     });
//   } catch (error) {
//     console.error("Filter Error:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };





// export const filterAppointments = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // find saloon of this owner
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({ success: false, message: "Saloon not found" });
//     }

//     const {
//       bookingRef,
//       customerName,
//       mobile,
//       status,
//       serviceId,
//       staffId,
//       date,          // exact date string e.g. "Wed, Dec 03, 2025"
//       startDate,     // custom range start
//       endDate ,
//       type                     // custom range end
//     } = req.body;

//     // ------------------------------
//     // BUILD FILTER
//     // ------------------------------
//     const filter = { saloonId: saloon._id };

//     // 🔍 1. Exact bookingRef
//     if (bookingRef) {
//       filter.bookingRef = bookingRef.trim();
//     }

//     // 🔍 2. Customer Name
//     if (customerName) {
//       filter["customerName"] = { $regex: customerName, $options: "i" };
//     }

//     // 🔍 3. Customer Mobile
//     if (mobile) {
//       filter["customer.mobile"] = { $regex: mobile, $options: "i" };
//     }

//     // 🔍 4. Status filter
//     if (status) {
//       filter.status = status;
//     }

//     // 🔍 5. Staff filter
//     if (staffId) {
//       filter.professionalId = staffId;
//     }

//     // 🔍 6. Single Date Filter (Exact string match)
//     if (date) {
//       filter.date = date;       // Because your date is a STRING
//     }

//     // 🔍 7. Date Range filter (string compare)
//     if (startDate && endDate) {
//       filter.date = { $gte: startDate, $lte: endDate };
//     }

//     // 🔍 8. Services filter
//     if (serviceId) {
//       filter.serviceIds = serviceId;
//     }


//      const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tomorrow = new Date();
//     tomorrow.setDate(today.getDate() + 1);
//     tomorrow.setHours(0, 0, 0, 0);

//     // Convert to string format (your DB stores date as STRING)
//     const todayStr = today.toDateString();
//     const tomorrowStr = tomorrow.toDateString();

//     console.log("Today:", todayStr);
//     console.log("Tomorrow:", tomorrowStr);

//     // -------------------------
//     // FILTER TYPES
//     // -------------------------

//     if (type === "current") {
//       // today’s appointments
//       filter.date = todayStr;
//     }
//     else if (type === "tomorrow") {
//       filter.date = tomorrowStr;
//     }
//     else if (type === "past") {
//       filter.date = { $lt: todayStr };
//     }
//     else if (type === "all") {
//         delete filter.date;
//     }

//     // ------------------------------
//     // FINAL QUERY
//     // ------------------------------
//     console.log("FINAL FILTER:", filter);

//     // ------------------------------
//     // FETCH FROM BOTH TABLES
//     // ------------------------------
//     const online = await Appointment.find(filter)
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       // .populate("professionalId", "name");

//     const offline = await OfflineAppointment.find(filter)
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price")
//       // .populate("professionalId", "name");

//     // Merge
//     const data = [...online, ...offline];

//     return res.status(200).json({
//       success: true,
//       message: "Filtered appointments",
//       data,
//     });

//   } catch (err) {
//     next(err);
//   }
// };

export const filterAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon)
      return res.status(404).json({ success: false, message: "Saloon not found" });

    const {
      bookingRef,
      customerName,
      mobile,
      status,
      serviceId,
      staffId,
      date,
      startDate,
      endDate,
      type
    } = req.body;

    // -------------------------
    // Fetch all appointments first
    // -------------------------
    let allOnline = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price");

    let allOffline = await OfflineAppointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price");

    let all = [...allOnline, ...allOffline];

    // -------------------------
    // Convert string date -> realDate
    // -------------------------
    all = all.map(a => ({
      ...a._doc,
      realDate: parseStringDate(a.date)
    }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // -------------------------
    // Apply Filters
    // -------------------------
    if (bookingRef) {
      all = all.filter(a => a.bookingRef?.toLowerCase().includes(bookingRef.toLowerCase()));
    }

    if (customerName) {
      all = all.filter(a => a.customer?.id?.name?.toLowerCase().includes(customerName.toLowerCase()));
    }

    if (mobile) {
      all = all.filter(a =>
        a.customer?.mobile?.includes(mobile) ||
        a.customer?.id?.mobile?.includes(mobile)
      );
    }

    if (status) {
      all = all.filter(a => a.status === status);
    }

    if (staffId) {
      all = all.filter(a => a.professionalId?.toString() === staffId);
    }

    if (serviceId) {
      all = all.filter(a =>
        a.serviceIds.some(s => s._id.toString() === serviceId)
      );
    }

    // Exact date filter
    if (date) {
      const selected = parseStringDate(date);
      all = all.filter(a => a.realDate?.getTime() === selected?.getTime());
    }

    // Custom date range
    if (startDate && endDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      all = all.filter(a => a.realDate >= s && a.realDate <= e);
    }

    // Type filter
    if (type === "current") all = all.filter(a => a.realDate?.getTime() === today.getTime());
    if (type === "tomorrow") all = all.filter(a => a.realDate?.getTime() === tomorrow.getTime());
    if (type === "past") all = all.filter(a => a.realDate < today);
    if (type === "all") {} // no filter

    return res.status(200).json({
      success: true,
      message: "Filtered appointments",
      data: all
    });

  } catch (err) {
    next(err);
  }
};






// async function generateCSV(filename, rows) {
//   const filePath = path.join(reportsPath, filename);

//   const writer = createObjectCsvWriter({
//     path: filePath,
//     header: Object.keys(rows[0] || {}).map(key => ({ id: key, title: key }))
//   });

//   await writer.writeRecords(rows);
// }

// export const fullReport = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;
//     const saloon = await Saloon.findOne({ owner: ownerId });

//     if (!saloon)
//       return res.status(404).json({ success: false, message: "Saloon not found" });

//     const saloonId = saloon._id;

//     // Fetch all appointments
//     const online = await Appointment.find({ saloonId });
//     const offline = await OfflineAppointment.find({ saloonId });

//     const all = [
//       ...online.map(a => ({ ...a._doc, realDate: new Date(a.date) })),
//       ...offline.map(a => ({ ...a._doc, realDate: new Date(a.date) }))
//     ];

//     const now = new Date();
//     const todayStart = new Date(now.setHours(0, 0, 0, 0));
//     const todayEnd = new Date(now.setHours(23, 59, 59, 999));
//     const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//     const fifteenStart = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
//     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

//     const todayAppointments = all.filter(a => a.realDate >= todayStart && a.realDate <= todayEnd);
//     const weekAppointments = all.filter(a => a.realDate >= weekStart);
//     const fifteenDaysAppointments = all.filter(a => a.realDate >= fifteenStart);
//     const monthAppointments = all.filter(a => a.realDate >= monthStart);

//     const teamMembers = await teamMemberModel.find({ saloon: saloonId });

//     const memberStats = teamMembers.map(tm => {
//       const count = all.filter(a =>
//         (a.professionalId && a.professionalId.toString() === tm._id.toString()) ||
//         (a.teamMemberId && a.teamMemberId.toString() === tm._id.toString())
//       ).length;

//       return { id: tm._id, name: tm.name, role: tm.role, totalAppointments: count };
//     });

//     const topTeamMember = memberStats.sort((a, b) => b.totalAppointments - a.totalAppointments)[0];

//     const earnings = online.reduce((s, a) => s + Number(a.price || 0), 0);

//     // ---------------------------
//     // Generate PDFs + CSVs
//     // ---------------------------
//     const files = [
//       { name: "today", rows: todayAppointments },
//       { name: "week", rows: weekAppointments },
//       { name: "15days", rows: fifteenDaysAppointments },
//       { name: "month", rows: monthAppointments },
//       { name: "team-members", rows: memberStats },
//       { name: "top-member", rows: [topTeamMember] },
//       { name: "earnings", rows: [{ earnings }] }
//     ];

//     for (let f of files) {
//       generatePDF(`${f.name}.pdf`, f.name.toUpperCase(), f.rows);
//       await generateCSV(`${f.name}.csv`, f.rows);
//     }

//     const baseURL = `${req.protocol}://${req.headers.host}/api/reports`;

//     return res.status(200).json({
//       success: true,
//       message: "Report files generated",
//       files: {
//         today: {
//           pdf: `${baseURL}/today.pdf`,
//           csv: `${baseURL}/today.csv`
//         },
//         week: {
//           pdf: `${baseURL}/week.pdf`,
//           csv: `${baseURL}/week.csv`
//         },
//         fifteenDays: {
//           pdf: `${baseURL}/15days.pdf`,
//           csv: `${baseURL}/15days.csv`
//         },
//         month: {
//           pdf: `${baseURL}/month.pdf`,
//           csv: `${baseURL}/month.csv`
//         },
//         teamMembers: {
//           pdf: `${baseURL}/team-members.pdf`,
//           csv: `${baseURL}/team-members.csv`
//         },
//         topTeamMember: {
//           pdf: `${baseURL}/top-member.pdf`,
//           csv: `${baseURL}/top-member.csv`
//         },
//         earnings: {
//           pdf: `${baseURL}/earnings.pdf`,
//           csv: `${baseURL}/earnings.csv`
//         }
//       }
//     });

//   } catch (err) {
//     next(err);
//   }
// };

// export const fullReport = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon)
//       return res.status(404).json({ success: false, message: "Saloon not found" });

//     const saloonId = saloon._id;

//     // --------------------------------
//     // FETCH ALL ONLINE + OFFLINE APPTS
//     // --------------------------------
//     const onlineAppointments = await Appointment.find({ saloonId });
//     const offlineAppointments = await OfflineAppointment.find({ saloonId });

//     const all = [
//       ...onlineAppointments.map(a => ({
//         ...a._doc,
//         realDate: new Date(a.date)
//       })),
//       ...offlineAppointments.map(a => ({
//         ...a._doc,
//         realDate: new Date(a.date)
//       }))
//     ];

//     const now = new Date();
//     const todayStart = new Date(now.setHours(0, 0, 0, 0));
//     const todayEnd = new Date(now.setHours(23, 59, 59, 999));

//     const weekStart = new Date();
//     weekStart.setDate(weekStart.getDate() - 7);

//     const fifteenDaysStart = new Date();
//     fifteenDaysStart.setDate(fifteenDaysStart.getDate() - 15);

//     const monthStart = new Date();
//     monthStart.setDate(1);

//     // --------------------------------
//     // FILTER DATA
//     // --------------------------------
//     const todayAppointments = all.filter(a => a.realDate >= todayStart && a.realDate <= todayEnd);

//     const weekAppointments = all.filter(a => a.realDate >= weekStart);

//     const fifteenDaysAppointments = all.filter(a => a.realDate >= fifteenDaysStart);

//     const monthAppointments = all.filter(a => a.realDate >= monthStart);

//     // --------------------------------
//     // TOTAL EARNINGS (ONLINE ONLY)
//     // --------------------------------
//     const earnings = onlineAppointments.reduce((sum, a) => {
//       return sum + Number(a.price || 0);
//     }, 0);

//     // --------------------------------
//     // TEAM MEMBER PERFORMANCE
//     // --------------------------------
//     const teamMembers = await teamMemberModel.find({ saloon: saloonId });

//     const memberStats = teamMembers.map(tm => {
//       const count = all.filter(a =>
//         (a.professionalId && a.professionalId.toString() === tm._id.toString()) ||
//         (a.teamMemberId && a.teamMemberId.toString() === tm._id.toString())
//       ).length;

//       return {
//         id: tm._id,
//         name: tm.name,
//         role: tm.role,
//         totalAppointments: count
//       };
//     });

//     const topTeamMember = memberStats.sort((a, b) => b.totalAppointments - a.totalAppointments)[0] || null;

//     // --------------------------------
//     // TOP SERVICES
//     // --------------------------------
//     const serviceCount = {};

//     all.forEach(a => {
//       if (a.serviceIds) {
//         a.serviceIds.forEach(s => {
//           serviceCount[s] = (serviceCount[s] || 0) + 1;
//         });
//       }
//       if (a.serviceId) {
//         serviceCount[a.serviceId] = (serviceCount[a.serviceId] || 0) + 1;
//       }
//     });

//     const topServices = Object.entries(serviceCount)
//       .map(([serviceId, count]) => ({ serviceId, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 5);

//     // --------------------------------
//     // FINAL RESPONSE
//     // --------------------------------
//     return res.status(200).json({
//       success: true,
//       message: "Complete Report Generated Successfully",
//       data: {
//         todayAppointments,
//         weekAppointments,
//         fifteenDaysAppointments,
//         monthAppointments,
//         totalTeamMembers: teamMembers.length,
//         topTeamMember,
//         earnings,
//         topServices
//       }
//     });

//   } catch (err) {
//     next(err);
//   }
// };



// export const fullReport = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // ----------------------------
//     // FIND SALOON
//     // ----------------------------
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon)
//       return res.status(404).json({ success: false, message: "Saloon not found" });

//     const saloonId = saloon._id;

//     // ----------------------------
//     // FETCH ALL APPOINTMENTS
//     // ----------------------------
//     const onlineAppointments = await Appointment.find({ saloonId });
//     const offlineAppointments = await OfflineAppointment.find({ saloonId });

//     // Merge and normalize dates
//     const all = [
//       ...onlineAppointments.map(a => ({ ...a._doc, realDate: new Date(a.date) })),
//       ...offlineAppointments.map(a => ({ ...a._doc, realDate: new Date(a.date) }))
//     ];

//     // ----------------------------
//     // DATE RANGE CALCULATIONS
//     // ----------------------------
//     const now = new Date();

//     const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

//     const weekStart = new Date();
//     weekStart.setDate(weekStart.getDate() - 7);

//     const fifteenDaysStart = new Date();
//     fifteenDaysStart.setDate(fifteenDaysStart.getDate() - 15);

//     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

//     // ----------------------------
//     // FILTER APPOINTMENTS
//     // ----------------------------
//     const todayAppointments = all.filter(a => a.realDate >= todayStart && a.realDate <= todayEnd);
//     const weekAppointments = all.filter(a => a.realDate >= weekStart);
//     const fifteenDaysAppointments = all.filter(a => a.realDate >= fifteenDaysStart);
//     const monthAppointments = all.filter(a => a.realDate >= monthStart);

//     // ----------------------------
//     // TOTAL EARNINGS (ONLINE ONLY)
//     // ----------------------------
//     const earnings = onlineAppointments.reduce((sum, a) => sum + Number(a.price || 0), 0);

//     // ----------------------------
//     // TEAM MEMBER PERFORMANCE
//     // ----------------------------
//     const teamMembers = await teamMemberModel.find({ saloon: saloonId });

//     const memberStats = teamMembers.map(tm => {
//       const count = all.filter(a =>
//         (a.professionalId && a.professionalId.toString() === tm._id.toString()) ||
//         (a.teamMemberId && a.teamMemberId.toString() === tm._id.toString())
//       ).length;

//       return {
//         id: tm._id,
//         name: tm.name,
//         role: tm.role,
//         totalAppointments: count
//       };
//     });

//     const topTeamMember =
//       memberStats.sort((a, b) => b.totalAppointments - a.totalAppointments)[0] || null;

//     // ----------------------------
//     // TOP SERVICES
//     // ----------------------------
//     const serviceCount = {};

//     all.forEach(a => {
//       if (a.serviceIds) {
//         a.serviceIds.forEach(s => {
//           serviceCount[s] = (serviceCount[s] || 0) + 1;
//         });
//       }
//       if (a.serviceId) {
//         serviceCount[a.serviceId] = (serviceCount[a.serviceId] || 0) + 1;
//       }
//     });

//     const topServices = Object.entries(serviceCount)
//       .map(([serviceId, count]) => ({ serviceId, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 5);

//     // ----------------------------
//     // USER-FRIENDLY DOWNLOAD LINKS
//     // ----------------------------
//     const BASE = process.env.BASE_URL || "http://10.113.14.210:3000/api";

//     const links = {
//       todayAppointments: {
//         pdf: `${BASE}/reports/today.pdf`,
//         csv: `${BASE}/reports/today.csv`
//       },
//       weekAppointments: {
//         pdf: `${BASE}/reports/week.pdf`,
//         csv: `${BASE}/reports/week.csv`
//       },
//       fifteenDaysAppointments: {
//         pdf: `${BASE}/reports/15days.pdf`,
//         csv: `${BASE}/reports/15days.csv`
//       },
//       monthAppointments: {
//         pdf: `${BASE}/reports/month.pdf`,
//         csv: `${BASE}/reports/month.csv`
//       },
//       teamMembers: {
//         pdf: `${BASE}/reports/team.pdf`,
//         csv: `${BASE}/reports/team.csv`
//       },
//       topTeamMember: {
//         pdf: `${BASE}/reports/top-member.pdf`,
//         csv: `${BASE}/reports/top-member.csv`
//       },
//       earnings: {
//         pdf: `${BASE}/reports/earnings.pdf`,
//         csv: `${BASE}/reports/earnings.csv`
//       }
//     };

//     // ----------------------------
//     // FINAL RESPONSE
//     // ----------------------------
//     return res.status(200).json({
//       success: true,
//       message: "Complete Report Generated Successfully",
//       data: {
//         todayAppointments,
//         weekAppointments,
//         fifteenDaysAppointments,
//         monthAppointments,
//         totalTeamMembers: teamMembers.length,
//         teamMembers: memberStats,
//         topTeamMember,
//         earnings,
//         topServices
//       },
//       downloadLinks: links
//     });

//   } catch (err) {
//     next(err);
//   }
// };


// -------------------------
// Helper: convert string date -> Date
// -------------------------
function parseStringDate(dateStr) {
  const parsed = new Date(dateStr);
  if (parsed.toString() === "Invalid Date") return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}


// export const filterAppointments = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon)
//       return res.status(404).json({ success: false, message: "Saloon not found" });

//     const {
//       bookingRef,
//       customerName,
//       mobile,
//       status,
//       serviceId,
//       staffId,
//       date,
//       startDate,
//       endDate,
//       type
//     } = req.body;

//     const filter = { saloonId: saloon._id };

//     // Basic Filters
//     if (bookingRef) filter.bookingRef = bookingRef.trim();
//     if (customerName) filter["customer.id.name"] = { $regex: customerName, $options: "i" };
//     if (mobile) filter["customer.mobile"] = { $regex: mobile, $options: "i" };
//     if (status) filter.status = status;
//     if (staffId) filter.professionalId = staffId;
//     if (serviceId) filter.serviceIds = serviceId;

//     // Convert today/tomorrow into real Date
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);

//     // Convert DB string date → Real Date for comparison
//     // We will filter in JS after fetching

//     let allOnline = await Appointment.find({ saloonId: saloon._id })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price");

//     let allOffline = await OfflineAppointment.find({ saloonId: saloon._id })
//       .populate("customer.id", "name mobile")
//       .populate("serviceIds", "name price");

//     let all = [...allOnline, ...allOffline];

//     // Convert string date → real date
//     all = all.map(a => ({
//       ...a._doc,
//       realDate: parseStringDate(a.date)
//     }));

//     // -------- FINAL FILTERS --------

//     if (date) {
//       const selected = parseStringDate(date);
//       all = all.filter(a => a.realDate?.getTime() === selected?.getTime());
//     }

//     if (startDate && endDate) {
//       const s = new Date(startDate);
//       const e = new Date(endDate);
//       s.setHours(0, 0, 0, 0);
//       e.setHours(23, 59, 59, 999);

//       all = all.filter(a => a.realDate >= s && a.realDate <= e);
//     }

//     // TYPE FILTERS
//     if (type === "current") {
//       all = all.filter(a => a.realDate?.getTime() === today.getTime());
//     }

//     if (type === "tomorrow") {
//       all = all.filter(a => a.realDate?.getTime() === tomorrow.getTime());
//     }

//     if (type === "past") {
//       all = all.filter(a => a.realDate < today);
//     }

//     if (type === "all") {
//       // no date filter
//     }

//         // 🔍 Booking Ref search
//     if (bookingRef) {
//       orConditions.push({ bookingRef: { $regex: bookingRef, $options: "i" } });
//     }

//     if(status){
//       filter.status=status;
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Filtered appointments",
//       data: all
//     });

//   } catch (err) {
//     next(err);
//   }
// };

// function parseStringDate(dateStr) {
//   const parsed = new Date(dateStr);
//   if (parsed.toString() === "Invalid Date") return null;
//   parsed.setHours(0, 0, 0, 0);
//   return parsed;
// }


// Helper: convert start-end to list of strings matching DB format





// export const deleteSaloonImage = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;
//     const { imageName } = req.params; // Name of the image to delete

//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({ message: 'Saloon not found' });
//     }

//     // Check if the image exists in the saloon
//     const imageIndex = saloon.images.findIndex(img => img.endsWith(imageName));
//     if (imageIndex === -1) {
//       return res.status(404).json({ message: 'Image not found' });
//     }

//     // Remove the image from the array
//     const [removedImage] = saloon.images.splice(imageIndex, 1);

//     // Delete the file from disk
//     const filePath = path.join(process.cwd(), removedImage);
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     await saloon.save();

//     res.status(200).json({
//       message: 'Image deleted successfully',
//       images: saloon.images
//     });
//   } catch (err) {
//     next(err);
//   }
// };



if (!fs.existsSync(reportsPath)) fs.mkdirSync(reportsPath, { recursive: true });

// Utility to flatten appointments
// function flattenAppointments(appointments) {
//   return appointments.map(a => ({
//     bookingRef: a.bookingRef,
//     customerId: a.customer?.id || "",
//     customerMobile: a.customer?.mobile || "",
//     professionalId: a.professionalId || "",
//     serviceIds: a.serviceIds ? a.serviceIds.join(", ") : a.serviceId || "",
//     date: a.date,
//     time: a.time,
//     duration: a.duration,
//     price: a.price,
//     status: a.status,
//     discount: a.discount,
//     discountCode: a.discountCode || "",
//     notes: a.notes || "",
//     realDate: a.realDate ? a.realDate.toISOString().split("T")[0] : ""
//   }));
// }



// Generate CSV
// async function generateCSV(filename, rows) {
//   if (!rows.length) return;
//   const filePath = path.join(reportsPath, filename);
//   const writer = createObjectCsvWriter({
//     path: filePath,
//     header: Object.keys(rows[0]).map(key => ({ id: key, title: key }))
//   });
//   await writer.writeRecords(rows);
// }

// Controller
// export const fullReport = async (req, res, next) => {
//   try {

//   const saloonId = req.headers['saloon-id'] || req.query['saloon-id'];
// if (!saloonId) return res.status(400).json({ success: false, message: "saloon-id missing" });


//     const saloon = await Saloon.findById(saloonId);
//     if (!saloon) return res.status(404).json({ success: false, message: "Saloon not found" });



//     // Fetch all appointments
//     const online = await Appointment.find({ saloonId });
//     const offline = await OfflineAppointment.find({ saloonId });
//     const allAppointments = [
//       ...online.map(a => ({ ...a._doc, realDate: new Date(a.date) })),
//       ...offline.map(a => ({ ...a._doc, realDate: new Date(a.date) }))
//     ];

//     // Time ranges
//     const now = new Date();
//     const todayStart = new Date(now.setHours(0, 0, 0, 0));
//     const todayEnd = new Date(now.setHours(23, 59, 59, 999));
//     const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//     const fifteenStart = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
//     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

//     // Filtered
//     const todayAppointments = flattenAppointments(allAppointments.filter(a => a.realDate >= todayStart && a.realDate <= todayEnd));
//     const weekAppointments = flattenAppointments(allAppointments.filter(a => a.realDate >= weekStart));
//     const fifteenAppointments = flattenAppointments(allAppointments.filter(a => a.realDate >= fifteenStart));
//     const monthAppointments = flattenAppointments(allAppointments.filter(a => a.realDate >= monthStart));

//     // Team members
//     const teamMembers = await teamMemberModel.find({ saloon: saloonId });
//     const memberStats = teamMembers.map(tm => {
//       const count = allAppointments.filter(a =>
//         (a.professionalId && a.professionalId.toString() === tm._id.toString()) ||
//         (a.teamMemberId && a.teamMemberId.toString() === tm._id.toString())
//       ).length;
//       return { id: tm._id, name: tm.name, role: tm.role, totalAppointments: count };
//     });
//     const topTeamMember = memberStats.sort((a, b) => b.totalAppointments - a.totalAppointments)[0] || {};

//     // Earnings
//     const earnings = online.reduce((sum, a) => sum + Number(a.price || 0), 0);

//     // Generate files
//     const files = [
//       { name: "today", rows: todayAppointments },
//       { name: "week", rows: weekAppointments },
//       { name: "15days", rows: fifteenAppointments },
//       { name: "month", rows: monthAppointments },
//       { name: "team-members", rows: memberStats },
//       { name: "top-member", rows: [topTeamMember] },
//       { name: "earnings", rows: [{ earnings }] }
//     ];

//     for (let f of files) {
//       generatePDF(`${f.name}.pdf`, f.name.toUpperCase(), f.rows);
//       await generateCSV(`${f.name}.csv`, f.rows);
//     }

//     const baseURL = `${req.protocol}://${req.headers.host}/api/reports`;

//     return res.status(200).json({
//       success: true,
//       message: "Report files generated",
//       files: {
//         today: { pdf: `${baseURL}/today.pdf`, csv: `${baseURL}/today.csv` },
//         week: { pdf: `${baseURL}/week.pdf`, csv: `${baseURL}/week.csv` },
//         fifteenDays: { pdf: `${baseURL}/15days.pdf`, csv: `${baseURL}/15days.csv` },
//         month: { pdf: `${baseURL}/month.pdf`, csv: `${baseURL}/month.csv` },
//         teamMembers: { pdf: `${baseURL}/team-members.pdf`, csv: `${baseURL}/team-members.csv` },
//         topTeamMember: { pdf: `${baseURL}/top-member.pdf`, csv: `${baseURL}/top-member.csv` },
//         earnings: { pdf: `${baseURL}/earnings.pdf`, csv: `${baseURL}/earnings.csv` }
//       }
//     });

//   } catch (err) {
//     next(err);
//   }
// };






// Helper to flatten appointment objects
function flattenAppointments(rows) {
  return rows.map(a => ({
    BookingRef: a.bookingRef || "",
    CustomerName: a.customer?.id?.name || a.customerName || "",
    CustomerMobile: a.customer?.id?.mobile || a.customer?.mobile || a.contactNumber || "",
    Date: a.date || "",
    Time: a.time || "",
    Services: Array.isArray(a.serviceIds) ? a.serviceIds.map(s => s.name || s).join(", ") : (a.serviceName || ""),
    Professional: a.professionalId || a.teamMemberName || "",
    Price: a.price || "",
    Status: a.status || "",
    Notes: a.notes || "",
  }));
}

function flattenTeamMembers(rows) {
  return rows.map(tm => ({
    Name: tm.name,
    Role: tm.role,
    TotalAppointments: tm.totalAppointments,
  }));
}

function flattenTopMember(rows) {
  return rows.map(tm => ({
    Name: tm.name || "",
    Role: tm.role || "",
    TotalAppointments: tm.totalAppointments || 0,
  }));
}

function flattenEarnings(rows) {
  return rows.map(e => ({ Earnings: e.earnings || 0 }));
}

// Generate PDF
// function generatePDF(fileName, title, rows) {
//   const reportsPath = path.join(process.cwd(), "public/reports");
//   if (!fs.existsSync(reportsPath)) fs.mkdirSync(reportsPath, { recursive: true });

//   const doc = new PDFDocument({ margin: 30 });
//   const filePath = path.join(reportsPath, fileName);
//   doc.pipe(fs.createWriteStream(filePath));

//   doc.fontSize(18).text(title, { align: "center" });
//   doc.moveDown();

//   if (rows.length > 0) {
//     const keys = Object.keys(rows[0]);
//     doc.fontSize(12);
//     // Table header
//     keys.forEach(key => doc.text(key, { continued: true, width: 100 }));
//     doc.moveDown(0.5);

//     // Table rows
//     rows.forEach(row => {
//       keys.forEach(key => doc.text(String(row[key] || ""), { continued: true, width: 100 }));
//       doc.moveDown(0.5);
//     });
//   } else {
//     doc.text("No data available", { align: "center" });
//   }

//   doc.end();
// }


export function generatePDF(fileName, title, rows) {
  const reportsPath = path.join(process.cwd(), "public/reports");
  if (!fs.existsSync(reportsPath)) fs.mkdirSync(reportsPath, { recursive: true });

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const filePath = path.join(reportsPath, fileName);
  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(22).fillColor("#2E86C1").text(title, { align: "center" });
  doc.moveDown(1);

  if (!rows || rows.length === 0) {
    doc.fontSize(14).fillColor("#555").text("No data available", { align: "center" });
    doc.end();
    return;
  }

  const keys = Object.keys(rows[0]);
  const pageWidth = doc.page.width - doc.options.margin * 2;
  const columnWidth = pageWidth / keys.length;
  let y = doc.y + 10;

  // Table Header
  doc.fontSize(12).fillColor("#fff").font("Helvetica-Bold");
  keys.forEach((key, i) => {
    doc.rect(doc.options.margin + i * columnWidth, y, columnWidth, 25).fill("#2E86C1").stroke();
    doc.fillColor("#fff").text(key, doc.options.margin + i * columnWidth + 5, y + 7, {
      width: columnWidth - 10,
      align: "left",
    });
  });
  y += 25;

  // Table Rows
  doc.font("Helvetica").fontSize(11).fillColor("#000");
  rows.forEach((row, rowIndex) => {
    const bgColor = rowIndex % 2 === 0 ? "#f2f2f2" : "#ffffff";
    keys.forEach((key, i) => {
      doc.rect(doc.options.margin + i * columnWidth, y, columnWidth, 20).fill(bgColor).stroke();
      doc.fillColor("#000").text(String(row[key] || ""), doc.options.margin + i * columnWidth + 5, y + 5, {
        width: columnWidth - 10,
        align: "left",
        ellipsis: true, // truncates if text too long
      });
    });
    y += 20;

    // Check if page end reached
    if (y > doc.page.height - 50) {
      doc.addPage();
      y = 50; // reset y
    }
  });

  // Footer
  doc.moveTo(doc.options.margin, doc.page.height - 40)
     .lineTo(doc.page.width - doc.options.margin, doc.page.height - 40)
     .strokeColor("#ccc").stroke();
  doc.fontSize(10).fillColor("#999").text(`Generated on: ${new Date().toLocaleString()}`, doc.options.margin, doc.page.height - 30, { align: "right" });

  doc.end();
}

// Generate CSV
async function generateCSV(fileName, rows) {
  const reportsPath = path.join(process.cwd(), "public/reports");
  if (!fs.existsSync(reportsPath)) fs.mkdirSync(reportsPath, { recursive: true });

  if (rows.length === 0) {
    rows = [{}];
  }

  const csvWriter = createObjectCsvWriter({
    path: path.join(reportsPath, fileName),
    header: Object.keys(rows[0]).map(key => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(rows);
}

// Main full report controller
export const fullReport = async (req, res, next) => {
  try {
    const saloonId = req.headers['saloon-id'] || req.query['saloon-id'];
    if (!saloonId) return res.status(400).json({ success: false, message: "saloon-id missing" });




    const saloon = await Saloon.findById(saloonId);
    if (!saloon) return res.status(404).json({ success: false, message: "Saloon not found" });

    // Fetch all appointments
    const online = await Appointment.find({ saloonId });
    const offline = await OfflineAppointment.find({ saloonId });

    const allAppointments = [
      ...online.map(a => ({ ...a._doc, realDate: new Date(a.date) })),
      ...offline.map(a => ({ ...a._doc, realDate: new Date(a.date) }))
    ];

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fifteenStart = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayAppointments = flattenAppointments(allAppointments.filter(a => a.realDate >= todayStart && a.realDate <= todayEnd));
    const weekAppointments = flattenAppointments(allAppointments.filter(a => a.realDate >= weekStart));
    const fifteenAppointments = flattenAppointments(allAppointments.filter(a => a.realDate >= fifteenStart));
    const monthAppointments = flattenAppointments(allAppointments.filter(a => a.realDate >= monthStart));

    // Team members
    const teamMembers = await teamMemberModel.find({ saloon: saloonId });
    const memberStats = teamMembers.map(tm => {
      const count = allAppointments.filter(a =>
        (a.professionalId && a.professionalId.toString() === tm._id.toString()) ||
        (a.teamMemberId && a.teamMemberId.toString() === tm._id.toString())
      ).length;
      return { id: tm._id, name: tm.name, role: tm.role, totalAppointments: count };
    });
    const topTeamMember = memberStats.sort((a, b) => b.totalAppointments - a.totalAppointments)[0] || {};

    // Earnings
    const earnings = online.reduce((sum, a) => sum + Number(a.price || 0), 0);

    // Generate files
    const files = [
      { name: "today", rows: todayAppointments },
      { name: "week", rows: weekAppointments },
      { name: "15days", rows: fifteenAppointments },
      { name: "month", rows: monthAppointments },
      { name: "team-members", rows: memberStats },
      { name: "top-member", rows: [topTeamMember] },
      { name: "earnings", rows: [{ earnings }] }
    ];

    for (let f of files) {
      let data;
      switch (f.name) {
        case "today":
        case "week":
        case "15days":
        case "month":
          data = flattenAppointments(f.rows);
          break;
        case "team-members":
          data = flattenTeamMembers(f.rows);
          break;
        case "top-member":
          data = flattenTopMember(f.rows);
          break;
        case "earnings":
          data = flattenEarnings(f.rows);
          break;
        default:
          data = f.rows;
      }
      generatePDF(`${f.name}.pdf`, f.name.toUpperCase(), data);
      await generateCSV(`${f.name}.csv`, data);
    }

    const baseURL = `${req.protocol}://${req.headers.host}/api/reports`;

    return res.status(200).json({
      success: true,
      message: "Report files generated",
      files: {
        today: { pdf: `${baseURL}/today.pdf`, csv: `${baseURL}/today.csv` },
        week: { pdf: `${baseURL}/week.pdf`, csv: `${baseURL}/week.csv` },
        fifteenDays: { pdf: `${baseURL}/15days.pdf`, csv: `${baseURL}/15days.csv` },
        month: { pdf: `${baseURL}/month.pdf`, csv: `${baseURL}/month.csv` },
        teamMembers: { pdf: `${baseURL}/team-members.pdf`, csv: `${baseURL}/team-members.csv` },
        topTeamMember: { pdf: `${baseURL}/top-member.pdf`, csv: `${baseURL}/top-member.csv` },
        earnings: { pdf: `${baseURL}/earnings.pdf`, csv: `${baseURL}/earnings.csv` }
      }
    });

  } catch (err) {
    next(err);
  }
};
