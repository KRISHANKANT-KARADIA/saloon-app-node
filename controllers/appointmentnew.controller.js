// // controllers/appointment.controller.js
// import Appointment from '../models/appointment.model.js';
// import { AppError } from '../helpers/error.js';
// import { STATUS_CODES } from '../helpers/constants.js';

// export const AppointmentNewController = {};

// AppointmentNewController.addAppointmentWithPayment = async (req, res, next) => {
//   try {
//     const {
//       saloonId,
//       serviceIds,
//       professionalId,
//       date,
//       time,

//       // new fields
//       discount,
//       discountCode,
//       discountAmount,
//       discountCodeId,
//       cardName,
//       cardNumber,
//       expiryDate,
//       securityPin
//     } = req.body;

//     const customer = res.locals.user;

//     // Validation
//     if (!saloonId || !Array.isArray(serviceIds) || serviceIds.length === 0 || !professionalId || !date || !time) {
//       return next(new AppError('Missing required fields', STATUS_CODES.BAD_REQUEST));
//     }

//     // You may also validate card format, expiry format, etc. here

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

//       // additional fields
//       discount: discount === 1 || discount === '1',
//       discountCode,
//       discountAmount,
//       discountCodeId,
//       cardName,
//       cardNumber,
//       expiryDate,
//       securityPin,
//     });

//     await appointment.save();

//     return res.status(STATUS_CODES.SUCCESSFULLY_CREATED).json({
//       message: 'Appointment with payment booked successfully',
//       data: appointment
//     });

//   } catch (err) {
//     next(err);
//   }
// };



// AppointmentNewController.getPendingAppointments = async (req, res, next) => {
//   try {
//     const customer = res.locals.user; // Make sure auth middleware sets this

//     const appointments = await Appointment.find({
//       'customer.id': customer.id,
//       status: 'pending'
//     })
//     .populate('saloonId', 'name logo')
//     .populate('serviceIds', 'name price')
//     .populate('professionalId', 'name')
//     .sort({ date: 1, time: 1 });

//     return res.status(STATUS_CODES.OK).json({
//       success: true,
//       count: appointments.length,
//       data: appointments
//     });

//   } catch (err) {
//     next(err);
//   }
// };




// AppointmentNewController.getAllAppointments = async (req, res, next) => {
//   try {
//     const customer = res.locals.user; // from token middleware

//     const appointments = await Appointment.find({
//       'customer.id': customer.id,
//     })
//     .populate('saloonId', 'name logo')
//     .populate('serviceIds', 'name price')
//     .populate('professionalId', 'name')
//     .sort({ date: 1, time: 1 });

//     return res.status(STATUS_CODES.OK).json({
//       success: true,
//       count: appointments.length,
//       data: appointments
//     });

//   } catch (err) {
//     next(err);
//   }
// };
// AppointmentNewController.cancelAppointment = async (req, res, next) => {
//   try {
//     const customer = res.locals.user;
//     const appointmentId = req.params.id;

//     // Find appointment by ID and customer
//     const appointment = await Appointment.findOne({
//       _id: appointmentId,
//       'customer.id': customer.id,
//     });

//     if (!appointment) {
//       return res.status(STATUS_CODES.NOT_FOUND).json({
//         success: false,
//         message: 'Appointment not found or you are not authorized to cancel it',
//       });
//     }

//     if (appointment.status === 'cancelled') {
//       return res.status(STATUS_CODES.BAD_REQUEST).json({
//         success: false,
//         message: 'Appointment is already cancelled',
//       });
//     }

//     // Update status to cancelled
//     appointment.status = 'cancelled';
//     await appointment.save();

//     return res.status(STATUS_CODES.OK).json({
//       success: true,
//       message: 'Appointment cancelled successfully',
//       data: appointment,
//     });

//   } catch (err) {
//     next(err);
//   }
// };


// controllers/appointment.controller.js
import Appointment from '../models/appointment.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';
import locationModel from '../models/location.model.js';
import appointModel from '../models/appoint.model.js';

export const AppointmentNewController = {};

// ✅ 1. Add Appointment with Payment + Optional Notes
AppointmentNewController.addAppointmentWithPayment = async (req, res, next) => {
  try {
    const {
      saloonId,
      serviceIds,
      professionalId,
      date,
      time,
      discount,
      discountCode,
      discountAmount,
      discountCodeId,
      cardName,
      cardNumber,
      expiryDate,
      securityPin,
      notes // ✅ new field
    } = req.body;

    const customer = res.locals.user;

    // Validation
    if (!saloonId || !Array.isArray(serviceIds) || serviceIds.length === 0 || !professionalId || !date || !time) {
      return next(new AppError('Missing required fields', STATUS_CODES.BAD_REQUEST));
    }

    // You may also validate cardNumber/expiryDate/securityPin format here

    const appointment = new Appointment({
      customer: {
        id: customer.id,
        mobile: customer.mobile,
      },
      saloonId,
      serviceIds,
      professionalId,
      date,
      time,
      status: 'pending',

      // Optional / Payment Fields
      discount: discount === 1 || discount === '1',
      discountCode,
      discountAmount,
      discountCodeId,
      cardName,
      cardNumber,
      expiryDate,
      securityPin,
      notes // ✅ Added
    });

    await appointment.save();

    return res.status(STATUS_CODES.SUCCESSFULLY_CREATED).json({
      success: true,
      message: 'Appointment with payment booked successfully',
      data: appointment
    });

  } catch (err) {
    next(err);
  }
};

// ✅ 2. Get Only Pending Appointments
AppointmentNewController.getPendingAppointments = async (req, res, next) => {
  try {
    const customer = res.locals.user;

    const appointments = await Appointment.find({
      'customer.id': customer.id,
      status: 'pending'
    })
    .populate('saloonId', 'name logo')
    .populate('serviceIds', 'name price')
    .populate('professionalId', 'name')
    .sort({ date: 1, time: 1 });

    return res.status(STATUS_CODES.OK).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (err) {
    next(err);
  }
};


// Confirm


AppointmentNewController.getConfirmAppointments = async (req, res, next) => {
  try {
    const customer = res.locals.user;

    const appointments = await Appointment.find({
      'customer.id': customer.id,
      status: 'completed'
    })
    .populate('saloonId', 'name logo')
    .populate('serviceIds', 'name price')
    .populate('professionalId', 'name')
    .sort({ date: 1, time: 1 });

    return res.status(STATUS_CODES.OK).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (err) {
    next(err);
  }
};





// ✅ 3. Get All Appointments for Logged-In Customer
// AppointmentNewController.getAllAppointments = async (req, res, next) => {
//   try {
//     const customer = res.locals.user;

//     const appointments = await Appointment.find({
//       'customer.id': customer.id,
//     })
//     .populate('saloonId', 'name logo')
//     .populate('serviceIds', 'name price')
//     .populate('professionalId', 'name')
//     .sort({ date: 1, time: 1 });

//     return res.status(STATUS_CODES.OK).json({
//       success: true,
//       count: appointments.length,
//       data: appointments
//     });

//   } catch (err) {
//     next(err);
//   }
// };

AppointmentNewController.getAllAppointments = async (req, res, next) => {
  try {
    const customer = res.locals.user;
    const now = new Date();

    // 1️⃣ Fetch appointments
    const appointments = await Appointment.find({
      'customer.id': customer.id,
    })
      .populate('saloonId', 'name logo')
      .populate('serviceIds', 'name price')
      .populate('professionalId', 'name')
      .sort({ createdAt: -1 });

    // 2️⃣ Loop & auto reject past appointments
    for (const appt of appointments) {
      if (appt.status === "pending") {

        // Convert date + time to Date object
        const appointmentDateTime = getAppointmentDateTime(
          appt.date,
          appt.time
        );

        if (appointmentDateTime && appointmentDateTime < now) {
          appt.status = "rejected";
          await appt.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });

  } catch (err) {
    next(err);
  }
};

const getAppointmentDateTime = (dateStr, timeStr) => {
  try {
    // Ensure dateStr is in YYYY-MM-DD format
    const [year, month, day] = dateStr.split("-").map(Number); // month 1-12

    // Extract hour and minute from timeStr ("HH:mm" or "HH:mm - HH:mm (duration)")
    const startTime = timeStr.split("-")[0].trim(); // "14:00"
    const [hour, minute] = startTime.split(":").map(Number);

    const dateTime = new Date(year, month - 1, day, hour, minute); // JS month is 0-indexed

    if (isNaN(dateTime.getTime())) return null;

    return dateTime;
  } catch (err) {
    return null;
  }
};


// ✅ 4. Cancel Appointment


AppointmentNewController.cancelAppointments = async (req, res, next) => {
  // try {
  //   const customer = res.locals.user;
  //   const appointmentId = req.params.id;

  //   const appointment = await Appointment.findOne({
  //     _id: appointmentId,
  //     'customer.id': customer.id,
  //   });

  //   if (!appointment) {
  //     return res.status(404).json({
  //       success: false,
  //       message: 'Appointment not found or unauthorized access',
  //     });
  //   }

  //   if (appointment.status === 'cancelled') {
  //     return res.status(400).json({
  //       success: false,
  //       message: 'Appointment is already cancelled',
  //     });
  //   }

  //   appointment.status = 'cancelled';
  //   await appointment.save();

  //   return res.status(200).json({
  //     success: true,
  //     message: 'Appointment cancelled successfully',
  //     data: appointment,
  //   });

  // } catch (err) {
  //   console.error("Cancel Appointment Error:", err); // log the real error
  //   res.status(500).json({
  //     success: false,
  //     message: "Server error while cancelling appointment"
  //   });
  // }


   try {
    const customer = res.locals.user; // Populated by CustomerAuthMiddleware
    const appointmentId = req.params.id;

    // Log the request for debugging
    console.log("🔹 Cancel request received for Appointment ID:", appointmentId);
    console.log("🔹 Authenticated Customer ID:", customer?.id);

    // 1️⃣ Find appointment by ID and customer
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      "customer.id": customer.id,
    });

    // 2️⃣ Check if found and belongs to customer
    if (!appointment) {
      console.log("⚠️ Appointment not found or unauthorized access");
      return res.status(404).json({
        success: false,
        message: "Appointment not found or unauthorized access",
      });
    }

    // 3️⃣ Prevent duplicate cancel requests
    if (appointment.status === "cancelled") {
      console.log("⚠️ Appointment is already cancelled");
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    // 4️⃣ Update status and save
    appointment.status = "cancelled";
    appointment.cancelledAt = new Date(); // optional, add this field in schema
    await appointment.save();

    console.log("✅ Appointment cancelled successfully:", appointment._id);

    // 5️⃣ Send success response
    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (err) {
    console.error("❌ Cancel Appointment Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling appointment",
      error: err.message,
    });
  }
};


// Get Appointment By ID - Optional

AppointmentNewController.getAppointmentById = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required"
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('saloonId', 'name logo')
      .populate('serviceIds', 'name price')
      .populate('professionalId', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (err) {
    next(err);
  }
};


AppointmentNewController.getAppointmentByIdSec = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required"
      });
    }

    const appointment = await appointModel.findById(appointmentId)
      .populate('saloonId', 'name logo') // Saloon info
      .populate('serviceIds', 'name price') // Services
      .populate('professionalId', 'name') // Professional
      .lean(); // convert to plain JS object for adding extra fields

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Fetch the location associated with the saloon
    if (appointment.saloonId) {
      const location = await locationModel.findOne({ saloon: appointment.saloonId._id })
        .select('address1 address2 area city state pincode mapLink');
      appointment.saloonLocation = location || null;
    }

    return res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (err) {
    next(err);
  }
};




// Cancel appointment by ID
AppointmentNewController.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params; // appointment ID from route

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    return res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: updatedAppointment
    });

  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling appointment"
    });
  }
};




// Update Appointment

AppointmentNewController.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    // Validate input
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and Time are required to reschedule",
      });
    }

    // Only update date and time
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        date, 
        time, 
        updatedAt: new Date() // optional, for tracking last update
      },
      { new: true, fields: { date: 1, time: 1 } } // return only updated fields if you want
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating appointment",
    });
  }
};
