import { userModel } from "../models/user.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js"

export const createrecord = async (object) => {
    const record = await userModel.create(object);
    return record;
};

export const findOneRecord = async (conditions, select) => {
    const record = await userModel.findOne(conditions).select(select);
    return record;
};

export const findAllRecord = async (conditions, select) => {
    const record = await userModel.find(conditions).select(select);
    return record;
};

export const updateRecord = async (condition, body) => {
    const option = { new: true };
    const record = await userModel.findOneAndUpdate(condition, body, option);
    return record;
};

// 1. Get all bidder / auctioneer
export const getAllBidderOrAuctioneer = async (query) => {
    logger.info(`Query ${query}`)
    let condition = {}
    if (query.account === "bidder") {
        condition = {
            accountType: "Bidder",
            status: { $ne: "deleted" },
        }
    } else if (query.account === "auctioneer") {
        condition = {
            accountType: "Auctioneer",
            status: { $ne: "deleted" },
        }
    } else {
        throw new AppError(404, "Bidder Or Auctioneer Not Found");
    }
    const users = await findAllRecord(condition, "-password -__v");
    if (users.length === 0) {
        throw new AppError(404, `${query.account.toUpperCase()} Account Not Found`);
    }
    return users
}

// 2. get single bidder / auctioneer 
export const getSingleBidderOrAuctioneer = async (params) => {
    logger.info(`Get Single Bidder Or Auctioneer Method Started`)
    const condition = { _id: params.id }
    if (params.id) {
        const userId = await findOneRecord({
            _id: { $eq: params.id },
        });
        if (!userId) throw new AppError(404, "Bidder or Auctioneer Account Not Found");
    }
    const record = await findOneRecord(condition, "-password -__v");
    return record;
}

// 3. update bidder or auctioneer account 
export const updateAccount = async (body) => {
    logger.info(`Update Profile Method Started`);
    if (body.userId) {
        const user = await findOneRecord({
            _id: { $eq: body.userId },
        });
        if (!user) throw new AppError(404, "Bidder or Auctioneer Account Not Found");
    }
    let updateData = {
        // updatedBy: body.userId,
    };
    if (body.username) {
        const usernameIsExists = await findOneRecord({
            username: body.username,
            _id: { $ne: body.userId },
        });
        if (usernameIsExists) throw new AppError(400, "User Name exists already!");
        updateData.username = body.username;
    }
    if (body.fullName) updateData.fullName = body.fullName;
    if (body.profilePicture) updateData.profilePicture = body.profilePicture;
    if (body.email) updateData.email = body.email;
    if (body.phoneNumber) updateData.phoneNumber = body.phoneNumber;
    logger.data("update-data", updateData);
    const update = await updateRecord({ _id: body.userId }, updateData);
    update.password = undefined;
    return update;
}

// 4. delete bidder or auctioneer account 
export const deleteBidderOrAuctioneer = async (userId,) => {
    logger.info(`Account Delete Method Started`)
    const condition = {
        _id: userId,
    };
    const updateQuery = {
        // updatedBy: logInUserId,
        status: "deleted",
    };
    const user = await updateRecord(condition, updateQuery);
    if (!user) throw new AppError(404, "Record Not Found");
    return true;
}

export const getForAuthentication = async (condition) => {
    const record = await userModel.findOne({_id:condition.id}).select("-password");
    return record;
};