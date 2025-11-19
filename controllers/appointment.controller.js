// controllers/appointment.controller.js
import Appointment from '../models/appointment.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';

export const AppointmentController = {};


AppointmentController.addAppointment = async (req, res, next) => {
  try {
    const {
      saloonId,
      services = [],        // array of objects: { serviceId, price, duration }
      professionalId,
      date,
      time,
      totalPrice,
      notes = "No special instructions",
      discount = false,
      discountCode,
      discountAmount,
      discountCodeId,
      cardstatus = false,
      cardName,
      cardNumber,
      expiryDate,
      securityPin
    } = req.body;

    const customer = res.locals.user;

    // Extract serviceIds and total duration
    const serviceIds = services.map(s => s.serviceId);
    const duration = services.reduce((sum, s) => sum + Number(s.duration || 0), 0);

    // Validate required fields
    if (!saloonId || serviceIds.length === 0 || !professionalId || !date || !time || !totalPrice) {
      return next(new AppError('Missing required fields', STATUS_CODES.BAD_REQUEST));
    }

    const appointment = new Appointment({
      customer: { id: customer.id, mobile: customer.mobile },
      saloonId,
      serviceIds,
      professionalId,
      date,
      time,
      price: totalPrice,
      status: 'pending',
      notes,
      duration: duration.toString(),
      discount,
      discountCode,
      discountAmount,
      discountCodeId,
      cardstatus,
      cardName,
      cardNumber,
      expiryDate,
      securityPin
    });

    await appointment.save();

    return res.status(STATUS_CODES.SUCCESSFULLY_CREATED).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });

  } catch (err) {
    next(err);
  }
};


AppointmentController.addAppointments = async (req, res, next) => {
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

    // Validate required
    if (!saloonId || services.length === 0 || !professionalId || !date || !time || !totalPrice) {
      return next(new AppError('Missing required fields', 400));
    }

    // ----------------------------------------------
    // 🔥 OFFER VALIDATION LOGIC
    // ----------------------------------------------
    if (discount && discountCodeId) {
      const offer = await offerModel.findById(discountCodeId);

      if (!offer || !offer.active) {
        return next(new AppError("Offer is no longer active!", 400));
      }

      // Check Offer Expiry Date
      const now = new Date();
      if (new Date(offer.valid_until) < now) {
        return next(new AppError("Offer has expired!", 400));
      }

      // Check global max uses remaining
      if (offer.max_uses <= 0) {
        return next(new AppError("Offer usage limit reached!", 400));
      }

      // Check max uses per user
      const userUsedCount = await Appointment.countDocuments({
        customer: { id: customer.id, mobile: customer.mobile },
        discountCodeId: discountCodeId,
      });

      if (userUsedCount >= offer.max_uses_per_user) {
        return next(new AppError("You have already used this offer maximum times!", 400));
      }

      // ----------------------------------------------
      // Offer usage reduce by 1
      // ----------------------------------------------
      offer.max_uses -= 1;

      // If max_uses = 0 → deactivate offer
      if (offer.max_uses <= 0) {
        offer.active = false;
      }

      await offer.save();
    }

    // ----------------------------------------------

    const serviceIds = services.map(s => s.serviceId);
    const duration = services.reduce((sum, s) => sum + Number(s.duration || 0), 0);

    const appointment = new Appointment({
      customer: { id: customer.id, mobile: customer.mobile },
      saloonId,
      serviceIds,
      professionalId,
      date,
      time,
      price: totalPrice,
      status: 'pending',
      notes: req.body.notes || "No special instructions",
      duration: duration.toString(),
      discount,
      discountCode,
      discountAmount,
      discountCodeId
    });

    await appointment.save();

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment
    });

  } catch (err) {
    next(err);
  }
};










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
