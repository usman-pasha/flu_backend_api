import mongoose from "mongoose";

const db = async (url) => {
    console.log(`Connecting to mongo db server`);
    try {
        const connection = await mongoose.connect(url);
        console.log(`Successfully connected to mongo db server!`);
        return connection;
    } catch (error) {
        console.log(error);
        throw new Error(
            "Mongodb connection failed plz check the connection string"
        );
    }
};

export default db;
