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
}

export default new promotionController();
