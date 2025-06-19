import { QueueService } from "../src/services/queue";
import { DatabaseService } from "../src/services/database";

// Mock Redis and Bull for testing
jest.mock("redis", () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    isReady: true,
  })),
}));

jest.mock("bull", () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: "job-123" }),
    getJob: jest.fn().mockResolvedValue(null),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
    getWaiting: jest.fn().mockResolvedValue([]),
    getActive: jest.fn().mockResolvedValue([]),
    getCompleted: jest.fn().mockResolvedValue([]),
    getFailed: jest.fn().mockResolvedValue([]),
  }));
});

// Mock file system
jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from("test file content")),
}));

describe("QueueService", () => {
  let queueService: QueueService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    dbService = new DatabaseService(":memory:");
    queueService = new QueueService("redis://localhost:6379", dbService);
    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    if (queueService) {
      await queueService.close();
    }
    if (dbService) {
      dbService.close();
    }
  });

  describe("addProcessingJob", () => {
    it("should add a processing job to the queue", async () => {
      const documentId = "test-doc-1";
      const filePath = "/path/to/test.pdf";

      // Should not throw
      await expect(
        queueService.addProcessingJob(documentId, filePath)
      ).resolves.not.toThrow();
    });

    it("should handle job addition with different document types", async () => {
      const documentId = "test-doc-2";
      const filePath = "/path/to/urgent.jpg";

      await expect(
        queueService.addProcessingJob(documentId, filePath)
      ).resolves.not.toThrow();
    });
  });

  describe("getQueueStats", () => {
    it("should return queue statistics", async () => {
      const stats = await queueService.getQueueStats();

      expect(stats).toHaveProperty("waiting");
      expect(stats).toHaveProperty("active");
      expect(stats).toHaveProperty("completed");
      expect(stats).toHaveProperty("failed");
      expect(typeof stats.waiting).toBe("number");
      expect(typeof stats.active).toBe("number");
      expect(typeof stats.completed).toBe("number");
      expect(typeof stats.failed).toBe("number");
    });
  });

  describe("initialization", () => {
    it("should initialize without throwing errors", () => {
      expect(queueService).toBeDefined();
      expect(queueService).toBeInstanceOf(QueueService);
    });
  });

  describe("close", () => {
    it("should close queue connection gracefully", async () => {
      await expect(queueService.close()).resolves.not.toThrow();
    });
  });
});
