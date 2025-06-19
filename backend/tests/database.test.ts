import { DatabaseService } from '../src/services/database';
import { ProcessingStatus } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  const testDbPath = ':memory:'; // Use in-memory database for tests

  beforeEach(() => {
    dbService = new DatabaseService(testDbPath);
    // Wait a bit for database initialization
    return new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    if (dbService) {
      dbService.close();
    }
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const documentData = {
        id: 'test-doc-1',
        filename: 'test.pdf',
        originalName: 'original-test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        status: ProcessingStatus.UPLOADED
      };

      const result = await dbService.createDocument(documentData);

      expect(result).toMatchObject(documentData);
      expect(result.uploadedAt).toBeInstanceOf(Date);
      expect(result.uploadedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should handle duplicate document IDs gracefully', async () => {
      const documentData = {
        id: 'duplicate-id',
        filename: 'test1.pdf',
        originalName: 'original1.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        status: ProcessingStatus.UPLOADED
      };

      // Create first document
      await dbService.createDocument(documentData);

      // Try to create duplicate
      const duplicateData = {
        ...documentData,
        filename: 'test2.pdf',
        originalName: 'original2.pdf'
      };

      await expect(dbService.createDocument(duplicateData)).rejects.toThrow();
    });
  });

  describe('getDocument', () => {
    it('should retrieve an existing document', async () => {
      const documentData = {
        id: 'test-doc-2',
        filename: 'test2.pdf',
        originalName: 'original-test2.pdf',
        mimeType: 'application/pdf',
        size: 2048,
        status: ProcessingStatus.UPLOADED
      };

      await dbService.createDocument(documentData);
      const result = await dbService.getDocument('test-doc-2');

      expect(result).toMatchObject(documentData);
      expect(result?.uploadedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent document', async () => {
      const result = await dbService.getDocument('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateDocument', () => {
    it('should update document status', async () => {
      const documentData = {
        id: 'test-doc-3',
        filename: 'test3.pdf',
        originalName: 'original-test3.pdf',
        mimeType: 'application/pdf',
        size: 1536,
        status: ProcessingStatus.UPLOADED
      };

      await dbService.createDocument(documentData);
      await dbService.updateDocument('test-doc-3', { status: ProcessingStatus.PROCESSING });

      const updated = await dbService.getDocument('test-doc-3');
      expect(updated?.status).toBe(ProcessingStatus.PROCESSING);
    });

    it('should handle updating non-existent document', async () => {
      // This should not throw an error, but also shouldn't affect anything
      await expect(
        dbService.updateDocument('non-existent', { status: ProcessingStatus.FAILED })
      ).resolves.not.toThrow();
    });

    it('should update document with metadata and mark as completed', async () => {
      const documentData = {
        id: 'test-doc-4',
        filename: 'test4.pdf',
        originalName: 'original-test4.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        status: ProcessingStatus.PROCESSING
      };

      const metadata = {
        extractedText: 'This is test content',
        confidence: 0.95,
        language: 'en',
        documentType: 'invoice',
        invoiceNumber: 'INV-001'
      };

      await dbService.createDocument(documentData);
      await dbService.updateDocument('test-doc-4', { 
        status: ProcessingStatus.COMPLETED,
        metadata,
        processedAt: new Date()
      });

      const updated = await dbService.getDocument('test-doc-4');
      expect(updated?.status).toBe(ProcessingStatus.COMPLETED);
      expect(updated?.metadata).toEqual(metadata);
      expect(updated?.processedAt).toBeInstanceOf(Date);
    });

    it('should update document with error message and failed status', async () => {
      const documentData = {
        id: 'test-doc-5',
        filename: 'test5.pdf',
        originalName: 'original-test5.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        status: ProcessingStatus.PROCESSING
      };

      const errorMessage = 'Processing failed due to corrupted file';

      await dbService.createDocument(documentData);
      await dbService.updateDocument('test-doc-5', { 
        status: ProcessingStatus.FAILED,
        errorMessage,
        processedAt: new Date()
      });

      const updated = await dbService.getDocument('test-doc-5');
      expect(updated?.status).toBe(ProcessingStatus.FAILED);
      expect(updated?.errorMessage).toBe(errorMessage);
      expect(updated?.processedAt).toBeInstanceOf(Date);
    });
  });

  describe('getAllDocuments', () => {
    it('should retrieve all documents', async () => {
      const docs = [
        {
          id: 'doc-1',
          filename: 'file1.pdf',
          originalName: 'original1.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          status: ProcessingStatus.UPLOADED
        },
        {
          id: 'doc-2',
          filename: 'file2.jpg',
          originalName: 'original2.jpg',
          mimeType: 'image/jpeg',
          size: 2048,
          status: ProcessingStatus.COMPLETED
        }
      ];

      for (const doc of docs) {
        await dbService.createDocument(doc);
      }

      const results = await dbService.getAllDocuments();
      expect(results).toHaveLength(2);
      
      const ids = results.map(doc => doc.id);
      expect(ids).toContain('doc-1');
      expect(ids).toContain('doc-2');
    });

    it('should return empty array when no documents exist', async () => {
      const results = await dbService.getAllDocuments();
      expect(results).toHaveLength(0);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('database initialization', () => {
    it('should initialize database tables', () => {
      // If we can create documents, the table was initialized properly
      expect(dbService).toBeDefined();
    });
  });
});
