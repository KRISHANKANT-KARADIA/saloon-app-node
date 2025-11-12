// import express from 'express';
// import jwt from 'jsonwebtoken';
// import User from '../models/user.model.js';
// const router = express.Router();

// // In-memory OTP store
// const otpStore = new Map();

// // Secret key for JWT (store in .env in real apps)
// const JWT_SECRET = process.env.JWT_SECRET;


// if (!JWT_SECRET) {
//   throw new Error('Missing JWT_SECRET environment variable');
// }

// // Middleware: Validate mobile number
// function validateMobile(req, res, next) {
//   const { mobile } = req.body;
//   if (!mobile) {
//     return res.status(400).json({ error: 'Mobile number is required' });
//   }
//   const mobileRegex = /^[0-9]{10,15}$/;
//   if (!mobileRegex.test(mobile)) {
//     return res.status(400).json({ error: 'Invalid mobile number format' });
//   }
//   next();
// }

// // Generate OTP
// function generateOTP(length = 6) {
//   let otp = '';
//   for (let i = 0; i < length; i++) {
//     otp += Math.floor(Math.random() * 10);
//   }
//   return otp;
// }

// // 📤 Send OTP
// router.post('/send-otp', validateMobile, async (req, res) => {
//   const { mobile } = req.body;
//   const otp = generateOTP();
//   const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry

//   otpStore.set(mobile, { otp, expiresAt });

//   console.log(`Generated OTP for ${mobile}: ${otp}`); // For testing only

//   res.json({
//     success: true,
//     message: 'OTP sent successfully',
//     // otp // (for development only)
//   });
// });

// // ✅ Verify OTP and issue token
// router.post('/verify-otp', (req, res) => {
//   const { mobile, otp } = req.body;

//   if (!mobile || !otp) {
//     return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
//   }

//   const record = otpStore.get(mobile);

//   if (!record) {
//     return res.status(400).json({ success: false, message: 'No OTP found or already verified' });
//   }

//   if (Date.now() > record.expiresAt) {
//     otpStore.delete(mobile);
//     return res.status(400).json({ success: false, message: 'OTP has expired' });
//   }

//   if (record.otp !== otp) {
//     return res.status(400).json({ success: false, message: 'Invalid OTP' });
//   }

//   otpStore.delete(mobile);

//  const user = await User.findOne({ mobile });

//   if (!user) {
//     return res.status(404).json({ success: false, message: 'User not registered' });
//   }

//   // ✅ Create JWT with user ID
//   const token = jwt.sign(
//     {
//       id: user._id,
//       mobile: user.mobile,
//       role: user.role,
//       token_created_at: new Date().toISOString()
//     },
//     JWT_SECRET,
//     { expiresIn: '7d' }
//   );

//   res.json({
//     success: true,
//     message: 'OTP verified successfully',
//     token,
//     token_created_at: new Date().toISOString()
//   });
// });


//  const token = jwt.sign(
//   {
//       id: user._id,
//     mobile,
//     token_created_at: new Date().toISOString()
//   },
//   JWT_SECRET,
//   { expiresIn: '7d' } 
// );
//  res.json({
//   success: true,
//   message: 'OTP verified successfully',
//   token,
//   token_created_at: new Date().toISOString() 
// });
// });

// export default router;



// import express from 'express';
// import jwt from 'jsonwebtoken';
// import User from '../models/user.model.js'; // ✅ Import your Mongoose User model

// const router = express.Router();

// // In-memory OTP store
// const otpStore = new Map();

// // Secret key for JWT (store in .env in real apps)
// const JWT_SECRET = process.env.JWT_SECRET;

// if (!JWT_SECRET) {
//   throw new Error('Missing JWT_SECRET environment variable');
// }

// // Middleware: Validate mobile number
// function validateMobile(req, res, next) {
//   const { mobile } = req.body;
//   if (!mobile) {
//     return res.status(400).json({ error: 'Mobile number is required' });
//   }
//   const mobileRegex = /^[0-9]{10,15}$/;
//   if (!mobileRegex.test(mobile)) {
//     return res.status(400).json({ error: 'Invalid mobile number format' });
//   }
//   next();
// }

// // Generate OTP
// function generateOTP(length = 6) {
//   let otp = '';
//   for (let i = 0; i < length; i++) {
//     otp += Math.floor(Math.random() * 10);
//   }
//   return otp;
// }

// // 📤 Send OTP
// router.post('/send-otp', validateMobile, async (req, res) => {
//   const { mobile } = req.body;
//   const otp = generateOTP();
//   const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry

//   otpStore.set(mobile, { otp, expiresAt });

//   console.log(`Generated OTP for ${mobile}: ${otp}`); // For testing only

//   res.json({
//     success: true,
//     message: 'OTP sent successfully',
//     // otp // (uncomment only for dev)
//   });
// });

// // ✅ Verify OTP and issue JWT
// router.post('/verify-otp', async (req, res) => {
//   const { mobile, otp } = req.body;

//   if (!mobile || !otp) {
//     return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
//   }

//   const record = otpStore.get(mobile);

//   if (!record) {
//     return res.status(400).json({ success: false, message: 'No OTP found or already verified' });
//   }

//   if (Date.now() > record.expiresAt) {
//     otpStore.delete(mobile);
//     return res.status(400).json({ success: false, message: 'OTP has expired' });
//   }

//   if (record.otp !== otp) {
//     return res.status(400).json({ success: false, message: 'Invalid OTP' });
//   }

//   // OTP is valid — delete it
//   otpStore.delete(mobile);

//   // ✅ Fetch user from DB
//   const user = await User.findOne({ mobile });

//   if (!user) {
//     return res.status(404).json({ success: false, message: 'User not registered' });
//   }

//   // ✅ Generate token with user._id and other info
//   const tokenPayload = {
//     id: user._id,
//     mobile: user.mobile,
//     role: user.role,
//     token_created_at: new Date().toISOString()
//   };

//   const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//   res.json({
//     success: true,
//     message: 'OTP verified successfully',
//     token,
//     token_created_at: tokenPayload.token_created_at
//   });
// });

// export default router;





// import express from 'express';
// import axios from 'axios';
// import jwt from 'jsonwebtoken';
// import ownerModel from '../models/owner.model.js';

// const router = express.Router();
// const otpStore = new Map();
// const JWT_SECRET = process.env.JWT_SECRET;

// if (!JWT_SECRET) {
//   throw new Error('Missing JWT_SECRET environment variable');
// }

// // Middleware: validate mobile format
// function validateMobile(req, res, next) {
//   const { mobile } = req.body;
//   const mobileRegex = /^[0-9]{10,15}$/;
//   if (!mobile) return res.status(400).json({ error: 'Mobile is required' });
//   if (!mobileRegex.test(mobile)) return res.status(400).json({ error: 'Invalid mobile number' });
//   next();
// }

// // OTP generator
// function generateOTP(length = 6) {
//   return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
// }

// // 📤 Send OTP + create user if not exist
// router.post('/owner/send-otp', validateMobile, async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     let user = await ownerModel.findOne({ mobile });
//     if (!user) {
//       user = new ownerModel({ mobile });
//       await user.save();
//     }

//     const otp = generateOTP();
//     const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
//     otpStore.set(mobile, { otp, expiresAt });

//     user.otp = otp;
//     user.otpExpiresAt = expiresAt;
//     await user.save();

//     // console.log(`Generated OTP for ${mobile}: ${otp}`);
//     // res.json({ success: true, message: 'OTP sent successfully' });

// const message = `Your verification code is ${otp}. It will expire in 5 minutes.`; 

//     const smsUrl = `http://148.251.129.118/wapp/api/send`;
//     const params = {
//       apikey: '6400644141f6445ab6554b186f4b4403',
//       mobile,
//       msg: message,
//     };

//     const response = await axios.get(smsUrl, { params });

//     if (response.data.status !== 'success') {
//       throw new Error(response.data.errormsg || 'Failed to send OTP');
//     }

//     console.log(`OTP ${otp} sent to ${mobile}`);

//     res.json({ success: true, message: 'OTP sent successfully' });
//   } catch (error) {
//       console.error('Error sending OTP:', error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ✅ Verify OTP and issue token
// router.post('/verify-otp', async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;
//     const record = otpStore.get(mobile);

//     if (!record) return res.status(400).json({ success: false, message: 'No OTP found or already verified' });
//     if (Date.now() > record.expiresAt) {
//       otpStore.delete(mobile);
//       return res.status(400).json({ success: false, message: 'OTP expired' });
//     }
//     if (record.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

//     otpStore.delete(mobile);

//     const user = await ownerModel.findOne({ mobile });
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//     const now = new Date();
//     user.lastTokenIssuedAt = now;
//     await user.save();

//     const payload = {
//       id: user._id,
//       mobile: user.mobile,
//       role: user.role,
//       token_created_at: now.toISOString(),
//     };

//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

//     res.json({ success: true, message: 'OTP verified', token, token_created_at: now.toISOString() });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// export default router;


import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import ownerModel from '../models/owner.model.js';

const router = express.Router();
const otpStore = new Map();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

function validateMobile(req, res, next) {
  const { mobile } = req.body;
  // const mobileRegex = /^[0-9]{10,15}$/;
   const mobileRegex = /^\+?[0-9]{10,15}$/;
  if (!mobile) return res.status(400).json({ error: 'Mobile is required' });
  if (!mobileRegex.test(mobile)) return res.status(400).json({ error: 'Invalid mobile number' });
  next();
}

function generateOTP(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

router.post('/saloon/owner/send-otp', validateMobile, async (req, res) => {
 

   try {
    const { mobile } = req.body;
    let user;

    if (res.locals.user) {
      // User is logged in: update mobile instead of creating new
      user = await ownerModel.findById(res.locals.user.id);
      if (!user) throw new Error("Logged in user not found");

      user.mobile = mobile;  // update mobile
    } else {
      // Not logged in: find existing by mobile or create new
      user = await ownerModel.findOne({ mobile });
      if (!user) {
        user = new ownerModel({ mobile, user_state_status: 1 });
      }
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(mobile, { otp, expiresAt });

    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();

   const message = `Your verification code is ${otp}. It will expire in 5 minutes.`; 

    const smsUrl = `http://148.251.129.118/wapp/api/send`;
    const params = {
      apikey: '6400644141f6445ab6554b186f4b4403',
      mobile,
      msg: message,
    };

    const response = await axios.get(smsUrl, { params });

    if (response.data.status !== 'success') {
      throw new Error(response.data.errormsg || 'Failed to send OTP');
    }

    console.log(`OTP ${otp} sent to ${mobile}`);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
      console.error('Error sending OTP:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});



// For Firebase auth


// router.post("/saloon/owner/verify-otp", async (req, res) => {
//   try {
//     const { idToken, mobile } = req.body;

//     if (!idToken || !mobile) {
//       return res.status(400).json({ success: false, message: "Missing idToken or mobile" });
//     }

//     // ✅ Verify Firebase token
//     const decoded = await admin.auth().verifyIdToken(idToken);

//     if (!decoded.phone_number) {
//       return res.status(400).json({ success: false, message: "Phone number missing in Firebase token" });
//     }


//       // New signup / login
//       user = await ownerModel.findOne({ mobile });
//       if (!user) {
//         user = new ownerModel({ mobile, user_state_status: 1 });
//       }
//     }

//     const now = new Date();
//     user.lastTokenIssuedAt = now;
//     await user.save();

//     // ✅ Issue your own JWT for API
//     const payload = {
//       id: user._id,
//       mobile: user.mobile,
//       role: "owner",
//       token_created_at: now.toISOString(),
//     };
//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

//     res.json({
//       success: true,
//       message: "OTP verified via Firebase",
//       token,
//       token_created_at: now.toISOString(),
//       owner_id: user._id,
//       status: "active",
//       owner_state_status: user.owner_state_status,
//     });
//   } catch (error) {
//     console.error("OTP Verify Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });



router.post('/saloon/owner/verify-otp', async (req, res) => {
 try {
    const { mobile, otp } = req.body;

    const record = otpStore.get(mobile);
    if (!record) return res.status(400).json({ success: false, message: 'No OTP found or expired' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(mobile);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    if (record.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    otpStore.delete(mobile);

    let user;
    if (res.locals.user) {
      // Logged-in user updating mobile → reuse existing user
      user = await ownerModel.findById(res.locals.user.id);
      if (!user) throw new Error("Logged-in user not found");
      user.mobile = mobile; // update mobile
    } else {
      // New signup or login by OTP
      user = await ownerModel.findOne({ mobile });
      if (!user) {
        user = new ownerModel({ mobile, user_state_status: 1 });
      }
    }

    // Update OTP info
    user.otp = null;
    user.otpExpiresAt = null;
    const now = new Date();
    user.lastTokenIssuedAt = now;
    await user.save();

    // Generate token
    const payload = { id: user._id, mobile: user.mobile, role: "owner", token_created_at: now.toISOString() };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'OTP verified',
      token,
      token_created_at: now.toISOString(),
      owner_id: user._id,
      status: 'active',
      owner_state_status: user.owner_state_status
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// routes/ownerAuth.routes.js



// import express from "express";
// import jwt from "jsonwebtoken";
// import admin from "../firebase.js";
// import Owner from "../models/owner.model.js";

// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

// router.post("/saloon/owner/verify-otp", async (req, res) => {
//   try {
//     const { mobile, idToken } = req.body;
//     if (!mobile || !idToken)
//       return res.status(400).json({ success: false, message: "Missing mobile or idToken" });

//     const decoded = await admin.auth().verifyIdToken(idToken);

//     if (decoded.phone_number !== `+91${mobile}`) {
//       return res.status(400).json({ success: false, message: "Phone mismatch" });
//     }

//     let user = await Owner.findOne({ mobile });
//     if (!user) {
//       user = new Owner({ mobile, owner_state_status: 1 });
//       await user.save();
//     }

//     const token = jwt.sign({ id: user._id, mobile: user.mobile }, JWT_SECRET, { expiresIn: "7d" });

//     return res.json({ success: true, token, owner_state_status: user.owner_state_status });
//   } catch (err) {
//     console.error("Verify OTP Error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

 export default router;



// backend/routes/ownerAuth.js
// import express from 'express';
// import jwt from 'jsonwebtoken';
// import Owner from '../models/owner.model.js';


// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET;

// if (!JWT_SECRET) {
//   throw new Error('Missing JWT_SECRET environment variable');
// }

// // Utility to generate 6-digit OTP
// const generateOTP = (length = 6) => {
//   return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
// };

// // Middleware to validate mobile number
// const validateMobile = (req, res, next) => {
//   const { mobile } = req.body;
//   const mobileRegex = /^[0-9]{10,15}$/;
//   if (!mobile) return res.status(400).json({ success: false, message: 'Mobile is required' });
//   if (!mobileRegex.test(mobile)) return res.status(400).json({ success: false, message: 'Invalid mobile number' });
//   next();
// };

// /**
//  * 1️⃣ Send OTP
//  */
// router.post('/saloon/owner/send-otp', validateMobile, async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     // Find or create user
//     let user = await Owner.findOne({ mobile });
//     if (!user) user = new Owner({ mobile, owner_state_status: 1 });

//     // Generate OTP and expiry (5 minutes)
//     const otp = generateOTP();
//     const otpExpiresAt = Date.now() + 5 * 60 * 1000;

//     // Save OTP in DB
//     user.otp = otp;
//     user.otpExpiresAt = otpExpiresAt;
//     await user.save();

//     // TODO: Replace with real SMS provider
//     console.log(`OTP for ${mobile}: ${otp}`);

//     return res.json({ success: true, message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error('Send OTP Error:', error);
//     return res.status(500).json({ success: false, message: 'Failed to send OTP' });
//   }
// });

// /**
//  * 2️⃣ Verify OTP
//  */
// router.post('/saloon/owner/verify-otp', validateMobile, async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;
//     if (!otp) return res.status(400).json({ success: false, message: 'OTP is required' });

//     const user = await Owner.findOne({ mobile });
//     if (!user) return res.status(400).json({ success: false, message: 'User not found' });

//     if (!user.otp || Date.now() > user.otpExpiresAt) {
//       return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
//     }

//     if (user.otp !== otp) {
//       return res.status(400).json({ success: false, message: 'Invalid OTP' });
//     }

//     // OTP verified → clear OTP fields
//     user.otp = null;
//     user.otpExpiresAt = null;
//     user.lastTokenIssuedAt = new Date();
//     await user.save();

//     // Issue JWT token
//     const payload = { id: user._id, mobile: user.mobile, role: user.role };
//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

//     return res.json({
//       success: true,
//       message: 'OTP verified successfully',
//       token,
//       owner_state_status: user.owner_state_status,
//     });
//   } catch (error) {
//     console.error('Verify OTP Error:', error);
//     return res.status(500).json({ success: false, message: 'OTP verification failed' });
//   }
// });

// /**
//  * 3️⃣ Resend OTP
//  */
// router.post('/saloon/owner/resend-otp', validateMobile, async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     const user = await Owner.findOne({ mobile });
//     if (!user) return res.status(400).json({ success: false, message: 'User not found' });

//     const otp = generateOTP();
//     const otpExpiresAt = Date.now() + 5 * 60 * 1000;

//     user.otp = otp;
//     user.otpExpiresAt = otpExpiresAt;
//     await user.save();

//     // TODO: Replace with real SMS provider
//     console.log(`Resent OTP for ${mobile}: ${otp}`);

//     return res.json({ success: true, message: 'OTP resent successfully' });
//   } catch (error) {
//     console.error('Resend OTP Error:', error);
//     return res.status(500).json({ success: false, message: 'Failed to resend OTP' });
//   }
// });

// import express from "express";
// import Owner from "../models/owner.model.js";
// import admin from "./firebase.js";
// import jwt from "jsonwebtoken"; // ✅ fixed: replaced require() with import

// const router = express.Router();

// router.post("/verify-otp", async (req, res) => {
//   const { idToken } = req.body;

//   try {
//     // Verify Firebase ID token
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     const mobile = decodedToken.phone_number;

//    let owner = await Owner.findOne({ mobile });
// if (!owner) owner = await Owner.create({ mobile });

//    const token = jwt.sign(
//   { id: owner._id, mobile },
//   process.env.JWT_SECRET,
//   { expiresIn: "1h" }
// );

//     res.json({ success: true, token });
//   } catch (err) {
//     console.error("OTP Verification Error:", err);
//     res.status(400).json({ success: false, message: "Invalid OTP or token" });
//   }
// });

// export default router;


// import express from "express";
// import Owner from "../models/owner.model.js";
// import admin from "./firebase.js"; // Firebase Admin SDK
// import jwt from "jsonwebtoken";

// import dotenv from "dotenv";
// dotenv.config(); // load environment variables

// const JWT_SECRET = process.env.JWT_SECRET;
// if (!JWT_SECRET) {
//   throw new Error("Missing JWT_SECRET environment variable");
// }
// const router = express.Router();
// /**
//  * @route POST /saloon/owner/verify-otp
//  * @desc Verify Firebase OTP, create owner if not exists, issue backend JWT
//  * @access Public
//  */
// router.post("/saloon/owner/verify-otp", async (req, res) => {
//   const { idToken } = req.body;

//   if (!idToken) {
//     return res.status(400).json({ success: false, message: "idToken is required" });
//   }

//   try {
//     // 1️⃣ Verify Firebase ID token
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     const mobile = decodedToken.phone_number; // Firebase phone number

//     if (!mobile) {
//       return res.status(400).json({ success: false, message: "Phone number not found in token" });
//     }

//     // 2️⃣ Find existing owner or create new one
//     let owner = await Owner.findOne({ mobile });
//     if (!owner) {
//       owner = await Owner.create({
//         mobile,
//         role: "owner", // default role
//         owner_state_status: "1",
//         lastTokenIssuedAt: new Date(),
//       });
//     } else {
//       // Update lastTokenIssuedAt for existing owner
//       owner.lastTokenIssuedAt = new Date();
//       await owner.save();
//     }

//     // 3️⃣ Issue backend JWT (for your protected APIs)
//     const payload = {
//       id: owner._id,
//       mobile: owner.mobile,
//       role: owner.role,
//     };

//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

//     // 4️⃣ Return token to frontend
//     res.json({
//       success: true,
//       message: "OTP verified successfully",
//       token,
//       owner_state_status: owner.owner_state_status,
//     });
//   } catch (err) {
//     console.error("OTP Verification Error:", err);
//     res.status(400).json({ success: false, message: "Invalid OTP or token" });
//   }
// });

// export default router;
