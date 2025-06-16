import * as withdrawService from "../services/withdraw.service.js";
import * as responser from "../core/responser.js";

class WithdrawController {
    createWithdraw = async (req, res) => {
        const reqData = req.body;
        reqData.userId = req.userId;
        const result = await withdrawService.createWithdraw(reqData);
        return responser.send(201, "Successfully Withdraw Requested", req, res, result);
    };

    getMyWithdraws = async (req, res) => {
        const result = await withdrawService.getAllWithdrawals(req.user);
        return responser.send(200, "User Withdraws Fetched", req, res, result);
    };

    getOneWithdraw = async (req, res) => {
        const result = await withdrawService.getOneWithdrawal(req.params.id);
        return responser.send(200, "User Singal Withdraw Fetched", req, res, result);
    };

    deleteWithdraw = async (req, res) => {
        const result = await withdrawService.deleteWithdrawal(req.params.id);
        return responser.send(200, "Deleted Withdraws Fetched", req, res, result);
    };

    // ADMIN: Get All Withdraws
    // getAllWithdrawsAdmin = async (req, res) => {
    //     const result = await withdrawService.getAllWithdrawsAdmin(req.query.status);
    //     return responser.send(200, "All Withdraws Fetched", req, res, result);
    // };

    // ADMIN: Update Withdraw Status
    // updateWithdrawStatus = async (req, res) => {
    //     const result = await withdrawService.updateWithdrawStatus(req.params.id, req.body.status);
    //     return responser.send(200, "Withdraw Status Updated", req, res, result);
    // };
}

export default new WithdrawController();
