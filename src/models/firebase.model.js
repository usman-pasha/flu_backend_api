// models/notification.model.js
import mongoose from "mongoose";
const schema = mongoose.Schema;

const fcmTokenSchema = new schema(
    {
        userId: { type: schema.Types.ObjectId, ref: "user", required: true },
        fcmToken: {
            type: String,
            required: true,
        },
        deviceType: {
            type: String,
            enum: ["android", "ios", "web","unknown"],
            default: "android",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);
export const firebaseModel = mongoose.model("firebase", fcmTokenSchema);
