// models/notification.model.js
import mongoose from "mongoose";
const schema = mongoose.Schema;

const notificationSchema = new schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    title: String,
    message: String,
    isRead: {
        type: Boolean,
        default: false
    },
    type: String, // e.g., 'withdrawal'
}, { timestamps: true });

export const notificationModel = mongoose.model("notification", notificationSchema);
