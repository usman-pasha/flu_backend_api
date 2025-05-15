import fs from "fs";
import path from "path";
import winston from "winston";
import "winston-daily-rotate-file";
import config from "../config/index.js";
import { fileURLToPath } from "url";

// Emulate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logger format helpers
const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// Logs directory
const logsDirectory = "C:/ESBackend/logs";
// const logsDirectory = path.join(__dirname, "..", "logs");

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

// Create Winston logger
const logger = winston.createLogger({
  level: "info",
  format: combine(label({ label: config.LABEL }), timestamp(), logFormat),
  transports: [
    new winston.transports.Console({ level: "info" }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDirectory, "application-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: config.MAXFILES,
    }),
  ],
});

export default logger;
