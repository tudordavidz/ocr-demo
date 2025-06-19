import React from "react";
import { Document } from "../types";
import { getStatusColor, getStatusLabel, formatDate } from "../utils/helpers";

interface DocumentDetailsProps {
  document: Document;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ document }) => {
  return (
    <div className="document-details">
      <div className="details-header">
        <h3>Document Details</h3>
        <div
          className="status-badge"
          style={{
            backgroundColor: getStatusColor(document.status),
            color: "white",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {getStatusLabel(document.status)}
        </div>
      </div>

      <div className="details-content">
        <div className="detail-section">
          <h4>Basic Information</h4>
          <div className="detail-row">
            <span className="detail-label">File Name:</span>
            <span className="detail-value">{document.originalName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Uploaded:</span>
            <span className="detail-value">
              {formatDate(document.uploadedAt)}
            </span>
          </div>
          {document.processedAt && (
            <div className="detail-row">
              <span className="detail-label">Processed:</span>
              <span className="detail-value">
                {formatDate(document.processedAt)}
              </span>
            </div>
          )}
        </div>

        {document.metadata && (
          <div className="detail-section">
            <h4>Extracted Metadata</h4>
            <div className="detail-row">
              <span className="detail-label">Confidence:</span>
              <span className="detail-value">
                {Math.round(document.metadata.confidence * 100)}%
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Language:</span>
              <span className="detail-value">
                {document.metadata.language.toUpperCase()}
              </span>
            </div>
            {document.metadata.documentType && (
              <div className="detail-row">
                <span className="detail-label">Document Type:</span>
                <span className="detail-value">
                  {document.metadata.documentType
                    .replace("_", " ")
                    .toUpperCase()}
                </span>
              </div>
            )}
            {document.metadata.invoiceNumber && (
              <div className="detail-row">
                <span className="detail-label">Invoice Number:</span>
                <span className="detail-value">
                  {document.metadata.invoiceNumber}
                </span>
              </div>
            )}
            {document.metadata.customerName && (
              <div className="detail-row">
                <span className="detail-label">Customer:</span>
                <span className="detail-value">
                  {document.metadata.customerName}
                </span>
              </div>
            )}
            {document.metadata.totalAmount && (
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">
                  ${document.metadata.totalAmount.toFixed(2)}
                </span>
              </div>
            )}
            {document.metadata.issueDate && (
              <div className="detail-row">
                <span className="detail-label">Issue Date:</span>
                <span className="detail-value">
                  {document.metadata.issueDate}
                </span>
              </div>
            )}
          </div>
        )}

        {document.metadata?.extractedText && (
          <div className="detail-section">
            <h4>Extracted Text</h4>
            <div className="extracted-text">
              {document.metadata.extractedText}
            </div>
          </div>
        )}

        {document.errorMessage && (
          <div className="detail-section error">
            <h4>Error Details</h4>
            <div className="error-message">{document.errorMessage}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetails;
