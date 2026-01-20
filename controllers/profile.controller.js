import Customer from '../models/customer.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';

export const ProfileController = {};


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


ProfileController.updateProfile = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;
    const updateFields = {};

   
    const allowedFields = ['profileImage', 'name', 'mobile', 'email', 'dob', 'gender'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

   

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
