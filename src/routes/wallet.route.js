import express from "express";
import WalletController from "../controllers/wallet.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth, authorizePermissions } from "../middlewares/auth.js";

const walletRouter = express.Router();

// User routes
walletRouter.use(verifyAuth); // Ensure all routes require auth
walletRouter.get("/myWallet", catchError(WalletController.getMyWallet));

// Admin routes
walletRouter.get(
    "/admin/all",
    authorizePermissions("admin"), // Adjust roles as per your setup
    catchError(WalletController.getAllWalletsAdmin)
);

walletRouter.patch(
    "/admin/updateBalance",
    authorizePermissions("admin"),
    catchError(WalletController.updatedWalletBalance)
);

export default walletRouter;
