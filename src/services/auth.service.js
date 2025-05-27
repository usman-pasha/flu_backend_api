import * as userService from "./user.service.js";
import {
    hashPassword,
    compareHashPassword,
} from "../middlewares/token.js";
import AppError from "../core/appError.js"
import { createLogin } from "./token.service.js"
import { generateOTP } from "../utils/utils.js";
import * as logger from "../utils/log.js";
import { v4 as uuidv4 } from 'uuid';
import * as tokenService from "./token.service.js";
import * as emailService from "../utils/nodemailer.js";
import * as accountService from "./account.service.js";

// 1.Register User
export const registerUser = async (body) => {
    if (!body.email || !body.password || !body.phoneNumber) {
        throw new AppError(404, "Required Paramaters");
    }
    const user = await userService.findOneRecord(
        {
            $or: [{ phoneNumber: body.phoneNumber }, { email: body.email }],
        },
        "-password"
    );
    if (user) throw new AppError(404, "User Email Or phoneNumber already exists");
    const uniqueUserName = `USR${uuidv4()
        .toUpperCase()
        .replace(/-/g, "")
        .substring(0, 9)}`;
    const payload = {
        username: uniqueUserName,
        emailOTP: generateOTP(),
        emailOtpExpiry: Date.now() + 5 * 60 * 1000,
        phoneOTP: generateOTP(),
        phoneOtpExpiry: Date.now() + 5 * 60 * 1000,
        accountType: "user"
    };
    if (body.email) payload.email = body.email;
    if (body.phoneNumber) payload.phoneNumber = Number(body.phoneNumber);
    if (body.password) {
        const password = hashPassword(body?.password);
        payload.password = password;
    }
    const createUser = await userService.createrecord(payload);
    // TODO Email OTP 
    const emailPayload = {
        username: createUser.username,
        email: createUser.email,
        emailOTP: createUser.emailOTP
    }
    emailService.sendVerificationEmail(emailPayload)
        .then((res) => logger.data("Email Response..", res.response))
        .catch((err) => logger.error("sendEmailToUser", err));
    const record = await userService.findOneRecord(
        { _id: createUser?._id },
        "-password -__v -createdAt -updatedAt -phoneOtpExpiry -emailOtpExpiry -emailOTP"
    );
    return record;
};

export const validateOTP = async (body) => {
    logger.info("Validate OTP");

    const { type, phoneNumber, email, phoneOTP, emailOTP } = body;

    if (!type || !["phone", "email"].includes(type)) {
        throw new AppError(400, "Invalid type. Must be 'phone' or 'email'.");
    }

    // Determine filter and fields based on type
    const isPhone = type === "phone";
    const filter = isPhone ? { phoneNumber } : { email };
    const otpField = isPhone ? "phoneOTP" : "emailOTP";
    const otpExpiryField = isPhone ? "phoneOtpExpiry" : "emailOtpExpiry";
    const isVerifiedField = isPhone ? "phoneIsVerified" : "emailIsVerified";
    const providedOtp = isPhone ? phoneOTP : emailOTP;

    // Validate inputs
    if (!filter[Object.keys(filter)[0]] || !providedOtp) {
        throw new AppError(400, `Please provide ${isPhone ? "phoneNumber and phoneOTP" : "email and emailOTP"}!`);
    }

    // Fetch user
    const user = await userService.findOneRecord(filter);
    if (!user) {
        throw new AppError(404, "You're not an existing user. Register first!");
    }

    // Check OTP expiry
    if (Date.now() > new Date(user[otpExpiryField])) {
        await userService.updateRecord({ _id: user._id }, {
            $unset: { [otpField]: "" }
        });
        throw new AppError(400, "OTP has expired. Try resending it!");
    }

    // Match OTP
    if (String(providedOtp) !== String(user[otpField])) {
        throw new AppError(400, "Invalid OTP. Try again!");
    }

    // Success: update verification status
    await userService.updateRecord({ _id: user._id }, {
        $set: {
            [isVerifiedField]: true,
            status: "active"
        },
        $unset: {
            [otpField]: "",
            [otpExpiryField]: ""
        }
    });

    return `OTP validation successful for ${isPhone ? user.phoneNumber : user.email}!`;
};


// 3.Function to resend OTP
export const resendOTP = async (body) => {
    logger.info("START: Resend OTP Started");
    // Generate a new OTP and expiry
    const newOtp = generateOTP();
    const newExpiry = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
    let filter = {};
    let updateFields = {};
    switch (body.type) {
        case "phone":
            filter.phoneNumber = body.phoneNumber;
            updateFields = {
                $set: { phoneOTP: newOtp, phoneOtpExpiry: newExpiry }
            };
            break;
        case "email":
            filter.email = body.email;
            updateFields = {
                $set: { emailOTP: newOtp, emailOtpExpiry: newExpiry }
            };
            break;
        default:
            throw new AppError(404, "Invalid type! Please provide 'phone' or 'email'.");
    }

    // Find the user based on phone number or email
    const user = await userService.findOneRecord(filter);
    if (!user) {
        throw new AppError(404, "User not found. Please register first!");
    }

    // Update the OTP and expiry in the database
    const _r = await userService.updateRecord({ _id: user._id }, updateFields);
    // TODO New Email OTP
    return `Successfully sent new OTP to ${body.type === 'phone' ? user.phoneNumber : user.email} | OTP is ${_r.phoneOTP}!`;
};

// 4 refreshLoginPhoneOtp
export const refreshLoginOtp = async (body) => {
    logger.info("Refresh service Starting");
    const filter = { phoneNumber: body.phoneNumber };
    const user = await userService.findOneRecord(filter);
    if (!user) {
        throw new AppError(400, "User not found with the provided Phone Number.");
    }
    const newOtp = generateOTP();
    const newExpiry = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
    const updateFields = {
        $set: { loginWithOtp: newOtp, loginWithOtpExpiry: newExpiry }
    };
    const record = await userService.updateRecord(
        { _id: user._id }, updateFields
    );
    // await sms.smsOTPV2(record);
    logger.info(record);
    return `Successfully sent new Login OTP to ${user.phoneNumber} | OTP is ${record.loginWithOtp}!`;
};

export const loginWithPhoneOtp = async (body) => {
    if (!body.phoneNumber || !body.loginWithOtp) {
        throw new AppError(400, "Phone Number and OTP are required.");
    }

    const user = await userService.findOneRecord({ phoneNumber: body.phoneNumber });
    if (!user) throw new AppError(400, "User not found with the provided Phone Number.");

    // Check if the phone number is verified
    if (user.phoneIsVerified !== true) {
        throw new AppError(400, "Phone Number is not verified. Please verify your Number first.");
    }
    if (user.status === "deleted") {
        throw new AppError(400, "User Account is deleted. Contact Admin.");
    }

    if (Date.now() > new Date(user.loginWithOtpExpiry)) {
        await userService.updateRecord({ _id: user._id }, { $unset: { loginWithOtp: "", loginWithOtpExpiry: "" } });
        throw new AppError(400, "Login OTP has expired. Try resending it.");
    }

    if (String(body.loginWithOtp) !== String(user.loginWithOtp)) {
        throw new AppError(400, "Invalid OTP. Try again.");
    }

    await userService.updateRecord({ _id: user._id }, {
        $unset: { loginWithOtp: "", loginWithOtpExpiry: "" }
    });

    const loginToken = await createLogin(user);
    const account = await accountService.findOneRecord({ userId: user._id });
    const accountCompleted = account?.profileCompleted === true;
    const profileCompleted = account?.profileCompleted === true ? "active" : "pending";

    logger.info(`User ${user.phoneNumber} logged in successfully via phone OTP.`);

    return {
        ...loginToken,
        accountCompleted,
        profileCompleted
    };
}

// 5.login with email and password 
export const login = async (body) => {
    logger.info("Login Service Started");

    // Check if phone number and password are provided
    if (!body.email || !body.password) {
        throw new AppError(404, "Email and Password are required.");
    }

    // Find the user by phone number
    const user = await userService.findOneRecord({ email: body.email });
    if (!user) {
        throw new AppError(400, "User not found with the provided Email.");
    }
    if (user.status === "deleted") {
        throw new AppError(400, "User Account Is Deleted. Try to contact Admin");
    }

    // Check if the phone number is verified
    if (user.emailIsVerified !== true) {
        throw new AppError(400, "Email is not verified. Please verify your email first.");
    }

    // Compare the provided password with the stored password
    const isPasswordValid = compareHashPassword(body.password, user.password);
    if (!isPasswordValid) {
        throw new AppError(400, "Invalid password. Please try again.");
    }

    // Create and return the login token
    const loginToken = await createLogin(user);
    logger.info(`User ${user.email} logged in successfully.`);
    const account = await accountService.findOneRecord({ userId: user._id });
    const accountCompleted = account?.profileCompleted === true;
    const profileCompleted = account?.profileCompleted === true ? "active" : "pending";

    logger.info(`User ${user.phoneNumber} logged in successfully via phone OTP.`);

    return {
        ...loginToken,
        accountCompleted,
        profileCompleted
    };
};

// 5.Update Password API
export const updatePassword = async (body) => {
    logger.info("Password Update Service Started");

    const { currentPassword, newPassword, userId } = body;

    if (!currentPassword || !newPassword) {
        throw new AppError(400, "Current password and new password are required.");
    }

    // Fetch user by ID
    const user = await userService.findOneRecord({ _id: userId });
    if (!user) {
        throw new AppError(404, "User not found.");
    }

    // Compare the current password with the stored password
    const isPasswordValid = compareHashPassword(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new AppError(400, "Current password is incorrect.");
    }

    // Hash the new password and update it
    const hashedNewPassword = hashPassword(newPassword);
    await userService.updateRecord({ _id: userId }, { $set: { password: hashedNewPassword } });

    logger.info(`User ${user.phoneNumber || user.email} updated their password successfully.`);
    return "Password updated successfully.";
};

// 6.Reset Password API
export const resetPassword = async (body) => {
    logger.info("Password Reset Service Started");

    const { identifier, otp, newPassword, type } = body;

    if (!identifier || !otp || !newPassword || !type) {
        throw new AppError(400, "Identifier (phone or email), OTP, new password, and type are required.");
    }

    let filter = {};
    let otpField = '';
    let otpExpiryField = '';

    // Determine if the user is resetting via phone or email
    if (type === 'phone') {
        filter = { phoneNumber: identifier };
        otpField = 'resetPasswordPhoneOtp';
        otpExpiryField = 'resetPasswordExpire';
    } else if (type === 'email') {
        filter = { email: identifier };
        otpField = 'resetPasswordEmailOtp';
        otpExpiryField = 'resetPasswordExpire';
    } else {
        throw new AppError(400, "Invalid type. Please provide 'phone' or 'email'.");
    }

    // Fetch the user by phone or email
    const user = await userService.findOneRecord(filter);
    if (!user) {
        throw new AppError(404, `User not found with the provided ${type}.`);
    }

    // Check if OTP is valid and not expired
    if (Date.now() > user[otpExpiryField]) {
        throw new AppError(400, "OTP has expired. Please request a new OTP.");
    }

    if (String(user[otpField]) !== String(otp)) {
        throw new AppError(400, "Invalid OTP.");
    }

    // Hash the new password and update the user record
    const hashedNewPassword = hashPassword(newPassword);
    await userService.updateRecord({ _id: user._id }, {
        $set: { password: hashedNewPassword },
        $unset: { [otpField]: "", [otpExpiryField]: "" }
    });

    logger.info(`User ${user.phoneNumber || user.email} reset their password successfully.`);
    return "Password reset successfully.";
};

// 7.Resend Reset Password OTP API
export const resendResetPasswordOTP = async (body) => {
    logger.info("Resend Reset Password OTP Service Started");

    const { identifier, type } = body;

    if (!identifier || !type) {
        throw new AppError(400, "Identifier (phone or email) and type are required.");
    }

    let filter = {};
    let otpField = '';
    let otpExpiryField = '';
    let otpMessage = '';

    // Determine if the user is resending OTP via phone or email
    if (type === 'phone') {
        filter = { phoneNumber: identifier };
        otpField = 'resetPasswordPhoneOtp';
        otpExpiryField = 'resetPasswordExpire';
        otpMessage = `Your reset password OTP is: `; // Message template for OTP
    } else if (type === 'email') {
        filter = { email: identifier };
        otpField = 'resetPasswordEmailOtp';
        otpExpiryField = 'resetPasswordExpire';
        otpMessage = `Your reset password OTP is: `; // Message template for OTP
    } else {
        throw new AppError(400, "Invalid type. Please provide 'phone' or 'email'.");
    }

    // Fetch the user by phone or email
    const user = await userService.findOneRecord(filter);
    if (!user) {
        throw new AppError(404, `User not found with the provided ${type}.`);
    }

    // Generate a new OTP and expiry time (e.g., 5 minutes)
    const newOtp = generateOTP(); // Function to generate OTP (e.g., 6 digits)
    const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

    // Update the user record with the new OTP and expiry time
    await userService.updateRecord({ _id: user._id }, {
        $set: {
            [otpField]: newOtp,
            [otpExpiryField]: otpExpiry
        }
    });

    // Send OTP via phone or email
    if (type === 'phone') {
        // Code to send OTP to the user's phone
        // await sendSms(user.phoneNumber, `${otpMessage} ${newOtp}`);
    } else if (type === 'email') {
        const emailPayload = {
            username: user.username,
            email: user.email,
            emailOTP: newOtp
        }
        emailService.resendResetPasswordOTP(emailPayload)
            .then((res) => logger.data("Email Response..", res.response))
            .catch((err) => logger.error("sendEmailToUser", err));
    }

    logger.info(`Resent reset password OTP to ${user.phoneNumber || user.email} successfully.`);
    return `OTP sent successfully to ${identifier}.`;
};