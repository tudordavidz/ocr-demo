#!/bin/bash

# OCR Demo - Multi-Format Testing Script
echo "🔍 OCR Document Processing - Multi-Format Test Suite"
echo "=================================================="

# Check if backend is running
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "❌ Backend server is not running!"
    echo "Please start the backend with: npm run dev"
    exit 1
fi

echo "✅ Backend server is running"
echo ""

# Array of test files with descriptions
declare -a test_files=(
    "test-documents/sample-invoice.txt:📄 Invoice Document (TXT)"
    "test-documents/sample-receipt.txt:🧾 Receipt Document (TXT)"
    "test-documents/sample-business-card.txt:💼 Business Card (TXT)"
    "test-documents/sample-contract.txt:📋 Contract Document (TXT)"
    "test-documents/sample-meeting-notes.jpg:📸 Meeting Notes (JPG)"
    "test-documents/sample-product-spec.png:🖼️ Product Spec (PNG)"
    "test-documents/sample-event-flyer.gif:🎨 Event Flyer (GIF)"
    "test-documents/sample-financial-report.pdf:📊 Financial Report (PDF)"
)

# Results tracking
total_tests=0
successful_uploads=0
successful_processing=0
declare -a document_ids=()

echo "🚀 Starting multi-format upload tests..."
echo ""

# Test each file format
for file_info in "${test_files[@]}"; do
    IFS=':' read -r filepath description <<< "$file_info"
    
    total_tests=$((total_tests + 1))
    echo "Testing $description"
    echo "File: $filepath"
    
    if [ ! -f "$filepath" ]; then
        echo "❌ File not found: $filepath"
        echo ""
        continue
    fi
    
    # Upload the document
    echo "📤 Uploading..."
    upload_response=$(curl -s -X POST \
        -F "document=@$filepath" \
        http://localhost:3000/api/documents/upload 2>/dev/null)
    
    if echo "$upload_response" | grep -q "uploaded successfully"; then
        successful_uploads=$((successful_uploads + 1))
        document_id=$(echo "$upload_response" | jq -r '.document.id' 2>/dev/null)
        document_ids+=("$document_id")
        echo "✅ Upload successful - ID: $document_id"
    else
        echo "❌ Upload failed"
        echo "Response: $upload_response"
        echo ""
        continue
    fi
    
    # Wait for processing
    echo "⏳ Waiting for processing..."
    sleep 3
    
    # Check processing result
    echo "🔍 Checking processing status..."
    detail_response=$(curl -s "http://localhost:3000/api/documents/$document_id" 2>/dev/null)
    
    if echo "$detail_response" | grep -q '"status":"completed"'; then
        successful_processing=$((successful_processing + 1))
        echo "✅ Processing completed successfully"
        
        # Extract key metadata
        confidence=$(echo "$detail_response" | jq -r '.document.metadata.confidence' 2>/dev/null)
        doc_type=$(echo "$detail_response" | jq -r '.document.metadata.documentType' 2>/dev/null)
        text_length=$(echo "$detail_response" | jq -r '.document.metadata.extractedText | length' 2>/dev/null)
        
        echo "   📊 Confidence: $(echo "$confidence * 100" | bc -l | cut -d. -f1)%"
        echo "   📋 Document Type: $doc_type"
        echo "   📝 Text Length: $text_length characters"
        
        # Show invoice-specific metadata if available
        if echo "$detail_response" | grep -q '"documentType":"invoice"'; then
            invoice_num=$(echo "$detail_response" | jq -r '.document.metadata.invoiceNumber' 2>/dev/null)
            customer=$(echo "$detail_response" | jq -r '.document.metadata.customerName' 2>/dev/null)
            amount=$(echo "$detail_response" | jq -r '.document.metadata.totalAmount' 2>/dev/null)
            
            if [ "$invoice_num" != "null" ]; then echo "   💰 Invoice #: $invoice_num"; fi
            if [ "$customer" != "null" ]; then echo "   👤 Customer: $customer"; fi
            if [ "$amount" != "null" ]; then echo "   💵 Amount: \$$amount"; fi
        fi
        
    elif echo "$detail_response" | grep -q '"status":"failed"'; then
        echo "❌ Processing failed"
        error_msg=$(echo "$detail_response" | jq -r '.document.errorMessage' 2>/dev/null)
        echo "   Error: $error_msg"
    else
        echo "⏸️ Still processing or unknown status"
        status=$(echo "$detail_response" | jq -r '.document.status' 2>/dev/null)
        echo "   Status: $status"
    fi
    
    echo ""
done

echo "📈 TEST SUMMARY"
echo "=============="
echo "Total Tests: $total_tests"
echo "Successful Uploads: $successful_uploads/$total_tests"
echo "Successful Processing: $successful_processing/$total_tests"
echo ""

if [ ${#document_ids[@]} -gt 0 ]; then
    echo "📋 All Processed Documents:"
    echo "curl http://localhost:3000/api/documents | jq ."
    echo ""
    
    echo "🏥 Queue Statistics:"
    curl -s http://localhost:3000/api/documents/health/status | jq .
    echo ""
fi

echo "🎉 Multi-format testing complete!"
echo ""
echo "💡 To view results in the web interface:"
echo "   Open: http://localhost:5173"
echo ""
echo "📝 To test manually with Postman:"
echo "   Import: OCR_API_Postman_Collection.json"
