import { getForAuthentication, getAllBidderOrAuctioneer, getSingleBidderOrAuctioneer, updateAccount, deleteBidderOrAuctioneer } from "../services/user.service.js";
import * as responser from "../core/responser.js";
import * as logger from "../utility/log.js"

class userController {
    // register Bidder
    getForAuthentication = async (req, res) => {
        const reqQuery = req.query;
        const data = await getForAuthentication(reqQuery);
        logger.info(data)
        return responser.send(200, `Successfully Authentication Fetched`, req, res, data);
    };
    getAllBidderOrAuctioneer = async (req, res) => {
        const reqQuery = req.query;
        const data = await getAllBidderOrAuctioneer(reqQuery);
        logger.info(data)
        return responser.send(200, `Successfully All ${reqQuery.account} Fetched`, req, res, data);
    };

    // register Auctioneer
    getSingleBidderOrAuctioneer = async (req, res) => {
        const reqParams = req.params;
        const data = await getSingleBidderOrAuctioneer(reqParams);
        logger.info(data)
        return responser.send(200, `Successfully Single ${data.accountType} Fetched`, req, res, data);
    };

    updateAccount = async (req, res) => {
        const reqData = req.body;
        reqData.userId = req.userId
        const data = await updateAccount(reqData);
        logger.info(data)
        return responser.send(200, `Successfully ${data.accountType} Account Updated`, req, res, data);
    };

    deleteBidderOrAuctioneer = async (req, res) => {
        const logInUserId = req.userId;
        const data = await deleteBidderOrAuctioneer(logInUserId);
        logger.info(data)
        return responser.send(200, `Successfully ${data.accountType} Account Deleted`, req, res, data);
    };
}

export default new userController();
