import request from "supertest";
import express from "express";
import cors from "cors";
import { createDocumentRoutes } from "../src/routes/documents";
import { DatabaseService } from "../src/services/database";
import { QueueService } from "../src/services/queue";
import * as path from "path";
import * as fs from "fs";

// Mock queue service for testing
const mockQueueService = {
  addProcessingJob: jest.fn().mockResolvedValue({}),
  getQueueStats: jest
    .fn()
    .mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0 }),
  close: jest.fn().mockResolvedValue(undefined),
} as unknown as QueueService;

// Shared database service for consistent state
let sharedDbService: DatabaseService;

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Use shared database service
  sharedDbService = new DatabaseService(":memory:");
  const documentRoutes = createDocumentRoutes(
    sharedDbService,
    mockQueueService
  );
  app.use("/api/documents", documentRoutes);

  return app;
};

describe("Documents API", () => {
  let app: express.Application;
  const testUploadsDir = path.join(__dirname, "../test-uploads");

  beforeAll(async () => {
    app = createTestApp();

    // Create test uploads directory
    if (!fs.existsSync(testUploadsDir)) {
      fs.mkdirSync(testUploadsDir, { recursive: true });
    }

    // Wait for database initialization
    await new Promise((resolve) => setTimeout(resolve, 200));
  });

  afterAll(async () => {
    // Clean up test uploads directory
    if (fs.existsSync(testUploadsDir)) {
      fs.rmSync(testUploadsDir, { recursive: true, force: true });
    }

    // Close shared database
    if (sharedDbService) {
      sharedDbService.close();
    }
  });

  describe("GET /api/documents", () => {
    it("should return empty array when no documents exist", async () => {
      const response = await request(app).get("/api/documents").expect(200);

      expect(response.body).toHaveProperty("documents");
      expect(response.body.documents).toEqual([]);
    });

    it("should return all documents", async () => {
      // Create test documents directly in database
      await sharedDbService.createDocument({
        id: "test-1",
        filename: "test1.pdf",
        originalName: "original1.pdf",
        mimeType: "application/pdf",
        size: 1024,
        status: "uploaded" as any,
      });

      await sharedDbService.createDocument({
        id: "test-2",
        filename: "test2.jpg",
        originalName: "original2.jpg",
        mimeType: "image/jpeg",
        size: 2048,
        status: "completed" as any,
      });

      // Wait a bit for database operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app).get("/api/documents").expect(200);

      expect(response.body).toHaveProperty("documents");
      expect(response.body.documents).toHaveLength(2);
      expect(response.body.documents[0]).toHaveProperty("id");
      expect(response.body.documents[0]).toHaveProperty("originalName");
      expect(response.body.documents[0]).toHaveProperty("status");
    });
  });

  describe("GET /api/documents/:id", () => {
    it("should return specific document", async () => {
      await sharedDbService.createDocument({
        id: "specific-test",
        filename: "specific.pdf",
        originalName: "original-specific.pdf",
        mimeType: "application/pdf",
        size: 1024,
        status: "uploaded" as any,
      });

      // Wait for database operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app)
        .get("/api/documents/specific-test")
        .expect(200);

      expect(response.body).toHaveProperty("document");
      expect(response.body.document.id).toBe("specific-test");
      expect(response.body.document.originalName).toBe("original-specific.pdf");
    });

    it("should return 404 for non-existent document", async () => {
      const response = await request(app)
        .get("/api/documents/non-existent")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/documents/upload", () => {
    it("should handle missing file", async () => {
      const response = await request(app)
        .post("/api/documents/upload")
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("file");
    });

    // Note: These upload tests are more complex because they involve
    // file uploads, database operations, and queue operations.
    // For now, we'll test the basic error cases.

    it("should respond to upload endpoint", async () => {
      // Even if it fails, it should respond with some structure
      const response = await request(app).post("/api/documents/upload");

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toBeDefined();
    });
  });

  describe("GET /api/documents/:id/status", () => {
    it("should return document status", async () => {
      await sharedDbService.createDocument({
        id: "status-test",
        filename: "status.pdf",
        originalName: "original-status.pdf",
        mimeType: "application/pdf",
        size: 1024,
        status: "processing" as any,
      });

      // Wait for database operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app)
        .get("/api/documents/status-test/status")
        .expect(200);

      expect(response.body).toHaveProperty("status", "processing");
      expect(response.body).toHaveProperty("id", "status-test");
    });

    it("should return 404 for non-existent document status", async () => {
      const response = await request(app)
        .get("/api/documents/non-existent/status")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Error handling", () => {
    it("should handle invalid endpoints gracefully", async () => {
      const response = await request(app)
        .get("/api/documents/invalid-endpoint")
        .expect(404);

      expect(response.body).toBeDefined();
    });
  });

  describe("Health check", () => {
    it("should handle unknown endpoints gracefully", async () => {
      const response = await request(app)
        .get("/api/documents/non-existent-endpoint")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });
});
