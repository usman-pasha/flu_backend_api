import * as userService from "./user.service.js";
import { firebaseModel } from "../models/firebase.model.js";
import { notificationModel } from "../models/notification.model.js";
import {
    hashPassword,
    compareHashPassword,
} from "../middlewares/token.js";
import AppError from "../core/appError.js"
import { createLogin, tokenVerify, updateToken } from "./token.service.js"
import { generateOTP } from "../utils/utils.js";
import * as logger from "../utils/log.js";
import { v4 as uuidv4 } from 'uuid';
import * as emailService from "../utils/nodemailer.js";
import * as accountService from "./account.service.js";
import { smsOTPV2 } from "../utils/sms.js";

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
    const generate = generateOTP();
    const payload = {
        username: uniqueUserName,
        emailOTP: generate,
        emailOtpExpiry: Date.now() + 5 * 60 * 1000,
        phoneOTP: generate,
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

    // Phone OTP
    await smsOTPV2(createUser.phoneOTP, createUser.phoneNumber);
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
    // Send OTP via phone or email
    if (body.type === 'phone') {
        // TODO: Enable SMS sending when service is ready
        await smsOTPV2(newOtp, user.phoneNumber);
        // await sendSms(user.phoneNumber, `Your verification code is: ${newOtp}`);
        logger.info(`SMS OTP sent to ${user.phoneNumber}: ${newOtp}`);
    } else if (body.type === 'email') {
        const emailPayload = {
            username: user.username,
            email: user.email,
            emailOTP: newOtp
        };
        emailService.resendEmailOTP(emailPayload)
            .then((res) => logger.data("Email Response..", res.response))
            .catch((err) => logger.error("sendEmailToUser", err));
    }
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
    await smsOTPV2(record.loginWithOtp, record.phoneNumber);
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
    // if (user.phoneIsVerified !== true) {
    //     throw new AppError(400, "Phone Number is not verified. Please verify your Number first.");
    // }
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

    const updateData = {
        $unset: {
            loginWithOtp: "",
            loginWithOtpExpiry: "",
        },
    };

    // If phone is not verified, mark it verified and remove phoneOTP fields
    if (!user.phoneIsVerified) {
        updateData.$set = {
            phoneIsVerified: true,
            status: "active",
        };
        updateData.$unset.phoneOTP = "";
        updateData.$unset.phoneOtpExpiry = "";
    }
    await userService.updateRecord({ _id: user._id }, updateData);

    // await userService.updateRecord({ _id: user._id }, {
    //     $unset: { loginWithOtp: "", loginWithOtpExpiry: "" }
    // });

    const loginToken = await createLogin(user);
    const account = await accountService.findOneRecord({ userId: user._id });
    const accountCompleted = account?.profileCompleted === true;
    // changed to account success
    let accountApproved;
    if (account?.accountStatus === null) {
        accountApproved = "still account not created"
    } else {
        accountApproved = account?.accountStatus
    }
    let accountRejected = account?.accountStatus === "rejected" ? account?.reasonForRejection : undefined;

    logger.info(`User ${user.phoneNumber} logged in successfully via phone OTP.`);

    return {
        ...loginToken,
        accountCompleted,
        accountApproved,
        accountRejected
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
    // if (user.emailIsVerified !== true) {
    //     throw new AppError(400, "Email is not verified. Please verify your email first.");
    // }

    // Compare the provided password with the stored password
    const isPasswordValid = compareHashPassword(body.password, user.password);
    if (!isPasswordValid) {
        throw new AppError(400, "Invalid password. Please try again.");
    }

    // Create and return the login token
    // const loginToken = await createLogin(user);
    // logger.info(`User ${user.email} logged in successfully.`);
    // const account = await accountService.findOneRecord({ userId: user._id });
    // const accountCompleted = account?.profileCompleted === true;
    // const profileCompleted = account?.profileCompleted === true ? "active" : "pending";

    logger.info(`User ${user.email} logged in successfully.`);
    const loginToken = await createLogin(user);
    const account = await accountService.findOneRecord({ userId: user._id });
    const accountCompleted = account?.profileCompleted === true;
    // changed to account success
    let accountApproved;
    if (account?.accountStatus === null) {
        accountApproved = "still account not created"
    } else {
        accountApproved = account?.accountStatus
    }
    let accountRejected = account?.accountStatus === "rejected" ? account?.reasonForRejection : undefined;

    logger.info(`User ${user.phoneNumber} logged in successfully via phone OTP.`);

    return {
        ...loginToken,
        accountCompleted,
        accountApproved,
        accountRejected
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

// 5.admin login with email and password 
export const adminLogin = async (body) => {
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

    return {
        ...loginToken,
    };
};

export const logout = async (header) => {
    const authHeader = header.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(401, "Unauthorized: No token provided");
    }
    const token = authHeader.split(" ")[1];
    // Decode token to get userId
    const decoded = await tokenVerify(token);
    const userId = decoded.id;

    logger.info(`User ${userId} is logging out`);

    // Mark token inactive only for this specific user and token
    await updateToken(
        { user: userId, jwtToken: token, status: 0 },
        { status: 1 }
    );
    return `${userId} is logging out`
};

export const storeFcmToken = async (body) => {
    logger.info(`Starting Storing Fcm Token`);

    if (!body.userId || !body.fcmToken) {
        throw new AppError(400, "UserId and fcmToken are required.");
    }
    const allowedDeviceTypes = ["android", "ios", "web", "unknown"];
    const deviceType = allowedDeviceTypes.includes(body.deviceType) ? body.deviceType : "unknown";
    const user = await userService.findOneRecord({ _id: body.userId }, "-password");
    if (!user) throw new AppError(404, "UserId Not Found");
    let tokenDoc = await firebaseModel.findOne({
        userId: user._id, fcmToken: body.fcmToken
    });

    if (!tokenDoc) {
        tokenDoc = await firebaseModel.create({
            userId: user._id,
            fcmToken: body.fcmToken,
            deviceType,
            updatedAt: new Date()
        });
    } else {
        let updated = false;
        if (tokenDoc.deviceType !== deviceType) {
            tokenDoc.deviceType = deviceType;
            updated = true;
        }
        tokenDoc.updatedAt = new Date();
        if (updated) await tokenDoc.save();
    }
    return tokenDoc;
};

export const getUserFcmTokens = async (userId) => {
    const tokens = await firebaseModel.find({ userId });
    return tokens.map(t => t.fcmToken);
};

// get My Notifications for user
export const getMyNotifications = async (loggedIn) => {
    if (!loggedIn?._id) throw new AppError(401, "Unauthorized Access");

    // condition to fetch notifications for this user
    const condition = {
        userId: loggedIn._id
    };

    // populate queries (adjust according to your schema)
    const populateQuery = [
        {
            path: "userId",
            select: ["_id", "username", "email"]
        }
    ];

    // fetch notifications
    const notifications = await notificationModel.find(condition)
        .populate(populateQuery)
        .sort({ createdAt: -1 })
        .select("-responses -tokens -successCount -failureCount");

    if (!notifications || notifications.length === 0)
        throw new AppError(404, "No Notifications Found");
    return notifications;
};
