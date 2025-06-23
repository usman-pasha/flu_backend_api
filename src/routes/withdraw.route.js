import express from "express";
import WithdrawController from "../controllers/withdraw.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth, authorizePermissions } from "../middlewares/auth.js";

const withdrawRouter = express.Router();

// User Routes
withdrawRouter.use(verifyAuth);
withdrawRouter.post("/create", catchError(WithdrawController.createWithdraw));
withdrawRouter.get("/getAllMyWithdraw", catchError(WithdrawController.getMyWithdraws));
withdrawRouter.get("/signalWithdraw/:id", catchError(WithdrawController.getOneWithdraw));
withdrawRouter.delete("/deleteWithdraw/:id", catchError(WithdrawController.deleteWithdraw));

// Admin Routes
withdrawRouter.get("/admin/all", catchError(WithdrawController.getAllAdminWithdrawals));
withdrawRouter.get("/admin/counts", catchError(WithdrawController.getWithdrawStatusCounts));
withdrawRouter.patch("/admin/updateStatus/:id", catchError(WithdrawController.updateWithdrawalStatus));

export default withdrawRouter;
