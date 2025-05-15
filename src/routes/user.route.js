import express from "express";
import userController from "../controllers/user.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth } from "../middlewares/auth.js";

const userRoute = express.Router();

userRoute.route("/getForAuthentication").get(catchError(userController.getForAuthentication));
userRoute.route("/getAllBidderOrAuctioneer").get(catchError(userController.getAllBidderOrAuctioneer));
userRoute.route("/getSingleBidderOrAuctioneer/:id").get(catchError(userController.getSingleBidderOrAuctioneer));
userRoute.route("/updateAccount").patch(verifyAuth,catchError(userController.updateAccount));
userRoute.route("/deleteBidderOrAuctioneer").delete(verifyAuth,catchError(userController.deleteBidderOrAuctioneer));

export default userRoute;
