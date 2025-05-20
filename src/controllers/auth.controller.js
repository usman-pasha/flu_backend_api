import * as authService from "../services/auth.service.js";
import * as responser from "../core/responser.js";

class authController {
    // register Bidder
    registerUser = async (req, res) => {
        const reqData = req.body;
        const data = await authService.registerUser(reqData);
        console.log(data);
        return responser.send(201, `Successfully User Register`, req, res, data);
    };

    // validateEmailOTP
    validateOTP = async (req, res) => {
        const reqData = req.body;
        const data = await authService.validateOTP(reqData);
        console.log(data);
        return responser.send(200, "Successfully Validate OTP", req, res, data);
    }

    // resend
    resendOTP = async (req, res) => {
        const reqData = req.body;
        const data = await authService.resendOTP(reqData);
        console.log(data);
        return responser.send(200, `Successfully ${reqData.type} OTP Sent`, req, res, data);
    }

    // login 
    login = async (req, res) => {
        const reqData = req.body;
        const data = await authService.login(reqData);
        console.log(data);
        return responser.send(200, `Successfully ${data.accountType} Login`, req, res, data);
    };

    refreshLoginOtp = async (req, res) => {
        const reqData = req.body;
        const data = await authService.refreshLoginOtp(reqData);
        console.log(data);
        return responser.send(200, `Successfully ${reqData.phoneNumber} Login OTP Sent`, req, res, data);
    };

    loginWithPhoneOtp = async (req, res) => {
        const reqData = req.body;
        const data = await authService.loginWithPhoneOtp(reqData);
        console.log(data);
        return responser.send(200, `Successfully ${data.accountType} Logged In Via Phone OTP`, req, res, data);
    };

    // updatePassword 
    updatePassword = async (req, res) => {
        const reqData = req.body;
        reqData.userId = req.userId
        const data = await authService.updatePassword(reqData);
        console.log(data);
        return responser.send(200, "Successfully password updated", req, res, data);
    };

    // resetPassword
    resetPassword = async (req, res) => {
        const reqData = req.body;
        const data = await authService.resetPassword(reqData);
        console.log(data);
        return responser.send(200, "Successfully password reseted", req, res, data);
    };

    // resendResetPasswordOTP
    resendResetPasswordOTP = async (req, res) => {
        const reqData = req.body;
        const data = await authService.resendResetPasswordOTP(reqData);
        console.log(data);
        return responser.send(200, "Successfully password OTP sent!", req, res, data);
    };
}

export default new authController();
