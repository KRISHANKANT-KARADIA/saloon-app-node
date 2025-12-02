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

const IMAGE_BASE_URL = "https://saloon-app-node-50470848550.asia-south1.run.app/uploads/saloon";

// export const registerSaloon = async (req, res, next) => {
//   try {
//     const { name, logo, ownerName, mobile } = req.body;
//     const ownerId = res.locals.user.id;

//     const existingSaloon = await Saloon.findOne({ owner: ownerId });
//     if (existingSaloon) {
//       return res.status(400).json({ message: 'Saloon already registered.' });
//     }

//     const saloon = new Saloon({
//       name,
//       logo,
//       ownerName,
//       mobile,
//       owner: ownerId,
//     });

//     await saloon.save();

//     return res.status(201).json({ message: 'Saloon registered successfully.', saloon });
//   } catch (err) {
//     next(err);
//   }
// };

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
    const radiusInMeters = 40 * 1000; // 40 KM radius

    const userPoint = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    // STEP 1: Find nearest location (without saloon filter)
    const nearestLocation = await Location.aggregate([
      {
        $geoNear: {
          near: userPoint,
          distanceField: "distance",
          spherical: true,
          maxDistance: radiusInMeters,
        },
      },
      { $limit: 1 },
    ]);

    if (!nearestLocation.length) {
      return res.status(404).json({
        success: false,
        message: "No saloon found near your location",
      });
    }

    const location = nearestLocation[0];

    // STEP 2: Fetch saloon details
    // if saloon reference exists → fetch
    let saloon = null;

    if (location.saloon) {
      saloon = await Saloon.findById(location.saloon)
        .select("name logo rating city owner description operatingHours");
    }

    // fallback → find saloon using owner if needed
    if (!saloon && location.owner) {
      saloon = await Saloon.findOne({ owner: location.owner })
        .select("name logo rating city owner description operatingHours");
    }

    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: "Saloon data missing for this location",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Nearest saloon fetched successfully",
      userCoordinates: { latitude, longitude },
      saloonCoordinates: location.geoLocation.coordinates,
      distanceInKm: (location.distance / 1000).toFixed(2),

      // full saloon data
  //     saloon: {
  //   ...saloon._doc,
  //   logo: saloon.logo
  //     ? `${IMAGE_BASE_URL}/${saloon.logo}`
  //     : null
  // },
  saloon: {
  ...saloon._doc,
  logo: saloon.logo
    ? saloon.logo.startsWith("http")
      ? saloon.logo
      : `${IMAGE_BASE_URL}/${saloon.logo}`
    : null
},


      // full location data
      location,

      // saloon operating hours
      operatingHours: saloon.operatingHours || null
    });

  } catch (err) {
    console.error("Error fetching saloon:", err.message);
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
//     const radiusInMeters = 40 * 1000; // 5 KM

//     const userPoint = {
//       type: "Point",
//       coordinates: [longitude, latitude],
//     };

//     // 1️⃣ Find nearest saloon within 5km
//     const nearestLocation = await Location.aggregate([
//       {
//         $geoNear: {
//           near: userPoint,
//           distanceField: "distance",
//           spherical: true,
//           maxDistance: radiusInMeters,
//           query: { saloon: { $exists: true } } // only saloons
//         }
//       },
//       { $limit: 1 } // nearest only
//     ]);

//     if (!nearestLocation.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No saloon found near your location",
//       });
//     }

//     const location = nearestLocation[0];

//     // 2️⃣ Fetch saloon details
//     const saloon = await Saloon.findById(location.saloon);

//     if (!saloon) {
//       return res.status(404).json({
//         success: false,
//         message: "Saloon data missing for this location",
//       });
//     }

//     const operatingHours = saloon.operatingHours || null;

//     return res.status(200).json({
//       success: true,
//       message: "Nearest saloon fetched successfully",
//       userCoordinates: { latitude, longitude },
//       distanceInKm: (location.distance / 1000).toFixed(2),
//       saloon,
//       location,
//       operatingHours,
//     });

//   } catch (err) {
//     console.error("Error fetching saloon by lat/long:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


// export const getSaloonByOwnerId = async (req, res) => {
//   try {
//     const { ownerId } = req.params;

//     if (!ownerId) {
//       return res.status(400).json({
//         success: false,
//         message: "Owner ID is required",
//       });
//     }

//     // 1️⃣ Get saloon using ownerId
//     const saloon = await Saloon.findOne({ owner: ownerId });

//     if (!saloon) {
//       return res.status(404).json({
//         success: false,
//         message: "No saloon found for this owner",
//       });
//     }

//     // 2️⃣ Find location linked with this saloon or owner
//     const location =
//       (await Location.findOne({ saloon: saloon._id })) ||
//       (await Location.findOne({ owner: ownerId }));

//     // 3️⃣ Get operating hours (already inside saloon)
//     const operatingHours = saloon.operatingHours || null;

//     return res.status(200).json({
//       success: true,
//       message: "Saloon details fetched successfully using ownerId",
//       saloon,
//       location,
//       operatingHours,
//     });

//   } catch (err) {
//     console.error("Error fetching saloon using ownerId:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };



// export const addSaloonContent = async (req, res, next) => {
//   try {
//     const { title, description, images } = req.body;
//     const ownerId = res.locals.user.id;

//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({ message: 'Saloon not found for this owner.' });
//     }

//     const content = new SaloonContentModel({
//       saloon: saloon._id,
//       title,
//       description,
//       images
//     });

//     await content.save();
//     res.status(201).json({ message: 'Saloon content added successfully', content });
//   } catch (error) {
//     next(error);
//   }
// };


// export const getSaloonByOwnerId = async (req, res) => {
//   try {
//     const { ownerId } = req.params;
//     const { lat, long } = req.query; // ← user current lat/long

//     if (!ownerId) {
//       return res.status(400).json({
//         success: false,
//         message: "Owner ID is required",
//       });
//     }

//     if (!lat || !long) {
//       return res.status(400).json({
//         success: false,
//         message: "Latitude and Longitude are required",
//       });
//     }

//     const latitude = parseFloat(lat);
//     const longitude = parseFloat(long);
//     const radiusInMeters = 5 * 1000; // 5km

//     // 1️⃣ Saloon find using ownerId
//     const saloon = await Saloon.findOne({ owner: ownerId });

//     if (!saloon) {
//       return res.status(404).json({
//         success: false,
//         message: "No saloon found for this owner",
//       });
//     }

//     // 2️⃣ Location of this saloon
//     const location =
//       (await Location.findOne({ saloon: saloon._id })) ||
//       (await Location.findOne({ owner: ownerId }));

//     if (!location) {
//       return res.status(404).json({
//         success: false,
//         message: "Location not found for this saloon",
//       });
//     }

//     // 3️⃣ Check if this saloon is within 5km of user loc
//     const nearbySaloon = await Location.findOne({
//       _id: location._id,
//       geoLocation: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [longitude, latitude],
//           },
//           $maxDistance: radiusInMeters,
//         },
//       },
//     });

//     const operatingHours = saloon.operatingHours || null;

//     return res.status(200).json({
//       success: true,
//       message: "Saloon details fetched successfully",
//       inRange: !!nearbySaloon, // true/false
//       saloon,
//       location,
//       operatingHours,
//     });

//   } catch (err) {
//     console.error("Error fetching saloon using ownerId:", err.message);
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



export const getAppointmentById = async (req, res, next) => {
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
    if (!appointmentId) {
      return next(new AppError("Appointment ID required", STATUS_CODES.BAD_REQUEST));
    }

    // Find single appointment by ID & saloon
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      saloonId: saloon._id,
    })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name");

    if (!appointment) {
      return next(
        new AppError("Appointment not found or not authorized", STATUS_CODES.NOT_FOUND)
      );
    }

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



export const getDashboardData = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get the saloon
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 2️⃣ Fetch appointments
    const appointments = await Appointment.find({ saloonId: saloon._id })
      .populate("customer.id", "name")
      .populate("serviceIds", "name price")
      .sort({ date: -1, time: -1 }); // latest first

    // 3️⃣ Calculate stats
    const totalAppointments = appointments.length;
    const pendingCount = appointments.filter(a => a.status === "pending").length;

    let todayRevenue = 0;
    appointments.forEach(a => {
      const appDate = new Date(a.date);
      if (a.status === "completed" && appDate >= todayStart && appDate <= todayEnd) {
        a.serviceIds.forEach(s => todayRevenue += s.price);
      }
    });

    // Growth calculation (compared to yesterday)
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    let yesterdayRevenue = 0;
    appointments.forEach(a => {
      const appDate = new Date(a.date);
      if (a.status === "completed" && appDate >= yesterdayStart && appDate <= yesterdayEnd) {
        a.serviceIds.forEach(s => yesterdayRevenue += s.price);
      }
    });

    const growthRatio = yesterdayRevenue === 0 ? 100 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    // 4️⃣ Get 5 recent appointments
    const recentAppointments = appointments.slice(0, 5);

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
      status: "completed", // ya "paid", jo bhi aapke schema me hai
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

export const getPastAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Get the saloon of the logged-in owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    const today = new Date();
    const todayStr = today.toDateString(); // e.g., "Mon Sep 15 2025"

    // 2️⃣ Fetch past appointments (before today)
    const pastAppointments = await Appointment.find({
      saloonId: saloon._id,
      date: { $lt: todayStr }, // only past dates
    })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ date: -1, time: -1 }); // most recent first

    // 3️⃣ Respond with data
    res.status(200).json({
      success: true,
      message: `Past appointments for saloon ${saloon._id}`,
      data: pastAppointments,
    });
  } catch (err) {
    next(err);
  }
};


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



export const updateSaloonData = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { newMobile, email } = req.body;

    // At least one field should be provided
    if (!newMobile && !email) {
      return res.status(400).json({
        message: "Please provide at least one field (mobile or email)."
      });
    }

    // Check duplicate mobile only if mobile provided
    if (newMobile) {
      const existingMobile = await Owner.findOne({ mobile: newMobile });
      if (existingMobile && existingMobile._id.toString() !== ownerId) {
        return res.status(409).json({ message: "Mobile number already in use." });
      }
    }

    // Check duplicate email only if email provided
    if (email) {
      const existingEmail = await Owner.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== ownerId) {
        return res.status(409).json({ message: "Email already in use." });
      }
    }

    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found." });
    }

    // Update only provided fields
    if (newMobile) owner.mobile = newMobile;
    if (email) owner.email = email;

    await owner.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      mobile: owner.mobile,
      email: owner.email || null
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};



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



export const filterAppointments = async (req, res, next) => {
  try {
    const saloonId = res.locals.user?.id; // Saloon owner
    const {
      dateRange,
      startDate: customStartDate,
      endDate: customEndDate,
      customerName,
      staffId,
      status,
      serviceId,
      paymentStatus,
    } = req.body;

    if (!saloonId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ---------- Date Filter ----------
    let startDate, endDate;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (customStartDate && customEndDate) {
      // अगर user ने manual date दी है
      startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Predefined ranges
      switch (dateRange) {
        case "today":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "tomorrow":
          startDate = new Date(tomorrow.setHours(0, 0, 0, 0));
          endDate = new Date(tomorrow.setHours(23, 59, 59, 999));
          break;
        case "this_week":
          const first = today.getDate() - today.getDay();
          startDate = new Date(today.setDate(first));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(today.setDate(first + 6));
          endDate.setHours(23, 59, 59, 999);
          break;
        case "this_month":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          break;
      }
    }

    // ---------- Build Filter ----------
    const filter = { saloonId: new mongoose.Types.ObjectId(saloonId) };

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (customerName) {
      filter.customerName = { $regex: customerName, $options: "i" };
    }

    if (status) {
      filter.status = new RegExp(`^${status}$`, "i"); // case-insensitive
    }

    if (paymentStatus && paymentStatus !== "all") {
      filter.paymentStatus = paymentStatus;
    }

    // ---------- Combine OR Conditions ----------
    const orConditions = [];
    if (staffId) {
      orConditions.push(
        { professionalId: new mongoose.Types.ObjectId(staffId) },
        { teamMemberId: new mongoose.Types.ObjectId(staffId) }
      );
    }
    if (serviceId) {
      orConditions.push(
        { serviceId: new mongoose.Types.ObjectId(serviceId) },
        { serviceIds: new mongoose.Types.ObjectId(serviceId) }
      );
    }
    if (orConditions.length) {
      filter.$or = orConditions;
    }

    console.log("Final Filter:", filter);

    // ---------- Fetch Appointments ----------
    const [onlineAppointments, offlineAppointments] = await Promise.all([
      Appointment.find(filter),
      OfflineAppointment.find(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: [...onlineAppointments, ...offlineAppointments],
    });
  } catch (error) {
    console.error("Filter Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


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




