// controllers/auth.controller.j
import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';
import Owner from '../models/owner.model.js';
import { generateOtpCode, sendOtpToMobile } from '../helpers/otp.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';


export const sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    const otp = generateOtpCode(); // e.g. 6-digit code
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Save OTP in both (if user exists), else prepare for creation on verify
    await Promise.all([
      Customer.updateOne({ mobile }, { otp, otpExpires }, { upsert: true }),
      Owner.updateOne({ mobile }, { otp, otpExpires }, { upsert: true })
    ]);

    await sendOtpToMobile(mobile, otp); // your SMS service

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    next(error);
  }
};


export const verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ error: 'Mobile and OTP are required' });
    }

    // Check in both models
    const [customer, owner] = await Promise.all([
      Customer.findOne({ mobile }),
      Owner.findOne({ mobile })
    ]);

    const user = customer || owner;
    const role = customer ? 'customer' : owner ? 'owner' : null;

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    user.lastTokenIssuedAt = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role,
        mobile: user.mobile,
        token_created_at: user.lastTokenIssuedAt
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified',
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logoutCustomer = (req, res) => {


  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};