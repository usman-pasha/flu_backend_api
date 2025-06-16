import mongoose from "mongoose";
const schema = mongoose.Schema;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const bankTransferSchema = new schema({
  accountId: {
    type: schema.Types.ObjectId,
    ref: "account", // Assuming your user model is named "User"
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  cardName: { type: String, },
  ifscCode: {
    type: String,
    required: true,
    uppercase: true,
    validate: {
      validator: v => ifscRegex.test(v),
      message: props => `${props.value} is not a valid IFSC code`
    }
  },
  accountHolderName: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  }
}, { timestamps: true }); // timestamps optional but helpful

bankTransferSchema.index({ accountNumber: true })
bankTransferSchema.index({ ifscCode: true })
bankTransferSchema.plugin(paginate);
bankTransferSchema.plugin(aggregatePaginate);

export const bankTransferModel = mongoose.model("bankTransfer", bankTransferSchema);
