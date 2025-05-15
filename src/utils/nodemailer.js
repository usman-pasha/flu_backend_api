import nodemailer from 'nodemailer';
import config from '../config/index.js';
import * as logger from '../utils/log.js';

const SMTP = {
  service: 'gmail',
  port: 587,
  auth: {
    user: config.NODEMAILER_USER,
    pass: config.NODEMAILER_PASS,
  },
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(SMTP);

  return transporter.sendMail({
    from: `"Flu Applications" <${config.NODEMAILER_USER}>`, // a proper 'from' field
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async ({ username, email, emailOTP }) => {
  const message = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #4CAF50;">Welcome to Flu Application, ${username}!</h2>
        <p style="font-size: 16px; color: #333;">We're excited to have you on board.</p>
        <p style="font-size: 16px; color: #333;">
          To complete your registration, please use the following one-time password (OTP):
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; background-color: #e3f2fd; color: #0d47a1; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 6px;">
            ${emailOTP}
          </span>
        </div>
        <p style="font-size: 14px; color: #777;">
          This OTP is valid for a limited time. Please do not share it with anyone.
        </p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #aaa;">If you did not request this email, you can safely ignore it.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Your OTP for Email Verification',
    html: message,
  });
};


export const resendEmailOTP = async ({ username, email, emailOTP }) => {
  logger.data('Send Email', { username, email, emailOTP });

  const message = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; color: #333333; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #4A90E2; text-align: center;">Resend Email OTP</h2>
      <p style="font-size: 16px;">Hi <strong>${username}</strong>,</p>
      <p style="font-size: 15px;">You requested to resend your email verification code. Please use the OTP below to complete the process:</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 26px; font-weight: bold; color: #ffffff; background-color: #4A90E2; padding: 10px 20px; border-radius: 8px; display: inline-block;">
          ${emailOTP}
        </span>
      </div>

      <p style="font-size: 14px;">This OTP is valid for a limited time. Do not share it with anyone for security reasons.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;" />

      <p style="font-size: 14px; text-align: center;">Thank you for using <strong>Flu Application</strong>!</p>
      <p style="font-size: 13px; text-align: center; color: #888;">If you did not request this email, you can safely ignore it.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Resend Email OTP',
    html: message,
  });
};

export const resendResetPasswordOTP = async ({ username, email, emailOTP }) => {
  logger.data('Send Email', { username, email, emailOTP });

  const message = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; color: #333333; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #D9534F; text-align: center;">Reset Password OTP</h2>
      <p style="font-size: 16px;">Dear <strong>${username}</strong>,</p>
      <p style="font-size: 15px;">
        You have requested to reset your password. Please use the OTP below to proceed with the password reset process:
      </p>
      
      <div style="text-align: center; margin: 25px 0;">
        <span style="font-size: 28px; font-weight: bold; color: #ffffff; background-color: #D9534F; padding: 12px 24px; border-radius: 10px; display: inline-block; letter-spacing: 2px;">
          ${emailOTP}
        </span>
      </div>

      <p style="font-size: 14px; color: #555;">
        This OTP is valid for a limited time. Please do not share it with anyone. If you did not request a password reset, please ignore this message.
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;" />

      <p style="font-size: 14px; text-align: center;">
        — Team <strong>Flu Application</strong>
      </p>
      <p style="font-size: 13px; text-align: center; color: #888;">
        For support, contact us at support@fluapp.com
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Resend OTP for Password Reset',
    html: message,
  });
};

// pcwt
export const pcwtEmail = async (data) => {
  const transporter = nodemailer.createTransport(SMTP); // assuming SMTP is inside config

  const message = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #4CAF50;">New Message from PCWT User</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #4CAF50;">
        ${data.message}
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"Pcwt" <${config.NODEMAILER_USER}>`,
    to: "siraj.backend.dev@gmail.com",
    cc: "usmanpasha002@gmail.com",
    subject: 'PCWT Form Submitted',
    html: message,
  });
};