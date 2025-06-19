import { OCRResult, DocumentMetadata } from "../types";

export function simulateOCR(imageBuffer: Buffer): Promise<OCRResult> {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Generate different sample texts based on buffer size to add some variety
      const sampleTexts = [
        "INVOICE\nInvoice #: INV-2024-001\nCustomer: Acme Corp\nAmount: $1,250.00\nDate: 2024-06-19",
        "RECEIPT\nStore: Tech Supplies Inc\nItem: Laptop Computer\nPrice: $899.99\nDate: 2024-06-19",
        "BUSINESS CARD\nJohn Smith\nSenior Developer\ntech@company.com\n+1-555-0123",
        "CONTRACT\nService Agreement\nParty A: Digital Solutions LLC\nParty B: Client Services Corp\nEffective Date: 2024-06-19",
      ];

      const randomIndex = imageBuffer.length % sampleTexts.length;
      const text = sampleTexts[randomIndex];

      // Simulate confidence based on "document quality"
      const confidence = 0.85 + Math.random() * 0.13; // 0.85 to 0.98

      resolve({
        text,
        confidence: Math.round(confidence * 100) / 100,
        language: "en",
      });
    }, 500 + Math.random() * 1000); // 500ms to 1.5s processing time
  });
}

export function extractMetadata(
  ocrResult: OCRResult,
  filename: string
): DocumentMetadata {
  const metadata: DocumentMetadata = {
    extractedText: ocrResult.text,
    confidence: ocrResult.confidence,
    language: ocrResult.language,
    pageCount: 1,
  };

  // Extract document type and specific metadata based on content
  const text = ocrResult.text.toLowerCase();

  if (text.includes("invoice")) {
    metadata.documentType = "invoice";

    // Extract invoice-specific metadata
    const invoiceMatch = ocrResult.text.match(/invoice #?:?\s*([^\n\r]+)/i);
    if (invoiceMatch) {
      metadata.invoiceNumber = invoiceMatch[1].trim();
    }

    const customerMatch = ocrResult.text.match(/customer:?\s*([^\n\r]+)/i);
    if (customerMatch) {
      metadata.customerName = customerMatch[1].trim();
    }

    const amountMatch = ocrResult.text.match(
      /amount:?\s*\$?([0-9,]+\.?[0-9]*)/i
    );
    if (amountMatch) {
      metadata.totalAmount = parseFloat(amountMatch[1].replace(",", ""));
    }

    const dateMatch = ocrResult.text.match(
      /date:?\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i
    );
    if (dateMatch) {
      metadata.issueDate = dateMatch[1];
    }
  } else if (text.includes("receipt")) {
    metadata.documentType = "receipt";
  } else if (text.includes("business card")) {
    metadata.documentType = "business_card";
  } else if (text.includes("contract")) {
    metadata.documentType = "contract";
  } else {
    metadata.documentType = "unknown";
  }

  return metadata;
}

export function validateDocument(metadata: DocumentMetadata): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Basic validation
  if (!metadata.extractedText || metadata.extractedText.trim().length === 0) {
    errors.push("No text could be extracted from the document");
  }

  if (metadata.confidence < 0.7) {
    errors.push("OCR confidence is too low (minimum 70% required)");
  }

  // Document-specific validation
  if (metadata.documentType === "invoice") {
    if (!metadata.invoiceNumber) {
      errors.push("Invoice number is required for invoice documents");
    }
    if (!metadata.customerName) {
      errors.push("Customer name is required for invoice documents");
    }
    if (!metadata.totalAmount || metadata.totalAmount <= 0) {
      errors.push("Valid total amount is required for invoice documents");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
