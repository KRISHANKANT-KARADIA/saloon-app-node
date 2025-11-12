import Owner from '../models/owner.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';

export const logout = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return next(new AppError('Owner not found', STATUS_CODES.NOT_FOUND));
    }

    // Invalidate token by updating the timestamp
    owner.lastTokenIssuedAt = new Date();
    await owner.save();

    res.status(200).json({
      message: 'Logout successful'
    });
  } catch (err) {
    next(err);
  }
};
