import React from "react";
import { Document } from "../types";
import { getStatusColor, getStatusLabel, formatDate } from "../utils/helpers";

interface DocumentListProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  selectedDocumentId?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentSelect,
  selectedDocumentId,
}) => {
  if (documents.length === 0) {
    return (
      <div className="document-list empty">
        <p>No documents uploaded yet.</p>
        <p>Upload a document to get started.</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      <h3>Documents ({documents.length})</h3>
      <div className="document-items">
        {documents.map((document) => (
          <div
            key={document.id}
            className={`document-item ${
              selectedDocumentId === document.id ? "selected" : ""
            }`}
            onClick={() => onDocumentSelect(document)}
          >
            <div className="document-header">
              <div className="document-name" title={document.originalName}>
                {document.originalName}
              </div>
              <div
                className="document-status"
                style={{ color: getStatusColor(document.status) }}
              >
                {getStatusLabel(document.status)}
              </div>
            </div>

            <div className="document-meta">
              <div className="upload-time">
                Uploaded: {formatDate(document.uploadedAt)}
              </div>
              {document.processedAt && (
                <div className="processed-time">
                  Processed: {formatDate(document.processedAt)}
                </div>
              )}
            </div>

            {document.errorMessage && (
              <div className="error-message">
                Error: {document.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
