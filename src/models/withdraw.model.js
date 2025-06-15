import mongoose from "mongoose";

export const withdrawSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    method: {
        type: String,
        enum: ['bankTransfer', 'upi'],
        required: true
    },
    bankTransferId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bankTransfer",
    },
    upiId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "upi",
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'rejected'],
        default: 'pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: Date
}, { timestamps: true });

export const withdrawRequest = mongoose.model("withdraw", withdrawSchema);
