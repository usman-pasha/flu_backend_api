import mongoose from "mongoose";
const schema = mongoose.Schema;

const userSchema = new schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        emailOTP: { type: Number },
        emailIsVerified: { type: Boolean, default: false },
        emailOtpExpiry: { type: Date },
        phoneNumber: { type: Number, required: true, unique: true },
        phoneOTP: { type: Number },
        phoneIsVerified: { type: Boolean, default: false },
        phoneOtpExpiry: { type: Date },
        password: { type: String, required: true },
        loginWithOtp: { type: Number },
        loginWithOtpExpiry: { type: Date },
        accountType: { type: String, required: true, enum: ['user', 'admin'] },
        profilePicture: { type: String },
        resetPasswordPhoneOtp: { type: Number },
        resetPasswordExpire: { type: Date },
        resetPasswordEmailOtp: { type: Number },
        status: { type: String, enum: ["active", "inactive", "deleted"], default: "inactive" },
    },
    { timestamps: true }
);

userSchema.index({ email: true })

export const userModel = mongoose.model("user", userSchema);
