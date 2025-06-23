import { withdrawModel } from "../models/withdraw.model.js";
import { walletModel } from "../models/wallet.model.js";
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
    // account fetched
    const account = await accountService.findOneRecord({ userId: data.userId });
    if (!account) throw new AppError(404, "Account Not Found");

    const wallet = await walletModel.findOne({ accountId: account._id });
    if (!wallet) throw new AppError(404, "Wallet Not Found");

    const balance = wallet.balance;
    if (!data.amount || data.amount < 1) {
        throw new AppError(400, "Withdrawal amount must be at least 1");
    }
    // Check if balance is sufficient
    if (data.amount > balance) {
        throw new AppError(400, `Insufficient balance. Available balance: ${balance}`);
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


// ----------------------------------------------------------------
// ADMIN Withdraw
// ----------------------------------------------------------------

// 1. get all withdraw 
export const getAllAdminWithdrawals = async (query) => {
    const { status, page = 1, limit = 10 } = query;

    // Allowed statuses + "today"
    const validStatuses = ['pending', 'processing', 'completed', 'rejected', 'today'];
    const inputStatus = (status || "").trim().toLowerCase();

    // Validate status
    if (inputStatus && !validStatuses.includes(inputStatus)) {
        throw new AppError(400, "Invalid status query parameter");
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Prepare match stage
    const matchStage = {};
    if (inputStatus === "today") {
        const date24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        matchStage.createdAt = { $gte: date24HoursAgo };
    } else if (inputStatus) {
        matchStage.status = inputStatus;
    }

    // Pipeline for documents
    const pipeline = [{ $match: matchStage }];

    pipeline.push(
        {
            $lookup: {
                from: "accounts",
                localField: "accountId",
                foreignField: "_id",
                as: "account"
            }
        },
        { $unwind: "$account" },
        {
            $lookup: {
                from: "banktransfers",
                let: { bankTransferId: "$bankTransferId" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$bankTransferId"] } } },
                    {
                        $project: {
                            _id: 0,
                            accountNumber: 1,
                            cardName: 1,
                            ifscCode: 1,
                            accountHolderName: 1,
                            bankName: 1
                        }
                    }
                ],
                as: "bankTransfer"
            }
        },
        {
            $lookup: {
                from: "upis",
                let: { upiId: "$upiId" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$upiId"] } } },
                    {
                        $project: {
                            _id: 0,
                            upiType: 1,
                            upiHolderName: 1,
                            upiId: 1
                        }
                    }
                ],
                as: "upi"
            }
        },
        {
            $project: {
                _id: 1,
                account: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    userId: 1
                },
                bankTransfer: { $arrayElemAt: ["$bankTransfer", 0] },
                upi: { $arrayElemAt: ["$upi", 0] },
                method: 1,
                amount: 1,
                status: 1,
                requestedAt: 1,
                processedAt: 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: pageSize }
    );

    const docs = await withdrawModel.aggregate(pipeline);

    // Total count
    const countPipeline = [{ $match: matchStage }, { $count: "total" }];
    const totalCountResult = await withdrawModel.aggregate(countPipeline);
    const totalCount = totalCountResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        docs,
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        totalPages
    };
};

// 2. all counts 
export const getWithdrawStatusCounts = async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Step 1: Get counts grouped by status
    const statusAggregation = await withdrawModel.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    // Step 2: Get count for withdrawals created in the last 24 hours
    const todayAggregation = await withdrawModel.aggregate([
        {
            $match: {
                createdAt: { $gte: yesterday }
            }
        },
        {
            $count: "today"
        }
    ]);

    // Step 3: Format result
    const statusCounts = {
        pending: 0,
        processing: 0,
        completed: 0,
        rejected: 0,
        today: todayAggregation[0]?.today || 0
    };

    statusAggregation.forEach((entry) => {
        if (statusCounts.hasOwnProperty(entry._id)) {
            statusCounts[entry._id] = entry.count;
        }
    });

    return statusCounts;
};

// 3. update withdraw
export const updateWithdrawalStatus = async (withdrawId, status) => {
    const allowedStatuses = ['processing', 'completed', 'rejected'];
    if (!allowedStatuses.includes(status)) {
        throw new AppError(400, "Invalid status. Must be one of 'processing', 'completed', or 'rejected'.");
    }

    // Prepare `updateData`
    const updateData = { status };
    if (status === 'completed') {
        updateData.processedAt = new Date();
    }

    const populateData = [
        { path: "accountId", select: ["_id", "firstName", "lastName", "userId"] },
        { path: "bankTransferId", select: ["_id", "accountNumber", "ifscCode", "accountHolderName", "bankName"] },
        { path: "upiId", select: ["_id", "upiId", "accountHolderName", "upiType"] }
    ];

    // Find and update the withdrawal status
    const updatedWithdrawal = await withdrawModel
        .findOneAndUpdate(
            { _id: withdrawId },
            updateData,
            { new: true }
        )
        .populate(populateData);

    if (!updatedWithdrawal) {
        throw new AppError(404, "Withdrawal not found");
    }

    return updatedWithdrawal;
};
