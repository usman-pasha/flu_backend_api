import mongoose from "mongoose";
const schema = mongoose.Schema;

const tokenSchema = new schema(
    {
        user: { type: schema.Types.ObjectId, ref: "user" },
        jwtToken: { type: String },
        refreshToken: { type: String },
        createdByIp: { type: String },
        status: {
            type: Number,
            required: true,
            default: 0, //0:active, 1:inactive
        },
    },
    { timestamps: true }
);

export const tokenModel = mongoose.model("token", tokenSchema);
