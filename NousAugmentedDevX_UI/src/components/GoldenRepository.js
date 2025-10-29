import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Database, 
  Code, 
  TestTube, 
  Rocket, 
  Shield,
  ChevronRight,
  Download,
  Eye,
  Folder,
  Image,
  File,
  FileCode,
  FileSpreadsheet,
  Search,

  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { getMockFileStructure, getMockFileContent } from '../utils/goldenRepoService';

// Section configurations with beautiful icons and colors
const sections = [
  {
    id: '0-docs',
    title: 'Documentation',
    subtitle: 'Governance & Architecture',
    icon: BookOpen,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'AI governance guidelines, SDLC checklists, glossary, and architecture reference documents.',
    badge: 'Governance'
  },
  {
    id: '1-requirements',
    title: 'Requirements',
    subtitle: 'Use Cases & Templates',
    icon: FileText,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    description: 'AI use-case templates, risk assessment forms, and sample insurance AI use cases.',
    badge: 'Templates'
  },
  {
    id: '2-data',
    title: 'Data Management',
    subtitle: 'Governance & Datasets',
    icon: Database,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Data governance guides, synthetic datasets by LOB, validation scripts, and bias checks.',
    badge: 'Datasets'
  },
  {
    id: '3-code',
    title: 'Code & Integration',
    subtitle: 'SDKs & Examples',
    icon: Code,
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
    description: 'Integration SDKs, prompt templates, example services, and secure AI patterns.',
    badge: 'SDK'
  },
  {
    id: '4-testing',
    title: 'Testing Framework',
    subtitle: 'Quality Assurance',
    icon: TestTube,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    description: 'Unit tests, prompt tests, regression tests, bias tests, and CI/CD integration.',
    badge: 'QA'
  },
  {
    id: '5-deployment',
    title: 'Deployment',
    subtitle: 'MLOps & Monitoring',
    icon: Rocket,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    description: 'MLOps pipelines, model cards, monitoring dashboards, and rollback strategies.',
    badge: 'MLOps'
  },
  {
    id: '6-compliance',
    title: 'Compliance',
    subtitle: 'Audit & Standards',
    icon: Shield,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    description: 'ISO27001 mapping, NAIC guidance, audit log formats, and responsible AI metrics.',
    badge: 'Audit'
  }
];

// File type icons mapping
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const name = fileName.toLowerCase();
  
  if (name.includes('readme')) return FileText;
  if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(extension)) return Image;
  if (['py', 'js', 'ts', 'jsx', 'tsx', 'java', 'cpp', 'c'].includes(extension)) return FileCode;
  if (['csv', 'xlsx', 'xls'].includes(extension)) return FileSpreadsheet;
  if (['md', 'txt', 'doc', 'docx'].includes(extension)) return FileText;
  if (['yml', 'yaml', 'json', 'xml'].includes(extension)) return FileCode;
  return File;
};

const GoldenRepository = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [fileStructure, setFileStructure] = useState({});



  useEffect(() => {
    // Load file structure using the service
    const loadFileStructure = async () => {
      try {
        // In a real implementation, you might try to read from filesystem first
        // For now, we'll use the mock data
        const structure = getMockFileStructure();
        setFileStructure(structure);
      } catch (error) {
        console.error('Error loading file structure:', error);
        // Fallback to empty structure
        setFileStructure({});
      }
    };
    
    loadFileStructure();
  }, []);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setSelectedFile(null);
    setFileContent('');
  };

  const handleFileClick = async (file, path = '') => {
    setSelectedFile({ ...file, path });
    setIsLoading(true);
    
    try {
      // Build the full path for the file
      const fullPath = path ? `${selectedSection?.id}/${path}/${file.name}` : `${selectedSection?.id}/${file.name}`;
      
      // Get file content using the service
      const content = getMockFileContent(fullPath);
      setFileContent(content);
    } catch (error) {
      console.error('Error loading file content:', error);
      setFileContent(`Error loading file content: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setSelectedFile(null);
    setFileContent('');
    setSearchTerm('');
  };

  const handleBackToFiles = () => {
    setSelectedFile(null);
    setFileContent('');
  };

  const renderFileTree = (files, level = 0, parentPath = '') => {
    return files.map((file, index) => {
      const FileIcon = getFileIcon(file.name);
      const isFolder = file.type === 'folder';
      const currentPath = parentPath ? `${parentPath}/${file.name}` : file.name;
      
      return (
        <div key={index} style={{ marginLeft: `${level * 16}px` }}>
          <div
            onClick={() => !isFolder && handleFileClick(file, parentPath)}
            className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
              !isFolder 
                ? 'hover:bg-gray-50 hover:shadow-sm cursor-pointer border border-transparent hover:border-gray-200' 
                : 'cursor-default'
            }`}
          >
            <div className={`p-2 rounded-lg mr-3 ${
              isFolder 
                ? 'bg-yellow-100 text-yellow-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {isFolder ? <Folder className="w-4 h-4" /> : <FileIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{file.name}</div>
              {!isFolder && file.size && (
                <div className="text-xs text-gray-500">{file.size}</div>
              )}
            </div>
            {!isFolder && (
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileClick(file, parentPath);
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View file"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {isFolder && file.children && (
            <div className="ml-4 border-l border-gray-200 pl-4 mt-2">
              {renderFileTree(file.children, level + 1, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  // Main sections view
  if (!selectedSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <Database className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Insurance Golden Repository
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Single source of truth for AI-enabled SDLC in the insurance domain. 
                Build, test, govern, deploy, and monitor AI features responsibly and at speed.
              </p>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  onClick={() => handleSectionClick(section)}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative p-8">
                    {/* Icon and Badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 bg-gradient-to-br ${section.gradient} rounded-2xl shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <span className={`px-3 py-1 bg-${section.color}-100 text-${section.color}-700 text-xs font-semibold rounded-full`}>
                        {section.badge}
                      </span>
                    </div>
                    
                    {/* Title and Subtitle */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                        {section.title}
                      </h3>
                      <p className="text-lg font-medium text-gray-600">
                        {section.subtitle}
                      </p>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {section.description}
                    </p>
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Click to explore
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 border-2 border-transparent group-hover:border-${section.color}-200 rounded-2xl transition-colors duration-300`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <p className="text-gray-600">
                Use this repository to <strong>bootstrap</strong> any new insurance AI feature 
                and to <strong>evidence compliance</strong> during audits.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // File browser view
  if (selectedSection && !selectedFile) {
    const Icon = selectedSection.icon;
    const files = fileStructure[selectedSection.id] || [];
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToSections}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={`p-3 bg-gradient-to-br ${selectedSection.gradient} rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedSection.title}
                  </h1>
                  <p className="text-gray-600">{selectedSection.subtitle}</p>
                </div>
              </div>
              
              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Files</option>
                  <option value="docs">Documentation</option>
                  <option value="code">Code Files</option>
                  <option value="data">Data Files</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Files & Folders</h2>
                <span className="text-sm text-gray-500">
                  {files.length} items
                </span>
              </div>
              
              <div className="space-y-2">
                {files.length > 0 ? renderFileTree(files) : (
                  <div className="text-center py-12">
                    <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No files found in this section</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // File content view
  if (selectedFile) {
    const FileIcon = getFileIcon(selectedFile.name);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToFiles}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedFile.name}
                  </h1>
                  <p className="text-gray-600">
                    {selectedSection.title} • {selectedFile.size}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button className="flex items-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open External
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* File Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading file content...</p>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg border">
                    {fileContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GoldenRepository;
