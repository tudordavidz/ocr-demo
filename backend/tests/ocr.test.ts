import { simulateOCR, extractMetadata } from "../src/services/ocr";
import { OCRResult } from "../src/types";

describe("OCR Service", () => {
  describe("simulateOCR", () => {
    it("should return OCR result with text and confidence", async () => {
      const mockBuffer = Buffer.from("test image data");
      const result = await simulateOCR(mockBuffer);

      expect(result).toHaveProperty("text");
      expect(result).toHaveProperty("confidence");
      expect(result).toHaveProperty("language");
      expect(typeof result.text).toBe("string");
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.language).toBe("en");
    });

    it("should return different results for different buffer sizes", async () => {
      const buffer1 = Buffer.from("a");
      const buffer2 = Buffer.from("abcd");

      const result1 = await simulateOCR(buffer1);
      const result2 = await simulateOCR(buffer2);

      // Results might be different due to buffer size affecting random selection
      expect(result1).toHaveProperty("text");
      expect(result2).toHaveProperty("text");
      expect(typeof result1.text).toBe("string");
      expect(typeof result2.text).toBe("string");
    });

    it("should simulate processing delay", async () => {
      const mockBuffer = Buffer.from("test");
      const startTime = Date.now();

      await simulateOCR(mockBuffer);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should take at least 500ms (minimum delay)
      expect(processingTime).toBeGreaterThanOrEqual(500);
    });
  });

  describe("extractMetadata", () => {
    it("should extract invoice metadata from OCR result", () => {
      const ocrResult: OCRResult = {
        text: "INVOICE\nInvoice #: INV-2024-001\nCustomer: Acme Corp\nAmount: $1,250.00\nDate: 2024-06-19",
        confidence: 0.95,
        language: "en",
      };

      const result = extractMetadata(ocrResult, "invoice-001.pdf");

      expect(result.documentType).toBe("invoice");
      expect(result.extractedText).toBe(ocrResult.text);
      expect(result.confidence).toBe(0.95);
      expect(result.language).toBe("en");
      expect(result.invoiceNumber).toBe("INV-2024-001");
    });

    it("should extract receipt metadata from OCR result", () => {
      const ocrResult: OCRResult = {
        text: "RECEIPT\nStore: Tech Supplies Inc\nItem: Laptop Computer\nPrice: $899.99\nDate: 2024-06-19",
        confidence: 0.88,
        language: "en",
      };

      const result = extractMetadata(ocrResult, "receipt-001.jpg");

      expect(result.documentType).toBe("receipt");
      expect(result.extractedText).toBe(ocrResult.text);
      expect(result.confidence).toBe(0.88);
    });

    it("should extract business card metadata from OCR result", () => {
      const ocrResult: OCRResult = {
        text: "BUSINESS CARD\nJohn Smith\nSenior Developer\ntech@company.com\n+1-555-0123",
        confidence: 0.92,
        language: "en",
      };

      const result = extractMetadata(ocrResult, "business-card.png");

      expect(result.documentType).toBe("business_card");
      expect(result.extractedText).toBe(ocrResult.text);
      expect(result.confidence).toBe(0.92);
    });

    it("should extract contract metadata from OCR result", () => {
      const ocrResult: OCRResult = {
        text: "CONTRACT\nService Agreement\nParty A: Digital Solutions LLC\nParty B: Client Services Corp\nEffective Date: 2024-06-19",
        confidence: 0.9,
        language: "en",
      };

      const result = extractMetadata(ocrResult, "contract.pdf");

      expect(result.documentType).toBe("contract");
      expect(result.extractedText).toBe(ocrResult.text);
      expect(result.confidence).toBe(0.9);
    });

    it("should handle unknown document types", () => {
      const ocrResult: OCRResult = {
        text: "Some random document text without specific keywords",
        confidence: 0.85,
        language: "en",
      };

      const result = extractMetadata(ocrResult, "unknown.pdf");

      expect(result.documentType).toBe("unknown"); // It assigns "unknown" for unrecognized content
      expect(result.extractedText).toBe(ocrResult.text);
      expect(result.confidence).toBe(0.85);
    });

    it("should set default page count", () => {
      const ocrResult: OCRResult = {
        text: "Test document",
        confidence: 0.85,
        language: "en",
      };

      const result = extractMetadata(ocrResult, "test.pdf");

      expect(result.pageCount).toBe(1);
    });
  });
});
