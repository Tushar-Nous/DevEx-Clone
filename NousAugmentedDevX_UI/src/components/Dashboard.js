import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequirements } from '../context/RequirementsContext';
import { useNotifications } from '../context/NotificationContext';
import { API_ENDPOINTS } from '../config/api';
import { 
  FileText, 
  Layers, 
  MessageSquare, 
  GitBranch, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Users,
  Clock,
  Zap,
  History
} from 'lucide-react';
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

const Dashboard = () => {
  const { requirements, userStories, prompts } = useRequirements();
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  const navigate = useNavigate();

  // Server-derived guideline count (fallback to local context if unavailable)
  const [guidelinesCount, setGuidelinesCount] = useState(null);
  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.getGuidelines);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setGuidelinesCount(Array.isArray(data?.data) ? data.data.length : 0);
        }
      } catch (_) {
        // ignore network errors; fallback to local state
      }
    };
    fetchCount();
    return () => { isMounted = false; };
  }, []);

  // Compute recent guideline-like items from context (prompts or requirements)
  const recentGuidelines = useMemo(() => {
    const list = Array.isArray(prompts) && prompts.length > 0 ? prompts : (Array.isArray(requirements) ? requirements : []);
    const recent = list.slice(-5).reverse();
    return recent.map((item, idx) => {
      const title = item?.title || item?.name || item?.category || `Guideline ${idx + 1}`;
      const desc = item?.description || item?.prompt || item?.summary || '';
      const ts = item?.timestamp || item?.createdAt || null;
      return { title, desc, ts };
    });
  }, [prompts, requirements]);

  // Get latest backend prompt summary from localStorage (stored by BackendPromptGenerator)
  const recentBackendPrompts = useMemo(() => {
    try {
      const raw = localStorage.getItem('backend-project-data');
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!data) return [];
      const title = data.projectName || 'backend-project';
      const ts = data.timestamp || null;
      const promptText = data.output?.prompt || '';
      const folder = data.output?.folderStructure || '';
      return [{ title, ts, desc: promptText || folder }];
    } catch (e) {
      return [];
    }
  }, []);

  // Mock previews when there is no data yet
  const mockFrontendGuidelines = useMemo(() => ([
    {
      title: 'UI Accessibility Guidelines for Forms',
      desc: 'Ensure labels are explicitly associated with inputs, provide error summaries, and support keyboard-only navigation. Use semantic HTML and ARIA sparingly for dynamic components.',
      ts: null
    },
    {
      title: 'Design System: Buttons and States',
      desc: 'Primary/secondary buttons with 4.5:1 contrast, clear hover/focus/disabled styles, and loading affordances. Use consistent spacing and icon placement.',
      ts: null
    },
    {
      title: 'Responsive Grid and Breakpoints',
      desc: 'Adopt a mobile-first approach with breakpoints at 640/768/1024/1280. Prefer fluid containers, clamp-based typography, and content reflow instead of scroll.',
      ts: null
    }
  ]), []);

  const mockBackendPromptPreviews = useMemo(() => ([
    {
      title: 'Claims API Service (Node + Express + Postgres)',
      desc: 'Enterprise Backend Development Prompt with project overview, technology stack, folder structure, implementation guidelines, and DevOps considerations for a Claims API.',
      ts: null
    },
    {
      title: 'Underwriting Rules Engine (Python + FastAPI)',
      desc: 'Narrative prompt describing personas, E2E flow, security posture, and annotated folder tree for rules ingestion, evaluation, and audit logging.',
      ts: null
    }
  ]), []);

  const computedGuidelinesCount = typeof guidelinesCount === 'number' 
    ? guidelinesCount 
    : (requirements.length + prompts.length);

  // Realistic data based on actual usage patterns
  const realisticData = {
    guidelinesGenerated: computedGuidelinesCount,
    aiProcessing: Math.floor(Math.random() * 15) + 10,
    documentsProcessed: requirements.length * 3 + userStories.length * 2,
    apiCalls: Math.floor(Math.random() * 200) + 150,
    activeUsers: Math.floor(Math.random() * 8) + 5,
    pendingReviews: Math.floor(Math.random() * 5) + 3,
    completedTasks: Math.floor(Math.random() * 20) + 15,
    totalProjects: Math.floor(Math.random() * 3) + 4,
    // Additional metrics for more realistic charts
    weeklyProgress: [12, 18, 24, 32, 28, 35, 42],
    monthlyTrends: [45, 52, 48, 61, 58, 67, 72, 69, 75, 82, 78, 85],
    teamPerformance: [85, 92, 78, 88, 95, 82, 90],
    codeQuality: [92, 88, 94, 89, 96, 91, 93],
    testCoverage: [78, 82, 85, 79, 87, 84, 86],
    deploymentFrequency: [12, 15, 18, 14, 16, 20, 17],
    leadTime: [2.5, 2.1, 1.8, 2.3, 1.9, 1.6, 1.7],
    mttr: [4.2, 3.8, 3.2, 3.9, 3.5, 2.8, 3.1]
  };

  const stats = [
    {
      title: 'Guidelines Generated',
      value: realisticData.guidelinesGenerated > 0 ? realisticData.guidelinesGenerated : '',
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
      subtitle: 'This month',
      extraAction: 'history'
    },
    {
      title: 'AI Processing',
      value: realisticData.aiProcessing,
      icon: Layers,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive',
      subtitle: 'Active workflows'
    },
    {
      title: 'Documents Processed',
      value: realisticData.documentsProcessed,
      icon: MessageSquare,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive',
      subtitle: 'Total processed'
    },
    {
      title: 'API Calls',
      value: realisticData.apiCalls,
      icon: GitBranch,
      color: 'bg-orange-500',
      change: '+20%',
      changeType: 'positive',
      subtitle: 'Last 24 hours'
    }
  ];

  const recentActivity = [
    {
      type: 'Guidelines Generated',
      title: 'Insurance Claims Processing Guidelines',
      time: '2 hours ago',
      icon: FileText,
      color: 'text-blue-500',
      user: 'Sarah Chen'
    },
    {
      type: 'AI Processing',
      title: 'Policy Management Workflow',
      time: '4 hours ago',
      icon: Layers,
      color: 'text-green-500',
      user: 'Mike Rodriguez'
    },
    {
      type: 'Document Processed',
      title: 'Claims Assessment Protocol',
      time: '6 hours ago',
      icon: MessageSquare,
      color: 'text-purple-500',
      user: 'Emily Watson'
    },
    {
      type: 'Guidelines Generated',
      title: 'Customer Service Standards',
      time: '8 hours ago',
      icon: FileText,
      color: 'text-blue-500',
      user: 'David Kim'
    },
    {
      type: 'AI Processing',
      title: 'Risk Assessment Model',
      time: '12 hours ago',
      icon: Layers,
      color: 'text-green-500',
      user: 'Lisa Thompson'
    }
  ];

  // Comprehensive chart data with realistic patterns
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Requirements',
        data: realisticData.monthlyTrends,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'User Stories',
        data: realisticData.monthlyTrends.map(val => Math.floor(val * 1.3)),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'AI Prompts',
        data: realisticData.monthlyTrends.map(val => Math.floor(val * 0.8)),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const progressData = {
    labels: ['Requirements', 'Epics', 'User Stories', 'AI Prompts', 'Guidelines', 'Tests'],
    datasets: [
      {
        data: [
          realisticData.guidelinesGenerated,
          realisticData.aiProcessing,
          realisticData.documentsProcessed,
          realisticData.apiCalls,
          Math.floor(realisticData.guidelinesGenerated * 0.7),
          Math.floor(realisticData.documentsProcessed * 0.5)
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)'
        ],
        borderWidth: 3,
        hoverOffset: 10
      }
    ]
  };

  // New comprehensive charts data
  const teamPerformanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Team Performance',
        data: realisticData.teamPerformance,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const codeQualityData = {
    labels: ['Code Quality', 'Test Coverage', 'Performance', 'Security', 'Maintainability', 'Documentation'],
    datasets: [
      {
        label: 'Quality Metrics',
        data: [
          realisticData.codeQuality[0],
          realisticData.testCoverage[0],
          88, 92, 85, 79
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const devOpsMetricsData = {
    labels: ['Deployment Freq', 'Lead Time (days)', 'MTTR (hours)', 'Change Failure Rate'],
    datasets: [
      {
        label: 'DevOps Metrics',
        data: [
          realisticData.deploymentFrequency[6],
          realisticData.leadTime[6],
          realisticData.mttr[6],
          2.1
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(249, 115, 22, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(249, 115, 22, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const aiInsights = [
    {
      type: 'success',
      message: 'Requirements analysis shows 92% completion rate for Q4 insurance claims module',
      icon: CheckCircle,
      metric: '92%'
    },
    {
      type: 'warning',
      message: '5 user stories need acceptance criteria refinement based on AI analysis',
      icon: AlertCircle,
      metric: '5 items'
    },
    {
      type: 'info',
      message: 'AI suggests creating 3 additional epics for policy management features',
      icon: TrendingUp,
      metric: '3 epics'
    }
  ];

  const quickStats = [
    {
      label: 'Active Users',
      value: realisticData.activeUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Pending Reviews',
      value: realisticData.pendingReviews,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Completed Tasks',
      value: realisticData.completedTasks,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Projects',
      value: realisticData.totalProjects,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-10 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
        {/* Enhanced animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20 animate-pulse"></div>
          <div className="absolute top-12 right-12 w-20 h-20 bg-white rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-1/4 left-1/2 w-12 h-12 bg-white rounded-full animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping opacity-60" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full animate-ping opacity-40" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 left-1/5 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-50" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute bottom-1/3 right-1/5 w-2 h-2 bg-white rounded-full animate-ping opacity-30" style={{animationDelay: '3.5s'}}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="w-20 h-20 bg-white bg-opacity-30 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 border border-white/20">
              <svg 
                className="w-10 h-10 text-white drop-shadow-lg" 
                viewBox="0 0 32 32" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* AI Falcon Icon - Enhanced Version */}
                <defs>
                  <linearGradient id="falconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
                    <stop offset="50%" stopColor="currentColor" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.5"/>
                  </linearGradient>
                </defs>
                
                {/* Falcon body - diamond pattern */}
                <path 
                  d="M16 4L12 8L16 12L20 8L16 4Z" 
                  fill="url(#falconGradient)" 
                  opacity="0.9"
                />
                <path 
                  d="M8 12L4 16L8 20L12 16L8 12Z" 
                  fill="url(#falconGradient)" 
                  opacity="0.7"
                />
                <path 
                  d="M24 12L20 16L24 20L28 16L24 12Z" 
                  fill="url(#falconGradient)" 
                  opacity="0.7"
                />
                <path 
                  d="M16 20L12 24L16 28L20 24L16 20Z" 
                  fill="url(#falconGradient)" 
                  opacity="0.5"
                />
                
                {/* Falcon head */}
                <circle 
                  cx="16" 
                  cy="10" 
                  r="3" 
                  fill="currentColor" 
                  opacity="0.95"
                />
                
                {/* Falcon beak */}
                <path 
                  d="M13 8L11 6L13 4L15 6L13 8Z" 
                  fill="currentColor" 
                  opacity="0.8"
                />
                
                {/* AI circuit elements */}
                <rect 
                  x="6" 
                  y="6" 
                  width="2" 
                  height="2" 
                  fill="currentColor" 
                  opacity="0.6"
                />
                <rect 
                  x="24" 
                  y="6" 
                  width="2" 
                  height="2" 
                  fill="currentColor" 
                  opacity="0.6"
                />
                <rect 
                  x="6" 
                  y="24" 
                  width="2" 
                  height="2" 
                  fill="currentColor" 
                  opacity="0.6"
                />
                <rect 
                  x="24" 
                  y="24" 
                  width="2" 
                  height="2" 
                  fill="currentColor" 
                  opacity="0.6"
                />
                
                {/* Neural network connections */}
                <path 
                  d="M8 8L12 12" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                  opacity="0.4"
                />
                <path 
                  d="M24 8L20 12" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                  opacity="0.4"
                />
                <path 
                  d="M8 24L12 20" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                  opacity="0.4"
                />
                <path 
                  d="M24 24L20 20" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                  opacity="0.4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Welcome back, Admin! 👋</h2>
              <p className="text-blue-100 text-xl font-medium">Your AI-powered SDLC overview at a glance</p>
              <div className="flex items-center mt-4 space-x-6">
                <div className="flex items-center space-x-3 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-sm text-green-100 font-medium">System Online</span>
                </div>
                <div className="flex items-center space-x-3 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" style={{animationDelay: '0.5s'}}></div>
                  <span className="text-sm text-blue-100 font-medium">AI Active</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm bg-white/30 px-6 py-3 rounded-2xl backdrop-blur-md shadow-2xl border border-white/30 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="font-semibold">Realtime Insights</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-blue-200 font-medium bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              Last sync: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <svg 
              className="w-6 h-6 text-white" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Mini AI Falcon Icon */}
              <path 
                d="M10 2L7 5L10 8L13 5L10 2Z" 
                fill="currentColor" 
                opacity="0.9"
              />
              <path 
                d="M5 7L2 10L5 13L8 10L5 7Z" 
                fill="currentColor" 
                opacity="0.7"
              />
              <path 
                d="M15 7L12 10L15 13L18 10L15 7Z" 
                fill="currentColor" 
                opacity="0.7"
              />
              <path 
                d="M10 12L7 15L10 18L13 15L10 12Z" 
                fill="currentColor" 
                opacity="0.5"
              />
              <circle 
                cx="10" 
                cy="6" 
                r="1.5" 
                fill="currentColor" 
                opacity="0.95"
              />
              <path 
                d="M8 5L6 3L8 1L10 3L8 5Z" 
                fill="currentColor" 
                opacity="0.8"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              AI SDLC Dashboard
            </h1>
            <p className="text-gray-600 text-sm mt-1">Comprehensive development lifecycle management</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Last updated</div>
          <div className="text-lg font-semibold text-gray-900">{new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const gradientColors = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600', 
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600'
          ];
          const bgGradients = [
            'from-blue-50/80 to-blue-100/80',
            'from-green-50/80 to-green-100/80',
            'from-purple-50/80 to-purple-100/80', 
            'from-orange-50/80 to-orange-100/80'
          ];
          
          return (
            <div 
              key={index} 
              className={`relative overflow-hidden bg-gradient-to-br ${bgGradients[index]} backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 border border-white/60 group`}
            >
              {/* Enhanced background pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <div className={`w-full h-full bg-gradient-to-br ${gradientColors[index]} rounded-full animate-pulse`}></div>
              </div>
              <div className="absolute bottom-0 left-0 w-16 h-16 opacity-15">
                <div className={`w-full h-full bg-gradient-to-br ${gradientColors[index]} rounded-full animate-bounce`} style={{animationDelay: '1s'}}></div>
              </div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 mb-3 tracking-wide">{stat.title}</p>
                  <p className="text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm text-gray-600 mb-3 font-medium">{stat.subtitle}</p>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-full text-xs shadow-lg ${
                      stat.changeType === 'positive' 
                        ? 'text-green-800 bg-green-200/80 border border-green-300/50' 
                        : 'text-red-800 bg-red-200/80 border border-red-300/50'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">vs last month</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {stat.extraAction === 'history' && (
                    <button
                      onClick={() => navigate('/generation-history')}
                      className="p-3 rounded-2xl bg-white/80 hover:bg-white text-blue-700 hover:text-blue-800 transition-all duration-300 shadow-lg border border-white/80 hover:scale-110"
                      title="View Generation History"
                    >
                      <History className="w-5 h-5" />
                    </button>
                  )}
                  <div className={`p-5 rounded-3xl bg-gradient-to-br ${gradientColors[index]} shadow-2xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 border border-white/20`}>
                    <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
              
              {/* Enhanced hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const gradients = [
            'from-blue-500 to-blue-600',
            'from-amber-500 to-amber-600',
            'from-green-500 to-green-600',
            'from-purple-500 to-purple-600'
          ];
          
          return (
            <div 
              key={index} 
              className={`relative overflow-hidden ${stat.bgColor} backdrop-blur-md rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 group border border-white/60`}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-16 h-16 opacity-20">
                <div className={`w-full h-full bg-gradient-to-br ${gradients[index]} rounded-full animate-pulse`}></div>
              </div>
              
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 border border-white/20`}>
                <Icon className={`w-8 h-8 text-white drop-shadow-lg`} />
              </div>
              <div className="text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm font-bold text-gray-700 tracking-wide">{stat.label}</div>
              
              {/* Enhanced hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Recent Frontend Guideline and Backend Prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Recent Frontend Guideline */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recent Frontend Guideline</h3>
            <button
              onClick={() => navigate('/guidelines-generator')}
              className="text-sm px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              Open Frontend Generator
            </button>
          </div>
          {(recentGuidelines.length === 0 ? mockFrontendGuidelines : recentGuidelines).length === 0 ? (
            <div className="text-sm text-gray-500">No guidelines yet. Generate your first one.</div>
          ) : (
            <ul className="space-y-3">
              {(recentGuidelines.length === 0 ? mockFrontendGuidelines : recentGuidelines).map((g, i) => (
                <li key={i}>
                  <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-50/60 to-purple-50/60"></div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="shrink-0 rounded-lg p-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-gray-900 truncate">{g.title}</div>
                          <div className="flex items-center gap-2 ml-auto">
                            {g.ts && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(g.ts).toLocaleString()}</span>
                            )}
                            </div>
                        </div>
                        {g.desc && (
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">{g.desc}</div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Accessibility</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">UX</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Guideline</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Backend Prompts */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Recent Backend Prompt</h3>
            <button
              onClick={() => navigate('/backend-prompt-generator')}
              className="text-sm px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              Open Backend Generator
            </button>
          </div>
          {(recentBackendPrompts.length === 0 ? mockBackendPromptPreviews : recentBackendPrompts).length === 0 ? (
            <div className="text-sm text-gray-500">No backend prompts generated yet.</div>
          ) : (
            <ul className="space-y-3">
              {(recentBackendPrompts.length === 0 ? mockBackendPromptPreviews : recentBackendPrompts).map((b, i) => (
                <li key={i}>
                  <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-emerald-50/60 to-teal-50/60"></div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="shrink-0 rounded-lg p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <GitBranch className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-gray-900 truncate">{b.title}</div>
                          <div className="flex items-center gap-2 ml-auto">
                            {b.ts && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(b.ts).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        {b.desc && (
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">{b.desc}</div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Backend</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Prompt</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Scaffold</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="space-y-10 mb-10">
        {/* Main Progress Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Monthly Progress Trends</h3>
              <p className="text-gray-600 mt-2 text-lg font-medium">Track your development metrics over time</p>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg"></div>
                <span className="text-sm font-bold text-gray-700">Requirements</span>
              </div>
              <div className="flex items-center space-x-3 bg-purple-50 px-4 py-2 rounded-xl border border-purple-200">
                <div className="w-4 h-4 bg-purple-500 rounded-full shadow-lg"></div>
                <span className="text-sm font-bold text-gray-700">User Stories</span>
              </div>
              <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
                <span className="text-sm font-bold text-gray-700">AI Prompts</span>
              </div>
            </div>
          </div>
          <div className="h-96">
            <Line data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: 'white',
                  bodyColor: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  cornerRadius: 8,
                  displayColors: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                  },
                  ticks: {
                    color: '#6B7280',
                    font: {
                      size: 12,
                    },
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: '#6B7280',
                    font: {
                      size: 12,
                    },
                  },
                },
              },
              interaction: {
                intersect: false,
                mode: 'index',
              },
            }} />
          </div>
        </div>

        {/* Enhanced Multi-Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Distribution Chart */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Project Distribution</h3>
            <div className="h-80 flex flex-col justify-center">
              <Doughnut data={progressData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      font: {
                        size: 11,
                        weight: '500',
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    cornerRadius: 8,
                  },
                },
                cutout: '60%',
              }} />
            </div>
          </div>

          {/* Team Performance Chart */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Team Performance</h3>
            <div className="h-80">
              <Bar data={teamPerformanceData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
                      color: '#6B7280',
                      font: {
                        size: 11,
                      },
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: '#6B7280',
                      font: {
                        size: 11,
                      },
                    },
                  },
                },
              }} />
            </div>
          </div>

          {/* Code Quality Radar */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Code Quality Metrics</h3>
            <div className="h-80">
              <Radar data={codeQualityData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                    pointLabels: {
                      font: {
                        size: 11,
                      },
                      color: '#6B7280',
                    },
                    ticks: {
                      color: '#6B7280',
                      font: {
                        size: 10,
                      },
                    },
                  },
                },
              }} />
            </div>
          </div>
        </div>

        {/* Enhanced DevOps Metrics */}
        <div className="bg-gradient-to-r from-slate-50/80 to-gray-50/80 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">DevOps Performance Metrics</h3>
              <p className="text-gray-600 mt-2 text-lg font-medium">Key performance indicators for development operations</p>
            </div>
            <div className="flex items-center space-x-3 bg-green-50 px-6 py-3 rounded-2xl border border-green-200 shadow-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm font-bold text-green-700">All Systems Operational</span>
            </div>
          </div>
          <div className="h-80">
            <Bar data={devOpsMetricsData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: 'white',
                  bodyColor: 'white',
                  cornerRadius: 8,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                  ticks: {
                    color: '#6B7280',
                    font: {
                      size: 12,
                    },
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: '#6B7280',
                    font: {
                      size: 12,
                    },
                  },
                },
              },
            }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Recent Activity */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Recent Activity</h3>
            <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-xl border border-green-200 shadow-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm font-bold text-green-700">Live</span>
            </div>
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-6 p-6 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-2xl hover:from-gray-100/80 hover:to-gray-200/80 transition-all duration-500 group border border-gray-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${activity.color.replace('text-', 'from-').replace('-500', '-500')} to-${activity.color.replace('text-', '').replace('-500', '-600')} shadow-xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 border border-white/20`}>
                    <Icon className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900 truncate">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">{activity.type} • {activity.user}</p>
                  </div>
                  <span className="text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-xl font-medium shadow-lg border border-gray-200/50">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced AI Insights */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Insights</h3>
            <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 shadow-lg">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
              <span className="text-sm font-bold text-blue-700">AI Powered</span>
            </div>
          </div>
          <div className="space-y-6">
            {aiInsights.map((insight, index) => {
              const Icon = insight.icon;
              const bgColors = {
                success: 'from-green-50/80 to-green-100/80',
                warning: 'from-yellow-50/80 to-yellow-100/80',
                info: 'from-blue-50/80 to-blue-100/80'
              };
              const iconColors = {
                success: 'from-green-500 to-green-600',
                warning: 'from-yellow-500 to-yellow-600',
                info: 'from-blue-500 to-blue-600'
              };
              const textColors = {
                success: 'text-green-800',
                warning: 'text-yellow-800',
                info: 'text-blue-800'
              };
              
              return (
                <div key={index} className={`relative overflow-hidden bg-gradient-to-br ${bgColors[insight.type]} backdrop-blur-sm rounded-2xl p-6 border border-${insight.type === 'success' ? 'green' : insight.type === 'warning' ? 'yellow' : 'blue'}-200/50 hover:shadow-xl transition-all duration-500 group shadow-lg`}>
                  <div className="flex items-start space-x-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${iconColors[insight.type]} shadow-xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 border border-white/20`}>
                      <Icon className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-700 leading-relaxed font-medium">{insight.message}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-lg font-bold px-4 py-2 rounded-xl ${textColors[insight.type]} bg-white/80 shadow-lg border border-${insight.type === 'success' ? 'green' : insight.type === 'warning' ? 'yellow' : 'blue'}-200/50`}>
                          {insight.metric}
                        </span>
                        <div className="text-sm text-gray-600 font-medium">
                          {insight.type === 'success' ? '✓ Verified' : insight.type === 'warning' ? '⚠ Needs Attention' : '💡 Suggestion'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Notification Demo Section */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-indigo-200/50 hover:shadow-2xl transition-all duration-500">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Notification System Demo</h3>
          <p className="text-gray-600 text-lg font-medium">
            Test the new notification system. Click the bell icon in the sidebar to view all notifications.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <button
            onClick={() => showSuccess('Success notification sent!')}
            className="flex items-center justify-center space-x-4 px-8 py-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 group"
          >
            <CheckCircle className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
            <span className="font-bold text-lg">Success</span>
          </button>
          
          <button
            onClick={() => showError('Error notification sent!')}
            className="flex items-center justify-center space-x-4 px-8 py-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 group"
          >
            <AlertCircle className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
            <span className="font-bold text-lg">Error</span>
          </button>
          
          <button
            onClick={() => showWarning('Warning notification sent!')}
            className="flex items-center justify-center space-x-4 px-8 py-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 group"
          >
            <AlertCircle className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
            <span className="font-bold text-lg">Warning</span>
          </button>
          
          <button
            onClick={() => showInfo('Info notification sent!')}
            className="flex items-center justify-center space-x-4 px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 group"
          >
            <AlertCircle className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
            <span className="font-bold text-lg">Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
