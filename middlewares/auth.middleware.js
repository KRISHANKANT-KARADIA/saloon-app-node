import { STATUS_CODES } from '../helpers/constants.js';
import { AppError } from '../helpers/error.js';
import { verifyJwtToken } from '../helpers/utils.js';
import ownerModel from '../models/owner.model.js';
import User from '../models/user.model.js';

export const AuthMiddlewares = {};

AuthMiddlewares.checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('Authorization header missing or invalid', STATUS_CODES.UNAUTHORIZED));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJwtToken(token);

    const user = await ownerModel.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', STATUS_CODES.UNAUTHORIZED));
    }

   
    const tokenTs = new Date(decoded.token_created_at).getTime();
    const issuedTs = new Date(user.lastTokenIssuedAt).getTime();

    const DRIFT_ALLOWANCE = 1000;
    if (!user.lastTokenIssuedAt || Math.abs(tokenTs - issuedTs) > DRIFT_ALLOWANCE) {
      return next(new AppError('Token is no longer valid. Please login again.', STATUS_CODES.UNAUTHORIZED));
    }

    
    res.locals.user = {
      id: user._id,
      mobile: user.mobile,
      role: user.role,
      token_created_at: decoded.token_created_at,
    };

    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return next(new AppError('You are not authorized', STATUS_CODES.UNAUTHORIZED));
  }
};
