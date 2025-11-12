
// // middlewares/customer.auth.middleware.js

// import { STATUS_CODES } from '../helpers/constants.js';
// import { AppError } from '../helpers/error.js';
// import { verifyJwtToken } from '../helpers/utils.js';
// import Customer from '../models/customer.model.js'; // ✅ your customer model

// export const CustomerAuthMiddleware = {};

// CustomerAuthMiddleware.checkAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];

//     if (!authHeader?.startsWith('Bearer ')) {
//       return next(new AppError('Authorization header missing or invalid', STATUS_CODES.UNAUTHORIZED));
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = verifyJwtToken(token);

//     const customer = await Customer.findById(decoded.id);
//     if (!customer) {
//       return next(new AppError('Customer not found', STATUS_CODES.UNAUTHORIZED));
//     }

//     // Verify token creation timestamp (prevent stale tokens)
//     const tokenTs = new Date(decoded.token_created_at).getTime();
//     const issuedTs = new Date(customer.lastTokenIssuedAt).getTime();
//     const DRIFT_ALLOWANCE = 1000; // 1 second

//     if (!customer.lastTokenIssuedAt || Math.abs(tokenTs - issuedTs) > DRIFT_ALLOWANCE) {
//       return next(new AppError('Token is no longer valid. Please login again.', STATUS_CODES.UNAUTHORIZED));
//     }

//     // Attach customer info to res.locals for later use
//     res.locals.user = {
//       id: customer._id,
//       mobile: customer.mobile,
//       role: customer.role,
//       token_created_at: decoded.token_created_at,
//     };

//     next();
//   } catch (err) {
//     console.error('Customer auth error:', err.message);
//     return next(new AppError('You are not authorized', STATUS_CODES.UNAUTHORIZED));
//   }
// };


// middlewares/customer.auth.middleware.js
import { STATUS_CODES } from '../helpers/constants.js';
import { AppError } from '../helpers/error.js';
import { verifyJwtToken } from '../helpers/utils.js';
import Customer from '../models/customer.model.js';

export const CustomerAuthMiddleware = {};

/**
 * ✅ Middleware to check if customer is authenticated
 */
CustomerAuthMiddleware.checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      return next(
        new AppError(
          'Authorization header missing or invalid',
          STATUS_CODES.UNAUTHORIZED
        )
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJwtToken(token);

    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.UNAUTHORIZED));
    }

    // ✅ Check token creation timestamp (to prevent reuse of old tokens)
    const tokenTs = new Date(decoded.token_created_at).getTime();
    const issuedTs = new Date(customer.lastTokenIssuedAt).getTime();
    const DRIFT_ALLOWANCE = 1000; // 1 second

    if (
      !customer.lastTokenIssuedAt ||
      Math.abs(tokenTs - issuedTs) > DRIFT_ALLOWANCE
    ) {
      return next(
        new AppError(
          'Token is no longer valid. Please login again.',
          STATUS_CODES.UNAUTHORIZED
        )
      );
    }

    // ✅ Attach user info for later use
    res.locals.user = {
      id: customer._id,
      mobile: customer.mobile,
      role: customer.role,
      token_created_at: decoded.token_created_at,
    };

    next();
  } catch (err) {
    console.error('Customer auth error:', err.message);
    return next(
      new AppError('You are not authorized', STATUS_CODES.UNAUTHORIZED)
    );
  }
};
