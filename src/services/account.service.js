import { accountModel } from "../models/account.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js"
import * as userService from "./user.service.js";

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

// get all account 
export const getAllAccounts = async (query) => {
    logger.info("START:Get All Accounts");

    const populateQuery = [
        { path: "userId", select: ["_id", "username", "accountType", "email", "phoneNumber"] },
        { path: "createdBy", select: ["_id", "username", "accountType"] },
        { path: "updatedBy", select: ["_id", "username", "accountType"] }
    ];
    const condition = {
    };
    const account = await accountModel
        .find(condition)
        .populate(populateQuery);
    if (account.length <= 0) throw new AppError(404, "account Not Found");
    return account;
};

export const getOnlyOneaccount = async (accountId) => {
    logger.info("START:Get only account");
    const populateQuery = [
        { path: "userId", select: ["_id", "username", "accountType", "email", "phoneNumber"] },
        { path: "createdBy", select: ["_id", "username", "accountType"] },
        { path: "updatedBy", select: ["_id", "username", "accountType"] }
    ];
    const account = await accountModel.findOne({ _id: accountId }).populate(populateQuery);;
    return account;
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
    if (body.profilePicture) payloadData.profilePicture = body.profilePicture;

    const record = await createrecord(payloadData);
    const populateQuery = [
        { path: "userId", select: ["_id", "username", "accountType", "email", "phoneNumber"] },
        { path: "createdBy", select: ["_id", "username", "accountType"] },
        { path: "updatedBy", select: ["_id", "username", "accountType"] }
    ];
    const account = await findOneRecord({ _id: record._id }, "", populateQuery)
    return account;

};


export const deleteaccount = async (accountId) => {
    logger.info("START:Deleting the account");
    const update = await accountModel.findOneAndDelete({ _id: accountId });
    if (!update) throw new AppError(404, "account not found in collection");
    return true;
};
