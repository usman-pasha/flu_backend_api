import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";
import config from "../config/index.js";

export const verifyAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token)
            if (!token) {
                return res.status(401).json({
                    status: false,
                    message: "Authorization token is required"
                });
            }
        const decodedToken = jwt.verify(token, config.ACCESS_SECRET);
        const user = await userModel.findOne(
            { _id: decodedToken?.id },
            { username: 1, _id: 1, accountType: 1 }
        );
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Invalid token. User not found"
            });
        }
        req.user = user;
        req.userId = decodedToken?.id;
        next();
    } catch (error) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized: " + error.message
        });
    }
};

export const authorizePermissions = (...allowedAccountTypes) => {
    return (req, res, next) => {
        try {
            // Ensure `req.user` exists and contains an `accountType`
            if (!req.user || !req.user.accountType) {
                return res.status(403).json({
                    message: "Access Denied: Unable to determine user role.",
                });
            }

            // Check if the user's accountType is in the allowed list
            if (!allowedAccountTypes.includes(req.user.accountType)) {
                return res.status(403).json({
                    message: `Access Denied: You do not have permission to perform this action. Your role: ${req.user.accountType}`,
                });
            }

            next(); // User is authorized, proceed
        } catch (error) {
            return res.status(500).json({
                message: "Server Error: Unable to process permissions.",
                error: error.message,
            });
        }
    };
};