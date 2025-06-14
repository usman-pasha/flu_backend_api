import { promotionModel } from "../models/promotion.model.js";
import { accountModel } from "../models/account.model.js";
import * as logger from "../utils/log.js";
import AppError from "../core/appError.js";
import * as userService from "./user.service.js";
import APIFeatures from "../core/apiFeature.js";
import { uploadArrayImage, uploadOnCloudinary } from "../core/cloudImage.js";
import * as accountService from "./account.service.js";

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

// admin filter
export const getAllAppliedUsersByStatus = async (query) => {
    const { status, page = 1, limit = 10 } = query;

    const validStatuses = ["under review", "approved", "rejected", "today"];
    const inputStatus = (status || "").trim().toLowerCase();

    if (!validStatuses.includes(inputStatus)) {
        throw new AppError(400, "Invalid status query parameter");
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Prepare match condition
    const matchStage = {};
    if (inputStatus === "today") {
        const date24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        matchStage["appliedUsers.appliedAt"] = { $gte: date24HoursAgo };
    } else {
        matchStage["appliedUsers.status"] = inputStatus;
    }

    const result = await promotionModel.aggregate([
        { $unwind: "$appliedUsers" },
        { $match: matchStage },
        {
            $lookup: {
                from: "accounts",
                localField: "appliedUsers.accountId",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        { $unwind: "$userDetails" },
        {
            $project: {
                _id: 0,
                promotionId: "$_id",
                brandName: 1,
                brandNiche: 1,
                brandLogo: 1,
                promotionPicture: 1,
                platform: 1,
                deadline: 1,
                compensation: 1,
                status: "$appliedUsers.status",
                rejectedReason: "$appliedUsers.rejectedReason",
                fullName: {
                    $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"]
                },
                profilePicture: "$userDetails.profilePicture",
                location: "$userDetails.location",
                appliedAt: "$appliedUsers.appliedAt"
            }
        },
        { $skip: skip },
        { $limit: pageSize }
    ]);

    const total = await promotionModel.aggregate([
        { $unwind: "$appliedUsers" },
        { $match: matchStage },
        { $count: "total" }
    ]);
    const totalPages = Math.ceil(total / pageSize);
    return {
        docs: result,
        total: total[0]?.total || 0,
        page: pageNumber,
        limit: pageSize,
        totalPages
    };
};

// admin counts 
export const getAppliedUsersStatusCounts = async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Step 1: Get status-wise counts
    const statusAggregation = await promotionModel.aggregate([
        { $unwind: "$appliedUsers" },
        {
            $group: {
                _id: "$appliedUsers.status",
                count: { $sum: 1 }
            }
        }
    ]);

    // Step 2: Get count for entries applied in last 24 hours
    const todayAggregation = await promotionModel.aggregate([
        { $unwind: "$appliedUsers" },
        {
            $match: {
                "appliedUsers.appliedAt": { $gte: yesterday }
            }
        },
        {
            $count: "today"
        }
    ]);

    // Prepare response object
    const statusCounts = {
        "under review": 0,
        "approved": 0,
        "rejected": 0,
        "today": todayAggregation[0]?.today || 0
    };

    statusAggregation.forEach(entry => {
        statusCounts[entry._id] = entry.count;
    });

    return statusCounts
};

// update status admin
export const updatePromotionUserStatus = async (promotionId, body) => {
    logger.info("START: Update Promotion User Status");

    if (!promotionId || !body.status || !body.accountId) {
        throw new AppError(400, "Promotion ID, and status are required.");
    }

    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(body.status)) {
        throw new AppError(400, "Status must be either 'approved' or 'rejected'.");
    }

    // Check if user has applied to promotion
    const promotion = await promotionModel.findOne({
        _id: promotionId,
        "appliedUsers.accountId": body.accountId,
    });

    if (!promotion) {
        throw new AppError(404, "User application not found for this promotion.");
    }

    // Prepare fields to update
    const updateFields = {
        "appliedUsers.$.status": body.status,
    };

    if (body.status === "rejected") {
        updateFields["appliedUsers.$.rejectedReason"] = body.reason || "No reason provided";
        updateFields["appliedUsers.$.rejectedAt"] = new Date();
    }

    if (body.status === "approved") {
        updateFields["appliedUsers.$.approvedAt"] = new Date();
    }

    // Perform the update
    const result = await promotionModel.updateOne(
        {
            _id: promotionId,
            "appliedUsers.accountId": body.accountId,
        },
        {
            $set: updateFields,
        }
    );

    if (result.modifiedCount === 0) {
        throw new AppError(500, "Failed to update user application status.");
    }

    logger.info("END: Update Promotion User Status");
    return `User ${body.accountId} has been ${body.status} for promotion ${promotionId}`;
};

// change status of promotion
export const activePromotionStatus = async (promotionId, body) => {
    logger.info("START: Update Promotion User Status");

    if (!promotionId || !body.status) {
        throw new AppError(400, "Promotion ID, and status are required.");
    }

    const validStatuses = ["active"];
    if (!validStatuses.includes(body.status)) {
        throw new AppError(400, "Status must be either 'active'.");
    }

    // Check if user has applied to promotion
    const promotion = await promotionModel.findOne({
        _id: promotionId,
    });

    if (!promotion) {
        throw new AppError(404, "Promotion not found");
    }

    // Prepare fields to update
    const updateFields = {
        verificationStatus: body.status,
    };

    // Perform the update
    const result = await updateRecord({ _id: promotionId }, updateFields)

    logger.info("END: Update Promotion Status");
    return `${body.status} for promotion ${promotionId}`;
};

export const countLast24HoursPromotions = async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await promotionModel.countDocuments({
        createdAt: { $gte: twentyFourHoursAgo }
    });

    return { totalPromotionsCounts: count };
};


// ----------------------------------------------------------------
// USER Promotions
// ----------------------------------------------------------------

// 1. get only active promotion to user 
export const getActivePromotions = async (query) => {
    logger.info("START: Get All Active Promotions");
    const { page = 1, limit = 10 } = query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;
    const condition = {
        verificationStatus: "active"
    };
    // Fetch paginated results
    const result = await promotionModel
        .find(condition)
        .skip(skip)
        .limit(pageSize)
        .lean();

    // Count total matching documents
    const total = await promotionModel.countDocuments(condition);
    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;
    const nextPage = hasNextPage ? pageNumber + 1 : null;
    const prevPage = hasPrevPage ? pageNumber - 1 : null;
    logger.info("END: Get All Active Promotions");
    return {
        docs: result,
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage
    };
};

// 2. You Can Use Admin Get
export const getSinglePromotion = async (promotionId) => {
    logger.info("START:Get Single Promotion");
    const populateQuery = [
        { path: "createdBy", select: ["_id", "username", "accountType"] },
    ];
    const promotion = await promotionModel.findOne({ _id: promotionId }).populate(populateQuery).select("-appliedUsers -__v -updatedBy -updatedAt -createdAt");
    return promotion;
};

// 3. save promotion 
export const savePromotion = async (promotionId, loggedInUser) => {
    logger.info("START: Save Promotion");

    // Validate inputs
    if (!promotionId || !loggedInUser?._id) {
        throw new AppError(400, "Invalid promotionId or user.");
    }

    // Find the promotion
    const promotion = await promotionModel.findById(promotionId);
    if (!promotion) {
        throw new AppError(404, "Promotion Not Found");
    }
    // check in account model savedPromotions
    const account = await accountModel.findOne({ userId: loggedInUser?._id });

    // Check if user already saved
    if (account.savedPromotions.includes(promotion._id)) {
        logger.info("User has already saved this promotion.");
        throw new AppError(409, "User has already saved this promotion.");
    }

    // Add promotion to user's saved list
    await accountService.updateRecord(
        { userId: loggedInUser._id },
        { $addToSet: { savedPromotions: promotionId } },
    );

    logger.info("END: Save Promotion");
    return `Successfully saved promotion for user ${loggedInUser._id}`;
};

// 4. apply promotion 
export const applyPromotion = async (promotionId, loggedInUser) => {
    logger.info("START: Apply Promotion");
    // Validate inputs
    if (!promotionId || !loggedInUser?._id) {
        throw new AppError(400, "Invalid promotionId or user.");
    }
    const account = await accountService.findOneRecord({ userId: loggedInUser?._id })
    if (!account) throw new AppError(404, "Account Not Found.");
    // Find the promotion
    const promotion = await promotionModel.findById(promotionId);
    if (!promotion) {
        throw new AppError(404, "Promotion Not Found");
    }
    // Check if user already applied
    const alreadyApplied = promotion.appliedUsers.some(
        (appliedUser) => appliedUser.accountId.toString() === account._id.toString()
    );

    if (alreadyApplied) {
        logger.info("User has already applied for this promotion.");
        throw new AppError(409, "User has already applied for this promotion.");
    }
    // Push user with default status
    await promotionModel.findByIdAndUpdate(
        promotion._id,
        {
            $push: {
                appliedUsers: {
                    accountId: account._id,
                    status: "under review",
                },
            },
        },
        { new: true }
    );
    logger.info("END: Apply Promotion");
    return `Successfully applied promotion for user ${loggedInUser._id}`;
};

// 5. Application status
export const getPromotionsByApplicationStatus = async (query, loggedInUser) => {
    const { status, page = 1, limit = 10 } = query;
    const validStatuses = ["approved", "rejected", "under review"];
    const inputStatus = (status || "").trim().toLowerCase();

    if (!validStatuses.includes(inputStatus)) {
        throw new AppError(400, "Invalid status query parameter");
    }

    // Get account linked to user
    const account = await accountModel.findOne({ userId: loggedInUser._id });
    if (!account) throw new AppError(404, "Account Not Found");

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const promotions = await promotionModel.aggregate([
        { $unwind: "$appliedUsers" },
        {
            $match: {
                "appliedUsers.accountId": account._id,
                "appliedUsers.status": inputStatus
            }
        },
        {
            $project: {
                _id: 1,
                description: 1,
                promotionPicture: 1,
                brandLogo: 1,
                brandName: 1,
                location: 1,
                platform: 1,
                compensation: 1,
                deadline: 1,
                brandNiche: 1,
                appliedAt: "$appliedUsers.appliedAt",
                status: "$appliedUsers.status",

            }
        },
        { $sort: { appliedAt: -1 } },  // Sort by newest first
        { $skip: skip },
        { $limit: pageSize }
    ]);

    const countResult = await promotionModel.aggregate([
        { $unwind: "$appliedUsers" },
        {
            $match: {
                "appliedUsers.accountId": account._id,
                "appliedUsers.status": inputStatus
            }
        },
        { $count: "total" }
    ]);

    const total = countResult[0]?.total || 0;

    return {
        docs: promotions,
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
};

// 7.get save
export const getPromotionsSaved = async (query, loggedInUser) => {
    const { page = 1, limit = 10 } = query;
    logger.info("userId");
    logger.info(loggedInUser);

    // Get account linked to user
    const account = await accountModel.findOne({ userId: loggedInUser._id });
    logger.data("account", account)
    if (!account) throw new AppError(404, "Account Not Found");

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const savedPromotionIds = account.savedPromotions || [];

    const total = savedPromotionIds.length;
    const totalPages = Math.ceil(total / pageSize);

    // Slice savedPromotionIds for pagination
    const paginatedIds = savedPromotionIds.slice(skip, skip + pageSize);

    // Fetch promotion documents with fields you want
    const promotions = await promotionModel
        .find({ _id: { $in: paginatedIds } })
        .select("-createdBy -updatedBy -updatedAt -appliedUsers -__v") // Add/remove fields as needed
        .sort({ createdAt: -1 });

    return {
        docs: promotions,
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages
    };
};


// 9. get my account
// 10. update my account 
