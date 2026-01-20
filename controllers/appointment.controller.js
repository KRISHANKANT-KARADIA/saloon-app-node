// controllers/appointment.controller.js
import Appointment from '../models/appointment.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';
import offerModel from '../models/offer.model.js';
import ownerModel from '../models/owner.model.js';


export const AppointmentController = {};

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
          token: owner.fcmToken,
          notification: payload.notification,
          data: payload.data,
        });
        console.log("Notification sent to owner:", owner._id);
      } catch (err) {
        console.error("Failed to send notification:", err.message);
      }
    }

   
    setTimeout(async () => {
      const appt = await Appointment.findById(appointment._id);
      if (appt && appt.status === "pending") {
        appt.status = "cancelled";
        await appt.save();
        console.log(`Appointment ${appt._id} automatically cancelled.`);
      }
    }, 5 * 60 * 1000); 

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (err) {
    next(err);
  }
};


export const getTodayReport = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

   
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

   
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    
    const todayAppointments = await Appointment.find({
      saloonId: saloon._id,
      createdAt: { $gte: todayStart, $lte: todayEnd }, 
    })
      .populate("customer.id", "name mobile")
      .populate("serviceIds", "name price")
      .populate("professionalId", "name")
      .sort({ createdAt: -1 });

 
    const totalTodayAppointments = todayAppointments.length;
    const pendingToday = todayAppointments.filter(a => a.status === "pending").length;
    const confirmedToday = todayAppointments.filter(a => a.status === "accepted").length;
    const completedToday = todayAppointments.filter(a => a.status === "completed").length;

 
    let todayRevenue = 0;
    todayAppointments.forEach(a => {
      if (a.status === "completed") {
        a.serviceIds.forEach(s => (todayRevenue += s.price || 0));
      }
    });

    
    res.status(200).json({
      success: true,
      stats: {
        totalTodayAppointments,
        pendingToday,
        confirmedToday,
        completedToday,
        todayRevenue,
      },
      todayAppointments,
    });
  } catch (err) {
    next(err);
  }
};



export const getTodayAppointments = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;


    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return next(new AppError("Saloon not found", 404));

    
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

  
    const todayAppointments = await Appointment.find({
      saloonId: saloon._id,
      createdAt: { $gte: start, $lte: end },
    })
      .populate({
        path: "customer.id",
        select: "name mobile",
        strictPopulate: false,
      })
      .populate({
        path: "serviceIds",
        select: "name price",
        strictPopulate: false,
      })
      .populate({
        path: "professionalId",
        select: "name",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 });

 
    const totalAppointments = todayAppointments.length;
    const pendingAppointments = todayAppointments.filter(
      (a) => a.status === "pending"
    ).length;

 
    return res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
      },
      appointments: todayAppointments,
    });
  } catch (err) {
    next(err);
  }
};

