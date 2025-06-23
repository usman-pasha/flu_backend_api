import { walletModel } from "../models/wallet.model.js";
import { promotionModel } from "../models/promotion.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js"
import APIFeatures from "../core/apiFeature.js";
import * as accountService from "./account.service.js";

export const createrecord = async (object) => {
    const record = await walletModel.create(object);
    return record;
};

export const findOneRecord = async (conditions, select, populateQuery) => {
    const record = await walletModel.findOne(conditions).select(select).populate(populateQuery);
    return record;
};

export const findAllRecord = async (conditions, select, populateQuery) => {
    const record = await walletModel.find(conditions).select(select).populate(populateQuery);
    return record;
};

export const updateRecord = async (condition, body) => {
    const option = { new: true, runValidators: true };
    const record = await walletModel.findOneAndUpdate(condition, body, option);
    return record;
};

// create the default wallet for the user 
export const createWallet = async (accountId, id) => {
    const payload = {
        _id: id,
        accountId: accountId
    }
    const wallet = await createrecord(payload);
    return wallet;
}

// get My wallet for user
export const getMyWallet = async (loggedIn) => {
    const account = await accountService.findOneRecord({ userId: loggedIn?._id });
    if (!account) throw new AppError(404, `Account Not Found.For This ${loggedIn?._id} Id`);
    const condition = {
        accountId: account?._id
    }
        const populateQuery = [
        {
            path: "promotionIds",
            select: ["_id", "compensation", "location", "brandLogo", "brandNiche", "brandName"],
            options: { sort: { compensation: -1 } }
        },
        {
            path: "accountId",
            select: ["_id", "firstName", "lastName", "profilePicture", "userId"],
            populate: {
                path: "userId",
                select: ["_id", "username", "email", "phoneNumber"] // adjust fields as needed
            }
        }
    ];
    const wallet = await findOneRecord(condition, "-__v", populateQuery);
    if (!wallet) throw new AppError(404, "Wallet Not Found")
    return wallet;
}

// get all wallet for admin
export const getAllWalletsByAdmin = async (query) => {
    const populateQuery = [
        {
            path: "promotionIds",
            select: ["_id", "compensation", "location", "brandLogo", "brandNiche", "brandName"],
            options: { sort: { compensation: -1 } }
        },
        {
            path: "accountId",
            select: ["_id", "firstName", "lastName", "profilePicture", "userId"],
            populate: {
                path: "userId",
                select: ["_id", "username", "email", "phoneNumber"] // adjust fields as needed
            }
        }
    ];

    // Fetch all wallets
    const wallets = await walletModel.find({}, "-__v").populate(populateQuery);
    if (!wallets || wallets.length === 0) {
        throw new AppError(404, "No wallets found");
    }
    return wallets;
};


// admin can increance the balance amount
export const updatedWalletBalance = async (body) => {
    const { accountId, promotionId } = body;

    if (!accountId || !promotionId) {
        throw new AppError(400, 'accountId and promotionId are required.');
    }

    // 1️⃣ Find promotion with approved account
    const promotion = await promotionModel.findOne({
        $and: [
            { _id: promotionId },
            { 'appliedUsers.accountId': accountId },
            { 'appliedUsers.status': 'approved' }
        ]
    });

    if (!promotion) {
        throw new AppError(404, 'Promotion not found or account is not approved for this promotion.');
    }

    const amount = promotion.compensation;
    // 2️⃣ Find or create wallet
    const wallet = await walletModel.findOne({ accountId });

    if (!wallet) {
        throw new AppError(404, "Wallet Not Found")
    }

    const updatedWallet = await walletModel.findOneAndUpdate(
        { accountId }, // find condition
        {
            $addToSet: { promotionIds: promotionId },
            $inc: { balance: amount }
        },
        { new: true }
    );

    return {
        message: `Wallet updated successfully with ₹${amount}.`,
        wallet: updatedWallet
    };
};

