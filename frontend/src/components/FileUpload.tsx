import React, { useState, useRef } from "react";
import { documentService } from "../services/api";

interface FileUploadProps {
  onUploadSuccess: (documentId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/plain", // Added for testing
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      setUploadError(
        "Please upload only images (JPEG, PNG, GIF), PDF files, or text files."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      setUploadError("File size must be less than 10MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await documentService.uploadDocument(file);
      onUploadSuccess(response.document.id);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${isDragging ? "dragging" : ""} ${
          isUploading ? "uploading" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <div className="upload-content">
          {isUploading ? (
            <>
              <div className="upload-spinner"></div>
              <p>Uploading...</p>
            </>
          ) : (
            <>
              <div className="upload-icon">📄</div>
              <p>
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className="upload-hint">
                Images (JPEG, PNG, GIF), PDF files, or text files up to 10MB
              </p>
            </>
          )}
        </div>
      </div>

      {uploadError && <div className="error-message">{uploadError}</div>}
    </div>
  );
};

export default FileUpload;
