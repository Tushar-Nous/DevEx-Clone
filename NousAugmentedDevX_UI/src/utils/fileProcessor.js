import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export const processFile = async (file) => {
  try {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await processPDF(file);
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || 
               fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return await processExcel(file);
    } else if (fileType.includes('word') || fileType.includes('document') ||
               fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return await processWord(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await processText(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    throw new Error('Failed to process file');
  }
};

const processPDF = async (file) => {
  try {
    // For PDF processing, we'll use a simple text extraction approach
    // In a production environment, you might want to use a more sophisticated PDF parser
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Simple text extraction from PDF (basic approach)
    // This is a simplified version - in production, use a proper PDF library
    let text = '';
    
    // Convert binary data to text (basic extraction)
    for (let i = 0; i < uint8Array.length; i++) {
      const byte = uint8Array[i];
      if (byte >= 32 && byte <= 126) { // Printable ASCII characters
        text += String.fromCharCode(byte);
      } else if (byte === 10 || byte === 13) { // Newline characters
        text += '\n';
      }
    }
    
    // Clean up the extracted text
    text = text.replace(/\s+/g, ' ').trim();
    
    if (!text || text.length < 10) {
      throw new Error('Could not extract meaningful text from PDF');
    }
    
    return text;
  } catch (error) {
    throw new Error('PDF processing failed. Please ensure the file is not corrupted and contains extractable text.');
  }
};

const processExcel = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    let allText = '';
    
    // Process each sheet
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert sheet data to text
      jsonData.forEach(row => {
        if (Array.isArray(row)) {
          row.forEach(cell => {
            if (cell !== null && cell !== undefined) {
              allText += cell.toString() + ' ';
            }
          });
          allText += '\n';
        }
      });
      
      allText += '\n--- Sheet: ' + sheetName + ' ---\n\n';
    });
    
    if (!allText.trim()) {
      throw new Error('No data found in Excel file');
    }
    
    return allText.trim();
  } catch (error) {
    throw new Error('Excel processing failed. Please ensure the file is not corrupted and contains data.');
  }
};

const processWord = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in Word document');
    }
    
    return result.value.trim();
  } catch (error) {
    throw new Error('Word document processing failed. Please ensure the file is not corrupted and contains text.');
  }
};

const processText = async (file) => {
  try {
    const text = await file.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Text file is empty');
    }
    
    return text.trim();
  } catch (error) {
    throw new Error('Text file processing failed. Please ensure the file is not corrupted.');
  }
};

// Helper function to validate file size
export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
  return true;
};

// Helper function to validate file type
export const validateFileType = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not supported`);
  }
  
  return true;
};

// Helper function to extract file metadata
export const extractFileMetadata = (file) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
  };
};

// Helper function to clean extracted text
export const cleanExtractedText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .replace(/[^\w\s\-.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>]/g, '') // Remove special characters
    .trim();
};

// Helper function to detect insurance domain keywords
export const detectInsuranceKeywords = (text) => {
  const insuranceKeywords = [
    'insurance', 'policy', 'claim', 'premium', 'coverage', 'deductible',
    'beneficiary', 'underwriting', 'risk', 'liability', 'damage', 'loss',
    'settlement', 'adjuster', 'agent', 'broker', 'carrier', 'insured',
    'policyholder', 'endorsement', 'exclusion', 'limit', 'renewal'
  ];
  
  const lowerText = text.toLowerCase();
  const foundKeywords = insuranceKeywords.filter(keyword => 
    lowerText.includes(keyword)
  );
  
  return foundKeywords;
};

// Helper function to estimate content quality
export const estimateContentQuality = (text) => {
  if (!text || text.length < 50) {
    return { score: 0, issues: ['Content too short'] };
  }
  
  const issues = [];
  let score = 100;
  
  // Check for minimum content length
  if (text.length < 100) {
    score -= 20;
    issues.push('Content length below recommended minimum');
  }
  
  // Check for insurance domain relevance
  const insuranceKeywords = detectInsuranceKeywords(text);
  if (insuranceKeywords.length < 3) {
    score -= 30;
    issues.push('Limited insurance domain keywords detected');
  }
  
  // Check for structured content
  if (!text.includes('\n') && text.length > 500) {
    score -= 15;
    issues.push('Content lacks structure (no line breaks)');
  }
  
  // Check for special characters that might indicate formatting issues
  const specialCharRatio = (text.match(/[^\w\s]/g) || []).length / text.length;
  if (specialCharRatio > 0.3) {
    score -= 10;
    issues.push('High ratio of special characters');
  }
  
  return {
    score: Math.max(0, score),
    issues: issues.length > 0 ? issues : ['No issues detected'],
    keywordCount: insuranceKeywords.length,
    contentLength: text.length
  };
};
