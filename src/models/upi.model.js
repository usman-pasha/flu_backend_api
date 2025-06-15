import mongoose from "mongoose";

const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export const upiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  upiId: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: v => upiRegex.test(v),
      message: props => `${props.value} is not a valid UPI ID`
    }
  },
  payeeName: {
    type: String,
    required: true
  }
}, { timestamps: true });
