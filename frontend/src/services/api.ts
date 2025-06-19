import axios from "axios";
import {
  Document,
  DocumentsResponse,
  DocumentResponse,
  UploadResponse,
} from "../types";

const API_BASE_URL = "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const documentService = {
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("document", file);

    const response = await api.post<UploadResponse>(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async getAllDocuments(): Promise<Document[]> {
    const response = await api.get<DocumentsResponse>("/documents");
    return response.data.documents;
  },

  async getDocument(id: string): Promise<Document> {
    const response = await api.get<DocumentResponse>(`/documents/${id}`);
    return response.data.document;
  },

  async getDocumentStatus(
    id: string
  ): Promise<{
    id: string;
    status: string;
    uploadedAt: string;
    processedAt?: string;
    errorMessage?: string;
  }> {
    const response = await api.get(`/documents/${id}/status`);
    return response.data;
  },
};
