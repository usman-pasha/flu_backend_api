import * as accountService from "../services/account.service.js";

import * as responser from "../core/responser.js";
import * as logger from "../utils/log.js";

class accountController {

    createAccount = async (req, res) => {
        const reqData = req.body;
        const loggedInUser = req.user;
        const data = await accountService.createAccount(reqData, loggedInUser);
        logger.info(data);
        return responser.send(200, `Successfully Account Created`, req, res, data);
    };
    getAllAccounts = async (req, res) => {
        const reqQuery = req.query;
        const data = await accountService.getAllAccounts(reqQuery);
        logger.info(data);
        return responser.send(200, `Successfully All Accounts Fetched`, req, res, data);
    };

    getOnlyOneAccount = async (req, res) => {
        const reqParams = req.params;
        const data = await accountService.getOnlyOneAccount(reqParams.accountId);
        logger.info(data);
        return responser.send(200, `Successfully Single Account Fetched`, req, res, data);
    };

    updateAccount = async (req, res) => {
        const reqParams = req.params;
        const reqData = req.body;
        reqData.userId = req.userId;
        const data = await accountService.updateAccount(reqParams.accountId, reqData);
        logger.info(data);
        return responser.send(200, `Successfully Account Updated`, req, res, data);
    };

    deleteAccount = async (req, res) => {
        const reqParams = req.params;
        const data = await accountService.deleteAccount(reqParams.accountId);
        logger.info(data);
        return responser.send(200, `Successfully Account Deleted`, req, res, data);
    };

    // republish
    republishAccount = async (req, res) => {
        const reqParams = req.params;
        const reqData = req.body;
        reqData.userId = req.userId;
        const data = await accountService.republishAccount(reqParams.accountId, reqData);
        logger.info(data);
        return responser.send(200, `Successfully Account Status Updated`, req, res, data);
    };

    getAllAccountsByStatus = async (req, res) => {
        const data = await accountService.getAllAccountsByStatus(req.query);
        logger.info(data);
        return responser.send(200, `Successfully Fetched All Accounts By Status`, req, res, data);
    };

    getAccountStatusCounts = async (req, res) => {
        const data = await accountService.getAccountStatusCounts()
        logger.info(data);
        return responser.send(200, `Successfully Fetched All Accounts Counts`, req, res, data);
    };

    myAccountLoggedIn = async (req, res) => {
        const loggedIn = req.user;
        const data = await accountService.myAccountLoggedIn(loggedIn)
        logger.info(data);
        return responser.send(200, `Successfully Fetched My Account`, req, res, data);
    };
}

export default new accountController();
