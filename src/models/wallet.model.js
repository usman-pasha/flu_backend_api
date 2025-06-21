import mongoose from "mongoose"
let Schema = mongoose.Schema;

const walletSchema = new Schema({
    accountId: { type: Schema.Types.ObjectId, ref: 'account', required: true },
    balance: { type: Number, default: 0 }, // Current balance
    promotionIds: [{ type: Schema.Types.ObjectId, ref: 'promotion' }],
}, { timestamps: true });

export const walletModel = mongoose.model('wallet', walletSchema);


// upi
// bank transfer
// wallet balance ---> withdraw request ----> admin
// admin-->withdraw request---> update wallet next ---> transaction user wallet model throw 