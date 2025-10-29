import React, { useState, useEffect } from 'react';
import { useRequirements } from '../context/RequirementsContext';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';
import { 
  Target, 
  Zap, 
  Users, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  RefreshCw,
  Code2,
  Server
} from 'lucide-react';
import { createWorkItems } from '../utils/azureDevOpsService';

const UserStoryPage = () => {
  const { epics, features, userStories } = useRequirements();

  // Toggle between frontend and backend
  const [isBackendMode, setIsBackendMode] = useState(false);

  // State for API data
  const [loading, setLoading] = useState(true);
  const [parsedEpics, setParsedEpics] = useState([]);
  const [parsedFeatures, setParsedFeatures] = useState([]);
  const [parsedUserStories, setParsedUserStories] = useState([]);

  // State for backend projects
  const [backendProjects, setBackendProjects] = useState([]);
  const [backendEpics, setBackendEpics] = useState([]);
  const [backendFeatures, setBackendFeatures] = useState([]);
  const [backendUserStories, setBackendUserStories] = useState([]);

  // Fetch agile artifacts from API (effect added after definition below to avoid no-use-before-define)

  const fetchAgileArtifacts = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.getAgileArtifacts);
      if (response.ok) {
        const data = await response.json();
        const artifacts = data.data || [];
        parseArtifacts(artifacts);
      } else {
        toast.error('Failed to load project data');
      }
    } catch (error) {
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch backend projects
  const fetchBackendProjects = React.useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching backend projects...');
      const response = await fetch(API_ENDPOINTS.backendProjects);
      if (response.ok) {
        const data = await response.json();
        console.log('Backend projects response:', data);
        const projects = data.data || data || [];
        setBackendProjects(projects);
        parseBackendProjects(projects);
      } else {
        toast.error('Failed to load backend projects');
      }
    } catch (error) {
      console.error('Error fetching backend projects:', error);
      toast.error('Failed to load backend projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Parse backend projects to extract agile artifacts
  const parseBackendProjects = (projects) => {
    const epics = [];
    const features = [];
    const userStories = [];

    // Helper function to safely handle acceptanceCriteria
    const safeAcceptanceCriteria = (criteria) => {
      if (Array.isArray(criteria)) {
        return criteria;
      }
      if (typeof criteria === 'string') {
        return criteria.split('\n').filter(item => item.trim());
      }
      return [];
    };

    projects.forEach((project) => {
      if (project.agileArtifacts && project.agileArtifacts.parsed) {
        const parsed = project.agileArtifacts.parsed;
        
        // Add project context to each artifact
        parsed.epics?.forEach(epic => {
          epics.push({
            ...epic,
            projectName: project.projectName,
            projectId: project.id,
            projectType: 'backend',
            acceptanceCriteria: safeAcceptanceCriteria(epic.acceptanceCriteria)
          });
        });

        parsed.features?.forEach(feature => {
          features.push({
            ...feature,
            projectName: project.projectName,
            projectId: project.id,
            projectType: 'backend',
            acceptanceCriteria: safeAcceptanceCriteria(feature.acceptanceCriteria)
          });
        });

        parsed.userStories?.forEach(story => {
          userStories.push({
            ...story,
            projectName: project.projectName,
            projectId: project.id,
            projectType: 'backend',
            acceptanceCriteria: safeAcceptanceCriteria(story.acceptanceCriteria)
          });
        });
      }
    });

    setBackendEpics(epics);
    setBackendFeatures(features);
    setBackendUserStories(userStories);
  };

  // Now attach the effect after the callback is defined to satisfy lint rules
  useEffect(() => {
    if (isBackendMode) {
      fetchBackendProjects();
    } else {
      fetchAgileArtifacts();
    }
  }, [fetchAgileArtifacts, fetchBackendProjects, isBackendMode]);

  // Parse agile artifacts to extract epics, features, and user stories
  const parseArtifacts = (artifacts) => {
    const epics = [];
    const features = [];
    const userStories = [];

    artifacts.forEach((artifact, index) => {
      const content = artifact.agile_artifacts;
      const lines = content.split('\n');
      
      let currentSection = null;
      let currentEpic = null;

      for (let line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine === 'Epic') {
          currentSection = 'epic';
          continue;
        } else if (trimmedLine === 'Features') {
          currentSection = 'features';
          continue;
        } else if (trimmedLine === 'User Stories') {
          currentSection = 'userStories';
          continue;
        }

        if (currentSection === 'epic' && trimmedLine && !trimmedLine.startsWith('Feature')) {
          currentEpic = {
            id: `epic-${artifact.id}`,
            title: trimmedLine,
            description: artifact.requirement.substring(0, 200) + '...',
      status: 'pending',
      priority: 'medium',
            storyPoints: Math.floor(Math.random() * 30) + 20,
            acceptanceCriteria: [
              'Epic should be broken down into manageable features',
              'All features should align with business objectives',
              'Success criteria should be measurable'
            ],
            timestamp: artifact.timestamp,
            originalId: artifact.id
          };
          epics.push(currentEpic);
        } else if (currentSection === 'features' && trimmedLine.startsWith('Feature')) {
          const feature = {
            id: `feature-${artifact.id}-${features.length}`,
            title: trimmedLine,
            description: `Feature implementation for: ${trimmedLine}`,
            status: Math.random() > 0.5 ? 'active' : 'pending',
            priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            storyPoints: Math.floor(Math.random() * 15) + 5,
      acceptanceCriteria: [
              'Feature should meet functional requirements',
              'User interface should be intuitive',
              'Performance should meet standards'
            ],
            timestamp: artifact.timestamp,
            originalId: artifact.id
          };
          features.push(feature);
        } else if (currentSection === 'userStories' && trimmedLine.startsWith('User Story')) {
          const story = {
            id: `story-${artifact.id}-${userStories.length}`,
            title: trimmedLine,
            description: trimmedLine,
            status: ['completed', 'in-progress', 'pending'][Math.floor(Math.random() * 3)],
            priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            storyPoints: Math.floor(Math.random() * 8) + 1,
      acceptanceCriteria: [
              'User story should follow INVEST criteria',
              'Acceptance criteria should be testable',
              'Story should provide business value'
            ],
            timestamp: artifact.timestamp,
            originalId: artifact.id
          };
          userStories.push(story);
        }
      }
    });

    setParsedEpics(epics);
    setParsedFeatures(features);
    setParsedUserStories(userStories);
  };

  // Combine context data with parsed API data based on mode
  const allEpics = isBackendMode ? [] : [...parsedEpics, ...epics];
  const allFeatures = isBackendMode ? [] : [...parsedFeatures, ...features];
  const allUserStories = isBackendMode ? [] : [...parsedUserStories, ...userStories];

  // For backend mode, group data by project
  const backendProjectsData = React.useMemo(() => {
    if (!isBackendMode) return [];
    return backendProjects.map(project => ({
      ...project,
      epics: backendEpics.filter(epic => epic.projectId === project.id),
      features: backendFeatures.filter(feature => feature.projectId === project.id),
      userStories: backendUserStories.filter(story => story.projectId === project.id)
    }));
  }, [isBackendMode, backendProjects, backendEpics, backendFeatures, backendUserStories]);

  const [expandedSections, setExpandedSections] = useState({
    epics: true,
    features: true,
    userStories: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all'); // all, epics, features, userStories
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState({});

  // Sort backend projects based on recent toggle
  const sortedBackendProjectsData = React.useMemo(() => {
    if (!isBackendMode) return [];
    
    return [...backendProjectsData].sort((a, b) => {
      if (showRecentOnly) {
        // Sort by timestamp descending (most recent first)
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      // Default sorting by project name
      return a.projectName.localeCompare(b.projectName);
    });
  }, [backendProjectsData, showRecentOnly, isBackendMode]);

  // Toggle project expansion
  const toggleProjectExpansion = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Create New Item Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [epicMode, setEpicMode] = useState('existing'); // existing | new
  const [featureMode, setFeatureMode] = useState('existing');
  const [storyMode, setStoryMode] = useState('existing');
  const [selectedEpicId, setSelectedEpicId] = useState('');
  const [selectedFeatureId, setSelectedFeatureId] = useState('');
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [newEpicTitle, setNewEpicTitle] = useState('');
  const [newEpicDesc, setNewEpicDesc] = useState('');
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDesc, setNewStoryDesc] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
      case 'todo':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filterItems = (items) => {
    let filtered = items;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        const status = item.status?.toLowerCase();
        switch (filterStatus) {
          case 'active':
            return status === 'in-progress' || status === 'active';
          case 'completed':
            return status === 'completed' || status === 'done';
          case 'pending':
            return status === 'pending' || status === 'todo';
          default:
            return true;
        }
      });
    }

    // Filter by recent generation (show only items from API - recently generated)
    if (showRecentOnly) {
      filtered = filtered.filter(item => item.isFromAPI || item.originalId);
    }

    return filtered;
  };

  // Filter backend projects by project name
  const filteredBackendProjects = React.useMemo(() => {
    if (!isBackendMode || !searchTerm) return sortedBackendProjectsData;
    
    return sortedBackendProjectsData.filter(project => 
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedBackendProjectsData, searchTerm, isBackendMode]);

  const renderItem = (item, type, icon, bgColor) => {
    const isFromAPI = item.originalId; // Items from API have originalId
    
    return (
      <div
        key={item.id}
        className="group relative p-5 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:border-gray-300 bg-white hover:bg-gray-50"
      >
        {/* Status indicator line */}
        <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${
          item.status === 'completed' || item.status === 'done' ? 'bg-green-500' :
          item.status === 'in-progress' || item.status === 'active' ? 'bg-blue-500' :
          item.status === 'pending' || item.status === 'todo' ? 'bg-yellow-500' : 'bg-gray-300'
        }`} />
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className={`p-3 rounded-xl ${bgColor} group-hover:scale-105 transition-transform shadow-sm`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                    {item.title}
                  </h4>
                  {isFromAPI && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm whitespace-nowrap">
                      API
                    </span>
                  )}
                  {item.projectType === 'backend' && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm whitespace-nowrap">
                      {item.projectName}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  {getStatusIcon(item.status)}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center space-x-3">
                  {item.priority && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getPriorityColor(item.priority)} shadow-sm`}>
                      {item.priority.toUpperCase()}
                    </span>
                  )}
                  
                  {item.storyPoints && (
                    <div className="flex items-center space-x-1.5 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200">
                      <Star className="w-3.5 h-3.5 text-yellow-600 fill-current" />
                      <span className="text-xs font-medium text-yellow-700">{item.storyPoints} pts</span>
                    </div>
                  )}
                </div>
              </div>
              
              {item.acceptanceCriteria && Array.isArray(item.acceptanceCriteria) && item.acceptanceCriteria.length > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="text-xs font-bold text-gray-800 mb-2 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Acceptance Criteria:</span>
                  </div>
                  <ul className="text-xs text-gray-700 space-y-1.5">
                    {item.acceptanceCriteria.slice(0, 3).map((criteria, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 font-bold mt-0.5">✓</span>
                        <span className="leading-relaxed">{criteria}</span>
                      </li>
                    ))}
                    {item.acceptanceCriteria.length > 3 && (
                      <li className="text-blue-600 font-medium text-center pt-1 border-t border-gray-300">
                        +{item.acceptanceCriteria.length - 3} more criteria...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render backend projects in file format
  const renderBackendProject = (project) => {
    // total items available per project (kept inline where used)
    const isExpanded = expandedProjects[project.id] || false;
    
    return (
      <div key={project.id} className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        {/* File Header - Clickable */}
        <div 
          className="border-b border-gray-200 px-6 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleProjectExpansion(project.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.projectName}</h3>
                <p className="text-sm text-gray-500">
                  {project.input?.language} • {project.input?.framework} • {project.input?.database || 'No DB'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Created: {new Date(project.timestamp).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-400">
                  {project.epics.length} Epics • {project.features.length} Features • {project.userStories.length} Stories
                </div>
              </div>
              <div className="flex items-center">
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* File Content - Collapsible */}
        {isExpanded && (
          <div className="p-6">
            {/* Project Description */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                {project.input?.requirement || 'No description provided'}
              </p>
            </div>

            {/* Technology Stack */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Technology Stack</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {project.input?.language || 'Not specified'}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {project.input?.framework || 'Not specified'}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  {project.input?.database || 'No Database'}
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                  {project.input?.cloud || 'No Cloud'}
                </span>
              </div>
            </div>

            {/* Epics */}
            {project.epics.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Epics ({project.epics.length})</h4>
                <div className="space-y-2">
                  {project.epics.map(epic => (
                    <div key={epic.id} className="bg-gray-50 p-3 rounded border-l-4 border-orange-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{epic.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">{epic.description}</p>
                          {epic.acceptanceCriteria && epic.acceptanceCriteria.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700">Acceptance Criteria:</p>
                              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                                {epic.acceptanceCriteria.slice(0, 3).map((criteria, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-orange-500 mr-1">•</span>
                                    {criteria}
                                  </li>
                                ))}
                                {epic.acceptanceCriteria.length > 3 && (
                                  <li className="text-xs text-gray-500 italic">
                                    +{epic.acceptanceCriteria.length - 3} more criteria
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          Epic
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {project.features.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Features ({project.features.length})</h4>
                <div className="space-y-2">
                  {project.features.map(feature => (
                    <div key={feature.id} className="bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{feature.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                          {feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700">Acceptance Criteria:</p>
                              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                                {feature.acceptanceCriteria.slice(0, 3).map((criteria, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-blue-500 mr-1">•</span>
                                    {criteria}
                                  </li>
                                ))}
                                {feature.acceptanceCriteria.length > 3 && (
                                  <li className="text-xs text-gray-500 italic">
                                    +{feature.acceptanceCriteria.length - 3} more criteria
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          Feature
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Stories */}
            {project.userStories.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">User Stories ({project.userStories.length})</h4>
                <div className="space-y-2">
                  {project.userStories.map(story => (
                    <div key={story.id} className="bg-gray-50 p-3 rounded border-l-4 border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{story.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">{story.description}</p>
                          {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700">Acceptance Criteria:</p>
                              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                                {story.acceptanceCriteria.slice(0, 3).map((criteria, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-green-500 mr-1">•</span>
                                    {criteria}
                                  </li>
                                ))}
                                {story.acceptanceCriteria.length > 3 && (
                                  <li className="text-xs text-gray-500 italic">
                                    +{story.acceptanceCriteria.length - 3} more criteria
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Story
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors">
                Edit Project
              </button>
              <button className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors">
                Delete Project
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title, items, type, icon, color, bgColor) => {
    const filteredItems = filterItems(items);
    const isExpanded = expandedSections[type];
    const shouldShow = selectedCategory === 'all' || selectedCategory === type;

    if (!shouldShow) return null;

    return (
      <div className="mb-10">
        <div
          className={`flex items-center justify-between p-5 bg-gradient-to-r ${
            type === 'epics' ? 'from-blue-50 to-indigo-50 border-blue-200' :
            type === 'features' ? 'from-green-50 to-emerald-50 border-green-200' :
            'from-purple-50 to-violet-50 border-purple-200'
          } rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 shadow-sm border-2`}
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center space-x-5">
            <div className={`p-4 rounded-xl ${bgColor} shadow-md group-hover:scale-105 transition-transform`}>
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
              <p className="text-sm text-gray-600 font-medium">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} 
                {searchTerm || filterStatus !== 'all' || showRecentOnly ? ' (filtered)' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-3 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm">
              <Plus className="w-5 h-5 text-gray-700" />
            </button>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {filteredItems.length}/{items.length}
              </div>
              <div className="text-xs text-gray-500 font-medium">showing</div>
            </div>
            <div className={`p-2 rounded-lg transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : 'rotate-0'
            }`}>
              <ChevronDown className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => renderItem(item, type, icon, bgColor))
            ) : (
              <div className="col-span-full text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="p-6 bg-white rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No {title.toLowerCase()} found</h3>
                <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                  {searchTerm || filterStatus !== 'all' || showRecentOnly
                    ? 'Try adjusting your search terms or filter settings to see more results.' 
                    : `Get started by creating your first ${type.slice(0, -1)} to organize your project effectively.`
                  }
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Plus className="w-5 h-5 mr-2 inline" />
                  Create {type.slice(0, -1)}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getCategoryItems = () => {
    if (isBackendMode) {
      return backendProjectsData;
    }
    switch (selectedCategory) {
      case 'epics': return allEpics;
      case 'features': return allFeatures;
      case 'userStories': return allUserStories;
      default: return [...allEpics, ...allFeatures, ...allUserStories];
    }
  };

  const totalItems = isBackendMode ? sortedBackendProjectsData.length : getCategoryItems().length;
  const filteredTotal = isBackendMode ? filteredBackendProjects.length : filterItems(getCategoryItems()).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            User Stories & Project Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage your {isBackendMode ? 'backend projects' : 'epics, features, and user stories'} with ease
            {isBackendMode && showRecentOnly && (
              <span className="ml-2 text-sm text-blue-600 font-medium">
                <Clock className="w-4 h-4 inline mr-1" />
                Sorted by Recent
              </span>
            )}
          </p>
          
          {/* Toggle Switch */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                !isBackendMode ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
              }`}>
                <Code2 className="w-4 h-4" />
                <span className="text-sm font-medium">Frontend</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isBackendMode ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
              }`}>
                <Server className="w-4 h-4" />
                <span className="text-sm font-medium">Backend</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isBackendMode}
                onChange={(e) => setIsBackendMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {isBackendMode ? 'Backend Projects' : 'Frontend Projects'}
              </span>
            </label>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={isBackendMode ? fetchBackendProjects : fetchAgileArtifacts}
            disabled={loading}
            className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
          <Plus className="w-5 h-5" />
          <span>Create New Item</span>
        </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {isBackendMode ? 'Total Projects' : 'Total Items'}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
              <p className="text-xs text-gray-500 mt-1">
                {isBackendMode ? 'Backend projects' : 'All project items'}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              {isBackendMode ? <Server className="w-8 h-8 text-gray-600" /> : <FileText className="w-8 h-8 text-gray-600" />}
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Epics</p>
              <p className="text-3xl font-bold text-blue-800 mt-1">
                {isBackendMode ? backendEpics.length : allEpics.length}
              </p>
              <p className="text-xs text-blue-600 mt-1">High-level objectives</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl">
              <Target className="w-8 h-8 text-blue-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Features</p>
              <p className="text-3xl font-bold text-green-800 mt-1">
                {isBackendMode ? backendFeatures.length : allFeatures.length}
              </p>
              <p className="text-xs text-green-600 mt-1">Functional groupings</p>
            </div>
            <div className="p-3 bg-green-200 rounded-xl">
              <Zap className="w-8 h-8 text-green-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">User Stories</p>
              <p className="text-3xl font-bold text-purple-800 mt-1">
                {isBackendMode ? backendUserStories.length : allUserStories.length}
              </p>
              <p className="text-xs text-purple-600 mt-1">Detailed requirements</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <Users className="w-8 h-8 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={isBackendMode 
                ? "Search backend projects..." 
                : "Search epics, features, and user stories..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-semibold text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm font-medium"
            >
              <option value="all">
                {isBackendMode ? 'All Projects' : 'All Categories'}
              </option>
              <option value="epics">🎯 Epics Only</option>
              <option value="features">⚡ Features Only</option>
              <option value="userStories">👥 User Stories Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-semibold text-gray-700">Status:</label>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">🔵 Active</option>
              <option value="pending">🟡 Pending</option>
              <option value="completed">🟢 Completed</option>
            </select>
          </div>

          {/* Recent Generation Filter */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <label className="text-sm font-semibold text-gray-700">Recent:</label>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showRecentOnly}
                onChange={(e) => setShowRecentOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {showRecentOnly 
                  ? (isBackendMode ? 'Recent Projects' : 'Recent Only')
                  : (isBackendMode ? 'All Projects' : 'All Items')
                }
              </span>
            </label>
          </div>

          {/* Results Count */}
          <div className="bg-white p-3 rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {filteredTotal}/{totalItems}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {filteredTotal === totalItems 
                  ? (isBackendMode ? 'All projects' : 'All items')
                  : 'Filtered'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Loading {isBackendMode ? 'Backend' : 'Frontend'} Project Data
            </h3>
            <p className="text-gray-600">
              Fetching your {isBackendMode ? 'backend' : 'frontend'} epics, features, and user stories...
            </p>
          </div>
        </div>
      ) : (
        <>
      {/* Content Sections */}
      <div>
        {isBackendMode ? (
          // Backend Projects View
          <div className="space-y-8">
            {filteredBackendProjects.length > 0 ? (
              filteredBackendProjects.map(project => renderBackendProject(project))
            ) : (
              <div className="text-center py-16">
                <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Server className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  {searchTerm ? 'No Matching Projects Found' : 'No Backend Projects Yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? `No backend projects match "${searchTerm}". Try a different search term.`
                    : 'Get started by creating backend projects using the Backend Prompt Generator to see your projects here.'
                  }
                </p>
                <button 
                  onClick={fetchBackendProjects}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2 inline" />
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        ) : (
          // Frontend View (existing)
          <>
            {renderSection(
              'Epics',
              allEpics,
              'epics',
              <Target className="w-5 h-5 text-blue-600" />,
              'blue',
              'bg-blue-100 text-blue-600'
            )}

            {renderSection(
              'Features',
              allFeatures,
              'features',
              <Zap className="w-5 h-5 text-green-600" />,
              'green',
              'bg-green-100 text-green-600'
            )}

            {renderSection(
              'User Stories',
              allUserStories,
              'userStories',
              <Users className="w-5 h-5 text-purple-600" />,
              'purple',
              'bg-purple-100 text-purple-600'
            )}
          </>
        )}
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <div className="text-center py-16">
          <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">No {isBackendMode ? 'Backend' : 'Frontend'} Project Items Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by generating {isBackendMode ? 'backend' : 'frontend'} agile artifacts to see your epics, features, and user stories here.
          </p>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={isBackendMode ? fetchBackendProjects : fetchAgileArtifacts}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Refresh Data
            </button>
          </div>
        </div>
          )}
        </>
      )}
      
      {/* Create New Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isPosting && setShowCreateModal(false)}></div>
          <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Create and Post Work Items</h3>
                  <p className="text-blue-100">Select existing artifacts or type new ones. They will be posted to Azure DevOps with your default configuration.</p>
                </div>
                <button onClick={() => !isPosting && setShowCreateModal(false)} className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 text-sm">
                  Close
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Epics */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center"><Target className="w-5 h-5 text-blue-600 mr-2" />Epic</h4>
                  <div className="space-x-2 text-sm">
                    <button className={`px-3 py-1 rounded-lg border ${epicMode==='existing'?'bg-blue-50 border-blue-200 text-blue-700':'bg-gray-50 border-gray-200 text-gray-700'}`} onClick={() => setEpicMode('existing')}>Use Existing</button>
                    <button className={`px-3 py-1 rounded-lg border ${epicMode==='new'?'bg-blue-50 border-blue-200 text-blue-700':'bg-gray-50 border-gray-200 text-gray-700'}`} onClick={() => setEpicMode('new')}>Create New</button>
                  </div>
                </div>
                {epicMode === 'existing' ? (
                  <select value={selectedEpicId} onChange={(e)=>setSelectedEpicId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select an existing epic</option>
                    {allEpics.map(e=> (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={newEpicTitle} onChange={(e)=>setNewEpicTitle(e.target.value)} placeholder="Epic title" className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <input value={newEpicDesc} onChange={(e)=>setNewEpicDesc(e.target.value)} placeholder="Epic description" className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center"><Zap className="w-5 h-5 text-green-600 mr-2" />Feature</h4>
                  <div className="space-x-2 text-sm">
                    <button className={`px-3 py-1 rounded-lg border ${featureMode==='existing'?'bg-green-50 border-green-200 text-green-700':'bg-gray-50 border-gray-200 text-gray-700'}`} onClick={() => setFeatureMode('existing')}>Use Existing</button>
                    <button className={`px-3 py-1 rounded-lg border ${featureMode==='new'?'bg-green-50 border-green-200 text-green-700':'bg-gray-50 border-gray-200 text-gray-700'}`} onClick={() => setFeatureMode('new')}>Create New</button>
                  </div>
                </div>
                {featureMode === 'existing' ? (
                  <select value={selectedFeatureId} onChange={(e)=>setSelectedFeatureId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="">Select an existing feature</option>
                    {allFeatures.map(f=> (
                      <option key={f.id} value={f.id}>{f.title}</option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={newFeatureTitle} onChange={(e)=>setNewFeatureTitle(e.target.value)} placeholder="Feature title" className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    <input value={newFeatureDesc} onChange={(e)=>setNewFeatureDesc(e.target.value)} placeholder="Feature description" className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                )}
              </div>

              {/* User Story */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center"><Users className="w-5 h-5 text-purple-600 mr-2" />User Story</h4>
                  <div className="space-x-2 text-sm">
                    <button className={`px-3 py-1 rounded-lg border ${storyMode==='existing'?'bg-purple-50 border-purple-200 text-purple-700':'bg-gray-50 border-gray-200 text-gray-700'}`} onClick={() => setStoryMode('existing')}>Use Existing</button>
                    <button className={`px-3 py-1 rounded-lg border ${storyMode==='new'?'bg-purple-50 border-purple-200 text-purple-700':'bg-gray-50 border-gray-200 text-gray-700'}`} onClick={() => setStoryMode('new')}>Create New</button>
                  </div>
                </div>
                {storyMode === 'existing' ? (
                  <select value={selectedStoryId} onChange={(e)=>setSelectedStoryId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="">Select an existing user story</option>
                    {allUserStories.map(s=> (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={newStoryTitle} onChange={(e)=>setNewStoryTitle(e.target.value)} placeholder="User story title" className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                    <input value={newStoryDesc} onChange={(e)=>setNewStoryDesc(e.target.value)} placeholder="User story description" className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">Items will be posted using your Azure DevOps default configuration.</p>
              <button
                disabled={isPosting}
                onClick={async () => {
                  // Build selected/new payloads
                  const selectedEpic = epicMode === 'existing' ? allEpics.find(e=>e.id===selectedEpicId) : (newEpicTitle ? { id:`epic-temp-${Date.now()}`, title:newEpicTitle, description:newEpicDesc, status:'pending', priority:'medium' } : null);
                  const selectedFeature = featureMode === 'existing' ? allFeatures.find(f=>f.id===selectedFeatureId) : (newFeatureTitle ? { id:`feature-temp-${Date.now()}`, title:newFeatureTitle, description:newFeatureDesc, status:'pending', priority:'medium', storyPoints:5 } : null);
                  const selectedStory = storyMode === 'existing' ? allUserStories.find(s=>s.id===selectedStoryId) : (newStoryTitle ? { id:`story-temp-${Date.now()}`, title:newStoryTitle, description:newStoryDesc, status:'pending', priority:'medium', storyPoints:3, acceptanceCriteria:["Story should follow INVEST"] } : null);

                  const payload = {
                    epics: selectedEpic ? [selectedEpic] : [],
                    features: selectedFeature ? [selectedFeature] : [],
                    userStories: selectedStory ? [selectedStory] : []
                  };

                  const total = payload.epics.length + payload.features.length + payload.userStories.length;
                  if (total === 0) {
                    toast.error('Please select or enter at least one item');
                    return;
                  }

                  // Load DevOps config from localStorage or use defaults
                  let azureConfig = null;
                  try {
                    const saved = localStorage.getItem('azure-devops-config');
                    if (saved) azureConfig = JSON.parse(saved);
                  } catch {}
                  if (!azureConfig) {
                    azureConfig = {
                      organization: process.env.REACT_APP_AZURE_DEVOPS_ORGANIZATION || 'InsurityPOC',
                      project: process.env.REACT_APP_AZURE_DEVOPS_PROJECT || 'InsurityPOC',
                      repository: process.env.REACT_APP_AZURE_DEVOPS_REPOSITORY || 'InsurityPocAIFigma',
                      personalAccessToken: process.env.REACT_APP_AZURE_DEVOPS_PAT || '',
                      branch: process.env.REACT_APP_AZURE_DEVOPS_BRANCH || 'main',
                      filePath: process.env.REACT_APP_AZURE_DEVOPS_FILE_PATH || 'src/'
                    };
                  }

                  setIsPosting(true);
                  try {
                    toast('Creating work items in Azure DevOps...', { icon: '⏳' });
                    const result = await createWorkItems(payload, azureConfig);
                    const created = result?.summary?.epicsCreated + result?.summary?.featuresCreated + result?.summary?.userStoriesCreated;
                    toast.success(`Created ${created || total} work item(s) in Azure DevOps`);
                    setShowCreateModal(false);
                    // reset modal state
                    setEpicMode('existing'); setFeatureMode('existing'); setStoryMode('existing');
                    setSelectedEpicId(''); setSelectedFeatureId(''); setSelectedStoryId('');
                    setNewEpicTitle(''); setNewEpicDesc(''); setNewFeatureTitle(''); setNewFeatureDesc(''); setNewStoryTitle(''); setNewStoryDesc('');
                  } catch (e) {
                    toast.error('Failed to create work items');
                  } finally {
                    setIsPosting(false);
                  }
                }}
                className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${isPosting? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
              >
                {isPosting ? 'Posting…' : 'Post to Azure DevOps'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStoryPage;