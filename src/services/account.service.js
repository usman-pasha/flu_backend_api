import { accountModel } from "../models/account.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js"
import * as userService from "./user.service.js";
import APIFeatures from "../core/apiFeature.js";
import { uploadArrayImage, uploadOnCloudinary } from "../core/cloudImage.js";

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
        "facebookUrl",
        "instaUrl",
        "youtubeUrl",
        "facebookSubscriberCount",
        "instaFollowerCount",
        "youtubeSubscriberCount"
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
    };

    // Optional fields
    if (body.firstName) payloadData.firstName = body.firstName;
    if (body.lastName) payloadData.lastName = body.lastName;
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
    const account = await findOneRecord({ _id: record._id }, "", populateQuery)
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
        .exec(accountModel);
    console.log(record);
        
    return record.data;
};

export const getOnlyOneAccount = async (accountId) => {
    logger.info("START:Get only account");
    const populateQuery = [
        { path: "userId", select: ["_id", "username", "accountType", "email", "phoneNumber"] },
        { path: "createdBy", select: ["_id", "username", "accountType"] },
        { path: "updatedBy", select: ["_id", "username", "accountType"] }
    ];
    const account = await accountModel.findOne({ _id: accountId }).populate(populateQuery);;
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

