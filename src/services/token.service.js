import { tokenModel } from "../models/token.model.js";
import { signToken as generateToken } from "../middlewares/token.js";
import jwt from "jsonwebtoken";
import { Types } from "mongoose"; // for ObjectId
import config from "../config/index.js";

export const createLogin = async (user) => {
    console.log("inside login response");
    const id = user._id;
    const payload = {
        user: id,
        jwtToken: generateToken(id, "access"),
        refreshToken: generateToken(id, "refresh"),
    };
    const token = await tokenModel.create(payload);
    const totalCount = await tokenModel.countDocuments({ user: token.user });
    const record = {
        totalLogin: totalCount,
        token: token?.jwtToken,
        refreshToken: token?.refreshToken,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        username: user?.username,
        accountType: user?.accountType,
        _id: user?._id,
    };
    return record
};

export const findOneToken = async (tokenId) => {
    const token = await tokenModel.findOne(tokenId);
    return token;
};

export const deleteToken = async (tokenId) => {
    const token = await tokenModel.findByIdAndDelete(tokenId);
    return token;
};

export const updateToken = async (id, updatedata) => {
    const record = await tokenModel.findOneAndUpdate(id, updatedata, {
        new: true,
    });
    return record;
};

export const signToken = async (id) => {
    const token = jwt.sign({ id }, config.ACCESS_SECRET, {
        expiresIn: 900, // expires in 15 minutes
    });
    return token;
};

export const tokenVerify = async (token) => {
    const record = jwt.verify(token, config.ACCESS_SECRET);
    return record;
};

export const refreshToken = async (id) => {
    const token = jwt.sign({ id }, config.REFRESH_SECRET, {
        expiresIn: "30d",
    });
    return token;
};
