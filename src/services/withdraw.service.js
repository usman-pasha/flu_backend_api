import { withdrawModel } from "../models/withdraw.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js";
import * as accountService from "./account.service.js";
import * as upiService from "./upi.service.js";
import * as bankTransferService from "./bankTransfer.service.js";
import mongoose from "mongoose";

export const createRecord = async (object) => {
    const record = await withdrawModel.create(object);
    return record;
};

export const findOneRecord = async (conditions, select, populateQuery) => {
    const record = await withdrawModel.findOne(conditions)
        .select(select).populate(populateQuery);
    return record;
};

export const findAllRecord = async (conditions, select, populateQuery) => {
    const records = await withdrawModel.find(conditions)
        .select(select).populate(populateQuery);
    return records;
};

export const updateRecord = async (condition, body) => {
    const option = { new: true };
    const record = await withdrawModel.findOneAndUpdate(condition, body, option);
    return record;
};

// Create New Withdraw Request
export const createWithdraw = async (data) => {
    logger.info("START:Creating Withdraw In Service")
    if (!data.method || !['bankTransfer', 'upi'].includes(data.method)) {
        throw new AppError(400, "Withdrawal method must be either 'bankTransfer' or 'upi'");
    }
    if (!data.amount || data.amount < 1) {
        throw new AppError(400, "Withdrawal amount must be at least 1");
    }
    // Validate UPI method
    if (data.method === "upi") {
        if (!data.upiId) throw new AppError(400, "UPI ID is required for UPI withdrawal");
        if (!mongoose.Types.ObjectId.isValid(data.upiId)) throw new AppError(400, "Invalid UPI ID format");

        const upi = await upiService.findOneRecord({ _id: data.upiId });
        if (!upi) throw new AppError(404, "Invalid UPI ID");
    }

    // Validate Bank Transfer method
    if (data.method === "bankTransfer") {
        if (!data.bankTransferId) throw new AppError(400, "Bank Transfer ID is required for Bank Transfer withdrawal");
        if (!mongoose.Types.ObjectId.isValid(data.bankTransferId)) throw new AppError(400, "Invalid Bank Transfer ID format");

        const bank = await bankTransferService.findOneRecord({ _id: data.bankTransferId });
        if (!bank) throw new AppError(404, "Invalid Bank Transfer ID");
    }
    
    // account fetched
    const account = await accountService.findOneRecord({ userId: data.userId });
    if (!account) throw new AppError(404, "Account Not Found");
    const payload = {
        accountId: account._id,
        method: data.method,
        bankTransferId: data.bankTransferId,
        upiId: data.upiId,
        amount: data.amount,
        status: 'pending'
    };

    const created = await withdrawModel.create(payload);
    logger.info("END:Successfully Created Withdraw")
    return created;
};

// Get All Withdrawals for a user
export const getAllWithdrawals = async (loggedIn) => {
    const populateData = [
        { path: "accountId", select: ["_id", "firstName", "lastName", "userId"] },
        { path: "bankTransferId", select: ["_id", "accountNumber", "ifscCode", "accountHolderName", "bankName"] },
        { path: "upiId", select: ["_id", "upiId", "accountHolderName", "upiType"] }
    ];
    const account = await accountService.findOneRecord({ userId: loggedIn?._id });
    if (!account) throw new AppError(404, "Account Not Found");
    const withdrawals = await withdrawModel
        .find({ accountId: account._id })
        .populate(populateData)
        .sort({ createdAt: -1 });

    return withdrawals;
};

// Get One Withdrawal (admin or user)
export const getOneWithdrawal = async (withdrawId) => {
    const select = "-__v"
    const populateData = [
        { path: "accountId", select: ["_id", "firstName", "lastName", "userId"] },
        { path: "bankTransferId", select: ["_id", "accountNumber", "ifscCode", "accountHolderName", "bankName"] },
        { path: "upiId", select: ["_id", "upiId", "accountHolderName", "upiType"] }
    ];

    const withdrawal = await findOneRecord({ _id: withdrawId }, select, populateData)
    if (!withdrawal) throw new AppError(404, "Withdrawal not found");
    return withdrawal;
};

// Delete a Withdrawal (only if pending)
export const deleteWithdrawal = async (withdrawId) => {
    const withdrawal = await withdrawModel.findById(withdrawId);
    if (!withdrawal) throw new AppError(404, "Withdrawal not found");

    if (withdrawal.status !== "pending") {
        throw new AppError(400, "Only pending withdrawals can be deleted");
    }
    await withdrawModel.findByIdAndDelete(withdrawId);
    return true;
};
