import express from "express";
import encryptedController from "../controllers/encry.controller.js";
import catchError from "../utils/error/catchError.js"

const encryRouter = express.Router();

encryRouter.route("/encrypted").post(catchError(encryptedController.getEncryptText));
encryRouter.route("/decrypted").post(catchError(encryptedController.getDecryptText));

export default encryRouter;
