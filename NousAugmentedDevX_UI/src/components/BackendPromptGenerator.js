import React, { useState, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useRequirements } from '../context/RequirementsContext';
import { Upload, FileText, Send, Download, Loader2, Sparkles, Code2, History, CheckCircle, RefreshCw, Copy, GitBranch, Target, Zap, Users, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateBackendPrompt as generateBackendPromptService } from '../utils/aiService';
import { parseAgileArtifacts } from '../utils/agileParser';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';

// Language and framework options with icons
const LANGUAGE_OPTIONS = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨', frameworks: ['Node.js', 'Express', 'NestJS', 'Fastify'] },
  { id: 'typescript', name: 'TypeScript', icon: '🔷', frameworks: ['Node.js', 'Express', 'NestJS', 'Fastify', 'Deno'] },
  { id: 'python', name: 'Python', icon: '🐍', frameworks: ['Django', 'Flask', 'FastAPI', 'Tornado', 'Sanic'] },
  { id: 'java', name: 'Java', icon: '☕', frameworks: ['Spring Boot', 'Quarkus', 'Micronaut', 'Play Framework'] },
  { id: 'csharp', name: 'C#', icon: '🔷', frameworks: ['.NET Core', 'ASP.NET', 'Blazor', 'SignalR'] },
  { id: 'go', name: 'Go', icon: '🐹', frameworks: ['Gin', 'Echo', 'Fiber', 'Gorilla Mux'] },
  { id: 'rust', name: 'Rust', icon: '🦀', frameworks: ['Actix', 'Rocket', 'Warp', 'Axum'] },
  { id: 'php', name: 'PHP', icon: '🐘', frameworks: ['Laravel', 'Symfony', 'CodeIgniter', 'Slim'] },
  { id: 'ruby', name: 'Ruby', icon: '💎', frameworks: ['Rails', 'Sinatra', 'Hanami', 'Grape'] },
  { id: 'kotlin', name: 'Kotlin', icon: '🟣', frameworks: ['Spring Boot', 'Ktor', 'Micronaut', 'Quarkus'] }
];

// Database options
const DATABASE_OPTIONS = [
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
  { id: 'mysql', name: 'MySQL', icon: '🐬' },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃' },
  { id: 'redis', name: 'Redis', icon: '🔴' },
  { id: 'sqlite', name: 'SQLite', icon: '🗃️' },
  { id: 'oracle', name: 'Oracle', icon: '🔶' },
  { id: 'sqlserver', name: 'SQL Server', icon: '🔷' },
  { id: 'dynamodb', name: 'DynamoDB', icon: '⚡' }
];

// Cloud platform options
const CLOUD_OPTIONS = [
  { id: 'aws', name: 'AWS', icon: '☁️' },
  { id: 'azure', name: 'Azure', icon: '🔷' },
  { id: 'gcp', name: 'Google Cloud', icon: '🌐' },
  { id: 'heroku', name: 'Heroku', icon: '🟣' },
  { id: 'digitalocean', name: 'DigitalOcean', icon: '🌊' },
  { id: 'none', name: 'None', icon: '🚫' }
];

function BackendPromptGenerator() {
  const { showSuccess, showError } = useNotifications();
  const { epics, features, userStories, dispatch } = useRequirements();
  const [inputType, setInputType] = useState('chat');
  const [chatInput, setChatInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  
  // Agile artifacts state
  const [agileArtifacts, setAgileArtifacts] = useState(null);
  const [parsedArtifacts, setParsedArtifacts] = useState({ epics: [], features: [], userStories: [] });
  const [expandedSections, setExpandedSections] = useState({
    epics: true,
    features: true,
    userStories: true
  });
  const navigate = useNavigate();
  
  // Backend-specific selections
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [selectedCloud, setSelectedCloud] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const fileInputRef = useRef();

  // Helper function to create clean copies without circular references
  const createCleanAgileArtifacts = (artifacts) => {
    if (!artifacts) return null;
    
    const cleanEpics = artifacts.epics?.map(epic => ({
      id: epic.id,
      title: epic.title,
      description: epic.description,
      priority: epic.priority,
      status: epic.status,
      createdAt: epic.createdAt
    })) || [];
    
    const cleanFeatures = artifacts.features?.map(feature => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      priority: feature.priority,
      status: feature.status,
      createdAt: feature.createdAt
    })) || [];
    
    const cleanUserStories = artifacts.userStories?.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      priority: story.priority,
      status: story.status,
      createdAt: story.createdAt,
      acceptanceCriteria: story.acceptanceCriteria || []
    })) || [];
    
    return {
      epics: cleanEpics,
      features: cleanFeatures,
      userStories: cleanUserStories
    };
  };

  // Get available frameworks for selected language
  const getAvailableFrameworks = () => {
    const language = LANGUAGE_OPTIONS.find(lang => lang.id === selectedLanguage);
    return language ? language.frameworks : [];
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const resetGeneration = () => {
    setGeneratedPrompt(null);
    setAgileArtifacts(null);
    setParsedArtifacts({ epics: [], features: [], userStories: [] });
    setHasGeneratedContent(false);
    setChatInput('');
    setFileContent('');
    setSelectedFile(null);
    setProjectName('');
    setProjectDescription('');
    setAdditionalRequirements('');
    setSelectedLanguage('');
    setSelectedFramework('');
    setSelectedDatabase('');
    setSelectedCloud('');
  };

  const generateBackendPrompt = async () => {
    if (!chatInput.trim() && !fileContent.trim()) {
      showError('Please provide requirements or upload a file');
      return;
    }

    if (!selectedLanguage) {
      showError('Please select a programming language');
      return;
    }

    if (!selectedFramework) {
      showError('Please select a framework');
      return;
    }

    setIsProcessing(true);
    try {
      const requirements = chatInput || fileContent;
      
      // Generate backend prompt
      const result = await generateBackendPromptService(
        requirements,
        selectedLanguage,
        selectedFramework,
        selectedDatabase,
        selectedCloud,
        projectName,
        projectDescription,
        additionalRequirements
      );
      
      // Generate agile artifacts
      const agileResult = await generateAgileArtifacts(requirements);
      const parsedAgileArtifacts = parseAgileArtifacts(agileResult.agile_artifacts);
      
      setGeneratedPrompt(result);
      setAgileArtifacts(agileResult);
      setParsedArtifacts(parsedAgileArtifacts);
      setHasGeneratedContent(true);
      
      // Update context with parsed artifacts
      if (parsedAgileArtifacts.epics.length > 0) {
        dispatch({ type: 'ADD_EPICS', payload: parsedAgileArtifacts.epics });
      }
      if (parsedAgileArtifacts.features.length > 0) {
        dispatch({ type: 'ADD_FEATURES', payload: parsedAgileArtifacts.features });
      }
      if (parsedAgileArtifacts.userStories.length > 0) {
        dispatch({ type: 'ADD_USER_STORIES', payload: parsedAgileArtifacts.userStories });
      }
      
      // Store backend prompt data in JSON format
      const backendPromptData = {
        id: `backend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectName: projectName || 'backend-project',
        input: {
          requirements: requirements,
          language: selectedLanguage,
          framework: selectedFramework,
          database: selectedDatabase || 'None specified',
          cloud: selectedCloud || 'None specified',
          projectDescription: projectDescription || 'Backend API',
          additionalRequirements: additionalRequirements || 'None specified',
          inputType: inputType,
          fileName: selectedFile ? selectedFile.name : null
        },
        output: {
          prompt: result.prompt,
          folderStructure: result.folderStructure,
          features: result.features,
          technologies: result.technologies,
          bestPractices: result.bestPractices,
          scaffold: result.scaffold,
          files: result.files
        },
        agileArtifacts: {
          raw: agileResult.agile_artifacts,
          parsed: parsedAgileArtifacts
        },
        timestamp: new Date().toISOString(),
        metadata: {
          generatedBy: 'Backend Prompt Generator',
          version: '1.0',
          totalFiles: result.files ? result.files.length : 0,
          totalFeatures: result.features ? result.features.length : 0,
          totalBestPractices: result.bestPractices ? result.bestPractices.length : 0,
          totalEpics: parsedAgileArtifacts.epics.length,
          totalAgileFeatures: parsedAgileArtifacts.features.length,
          totalUserStories: parsedAgileArtifacts.userStories.length
        }
      };

      // Store in localStorage for local access
      localStorage.setItem('backend-project-data', JSON.stringify(backendPromptData));
      
      // Send to backend API
      await sendToBackendAPI(backendPromptData);
      
      showSuccess(`Backend project created successfully! Generated prompt and agile artifacts with ${parsedAgileArtifacts.epics.length} epics, ${parsedAgileArtifacts.features.length} features, and ${parsedAgileArtifacts.userStories.length} user stories.`);
    } catch (error) {
      console.error('Error generating backend prompt:', error);
      showError('Failed to generate backend prompt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to send data to backend API
  const sendToBackendAPI = async (data) => {
    try {
      console.log('Sending backend project data to API:', data);
      
      // Use the new backend-projects endpoint
      const response = await fetch(API_ENDPOINTS.backendProjects, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Backend Projects API response:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending data to backend projects API:', error);
      // Don't throw error here to avoid breaking the main flow
      // Just log it for debugging
      console.log('Backend Projects API call failed, but data is stored locally');
    }
  };

  // Function to generate agile artifacts
  const generateAgileArtifacts = async (requirements) => {
    try {
      console.log('Generating agile artifacts for backend requirements:', requirements);
      
      const response = await fetch(API_ENDPOINTS.generateAgileArtifacts, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          requirement: requirements,
          projectType: 'backend',
          language: selectedLanguage,
          framework: selectedFramework,
          projectName: projectName || 'backend-project'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Agile artifacts API response:', result);
      
      return result;
    } catch (error) {
      console.error('Error generating agile artifacts:', error);
      // Return fallback data
      return {
        success: true,
        agile_artifacts: `Epic
Backend API Development for ${projectName || 'backend-project'}

Features
Feature 1: Authentication & Authorization System
Feature 2: Core API Endpoints
Feature 3: Database Integration
Feature 4: Error Handling & Logging
Feature 5: API Documentation

User Stories
Feature 1: Authentication & Authorization System
User Story 1: As a developer, I want to implement JWT authentication so that users can securely access the API
User Story 2: As a developer, I want to implement role-based authorization so that different user types have appropriate access levels

Feature 2: Core API Endpoints
User Story 3: As a developer, I want to create RESTful API endpoints so that clients can interact with the backend
User Story 4: As a developer, I want to implement input validation so that the API handles invalid requests gracefully

Feature 3: Database Integration
User Story 5: As a developer, I want to integrate with ${selectedDatabase || 'database'} so that data can be persisted and retrieved
User Story 6: As a developer, I want to implement database migrations so that schema changes can be managed

Feature 4: Error Handling & Logging
User Story 7: As a developer, I want to implement comprehensive error handling so that the API provides meaningful error responses
User Story 8: As a developer, I want to implement logging so that system activities can be monitored and debugged

Feature 5: API Documentation
User Story 9: As a developer, I want to generate API documentation so that other developers can understand how to use the API
User Story 10: As a developer, I want to implement API versioning so that changes can be made without breaking existing clients`
      };
    }
  };

  const downloadPrompt = () => {
    if (generatedPrompt) {
      const blob = new Blob([generatedPrompt.prompt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'backend-prompt'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const sendToDevOps = () => {
    if (!generatedPrompt) return;
    
    // Store the backend prompt in localStorage for DevOps Integration to access
    const backendPromptData = {
      content: generatedPrompt.prompt,
      folderStructure: generatedPrompt.folderStructure,
      features: generatedPrompt.features,
      technologies: generatedPrompt.technologies,
      bestPractices: generatedPrompt.bestPractices,
      scaffold: generatedPrompt.scaffold,
      files: generatedPrompt.files,
      projectName: projectName || 'backend-project',
      projectDescription: projectDescription || 'Backend API',
      language: selectedLanguage,
      framework: selectedFramework,
      database: selectedDatabase,
      cloud: selectedCloud,
      timestamp: new Date().toISOString(),
      type: 'backend-prompt'
    };
    
    localStorage.setItem('devops-backend-prompt', JSON.stringify(backendPromptData));
    
    // Store agile artifacts in localStorage for DevOps Integration to access
    if (parsedArtifacts && (parsedArtifacts.epics.length > 0 || parsedArtifacts.features.length > 0 || parsedArtifacts.userStories.length > 0)) {
      const cleanArtifacts = createCleanAgileArtifacts(parsedArtifacts);
      
      const agileArtifactsData = {
        ...cleanArtifacts,
        timestamp: new Date().toISOString(),
        source: 'backend-prompt-generation'
      };
      
      localStorage.setItem('devops-agile-artifacts', JSON.stringify(agileArtifactsData));
    }
    
    localStorage.setItem('devops-sent-status', 'true');
    sessionStorage.removeItem('content-generated-this-session');
    showSuccess('Backend prompt and agile artifacts sent to DevOps Integration!');

    // Show a short countdown, then navigate to DevOps Integration
    let secondsRemaining = 3;
    const toastId = toast(`Opening DevOps Integration in ${secondsRemaining}s...`, { icon: '⏳' });
    const intervalId = setInterval(() => {
      secondsRemaining -= 1;
      if (secondsRemaining > 0) {
        toast(`Opening DevOps Integration in ${secondsRemaining}s...`, { id: toastId });
      } else {
        clearInterval(intervalId);
        toast.dismiss(toastId);
        navigate('/devops-integration');
      }
    }, 1000);
  };

  const copyAllContent = () => {
    if (!generatedPrompt) return;
    
    let allContent = '';
    
    // Add header
    allContent += `# Backend Prompt Generator - Complete Output\n`;
    allContent += `Generated on: ${new Date().toLocaleString()}\n`;
    allContent += `Project: ${projectName || 'backend-project'}\n`;
    allContent += `Language: ${selectedLanguage}\n`;
    allContent += `Framework: ${selectedFramework}\n`;
    allContent += `Database: ${selectedDatabase || 'None specified'}\n`;
    allContent += `Cloud Platform: ${selectedCloud !== 'none' ? selectedCloud : 'On-premise deployment'}\n\n`;
    
    // Add Enterprise Prompt
    allContent += `## Enterprise Prompt\n\n`;
    allContent += generatedPrompt.prompt + '\n\n';
    
    // Add Technology Stack
    if (generatedPrompt.technologies && generatedPrompt.technologies.length > 0) {
      allContent += `## Technology Stack\n\n`;
      generatedPrompt.technologies.forEach(tech => {
        allContent += `- ${tech}\n`;
      });
      allContent += '\n';
    }
    
    // Add Enterprise Folder Structure
    if (generatedPrompt.folderStructure) {
      allContent += `## Enterprise Folder Structure\n\n`;
      allContent += '```\n';
      allContent += generatedPrompt.folderStructure + '\n';
      allContent += '```\n\n';
    }
    
    // Add Best Practices
    if (generatedPrompt.bestPractices && generatedPrompt.bestPractices.length > 0) {
      allContent += `## Best Practices\n\n`;
      generatedPrompt.bestPractices.forEach((bp, index) => {
        allContent += `${index + 1}. ${bp}\n`;
      });
      allContent += '\n';
    }
    
    // Add Scaffold Script
    if (generatedPrompt.scaffold) {
      allContent += `## Scaffold Script\n\n`;
      allContent += '```bash\n';
      allContent += generatedPrompt.scaffold + '\n';
      allContent += '```\n\n';
    }
    
    // Add Generated Starter Files
    if (generatedPrompt.files && generatedPrompt.files.length > 0) {
      allContent += `## Generated Starter Files\n\n`;
      generatedPrompt.files.forEach((file, index) => {
        allContent += `### ${file.path}\n\n`;
        allContent += '```' + (file.path.endsWith('.json') ? 'json' : file.path.endsWith('.js') || file.path.endsWith('.ts') ? 'javascript' : 'text') + '\n';
        allContent += file.content + '\n';
        allContent += '```\n\n';
      });
    }
    
    // Add Key Features
    if (generatedPrompt.features && generatedPrompt.features.length > 0) {
      allContent += `## Key Features Included\n\n`;
      generatedPrompt.features.forEach((feature, index) => {
        allContent += `${index + 1}. ${feature}\n`;
      });
      allContent += '\n';
    }
    
    // Add footer
    allContent += `---\n`;
    allContent += `Generated by Backend Prompt Generator\n`;
    allContent += `Timestamp: ${new Date().toISOString()}\n`;
    
    navigator.clipboard.writeText(allContent).then(() => {
      showSuccess('All content copied to clipboard!');
    }).catch(() => {
      showError('Failed to copy content to clipboard');
    });
  };

  // Function to view stored JSON data
  const viewStoredJSON = () => {
    const storedData = localStorage.getItem('backend-project-data');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('Stored Backend Project JSON Data:', parsedData);
        
        // Create a new window/tab to display the JSON
        const jsonWindow = window.open('', '_blank');
        jsonWindow.document.write(`
          <html>
            <head>
              <title>Backend Project JSON Data</title>
              <style>
                body { font-family: monospace; margin: 20px; background: #f5f5f5; }
                pre { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow-x: auto; }
                h1 { color: #333; }
                .copy-btn { 
                  background: #007bff; color: white; border: none; padding: 10px 20px; 
                  border-radius: 5px; cursor: pointer; margin: 10px 0; 
                }
                .copy-btn:hover { background: #0056b3; }
              </style>
            </head>
            <body>
              <h1>Backend Project Generator - Stored JSON Data</h1>
              <button class="copy-btn" onclick="copyToClipboard()">Copy JSON to Clipboard</button>
              <pre id="jsonData">${JSON.stringify(parsedData, null, 2)}</pre>
              <script>
                function copyToClipboard() {
                  const jsonText = document.getElementById('jsonData').textContent;
                  navigator.clipboard.writeText(jsonText).then(() => {
                    alert('JSON data copied to clipboard!');
                  }).catch(() => {
                    alert('Failed to copy to clipboard');
                  });
                }
              </script>
            </body>
          </html>
        `);
        jsonWindow.document.close();
        
        showSuccess('JSON data displayed in new window!');
      } catch (error) {
        console.error('Error parsing stored JSON:', error);
        showError('Error parsing stored JSON data');
      }
    } else {
      showError('No stored backend project data found');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Code2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Backend Prompt Generator</h1>
                <p className="text-gray-600">Generate enterprise-level folder structure prompts with Azure OpenAI</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {hasGeneratedContent && (
                <button
                  onClick={resetGeneration}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={viewStoredJSON}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>View JSON</span>
              </button>
              <button
                onClick={() => window.location.href = '/generation-history'}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Input Method Selection */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Input Method</h2>
                <p className="text-blue-100">Choose how you'd like to provide your requirements</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setInputType('chat')}
                className={`flex-1 flex items-center justify-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                  inputType === 'chat'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">Chat Input</span>
              </button>
              <button
                onClick={() => setInputType('file')}
                className={`flex-1 flex items-center justify-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                  inputType === 'file'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">File Upload</span>
              </button>
            </div>

            {inputType === 'chat' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirement Description
                  </label>
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Describe your backend requirements (e.g., 'Create a REST API for user management with authentication, database integration, and error handling')"
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isProcessing}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {chatInput.length} characters
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Requirements File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      accept=".txt,.md,.json,.yaml,.yml"
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports .txt, .md, .json, .yaml files
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backend Configuration */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Backend Configuration</h2>
            <p className="text-green-100">Select your technology stack and project details</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-backend-api"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <input
                  type="text"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="A REST API for user management"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Programming Language
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {LANGUAGE_OPTIONS.map((language) => (
                  <button
                    key={language.id}
                    onClick={() => {
                      setSelectedLanguage(language.id);
                      setSelectedFramework(''); // Reset framework when language changes
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                      selectedLanguage === language.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{language.icon}</div>
                    <div className="text-sm font-medium">{language.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Framework Selection */}
            {selectedLanguage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Framework
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getAvailableFrameworks().map((framework) => (
                    <button
                      key={framework}
                      onClick={() => setSelectedFramework(framework)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                        selectedFramework === framework
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="text-sm font-medium">{framework}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Database Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Database
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DATABASE_OPTIONS.map((database) => (
                  <button
                    key={database.id}
                    onClick={() => setSelectedDatabase(database.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                      selectedDatabase === database.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{database.icon}</div>
                    <div className="text-sm font-medium">{database.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cloud Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cloud Platform
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CLOUD_OPTIONS.map((cloud) => (
                  <button
                    key={cloud.id}
                    onClick={() => setSelectedCloud(cloud.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                      selectedCloud === cloud.id
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{cloud.icon}</div>
                    <div className="text-sm font-medium">{cloud.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Requirements
              </label>
              <textarea
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                placeholder="Any specific requirements, patterns, or constraints (e.g., 'Use dependency injection, implement logging, add rate limiting')"
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={generateBackendPrompt}
            disabled={isProcessing || (!chatInput.trim() && !fileContent.trim()) || !selectedLanguage || !selectedFramework}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Generating Prompt...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Generate Backend Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Prompt Display */}
        {generatedPrompt && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Generated Backend Prompt</h2>
                      <p className="text-indigo-100 text-lg">Your enterprise-level folder structure prompt is ready!</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-100">Successfully Generated</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-blue-100">Ready for Implementation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={copyAllContent}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Copy className="w-5 h-5" />
                      <span className="font-medium">Copy All</span>
                    </button>
                    <button
                      onClick={downloadPrompt}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-medium">Download</span>
                    </button>
                    <button
                      onClick={sendToDevOps}
                      disabled={!generatedPrompt}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    >
                      <GitBranch className="w-5 h-5" />
                      <span className="font-medium">Send to DevOps</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Enhanced Technology Stack */}
              {Array.isArray(generatedPrompt.technologies) && generatedPrompt.technologies.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Code2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-800">Technology Stack</h3>
                        <p className="text-sm text-blue-600">Selected technologies for your backend</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedPrompt.technologies.join('\n'))}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all duration-200"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {generatedPrompt.technologies.map((tech, idx) => (
                      <span key={idx} className="px-4 py-2 rounded-full bg-white text-blue-700 text-sm font-medium border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{tech}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Enterprise Prompt */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Enterprise Prompt</h3>
                        <p className="text-sm text-gray-600">Complete prompt ready for AI processing</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedPrompt.prompt || '')}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Prompt</span>
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown 
                      className="text-gray-800 leading-relaxed"
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
                      {generatedPrompt.prompt}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Enterprise Folder Structure */}
              {generatedPrompt.folderStructure && (
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-600 rounded-lg">
                          <Code2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Enterprise Folder Structure</h3>
                          <p className="text-sm text-green-300">Detailed project folder structure in text format</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedPrompt.folderStructure || '')}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-green-300 hover:text-green-200 border border-gray-600 text-sm font-medium transition-all duration-200"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Structure</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6 overflow-auto max-h-96">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre leading-relaxed">
{generatedPrompt.folderStructure}
                    </pre>
                  </div>
                </div>
              )}

              {/* Enhanced Best Practices */}
              {Array.isArray(generatedPrompt.bestPractices) && generatedPrompt.bestPractices.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800">Best Practices</h3>
                        <p className="text-sm text-green-600">Recommended development practices and patterns</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedPrompt.bestPractices.map((bp, index) => `${index + 1}. ${bp}`).join('\n'))}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all duration-200"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedPrompt.bestPractices.map((bp, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-4 bg-white border border-green-200 rounded-xl hover:shadow-md transition-all duration-200">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">{bp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Scaffold Script */}
              {generatedPrompt.scaffold && (
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Code2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Scaffold Script</h3>
                          <p className="text-sm text-blue-300">bash script that creates the folders/files</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedPrompt.scaffold || '')}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-blue-300 hover:text-blue-200 border border-gray-600 text-sm font-medium transition-all duration-200"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Script</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6 overflow-auto max-h-96">
                    <pre className="text-blue-300 text-sm font-mono whitespace-pre leading-relaxed">
{generatedPrompt.scaffold}
                    </pre>
                  </div>
                </div>
              )}

              {/* Enhanced Generated Files */}
              {generatedPrompt.files && Array.isArray(generatedPrompt.files) && generatedPrompt.files.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-orange-800">Generated Starter Files</h3>
                      <p className="text-sm text-orange-600">Essential files created for your project</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {generatedPrompt.files.map((file, index) => (
                      <div key={index} className="bg-white border border-orange-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                        <div className="bg-orange-100 px-4 py-2 border-b border-orange-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">{file.path}</span>
                            </div>
                            <button
                              onClick={() => navigator.clipboard.writeText(file.content || '')}
                              className="text-xs px-2 py-1 bg-orange-200 hover:bg-orange-300 text-orange-700 rounded transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-40">
                            {file.content}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Key Features */}
              {generatedPrompt.features && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-800">Key Features Included</h3>
                        <p className="text-sm text-purple-600">Essential features and capabilities in your generated prompt</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedPrompt.features.map((feature, index) => `${index + 1}. ${feature}`).join('\n'))}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all duration-200"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedPrompt.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-white border border-purple-200 rounded-xl hover:shadow-md transition-all duration-200">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agile Artifacts Display */}
        {agileArtifacts && parsedArtifacts && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Agile Artifacts Header */}
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Generated Agile Artifacts</h2>
                      <p className="text-green-100 text-lg">Epics, Features, and User Stories for your backend project</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-100">{parsedArtifacts.epics.length} Epics</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-blue-100">{parsedArtifacts.features.length} Features</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-purple-100">{parsedArtifacts.userStories.length} User Stories</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Epics Section */}
              {parsedArtifacts.epics.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <Target className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-orange-800">Epics</h3>
                        <p className="text-sm text-orange-600">High-level business objectives</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, epics: !prev.epics }))}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-all duration-200"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.epics ? 'rotate-180' : ''}`} />
                      <span>{expandedSections.epics ? 'Collapse' : 'Expand'}</span>
                    </button>
                  </div>
                  {expandedSections.epics && (
                    <div className="space-y-4">
                      {parsedArtifacts.epics.map((epic, index) => (
                        <div key={epic.id} className="bg-white border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                              <Target className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{epic.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{epic.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                  Priority: {epic.priority}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                  Status: {epic.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Features Section */}
              {parsedArtifacts.features.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-800">Features</h3>
                        <p className="text-sm text-blue-600">Functional capabilities and components</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, features: !prev.features }))}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all duration-200"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.features ? 'rotate-180' : ''}`} />
                      <span>{expandedSections.features ? 'Collapse' : 'Expand'}</span>
                    </button>
                  </div>
                  {expandedSections.features && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parsedArtifacts.features.map((feature, index) => (
                        <div key={feature.id} className="bg-white border border-blue-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                              <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                  Priority: {feature.priority}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                  Status: {feature.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* User Stories Section */}
              {parsedArtifacts.userStories.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-800">User Stories</h3>
                        <p className="text-sm text-purple-600">Detailed user requirements and acceptance criteria</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, userStories: !prev.userStories }))}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all duration-200"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.userStories ? 'rotate-180' : ''}`} />
                      <span>{expandedSections.userStories ? 'Collapse' : 'Expand'}</span>
                    </button>
                  </div>
                  {expandedSections.userStories && (
                    <div className="space-y-4">
                      {parsedArtifacts.userStories.map((story, index) => (
                        <div key={story.id} className="bg-white border border-purple-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{story.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{story.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                  Priority: {story.priority}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                  Status: {story.status}
                                </span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                  Points: {story.storyPoints}
                                </span>
                              </div>
                              {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Acceptance Criteria:</h5>
                                  <ul className="space-y-1">
                                    {story.acceptanceCriteria.map((criteria, idx) => (
                                      <li key={idx} className="text-xs text-gray-600 flex items-start space-x-2">
                                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{criteria}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Raw Agile Artifacts */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Raw Agile Artifacts</h3>
                        <p className="text-sm text-gray-600">Complete agile artifacts text</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(agileArtifacts.agile_artifacts || '')}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Raw Text</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-auto max-h-96">
                  <pre className="text-gray-700 text-sm font-mono whitespace-pre leading-relaxed">
                    {agileArtifacts.agile_artifacts}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BackendPromptGenerator;
