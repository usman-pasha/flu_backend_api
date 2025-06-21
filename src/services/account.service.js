import { accountModel } from "../models/account.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js"
import * as userService from "./user.service.js";
import APIFeatures from "../core/apiFeature.js";
import * as walletService from "./wallet.service.js";
import { uploadArrayImage, uploadOnCloudinary } from "../core/cloudImage.js";
import mongoose from "mongoose";

// Generate a new Mongo ObjectId
// const newId = new mongoose.Types.ObjectId();
const newId = new mongoose.mongo.ObjectId();

export const createrecord = async (object) => {
    const record = await accountModel.create(object);
    return record;
};

export const findOneRecord = async (conditions, select, populateQuery) => {
    const record = await accountModel.findOne(conditions).select(select).populate(populateQuery);
    return record;
};

export const findAllRecord = async (conditions, select, populateQuery) => {
    const record = await accountModel.find(conditions).select(select).populate(populateQuery);
    return record;
};

export const updateRecord = async (condition, body) => {
    const option = { new: true, runValidators: true };
    const record = await accountModel.findOneAndUpdate(condition, body, option);
    return record;
};

export const createAccount = async (body, loggedInUser) => {
    logger.info("START: Creating account");
    // Validate required fields
    const requiredFields = [
        "dob",
        "gender",
        "city",
        "state",
        "areaOfWork",
    ];

    for (const field of requiredFields) {
        if (!body[field]) {
            throw new AppError(400, `${field} is required`);
        }
    }

    // Prepare payload
    const payloadData = {
        userId: loggedInUser._id,
        createdBy: loggedInUser._id,
        updatedBy: loggedInUser._id,
        accountStatus: "pending",
        profileCompleted: true,
        dob: body.dob,
        gender: body.gender,
        city: body.city,
        state: body.state,
        areaOfWork: body.areaOfWork,
        facebookUrl: body.facebookUrl,
        instaUrl: body.instaUrl,
        youtubeUrl: body.youtubeUrl,
        facebookSubscriberCount: body.facebookSubscriberCount,
        instaFollowerCount: body.instaFollowerCount,
        youtubeSubscriberCount: body.youtubeSubscriberCount,
        walletId: newId
    };

    // Optional fields
    if (body.firstName) payloadData.firstName = body.firstName;
    if (body.lastName) payloadData.lastName = body.lastName;
    if (body.facebookUrl) payloadData.facebookUrl = body.facebookUrl;
    if (body.instaUrl) payloadData.instaUrl = body.instaUrl;
    if (body.youtubeUrl) payloadData.youtubeUrl = body.youtubeUrl;
    if (body.facebookSubscriberCount) payloadData.facebookSubscriberCount = body.facebookSubscriberCount;
    if (body.instaFollowerCount) payloadData.instaFollowerCount = body.instaFollowerCount;
    if (body.youtubeSubscriberCount) payloadData.youtubeSubscriberCount = body.youtubeSubscriberCount;

    if (body.profilePicture) {
        const singlePicture = await uploadOnCloudinary(body.profilePicture, "Profile")
        payloadData.profilePicture = singlePicture?.secure_url
    }
    const record = await createrecord(payloadData);
    const populateQuery = [
        { path: "userId", select: ["_id", "username", "accountType", "email", "phoneNumber"] },
        { path: "createdBy", select: ["_id", "username", "accountType"] },
        { path: "updatedBy", select: ["_id", "username", "accountType"] }
    ];
    const account = await findOneRecord({ _id: record._id }, "", populateQuery);
    // TODO Create the wallet of the user
    await walletService.createWallet(account?._id, newId);
    return account;

};

// get all account 
export const getAllAccounts = async (query) => {
    logger.info("START:Get All Accounts");
    const populateQuery = [
        { path: "userId", select: ["_id", "username", "accountType", "email", "phoneNumber"] },
        { path: "createdBy", select: ["_id", "username", "accountType"] },
        { path: "updatedBy", select: ["_id", "username", "accountType"] }
    ];
    const record = await new APIFeatures(query)
        .filter()
        .orRegexMultipleSearch("searchFilter")
        .sort()
        .paginate()
        .populate(populateQuery)
        .limitFields(null, ['-__v'])
        .exec(accountModel);
    return record.data;
};

export const getOnlyOneAccount = async (accountId) => {
    logger.info("START:Get only account");
    const populateQuery = [
        { path: "userId", select: ["_id", "username", "accountType", "email", "phoneNumber"] },
        { path: "createdBy", select: ["_id", "username", "accountType"] },
        { path: "updatedBy", select: ["_id", "username", "accountType"] }
    ];
    const account = await accountModel.findOne({ _id: accountId }).select("-__v -savedPromotions").populate(populateQuery);;
    return account;
};

// update api
export const updateAccount = async (accountId, body) => {
    logger.info("START:Updating the account");

    const updatePayload = {
        updatedBy: body.userId,
    };

    if (body.dob) updatePayload.dob = body.dob;
    if (body.gender) updatePayload.gender = body.gender;
    if (body.city) updatePayload.city = body.city;
    if (body.state) updatePayload.state = body.state;
    if (body.areaOfWork) updatePayload.areaOfWork = body.areaOfWork;
    if (body.facebookUrl) updatePayload.facebookUrl = body.facebookUrl;
    if (body.instaUrl) updatePayload.instaUrl = body.instaUrl;
    if (body.youtubeUrl) updatePayload.youtubeUrl = body.youtubeUrl;
    if (body.facebookSubscriberCount) updatePayload.facebookSubscriberCount = body.facebookSubscriberCount;
    if (body.instaFollowerCount) updatePayload.instaFollowerCount = body.instaFollowerCount;
    if (body.youtubeSubscriberCount) updatePayload.youtubeSubscriberCount = body.youtubeSubscriberCount;
    if (body.firstName) payloadData.firstName = body.firstName;
    if (body.lastName) payloadData.lastName = body.lastName;
    if (body.profilePicture) {
        // If it's already a URL, just assign it
        if (body.profilePicture.startsWith("https://") || body.profilePicture.startsWith("http://")) {
            payloadData.profilePicture = body.profilePicture;
        } else {
            // If it's base64, upload it to Cloudinary
            const singlePicture = await uploadOnCloudinary(body.profilePicture, "Profile");
            payloadData.profilePicture = singlePicture?.secure_url;
        }
    }

    const record = await updateRecord({ _id: accountId }, updatePayload);
    if (!record) throw new AppError(404, "Account not found in collection");

    return record;
};

export const deleteAccount = async (accountId) => {
    logger.info("START:Deleting the account");
    const update = await accountModel.findOneAndDelete({ _id: accountId });
    if (!update) throw new AppError(404, "account not found in collection");
    return true;
};

export const ACCOUNT_STATUS = Object.freeze({
    APPROVED: "approved",
    REJECTED: "rejected"
});

// republish api 
export const republishAccount = async (accountId, body) => {
    logger.info("START: Republish the account");
    const updatePayload = {
        updatedBy: body.userId
    };

    switch (body.accountStatus) {
        case ACCOUNT_STATUS.REJECTED:
            if (!body.reasonForRejection) {
                throw new AppError(400, `Reason For Rejection is required`);
            }
            updatePayload.reasonForRejection = body.reasonForRejection;
            updatePayload.accountStatus = body.accountStatus;
            break;

        case ACCOUNT_STATUS.APPROVED:
            updatePayload.accountStatus = body.accountStatus;
            break;

        default:
            throw new AppError(400, `Invalid account status: ${body.accountStatus}`);
    }

    const record = await updateRecord({ _id: accountId }, updatePayload);
    if (!record) throw new AppError(404, "Account not found in collection");

    return record;
};

// get all status
export const getAllAccountsByStatus = async (query) => {
    const { status, page = 1, limit = 10 } = query;

    const validStatuses = ["pending", "approved", "rejected", "today"];
    const inputStatus = (status || "").trim().toLowerCase();

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Prepare match stage condition
    const matchStage = {};

    // Only add status filter if it's provided
    if (inputStatus) {
        if (!validStatuses.includes(inputStatus)) {
            throw new AppError(400, "Invalid status query parameter");
        }

        if (inputStatus === "today") {
            const date24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            matchStage.createdAt = { $gte: date24HoursAgo };
        } else {
            matchStage.accountStatus = inputStatus;
        }
    }

    // Build aggregation pipeline
    const aggregationPipeline = [];

    // Only add $match if matchStage contains any keys
    if (Object.keys(matchStage).length > 0) {
        aggregationPipeline.push({ $match: matchStage });
    }

    aggregationPipeline.push(
        {
            $project: {
                _id: 1,
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                profilePicture: 1,
                gender: 1,
                areaOfWork: 1,
                city: 1,
                state: 1,
                accountStatus: 1,
                reasonForRejection: 1,
                createdAt: 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: pageSize }
    );

    // Fetch data
    const result = await accountModel.aggregate(aggregationPipeline);

    // Total count pipeline
    const countPipeline = [];
    if (Object.keys(matchStage).length > 0) {
        countPipeline.push({ $match: matchStage });
    }
    countPipeline.push({ $count: "total" });

    const totalCountAgg = await accountModel.aggregate(countPipeline);
    const total = totalCountAgg[0]?.total || 0;

    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    return {
        docs: result,
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNumber + 1 : null,
        prevPage: hasPrevPage ? pageNumber - 1 : null
    };
};


// counts 
export const getAccountStatusCounts = async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Step 1: Get counts grouped by accountStatus
    const statusAggregation = await accountModel.aggregate([
        {
            $group: {
                _id: "$accountStatus",
                count: { $sum: 1 }
            }
        }
    ]);

    // Step 2: Get count for accounts created in the last 24 hours
    const todayAggregation = await accountModel.aggregate([
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
        approved: 0,
        rejected: 0,
        today: todayAggregation[0]?.today || 0
    };

    statusAggregation.forEach(entry => {
        if (statusCounts.hasOwnProperty(entry._id)) {
            statusCounts[entry._id] = entry.count;
        }
    });

    return statusCounts;
};

// get my account profile by loggedIn 
export const myAccountLoggedIn = async (loggedIn) => {
    const condition = {
        userId: loggedIn._id
    }
    const select = "-__v -savedPromotions";
    const populateData = [{ path: "userId", select: ["_id", "email", "phoneNumber", "username"] }]
    const account = await findOneRecord(condition, select, populateData);
    return account;
}