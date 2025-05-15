import crypto from "crypto"

export const encryption = (text, algorithm, key) => {
    const initVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, initVector);
    let encryptedData = cipher.update(text, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return initVector.toString("hex") + ":" + encryptedData.toString("hex");
};

export const decryption = (text, algorithm, key) => {
    const arr = text.split(":");
    const iv = Buffer.from(arr[0], "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedData = decipher.update(arr[1], "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
};