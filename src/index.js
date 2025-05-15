// Package Imports
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";

// Custom Imports
import config from "./config/index.js";
import logger from "./utils/logger.js";
import db from "./core/db.js"

// Workaround for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create HTTPS server
const server = http.createServer(app);

// Start server
server.listen(config.PORT,async() => {
  logger.info(`🚀 App is running at http://localhost:${config.PORT}`);
  logger.info(`🌍 Environment: ${app.get("env")}`);
  await db(config.DB_URI)
});

// Graceful shutdown
server.on("close", () => {
  logger.info("🛑 Server closed");
  server.close();
});

process.on("SIGINT", () => {
  server.emit("close");
  process.exit(0);
});
