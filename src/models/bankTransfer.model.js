import mongoose from "mongoose";

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const bankTransferSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming your user model is named "User"
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true,
    uppercase: true,
    validate: {
      validator: v => ifscRegex.test(v),
      message: props => `${props.value} is not a valid IFSC code`
    }
  },
  payeeName: {
    type: String,
    required: true
  }
}, { timestamps: true }); // timestamps optional but helpful
