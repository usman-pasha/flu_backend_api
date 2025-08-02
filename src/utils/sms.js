import AppError from "../core/appError.js"
import config from '../config/index.js';
import * as logger from '../utils/log.js';
import axios from "axios";

export const smsOTPV2 = async (otp, phoneNumber) => {
    try {
        const data = {
            variables_values: otp,
            route: "otp",
            numbers: phoneNumber,
        };
        const configData = {
            method: "post",
            url: config.FAST2SMS,
            headers: {
                authorization: config.SMS_API_KEY,
            },
            data: data,
        };
        const response = await axios(configData);
        logger.data("axios", response.data);
        return response;
    } catch (err) {
        const errData = err?.response?.data?.message;
        throw new AppError(400, errData, "Error From Fast To Sms");
    }
};
