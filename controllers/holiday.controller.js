import Holiday from '../models/holiday.model.js';
import Saloon from '../models/saloon.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';

export const setHoliday = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason) {
      return next(new AppError('All fields (fromDate, toDate, reason) are required', STATUS_CODES.BAD_REQUEST));
    }


    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError('Saloon not found', STATUS_CODES.NOT_FOUND));
    }

    const holiday = new Holiday({
      saloon: saloon._id,
      fromDate,
      toDate,
      reason
    });

    await holiday.save();

    res.status(201).json({
      message: 'Holiday set successfully',
      data: holiday
    });
  } catch (err) {
    next(err);
  }
};
export const getHolidays = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

  
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError('Saloon not found', STATUS_CODES.NOT_FOUND));
    }

    const holidays = await Holiday.find({ saloon: saloon._id }).sort({ fromDate: 1 });

    res.status(200).json({
      message: 'Holidays fetched successfully',
      data: holidays
    });
  } catch (err) {
    next(err);
  }
};

export const deleteHoliday = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { holidayId } = req.params;

   
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError('Saloon not found', STATUS_CODES.NOT_FOUND));
    }

   
    const holiday = await Holiday.findOne({ _id: holidayId, saloon: saloon._id });
    if (!holiday) {
      return next(new AppError('Holiday not found or does not belong to your saloon', STATUS_CODES.NOT_FOUND));
    }

    await Holiday.findByIdAndDelete(holidayId);

    res.status(200).json({ message: 'Holiday deleted successfully' });
  } catch (err) {
    next(err);
  }
};


export const updateHoliday = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { holidayId } = req.params;
    const { fromDate, toDate, reason } = req.body;

    
    if (!fromDate && !toDate && !reason) {
      return next(new AppError('At least one field (fromDate, toDate, reason) must be provided', STATUS_CODES.BAD_REQUEST));
    }

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError('Saloon not found', STATUS_CODES.NOT_FOUND));
    }

    
    const holiday = await Holiday.findOne({ _id: holidayId, saloon: saloon._id });
    if (!holiday) {
      return next(new AppError('Holiday not found or does not belong to your saloon', STATUS_CODES.NOT_FOUND));
    }

    if (fromDate) holiday.fromDate = fromDate;
    if (toDate) holiday.toDate = toDate;
    if (reason) holiday.reason = reason;

    await holiday.save();

    res.status(200).json({
      message: 'Holiday updated successfully',
      data: holiday
    });
  } catch (err) {
    next(err);
  }
};