import mongoose from "mongoose";
const schema = mongoose.Schema;

const accountSchema = new schema(
    {
        firstName: { type: String },
        lastName: { type: String },
        profilePicture: { type: String },
        dob: { type: String, required: true },
        gender: { type: String, enum: ["male", "female", "other"], required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        areaOfWork: { type: String, required: true },
        facebookUrl: { type: String, required: true },
        instaUrl: { type: String, required: true },
        youtubeUrl: { type: String, required: true },
        facebookSubscriberCount: { type: String, required: true },
        instaFollowerCount: { type: String, required: true },
        youtubeSubscriberCount: { type: String, required: true },
        accountStatus: {
            type: String,
            enum: ["pending", "rejected", "approved"],
            default: "pending"
        },
        reasonForRejection: { type: String },
        profileCompleted: { type: Boolean, default: false },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        createdBy: { type: schema.Types.ObjectId, ref: "user" },
        updatedBy: { type: schema.Types.ObjectId, ref: "user" },
    },
    { timestamps: true }
);

accountSchema.index({ userId: 1 }, { unique: true });

export const accountModel = mongoose.model("account", accountSchema);
