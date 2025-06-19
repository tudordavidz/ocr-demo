#!/bin/bash

# OCR Demo Test Script
echo "Testing OCR Document Processing Pipeline..."
echo "=========================================="

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:3000/api/health | jq .

echo -e "\n2. Testing document upload..."

# Create a simple test file
echo "INVOICE
Invoice #: INV-2024-001
Customer: Acme Corporation
Amount: $1,250.00
Date: 2024-06-19

This is a test invoice document for OCR processing demo." > test-invoice.txt

# Upload the test document
echo "Uploading test document..."
UPLOAD_RESPONSE=$(curl -s -X POST \
  -F "document=@test-invoice.txt" \
  http://localhost:3000/api/documents/upload)

echo $UPLOAD_RESPONSE | jq .

# Extract document ID
DOCUMENT_ID=$(echo $UPLOAD_RESPONSE | jq -r '.document.id')
echo -e "\nDocument ID: $DOCUMENT_ID"

echo -e "\n3. Waiting for processing to complete..."
sleep 3

echo -e "\n4. Checking document status..."
curl -s "http://localhost:3000/api/documents/$DOCUMENT_ID/status" | jq .

echo -e "\n5. Getting full document details..."
curl -s "http://localhost:3000/api/documents/$DOCUMENT_ID" | jq .

echo -e "\n6. Listing all documents..."
curl -s http://localhost:3000/api/documents | jq .

echo -e "\n7. Getting queue stats..."
curl -s http://localhost:3000/api/documents/health/status | jq .

# Cleanup
rm -f test-invoice.txt

echo -e "\nTest completed!"
