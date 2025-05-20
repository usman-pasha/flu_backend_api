import mongoose from "mongoose";
const schema = mongoose.Schema;

const accountSchema = new schema(
    {
        firstName: { type: String },
        lastName: { type: String },
        profilePicture: { type: String },
        dob: { type: Date },
        gender: { type: String, enum: ["male", "female", "other"] },
        city: { type: String },
        state: { type: String },
        areaOfWork: { type: String },
        facebookUrl: { type: String },
        instaUrl: { type: String },
        youtubeUrl: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // link to user
    },
    { timestamps: true }
);

accountSchema.index({ userId: 1 }, { unique: true });

export const accountModel = mongoose.model("account", accountSchema);
