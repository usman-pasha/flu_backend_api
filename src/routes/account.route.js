import express from "express";
import accountController from "../controllers/account.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth, authorizePermissions } from "../middlewares/auth.js";

const accountRoute = express.Router();

accountRoute
  .route("/createAccount")
  .post(verifyAuth, catchError(accountController.createAccount));

// Anyone can view a single account (optional: protect if needed)
accountRoute
  .route("/getSingleAccount/:accountId")
  .get(catchError(accountController.getOnlyOneAccount));

// Get all accounts (optional: restrict to admin or specific roles)
accountRoute
  .route("/getAllAccounts")
  .get(verifyAuth, authorizePermissions("Admin"), catchError(accountController.getAllAccounts));

// Allow account update (owner or admin)
accountRoute
  .route("/updateAccount")
  .patch(verifyAuth, catchError(accountController.updateAccount));

// Allow account deletion (owner or admin)
accountRoute
  .route("/deleteAccount/:accountId")
  .delete(verifyAuth, catchError(accountController.deleteAccount));

export default accountRoute;
