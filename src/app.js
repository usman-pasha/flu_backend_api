// Package Imports
import express from "express";
import cors from "cors";

// Custom Imports
import routes from "./routes/index.js";
import globalErrorHandler from "./core/globalError.js";

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
routes(app, "/api/v1");

import * as responser from "./core/responser.js";
import catchAsync from "./core/catachError.js";
import * as logger from "./utils/log.js";
import * as emailService from "./utils/nodemailer.js";

const formSubmitApi = async (req, res) => {
  const reqData = req.body;
  const data = {
    email: reqData.email,
    message: reqData.message,
    name: reqData.name,
  }
  logger.info(data);
  emailService.pcwtEmail(data)
    .then((res) => logger.data("Email Response..", res.response))
    .catch((err) => logger.error("sendEmailToUser", err));
  return responser.send(200, "Successfully Form Submitted", req, res, data);
}

app.post("/api/v1/formSubmit", catchAsync(formSubmitApi))

const api = async (req, res) => {
  const data = {
    name: 'Usman Pasha.A',
    email: 'siraj.backend.dev@gmail.com',
    dept: 'Backend Developer',
  }
  logger.info(data);
  return responser.send(200, "Successfully Health CheckUp Fetched ", req, res, data);
}

app.post("/api/v1/formSubmit", catchAsync(formSubmitApi))
app.get("/api/v1/check", catchAsync(api))



app.use(globalErrorHandler);

export default app;

