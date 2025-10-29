// File processing utilities using browser APIs and external libraries

/**
 * Process different file types and extract text content
 */

// ✅ REAL IMPLEMENTATION: FileReader API for text files (built-in browser API)
export const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    // Read the file as text with UTF-8 encoding
    reader.readAsText(file, 'UTF-8');
  });
};


// TODO: INSTALL DOCX PARSING LIBRARY
// Run: npm install mammoth
export const readDocxFile = async (file: File): Promise<string> => {
  try {
    // Uncomment this when you install mammoth:
    
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file. Please ensure it contains readable text.');
  }
};

// ✅ REAL IMPLEMENTATION: File type detection
export const getFileExtension = (filename: string): string => {
  return '.' + filename.split('.').pop()?.toLowerCase();
};

// ✅ REAL IMPLEMENTATION: File validation
export const validateFile = (file: File, maxSize: number = 10 * 1024 * 1024): string | null => {
  const acceptedTypes = ['.docx', '.txt'];
  
  if (file.size > maxSize) {
    return `File ${file.name} is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`;
  }
  
  const extension = getFileExtension(file.name);
  if (!acceptedTypes.includes(extension)) {
    return `File type ${extension} is not supported. Please upload DOCX or TXT files.`;
  }
  
  return null;
};

// ✅ REAL IMPLEMENTATION: Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ✅ REAL IMPLEMENTATION: Process any supported file type
export const processFile = async (file: File): Promise<string> => {
  const extension = getFileExtension(file.name);

  if (extension === ".txt") {
    // Handle text files locally
    return await readTextFile(file);
  }

  if (extension === ".docx") {
    // Send file to backend API for parsing
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/parse", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${errorText}`);
    }

    const data = await response.json();
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No readable text found in the uploaded file.");
    }

    return data.text;
  }

  throw new Error(`Unsupported file type: ${extension}`);
};