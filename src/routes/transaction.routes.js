import express from "express";
import TransactionController from "../controllers/transaction.controller.js";
import catchError from "../core/catachError.js";
import { verifyAuth, authorizePermissions } from "../middlewares/auth.js";

const transactionRouter = express.Router();

// User routes
transactionRouter.use(verifyAuth); // Ensure all routes require auth
transactionRouter.get("/myTransactions", catchError(TransactionController.getMyTransactions));
transactionRouter.delete("/myTransactions/:transactionId", catchError(TransactionController.deleteTransactionById));

// Admin routes
transactionRouter.get(
    "/admin/all",
    authorizePermissions("admin"), // restrict to admins
    catchError(TransactionController.getAllTransactionsAdmin)
);

transactionRouter.post(
    "/admin/create",
    authorizePermissions("admin"),
    catchError(TransactionController.createTransaction)
);

transactionRouter.get(
    "/admin/:transactionId",
    authorizePermissions("admin"),
    catchError(TransactionController.getOneTransactionByAdmin)
);

export default transactionRouter;
