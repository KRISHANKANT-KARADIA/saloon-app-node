// controllers/appointment.controller.js
import Appointment from '../models/appointment.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';
import offerModel from '../models/offer.model.js';
import ownerModel from '../models/owner.model.js';
import { io } from '../services/server.js';

export const AppointmentController = {};


// AppointmentController.addAppointment = async (req, res, next) => {
//   try {
//     const {
//       saloonId,
//       services = [],        // array of objects: { serviceId, price, duration }
//       professionalId,
//       date,
//       time,
//       totalPrice,
//       notes = "No special instructions",
//       discount = false,
//       discountCode,
//       discountAmount,
//       discountCodeId,
//       cardstatus = false,
//       cardName,
//       cardNumber,
//       expiryDate,
//       securityPin
//     } = req.body;

//     const customer = res.locals.user;

//     // Extract serviceIds and total duration
//     const serviceIds = services.map(s => s.serviceId);
//     const duration = services.reduce((sum, s) => sum + Number(s.duration || 0), 0);

//     // Validate required fields
//     if (!saloonId || serviceIds.length === 0 || !professionalId || !date || !time || !totalPrice) {
//       return next(new AppError('Missing required fields', STATUS_CODES.BAD_REQUEST));
//     }

//     const appointment = new Appointment({
//       customer: { id: customer.id, mobile: customer.mobile },
//       saloonId,
//       serviceIds,
//       professionalId,
//       date,
//       time,
//       price: totalPrice,
//       status: 'pending',
//       notes,
//       duration: duration.toString(),
//       discount,
//       discountCode,
//       discountAmount,
//       discountCodeId,
//       cardstatus,
//       cardName,
//       cardNumber,
//       expiryDate,
//       securityPin
//     });

//     await appointment.save();

//     return res.status(STATUS_CODES.SUCCESSFULLY_CREATED).json({
//       success: true,
//       message: 'Appointment booked successfully',
//       data: appointment
//     });

//   } catch (err) {
//     next(err);
//   }
// };











// Add new appointment
// AppointmentController.addAppointment = async (req, res, next) => {
//   try {
//     const {
//       saloonId,
//       serviceIds,
//       professionalId,
//       date,
//       time,
//       notes // ✅ Optional notes
//     } = req.body;

//     const customer = res.locals.user;

//     // Validate required fields
//     if (!saloonId || !Array.isArray(serviceIds) || serviceIds.length === 0 || !professionalId || !date || !time) {
//       return next(new AppError('Missing required fields', STATUS_CODES.BAD_REQUEST));
//     }

//     // Create appointment document
//     const appointment = new Appointment({
//       customer: {
//         id: customer.id,
//         mobile: customer.mobile,
//       },
//       saloonId,
//       serviceIds,
//       professionalId,
//       date,
//       time,
//       status: 'pending',
//       notes // ✅ Add notes if provided
//     });

//     await appointment.save();

//     return res.status(STATUS_CODES.SUCCESSFULLY_CREATED).json({
//       success: true,
//       message: 'Appointment booked successfully',
//       data: appointment
//     });

//   } catch (err) {
//     next(err);
//   }
// };


// AppointmentController.addAppointment = async (req, res, next) => {
//   try {
//     const {
//       saloonId,
//       services = [],
//       professionalId,
//       date,
//       time,
//       totalPrice,
//       discount = false,
//       discountCode,
//       discountCodeId,
//       discountAmount,
//     } = req.body;

//     const customer = res.locals.user;

//     // Validate required
//     if (!saloonId || services.length === 0 || !professionalId || !date || !time || !totalPrice) {
//       return next(new AppError('Missing required fields', 400));
//     }

//     // ----------------------------------------------
//     // 🔥 OFFER VALIDATION LOGIC
//     // ----------------------------------------------
//     if (discount && discountCodeId) {
//       const offer = await offerModel.findById(discountCodeId);

//       if (!offer || !offer.active) {
//         return next(new AppError("Offer is no longer active!", 400));
//       }

//       // Check Offer Expiry Date
//       const now = new Date();
//       if (new Date(offer.valid_until) < now) {
//         return next(new AppError("Offer has expired!", 400));
//       }

//       // Check global max uses remaining
//       if (offer.max_uses <= 0) {
//         return next(new AppError("Offer usage limit reached!", 400));
//       }

//       // Check max uses per user
//       const userUsedCount = await Appointment.countDocuments({
//         customer: { id: customer.id, mobile: customer.mobile },
//         discountCodeId: discountCodeId,
//       });

//       if (userUsedCount >= offer.max_uses_per_user) {
//         return next(new AppError("You have already used this offer maximum times!", 400));
//       }

//       // ----------------------------------------------
//       // Offer usage reduce by 1
//       // ----------------------------------------------
//       offer.max_uses -= 1;

//       // If max_uses = 0 → deactivate offer
//       if (offer.max_uses <= 0) {
//         offer.active = false;
//       }

//       await offer.save();
//     }

//     // ----------------------------------------------

//     const serviceIds = services.map(s => s.serviceId);
//     const duration = services.reduce((sum, s) => sum + Number(s.duration || 0), 0);

//     const appointment = new Appointment({
//       customer: { id: customer.id, mobile: customer.mobile },
//       saloonId,
//       serviceIds,
//       professionalId,
//       date,
//       time,
//       price: totalPrice,
//       status: 'pending',
//       notes: req.body.notes || "No special instructions",
//       duration: duration.toString(),
//       discount,
//       discountCode,
//       discountAmount,
//       discountCodeId
//     });

//     await appointment.save();

//     return res.status(201).json({
//       success: true,
//       message: "Appointment booked successfully",
//       data: appointment
//     });

//   } catch (err) {
//     next(err);
//   }
// };

AppointmentController.addAppointment = async (req, res, next) => {
  try {
    const {
      saloonId,
      services = [],
      professionalId,
      date,
      time,
      totalPrice,
      discount = false,
      discountCode,
      discountCodeId,
      discountAmount,
    } = req.body;

    const customer = res.locals.user;

    // ----------------------------------------------
    // ❌ NO REQUIRED FIELD VALIDATION
    // ----------------------------------------------
    // All validation removed as per your request.
    // Backend will accept even empty values.
    // ----------------------------------------------

    // ----------------------------------------------
    // 🔥 OFFER VALIDATION LOGIC (Kept same)
    // ----------------------------------------------
    if (discount && discountCodeId) {
      const offer = await offerModel.findById(discountCodeId);

      if (!offer || !offer.active) {
        return next(new AppError("Offer is no longer active!", 400));
      }

      const now = new Date();
      if (new Date(offer.valid_until) < now) {
        return next(new AppError("Offer has expired!", 400));
      }

      if (offer.max_uses <= 0) {
        return next(new AppError("Offer usage limit reached!", 400));
      }

      const userUsedCount = await Appointment.countDocuments({
        "customer.id": customer.id,
        discountCodeId,
      });

      if (userUsedCount >= offer.max_uses_per_user) {
        return next(
          new AppError("You have already used this offer maximum times!", 400)
        );
      }

      offer.max_uses -= 1;
      if (offer.max_uses <= 0) offer.active = false;
      await offer.save();
    }

    // ----------------------------------------------

    const serviceIds = services.map((s) => s.serviceId);
    const duration = services.reduce((sum, s) => sum + Number(s.duration || 0), 0);

    const appointment = new Appointment({
      customer: { id: customer.id, mobile: customer.mobile },
      saloonId,
      serviceIds,
      professionalId,
      date,
      time,
      price: totalPrice,
      status: "pending",
      notes: req.body.notes || "No special instructions",
      duration: duration.toString(),
      discount,
      discountCode,
      discountAmount,
      discountCodeId,
    });

    await appointment.save();

    // ----------------------------------------------
    // 🔔 Send FCM Notification to Salon Owner
    // ----------------------------------------------
    const owner = await ownerModel.findById(saloonId);

    if (owner && owner.fcmToken) {
      const payload = {
        notification: {
          title: "New Appointment!",
          body: `New appointment booked for ${
            services.map((s) => s.name).join(", ") || "services"
          }`,
        },
        data: {
          type: "appointment",
          appointmentId: appointment._id.toString(),
        },
      };

      try {
        await admin.messaging().send({
          token: owner.fcmToken, // your FCM token
          notification: payload.notification,
          data: payload.data,
        });
        console.log("Notification sent to owner:", owner._id);
      } catch (err) {
        console.error("Failed to send notification:", err.message);
      }
    }

    // ----------------------------------------------
    // 🔥 SOCKET EVENT
    // ----------------------------------------------
    io.to(saloonId).emit("newAppointment", {
      message: "You have a new booking!",
      appointment,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (err) {
    next(err);
  }
};


// AppointmentController.addAppointment = async (req, res, next) => {
//   try {
//     const {
//       saloonId,
//       services = [],
//       professionalId,
//       date,
//       time,
//       totalPrice,
//       discount = false,
//       discountCode,
//       discountCodeId,
//       discountAmount,
//     } = req.body;

//     const customer = res.locals.user;

//     // Validate required
//     if (!saloonId || services.length === 0 || !professionalId || !date || !time || !totalPrice) {
//       return next(new AppError('Missing required fields', 400));
//     }

//     // ----------------------------------------------
//     // 🔥 OFFER VALIDATION LOGIC
//     // ----------------------------------------------
//     if (discount && discountCodeId) {
//       const offer = await offerModel.findById(discountCodeId);

//       if (!offer || !offer.active) {
//         return next(new AppError("Offer is no longer active!", 400));
//       }

//       const now = new Date();
//       if (new Date(offer.valid_until) < now) {
//         return next(new AppError("Offer has expired!", 400));
//       }

//       if (offer.max_uses <= 0) {
//         return next(new AppError("Offer usage limit reached!", 400));
//       }

//       const userUsedCount = await Appointment.countDocuments({
//         'customer.id': customer.id,
//         discountCodeId: discountCodeId,
//       });

//       if (userUsedCount >= offer.max_uses_per_user) {
//         return next(new AppError("You have already used this offer maximum times!", 400));
//       }

//       // Reduce max uses
//       offer.max_uses -= 1;
//       if (offer.max_uses <= 0) offer.active = false;

//       await offer.save();
//     }

//     // ----------------------------------------------

//     const serviceIds = services.map(s => s.serviceId);
//     const duration = services.reduce((sum, s) => sum + Number(s.duration || 0), 0);

//     const appointment = new Appointment({
//       customer: { id: customer.id, mobile: customer.mobile },
//       saloonId,
//       serviceIds,
//       professionalId,
//       date,
//       time,
//       price: totalPrice,
//       status: 'pending',
//       notes: req.body.notes || "No special instructions",
//       duration: duration.toString(),
//       discount,
//       discountCode,
//       discountAmount,
//       discountCodeId,
//     });

//     await appointment.save();

//     // ----------------------------------------------
//     // 🔔 Send FCM Notification to Salon Owner
//     // ----------------------------------------------
//     const owner = await ownerModel.findById(saloonId);

//     if (owner && owner.fcmToken) {
//       const payload = {
//         notification: {
//           title: "New Appointment!",
//           body: `${customer.id} booked appointment for ${services.map(s => s.name).join(', ')}`,
//         },
//         data: {
//           type: "appointment",
//           appointmentId: appointment._id.toString(),
//         }
//       };

//       try {
//         // token: owner.fcmToken,
//         await admin.messaging().send({
//           token: "fCKrSnFGQceCgdy8n7P1PN:APA91bHsWieeIm0ZBv9wI-MTKMdiy4p8qudcMdcsmkM1YRfR-uogCvUuVYqJa7IeBNWCAdz1I3ksAIUv4YC3-XkjjesXR9d2xIRDoTUaKl7lMqKfS6RJEns",
//           notification: payload.notification,
//           data: payload.data,
//         });
//         console.log("Notification sent to owner:", owner._id);
//       } catch (err) {
//         console.error("Failed to send notification:", err.message);
//       }
//     }

//     // ----------------------------------------------
//     io.to(saloonId).emit("newAppointment", {
//       message: "You have a new booking!",
//       appointment: appointment,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Appointment booked successfully",
//       data: appointment,
//     });

//   } catch (err) {
//     next(err);
//   }
// };

// For Next
// AppointmentController.addAppointment = async (req, res, next) => {
//   try {
//     const {
//       saloonId,
//       services = [],
//       professionalId,
//       date,
//       time,
//       totalPrice,
//       discount = false,
//       discountCode,
//       discountCodeId,
//       discountAmount,
//     } = req.body;

//     const customer = res.locals.user;

//     // Validate required fields
//     if (!saloonId || services.length === 0 || !professionalId || !date || !time || !totalPrice) {
//       return next(new AppError('Missing required fields', 400));
//     }

//     // ----------------------------------------------
//     // OFFER VALIDATION LOGIC
//     // ----------------------------------------------
//     if (discount && discountCodeId) {
//       const offer = await offerModel.findById(discountCodeId);

//       if (!offer || !offer.active) {
//         return next(new AppError("Offer is no longer active!", 400));
//       }

//       const now = new Date();
//       if (new Date(offer.valid_until) < now) {
//         return next(new AppError("Offer has expired!", 400));
//       }

//       if (offer.max_uses <= 0) {
//         return next(new AppError("Offer usage limit reached!", 400));
//       }

//       // count usage by customer
//       const userUsedCount = await Appointment.countDocuments({
//         'customer.id': customer.id,
//         discountCodeId: discountCodeId,
//       });

//       if (userUsedCount >= offer.max_uses_per_user) {
//         return next(new AppError("You have already used this offer maximum times!", 400));
//       }

//       // decrease global usage
//       offer.max_uses -= 1;
//       if (offer.max_uses <= 0) offer.active = false;
//       await offer.save();
//     }

//     // ----------------------------------------------
//     // CREATE APPOINTMENT
//     // ----------------------------------------------
    
//     const serviceIds = services.map(s => s.serviceId);
//     const duration = services.reduce((sum, s) => sum + Number(s.duration || 0), 0);

//     const appointment = new Appointment({
//       customer: { id: customer.id, mobile: customer.mobile },
//       saloonId,
//       serviceIds,
//       professionalId,
//       date,
//       time,
//       price: totalPrice,
//       status: 'pending',
//       notes: req.body.notes || "No special instructions",
//       duration: duration.toString(),
//       discount,
//       discountCode,
//       discountAmount,
//       discountCodeId,
//     });

//     await appointment.save();

//     // ----------------------------------------------
//     // SEND FCM NOTIFICATION TO OWNER
//     // ----------------------------------------------

//     const saloon = await Saloon.findById(saloonId);
//     const owner = await ownerModel.findById(saloon.owner);

//     if (owner?.fcmToken) {
//       await admin.messaging().send({
//         token: owner.fcmToken,
//         notification: {
//           title: "New Appointment!",
//           body: `${customer.mobile} booked appointment`,
//         },
//         data: {
//           type: "appointment",
//           appointmentId: appointment._id.toString(),
//         }
//       });
//     }

//     // ----------------------------------------------
//     // SOCKET.IO EVENT (REAL-TIME UPDATE)
//     // ----------------------------------------------

//     io.to(saloonId).emit("newAppointment", {
//       message: "You have a new booking!",
//       appointment: appointment,  // FIXED
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Appointment booked successfully",
//       data: appointment,
//     });

//   } catch (err) {
//     next(err);
//   }
// };



