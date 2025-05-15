import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import config from "../config/index.js";
const { hashSync, compareSync } = bcryptjs;

export const signToken = (id, type) => {
    try {
        let validatity;
        let secretKey;
        switch (type) {
            case "access":
                validatity = config.ACCESS_VALIDITY;
                secretKey = config.ACCESS_SECRET;
                break;
            case "refresh":
                validatity = config.REFRESH_VALIDITY;
                secretKey = config.REFRESH_SECRET;
                break;
            default:
                throw new Error("Invalid Token Type");
        }
        const token = jwt.sign({ id }, secretKey, {
            expiresIn: validatity,
            audience: "usman",
        });
        return token;
    } catch (err) {
        throw new Error(err.message);
    }
};

export const hashPassword = (password) => {
    const record = hashSync(password, 10);
    return record;
};

export const compareHashPassword = (password, hashPassword) => {
    const record = compareSync(password, hashPassword);
    return record;
};

export const verifyToken = async (token, type) => {
    let secret;
    switch (type) {
        case "access":
            secret = config.ACCESS_SECRET;
            break;
        case "refresh":
            secret = config.REFRESH_SECRET;
            break;
        default:
            throw new Error("Invalid Access Token Type");
    }
    try {
        return await promisify(jwt.verify)(token, secret);
    } catch (error) {
        logger.error("Token verification Failed");
        throw error;
    }
};