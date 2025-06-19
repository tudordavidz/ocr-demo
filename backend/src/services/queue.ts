import Bull from "bull";
import fs from "fs";
import { ProcessingJob } from "../types";
import { DatabaseService } from "./database";
import { simulateOCR, extractMetadata, validateDocument } from "./ocr";

export class QueueService {
  private queue: Bull.Queue;
  private db: DatabaseService;

  constructor(redisUrl: string, db: DatabaseService) {
    this.db = db;
    this.queue = new Bull("document-processing", redisUrl);
    this.setupProcessors();
  }

  private setupProcessors(): void {
    this.queue.process("process-document", 5, async (job) => {
      const { documentId, filePath }: ProcessingJob = job.data;

      try {
        console.log(`Processing document ${documentId}...`);

        // Update status to processing
        await this.db.updateDocument(documentId, {
          status: "processing" as any,
        });

        // Read file and simulate OCR
        const fileBuffer = fs.readFileSync(filePath);
        const ocrResult = await simulateOCR(fileBuffer);

        // Extract metadata
        const metadata = extractMetadata(ocrResult, filePath);

        // Update status to validating
        await this.db.updateDocument(documentId, {
          status: "validating" as any,
        });

        // Validate document
        const validation = validateDocument(metadata);

        if (validation.isValid) {
          // Update document with metadata and mark as completed
          await this.db.updateDocument(documentId, {
            status: "completed" as any,
            processedAt: new Date(),
            metadata,
          });

          console.log(`Document ${documentId} processed successfully`);
        } else {
          // Mark as failed with validation errors
          await this.db.updateDocument(documentId, {
            status: "failed" as any,
            processedAt: new Date(),
            errorMessage: validation.errors.join("; "),
          });

          console.log(
            `Document ${documentId} failed validation:`,
            validation.errors
          );
        }
      } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);

        // Mark as failed
        await this.db.updateDocument(documentId, {
          status: "failed" as any,
          processedAt: new Date(),
          errorMessage:
            error instanceof Error ? error.message : "Unknown error occurred",
        });

        throw error; // Re-throw to trigger retry mechanism
      }
    });

    // Setup event handlers
    this.queue.on("completed", (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.queue.on("failed", (job, err) => {
      console.log(`Job ${job.id} failed:`, err.message);

      // If max retries exceeded, move to dead letter queue
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        console.log(
          `Job ${job.id} moved to dead letter queue after ${job.attemptsMade} attempts`
        );
      }
    });

    this.queue.on("stalled", (job) => {
      console.log(`Job ${job.id} stalled and will be retried`);
    });
  }

  async addProcessingJob(documentId: string, filePath: string): Promise<void> {
    const jobData: ProcessingJob = {
      documentId,
      filePath,
      attempt: 1,
    };

    await this.queue.add("process-document", jobData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });

    if (process.env.NODE_ENV !== 'test') {
      console.log(`Added processing job for document ${documentId}`);
    }
  }

  async getQueueStats(): Promise<any> {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
