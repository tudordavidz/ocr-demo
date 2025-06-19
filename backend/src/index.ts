import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { DatabaseService } from "./services/database";
import { QueueService } from "./services/queue";
import { createDocumentRoutes } from "./routes/documents";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_PATH = process.env.DATABASE_PATH || "./database.sqlite";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Initialize services
const db = new DatabaseService(DATABASE_PATH);
const queue = new QueueService(REDIS_URL, db);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/documents", createDocumentRoutes(db, queue));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size too large" });
    }
  }

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await queue.close();
  db.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await queue.close();
  db.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Database: ${DATABASE_PATH}`);
  console.log(`Redis: ${REDIS_URL}`);
});

export default app;
