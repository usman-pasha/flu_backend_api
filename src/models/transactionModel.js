import mongoose from "mongoose";
const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
    },
    walletId: { type: Schema.Types.ObjectId, ref: 'wallet', required: true },
    transactionId: {
      type: String,
      required: true, // UTR or transaction reference number
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDateTime: {
      type: Date,
      required: true,
    },
    screenshot: {
      type: String, // optional URL for screenshot image
    },
    adminNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    widthdrawId: { type: Schema.Types.ObjectId, ref: "withdraw" },
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

export const transactionModel = model("transaction", transactionSchema);

// background works
// admin can access the user wallet
// 1. fetch the wallet balance from user which requested for withdraw
// 1.1 updating the wallet balance automatically when creating the transcation
// 1.2 automatically update the status of withdraw [completed]
