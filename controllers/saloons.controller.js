import Saloon from '../models/saloon.model.js';
import { STATUS_CODES } from '../helpers/constants.js';
import { AppError } from '../helpers/error.js';

export const SaloonsController = {};

SaloonsController.searchSaloons = async (req, res, next) => {
  try {
    const { name, ownerName, mobile, page = 1, limit = 10 } = req.query;

    if (!name && !ownerName && !mobile) {
      return next(
        new AppError(
          'Please provide at least one search parameter: name, ownerName, or mobile',
          STATUS_CODES.BAD_REQUEST
        )
      );
    }

    const conditions = [];

    if (name) {
      conditions.push({ name: { $regex: name, $options: 'i' } });
    }

    if (ownerName) {
      conditions.push({ ownerName: { $regex: ownerName, $options: 'i' } });
    }

    if (mobile) {
      conditions.push({ mobile: { $regex: mobile, $options: 'i' } });
    }

    const query = conditions.length ? { $or: conditions } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const saloons = await Saloon.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); 

    const total = await Saloon.countDocuments(query);

    res.status(STATUS_CODES.OK).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: saloons,
    });
  } catch (error) {
    next(error);
  }
};
