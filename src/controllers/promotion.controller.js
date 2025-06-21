import * as promotionService from "../services/promotion.service.js";

import * as responser from "../core/responser.js";
import * as logger from "../utils/log.js";

class promotionController {

    createPromotion = async (req, res) => {
        const reqData = req.body;
        const loggedInUser = req.user;
        const data = await promotionService.createPromotion(reqData, loggedInUser);
        logger.info(data);
        return responser.send(200, `Successfully Promotion Created`, req, res, data);
    };

    getAllPromotions = async (req, res) => {
        const reqQuery = req.query;
        const data = await promotionService.getAllPromotions(reqQuery);
        logger.info(data);
        return responser.send(200, `Successfully All Promotions Fetched`, req, res, data);
    };

    getOnlyOnePromotion = async (req, res) => {
        const reqParams = req.params;
        const data = await promotionService.getOnlyOnePromotion(reqParams.promotionId);
        logger.info(data);
        return responser.send(200, `Successfully Single Promotion Fetched`, req, res, data);
    };

    updatePromotion = async (req, res) => {
        const reqData = req.body;
        reqData.userId = req.user;
        const reqParams = req.params;
        const data = await promotionService.updatePromotion(reqParams.promotionId, reqData);
        logger.info(data);
        return responser.send(200, `Successfully Promotion Updated`, req, res, data);
    };

    deletePromotion = async (req, res) => {
        const reqParams = req.params;
        const data = await promotionService.deletePromotion(reqParams.promotionId);
        logger.info(data);
        return responser.send(200, `Successfully Promotion Deleted`, req, res, data);
    };

    getAllAppliedUsersByStatus = async (req, res) => {
        const data = await promotionService.getAllAppliedUsersByStatus(req.query);
        logger.info(data);
        return responser.send(200, `Successfully Fetched All Accounts`, req, res, data);
    };

    getAppliedUsersStatusCounts = async (req, res) => {
        const data = await promotionService.getAppliedUsersStatusCounts(req.query);
        logger.info(data);
        return responser.send(200, `Successfully Fetched All Counts`, req, res, data);
    };

    updatePromotionUserStatus = async (req, res) => {
        const reqData = req.body;
        reqData.userId = req.user;
        const reqParams = req.params;
        const data = await promotionService.updatePromotionUserStatus(reqParams.promotionId, reqData);
        logger.info(data);
        return responser.send(200, `Successfully Status Updated`, req, res, data);
    };

    activePromotionStatus = async (req, res) => {
        const reqData = req.body;
        reqData.userId = req.user;
        const reqParams = req.params;
        const data = await promotionService.activePromotionStatus(reqParams.promotionId, reqData);
        logger.info(data);
        return responser.send(200, `Successfully promotion Status Updated`, req, res, data);
    };

    countLast24HoursPromotions = async (req, res) => {
        const data = await promotionService.countLast24HoursPromotions();
        logger.info(data);
        return responser.send(200, `Successfully promotion counts fetched`, req, res, data);
    };

    //-------------------------------------------------------------
    // USER CONTROLLER STARTED FROM HERE ONWORDS 
    //------------------------------------------------------------- 
    // 1. 
    getActivePromotions = async (req, res) => {
        const reqQuery = req.query;
        const data = await promotionService.getActivePromotions(reqQuery);
        logger.info(data);
        return responser.send(200, `Successfully Active Promotions Fetched`, req, res, data);
    };
    // 2.
    getSinglePromotionByUser = async (req, res) => {
        const reqParams = req.params;
        const data = await promotionService.getSinglePromotion(reqParams.promotionId);
        logger.info(data);
        return responser.send(200, `Successfully Single Promotion Fetched`, req, res, data);
    };
    // 3. apply 
    applyPromotion = async (req, res) => {
        const reqParams = req.params;
        const loggedInUser = req.user;
        const data = await promotionService.applyPromotion(reqParams.promotionId, loggedInUser);
        logger.info(data);
        return responser.send(200, `Successfully Promotion Applied`, req, res, data);
    };

    // 4. save 
    savePromotion = async (req, res) => {
        const reqParams = req.params;
        const loggedInUser = req.user;
        const data = await promotionService.savePromotion(reqParams.promotionId, loggedInUser);
        logger.info(data);
        return responser.send(200, `Successfully Promotion Saved`, req, res, data);
    };

    // 5.Application Status  
    getPromotionsByApplicationStatus = async (req, res) => {
        const loggedIn = req.user
        const data = await promotionService.getPromotionsByApplicationStatus(req.query, loggedIn);
        logger.info(data);
        return responser.send(200, `Successfully Fetched Application Status`, req, res, data);
    };

    // 6.saved Promotion 
    getPromotionsSaved = async (req, res) => {
        const loggedIn = req.user
        const data = await promotionService.getPromotionsSaved(req.query, loggedIn);
        logger.info(data);
        return responser.send(200, `Successfully Fetched Saved Promotion`, req, res, data);
    };

    profileAndPromotion = async (req, res) => {
        const reqData = req.body;
        const data = await promotionService.profileAndPromotion(reqData);
        logger.info(data);
        return responser.send(200, `Successfully Fetched Promotion And Profile`, req, res, data);
    };


}

export default new promotionController();
