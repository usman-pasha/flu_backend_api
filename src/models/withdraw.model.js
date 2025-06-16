import mongoose from "mongoose";
const schema = mongoose.Schema;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const withdrawSchema = new schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
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

withdrawSchema.plugin(paginate);
withdrawSchema.plugin(aggregatePaginate);

export const withdrawModel = mongoose.model("withdraw", withdrawSchema);
