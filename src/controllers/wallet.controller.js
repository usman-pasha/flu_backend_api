import * as walletService from "../services/wallet.service.js";
import * as responser from "../core/responser.js";

class WalletController {
    // Get My Wallet
    getMyWallet = async (req, res) => {
        const result = await walletService.getMyWallet(req.user);
        return responser.send(200, "User Wallet Fetched", req, res, result);
    };

    // Get all wallets (Admin)
    getAllWalletsAdmin = async (req, res) => {
        const result = await walletService.getAllWalletsByAdmin(req.query);
        return responser.send(200, "All Wallets Fetched", req, res, result);
    };

    // Update wallet balance (Admin)
    updatedWalletBalance = async (req, res) => {
        const result = await walletService.updatedWalletBalance(req.body);
        return responser.send(200, result.message, req, res, result.wallet);
    };
}

export default new WalletController();
