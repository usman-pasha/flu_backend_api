import mongoose from "mongoose";
const schema = mongoose.Schema;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

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
        facebookUrl: { type: String, },
        instaUrl: { type: String, },
        youtubeUrl: { type: String, },
        facebookSubscriberCount: { type: String, },
        instaFollowerCount: { type: String, },
        youtubeSubscriberCount: { type: String, },
        accountStatus: {
            type: String,
            enum: ["pending", "rejected", "approved"],
            default: "pending"
        },
        reasonForRejection: { type: String },
        profileCompleted: { type: Boolean, default: false },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        savedPromotions: [{ type: mongoose.Schema.Types.ObjectId, ref: "promotion" }],
        createdBy: { type: schema.Types.ObjectId, ref: "user" },
        updatedBy: { type: schema.Types.ObjectId, ref: "user" },
    },
    { timestamps: true }
);

accountSchema.index({ userId: 1 }, { unique: true });
accountSchema.plugin(paginate);
accountSchema.plugin(aggregatePaginate);

export const accountModel = mongoose.model("account", accountSchema);
