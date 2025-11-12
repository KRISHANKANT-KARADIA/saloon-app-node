import Customer from '../models/customer.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';

export const ProfileController = {};

// Get profile details
ProfileController.getProfile = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;

    const customer = await Customer.findById(customerId).select('-otp -otpExpiresAt -lastTokenIssuedAt');
    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    return res.status(STATUS_CODES.OK).json({
      success: true,
      data: customer,
    });
  } catch (err) {
    next(err);
  }
};

// Update profile details
ProfileController.updateProfile = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;
    const updateFields = {};

    // Allowed fields to update
    const allowedFields = ['profileImage', 'name', 'mobile', 'email', 'dob', 'gender'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Optionally: add validation for fields here (e.g., email format, gender enum)

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updateFields },
      { new: true, runValidators: true, context: 'query' }
    ).select('-otp -otpExpiresAt -lastTokenIssuedAt');

    if (!updatedCustomer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedCustomer,
    });
  } catch (err) {
    next(err);
  }
};
