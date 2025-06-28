import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { UploadedDocument } from '../../types';
import { storage } from '../../utils/localStorage';
import { mockGPTAPI } from '../../utils/mockApis';

interface DocumentUploadProps {
  onDocumentProcessed: (document: UploadedDocument, summary: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentProcessed }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const acceptedTypes = ['.pdf', '.docx', '.txt'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File ${file.name} is too large. Maximum size is 10MB.`;
    }
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type ${extension} is not supported. Please upload PDF, DOCX, or TXT files.`;
    }
    
    return null;
  };

  // Real file processing implementation using FileReader API and other libraries
  const processFile = async (file: File): Promise<void> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      let text = '';
      
      // Get file extension
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (extension === '.txt') {
        // ✅ REAL IMPLEMENTATION: Use FileReader API for text files
        text = await readTextFile(file);
      } else if (extension === '.pdf') {
        // TODO: INSTALL AND IMPLEMENT PDF PARSING
        // Run: npm install pdf-parse @types/pdf-parse
        // Then uncomment and use this code:
        /*
        try {
          const pdfParse = await import('pdf-parse');
          const arrayBuffer = await file.arrayBuffer();
          const data = await pdfParse.default(Buffer.from(arrayBuffer));
          text = data.text;
        } catch (error) {
          console.error('PDF parsing error:', error);
          throw new Error('Failed to parse PDF file. Please ensure it contains readable text.');
        }
        */
        
        // Mock implementation for now
        text = `[PDF Content from ${file.name}] This is mock content. Install pdf-parse library and uncomment the real implementation above.`;
      } else if (extension === '.docx') {
        // TODO: INSTALL AND IMPLEMENT DOCX PARSING
        // Run: npm install mammoth
        // Then uncomment and use this code:
        /*
        try {
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          text = result.value;
        } catch (error) {
          console.error('DOCX parsing error:', error);
          throw new Error('Failed to parse DOCX file. Please ensure it contains readable text.');
        }
        */
        
        // Mock implementation for now
        text = `[DOCX Content from ${file.name}] This is mock content. Install mammoth library and uncomment the real implementation above.`;
      } else {
        throw new Error(`Unsupported file type: ${extension}`);
      }
      
      // Validate that we extracted some text
      if (!text || text.trim().length < 10) {
        throw new Error('No readable text found in the file. Please ensure the file contains text content.');
      }
      
      // Generate concept summary using AI
      const summary = await mockGPTAPI.generateConceptSummary(text);
      
      const document: UploadedDocument = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        content: text,
        uploadedAt: Date.now()
      };
      
      storage.saveDocument(document);
      onDocumentProcessed(document, summary);
      
      setUploadedFiles([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process the document. Please try again.';
      setError(errorMessage);
      console.error('Document processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ REAL IMPLEMENTATION: FileReader API for text files
  const readTextFile = (file: File): Promise<string> => {
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

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = [];
    let errorMessage = '';
    
    files.forEach(file => {
      const validation = validateFile(file);
      if (validation) {
        errorMessage += validation + ' ';
      } else {
        validFiles.push(file);
      }
    });
    
    if (errorMessage) {
      setError(errorMessage.trim());
    } else {
      setError(null);
    }
    
    setUploadedFiles(validFiles);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Upload Your Study Material
        </h2>
        <p className="text-lg text-slate-600">
          Upload documents to start your AI-powered learning session using the Feynman technique
        </p>
      </div>

      {/* Upload Area */}
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-periwinkle-300 hover:border-periwinkle-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="space-y-4">
          <motion.div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              isDragOver ? 'bg-blue-100' : 'bg-periwinkle-100'
            }`}
            animate={{ 
              scale: isDragOver ? 1.1 : 1,
              rotate: isDragOver ? 5 : 0
            }}
          >
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-600' : 'text-periwinkle-600'}`} />
          </motion.div>
          
          <div>
            <p className="text-xl font-semibold text-slate-800 mb-2">
              {isDragOver ? 'Drop your files here' : 'Drag and drop your files'}
            </p>
            <p className="text-sm text-slate-600 mb-4">
              or click to browse and select files
            </p>
            
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
              <motion.button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-periwinkle-500 to-blue-500 text-white rounded-lg font-medium hover:from-periwinkle-600 hover:to-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select Files
              </motion.button>
            </label>
          </div>
          
          <div className="text-xs text-slate-500">
            <p>Supported formats: PDF, DOCX, TXT</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Ready to Process</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-periwinkle-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-periwinkle-600" />
                  <div>
                    <p className="font-medium text-slate-800">{file.name}</p>
                    <p className="text-sm text-slate-600">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-slate-500">
                      {file.name.endsWith('.txt') ? '✅ Ready to process' : '⚠️ Requires additional libraries'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-periwinkle-200 rounded-lg transition-colors"
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </motion.div>
            ))}
          </div>
          
          <motion.button
            onClick={() => uploadedFiles.forEach(processFile)}
            disabled={isProcessing}
            className="mt-4 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Document...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Start Processing</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};