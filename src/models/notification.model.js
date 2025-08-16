// models/notification.model.js
import mongoose from "mongoose";
const schema = mongoose.Schema;

const notificationSchema = new schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    tokens: [{ type: String }], // device tokens used
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    responses: { type: Object }, // full firebase response
    image: { type: String },
    type: {
        type: String,
        enum: ["transaction", "account", "wallet_credit", "promotion_status"],
    },
    createdAt: { type: Date, default: Date.now },
});

export const notificationModel = mongoose.model("notification", notificationSchema);
