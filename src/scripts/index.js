import mongoose from "mongoose";
import * as adminData from "./admin.js"; // Ensure admin.js is also an ES module
const Initialise = async () => {
  try {
    const connect = await mongoose.connect("mongodb+srv://mongo01:Mongo01@cluster0.bmbfj.mongodb.net/flu?retryWrites=true&w=majority&appName=Cluster0");
    console.log("Connected to database");
    const db = connect.connection;
    await adminData.creatingAdmin(db);
    console.log("Admin Created");
  } catch (err) {
    console.error(err);
    process.exit(1); // Exit with failure
  }

  process.exit(0); // Exit with success
};

Initialise();
