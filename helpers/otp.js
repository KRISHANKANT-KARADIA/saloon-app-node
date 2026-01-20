// helpers/otp.js

export function generateOtpCode(length = 6) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
}

export async function sendOtpToMobile(mobile, otp) {
  
  console.log(`📲 Sending OTP ${otp} to mobile ${mobile}`);
}
