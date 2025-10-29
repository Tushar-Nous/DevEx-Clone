import React, { useState, useEffect } from 'react';
import { personaService } from '../utils/personaService';
import {
  UserCog,
  Users,
  Search,
  Plus,
  Filter,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Star,
  Code,
  Bug,
  Shield,
  Briefcase,
  Database,
  Settings,
  Eye,
  Copy,
  MoreVertical,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Award,
  X
} from 'lucide-react';

// Professional personas with detailed configurations
const defaultPersonas = [
  {
    id: 'qa-engineer',
    name: 'QA Engineer',
    title: 'Quality Assurance Engineer',
    description: 'Focused on testing, quality assurance, and ensuring software reliability',
    avatar: 'QA',
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-500',
    icon: Bug,
    department: 'Quality Assurance',
    experience: 'Senior',
    skills: ['Test Automation', 'Manual Testing', 'Bug Tracking', 'Performance Testing', 'API Testing'],
    responsibilities: [
      'Design and execute test plans',
      'Identify and report software defects',
      'Automate testing processes',
      'Ensure quality standards compliance'
    ],
    tools: ['Selenium', 'Jest', 'Postman', 'JIRA', 'TestRail'],
    metrics: {
      testsCompleted: 1247,
      bugsFound: 89,
      automationCoverage: '85%',
      efficiency: '94%'
    },
    status: 'active',
    lastActive: '2 hours ago',
    projects: 12,
    email: 'qa.engineer@company.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA'
  },
  {
    id: 'senior-developer',
    name: 'Senior Developer',
    title: 'Senior Software Developer',
    description: 'Experienced developer specializing in full-stack development and architecture',
    avatar: 'SD',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    icon: Code,
    department: 'Engineering',
    experience: 'Senior',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Microservices'],
    responsibilities: [
      'Design and implement software solutions',
      'Code review and mentoring',
      'Architecture planning',
      'Technical documentation'
    ],
    tools: ['VS Code', 'Git', 'Docker', 'AWS', 'MongoDB'],
    metrics: {
      linesOfCode: 45678,
      pullRequests: 234,
      codeReviews: 156,
      efficiency: '92%'
    },
    status: 'active',
    lastActive: '30 minutes ago',
    projects: 8,
    email: 'senior.dev@company.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY'
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    title: 'DevOps & Infrastructure Engineer',
    description: 'Specializes in CI/CD, infrastructure automation, and deployment strategies',
    avatar: 'DO',
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
    icon: Settings,
    department: 'Infrastructure',
    experience: 'Senior',
    skills: ['Kubernetes', 'Jenkins', 'Terraform', 'AWS', 'Monitoring', 'Security'],
    responsibilities: [
      'Manage CI/CD pipelines',
      'Infrastructure as Code',
      'System monitoring and alerting',
      'Security compliance'
    ],
    tools: ['Jenkins', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana'],
    metrics: {
      deployments: 892,
      uptime: '99.9%',
      automationSavings: '$50K',
      efficiency: '96%'
    },
    status: 'active',
    lastActive: '1 hour ago',
    projects: 15,
    email: 'devops@company.com',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX'
  },
  {
    id: 'security-analyst',
    name: 'Security Analyst',
    title: 'Cybersecurity Analyst',
    description: 'Focuses on security assessments, vulnerability management, and compliance',
    avatar: 'SA',
    color: 'red',
    gradient: 'from-red-500 to-pink-500',
    icon: Shield,
    department: 'Security',
    experience: 'Mid-Level',
    skills: ['Penetration Testing', 'Vulnerability Assessment', 'SIEM', 'Compliance', 'Risk Management'],
    responsibilities: [
      'Conduct security assessments',
      'Monitor security threats',
      'Ensure compliance standards',
      'Incident response management'
    ],
    tools: ['Nessus', 'Burp Suite', 'Splunk', 'Wireshark', 'Metasploit'],
    metrics: {
      vulnerabilitiesFixed: 156,
      securityScans: 78,
      complianceScore: '98%',
      efficiency: '91%'
    },
    status: 'active',
    lastActive: '3 hours ago',
    projects: 6,
    email: 'security@company.com',
    phone: '+1 (555) 456-7890',
    location: 'Washington, DC'
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    title: 'Senior Product Manager',
    description: 'Drives product strategy, roadmap planning, and stakeholder coordination',
    avatar: 'PM',
    color: 'purple',
    gradient: 'from-purple-500 to-indigo-500',
    icon: Briefcase,
    department: 'Product',
    experience: 'Senior',
    skills: ['Product Strategy', 'Roadmap Planning', 'User Research', 'Analytics', 'Agile'],
    responsibilities: [
      'Define product vision and strategy',
      'Coordinate with stakeholders',
      'Analyze user feedback and metrics',
      'Prioritize feature development'
    ],
    tools: ['JIRA', 'Figma', 'Analytics', 'Miro', 'Slack'],
    metrics: {
      featuresDelivered: 23,
      userSatisfaction: '4.8/5',
      marketShare: '+12%',
      efficiency: '89%'
    },
    status: 'active',
    lastActive: '45 minutes ago',
    projects: 4,
    email: 'product@company.com',
    phone: '+1 (555) 567-8901',
    location: 'Seattle, WA'
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    title: 'Senior Data Analyst',
    description: 'Specializes in data analysis, reporting, and business intelligence',
    avatar: 'DA',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    icon: Database,
    department: 'Analytics',
    experience: 'Senior',
    skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Machine Learning', 'ETL'],
    responsibilities: [
      'Analyze business data and trends',
      'Create reports and dashboards',
      'Provide data-driven insights',
      'Maintain data quality standards'
    ],
    tools: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel'],
    metrics: {
      reportsGenerated: 145,
      dataAccuracy: '99.2%',
      insightsDelivered: 67,
      efficiency: '93%'
    },
    status: 'active',
    lastActive: '2 hours ago',
    projects: 9,
    email: 'data@company.com',
    phone: '+1 (555) 678-9012',
    location: 'Chicago, IL'
  }
];

const PersonaManager = () => {
  const [personas, setPersonas] = useState(defaultPersonas);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load personas from backend on mount
  useEffect(() => {
    loadPersonasFromBackend();
  }, []);

  const loadPersonasFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);
      await personaService.initialize();
      const backendPersonas = await personaService.getAllPersonas();
      
      if (backendPersonas && backendPersonas.length > 0) {
        // Merge backend personas with UI defaults (for avatars, colors, etc.)
        const mergedPersonas = backendPersonas.map(bp => {
          const defaultPersona = defaultPersonas.find(dp => dp.id === bp.id);
          return {
            ...defaultPersona,
            ...bp,
            // Preserve UI elements from defaults
            avatar: defaultPersona?.avatar || bp.avatar || bp.name.substring(0, 2).toUpperCase(),
            color: defaultPersona?.color || 'blue',
            gradient: defaultPersona?.gradient || 'from-blue-500 to-indigo-500',
            icon: defaultPersona?.icon || Code
          };
        });
        setPersonas(mergedPersonas);
        console.log('✅ Loaded personas from backend:', mergedPersonas.length);
      } else {
        setPersonas(defaultPersonas);
      }
    } catch (err) {
      console.error('Error loading personas:', err);
      setError('Failed to load personas from backend. Using defaults.');
      setPersonas(defaultPersonas);
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments for filter
  const departments = [...new Set(personas.map(p => p.department))];

  // Filter personas based on search and department
  const filteredPersonas = personas.filter(persona => {
    const matchesSearch = persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (persona.skills && persona.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesDepartment = filterDepartment === 'all' || persona.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handlePersonaClick = (persona) => {
    setSelectedPersona(persona);
  };

  const handleCloseDetail = () => {
    setSelectedPersona(null);
  };

  const handleDropdownToggle = (personaId) => {
    setActiveDropdown(activeDropdown === personaId ? null : personaId);
  };

  const handleEditPersona = (persona) => {
    setSelectedPersona(persona);
    // TODO: Implement edit modal
    console.log('Edit persona:', persona.name);
    setActiveDropdown(null);
  };

  const handleDeletePersona = async (personaId) => {
    try {
      await personaService.deletePersona(personaId);
      setPersonas(personas.filter(p => p.id !== personaId));
      console.log('✅ Persona deleted successfully');
    } catch (err) {
      console.error('Error deleting persona:', err);
      alert('Failed to delete persona. Please try again.');
    }
    setActiveDropdown(null);
  };

  const handleDuplicatePersona = (persona) => {
    const newPersona = {
      ...persona,
      id: `${persona.id}-copy-${Date.now()}`,
      name: `${persona.name} (Copy)`,
      status: 'draft'
    };
    setPersonas([...personas, newPersona]);
    setActiveDropdown(null);
  };

  // Enhanced Professional Persona Card Component
  const PersonaCard = ({ persona }) => {
    const Icon = persona.icon;
    
    return (
      <div
        onClick={() => handlePersonaClick(persona)}
        className="group relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 overflow-hidden transform hover:-translate-y-1 flex flex-col h-full min-h-[600px]"
      >
        {/* Enhanced Gradient Header with Pattern */}
        <div className={`h-32 bg-gradient-to-br ${persona.gradient} relative overflow-hidden`}>
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" 
                 style={{
                   backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
                   backgroundSize: '24px 24px'
                 }}>
            </div>
          </div>
          
          {/* Floating Geometric Shapes */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-300"></div>
          <div className="absolute bottom-4 right-8 w-6 h-6 bg-white/15 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
          
          {/* Professional Badge */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center space-x-2">
              <div className={`p-2 bg-white/25 backdrop-blur-sm rounded-xl border border-white/20`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/20`}>
                {persona.experience}
              </span>
            </div>
          </div>
          
          {/* Enhanced Dropdown */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDropdownToggle(persona.id);
              }}
              className="p-2.5 bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-xl border border-white/20 transition-all duration-300 hover:scale-110"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
            
            {/* Enhanced Dropdown Menu */}
            {activeDropdown === persona.id && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 py-3 z-20 transform transition-all duration-200 opacity-100 scale-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePersonaClick(persona);
                  }}
                  className="w-full px-5 py-3 text-left text-sm text-gray-700 hover:bg-gray-50/80 flex items-center transition-colors duration-200"
                >
                  <Eye className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="font-medium">View Details</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPersona(persona);
                  }}
                  className="w-full px-5 py-3 text-left text-sm text-gray-700 hover:bg-gray-50/80 flex items-center transition-colors duration-200"
                >
                  <Edit3 className="w-4 h-4 mr-3 text-green-500" />
                  <span className="font-medium">Edit Persona</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicatePersona(persona);
                  }}
                  className="w-full px-5 py-3 text-left text-sm text-gray-700 hover:bg-gray-50/80 flex items-center transition-colors duration-200"
                >
                  <Copy className="w-4 h-4 mr-3 text-purple-500" />
                  <span className="font-medium">Duplicate</span>
                </button>
                <div className="my-2 mx-3 h-px bg-gray-200"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePersona(persona.id);
                  }}
                  className="w-full px-5 py-3 text-left text-sm text-red-600 hover:bg-red-50/80 flex items-center transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  <span className="font-medium">Delete</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Enhanced Status Badge */}
          <div className="absolute bottom-4 left-4">
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold backdrop-blur-sm border ${
              persona.status === 'active' 
                ? 'bg-green-100/90 text-green-800 border-green-200/50' 
                : 'bg-yellow-100/90 text-yellow-800 border-yellow-200/50'
            } shadow-lg`}>
              {persona.status === 'active' ? (
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              ) : (
                <Clock className="w-3.5 h-3.5 mr-1.5" />
              )}
              {persona.status.charAt(0).toUpperCase() + persona.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Enhanced Content Section */}
        <div className="p-8 flex-grow flex flex-col">
          {/* Professional Avatar and Info */}
          <div className="flex items-start space-x-5 mb-6">
            <div className="relative">
              <div className={`w-20 h-20 bg-gradient-to-br ${persona.gradient} rounded-3xl flex items-center justify-center shadow-xl border-4 border-white group-hover:shadow-2xl transition-shadow duration-500`}>
                <span className="text-white font-bold text-2xl">{persona.avatar}</span>
              </div>
              {/* Online Indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-lg">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                {persona.name}
              </h3>
              <p className="text-base font-semibold text-gray-700 mb-3">{persona.title}</p>
                          <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Briefcase className="w-4 h-4 mr-2" />
                {persona.department}
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                {persona.experience}
              </div>
            </div>
            </div>
          </div>

          {/* Enhanced Description */}
          <div className="mb-6 flex-shrink-0">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors h-16">
              {persona.description}
            </p>
          </div>

          {/* Enhanced Skills Section */}
          <div className="mb-6 flex-shrink-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Core Skills</h4>
            <div className="flex flex-wrap gap-2 min-h-[80px] items-start content-start">
              {persona.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r ${persona.gradient} text-white shadow-sm hover:shadow-md transition-shadow duration-200`}
                >
                  {skill}
                </span>
              ))}
              {persona.skills.length > 4 && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200">
                  +{persona.skills.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Enhanced Metrics Dashboard */}
          <div className="grid grid-cols-2 gap-4 mb-6 flex-shrink-0">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-900 mb-1">{persona.projects}</div>
              <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">Projects</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center border border-green-100">
              <div className="text-2xl font-bold text-green-900 mb-1">{persona.metrics.efficiency}</div>
              <div className="text-xs font-medium text-green-700 uppercase tracking-wide">Efficiency</div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="font-medium">Last active: {persona.lastActive}</span>
              </div>
              <div className="flex items-center text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                <span className="mr-2 font-medium">View Details</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-purple-200 transition-all duration-500 pointer-events-none"></div>
      </div>
    );
  };

  // Persona Detail Modal
  const PersonaDetailModal = ({ persona, onClose }) => {
    if (!persona) return null;
    
    const Icon = persona.icon;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`bg-gradient-to-r ${persona.gradient} p-8 text-white relative`}>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center">
                <Icon className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{persona.name}</h1>
                <p className="text-xl text-white/90 mb-2">{persona.title}</p>
                <div className="flex items-center space-x-4 text-white/80">
                  <span className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {persona.department}
                  </span>
                  <span className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    {persona.experience}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                  <p className="text-gray-600 leading-relaxed">{persona.description}</p>
                </div>

                {/* Skills */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {persona.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${persona.gradient} text-white`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Responsibilities */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
                  <ul className="space-y-2">
                    {persona.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tools */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Tools & Technologies</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {persona.tools.map((tool, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Settings className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-sm text-gray-600">{persona.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-sm text-gray-600">{persona.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-sm text-gray-600">{persona.location}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    {Object.entries(persona.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Status</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        persona.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {persona.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {persona.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Active</span>
                      <span className="text-sm text-gray-900">{persona.lastActive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Projects</span>
                      <span className="text-sm text-gray-900">{persona.projects}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Enhanced Professional Header */}
      <div className="relative bg-white border-b border-gray-200 shadow-lg overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `radial-gradient(circle at 25% 25%, #6366f1 1px, transparent 1px), radial-gradient(circle at 75% 75%, #8b5cf6 1px, transparent 1px)`,
                 backgroundSize: '60px 60px'
               }}>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* Enhanced Icon */}
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-3xl shadow-xl">
                  <UserCog className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-lg">
                  <div className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Enhanced Title Section */}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                  Persona Manager
                </h1>
                <p className="text-lg text-gray-600 font-medium">
                  Manage user profiles, roles, and professional personas
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 mr-2" />
                    {filteredPersonas.length} Active Personas
                  </div>
                  <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    All Systems Operational
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Create Button */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Last updated: 2 minutes ago</span>
              </div>
              <button
                onClick={() => console.log('Create new persona')}
                className="group relative flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold">Create New Persona</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
              {/* Enhanced Search */}
              <div className="relative flex-1 max-w-lg">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search personas by name, skills, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Enhanced Department Filter */}
              <div className="relative">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="appearance-none px-6 py-4 pr-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-gray-900 font-medium cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Enhanced View Toggle and Stats */}
            <div className="flex items-center space-x-6">
              {/* Results Count */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 bg-gray-100/80 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">
                  {filteredPersonas.length} of {personas.length} personas
                </span>
              </div>
              
              {/* Enhanced View Toggle */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600">View:</span>
                <div className="flex items-center bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-white text-purple-600 shadow-md transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white text-purple-600 shadow-md transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Personas Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {filteredPersonas.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {filteredPersonas.map((persona, index) => (
              <div
                key={persona.id}
                className="transform transition-all duration-500 opacity-100 translate-y-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PersonaCard persona={persona} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative">
              {/* Enhanced Empty State */}
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
                <Users className="w-16 h-16 text-purple-400" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm || filterDepartment !== 'all' ? 'No matching personas found' : 'No personas yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm || filterDepartment !== 'all' 
                  ? 'Try adjusting your search criteria or filters to find the personas you\'re looking for.'
                  : 'Get started by creating your first professional persona to manage user profiles and roles effectively.'
                }
              </p>
              {(!searchTerm && filterDepartment === 'all') && (
                <button
                  onClick={() => console.log('Create first persona')}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Create Your First Persona
                </button>
              )}
              {(searchTerm || filterDepartment !== 'all') && (
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterDepartment('all');
                    }}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => console.log('Create new persona')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Persona Detail Modal */}
      {selectedPersona && (
        <PersonaDetailModal persona={selectedPersona} onClose={handleCloseDetail} />
      )}

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default PersonaManager;
