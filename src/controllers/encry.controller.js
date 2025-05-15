import logger from "../utils/log.js";
import * as encryService from "../services/encry.service.js";
import AppError from "../utils/error/appError.js"
import responser from "../utils/responser.js";

class EncryController {
    getEncryptText = async (req, res) => {
        const algorithm = "aes-256-cbc";
        const key = "p3rman3nt s3curity k3y for t3sts";
        const body = req.body.text;
        console.log(body);
        const encryptedText = encryService.encryption(body, algorithm, key);
        logger.info(encryptedText);
        return responser.send(200, "encryt", "E_S001", req, res, encryptedText)
    };

    getDecryptText = async (req, res) => {
        const algorithm = "aes-256-cbc";
        const key = "p3rman3nt s3curity k3y for t3sts";
        const body = req.body.text;
        if (!body) throw new AppError(404, "Required decrypted text", "A_E001")
        console.log(body);
        const decryptedText = encryService.decryption(body, algorithm, key);
        logger.info(decryptedText);
        return responser.send(200, "encryt", "E_S002", req, res, decryptedText)
    };

    decryptionData = (text) => {
        const algorithm = "aes-256-cbc";
        const key = "p3rman3nt s3curity k3y for t3sts";
        const data = this.decryption(text, algorithm, key);
        return data;
    };
}

export default new EncryController();
