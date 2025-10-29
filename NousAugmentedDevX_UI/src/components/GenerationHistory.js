import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';
import { parseAgileArtifacts } from '../utils/agileParser';
import { 
  History, 
  FileText, 
  Layers, 
  Search, 
  Filter, 
  Calendar,
  Eye,
  Download,
  RefreshCw,
  Target,
  Zap,
  Users,
  CheckCircle,
  Star
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const GenerationHistory = () => {
  const [guidelines, setGuidelines] = useState([]);
  const [agileArtifacts, setAgileArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guidelines');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchStoredData();
  }, []);

  const fetchStoredData = async () => {
    setLoading(true);
    try {
      // Fetch guidelines
      const guidelinesResponse = await fetch(API_ENDPOINTS.getGuidelines);
      if (guidelinesResponse.ok) {
        const guidelinesData = await guidelinesResponse.json();
        setGuidelines(guidelinesData.data || []);
      }

      // Fetch agile artifacts
      const artifactsResponse = await fetch(API_ENDPOINTS.getAgileArtifacts);
      if (artifactsResponse.ok) {
        const artifactsData = await artifactsResponse.json();
        setAgileArtifacts(artifactsData.data || []);
      }
    } catch (error) {
      toast.error('Failed to load stored data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    const data = activeTab === 'guidelines' ? guidelines : agileArtifacts;
    
    let filtered = data;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchContent = activeTab === 'guidelines' 
          ? `${item.input} ${item.guidelines}`.toLowerCase()
          : `${item.requirement} ${item.agile_artifacts}`.toLowerCase();
        return searchContent.includes(searchTerm.toLowerCase());
      });
    }
    
    // Sort data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'id':
          return b.id - a.id;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadItem = (item) => {
    const content = activeTab === 'guidelines' 
      ? item.guidelines 
      : item.agile_artifacts;
    const filename = activeTab === 'guidelines'
      ? `guidelines_${item.id}.md`
      : `agile_artifacts_${item.id}.md`;
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success(`${activeTab === 'guidelines' ? 'Guidelines' : 'Agile artifacts'} downloaded successfully!`);
  };

  const previewItem = (item) => {
    setSelectedItem(item);
    setShowPreview(true);
  };

  const renderItem = (item) => {
    const isGuideline = activeTab === 'guidelines';
    const title = isGuideline ? item.input : item.requirement;
    const content = isGuideline ? item.guidelines : item.agile_artifacts;
    
    if (isGuideline) {
      // Render Guidelines
    return (
        <div key={item.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium">Guidelines #{item.id}</span>
                  <div className="flex items-center space-x-1 text-xs text-blue-100">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => previewItem(item)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => downloadItem(item)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                {title}
              </h3>
            <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
              {content.substring(0, 300)}...
            </p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                Guidelines
              </span>
              <div className="text-xs text-gray-500">
                {content.length} characters
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Parse and render Agile Artifacts using shared parser
      const parsed = parseAgileArtifacts(content);
      
      return (
        <div key={item.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium">Agile Artifacts #{item.id}</span>
                  <div className="flex items-center space-x-1 text-xs text-purple-100">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
              <button
                onClick={() => previewItem(item)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadItem(item)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Requirement */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Original Requirement</h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {title}
              </p>
            </div>

            {/* Epic Block */}
            {parsed.epics && parsed.epics.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-red-800">Epic</h4>
                </div>
                <p className="text-sm text-red-700 font-medium">
                  {parsed.epics[0].title}
                </p>
              </div>
            )}

            {/* Features Block */}
            {parsed.features && parsed.features.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-blue-800">Features ({parsed.features.length})</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {parsed.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-blue-700">{feature.title}</span>
                    </div>
                  ))}
                  {parsed.features.length > 3 && (
                    <div className="text-xs text-blue-600 font-medium">
                      +{parsed.features.length - 3} more features...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Stories Block */}
            {parsed.userStories && parsed.userStories.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-green-800">User Stories ({parsed.userStories.length})</h4>
                </div>
                <div className="space-y-2">
                  {parsed.userStories.slice(0, 2).map((story, index) => (
                    <div key={index} className="bg-white bg-opacity-60 rounded p-3">
                      <div className="flex items-start space-x-2">
                        <Star className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-green-700 font-medium">{story.title}</p>
                          {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                            <p className="text-xs text-green-600 mt-1 line-clamp-2">
                              {story.acceptanceCriteria[0]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {parsed.userStories.length > 2 && (
                    <div className="text-xs text-green-600 font-medium">
                      +{parsed.userStories.length - 2} more user stories...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-600">
                  Agile Artifacts
                </span>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {parsed.features.length} Features
                </span>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {parsed.userStories.length} Stories
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {content.length} characters
            </div>
          </div>
        </div>
      </div>
    );
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Generation History</h1>
                  <p className="text-indigo-100">View and manage your stored guidelines and agile artifacts</p>
                </div>
              </div>
              <button
                onClick={fetchStoredData}
                disabled={loading}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('guidelines')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'guidelines'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Guidelines ({guidelines.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('artifacts')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'artifacts'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>Agile Artifacts ({agileArtifacts.length})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="id">By ID</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600 whitespace-nowrap">
                {filteredData.length} of {activeTab === 'guidelines' ? guidelines.length : agileArtifacts.length} items
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading stored data...</p>
            </div>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredData.map(renderItem)}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching results' : `No ${activeTab} found`}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : `Generate some ${activeTab} to see them here`
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h2 className="text-xl font-bold">
                      {activeTab === 'guidelines' ? 'Guidelines Preview' : 'Agile Artifacts Preview'}
                    </h2>
                    <p className="text-indigo-100">ID: #{selectedItem.id} • {formatDate(selectedItem.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Original Input:</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-700">
                      {activeTab === 'guidelines' ? selectedItem.input : selectedItem.requirement}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generated Content:</h3>
                  <div className="prose prose-lg max-w-none">
                    {activeTab === 'guidelines' ? (
                      <ReactMarkdown className="markdown-content">
                        {selectedItem.guidelines}
                      </ReactMarkdown>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const parsed = parseAgileArtifacts(selectedItem.agile_artifacts);
                          return (
                            <>
                              {/* Epic */}
                              {parsed.epics && parsed.epics.length > 0 && (
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg p-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Target className="w-5 h-5 text-red-500" />
                                    <h4 className="font-semibold text-red-800">Epic</h4>
                                  </div>
                                  <p className="text-sm text-red-700">{parsed.epics[0].title}</p>
                                </div>
                              )}

                              {/* Features */}
                              {parsed.features && parsed.features.length > 0 && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg p-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Zap className="w-5 h-5 text-blue-500" />
                                    <h4 className="font-semibold text-blue-800">Features ({parsed.features.length})</h4>
                                  </div>
                                  <div className="space-y-2">
                                    {parsed.features.map((feature, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        <span className="text-sm text-blue-700">{feature.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* User Stories */}
                              {parsed.userStories && parsed.userStories.length > 0 && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg p-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Users className="w-5 h-5 text-green-500" />
                                    <h4 className="font-semibold text-green-800">User Stories ({parsed.userStories.length})</h4>
                                  </div>
                                  <div className="space-y-3">
                                    {parsed.userStories.map((story, index) => (
                                      <div key={index} className="bg-white bg-opacity-60 rounded p-3">
                                        <div className="flex items-start space-x-2">
                                          <Star className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                          <div className="flex-1">
                                            <p className="text-sm text-green-700 font-medium mb-1">{story.title}</p>
                                            {story.persona && (
                                              <p className="text-xs text-green-600 font-semibold mb-1">
                                                Persona: {story.persona}
                                              </p>
                                            )}
                                            {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                                              <div className="mt-2">
                                                <p className="text-xs font-semibold text-green-700 mb-1">Acceptance Criteria:</p>
                                                {story.acceptanceCriteria.map((criteria, criteriaIndex) => (
                                                  <p key={criteriaIndex} className="text-xs text-green-600 mb-0.5 pl-2">
                                                    • {criteria}
                                                  </p>
                                                ))}
                                              </div>
                                            )}
                                            {story.priority && (
                                              <p className="text-xs text-green-600 mt-1">
                                                <span className="font-semibold">Priority:</span> {story.priority}
                                              </p>
                                            )}
                                            {story.storyPoints > 0 && (
                                              <p className="text-xs text-green-600">
                                                <span className="font-semibold">Story Points:</span> {story.storyPoints}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => downloadItem(selectedItem)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerationHistory;
