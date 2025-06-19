export enum ProcessingStatus {
  UPLOADED = "uploaded",
  PROCESSING = "processing",
  VALIDATING = "validating",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: ProcessingStatus;
  uploadedAt: Date;
  processedAt?: Date;
  metadata?: DocumentMetadata;
  errorMessage?: string;
}

export interface DocumentMetadata {
  extractedText: string;
  confidence: number;
  language: string;
  pageCount?: number;
  documentType?: string;
  // Example metadata for invoice documents
  invoiceNumber?: string;
  customerName?: string;
  totalAmount?: number;
  issueDate?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

export interface ProcessingJob {
  documentId: string;
  filePath: string;
  attempt: number;
}
