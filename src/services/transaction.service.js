import { transactionModel } from "../models/transactionModel.js";
import { walletModel } from "../models/wallet.model.js";
import { withdrawModel } from "../models/withdraw.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js";
import APIFeatures from "../core/apiFeature.js";
import { uploadOnCloudinary } from "../core/cloudImage.js";
import * as accountService from "./account.service.js"

export const createTransaction = async (data) => {
    logger.info("Creating Transaction")
    // Validate required fields
    if (!data.accountId || !data.transId || !data.withdrawId) {
        throw new AppError(400, "Missing required fields for transaction");
    }

    // Upload screenshot if provided
    if (data.screenshot) {
        const singlePicture = await uploadOnCloudinary(data.screenshot, "Screenshot");
        data.screenshot = singlePicture?.secure_url;
    }

    // Fetch the wallet
    const wallet = await walletModel.findOne({ accountId: data.accountId });
    if (!wallet) {
        throw new AppError(404, "Wallet not found for this account");
    }
    const withdraw = await withdrawModel.findOne({ _id: data.withdrawId });
    logger.data(withdraw)
    if (!withdraw) {
        throw new AppError(404, "widthdraw not found for this account");
    }

    const amount = withdraw.amount;
    console.log("amount", amount);


    // Check balance before deduction
    if (wallet.balance < amount) {
        throw new AppError(400, "Insufficient wallet balance for this transaction");
    }

    // Deduct the amount from wallet balance
    const k = await walletModel.findOneAndUpdate(
        { _id: wallet._id },
        { $inc: { balance: -amount } }, // decrease balance
        { new: true }
    );
    // Prepare transaction payload
    const payload = {
        accountId: data.accountId,
        walletId: wallet._id,
        transId: data.transId,
        amount: amount,
        screenshot: data.screenshot || "",
        adminNotes: data.adminNotes || "",
        status: data.status || "approved",
        withdrawId: withdraw._id,
        createdBy: data.userId,
        updatedBy: data.userId,
    };
    // Save transaction
    const createdTransaction = await transactionModel.create(payload);
    return createdTransaction;
};

export const getOneTransactionByAdmin = async (transactionId) => {
    const populateData = [
        { path: "accountId", select: ["_id", "firstName", "lastName", "userId"] },
        { path: "walletId", select: ["_id", "balance"] },
        { path: "widthdrawId", select: ["_id", "processedAt", "requestedAt", "status", "amount", "method"] }
    ];
    const transaction = await transactionModel.findOne({ _id: transactionId })
        .populate(populateData)
        .select("-__v")
        .lean();
    if (!transaction) throw new AppError(404, "Transaction not found");
    return transaction;
};

export const getAllTransactionsByAdmin = async (query) => {
    // Populate config
    const populateData = [
        { path: "accountId", select: ["_id", "firstName", "lastName", "userId"] },
        { path: "walletId", select: ["_id", "balance"] },
        { path: "widthdrawId", select: ["_id", "processedAt", "requestedAt", "status", "amount", "method"] }
    ];

    const record = await new APIFeatures(query)
        .filter()
        .orRegexMultipleSearch("searchFilter")
        .sort()
        .paginate()
        .populate(populateData)
        .limitFields(null, ['-__v'])
        .exec(transactionModel);
    return record.data;
};

export const getMyTransactions = async (loggedIn) => {
    if (!loggedIn?._id) {
        throw new AppError(400, "User ID is required");
    }

    const account = await accountService.findOneRecord({ userId: loggedIn?._id });
    const populateData = [
        { path: "accountId", select: ["_id", "firstName", "lastName", "userId"] },
        { path: "walletId", select: ["_id", "balance"] },
        { path: "widthdrawId", select: ["_id", "processedAt", "requestedAt", "status", "amount", "method"] }
    ];
    const transactions = await transactionModel
        .find({ accountId: account._id })  // assuming accountId matches loggedIn._id
        .populate(populateData)
        .sort({ createdAt: -1 })
        .lean();

    if (!transactions || transactions.length === 0) {
        throw new AppError(404, "No transactions found for this user");
    }

    return transactions;
};

export const deleteTransactionById = async (id) => {
    const transaction = await transactionModel.findByIdAndDelete(id);
    if (!transaction) throw new AppError(404, "Transaction not found");
    return true;
};
