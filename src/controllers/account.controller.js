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
        const data = await getAllAccounts(reqQuery);
        logger.info(data);
        return responser.send(200, `Successfully All Accounts Fetched`, req, res, data);
    };

    getOnlyOneAccount = async (req, res) => {
        const reqParams = req.params;
        const data = await getOnlyOneAccount(reqParams.accountId);
        logger.info(data);
        return responser.send(200, `Successfully Single Account Fetched`, req, res, data);
    };

    updateAccount = async (req, res) => {
        const reqData = req.body;
        const loggedInUser = req.user;
        const data = await accountService.updateAccount(reqData, loggedInUser);
        logger.info(data);
        return responser.send(200, `Successfully Account Updated`, req, res, data);
    };

    deleteAccount = async (req, res) => {
        const reqParams = req.params;
        const data = await deleteAccount(reqParams.accountId);
        logger.info(data);
        return responser.send(200, `Successfully Account Deleted`, req, res, data);
    };
}

export default new accountController();
