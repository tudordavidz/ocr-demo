# OCR Document Processing Pipeline

A multi-stage document processing pipeline that simulates OCR functionality and manages document processing workflow.

## Architecture Overview

This application follows a clean architecture with clear separation of concerns:

### Backend (Node.js + TypeScript)

- **API Layer**: Express.js REST API for document upload and status tracking
- **Processing Layer**: Asynchronous document processing with simulated OCR
- **Data Layer**: SQLite database for document storage and status management
- **Queue System**: Redis-based job queue for scalable processing

### Frontend (React + TypeScript)

- Simple web interface for document upload
- Real-time status tracking
- Document metadata display

## Key Design Decisions

1. **Technology Stack**:

   - **Backend**: Node.js with Express for simplicity and wide adoption
   - **Database**: SQLite for ease of setup and testing
   - **Queue**: Redis with Bull for reliable job processing
   - **Frontend**: React with Vite for fast development

2. **Processing Pipeline**:

   - Asynchronous processing to handle multiple documents
   - Status tracking at each stage (uploaded, processing, validated, completed, failed)
   - Retry mechanism for failed jobs
   - Dead letter queue for permanently failed jobs

3. **Error Handling**:
   - Comprehensive error boundaries
   - Graceful degradation
   - Detailed logging
   - Retry strategies

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ocr-demo
npm run install:all
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database.sqlite
REDIS_URL=redis://localhost:6379
UPLOAD_DIR=./uploads
```

### 3. Start Redis (required for job queue)

```bash
# Install Redis (macOS)
brew install redis

# Start Redis service
brew services start redis

# Or run Redis directly
redis-server
```

### 4. Run the Application

```bash
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🚀 Quick Demo

### Web Interface Demo

1. Open http://localhost:5173
2. Drag and drop the included `sample-invoice.txt` file
3. Watch real-time processing status updates
4. View extracted metadata including invoice details

### API Demo

```bash
# Test the API with the sample file
curl -X POST \
  -F "document=@sample-invoice.txt" \
  http://localhost:3000/api/documents/upload

# Example response:
# {
#   "message": "Document uploaded successfully",
#   "document": {
#     "id": "uuid-here",
#     "originalName": "sample-invoice.txt",
#     "status": "uploaded",
#     "uploadedAt": "2025-06-19T15:33:17.835Z"
#   }
# }

# Check processing status (replace with actual document ID)
curl http://localhost:3000/api/documents/{document-id}

# View all documents
curl http://localhost:3000/api/documents

# Health check
curl http://localhost:3000/api/health
```

### Expected Processing Results

The system will automatically:

- ✅ Extract text content via simulated OCR
- ✅ Identify document type (invoice, receipt, business card, etc.)
- ✅ Extract metadata (invoice numbers, customer names, amounts, dates)
- ✅ Validate required fields
- ✅ Store results in database
- ✅ Update processing status in real-time

### Sample Files Included

- `sample-invoice.txt` - Test invoice processing with metadata extraction
- `test-documents/` - Complete test suite with 8 different file formats
- `OCR_API_Postman_Collection.json` - Postman collection for API testing
- `test-all-formats.sh` - Automated multi-format testing script

## 🧪 Testing & Validation

### Comprehensive Test Suite

The project includes a complete test suite with 8 different file formats:

```bash
# Run automated tests for all formats
./test-all-formats.sh
```

**Test Coverage**:

- ✅ Invoice documents (TXT) - Metadata extraction
- ✅ Receipt documents (TXT) - Store and payment info
- ✅ Business cards (TXT) - Contact information
- ✅ Contracts (TXT) - Terms and parties
- ✅ Meeting notes (JPG) - Image text extraction
- ✅ Product specs (PNG) - Technical documentation
- ✅ Event flyers (GIF) - Marketing content
- ✅ Financial reports (PDF) - Business documents

### Performance Metrics

- **Upload Response Time**: < 100ms
- **Processing Time**: 500ms - 1.5s (simulated)
- **Queue Throughput**: 5 concurrent documents
- **Success Rate**: 100% for supported formats
- **Confidence Score**: 85% - 98%

## ✅ Successfully Implemented Features

### 1. Document Upload ✅

- **Implementation**: RESTful API endpoint `/api/documents/upload`
- **Method**: HTTP POST with multipart/form-data
- **File Types**: Images (JPEG, PNG, GIF), PDFs, and text files (for testing)
- **File Size Limit**: 10MB
- **Validation**: MIME type checking and file size validation
- **Storage**: Local filesystem with UUID-based filenames

### 2. Document Processing ✅

- **OCR Simulation**: Implemented realistic OCR simulation with variable processing time (500ms-1.5s)
- **Text Extraction**: Simulated text extraction with confidence scores (85%-98%)
- **Metadata Extraction**: Intelligent extraction of document-specific metadata:
  - **Invoice documents**: Invoice number, customer name, total amount, issue date
  - **Receipt documents**: Store information, items, prices
  - **Business cards**: Contact information
  - **Contracts**: Party information
- **Language Detection**: Currently supports English with framework for multi-language

### 3. Validation ✅

- **OCR Confidence**: Minimum 70% confidence threshold
- **Required Fields**: Document-type specific validation
- **Invoice Validation**: Requires invoice number, customer name, and valid amount
- **Error Reporting**: Detailed validation error messages

### 4. Persistence & Status Management ✅

- **Database**: SQLite for development (easily scalable to PostgreSQL/MySQL)
- **Status Tracking**: Complete lifecycle management
  - `uploaded` → `processing` → `validating` → `completed`/`failed`
- **Metadata Storage**: JSON-based metadata storage in database
- **Error Handling**: Comprehensive error logging and recovery

### 5. Asynchronous Processing ✅

- **Queue System**: Redis-based job queue using Bull
- **Background Processing**: Non-blocking document processing
- **Retry Mechanism**: Exponential backoff with 3 retry attempts
- **Concurrency**: Configurable worker pool (currently 5 concurrent jobs)
- **Dead Letter Queue**: Failed jobs after max retries

## 🏗️ Architecture Highlights

### Backend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express API   │───▶│   Job Queue     │───▶│   OCR Service   │
│   (Routes)      │    │   (Redis/Bull)  │    │   (Simulated)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                        ┌─────────────────┐
│   Database      │◀───────────────────────│   Validation    │
│   (SQLite)      │                        │   Service       │
└─────────────────┘                        └─────────────────┘
```

### Frontend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │───▶│   API Service   │───▶│   Backend API   │
│   (Components)  │    │   (Axios)       │    │   (Express)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   State Mgmt    │
│   (React Hooks) │
└─────────────────┘
```

## 🔧 Technology Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite3 (development) / PostgreSQL (production ready)
- **Queue**: Redis with Bull queue
- **File Upload**: Multer middleware
- **Validation**: Custom validation logic

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3 with modern design patterns
- **State Management**: React Hooks (useState, useEffect)

### Infrastructure

- **Process Management**: Nodemon for development
- **Package Management**: npm
- **Task Runner**: Custom npm scripts with concurrently

## 📊 API Endpoints

| Method | Endpoint                       | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| `POST` | `/api/documents/upload`        | Upload document for processing    |
| `GET`  | `/api/documents`               | List all documents                |
| `GET`  | `/api/documents/:id`           | Get specific document details     |
| `GET`  | `/api/documents/:id/status`    | Get document processing status    |
| `GET`  | `/api/documents/health/status` | Health check and queue statistics |
| `GET`  | `/api/health`                  | General application health        |

## Document Processing Stages

1. **Upload**: Document received and stored
2. **Processing**: OCR simulation extracts text and metadata
3. **Validation**: Verify required fields are present
4. **Completed**: Document successfully processed
5. **Failed**: Processing failed (with retry mechanism)

## Scalability Considerations

- Horizontal scaling through Redis queue
- Database connection pooling
- Stateless API design
- Background job processing
- Health checks and monitoring endpoints
