# Test Documents for OCR Demo

This folder contains various document formats to test the OCR processing pipeline comprehensively.

## Available Test Files

### 📄 Text Files (.txt)

- `sample-invoice.txt` - Professional invoice with customer details, line items, and totals
- `sample-receipt.txt` - Retail receipt with items, prices, and payment info
- `sample-business-card.txt` - Business card with contact information and specialties
- `sample-contract.txt` - Service agreement with terms, pricing, and signatures

### 🖼️ Image Files (.jpg, .png, .gif)

- `sample-meeting-notes.jpg` - Meeting notes with attendees and action items
- `sample-product-spec.png` - Technical product specification sheet
- `sample-event-flyer.gif` - Event announcement with schedule and pricing

### 📊 Document Files (.pdf)

- `sample-financial-report.pdf` - Annual financial report with metrics and projections

## Expected Processing Results

Each document type will demonstrate different OCR capabilities:

### Invoice Documents

- ✅ Extract invoice number
- ✅ Identify customer information
- ✅ Parse total amounts
- ✅ Detect dates
- ✅ Document type classification

### Receipt Documents

- ✅ Store/merchant identification
- ✅ Item and price extraction
- ✅ Payment method detection
- ✅ Date and time parsing

### Business Cards

- ✅ Contact information extraction
- ✅ Company and title identification
- ✅ Communication details (email, phone)

### Contracts

- ✅ Party identification
- ✅ Terms and conditions parsing
- ✅ Financial terms extraction

### General Documents

- ✅ Text extraction with confidence scoring
- ✅ Language detection
- ✅ Document type classification
- ✅ Metadata generation

## Running Tests

### Automated Testing

Run all formats at once:

```bash
./test-all-formats.sh
```

### Manual Testing via API

```bash
# Upload a specific file
curl -X POST \
  -F "document=@test-documents/sample-invoice.txt" \
  http://localhost:3000/api/documents/upload

# Check processing status
curl http://localhost:3000/api/documents/{document-id}
```

### Web Interface Testing

1. Open http://localhost:5173
2. Drag and drop any file from this folder
3. Watch real-time processing
4. View extracted metadata

### Postman Testing

Import `OCR_API_Postman_Collection.json` and use the file upload requests with these test documents.

## File Formats Supported

✅ **Images**: JPEG (.jpg), PNG (.png), GIF (.gif)  
✅ **Documents**: PDF (.pdf)  
✅ **Text**: Plain text (.txt) - for testing purposes  
⚠️ **Size Limit**: 10MB maximum

## Expected Performance

- **Upload Time**: < 100ms
- **Processing Time**: 500ms - 1.5s (simulated OCR)
- **Confidence Score**: 85% - 98%
- **Success Rate**: 100% for valid formats

## Validation Tests

The system includes validation for:

- Required fields per document type
- Minimum confidence thresholds (70%)
- File format compliance
- Size limitations

Test these by uploading the provided documents and observing the metadata extraction and validation results.
