import { promotionModel } from "../models/promotion.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js";
import * as userService from "./user.service.js";

export const createRecord = async (object) => {
    const record = await promotionModel.create(object);
    return record;
};

export const findOneRecord = async (conditions, select, populateQuery) => {
    const record = await promotionModel.findOne(conditions)
        .select(select)
        .populate(populateQuery);
    return record;
};

export const findAllRecord = async (conditions, select, populateQuery) => {
    const record = await promotionModel.find(conditions)
        .select(select)
        .populate(populateQuery);
    return record;
};

export const updateRecord = async (condition, body) => {
    const option = { new: true, runValidators: true };
    const record = await promotionModel.findOneAndUpdate(condition, body, option);
    return record;
};

export const createPromotion = async (body, loggedIn) => {
    const {
        promotion,
        compensation,
        deadline,
        platform,
        location,
        termsOfCollaboration,
        description,
        donts,
        script,
        requirements,
        dos,
        links,
        engagementMetrics,
        promotionPicture
    } = body;

    // Required field checks
    if (!promotion) throw new AppError(400, "Promotion title is required");
    if (!compensation) throw new AppError(400, "Compensation is required");
    if (!deadline) throw new AppError(400, "Deadline is required");
    if (!platform) throw new AppError(400, "Platform is required");
    if (!location) throw new AppError(400, "Location is required");
    if (!termsOfCollaboration) throw new AppError(400, "Terms of collaboration are required");

    // Create record
    const payload = {
        promotion,
        compensation,
        deadline,
        platform,
        location,
        termsOfCollaboration,
        description,
        donts,
        script,
        requirements,
        dos,
        links,
        engagementMetrics,
        promotionPicture,
        createdBy: loggedIn._id,
        updatedBy: loggedIn._id,
    };
    const record = await createRecord(payload);
    return record;
};

// 
export const getAllPromotions = async (query) => {
    logger.info("START:Get All Promotions");

    const populateQuery = [
        { path: "createdBy", select: ["_id", "username", "accountType"] },
        { path: "updatedBy", select: ["_id", "username", "accountType"] }
    ];
    const condition = {}
    const promotion = await promotionModel
        .find(condition)
        .populate(populateQuery);
    if (promotion.length <= 0) throw new AppError(404, "Promotion Not Found");
    return promotion;
};

export const getOnlyOnePromotion = async (promotionId) => {
    logger.info("START:Get only Promotion");
    const populateQuery = [
        { path: "createdBy", select: ["_id", "username", "accountType"] },
        { path: "updatedBy", select: ["_id", "username", "accountType"] }
    ];
    const promotion = await promotionModel.findOne({ _id: promotionId }).populate(populateQuery);
    return promotion;
};

export const updatePromotion = async (promotionId, body) => {
    logger.info("START:Update Promotion");
    const condition = {
        _id: promotionId
    }
    const payload = {
        ...body,
        updatedBy: body.userId
    }
    const promotion = await updateRecord(condition, payload)
    if (promotion.length <= 0) throw new AppError(404, "Promotion Not Found");
    return promotion;
};

export const deletePromotion = async (promotionId) => {
    logger.info("START:Delete Promotion");
    const promotion = await promotionModel.findByIdAndDelete({ _id: promotionId });
    if (promotion.length <= 0) throw new AppError(404, "Promotion Not Found");
    return true;
};