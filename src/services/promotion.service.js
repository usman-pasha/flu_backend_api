import { promotionModel } from "../models/promotion.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js";
import * as userService from "./user.service.js";
import APIFeatures from "../core/apiFeature.js";
import { uploadArrayImage, uploadOnCloudinary } from "../core/cloudImage.js";

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
    } = body;

    // Required field checks
    if (!compensation) throw new AppError(400, "Compensation is required");
    if (!deadline) throw new AppError(400, "Deadline is required");
    if (!platform) throw new AppError(400, "Platform is required");
    if (!location) throw new AppError(400, "Location is required");
    if (!body.brandNiche) throw new AppError(400, "Brand Niche is required");
    if (!body.brandLogo) throw new AppError(400, "Brand Logo is required");
    if (!body.brandName) throw new AppError(400, "Brand Name is required");
    if (!termsOfCollaboration) throw new AppError(400, "Terms of collaboration are required");
    if (body.promotionPicture) {
        const singlePicture = await uploadOnCloudinary(body.promotionPicture, "Promotion")
        body.promotionPicture = singlePicture?.secure_url
    }
    if (body.brandLogo) {
        const singlePicture = await uploadOnCloudinary(body.brandLogo, "BrandLogo")
        body.brandLogo = singlePicture?.secure_url
    }

    // Utility function to handle array image uploads
    const uploadImages = async (images, folder) => {
        const multiPictures = await uploadArrayImage(images, folder);
        return multiPictures
            .map(picture => picture?.cloudinaryResponse?.secure_url ? { img: picture?.cloudinaryResponse?.secure_url } : null)
            .filter(Boolean);
    };

    // Upload array images if present
    if (Array.isArray(body.promotionArrayPictures) && body.promotionArrayPictures.length > 0) {
        body.promotionArrayPictures = await uploadImages(body.promotionArrayPictures, "Promotion Array Pictures");
        if (body.promotionArrayPictures.length === 0) {
            throw new AppError(400, "Failed to upload array images");
        }
    }

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
        brandName: body.brandName,
        brandLogo: body.brandLogo,
        brandNiche: body.brandNiche,
        promotionPicture: body.promotionPicture,
        promotionArrayPictures: body.promotionArrayPictures,
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

    const record = await new APIFeatures(query)
        .filter()
        .orRegexMultipleSearch("searchFilter")
        .sort()
        .paginate()
        .populate(populateQuery)
        .exec(promotionModel);

    return record.data;
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