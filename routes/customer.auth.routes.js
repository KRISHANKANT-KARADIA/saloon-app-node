import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";
import otpModel from "../models/otp.model.js";

const router = express.Router();
const otpStore = new Map();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Mobile validation middleware
function validateMobile(req, res, next) {
  const { mobile } = req.body;
  const regex = /^[0-9]{10,15}$/;
  if (!mobile || !regex.test(mobile)) {
    return res.status(400).json({ success: false, message: "Valid mobile number required" });
  }
  next();
}

// ✅ OTP Generator
function generateOTP(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

router.post("/send-otp", validateMobile, async (req, res) => {
  try {
    const { mobile } = req.body;

    // STATIC OTP
    const otp = "123456"; 
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save/Update OTP in DB
    await otpModel.findOneAndUpdate(
      { mobile },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Ensure customer exists
    let customer = await Customer.findOne({ mobile });
    if (!customer) {
      customer = new Customer({ mobile });
      await customer.save();
    }

    // Print OTP on server log
    console.log("📌 STATIC OTP for", mobile, "==>", otp);

    // MESSAGE — (Send SMS disabled)
    const message = `Your verification code is ${otp}.`;

    // ❌ SMS API Disabled — Commented out
    /*
    const smsUrl = `http://148.251.129.118/wapp/api/send`;
    const params = {
      apikey: "6400644141f6445ab6554b186f4b4403",
      mobile,
      msg: message,
    };
    try {
      const smsRes = await axios.get(smsUrl, { params });
      console.log("📩 SMS API Response:", smsRes.data);
    } catch (smsError) {
      console.error("❌ SMS API Failed:", smsError.message);
      console.error("📌 SMS API Error Response:", smsError.response?.data);
    }
    */

    // FINAL RESPONSE
    return res.json({
      success: true,
      message: "OTP generated (static) & logged in console.",
      otp: otp, // optional: remove in production
    });

  } catch (error) {
    console.error("❌ OTP Send Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // ✅ Check OTP in DB
    const record = await otpModel.findOne({ mobile });
    if (!record) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    // ✅ Check expiry manually (just to be sure)
    if (new Date() > record.expiresAt) {
      await otpModel.deleteOne({ mobile });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // ✅ OTP valid — delete after success
    await otpModel.deleteOne({ mobile });

    // ✅ Create / Update customer
    let customer = await Customer.findOne({ mobile });
    if (!customer) {
      customer = new Customer({
        mobile,
        role: "customer",
        user_state_status: 1,
        lastTokenIssuedAt: new Date(),
      });
    } else {
      customer.lastTokenIssuedAt = new Date();
    }
    await customer.save();

    // ✅ Create token
    const payload = {
      id: customer._id,
      mobile: customer.mobile,
      role: "customer",
      token_created_at: new Date().toISOString(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    console.log(`✅ OTP verified successfully for ${mobile}`);

    res.json({
      success: true,
      message: "OTP verified successfully",
      token,
      user_state_status: customer.user_state_status,
    });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
