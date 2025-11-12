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

    // ✅ Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ Store in DB (replace old OTP if exists)
    await otpModel.findOneAndUpdate(
      { mobile },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // (optional) Save/update customer record for mobile
    let customer = await Customer.findOne({ mobile });
    if (!customer) {
      customer = new Customer({ mobile });
      await customer.save();
    }

    // ✅ Send SMS
    const message = `Your verification code is ${otp}. It will expire in 5 minutes.`;
    const smsUrl = `http://148.251.129.118/wapp/api/send`;
    const params = {
      apikey: "6400644141f6445ab6554b186f4b4403",
      mobile,
      msg: message,
    };

    await axios.get(smsUrl, { params });

    console.log(`✅ OTP ${otp} sent to ${mobile}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


// 🟢 VERIFY OTP
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
