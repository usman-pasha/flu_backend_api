import express from "express";
import WithdrawController from "../controllers/withdraw.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth, authorizePermissions } from "../middlewares/auth.js";

const withdrawRouter = express.Router();

// User Routes
withdrawRouter.use(verifyAuth);
withdrawRouter.post("/create", catchError(WithdrawController.createWithdraw));
withdrawRouter.get("/getAllWithdraw", catchError(WithdrawController.getMyWithdraws));
withdrawRouter.get("/signalWithdraw/:id", catchError(WithdrawController.getOneWithdraw));
withdrawRouter.delete("/deleteWithdraw/:id", catchError(WithdrawController.deleteWithdraw));

// Admin Routes
// router.get("/admin/all", isAdmin, catchError(WithdrawController.getAllWithdrawsAdmin));
// router.patch("/admin/:id", isAdmin, catchError(WithdrawController.updateWithdrawStatus));

export default withdrawRouter;
