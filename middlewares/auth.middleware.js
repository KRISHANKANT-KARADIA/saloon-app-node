// // middlewares/auth.middleware.js
// import { STATUS_CODES } from '../helpers/constants.js';
// import { AppError } from '../helpers/error.js';
// import { verifyJwtToken } from '../helpers/utils.js';

// export const AuthMiddlewares = {};

// AuthMiddlewares.checkAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     if (!authHeader) {
//       return next(new AppError('Authorization header missing', STATUS_CODES.UNAUTHORIZED));
//     }

//     const token = authHeader.split(' ')[1]; // "Bearer <token>"
//     if (!token) {
//       return next(new AppError('Token not provided', STATUS_CODES.UNAUTHORIZED));
//     }

//     const decodedToken = verifyJwtToken(token);

//     // Attach user info to res.locals for downstream use
//     res.locals.user = {
//       id: decodedToken.userId || decodedToken.id,
//       username: decodedToken.username,
//       mobile: decodedToken.mobile,
//     };

//     next();
//   } catch (error) {
//     return next(new AppError('You are not authorized', STATUS_CODES.UNAUTHORIZED));
//   }
// };




// middlewares/auth.middleware.js
// import { STATUS_CODES } from '../helpers/constants.js';
// import { AppError } from '../helpers/error.js';
// import { verifyJwtToken } from '../helpers/utils.js';

// export const AuthMiddlewares = {};

// AuthMiddlewares.checkAuth = (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       console.log('Authorization header missing or invalid:', authHeader);
//       return next(new AppError('Authorization header missing or invalid', STATUS_CODES.UNAUTHORIZED));
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       console.log('Token not provided');
//       return next(new AppError('Token not provided', STATUS_CODES.UNAUTHORIZED));
//     }

//     const decoded = verifyJwtToken(token);

//     res.locals.user = {
//       id: decoded.id,
//       mobile: decoded.mobile,
//       role: decoded.role,
//       token_created_at: decoded.token_created_at,
//       iat: decoded.iat,
//       exp: decoded.exp
//     };

//     next();
//   } catch (err) {
//     console.log('Authorization failed:', err.message);
//     return next(new AppError('You are not authorized', STATUS_CODES.UNAUTHORIZED));
//   }
// };



// import { STATUS_CODES } from '../helpers/constants.js';
// import { AppError } from '../helpers/error.js';
// import { verifyJwtToken } from '../helpers/utils.js';
// import User from '../models/user.model.js';

// export const AuthMiddlewares = {};

// AuthMiddlewares.checkAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     if (!authHeader?.startsWith('Bearer ')) {
//       return next(new AppError('Authorization header missing or invalid', STATUS_CODES.UNAUTHORIZED));
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = verifyJwtToken(token);

//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return next(new AppError('User not found', STATUS_CODES.UNAUTHORIZED));
//     }

//     if (
//       !user.lastTokenIssuedAt ||
//       new Date(decoded.token_created_at).getTime() !== new Date(user.lastTokenIssuedAt).getTime()
//     ) {
//       return next(new AppError('Token is no longer valid. Please login again.', STATUS_CODES.UNAUTHORIZED));
//     }

//     res.locals.user = {
//       id: user._id,
//       mobile: user.mobile,
//       role: user.role,
//       token_created_at: decoded.token_created_at
//     };

//     next();
//   } catch (err) {
//     console.error('Auth error:', err.message);
//     return next(new AppError('You are not authorized', STATUS_CODES.UNAUTHORIZED));
//   }
// };
// middlewares/AuthMiddlewares.js
// import jwt from 'jsonwebtoken';

// export const checkAuth = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(403).json({ message: 'Token missing' });

//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ message: 'Invalid token' });

//     req.user = decoded; // decoded में uid और phoneNumber होगा
//     next();
//   });
// };



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

    // ✅ SAFER TIMESTAMP COMPARISON
    const tokenTs = new Date(decoded.token_created_at).getTime();
    const issuedTs = new Date(user.lastTokenIssuedAt).getTime();

    // Allow a small drift (1 second = 1000ms)
    const DRIFT_ALLOWANCE = 1000;
    if (!user.lastTokenIssuedAt || Math.abs(tokenTs - issuedTs) > DRIFT_ALLOWANCE) {
      return next(new AppError('Token is no longer valid. Please login again.', STATUS_CODES.UNAUTHORIZED));
    }

    // ✅ Attach user to request
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
