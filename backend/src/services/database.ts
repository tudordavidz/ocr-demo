import sqlite3 from "sqlite3";
import { Database } from "sqlite3";
import { Document, ProcessingStatus } from "../types";

export class DatabaseService {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  private init(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        originalName TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        size INTEGER NOT NULL,
        status TEXT NOT NULL,
        uploadedAt DATETIME NOT NULL,
        processedAt DATETIME,
        metadata TEXT,
        errorMessage TEXT
      )
    `;

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error("Error creating documents table:", err);
      } else {
        // Only log in non-test environments
        if (process.env.NODE_ENV !== "test") {
          console.log("Database initialized successfully");
        }
      }
    });
  }

  async createDocument(
    document: Omit<Document, "uploadedAt">
  ): Promise<Document> {
    const doc: Document = {
      ...document,
      uploadedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO documents (id, filename, originalName, mimeType, size, status, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        sql,
        [
          doc.id,
          doc.filename,
          doc.originalName,
          doc.mimeType,
          doc.size,
          doc.status,
          doc.uploadedAt.toISOString(),
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(doc);
          }
        }
      );
    });
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (updates.status) {
        fields.push("status = ?");
        values.push(updates.status);
      }
      if (updates.processedAt) {
        fields.push("processedAt = ?");
        values.push(updates.processedAt.toISOString());
      }
      if (updates.metadata) {
        fields.push("metadata = ?");
        values.push(JSON.stringify(updates.metadata));
      }
      if (updates.errorMessage) {
        fields.push("errorMessage = ?");
        values.push(updates.errorMessage);
      }

      if (fields.length === 0) {
        resolve();
        return;
      }

      values.push(id);
      const sql = `UPDATE documents SET ${fields.join(", ")} WHERE id = ?`;

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getDocument(id: string): Promise<Document | null> {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM documents WHERE id = ?";

      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve(this.rowToDocument(row));
        }
      });
    });
  }

  async getAllDocuments(): Promise<Document[]> {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM documents ORDER BY uploadedAt DESC";

      this.db.all(sql, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map((row) => this.rowToDocument(row)));
        }
      });
    });
  }

  private rowToDocument(row: any): Document {
    return {
      id: row.id,
      filename: row.filename,
      originalName: row.originalName,
      mimeType: row.mimeType,
      size: row.size,
      status: row.status as ProcessingStatus,
      uploadedAt: new Date(row.uploadedAt),
      processedAt: row.processedAt ? new Date(row.processedAt) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      errorMessage: row.errorMessage,
    };
  }

  close(): void {
    this.db.close();
  }
}
