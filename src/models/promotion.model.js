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
        savedByUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
    { timestamps: true }
);

promotionSchema.plugin(paginate);
promotionSchema.plugin(aggregatePaginate);

export const promotionModel = mongoose.model("promotion", promotionSchema);
