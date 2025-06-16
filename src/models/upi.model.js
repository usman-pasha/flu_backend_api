import mongoose from "mongoose";
const schema = mongoose.Schema;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

const upiSchema = new schema({
  accountId: {
    type: schema.Types.ObjectId,
    ref: "account", // Assuming your user model is named "User"
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
  upiHolderName: {
    type: String,
    required: true
  },
  // TODO like atribute gpay or phonePay amazon pay etc 
  upiType: { type: String }
}, { timestamps: true });

upiSchema.index({ upiId: true })
upiSchema.plugin(paginate);
upiSchema.plugin(aggregatePaginate);

export const upiModel = mongoose.model("upi", upiSchema);
