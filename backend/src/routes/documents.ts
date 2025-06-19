import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { DatabaseService } from "../services/database";
import { QueueService } from "../services/queue";
import { ProcessingStatus } from "../types";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, PDFs, and text files (for testing)
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain", // Added for testing purposes
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, PDFs, and text files are allowed."
        )
      );
    }
  },
});

export function createDocumentRoutes(db: DatabaseService, queue: QueueService) {
  // Upload document
  router.post("/upload", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const documentId = uuidv4();

      // Create document record
      const document = await db.createDocument({
        id: documentId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        status: ProcessingStatus.UPLOADED,
      });

      // Add to processing queue
      await queue.addProcessingJob(documentId, req.file.path);

      res.status(201).json({
        message: "Document uploaded successfully",
        document: {
          id: document.id,
          originalName: document.originalName,
          status: document.status,
          uploadedAt: document.uploadedAt,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Failed to upload document",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get all documents
  router.get("/", async (req, res) => {
    try {
      const documents = await db.getAllDocuments();
      res.json({
        documents: documents.map((doc) => ({
          id: doc.id,
          originalName: doc.originalName,
          status: doc.status,
          uploadedAt: doc.uploadedAt,
          processedAt: doc.processedAt,
          metadata: doc.metadata,
          errorMessage: doc.errorMessage,
        })),
      });
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });

  // Health check endpoint
  router.get("/health/status", async (req, res) => {
    try {
      const queueStats = await queue.getQueueStats();
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        queue: queueStats,
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get specific document
  router.get("/:id", async (req, res) => {
    try {
      const document = await db.getDocument(req.params.id);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json({
        document: {
          id: document.id,
          originalName: document.originalName,
          status: document.status,
          uploadedAt: document.uploadedAt,
          processedAt: document.processedAt,
          metadata: document.metadata,
          errorMessage: document.errorMessage,
        },
      });
    } catch (error) {
      console.error("Get document error:", error);
      res.status(500).json({ error: "Failed to retrieve document" });
    }
  });

  // Get document status
  router.get("/:id/status", async (req, res) => {
    try {
      const document = await db.getDocument(req.params.id);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json({
        id: document.id,
        status: document.status,
        uploadedAt: document.uploadedAt,
        processedAt: document.processedAt,
        errorMessage: document.errorMessage,
      });
    } catch (error) {
      console.error("Get status error:", error);
      res.status(500).json({ error: "Failed to retrieve document status" });
    }
  });

  return router;
}
