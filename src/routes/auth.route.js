import express from "express";
import authController from "../controllers/auth.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth } from "../middlewares/auth.js";

const authRoute = express.Router();

authRoute.route("/register").post(catchError(authController.registerUser));
authRoute.route("/validateEmailOTP").post(catchError(authController.validateEmailOTP));
authRoute.route("/resendOtp").post(catchError(authController.resendOTP));
authRoute.route("/login").post(catchError(authController.login));
authRoute.route("/updatePassword").post(verifyAuth, catchError(authController.updatePassword));
authRoute.route("/resetPassword").post(catchError(authController.resetPassword));
authRoute.route("/resetPasswordOtp").post(catchError(authController.resendResetPasswordOTP));

export default authRoute;
