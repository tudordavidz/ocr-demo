import React, { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import DocumentList from "./components/DocumentList";
import DocumentDetails from "./components/DocumentDetails";
import { documentService } from "./services/api";
import { Document, ProcessingStatus } from "./types";
import "./App.css";

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Auto-refresh for processing documents
  useEffect(() => {
    const hasProcessingDocuments = documents.some(
      (doc) =>
        doc.status === ProcessingStatus.UPLOADED ||
        doc.status === ProcessingStatus.PROCESSING ||
        doc.status === ProcessingStatus.VALIDATING
    );

    if (hasProcessingDocuments) {
      const interval = setInterval(() => {
        loadDocuments();
      }, 2000); // Refresh every 2 seconds

      return () => clearInterval(interval);
    }
  }, [documents]);

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getAllDocuments();
      setDocuments(docs);

      // Update selected document if it exists
      if (selectedDocument) {
        const updatedSelected = docs.find(
          (doc) => doc.id === selectedDocument.id
        );
        if (updatedSelected) {
          setSelectedDocument(updatedSelected);
        }
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      setError("Failed to load documents. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (documentId: string) => {
    // Reload documents to show the new upload
    await loadDocuments();

    // Select the newly uploaded document
    const newDocument = documents.find((doc) => doc.id === documentId);
    if (newDocument) {
      setSelectedDocument(newDocument);
    }
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📄 OCR Document Processing</h1>
        <p>Upload documents for automatic text extraction and processing</p>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <main className="app-main">
        <div className="upload-section">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="content-section">
          <div className="documents-panel">
            <DocumentList
              documents={documents}
              onDocumentSelect={handleDocumentSelect}
              selectedDocumentId={selectedDocument?.id}
            />
          </div>

          <div className="details-panel">
            {selectedDocument ? (
              <DocumentDetails document={selectedDocument} />
            ) : (
              <div className="no-selection">
                <h3>Select a document</h3>
                <p>
                  Choose a document from the list to view its details and
                  processing results.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
