import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, GitBranch, Puzzle, Clock, CheckCircle2, Bell, Settings, Users, Menu, X, History, Database, BookOpen, UserCog, AlertTriangle, Library, Code2, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import UserProfile from './UserProfile';
import NotificationSidebar from './NotificationSidebar';
import Breadcrumb from './Breadcrumb';
import { useNotifications } from '../context/NotificationContext';

// Sidebar component replacing the old top navbar
const Navigation = ({ activeTab, setActiveTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, getUnreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDevOpsModal, setShowDevOpsModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const [hasSentToDevOps, setHasSentToDevOps] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);

  // Check for generated content and DevOps status
  useEffect(() => {
    const checkContentStatus = () => {
      // Only check for content if user is currently on guidelines generator page
      if (location.pathname !== '/guidelines-generator') {
        setHasGeneratedContent(false);
        setHasSentToDevOps(true); // Prevent modal from showing on other pages
        return;
      }
      
      // Check if there's generated content in localStorage that was created in current session
      const guidelines = localStorage.getItem('devops-guidelines');
      const sessionGenerated = sessionStorage.getItem('content-generated-this-session');
      const hasContent = guidelines && guidelines !== 'null' && sessionGenerated === 'true';
      
      // Check if content has been sent to DevOps
      const devOpsStatus = localStorage.getItem('devops-sent-status');
      const hasSent = devOpsStatus === 'true';
      
      setHasGeneratedContent(hasContent);
      setHasSentToDevOps(hasSent);
    };

    // Check on mount
    checkContentStatus();
    
    // Set up interval to check periodically
    const interval = setInterval(checkContentStatus, 1000);
    
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/', description: 'Overview & Analytics' },
    { id: 'user-stories', label: 'User Stories', icon: Users, path: '/user-stories', description: 'Epics, Features & Stories' },
    { id: 'guidelines-generator', label: 'Prompt Generation', icon: FileText, path: '/guidelines-generator', description: 'Generate AI Guidelines', hasSubmenu: true },
    { id: 'generation-history', label: 'Generation History', icon: History, path: '/generation-history', description: 'View Stored Content' },
    { id: 'devops-integration', label: 'DevOps Integration', icon: GitBranch, path: '/devops-integration', description: 'CI/CD & Pipeline Management' },
    { id: 'integrations', label: 'Integrations', icon: Puzzle, path: '/integrations', description: 'Tool Connections' }
  ];

  const promptGenerationSubmenu = [
    { id: 'frontend-prompt', label: 'Frontend', icon: FileText, path: '/guidelines-generator', description: 'UI/UX Guidelines' },
    { id: 'backend-prompt', label: 'Backend', icon: Code2, path: '/backend-prompt-generator', description: 'Code Generation' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSubmenuToggle = (itemId) => {
    setExpandedSubmenu(expandedSubmenu === itemId ? null : itemId);
  };

  const handleNavItemClick = (itemId, path, event) => {
    // If user is leaving guidelines generator and has unsent content, show modal
    if (location.pathname === '/guidelines-generator' && 
        path !== '/guidelines-generator' && 
        hasGeneratedContent && 
        !hasSentToDevOps) {
      event.preventDefault();
      setPendingNavigation({ itemId, path });
      setShowDevOpsModal(true);
      return;
    }
    
    setActiveTab(itemId);
    setIsMobileMenuOpen(false); // Close mobile menu when item is clicked
  };

  const handleDevOpsModalClose = () => {
    setShowDevOpsModal(false);
    setPendingNavigation(null);
  };

  const handlePushToDevOps = () => {
    // Navigate to DevOps integration page
    navigate('/devops-integration');
    setShowDevOpsModal(false);
    setPendingNavigation(null);
    setActiveTab('devops-integration');
    toast.success('Redirecting to DevOps Integration to configure and push your content');
  };

  const handleContinueWithoutPush = () => {
    // Proceed with the original navigation
    if (pendingNavigation) {
      navigate(pendingNavigation.path);
      setActiveTab(pendingNavigation.itemId);
    }
    setShowDevOpsModal(false);
    setPendingNavigation(null);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={handleMobileMenuToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r border-gray-200 shadow-xl z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm">
            <svg 
              className="w-6 h-6 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* AI Falcon Icon */}
              <path 
                d="M12 2L8 6L12 10L16 6L12 2Z" 
                fill="currentColor" 
                opacity="0.8"
              />
              <path 
                d="M6 8L2 12L6 16L10 12L6 8Z" 
                fill="currentColor" 
                opacity="0.6"
              />
              <path 
                d="M18 8L14 12L18 16L22 12L18 8Z" 
                fill="currentColor" 
                opacity="0.6"
              />
              <path 
                d="M12 14L8 18L12 22L16 18L12 14Z" 
                fill="currentColor" 
                opacity="0.4"
              />
              {/* Falcon head and beak */}
              <circle 
                cx="12" 
                cy="8" 
                r="2" 
                fill="currentColor" 
                opacity="0.9"
              />
              <path 
                d="M10 7L8 5L10 3L12 5L10 7Z" 
                fill="currentColor" 
                opacity="0.7"
              />
              {/* AI circuit pattern */}
              <rect 
                x="4" 
                y="4" 
                width="2" 
                height="2" 
                fill="currentColor" 
                opacity="0.5"
              />
              <rect 
                x="18" 
                y="4" 
                width="2" 
                height="2" 
                fill="currentColor" 
                opacity="0.5"
              />
              <rect 
                x="4" 
                y="18" 
                width="2" 
                height="2" 
                fill="currentColor" 
                opacity="0.5"
              />
              <rect 
                x="18" 
                y="18" 
                width="2" 
                height="2" 
                fill="currentColor" 
                opacity="0.5"
              />
            </svg>
          </div>
          <div className="text-white flex-1 min-w-0">
            <div className="text-lg font-bold leading-tight truncate">Nous DevEx Platform</div>
            <div className="text-xs text-blue-100 opacity-90">AI SDLC Portal</div>
          </div>
          
          {/* Notification Bell */}
          <button
            onClick={toggleSidebar}
            className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors mr-2"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {getUnreadCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
              </span>
            )}
          </button>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className="p-4 space-y-2 pb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const hasSubmenu = item.hasSubmenu;
          const isSubmenuExpanded = expandedSubmenu === item.id;
          const isPromptGenerationActive = location.pathname === '/guidelines-generator' || location.pathname === '/backend-prompt-generator';
          
          return (
            <div key={item.id}>
              {hasSubmenu ? (
                <button
                  onClick={() => handleSubmenuToggle(item.id)}
                  className={`group relative overflow-hidden rounded-xl transition-all duration-300 w-full ${
                    isPromptGenerationActive
                      ? 'bg-gray-700 text-white shadow-lg border border-gray-600' 
                      : 'text-gray-700 hover:bg-white hover:shadow-md hover:border-gray-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center p-4">
                    <div className={`p-2.5 rounded-lg mr-4 transition-all duration-300 ${
                      isPromptGenerationActive 
                        ? 'bg-gray-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`font-semibold text-sm ${isPromptGenerationActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isPromptGenerationActive ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    <div className={`transition-transform duration-200 ${isSubmenuExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Active indicator line */}
                  {isPromptGenerationActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full shadow-sm"></div>
                  )}
                  
                  {/* Subtle gradient overlay for active state */}
                  {isPromptGenerationActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-transparent pointer-events-none"></div>
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  onClick={(e) => handleNavItemClick(item.id, item.path, e)}
                  className={`group relative overflow-hidden rounded-xl transition-all duration-300 block ${
                    active
                      ? 'bg-gray-700 text-white shadow-lg border border-gray-600' 
                      : 'text-gray-700 hover:bg-white hover:shadow-md hover:border-gray-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center p-4">
                    <div className={`p-2.5 rounded-lg mr-4 transition-all duration-300 ${
                      active 
                        ? 'bg-gray-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm ${active ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        active ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    {active && (
                      <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    )}
                  </div>
                  
                  {/* Active indicator line */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full shadow-sm"></div>
                  )}
                  
                  {/* Subtle gradient overlay for active state */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-transparent pointer-events-none"></div>
                  )}
                </Link>
              )}
              
              {/* Submenu */}
              {hasSubmenu && isSubmenuExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {promptGenerationSubmenu.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const subActive = isActive(subItem.path);
                    return (
                      <Link
                        key={subItem.id}
                        to={subItem.path}
                        onClick={(e) => handleNavItemClick(subItem.id, subItem.path, e)}
                        className={`group relative overflow-hidden rounded-lg transition-all duration-300 block ${
                          subActive
                            ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center p-3">
                          <div className={`p-1.5 rounded-md mr-3 transition-all duration-300 ${
                            subActive 
                              ? 'bg-blue-200 text-blue-700' 
                              : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                          }`}>
                            <SubIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${subActive ? 'text-blue-800' : 'text-gray-700 group-hover:text-gray-900'}`}>
                              {subItem.label}
                            </div>
                            <div className={`text-xs mt-0.5 ${
                              subActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
                            }`}>
                              {subItem.description}
                            </div>
                          </div>
                          {subActive && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm"></div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Knowledge Management Section */}
        <div className="px-2 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mr-3"></div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Knowledge Management</h3>
          </div>
          
          <div className="space-y-2">
            <Link
              to="/golden-repo"
              onClick={(e) => handleNavItemClick('golden-repo', '/golden-repo', e)}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 block ${
                isActive('/golden-repo')
                  ? 'bg-gray-700 text-white shadow-lg border border-gray-600' 
                  : 'text-gray-700 hover:bg-white hover:shadow-md hover:border-gray-200 border border-transparent'
              }`}
            >
              <div className="flex items-center p-4">
                <div className={`p-2.5 rounded-lg mr-4 transition-all duration-300 ${
                  isActive('/golden-repo') 
                    ? 'bg-gray-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${isActive('/golden-repo') ? 'text-white' : 'text-gray-900'}`}>
                    Golden Repo
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    isActive('/golden-repo') ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    Repository Templates
                  </div>
                </div>
                {isActive('/golden-repo') && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                )}
              </div>
              
              {/* Active indicator line */}
              {isActive('/golden-repo') && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full shadow-sm"></div>
              )}
              
              {/* Subtle gradient overlay for active state */}
              {isActive('/golden-repo') && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-transparent pointer-events-none"></div>
              )}
            </Link>

            <Link
              to="/knowledge-base"
              onClick={(e) => handleNavItemClick('knowledge-base', '/knowledge-base', e)}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 block ${
                isActive('/knowledge-base')
                  ? 'bg-gray-700 text-white shadow-lg border border-gray-600' 
                  : 'text-gray-700 hover:bg-white hover:shadow-md hover:border-gray-200 border border-transparent'
              }`}
            >
              <div className="flex items-center p-4">
                <div className={`p-2.5 rounded-lg mr-4 transition-all duration-300 ${
                  isActive('/knowledge-base') 
                    ? 'bg-gray-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${isActive('/knowledge-base') ? 'text-white' : 'text-gray-900'}`}>
                    Knowledge Base
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    isActive('/knowledge-base') ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    AI powered insights
                  </div>
                </div>
                {isActive('/knowledge-base') && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                )}
              </div>
              
              {/* Active indicator line */}
              {isActive('/knowledge-base') && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full shadow-sm"></div>
              )}
              
              {/* Subtle gradient overlay for active state */}
              {isActive('/knowledge-base') && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-transparent pointer-events-none"></div>
              )}
            </Link>

            <Link
              to="/persona-manager"
              onClick={(e) => handleNavItemClick('persona-manager', '/persona-manager', e)}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 block ${
                isActive('/persona-manager')
                  ? 'bg-gray-700 text-white shadow-lg border border-gray-600' 
                  : 'text-gray-700 hover:bg-white hover:shadow-md hover:border-gray-200 border border-transparent'
              }`}
            >
              <div className="flex items-center p-4">
                <div className={`p-2.5 rounded-lg mr-4 transition-all duration-300 ${
                  isActive('/persona-manager') 
                    ? 'bg-gray-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                }`}>
                  <UserCog className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${isActive('/persona-manager') ? 'text-white' : 'text-gray-900'}`}>
                    Persona Manager
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    isActive('/persona-manager') ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    User Profiles & Roles
                  </div>
                </div>
                {isActive('/persona-manager') && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                )}
              </div>
              
              {/* Active indicator line */}
              {isActive('/persona-manager') && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full shadow-sm"></div>
              )}
              
              {/* Subtle gradient overlay for active state */}
              {isActive('/persona-manager') && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-transparent pointer-events-none"></div>
              )}
            </Link>

            <Link
              to="/prompt-library"
              onClick={(e) => handleNavItemClick('prompt-library', '/prompt-library', e)}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 block ${
                isActive('/prompt-library')
                  ? 'bg-gray-700 text-white shadow-lg border border-gray-600' 
                  : 'text-gray-700 hover:bg-white hover:shadow-md hover:border-gray-200 border border-transparent'
              }`}
            >
              <div className="flex items-center p-4">
                <div className={`p-2.5 rounded-lg mr-4 transition-all duration-300 ${
                  isActive('/prompt-library') 
                    ? 'bg-gray-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                }`}>
                  <Library className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${isActive('/prompt-library') ? 'text-white' : 'text-gray-900'}`}>
                    Prompt Library
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    isActive('/prompt-library') ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    AI Prompt Templates
                  </div>
                </div>
                {isActive('/prompt-library') && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                )}
              </div>
              
              {/* Active indicator line */}
              {isActive('/prompt-library') && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full shadow-sm"></div>
              )}
              
              {/* Subtle gradient overlay for active state */}
              {isActive('/prompt-library') && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-transparent pointer-events-none"></div>
              )}
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Integrations Support Section */}
        <div className="px-2">
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Integration Support</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors duration-200">
              <div className="p-1.5 bg-amber-100 rounded-lg mr-3">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Jira</div>
                <div className="text-xs text-amber-600">Upcoming</div>
              </div>
              <div className="w-2 h-2 bg-amber-500 rounded-full shadow-sm"></div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors duration-200">
              <div className="p-1.5 bg-green-100 rounded-lg mr-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">DevOps</div>
                <div className="text-xs text-green-600">Supported</div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
            </div>
            
            <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors duration-200">
              <div className="p-1.5 bg-amber-100 rounded-lg mr-3">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">GitHub</div>
                <div className="text-xs text-amber-600">Upcoming</div>
              </div>
              <div className="w-2 h-2 bg-amber-500 rounded-full shadow-sm"></div>
            </div>
            
            <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors duration-200">
              <div className="p-1.5 bg-amber-100 rounded-lg mr-3">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Teams</div>
                <div className="text-xs text-amber-600">Upcoming</div>
              </div>
              <div className="w-2 h-2 bg-amber-500 rounded-full shadow-sm"></div>
            </div>
            
            <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors duration-200">
              <div className="p-1.5 bg-amber-100 rounded-lg mr-3">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">HARNESS</div>
                <div className="text-xs text-amber-600">Upcoming</div>
              </div>
              <div className="w-2 h-2 bg-amber-500 rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Quick Actions */}
        <div className="px-2">
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mr-3"></div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Quick Actions</h3>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center p-3 text-gray-700 hover:bg-white hover:shadow-sm hover:border-gray-200 rounded-lg transition-all duration-200 group border border-transparent"
            >
              <div className="p-1.5 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors">
                <Bell className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600" />
              </div>
              <span className="text-sm font-medium flex-1 text-left">Notifications</span>
              <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
            </button>
            
            <button className="w-full flex items-center p-3 text-gray-700 hover:bg-white hover:shadow-sm hover:border-gray-200 rounded-lg transition-all duration-200 group border border-transparent">
              <div className="p-1.5 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors">
                <Settings className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600" />
              </div>
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </div>
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <UserProfile />
        </div>
      </aside>

      {/* DevOps Push Modal */}
      {showDevOpsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Push to DevOps</h2>
                  <p className="text-orange-100">You have unsent generated content</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  You have generated AI guidelines and agile artifacts that haven't been pushed to DevOps yet.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <GitBranch className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">Recommendation</h3>
                      <p className="text-sm text-blue-700">
                        Configure and push your generated content to Azure DevOps to ensure your work is saved and accessible to your team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePushToDevOps}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <GitBranch className="w-5 h-5" />
                  <span>Push to DevOps</span>
                </button>
                
                <button
                  onClick={handleContinueWithoutPush}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-200 border border-gray-300"
                >
                  Continue Without Pushing
                </button>
                
                <button
                  onClick={handleDevOpsModalClose}
                  className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb />

      {/* Notification Sidebar */}
      <NotificationSidebar />
    </>
  );
};

export default Navigation;
