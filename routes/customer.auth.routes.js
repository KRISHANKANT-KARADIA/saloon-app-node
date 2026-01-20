import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";
import otpModel from "../models/otp.model.js";

const router = express.Router();
const otpStore = new Map();
const JWT_SECRET = process.env.JWT_SECRET;


function validateMobile(req, res, next) {
  const { mobile } = req.body;
  const regex = /^[0-9]{10,15}$/;
  if (!mobile || !regex.test(mobile)) {
    return res.status(400).json({ success: false, message: "Valid mobile number required" });
  }
  next();
}

function generateOTP(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

router.post("/send-otp", validateMobile, async (req, res) => {
  try {
    const { mobile } = req.body;

    
    const otp = "123456"; 
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    
    await otpModel.findOneAndUpdate(
      { mobile },
      { otp, expiresAt },
      { upsert: true, new: true }
    );


    let customer = await Customer.findOne({ mobile });
    if (!customer) {
      customer = new Customer({ mobile });
      await customer.save();
    }

   
    console.log("📌 STATIC OTP for", mobile, "==>", otp);

  
    const message = `Your verification code is ${otp}.`;

   
    return res.json({
      success: true,
      message: "OTP generated (static) & logged in console.",
      otp: otp, 
    });

  } catch (error) {
    console.error(" OTP Send Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;


    const record = await otpModel.findOne({ mobile });
    if (!record) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

   
    if (new Date() > record.expiresAt) {
      await otpModel.deleteOne({ mobile });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    
    await otpModel.deleteOne({ mobile });

 
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

 
    const payload = {
      id: customer._id,
      mobile: customer.mobile,
      role: "customer",
      token_created_at: new Date().toISOString(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    console.log(`OTP verified successfully for ${mobile}`);

    res.json({
      success: true,
      message: "OTP verified successfully",
      token,
      user_state_status: customer.user_state_status,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;








// import express from "express";
// import axios from "axios";
// import jwt from "jsonwebtoken";
// import Customer from "../models/customer.model.js";
// import otpModel from "../models/otp.model.js";
// import twilio from "twilio";
// const router = express.Router();
// const otpStore = new Map();
// const JWT_SECRET = process.env.JWT_SECRET;
// const accountSid = 'AC47f3fe8da03dc0261b84b80890e6968f';
// const authToken = '2a2d21c39f61f08b01cabd3b0abdef99';
// const verifyServiceSid = 'VAc756fccde5f7835816b95e94a66dcbbd';

// const client = twilio(accountSid, authToken);
// if (!JWT_SECRET) {
//   throw new Error('Missing JWT_SECRET environment variable');
// }

// function validateMobile(req, res, next) {
//   const { mobile } = req.body;
//   const regex = /^[0-9]{10,15}$/;
//   if (!mobile || !regex.test(mobile)) {
//     return res.status(400).json({ success: false, message: "Valid mobile number required" });
//   }
//   next();
// }

// function generateOTP(length = 6) {
//   return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
// }

// // router.post("/send-otp", validateMobile, async (req, res) => {
// //   try {
// //     const { mobile } = req.body;

    
// //     const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
// //     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    
// //     await otpModel.findOneAndUpdate(
// //       { mobile },
// //       { otp, expiresAt },
// //       { upsert: true, new: true }
// //     );


// //     let customer = await Customer.findOne({ mobile });
// //     if (!customer) {
// //       customer = new Customer({ mobile });
// //       await customer.save();
// //     }

   
// //     console.log("📌 STATIC OTP for", mobile, "==>", otp);

  
// //     const message = `Your verification code is ${otp}.`;

//   //     await client.verify.v2
//   // .services(verifyServiceSid)
//   // .verifications.create({
//   //   to: mobile,
//   //   channel: "sms",
//   // });
   
// //     return res.json({
// //       success: true,
// //       message: "OTP generated (static) & logged in console.",
// //       otp: otp, 
// //     });

// //   } catch (error) {
// //     console.error(" OTP Send Error:", error.message);
// //     return res.status(500).json({
// //       success: false,
// //       message: error.message
// //     });
// //   }
// // });

// router.post("/send-otp", validateMobile, async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     // Ensure customer exists
//     let customer = await Customer.findOne({ mobile });
//     if (!customer) {
//       customer = new Customer({ mobile });
//       await customer.save();
//     }

    

// const phoneNumber = mobile.startsWith("+") ? mobile : `+91${mobile}`;
//    await client.verify.v2
//   .services(verifyServiceSid)
//   .verifications.create({
//     to: mobile.startsWith("+") ? mobile : `+91${mobile}`, 
//     channel: "sms",
//   });

//       res.json({
//         success: true,
//         message: "OTP sent successfully",
//       });

//   } catch (error) {
//     console.error("OTP Send Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });


// // router.post("/send-otp", validateMobile, async (req, res) => {
// //   try {
// //     const { mobile } = req.body;

// //     // Ensure customer exists
// //     let customer = await Customer.findOne({ mobile });
// //     if (!customer) {
// //       customer = new Customer({ mobile });
// //       await customer.save();
// //     }
// //    const otp = generateOTP(6);
// //     const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
// //   await otpModel.findOneAndUpdate(
// //       { mobile },
// //       { otp, expiresAt },
// //       { upsert: true, new: true }
// //     );
    


// //        await client.verify.v2
// //   .services(verifyServiceSid)
// //   .verifications.create({
// //     to: mobile.startsWith("+") ? mobile : `+91${mobile}`, 
// //     channel: "sms",
// //   });

// //     console.log(` OTP sent via Twilio Verify to ${mobile}`);

// //     return res.json({
// //       success: true,
// //       message:`Your verification code is ${otp}`
// //     });

// //   } catch (error) {
// //     console.error("OTP Send Error:", error.message);
// //     return res.status(500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // });

// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;

//  const verificationCheck = await client.verify.v2
//       .services(verifyServiceSid)
//       .verificationChecks.create({
//         to: mobile.startsWith("+") ? mobile : `+91${mobile}`,
//         code: otp,
//       });

//     if (verificationCheck.status !== "approved") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired OTP",
//       });
//     }
//     // const record = await otpModel.findOne({ mobile });
//     // if (!record) {
//     //   return res.status(400).json({ success: false, message: "OTP not found or expired" });
//     // }

   
//     // if (new Date() > record.expiresAt) {
//     //   await otpModel.deleteOne({ mobile });
//     //   return res.status(400).json({ success: false, message: "OTP expired" });
//     // }

//     // if (record.otp !== otp) {
//     //   return res.status(400).json({ success: false, message: "Invalid OTP" });
//     // }

    
//     // await otpModel.deleteOne({ mobile });

 
//     let customer = await Customer.findOne({ mobile });
//     if (!customer) {
//       customer = new Customer({
//         mobile,
//         role: "customer",
//         user_state_status: 1,
//         lastTokenIssuedAt: new Date(),
//       });
//     } else {
//       customer.lastTokenIssuedAt = new Date();
//     }
//     await customer.save();

 
//     const payload = {
//       id: customer._id,
//       mobile: customer.mobile,
//       role: "customer",
//       token_created_at: new Date().toISOString(),
//     };

//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

//     console.log(`OTP verified successfully for ${mobile}`);

//     res.json({
//       success: true,
//       message: "OTP verified successfully",
//       token,
//       user_state_status: customer.user_state_status,
//     });
//   } catch (error) {
//     console.error("OTP Verification Error:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });


// export default router;
