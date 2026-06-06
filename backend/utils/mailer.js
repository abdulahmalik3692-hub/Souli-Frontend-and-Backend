import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an OTP verification email.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} code - The 6-digit OTP code.
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise.
 */
export const sendVerificationEmail = async (toEmail, code) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASS not set in environment variables. Falling back to console.");
    console.log("\n" + "=".repeat(80));
    console.log(`📧 [DEVELOPMENT MAIL FALLBACK]`);
    console.log(`To: ${toEmail}`);
    console.log(`Verification Code: ${code}`);
    console.log("=".repeat(80) + "\n");
    return false;
  }

  const mailOptions = {
    from: `"Soulify App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Soulify Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaeb; border-radius: 10px;">
        <h2 style="color: #6a1b9a; text-align: center;">Welcome to Soulify!</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Your verification code to activate your account is:</p>
        <div style="background-color: #f3e5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #4a148c; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p style="font-size: 14px; color: #555;">This code will expire in 15 minutes. Please do not share it with anyone.</p>
        <p style="font-size: 14px; color: #555;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eaeaeb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Soulify. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    return false;
  }
};
