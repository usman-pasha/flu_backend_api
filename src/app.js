// Package Imports
import express from "express";
import cors from "cors";

// Custom Imports
import routes from "./routes/index.js";
import globalErrorHandler from "./core/globalError.js";
import * as responser from "./core/responser.js";
import catchAsync from "./core/catachError.js";
import * as logger from "./utils/log.js";
import { sendPushNotification } from "./utils/firebase/sendPushNotification.js";


const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

const whiteList = [
  "http://localhost:4200",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:51629",
  "https://flu-management.netlify.app"
];
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || whiteList.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

// Routing
const api = async (req, res) => {
  const data = {
    name: 'Usman Pasha.A',
    email: 'siraj.backend.dev@gmail.com',
    dept: 'Backend Developer',
  }
  logger.info(data);
  return responser.send(200, "Successfully Health CheckUp Fetched ", req, res, data);
}

const testNotification = async (req, res) => {
  const { token, title, body } = req.body;

  try {
    const _d = {
      "_id": "68a03b3000995bc2ad7f9678",
    }
    const response = await sendPushNotification(token, title, body, _d);
    res.status(200).json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

app.post("/send-notification", testNotification);
app.get("/api/v1/check", catchAsync(api))
routes(app, "/api/v1");

app.use(globalErrorHandler);

export default app;

