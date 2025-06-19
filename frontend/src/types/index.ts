export enum ProcessingStatus {
  UPLOADED = "uploaded",
  PROCESSING = "processing",
  VALIDATING = "validating",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Document {
  id: string;
  originalName: string;
  status: ProcessingStatus;
  uploadedAt: string;
  processedAt?: string;
  metadata?: DocumentMetadata;
  errorMessage?: string;
}

export interface DocumentMetadata {
  extractedText: string;
  confidence: number;
  language: string;
  pageCount?: number;
  documentType?: string;
  invoiceNumber?: string;
  customerName?: string;
  totalAmount?: number;
  issueDate?: string;
}

export interface UploadResponse {
  message: string;
  document: {
    id: string;
    originalName: string;
    status: ProcessingStatus;
    uploadedAt: string;
  };
}

export interface DocumentsResponse {
  documents: Document[];
}

export interface DocumentResponse {
  document: Document;
}
