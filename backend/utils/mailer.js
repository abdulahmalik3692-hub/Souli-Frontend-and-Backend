import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Helper to get SMTP/Email credentials
const getMailCredentials = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const from = process.env.SMTP_FROM || user;
  return { user, pass, host, port, from };
};

// Create a transporter instance when credentials are valid
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { user, pass, host, port } = getMailCredentials();

  if (!user || !pass) {
    return null;
  }

  try {
    // If it's a Gmail SMTP server or if host is not custom SMTP, use Gmail service config
    if (host === 'smtp.gmail.com' || host.includes('gmail')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
    } else {
      // Use custom SMTP
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for port 465, false for 587/other
        auth: {
          user,
          pass,
        },
      });
    }
    return transporter;
  } catch (error) {
    console.error("❌ Failed to create SMTP transporter:", error);
    return null;
  }
};

/**
 * Send an OTP verification email.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} code - The 6-digit OTP code.
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise.
 */
export const sendVerificationEmail = async (toEmail, code) => {
  const { user, pass, from } = getMailCredentials();
  
  if (!user || !pass) {
    console.error("❌ SMTP_USER/EMAIL_USER or SMTP_PASSWORD/EMAIL_PASS not set in environment variables. Falling back to console.");
    console.log("\n" + "=".repeat(80));
    console.log(`📧 [DEVELOPMENT MAIL FALLBACK]`);
    console.log(`To: ${toEmail}`);
    console.log(`Verification Code: ${code}`);
    console.log("=".repeat(80) + "\n");
    return false;
  }

  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    console.error("❌ Transporter could not be initialized. Falling back to console.");
    console.log("\n" + "=".repeat(80));
    console.log(`📧 [DEVELOPMENT MAIL FALLBACK]`);
    console.log(`To: ${toEmail}`);
    console.log(`Verification Code: ${code}`);
    console.log("=".repeat(80) + "\n");
    return false;
  }

  const mailOptions = {
    from: `"Soulify App" <${from}>`,
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
    await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    console.log("\n" + "=".repeat(80));
    console.log(`📧 [FAILED MAIL FALLBACK]`);
    console.log(`To: ${toEmail}`);
    console.log(`Verification Code: ${code}`);
    console.log("=".repeat(80) + "\n");
    return false;
  }
};

/**
 * Send a Password Reset OTP verification email.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} code - The 6-digit OTP code.
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise.
 */
export const sendResetPasswordEmail = async (toEmail, code) => {
  const { user, pass, from } = getMailCredentials();
  
  if (!user || !pass) {
    console.error("❌ SMTP_USER/EMAIL_USER or SMTP_PASSWORD/EMAIL_PASS not set in environment variables. Cannot send reset email.");
    return false;
  }

  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    console.error("❌ Transporter could not be initialized. Cannot send reset email.");
    return false;
  }

  const mailOptions = {
    from: `"Soulify App" <${from}>`,
    to: toEmail,
    subject: 'Your Soulify Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaeb; border-radius: 10px;">
        <h2 style="color: #6a1b9a; text-align: center;">Reset Your Soulify Password</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">We received a request to reset your password. Your 6-digit verification reset code is:</p>
        <div style="background-color: #f3e5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #4a148c; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p style="font-size: 14px; color: #555;">This reset code will expire in 15 minutes. Please do not share it with anyone.</p>
        <p style="font-size: 14px; color: #555;">If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eaeaeb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Soulify. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    return false;
  }
};

