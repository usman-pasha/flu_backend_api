import express from "express";
import promotionController from "../controllers/promotion.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth, authorizePermissions } from "../middlewares/auth.js";

const promotionRoute = express.Router();

promotionRoute
    .route("/createPromotion")
    .post(verifyAuth,
        authorizePermissions("user"),
        catchError(promotionController.createPromotion));

// Anyone can view a single promotion (optional: protect if needed)
promotionRoute
    .route("/getOnePromotion/:promotionId")
    .get(catchError(promotionController.getOnlyOnePromotion));

// Get all promotions (optional: restrict to admin or specific roles)
promotionRoute
    .route("/getAllPromotions")
    .get(catchError(promotionController.getAllPromotions));

// Allow promotion update (creator or admin)
promotionRoute
    .route("/updatePromotion/:promotionId")
    .patch(verifyAuth,
        authorizePermissions("user"),
        catchError(promotionController.updatePromotion));

// Allow promotion deletion (creator or admin)
promotionRoute
    .route("/deletePromotion/:promotionId ")
    .delete(verifyAuth,
        authorizePermissions("user"),
        catchError(promotionController.deletePromotion));

export default promotionRoute;
