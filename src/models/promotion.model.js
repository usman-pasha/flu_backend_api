import mongoose from "mongoose";
const schema = mongoose.Schema;

const promotionSchema = new schema(
    {
        promotion: { type: String, required: true },
        promotionPicture: { type: String },
        description: { type: String },
        compensation: { type: String },
        deadline: { type: Date },
        platform: { type: String },
        location: { type: String },
        verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        donts: [{ type: String }],
        script: { type: String },
        requirements: [{ type: String }],
        dos: [{ type: String }],
        engagementMetrics: { type: String },
        links: [{ type: String }],
        termsOfCollaboration: { type: String },
        postedOn: { type: Date, default: Date.now },
        interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
    { timestamps: true }
);

export const promotionModel = mongoose.model("promotion", promotionSchema);
