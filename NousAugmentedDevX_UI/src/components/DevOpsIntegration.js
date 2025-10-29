import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRequirements } from '../context/RequirementsContext';
import { 
  Upload, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  FileText,
  GitBranch,
  Target,
  Zap,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { pushToAzureDevOps, pushGuidelinesToAzureDevOpsReal, createWorkItems } from '../utils/azureDevOpsService';

const DevOpsIntegration = () => {
  const location = useLocation();
  const { epics: contextEpics, features: contextFeatures, userStories: contextUserStories } = useRequirements();
  const [azureConfig, setAzureConfig] = useState({
    organization: process.env.REACT_APP_AZURE_DEVOPS_ORGANIZATION || 'InsurityPOC',
    project: process.env.REACT_APP_AZURE_DEVOPS_PROJECT || 'InsurityPOC',
    repository: process.env.REACT_APP_AZURE_DEVOPS_REPOSITORY || 'InsurityPocAIFigma',
    personalAccessToken: process.env.REACT_APP_AZURE_DEVOPS_PAT || '',
    branch: process.env.REACT_APP_AZURE_DEVOPS_BRANCH || 'main',
    filePath: process.env.REACT_APP_AZURE_DEVOPS_FILE_PATH || 'src/'
  });
  const [selectedItems, setSelectedItems] = useState({
    epics: [],
    features: [],
    userStories: []
  });
  const [isPushing, setIsPushing] = useState(false);
  const [pushHistory, setPushHistory] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [storedGuidelines, setStoredGuidelines] = useState(null);
  const [storedBackendPrompt, setStoredBackendPrompt] = useState(null);
  const [storedAgileArtifacts, setStoredAgileArtifacts] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown'); // 'unknown', 'connected', 'failed'
  const [connectionError, setConnectionError] = useState('');
  const [availableRepositories, setAvailableRepositories] = useState([]);
  const [isDiscoveringRepos, setIsDiscoveringRepos] = useState(false);
  const configRef = useRef(azureConfig);

  // Use stored agile artifacts if available, otherwise fall back to context
  const epics = storedAgileArtifacts?.epics || contextEpics;
  const features = storedAgileArtifacts?.features || contextFeatures;
  const userStories = storedAgileArtifacts?.userStories || contextUserStories;

  useEffect(() => {
    // Load saved Azure DevOps configuration
    const savedConfig = localStorage.getItem('azure-devops-config');
    if (savedConfig) {
      try {
        setAzureConfig(JSON.parse(savedConfig));
        setHasUnsavedChanges(false);
      } catch (error) {
        // Config loading failed - will use defaults
      }
    }

    // Check for stored guidelines from AI Guidelines
    const storedGuidelinesData = localStorage.getItem('devops-guidelines');
    if (storedGuidelinesData) {
      try {
        setStoredGuidelines(JSON.parse(storedGuidelinesData));
      } catch (error) {
        // Guidelines loading failed - will show empty state
      }
    }

    // Load stored Backend Prompt
    const storedBackendPromptData = localStorage.getItem('devops-backend-prompt');
    if (storedBackendPromptData) {
      try {
        setStoredBackendPrompt(JSON.parse(storedBackendPromptData));
      } catch (error) {
        // ignore
      }
    }

    // Load stored Agile Artifacts
    const storedAgileArtifactsData = localStorage.getItem('devops-agile-artifacts');
    if (storedAgileArtifactsData) {
      try {
        setStoredAgileArtifacts(JSON.parse(storedAgileArtifactsData));
      } catch (error) {
        // ignore
      }
    }

    // Check if navigated from integrations page to focus on configuration
    if (location.state?.focusOnConfiguration) {
      setShowConfig(true);
      toast.success('Welcome to DevOps Integration! Configure your Azure DevOps settings below.');
    }
  }, [location.state]);

  // Update ref when config changes
  useEffect(() => {
    configRef.current = azureConfig;
  }, [azureConfig]);

  // Save Azure DevOps configuration only when component unmounts
  useEffect(() => {
    return () => {
      localStorage.setItem('azure-devops-config', JSON.stringify(configRef.current));
    };
  }, []); // Empty dependency array - only run on unmount

  const handleConfigChange = (field, value) => {
    setAzureConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const saveConfig = () => {
    localStorage.setItem('azure-devops-config', JSON.stringify(azureConfig));
    setHasUnsavedChanges(false);
    toast.success('Azure DevOps configuration saved successfully!');
  };

  const validateConfig = (showError = false) => {
    if (!azureConfig.organization || !azureConfig.project || !azureConfig.repository || !azureConfig.personalAccessToken) {
      if (showError) {
        toast.error('Please fill in all Azure DevOps configuration fields');
      }
      return false;
    }
    return true;
  };

  const discoverRepositories = async () => {
    if (!azureConfig.organization || !azureConfig.project || !azureConfig.personalAccessToken) {
      toast.error('Please configure organization, project, and PAT first');
      return;
    }

    setIsDiscoveringRepos(true);
    try {
      const response = await fetch(
        `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/git/repositories?api-version=7.0`,
        {
          headers: {
            'Authorization': `Basic ${btoa(`:${azureConfig.personalAccessToken}`)}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const repos = data.value || [];
        setAvailableRepositories(repos);
        
        if (repos.length > 0) {
          // Auto-select the first repository if current one doesn't exist
          const currentRepoExists = repos.some(repo => repo.name === azureConfig.repository);
          if (!currentRepoExists) {
            const firstRepo = repos[0];
            setAzureConfig(prev => ({
              ...prev,
              repository: firstRepo.name
            }));
            setHasUnsavedChanges(true);
            toast.success(`Found ${repos.length} repositories. Auto-selected: ${firstRepo.name}`);
          } else {
            toast.success(`Found ${repos.length} repositories. Current repository exists.`);
          }
        } else {
          // Silently handle no repositories case
        }
      } else {
        const errorData = await response.json();
        toast.error(`Failed to discover repositories: ${response.status} - ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      toast.error('Failed to discover repositories');
    } finally {
      setIsDiscoveringRepos(false);
    }
  };

  const selectAllItems = (type) => {
    let items = [];
    switch (type) {
      case 'epics':
        items = epics;
        break;
      case 'features':
        items = features;
        break;
      case 'userStories':
        items = userStories;
        break;
      default:
        return;
    }
    
    setSelectedItems(prev => ({
      ...prev,
      [type]: items.map(item => item.id)
    }));
  };

  const toggleItemSelection = (type, itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].includes(itemId)
        ? prev[type].filter(id => id !== itemId)
        : [...prev[type], itemId]
    }));
  };

  const getSelectedItemsCount = () => {
    return Object.values(selectedItems).reduce((total, items) => total + items.length, 0);
  };

  const createWorkItemsInAzureDevOps = async () => {
    if (!validateConfig(true)) return;

    const selectedWorkItems = {
      epics: epics.filter(e => selectedItems.epics.includes(e.id)),
      features: features.filter(f => selectedItems.features.includes(f.id)),
      userStories: userStories.filter(s => selectedItems.userStories.includes(s.id))
    };

    const workItemCount = selectedWorkItems.epics.length + selectedWorkItems.features.length + selectedWorkItems.userStories.length;

    if (workItemCount === 0) {
      // Silently return without showing error toast
      return;
    }

    setIsPushing(true);
    try {
      toast('Creating work items in Azure DevOps...', { icon: '⏳' });
      const result = await createWorkItems(selectedWorkItems, azureConfig);
      
      const pushRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'success',
        message: `Successfully created ${result.summary.epicsCreated + result.summary.featuresCreated + result.summary.userStoriesCreated} work items in Azure DevOps`,
        details: result,
        itemsCount: workItemCount,
        workItems: result.summary
      };

      setPushHistory(prev => [pushRecord, ...prev]);
      
      const totalCreated = result.summary.epicsCreated + result.summary.featuresCreated + result.summary.userStoriesCreated;
      toast.success(`Successfully created ${totalCreated} work items in Azure DevOps with proper linking!`);
      
      // Handle errors silently - errors are already in the result object
      
      // Show created work items
      if (result.results.epics.length > 0) {
        console.log('Created Epics:', result.results.epics);
      }
      if (result.results.features.length > 0) {
        console.log('Created Features:', result.results.features);
      }
      if (result.results.userStories.length > 0) {
        console.log('Created User Stories:', result.results.userStories);
      }
      
      // Clear work item selections after successful creation
      setSelectedItems(prev => ({
        ...prev,
        epics: [],
        features: [],
        userStories: []
      }));
    } catch (error) {
      const pushRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'error',
        message: 'Failed to create work items',
        details: error,
        itemsCount: workItemCount
      };

      setPushHistory(prev => [pushRecord, ...prev]);
      toast.error('Failed to create work items in Azure DevOps');
    } finally {
      setIsPushing(false);
    }
  };

  const pushToAzureDevOpsRepo = async () => {
    if (!validateConfig(true)) return;

    // Since Requirements and Prompts sections are removed, 
    // this function is now primarily for work item documentation
    const selectedData = {
      epics: epics.filter(e => selectedItems.epics.includes(e.id)),
      features: features.filter(f => selectedItems.features.includes(f.id)),
      userStories: userStories.filter(s => selectedItems.userStories.includes(s.id))
    };

    const documentationItemsCount = selectedItems.epics.length + selectedItems.features.length + selectedItems.userStories.length;

    if (documentationItemsCount === 0) {
      toast.error('Please select at least one work item to push as documentation');
      return;
    }

    setIsPushing(true);
    try {
      toast('Pushing work item documentation to Azure DevOps repository...', { icon: '📤' });
      const result = await pushToAzureDevOps(selectedData, azureConfig);
      
      const pushRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'success',
        message: `Successfully pushed ${documentationItemsCount} work items as documentation to Azure DevOps`,
        details: result,
        itemsCount: documentationItemsCount
      };

      setPushHistory(prev => [pushRecord, ...prev]);
      toast.success(`Successfully pushed ${documentationItemsCount} work items as documentation to Azure DevOps repository!`);
      
      // Clear work item selections after successful push
      setSelectedItems({
        epics: [],
        features: [],
        userStories: []
      });
    } catch (error) {
      
      const pushRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'error',
        message: `Failed to push documentation: ${error.message}`,
        details: error,
        itemsCount: documentationItemsCount
      };

      setPushHistory(prev => [pushRecord, ...prev]);
      toast.error(`Failed to push documentation to Azure DevOps: ${error.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  const pushGuidelinesToAzure = async (guidelinesData) => {
    if (!validateConfig(true)) return;

    // Validate guidelines data before pushing
    console.log('Pushing guidelines data:', guidelinesData);
    if (!guidelinesData || (!guidelinesData.content && !guidelinesData.guidelines)) {
      toast.error('No guidelines content found. Please generate guidelines first.');
      return;
    }

    setIsPushing(true);
    try {
      const result = await pushGuidelinesToAzureDevOpsReal(guidelinesData, azureConfig);
      
      const pushRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'success',
        message: `Successfully pushed AI Guidelines to Azure DevOps`,
        details: result,
        itemsCount: 1
      };

      setPushHistory(prev => [pushRecord, ...prev]);
      toast.success('Successfully pushed AI Guidelines to Azure DevOps');
      
      // Clear the stored guidelines after successful push
      localStorage.removeItem('devops-guidelines');
      setStoredGuidelines(null);
    } catch (error) {
      
      const pushRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message: `Failed to push guidelines: ${error.message}`,
        details: error,
        itemsCount: 1
      };

      setPushHistory(prev => [pushRecord, ...prev]);
      toast.error('Failed to push guidelines to Azure DevOps');
    } finally {
      setIsPushing(false);
    }
  };

  const pushBackendPromptToAzure = async (backendData) => {
    if (!validateConfig(true)) return;
    if (!backendData || !backendData.content) {
      toast.error('No backend prompt content found. Please generate and send from Backend Prompt Generator.');
      return;
    }
    setIsPushing(true);
    try {
      const composed = `# Backend Prompt - ${backendData.projectName || 'backend-project'}\n\n` +
        `**Description:** ${backendData.projectDescription || ''}\n\n` +
        (backendData.technologies ? `**Technologies:** ${backendData.technologies.join(', ')}\n\n` : '') +
        `## Prompt\n\n${backendData.content}\n\n` +
        (backendData.folderStructure ? `## Folder Structure\n\n\`\`\`text\n${backendData.folderStructure}\n\`\`\`\n\n` : '') +
        (Array.isArray(backendData.features) ? `## Features\n\n${backendData.features.map(f=>`- ${f}`).join('\n')}\n\n` : '') +
        (Array.isArray(backendData.bestPractices) ? `## Best Practices\n\n${backendData.bestPractices.map(b=>`- ${b}`).join('\n')}\n\n` : '');
      const payload = { content: composed };
      const result = await pushGuidelinesToAzureDevOpsReal(payload, azureConfig);
      setPushHistory(prev => [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'success',
        message: 'Successfully pushed Backend Prompt to Azure DevOps',
        details: result,
        itemsCount: 1
      }, ...prev]);
      toast.success('Successfully pushed Backend Prompt to Azure DevOps');
      localStorage.removeItem('devops-backend-prompt');
      setStoredBackendPrompt(null);
    } catch (error) {
      setPushHistory(prev => [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'error',
        message: 'Failed to push backend prompt',
        details: error,
        itemsCount: 1
      }, ...prev]);
      toast.error('Failed to push Backend Prompt to Azure DevOps');
    } finally {
      setIsPushing(false);
    }
  };

  const generateMarkdownContent = (selectedData) => {
    let content = `# Work Items Documentation - ${new Date().toLocaleDateString()}\n\n`;
    content += `> This document contains work items documentation. For actual work item creation in Azure DevOps boards, use the "Create Work Items" functionality.\n\n`;
    
    if (selectedData.epics && selectedData.epics.length > 0) {
      content += `## Epics\n\n`;
      selectedData.epics.forEach(epic => {
        content += `### ${epic.title}\n`;
        content += `**Priority:** ${epic.priority}\n`;
        content += `**Status:** ${epic.status}\n`;
        content += `${epic.description}\n\n`;
      });
    }

    if (selectedData.features && selectedData.features.length > 0) {
      content += `## Features\n\n`;
      selectedData.features.forEach(feature => {
        content += `### ${feature.title}\n`;
        content += `**Priority:** ${feature.priority}\n`;
        content += `**Status:** ${feature.status}\n`;
        content += `${feature.description}\n\n`;
      });
    }

    if (selectedData.userStories && selectedData.userStories.length > 0) {
      content += `## User Stories\n\n`;
      selectedData.userStories.forEach(story => {
        content += `### ${story.title}\n`;
        content += `**Story Points:** ${story.storyPoints}\n`;
        content += `**Priority:** ${story.priority}\n`;
        content += `${story.description}\n\n`;
        
        if (story.acceptanceCriteria && story.acceptanceCriteria.length > 0) {
          content += `**Acceptance Criteria:**\n`;
          story.acceptanceCriteria.forEach(criteria => {
            content += `- ${criteria}\n`;
          });
          content += `\n`;
        }
      });
    }

    if (!selectedData.epics?.length && !selectedData.features?.length && !selectedData.userStories?.length) {
      content += `## No Work Items Selected\n\n`;
      content += `No work items were selected for documentation.\n\n`;
    }

    return content;
  };

  const previewContent = () => {
    const selectedData = {
      epics: epics.filter(e => selectedItems.epics.includes(e.id)),
      features: features.filter(f => selectedItems.features.includes(f.id)),
      userStories: userStories.filter(s => selectedItems.userStories.includes(s.id))
    };

    const content = generateMarkdownContent(selectedData);
    
    // Create and download preview file
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'work-items-preview.md';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Work items preview downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">DevOps Integration - Azure DevOps</h1>
        <div className="flex space-x-2">
          {hasUnsavedChanges && (
            <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
              <AlertCircle className="w-4 h-4 mr-2" />
              Unsaved Changes
            </div>
          )}
          <button
            onClick={() => {
              const storedGuidelinesData = localStorage.getItem('devops-guidelines');
              if (storedGuidelinesData) {
                try {
                  setStoredGuidelines(JSON.parse(storedGuidelinesData));
                  toast.success('Guidelines refreshed from storage');
                } catch (error) {
                  toast.error('Error loading stored guidelines');
                }
              } else {
                setStoredGuidelines(null);
              }
            }}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Guidelines
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn-secondary"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showConfig ? 'Hide' : 'Show'} Config
          </button>
        </div>
      </div>

      {/* Azure DevOps Configuration */}
      {showConfig && (
        <div className="card">
          {/* Connection Status Indicator */}
          <div className="mb-4 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Connection Status</h3>
                  <p className="text-xs text-gray-500">
                    {connectionStatus === 'connected' ? 'Connected to Azure DevOps' :
                     connectionStatus === 'failed' ? `Connection failed: ${connectionError}` :
                     'Connection status unknown'}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setConnectionStatus('unknown');
                  setConnectionError('');
                  try {
                    const response = await fetch(`https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/git/repositories/${azureConfig.repository}?api-version=7.0`, {
                      headers: {
                        'Authorization': `Basic ${btoa(`:${azureConfig.personalAccessToken}`)}`,
                        'Accept': 'application/json'
                      }
                    });
                    if (response.ok) {
                      setConnectionStatus('connected');
                      setConnectionError('');
                      toast.success('Azure DevOps connection successful!');
                    } else {
                      const errorData = await response.json();
                      setConnectionStatus('failed');
                      setConnectionError(`${response.status}: ${errorData.message || response.statusText}`);
                      toast.error(`Connection failed: ${response.status} - ${errorData.message || response.statusText}`);
                    }
                  } catch (error) {
                    setConnectionStatus('failed');
                    setConnectionError(error.message);
                    toast.error('Connection test failed: ' + error.message);
                  }
                }}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors duration-200"
              >
                Test Connection
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Azure DevOps Configuration</h2>
            <div className="flex space-x-2">
              <button
                onClick={discoverRepositories}
                disabled={isDiscoveringRepos}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isDiscoveringRepos ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Discover Repositories
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setAzureConfig({
                    organization: process.env.REACT_APP_AZURE_DEVOPS_ORGANIZATION || 'InsurityPOC',
                    project: process.env.REACT_APP_AZURE_DEVOPS_PROJECT || 'InsurityPOC',
                    repository: process.env.REACT_APP_AZURE_DEVOPS_REPOSITORY || 'InsurityPocAIFigma',
                    personalAccessToken: process.env.REACT_APP_AZURE_DEVOPS_PAT || '',
                    branch: process.env.REACT_APP_AZURE_DEVOPS_BRANCH || 'main',
                    filePath: process.env.REACT_APP_AZURE_DEVOPS_FILE_PATH || 'src/'
                  });
                  setHasUnsavedChanges(true);
                  toast.success('Configuration reset to default values');
                }}
                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Reset to Default
              </button>
              <button
                onClick={saveConfig}
                disabled={!hasUnsavedChanges}
                className={`${hasUnsavedChanges ? 'btn-primary' : 'btn-secondary'} disabled:opacity-50`}
              >
                {hasUnsavedChanges ? 'Save Configuration' : 'Configuration Saved'}
              </button>
            </div>
          </div>
          
          {/* Configuration Display with Edit Functionality */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">{azureConfig.organization}</span>
                  <button
                    onClick={() => {
                      const newOrg = prompt('Enter new organization name:', azureConfig.organization);
                      if (newOrg && newOrg.trim()) {
                        handleConfigChange('organization', newOrg.trim());
                      }
                    }}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">{azureConfig.project}</span>
                  <button
                    onClick={() => {
                      const newProject = prompt('Enter new project name:', azureConfig.project);
                      if (newProject && newProject.trim()) {
                        handleConfigChange('project', newProject.trim());
                      }
                    }}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Repository</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">{azureConfig.repository}</span>
                  <button
                    onClick={() => {
                      const newRepo = prompt('Enter new repository name:', azureConfig.repository);
                      if (newRepo && newRepo.trim()) {
                        handleConfigChange('repository', newRepo.trim());
                      }
                    }}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">{azureConfig.branch}</span>
                  <button
                    onClick={() => {
                      const newBranch = prompt('Enter new branch name:', azureConfig.branch);
                      if (newBranch && newBranch.trim()) {
                        handleConfigChange('branch', newBranch.trim());
                      }
                    }}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">File Path</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">{azureConfig.filePath}</span>
                  <button
                    onClick={() => {
                      const newPath = prompt('Enter new file path:', azureConfig.filePath);
                      if (newPath && newPath.trim()) {
                        handleConfigChange('filePath', newPath.trim());
                      }
                    }}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Directory path where guidelines will be stored (e.g., src/, docs/, etc.)
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Access Token</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">
                    {azureConfig.personalAccessToken.substring(0, 20)}...
                  </span>
                  <button
                    onClick={() => {
                      const newToken = prompt('Enter new Personal Access Token:', azureConfig.personalAccessToken);
                      if (newToken && newToken.trim()) {
                        handleConfigChange('personalAccessToken', newToken.trim());
                      }
                    }}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Token is partially hidden for security. Click Edit to change.
                </p>
              </div>
            </div>
          </div>
          
          {/* Troubleshooting Section */}
          {connectionStatus === 'failed' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">Troubleshooting Connection Issues</h4>
              <div className="text-xs text-red-700 space-y-1">
                <p>• <strong>404 Not Found:</strong> Check if the repository name is correct. Repository names are case-sensitive.</p>
                <p>• <strong>Organization/Project:</strong> Verify the organization and project names match exactly what's in Azure DevOps.</p>
                <p>• <strong>Personal Access Token:</strong> Ensure your PAT has 'Code (Read & Write)' permissions.</p>
                <p>• <strong>Repository Access:</strong> Confirm your account has access to this repository.</p>
                <p>• <strong>URL Format:</strong> The repository should exist at: https://dev.azure.com/InsurityPOC/InsurityPOC/_git/InsurityPocAIFigma</p>
              </div>
            </div>
          )}

          {/* Available Repositories Section */}
          {availableRepositories.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Available Repositories</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      repo.name === azureConfig.repository
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-blue-200 hover:bg-blue-50'
                    }`}
                    onClick={() => {
                      setAzureConfig(prev => ({
                        ...prev,
                        repository: repo.name
                      }));
                      setHasUnsavedChanges(true);
                      toast.success(`Selected repository: ${repo.name}`);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{repo.name}</span>
                      {repo.name === azureConfig.repository && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    {repo.defaultBranch && (
                      <p className="text-xs text-blue-600">Default: {repo.defaultBranch.replace('refs/heads/', '')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stored Backend Prompt */}
      {storedBackendPrompt && (
        <div className="card">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Backend Prompt</h2>
                  <p className="text-purple-100">Ready to push to Azure DevOps repository</p>
                </div>
              </div>
              <div className="text-white text-sm">
                Generated: {new Date(storedBackendPrompt.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                <p><strong>Project:</strong> {storedBackendPrompt.projectName}</p>
                <p><strong>Tech:</strong> {(storedBackendPrompt.technologies || []).join(', ')}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Folder Structure</h3>
              <div className="max-h-56 overflow-y-auto bg-gray-900 p-4 rounded-lg border border-gray-800">
                <pre className="text-green-300 text-sm whitespace-pre font-mono">{storedBackendPrompt.folderStructure}</pre>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => pushBackendPromptToAzure(storedBackendPrompt)}
                disabled={!validateConfig(false)}
                className="btn-primary disabled:opacity-50"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Push Backend Prompt to Azure
              </button>
              <button
                onClick={() => {
                  const data = localStorage.getItem('devops-backend-prompt');
                  if (data) {
                    try { setStoredBackendPrompt(JSON.parse(data)); toast.success('Backend prompt refreshed'); } catch {}
                  }
                }}
                className="btn-secondary"
              >
                Refresh Backend Prompt
              </button>
              <button
                onClick={() => { localStorage.removeItem('devops-backend-prompt'); setStoredBackendPrompt(null); toast.success('Backend prompt removed'); }}
                className="btn-secondary"
              >
                Remove Backend Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stored Guidelines from AI Guidelines */}
      {storedGuidelines && (
        <div className="card">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Generated Guidelines</h2>
                  <p className="text-green-100">Ready to push to Azure DevOps repository</p>
                </div>
              </div>
              <div className="text-white text-sm">
                Generated: {new Date(storedGuidelines.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">File Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Filename:</strong> {storedGuidelines.fileName}<br/>
                  <strong>Content Length:</strong> {storedGuidelines.content.length} characters<br/>
                  <strong>Generated:</strong> {new Date(storedGuidelines.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Preview</h3>
              <div className="max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {storedGuidelines.content.substring(0, 800)}
                  {storedGuidelines.content.length > 800 && (
                    <span className="text-blue-600 font-medium">... ({storedGuidelines.content.length - 800} more characters)</span>
                  )}
                </pre>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => pushGuidelinesToAzure(storedGuidelines)}
                disabled={!validateConfig(false)}
                className="btn-primary disabled:opacity-50"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Push Guidelines to Azure
              </button>
              <button
                onClick={() => {
                  console.log('Current stored guidelines:', storedGuidelines);
                  const storedData = localStorage.getItem('devops-guidelines');
                  console.log('Raw localStorage data:', storedData);
                  if (storedData) {
                    try {
                      const parsed = JSON.parse(storedData);
                      console.log('Parsed guidelines data:', parsed);
                      setStoredGuidelines(parsed);
                      toast.success('Guidelines data refreshed from localStorage');
                    } catch (error) {
                      toast.error('Error parsing stored guidelines data');
                    }
                  } else {
                    toast.error('No guidelines found in localStorage');
                  }
                }}
                className="btn-secondary"
              >
                Debug Guidelines
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('devops-guidelines');
                  setStoredGuidelines(null);
                  toast.success('Guidelines removed from DevOps Integration');
                }}
                className="btn-secondary"
              >
                Remove Guidelines
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Guidelines Notification */}
      {!storedGuidelines && (
        <div className="card">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">No AI Guidelines Available</h3>
                <p className="text-blue-600">
                  Generate guidelines in the AI Guidelines tab first, then use the "Send to DevOps" button to make them available here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Selection */}
      <div className="space-y-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Items for Azure DevOps</h2>
          <p className="text-gray-600">Choose the epics, features, and user stories you want to create in Azure DevOps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Epics */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Target className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800">Epics</h3>
                    <p className="text-sm text-red-600">{epics.length} available</p>
                  </div>
                </div>
            <button
              onClick={() => selectAllItems('epics')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Select All
            </button>
          </div>
            </div>

            {/* Items List */}
            <div className="p-6">
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {epics.length > 0 ? (
                  epics.map((epic) => (
                    <label key={epic.id} className="group flex items-start space-x-4 p-4 bg-gray-50 hover:bg-red-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-red-200">
                <input
                  type="checkbox"
                  checked={selectedItems.epics.includes(epic.id)}
                  onChange={() => toggleItemSelection('epics', epic.id)}
                        className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-red-800 transition-colors line-clamp-2">
                          {epic.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {epic.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                            Epic
                          </span>
                          {epic.priority && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              epic.priority === 'high' ? 'bg-red-100 text-red-600' :
                              epic.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {epic.priority}
                            </span>
                          )}
                        </div>
                </div>
              </label>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No epics available</p>
                    <p className="text-xs text-gray-400 mt-1">Generate some epics first</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {selectedItems.epics.length} of {epics.length} selected
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-gray-500 text-xs">High Level Objectives</span>
                </div>
              </div>
          </div>
        </div>

        {/* Features */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-800">Features</h3>
                    <p className="text-sm text-blue-600">{features.length} available</p>
                  </div>
                </div>
            <button
              onClick={() => selectAllItems('features')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Select All
            </button>
          </div>
            </div>

            {/* Items List */}
            <div className="p-6">
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {features.length > 0 ? (
                  features.map((feature) => (
                    <label key={feature.id} className="group flex items-start space-x-4 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200">
                <input
                  type="checkbox"
                  checked={selectedItems.features.includes(feature.id)}
                  onChange={() => toggleItemSelection('features', feature.id)}
                        className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-800 transition-colors line-clamp-2">
                          {feature.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {feature.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                            Feature
                          </span>
                          {feature.status && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              feature.status === 'completed' ? 'bg-green-100 text-green-600' :
                              feature.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {feature.status}
                            </span>
                          )}
                        </div>
                </div>
              </label>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No features available</p>
                    <p className="text-xs text-gray-400 mt-1">Generate some features first</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {selectedItems.features.length} of {features.length} selected
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-500 text-xs">Functional Groupings</span>
                </div>
              </div>
          </div>
        </div>

        {/* User Stories */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">User Stories</h3>
                    <p className="text-sm text-green-600">{userStories.length} available</p>
                  </div>
                </div>
            <button
              onClick={() => selectAllItems('userStories')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Select All
            </button>
          </div>
            </div>

            {/* Items List */}
            <div className="p-6">
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {userStories.length > 0 ? (
                  userStories.map((story) => (
                    <label key={story.id} className="group flex items-start space-x-4 p-4 bg-gray-50 hover:bg-green-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-green-200">
                <input
                  type="checkbox"
                  checked={selectedItems.userStories.includes(story.id)}
                  onChange={() => toggleItemSelection('userStories', story.id)}
                        className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-green-800 transition-colors line-clamp-2">
                          {story.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {story.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                            User Story
                          </span>
                          {story.storyPoints && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-medium rounded-full">
                              {story.storyPoints} pts
                            </span>
                          )}
                        </div>
                </div>
              </label>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No user stories available</p>
                    <p className="text-xs text-gray-400 mt-1">Generate some user stories first</p>
          </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {selectedItems.userStories.length} of {userStories.length} selected
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-500 text-xs">Detailed Requirements</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



             {/* Azure DevOps Actions */}
       <div className="card">
         <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-semibold text-gray-900">Azure DevOps Integration</h2>
           <div className="text-sm text-gray-500">
             {getSelectedItemsCount()} items selected
           </div>
         </div>
         
         {/* Work Items Section */}
         <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
           <div className="flex items-start space-x-3 mb-3">
             <GitBranch className="w-5 h-5 text-blue-600 mt-0.5" />
             <div>
               <h3 className="text-sm font-semibold text-blue-900 mb-1">Create Work Items</h3>
               <p className="text-sm text-blue-800 mb-3">
                 Create Epics, Features, and User Stories in Azure DevOps with proper parent-child linking.
               </p>
             </div>
           </div>
           <div className="flex space-x-3">
             <button
               onClick={createWorkItemsInAzureDevOps}
               disabled={!validateConfig(false) || 
                 (selectedItems.epics.length + selectedItems.features.length + selectedItems.userStories.length) === 0 || 
                 isPushing}
               className="btn-primary disabled:opacity-50"
             >
               {isPushing ? (
                 <>
                   <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                   Creating Work Items...
                 </>
               ) : (
                 <>
                   <GitBranch className="w-4 h-4 mr-2" />
                   Create Work Items
                 </>
               )}
             </button>
             <div className="text-xs text-gray-600 flex items-center">
               Selected: {selectedItems.epics.length} Epics, {selectedItems.features.length} Features, {selectedItems.userStories.length} User Stories
             </div>
           </div>
         </div>

         {/* Documentation Section */}
         <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
           <div className="flex items-start space-x-3 mb-3">
             <FileText className="w-5 h-5 text-green-600 mt-0.5" />
             <div>
               <h3 className="text-sm font-semibold text-green-900 mb-1">Push Work Items Documentation</h3>
               <p className="text-sm text-green-800 mb-3">
                 Push work items as markdown documentation to Azure DevOps repository (src/ folder).
               </p>
             </div>
           </div>
           <div className="flex space-x-3">
             <button
               onClick={previewContent}
               disabled={(selectedItems.epics.length + selectedItems.features.length + selectedItems.userStories.length) === 0}
               className="btn-secondary disabled:opacity-50"
             >
               <FileText className="w-4 h-4 mr-2" />
               Preview Content
             </button>
             
             <button
               onClick={pushToAzureDevOpsRepo}
               disabled={!validateConfig(false) || (selectedItems.epics.length + selectedItems.features.length + selectedItems.userStories.length) === 0 || isPushing}
               className="btn-primary disabled:opacity-50"
             >
               {isPushing ? (
                 <>
                   <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                   Pushing...
                 </>
               ) : (
                 <>
                   <Upload className="w-4 h-4 mr-2" />
                   Push Documentation
                 </>
               )}
             </button>
           </div>
           <div className="text-xs text-gray-600 mt-2">
             Selected: {selectedItems.epics.length} Epics, {selectedItems.features.length} Features, {selectedItems.userStories.length} User Stories
           </div>
         </div>

         {!validateConfig(false) && (
           <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
             <div className="flex items-center space-x-2">
               <AlertCircle className="w-5 h-5 text-yellow-600" />
               <p className="text-sm text-yellow-800">
                 Please configure Azure DevOps settings before using these features
               </p>
             </div>
           </div>
         )}
       </div>

      {/* Push History */}
      {pushHistory.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Push History</h2>
          <div className="space-y-3">
            {pushHistory.map((record) => (
              <div
                key={record.id}
                className={`p-3 rounded-lg border ${
                  record.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {record.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${
                        record.status === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {record.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {record.itemsCount} items
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevOpsIntegration;
