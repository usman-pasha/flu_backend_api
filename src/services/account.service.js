import { accountModel } from "../models/account.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js"

export const createrecord = async (object) => {
    const record = await accountModel.create(object);
    return record;
};

export const findOneRecord = async (conditions, select) => {
    const record = await accountModel.findOne(conditions).select(select);
    return record;
};

export const findAllRecord = async (conditions, select) => {
    const record = await accountModel.find(conditions).select(select);
    return record;
};

export const updateRecord = async (condition, body) => {
    const option = { new: true };
    const record = await accountModel.findOneAndUpdate(condition, body, option);
    return record;
};

// account creating 
export const accountCreate = async (userId) => {
    const payload = {
        userId: userId
    }
    const record = await createrecord(payload);
    return record;
}