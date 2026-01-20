import "dotenv/config";
import express from 'express';

import jwt from 'jsonwebtoken';
import axios from 'axios';
import ownerModel from '../models/owner.model.js';
import twilio from "twilio";

// import client from "../config/twilio.js";
const router = express.Router();
const otpStore = new Map();
const JWT_SECRET = process.env.JWT_SECRET;
const accountSid = 'AC47f3fe8da03dc0261b84b80890e6968f';
const authToken = '2a2d21c39f61f08b01cabd3b0abdef99';
const verifyServiceSid = 'VAc756fccde5f7835816b95e94a66dcbbd';

const client = twilio(accountSid, authToken);
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



//   router.post('/saloon/owner/send-otp', validateMobile, async (req, res) => {
//   try {
//     const { mobile } = req.body;
//     let user;

   
//     if (res.locals.user) {
//       user = await ownerModel.findById(res.locals.user.id);
//       if (!user) throw new Error("Logged-in user not found");

//       user.mobile = mobile;
//     } 
    
//     else {
//       user = await ownerModel.findOne({ mobile });
//       if (!user) {
//         user = new ownerModel({ mobile, user_state_status: 1 });
//       }
//     }

    
//     const otp = "123456"; //  Static OTP
//     const expiresAt = Date.now() + 5 * 60 * 1000;


//     otpStore.set(mobile, { otp, expiresAt });
//     user.otp = otp;
//     user.otpExpiresAt = expiresAt;
//     await user.save();

//     console.log(`OTP for ${mobile} = ${otp}`);


//     res.json({
//       success: true,
//       message: "OTP sent successfully (STATIC)",
//       otpDebug: otp, 
//     });

//   } catch (error) {
//     console.error("Error sending OTP:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });




router.post(
  "/saloon/owner/send-otp",
  validateMobile,
  async (req, res) => {
    try {
      const { mobile } = req.body;
      let user;

      if (res.locals.user) {
        user = await ownerModel.findById(res.locals.user.id);
        if (!user) throw new Error("Logged-in user not found");
        user.mobile = mobile;
      } else {
        user = await ownerModel.findOne({ mobile });
        if (!user) {
          user = new ownerModel({ mobile, user_state_status: 1 });
        }
      }

      await user.save();

  

        await client.verify.v2
  .services(verifyServiceSid)
  .verifications.create({
    to: mobile.startsWith("+") ? mobile : `+91${mobile}`, 
    channel: "sms",
  });

      res.json({
        success: true,
        message: "OTP sent successfully",
      });

    } catch (error) {
      console.error("Error sending OTP:", error.message);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post("/saloon/owner/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: mobile,
        code: otp,
      });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    let user = await ownerModel.findOne({ mobile });
    if (!user) {
      user = new ownerModel({ mobile, user_state_status: 1 });
    }

    const now = new Date();
    user.lastTokenIssuedAt = now;
    await user.save();

    const payload = {
      id: user._id,
      mobile: user.mobile,
      role: "owner",
      token_created_at: now.toISOString(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "OTP verified",
      token,
      token_created_at: now.toISOString(),
      owner_id: user._id,
      status: "active",
      owner_state_status: user.owner_state_status,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// router.post('/saloon/owner/verify-otp', async (req, res) => {
//  try {
//     const { mobile, otp } = req.body;

//     const record = otpStore.get(mobile);
//     if (!record) return res.status(400).json({ success: false, message: 'No OTP found or expired' });
//     if (Date.now() > record.expiresAt) {
//       otpStore.delete(mobile);
//       return res.status(400).json({ success: false, message: 'OTP expired' });
//     }
//     if (record.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

//     otpStore.delete(mobile);

//     let user;
//     if (res.locals.user) {
     
//       user = await ownerModel.findById(res.locals.user.id);
//       if (!user) throw new Error("Logged-in user not found");
//       user.mobile = mobile; 
//     } else {
      
//       user = await ownerModel.findOne({ mobile });
//       if (!user) {
//         user = new ownerModel({ mobile, user_state_status: 1 });
//       }
//     }

   
//     user.otp = null;
//     user.otpExpiresAt = null;
//     const now = new Date();
//     user.lastTokenIssuedAt = now;
//     await user.save();

   
//     const payload = { id: user._id, mobile: user.mobile, role: "owner", token_created_at: now.toISOString() };
//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

//     res.json({
//       success: true,
//       message: 'OTP verified',
//       token,
//       token_created_at: now.toISOString(),
//       owner_id: user._id,
//       status: 'active',
//       owner_state_status: user.owner_state_status
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

 export default router;


