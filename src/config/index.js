import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT || 8000,
  statusCode: [200, 500, 401, 400, 403],
  MAXFILES: process.env.MAXFILES,
  LABEL: process.env.LABEL,
  ACCESS_VALIDITY: process.env.ACCESS_VALIDITY,
  ACCESS_SECRET: process.env.ACCESS_SECRET,
  REFRESH_VALIDITY: process.env.REFRESH_VALIDITY,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  DB_URI_TEST: process.env.DB_URI_TEST,
  DB_URI: process.env.DB_URI,
  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_PASS: process.env.NODEMAILER_PASS,
  USEREMAIL: process.env.USEREMAIL,
  CLOUD_NAME: process.env.CLOUD_NAME,
  IMAGE_API_KEY: process.env.IMAGE_API_KEY,
  IMAGE_API_SECRET: process.env.IMAGE_API_SECRET,
  SMS_API_KEY: process.env.SMS_API_KEY,
  FAST2SMS: process.env.FAST2SMS,
};

export default config;

