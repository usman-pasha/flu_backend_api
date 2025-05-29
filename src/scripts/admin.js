import fs from 'fs';
import path from 'path';
const jsonData = JSON.parse(fs.readFileSync(path.resolve('./src/scripts/admin.json'), 'utf-8'));
// const jsonData = JSON.parse(fs.readFileSync(path.resolve('./admin.json'), 'utf-8'));

import bcryptjs from "bcryptjs";
const { hashSync} = bcryptjs;

export const creatingAdmin = async (connection) => {
    try {
        const admins = JSON.parse(JSON.stringify(jsonData.admins));
        for (const admin of admins) {
            const isExist = await connection
                .collection("users")
                .findOne({ email: admin.email });
            if (isExist) {
                console.log("Already Admin =", admin.email, "Exists");
                continue;
            }
            const date = new Date().toISOString();
            const password = hashSync(admin.password, 10);
            const object = {
                username: admin.username,
                password: password,
                email: admin.email,
                phoneNumber: admin.phoneNumber,
                emailIsVerified: admin.emailIsVerified,
                phoneIsVerified: admin.phoneIsVerified,
                accountType: admin.accountType,
                status: admin.status,
                createdBy: admin.createdBy,
                updatedBy: admin.updatedBy,
                createdAt: date,
                updatedAt: date,
            };
            const insert = await connection.collection("users").insertMany([object]);
            console.log("Saved Admin", admin.email);
        }
    } catch (err) {
        console.log(err);
        return;
    }
};