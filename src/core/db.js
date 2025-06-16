import mongoose from "mongoose";

const db = async (url) => {
    console.log("🟡 Connecting to MongoDB server...");

    try {
        const connection = await mongoose.connect(url);
        console.log("✅ Successfully connected to MongoDB!");
        return connection;
    } catch (error) {
        console.error("❌ MongoDB connection failed:");
        console.error("Error Message:", error.message);
        console.error("Error Cause:", error?.cause || "No cause provided");
        throw new Error("MongoDB connection failed. Please check the connection string, credentials, and IP access.");
    }
};

export default db;
