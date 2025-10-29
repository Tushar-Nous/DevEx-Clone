import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, FileText, Send, Download, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as XLSX from 'xlsx';
import { API_ENDPOINTS } from '../config/api';

function GuidelinesGenerator() {
  const [inputType, setInputType] = useState('chat');
  const [chatInput, setChatInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [guidelines, setGuidelines] = useState(null);
  const fileInputRef = useRef();

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setInputType('file');
    
    try {
      const content = await extractFileContent(file);
      setFileContent(content);
      toast.success(`File "${file.name}" loaded successfully`);
    } catch (error) {
      toast.error(`Failed to read file: ${error.message}`);
      setSelectedFile(null);
      setFileContent('');
    }
  };

  const extractFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const ext = file.name.split('.').pop().toLowerCase();
          
          if (ext === 'pdf') {
            // For PDF, we'll extract text content
            // Note: This is a simplified approach. In production, you might want to use a proper PDF parser
            resolve(`PDF Content: ${file.name} - File size: ${(file.size / 1024).toFixed(2)} KB`);
          } else if (ext === 'xlsx' || ext === 'xls') {
            // For Excel files, extract text content
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            let text = '';
            workbook.SheetNames.forEach(sheetName => {
              const sheet = workbook.Sheets[sheetName];
              text += `Sheet: ${sheetName}\n`;
              text += XLSX.utils.sheet_to_csv(sheet);
              text += '\n\n';
            });
            resolve(text);
          } else if (ext === 'txt' || ext === 'md') {
            // For text files
            resolve(e.target.result);
          } else {
            reject(new Error('Unsupported file type. Please upload PDF, Excel, or Text file.'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type.includes('pdf') || file.type.includes('excel') || file.type.includes('spreadsheet')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileContent('');
    setInputType('chat');
  };

  const getInputContent = () => {
    switch (inputType) {
      case 'chat':
        return chatInput;
      case 'file':
        return fileContent;
      default:
        return '';
    }
  };

  const generateGuidelines = async () => {
    const content = getInputContent();
    
    if (!content.trim()) {
      toast.error('Please provide some input content');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.generateGuidelines, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGuidelines(data);
      toast.success('Guidelines generated successfully!');
      
    } catch (error) {
      toast.error('Failed to generate guidelines');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadGuidelines = () => {
    if (!guidelines) return;
    
    const element = document.createElement('a');
    const content = typeof guidelines === 'string' ? guidelines : JSON.stringify(guidelines, null, 2);
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'generated-guidelines.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            AI Guidelines Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your requirements into comprehensive design guidelines using advanced AI technology
          </p>
        </div>

        {/* Input Type Selection */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Input Method</h2>
            <p className="text-blue-100">Choose how you'd like to provide your requirements</p>
          </div>
          
          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setInputType('chat')}
                className={`flex-1 px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 ${
                  inputType === 'chat' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">Chat Input</span>
              </button>
              <button
                onClick={() => setInputType('file')}
                className={`flex-1 px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 ${
                  inputType === 'file' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">File Upload</span>
              </button>
            </div>

            {/* Chat Input */}
            {inputType === 'chat' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Send className="w-5 h-5 text-blue-600" />
                  <label className="block text-sm font-semibold text-gray-800">
                    Requirement Description
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="I need the system ability to ingest bureau rating algorithms. I will import filing to create rating calculation using AI and leverage machine learning for premium calculations..."
                    className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none text-gray-700 placeholder-gray-400 shadow-sm"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {chatInput.length} characters
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            {inputType === 'file' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <label className="block text-sm font-semibold text-gray-800">
                    Document Upload
                  </label>
                </div>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 bg-gradient-to-b from-blue-25 to-white"
                >
                  {!selectedFile ? (
                    <>
                      <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Your Document</h3>
                      <p className="text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                      <p className="text-sm text-gray-500 mb-6">Supports: PDF, Excel (.xlsx, .xls), Text (.txt, .md)</p>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Choose File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.xlsx,.xls,.txt,.md"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                        <FileText className="w-10 h-10 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-800 transition-colors font-medium"
                      >
                        Remove File
                      </button>
                    </div>
                  )}
                </div>

                {fileContent && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <label className="block text-sm font-semibold text-gray-800">
                        Extracted Content Preview
                      </label>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {fileContent.substring(0, 500)}
                        {fileContent.length > 500 && (
                          <span className="text-blue-600 font-medium">... ({fileContent.length - 500} more characters)</span>
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={generateGuidelines}
            disabled={isProcessing || !getInputContent().trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-2xl text-lg font-semibold shadow-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-3xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Generating Guidelines...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                Generate AI Guidelines
              </>
            )}
          </button>
        </div>

        {/* Generated Guidelines */}
        {guidelines && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Generated Guidelines</h2>
                    <p className="text-green-100">AI-powered design guidelines ready for implementation</p>
                  </div>
                </div>
                <button
                  onClick={downloadGuidelines}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                {typeof guidelines === 'string' ? (
                  <ReactMarkdown 
                    className="markdown-content"
                    components={{
                      h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-200 pb-3">{children}</h1>,
                      h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-medium text-gray-700 mb-3 mt-6">{children}</h3>,
                      p: ({children}) => <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                      li: ({children}) => <li className="text-gray-600">{children}</li>,
                      code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600">{children}</code>,
                      pre: ({children}) => <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,
                      strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>
                    }}
                  >
                    {guidelines}
                  </ReactMarkdown>
                ) : guidelines.guidelines ? (
                  <ReactMarkdown 
                    className="markdown-content"
                    components={{
                      h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-200 pb-3">{children}</h1>,
                      h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-medium text-gray-700 mb-3 mt-6">{children}</h3>,
                      p: ({children}) => <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                      li: ({children}) => <li className="text-gray-600">{children}</li>,
                      code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600">{children}</code>,
                      pre: ({children}) => <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,
                      strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>
                    }}
                  >
                    {guidelines.guidelines}
                  </ReactMarkdown>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border">
                    {JSON.stringify(guidelines, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Example Input */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Example Input</h2>
                <p className="text-gray-200">Sample requirement for AI guidelines generation</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 mb-4 font-medium">Here's an example of the expected input format:</p>
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">
{`"I need the system ability to ingest bureau rating algorithms. As an actuary, as part of rate making process, I will import filing to create rating calculation using AI and leverage machine learning for premium calculations. The objective of the requirement is to automate the process of interpreting insurer-submitted rate filing documents (PDFs) and converting them into executable rating logic using AI."`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuidelinesGenerator;
