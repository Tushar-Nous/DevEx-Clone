import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { RequirementsProvider } from './context/RequirementsContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import UserStoryPage from './components/UserStoryPage';
import GuidelinesGeneratorWithAzure from './components/GuidelinesGeneratorWithAzure';
import BackendPromptGenerator from './components/BackendPromptGenerator';
import GenerationHistory from './components/GenerationHistory';
import DevOpsIntegration from './components/DevOpsIntegration';
import GoldenRepository from './components/GoldenRepository';
import PersonaManager from './components/PersonaManager';
import KnowledgeBase from './components/KnowledgeBase';
import PromptLibrary from './components/PromptLibrary';

function App() {
  const [aiServiceStatus, setAiServiceStatus] = useState('initializing');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Test AI service availability
  React.useEffect(() => {
    const testAIService = async () => {
      try {
        // Import and test the AI service
        const { testAzureOpenAIConnection } = await import('./utils/aiService');
        const testResult = await testAzureOpenAIConnection();
        console.log('AI Service connection test result:', testResult);
        
        if (testResult.success) {
          setAiServiceStatus('available');
        } else {
          setAiServiceStatus('unavailable');
        }
      } catch (error) {
        setAiServiceStatus('unavailable');
      }
    };

    testAIService();
  }, []);

  return (
    <AuthProvider>
      <RequirementsProvider>
        <NotificationProvider>
          <Router>
          <ProtectedRoute loading={aiServiceStatus === 'initializing'}>
            <div className="min-h-screen bg-gray-50">
              <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
              
              {/* AI Service Status Banner */}
              {aiServiceStatus === 'unavailable' && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 lg:ml-72 ml-0">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">
                        <strong>AI Service Notice:</strong> The Azure OpenAI service is currently unavailable. 
                        The application will work with fallback responses for AI-generated content.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <main className="container mx-auto px-4 py-8 lg:pl-80 pl-4 pt-20 lg:pt-16 transition-all duration-300">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/user-stories" element={<UserStoryPage />} />
                  <Route path="/guidelines-generator" element={<GuidelinesGeneratorWithAzure />} />
                  <Route path="/backend-prompt-generator" element={<BackendPromptGenerator />} />
                  <Route path="/generation-history" element={<GenerationHistory />} />
                  <Route path="/devops-integration" element={<DevOpsIntegration />} />
                  <Route path="/integrations" element={React.createElement(require('./components/Integrations').default)} />
                  <Route path="/golden-repo" element={<GoldenRepository />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/persona-manager" element={<PersonaManager />} />
                  <Route path="/prompt-library" element={<PromptLibrary />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
          <Toaster position="top-right" />
          </Router>
        </NotificationProvider>
      </RequirementsProvider>
    </AuthProvider>
  );
}

export default App;
