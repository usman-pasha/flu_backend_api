import express from "express";
import promotionController from "../controllers/promotion.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth, authorizePermissions } from "../middlewares/auth.js";

const promotionRoute = express.Router();

promotionRoute
    .route("/createPromotion")
    .post(verifyAuth,
        authorizePermissions("admin"),
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
        authorizePermissions("admin"),
        catchError(promotionController.updatePromotion));

// Allow promotion deletion (creator or admin)
promotionRoute
    .route("/deletePromotion/:promotionId")
    .delete(verifyAuth,
        authorizePermissions("admin"),
        catchError(promotionController.deletePromotion));

promotionRoute
    .route("/applied-users")
    .get(catchError(promotionController.getAllAppliedUsersByStatus));

promotionRoute
    .route("/applied-counts")
    .get(catchError(promotionController.getAppliedUsersStatusCounts));

promotionRoute
    .route("/update-status/:promotionId")
    .patch(verifyAuth,
        catchError(promotionController.updatePromotionUserStatus));

promotionRoute
    .route("/active-promotion-status/:promotionId")
    .patch(verifyAuth,
        catchError(promotionController.activePromotionStatus));

promotionRoute
    .route("/promotionCountLast")
    .get(catchError(promotionController.countLast24HoursPromotions));

//-------------------------------------------------------------
// USER CONTROLLER STARTED FROM HERE ONWORDS 
//------------------------------------------------------------- 

// 1. Get Active Promotion
promotionRoute
    .route("/active")
    .get(catchError(promotionController.getActivePromotions));

// 2.
promotionRoute
    .route("/single/:promotionId")
    .get(catchError(promotionController.getSinglePromotionByUser));


// 3. apply 
promotionRoute
    .route("/apply/:promotionId")
    .patch(verifyAuth,
        catchError(promotionController.applyPromotion));

// 4. save
promotionRoute
    .route("/save/:promotionId")
    .patch(verifyAuth,
        catchError(promotionController.savePromotion));

// 5. Application status
promotionRoute
    .route("/by-status")
    .get(verifyAuth,
        catchError(promotionController.getPromotionsByApplicationStatus));

// 6. get All save
promotionRoute
    .route("/saved")
    .get(verifyAuth,
        catchError(promotionController.getPromotionsSaved));

promotionRoute
    .route("/profilePromotion")
    .post(
        catchError(promotionController.profileAndPromotion));

export default promotionRoute;
