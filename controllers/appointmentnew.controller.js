import Appointment from '../models/appointment.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';
import locationModel from '../models/location.model.js';
import appointModel from '../models/appoint.model.js';

export const AppointmentNewController = {};

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
      notes 
    } = req.body;

    const customer = res.locals.user;

    
    if (!saloonId || !Array.isArray(serviceIds) || serviceIds.length === 0 || !professionalId || !date || !time) {
      return next(new AppError('Missing required fields', STATUS_CODES.BAD_REQUEST));
    }


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

      
      discount: discount === 1 || discount === '1',
      discountCode,
      discountAmount,
      discountCodeId,
      cardName,
      cardNumber,
      expiryDate,
      securityPin,
      notes 
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



AppointmentNewController.getAllAppointments = async (req, res, next) => {
  try {
    const customer = res.locals.user;

   
    const appointments = await Appointment.find({
      'customer.id': customer.id,
    })
      .populate('saloonId', 'name logo')
      .populate('serviceIds', 'name price')
      .populate('professionalId', 'name')
      .sort({ createdAt: -1 });

   
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    for (const appt of appointments) {
      if (appt.status === "pending") {
        const appointmentDate = getAppointmentDateOnly(appt.date);
        if (appointmentDate && appointmentDate < today) {
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

const getAppointmentDateOnly = (dateStr) => {
  try {

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    
    date.setHours(0, 0, 0, 0);
    return date;
  } catch (err) {
    return null;
  }
};

AppointmentNewController.cancelAppointments = async (req, res, next) => {
 


   try {
    const customer = res.locals.user; 
    const appointmentId = req.params.id;

   
    console.log(" Cancel request received for Appointment ID:", appointmentId);
    console.log(" Authenticated Customer ID:", customer?.id);

   
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      "customer.id": customer.id,
    });

   
    if (!appointment) {
      console.log(" Appointment not found or unauthorized access");
      return res.status(404).json({
        success: false,
        message: "Appointment not found or unauthorized access",
      });
    }

    if (appointment.status === "cancelled") {
      console.log("Appointment is already cancelled");
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

 
    appointment.status = "cancelled";
    appointment.cancelledAt = new Date(); 
    await appointment.save();

    console.log(" Appointment cancelled successfully:", appointment._id);

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (err) {
    console.error("Cancel Appointment Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling appointment",
      error: err.message,
    });
  }
};




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
      .populate('saloonId', 'name logo') 
      .populate('serviceIds', 'name price') 
      .populate('professionalId', 'name') 
      .lean(); 

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

   
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


AppointmentNewController.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params; 

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




AppointmentNewController.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

  
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and Time are required to reschedule",
      });
    }

   
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        date, 
        time, 
        updatedAt: new Date() 
      },
      { new: true, fields: { date: 1, time: 1 } } 
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
