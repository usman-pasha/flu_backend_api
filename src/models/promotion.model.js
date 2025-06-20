import mongoose from "mongoose";
const schema = mongoose.Schema;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const promotionSchema = new schema(
    {
        brandName: { type: String, required: true },
        brandLogo: { type: String, required: true },
        brandNiche: { type: String, required: true },
        promotionPicture: { type: String },
        promotionArrayPictures: [{ img: { type: String } }],
        description: { type: String },
        compensation: { type: Number },
        deadline: { type: Date },
        platform: { type: String },
        location: { type: String },
        verificationStatus: { type: String, enum: ["pending", "active", "deleted", "inactive", "expired"], default: "pending" },
        donts: [{ type: String }],
        script: { type: String },
        requirements: [{ type: String }],
        dos: [{ type: String }],
        engagementMetrics: { type: String },
        links: [{ type: String }],
        termsOfCollaboration: { type: String },
        postedOn: { type: Date, default: Date.now },
        // interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        appliedUsers: [
            {
                accountId: { type: mongoose.Schema.Types.ObjectId, ref: "account" },
                status: {
                    type: String,
                    enum: ["under review", "approved", "rejected"],
                    default: "under review"
                },
                rejectedReason: { type: String },
                appliedAt: { type: Date, default: Date.now },
                approvedAt: { type: Date, default: Date.now },
                rejectedAt: { type: Date, default: Date.now },

            }
        ],
        // savedByUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
    { timestamps: true }
);

promotionSchema.plugin(paginate);
promotionSchema.plugin(aggregatePaginate);

export const promotionModel = mongoose.model("promotion", promotionSchema);
