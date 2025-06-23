import * as transactionService from "../services/transaction.service.js";
import * as responser from "../core/responser.js";

class TransactionController {

    // Create Transaction (Admin)
    createTransaction = async (req, res) => {
        const reqData = req.body
        reqData.userId = req.userId
        const result = await transactionService.createTransaction(reqData);
        return responser.send(201, "Transaction Created Successfully", req, res, result);
    };

    // Get All Transactions (Admin)
    getAllTransactionsAdmin = async (req, res) => {
        const result = await transactionService.getAllTransactionsByAdmin(req.query);
        return responser.send(200, "All Transactions Fetched", req, res, result);
    };

    // Get Single Transactions (Admin)
    getOneTransactionByAdmin = async (req, res) => {
        const result = await transactionService.getOneTransactionByAdmin(req.params.transactionId);
        return responser.send(200, "Single Transaction Fetched", req, res, result);
    };

    // Get My Transactions
    getMyTransactions = async (req, res) => {
        const result = await transactionService.getMyTransactions(req.user);
        return responser.send(200, "User Transactions Fetched", req, res, result);
    };

    // Delete My Transactions
    deleteTransactionById = async (req, res) => {
        const result = await transactionService.deleteTransactionById(req.params.transactionId);
        return responser.send(200, "User Transactions Fetched", req, res, result);
    };

}

export default new TransactionController();
