import mongoose from "mongoose";
const { Schema } = mongoose;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const transactionSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "account", required: true },
    walletId: { type: Schema.Types.ObjectId, ref: "wallet", required: true },
    transId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDateTime: { type: Date, default: Date.now },
    screenshot: { type: String },
    adminNotes: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    withdrawId: { type: Schema.Types.ObjectId, ref: "withdraw" },
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "user" }
  },
  { timestamps: true }
);

transactionSchema.plugin(paginate);
transactionSchema.plugin(aggregatePaginate);

export const transactionModel = mongoose.model("transaction", transactionSchema);
