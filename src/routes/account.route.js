import express from "express";
import accountController from "../controllers/account.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth, authorizePermissions } from "../middlewares/auth.js";

const accountRoute = express.Router();

accountRoute
  .route("/createAccount")
  .post(verifyAuth, catchError(accountController.createAccount));
accountRoute
  .route("/getSingleAccount/:accountId")
  .get(catchError(accountController.getOnlyOneAccount));
accountRoute
  .route("/getAllAccounts")
  .get(catchError(accountController.getAllAccounts));
accountRoute
  .route("/updateAccount/:accountId")
  .patch(verifyAuth, authorizePermissions("user"), catchError(accountController.updateAccount));
accountRoute
  .route("/deleteAccount/:accountId")
  .delete(verifyAuth, authorizePermissions("user"), catchError(accountController.deleteAccount));

// republish
accountRoute
  .route("/republish/:accountId")
  .patch(verifyAuth, authorizePermissions("admin"), catchError(accountController.republishAccount));

export default accountRoute;
