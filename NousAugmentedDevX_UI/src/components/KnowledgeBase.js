import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Star, 
  Eye, 
  Download, 
  Filter, 
  BookOpen, 
  Code, 
  TestTube, 
  Layers, 
  Globe, 
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Lightbulb,
  Award,
  X,
  ExternalLink,
  Copy,
  CheckCircle,
  Calendar,
  GitBranch,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock data for knowledge base items
const knowledgeBaseItems = [
  {
    id: 1,
    title: "Claims Processing API Best Practices",
    author: "Senior Architecture Team",
    rating: 4.8,
    description: "Comprehensive guide for building robust claims processing APIs based on 15+ successful implementations",
    tags: ["claims", "api", "microservices", "architecture"],
    category: "Architecture",
    usageCount: 127,
    lastUpdated: "2024-01-20",
    insights: [
      "Use async processing for complex claim calculations",
      "Implement circuit breaker pattern for external services"
    ],
    type: "best-practices",
    fullDescription: "This comprehensive guide provides detailed best practices for building robust claims processing APIs in the insurance domain. Based on analysis of 15+ successful implementations across different insurance companies, this guide covers architecture patterns, performance optimization, error handling, and integration strategies.",
    technicalDetails: {
      "Architecture Pattern": "Event-driven microservices with CQRS",
      "Technology Stack": "Node.js, Express, Redis, PostgreSQL, RabbitMQ",
      "Performance": "Handles 10,000+ concurrent claims processing",
      "Availability": "99.9% uptime with circuit breaker implementation"
    },
    codeExample: `// Example: Async Claims Processing
const processClaimAsync = async (claimData) => {
  try {
    // Validate claim data
    const validation = await validateClaim(claimData);
    if (!validation.isValid) {
      throw new Error(validation.errors);
    }
    
    // Queue for processing
    await claimQueue.add('process-claim', {
      claimId: claimData.id,
      priority: claimData.priority || 'normal'
    });
    
    return { status: 'queued', claimId: claimData.id };
  } catch (error) {
    logger.error('Claim processing error:', error);
    throw error;
  }
};`,
    relatedItems: [2, 4],
    downloadUrl: "/templates/claims-processing-api-template.zip"
  },
  {
    id: 2,
    title: "E2E Testing Framework for Insurance Apps",
    author: "QA Excellence Team",
    rating: 4.6,
    description: "Complete testing strategy with automated test suites that reduced testing time by 60%",
    tags: ["testing", "automation", "e2e", "qa"],
    category: "Testing",
    usageCount: 89,
    lastUpdated: "2024-01-18",
    insights: [
      "Parallel test execution reduces runtime by 70%",
      "Data-driven tests improve coverage across scenarios"
    ],
    type: "framework",
    fullDescription: "A comprehensive end-to-end testing framework specifically designed for insurance applications. This framework includes test automation tools, data management utilities, and CI/CD integration that has successfully reduced testing time by 60% across multiple insurance projects.",
    technicalDetails: {
      "Framework": "Playwright with TypeScript",
      "Test Runner": "Jest with parallel execution",
      "Data Management": "Dynamic test data generation",
      "Reporting": "Allure reports with screenshots"
    },
    codeExample: `// Example: Insurance Policy E2E Test
describe('Policy Management E2E', () => {
  test('should create and process policy', async () => {
    const testData = await generatePolicyData();
    
    // Navigate and create policy
    await policyPage.createPolicy(testData);
    await expect(policyPage.policyNumber).toBeVisible();
    
    // Verify policy processing
    const policyId = await policyPage.getPolicyId();
    await expect(policyId).toMatch(/POL-\\d{8}/);
  });
});`,
    relatedItems: [4, 5],
    downloadUrl: "/templates/e2e-testing-framework.zip"
  },
  {
    id: 3,
    title: "Insurance Domain Models & Entities",
    author: "Domain Architecture Guild",
    rating: 4.9,
    description: "Reusable domain models and business entities used across 20+ insurance projects",
    tags: ["domain-modeling", "ddd", "entities", "business-logic"],
    category: "Development",
    usageCount: 203,
    lastUpdated: "2024-01-22",
    insights: [
      "Rich domain models reduce complexity in business logic",
      "Value objects prevent primitive obsession"
    ],
    type: "models",
    fullDescription: "A comprehensive collection of domain-driven design models and entities specifically crafted for the insurance industry. These reusable components have been battle-tested across 20+ insurance projects and provide a solid foundation for building robust insurance applications.",
    technicalDetails: {
      "Design Pattern": "Domain-Driven Design (DDD)",
      "Language": "C# / Java / TypeScript",
      "Coverage": "Policy, Claims, Underwriting, Billing",
      "Validation": "Built-in business rule validation"
    },
    codeExample: `// Example: Policy Domain Model
public class Policy : AggregateRoot<PolicyId> {
    public PolicyNumber Number { get; private set; }
    public PolicyHolder Holder { get; private set; }
    public Coverage Coverage { get; private set; }
    public Premium Premium { get; private set; }
    public PolicyStatus Status { get; private set; }
    
    public void UpdateCoverage(Coverage newCoverage) {
        if (Status != PolicyStatus.Active) {
            throw new InvalidOperationException("Cannot modify inactive policy");
        }
        
        Coverage = newCoverage;
        RecalculatePremium();
        AddDomainEvent(new PolicyCoverageUpdatedEvent(Id, Coverage));
    }
}`,
    relatedItems: [1, 5],
    downloadUrl: "/templates/insurance-domain-models.zip"
  },
  {
    id: 4,
    title: "DevOps Pipeline for Insurance Apps",
    author: "Platform Engineering Team",
    rating: 4.7,
    description: "CI/CD pipeline templates with security scanning and compliance checks",
    tags: ["devops", "pipeline", "security", "compliance"],
    category: "DevOps",
    usageCount: 156,
    lastUpdated: "2024-01-19",
    insights: [
      "Automated security scans catch 95% of vulnerabilities",
      "Blue-green deployment reduces downtime to zero"
    ],
    type: "pipeline",
    fullDescription: "Production-ready CI/CD pipeline templates designed specifically for insurance applications. Includes automated security scanning, compliance checks, and deployment strategies that ensure zero-downtime releases while maintaining regulatory compliance.",
    technicalDetails: {
      "Platform": "Azure DevOps / GitHub Actions",
      "Security": "SAST, DAST, dependency scanning",
      "Compliance": "SOX, PCI DSS, GDPR checks",
      "Deployment": "Blue-green with automated rollback"
    },
    codeExample: `# Azure DevOps Pipeline Template
trigger:
  - main

stages:
- stage: Security
  jobs:
  - job: SecurityScan
    steps:
    - task: SonarCloudPrepare@1
    - task: DotNetCoreCLI@2
      inputs:
        command: 'build'
    - task: WhiteSource@21
      inputs:
        cwd: '$(System.DefaultWorkingDirectory)'

- stage: Deploy
  condition: succeeded()
  jobs:
  - deployment: BlueGreenDeploy
    environment: production
    strategy:
      blueGreen:
        preRouteTraffic:
          steps:
          - script: echo "Health check before routing"`,
    relatedItems: [1, 2],
    downloadUrl: "/templates/devops-pipeline-template.zip"
  },
  {
    id: 5,
    title: "Insurance UI Component Library",
    author: "Frontend Guild",
    rating: 4.8,
    description: "Comprehensive React component library with 50+ insurance-specific components",
    tags: ["react", "components", "ui", "frontend"],
    category: "Frontend",
    usageCount: 342,
    lastUpdated: "2024-01-21",
    insights: [
      "Consistent components reduce development time by 40%",
      "Built-in accessibility improves user experience"
    ],
    type: "library",
    fullDescription: "A comprehensive React component library containing 50+ insurance-specific UI components. Built with accessibility in mind and designed to accelerate frontend development while maintaining consistency across insurance applications.",
    technicalDetails: {
      "Framework": "React 18 with TypeScript",
      "Styling": "Tailwind CSS with custom theme",
      "Components": "50+ insurance-specific components",
      "Accessibility": "WCAG 2.1 AA compliant"
    },
    codeExample: `// Example: Policy Card Component
import { PolicyCard } from '@insurance/ui-components';

const PolicyList = ({ policies }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {policies.map(policy => (
        <PolicyCard
          key={policy.id}
          policyNumber={policy.number}
          holder={policy.holder}
          status={policy.status}
          premium={policy.premium}
          onViewDetails={() => handleViewPolicy(policy.id)}
          onRenew={() => handleRenewPolicy(policy.id)}
        />
      ))}
    </div>
  );
};`,
    relatedItems: [2, 3],
    downloadUrl: "/templates/insurance-ui-components.zip"
  }
];

// Category configurations
const categories = [
  { id: 'all', name: 'All Categories', icon: BookOpen, color: 'gray' },
  { id: 'Development', name: 'Development', icon: Code, color: 'blue' },
  { id: 'Testing', name: 'Testing', icon: TestTube, color: 'green' },
  { id: 'Architecture', name: 'Architecture', icon: Layers, color: 'purple' },
  { id: 'DevOps', name: 'DevOps', icon: Globe, color: 'orange' },
  { id: 'Frontend', name: 'Frontend', icon: Layers, color: 'pink' }
];

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [filteredItems, setFilteredItems] = useState(knowledgeBaseItems);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Filter and search logic
  useEffect(() => {
    let filtered = knowledgeBaseItems;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'recent':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, sortBy]);

  // Calculate stats
  const totalItems = knowledgeBaseItems.length;
  const totalUsage = knowledgeBaseItems.reduce((sum, item) => sum + item.usageCount, 0);
  const avgRating = (knowledgeBaseItems.reduce((sum, item) => sum + item.rating, 0) / knowledgeBaseItems.length).toFixed(1);
  const reusedComponents = knowledgeBaseItems.filter(item => item.type === 'library' || item.type === 'models').length;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : BookOpen;
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : 'gray';
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleUseTemplate = (item) => {
    setSelectedItem(item);
    setShowTemplateModal(true);
  };

  const handleDownloadTemplate = (item) => {
    // Simulate template download
    toast.success(`Downloading ${item.title} template...`);
    
    // In a real implementation, you would trigger an actual download
    // For now, we'll simulate it with a timeout
    setTimeout(() => {
      toast.success('Template downloaded successfully!');
    }, 2000);
    
    setShowTemplateModal(false);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowTemplateModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Knowledge Base
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered insights and guidance from past projects • Personalized for developers
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold mb-2">{totalItems}</div>
              <div className="text-blue-100 text-sm font-medium">Knowledge Items</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold mb-2">{reusedComponents}</div>
              <div className="text-green-100 text-sm font-medium">Reused Components</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold mb-2">{Math.floor(totalUsage / knowledgeBaseItems.length)}</div>
              <div className="text-purple-100 text-sm font-medium">Project References</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold mb-2">{avgRating}</div>
              <div className="text-orange-100 text-sm font-medium">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Categories */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-4 md:mb-0">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? `bg-${category.color}-100 text-${category.color}-700 border-2 border-${category.color}-200`
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="rating">Highest Rated</option>
              <option value="usage">Most Used</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Knowledge Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredItems.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category);
            const categoryColor = getCategoryColor(item.category);
            
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden group"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-${categoryColor}-100 rounded-lg`}>
                        <CategoryIcon className={`w-5 h-5 text-${categoryColor}-600`} />
                      </div>
                      <span className={`px-3 py-1 bg-${categoryColor}-100 text-${categoryColor}-700 text-xs font-semibold rounded-full`}>
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(item.rating)}
                      <span className="text-sm font-semibold text-gray-700 ml-2">{item.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="mr-4">by {item.author}</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(item.lastUpdated).toLocaleDateString()}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="p-6 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-yellow-600" />
                    Key Insights
                  </h4>
                  <ul className="space-y-2 mb-4">
                    {item.insights.map((insight, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Used {item.usageCount} times</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleViewDetails(item)}
                        className="flex items-center px-3 py-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      <button 
                        onClick={() => handleUseTemplate(item)}
                        className="flex items-center px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No knowledge items found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or category filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Browse All Section */}
        {filteredItems.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Explore More Knowledge</h2>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Discover additional templates, patterns, and best practices from our growing knowledge base
              </p>
              <button className="flex items-center mx-auto px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                Browse All Categories
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r from-${getCategoryColor(selectedItem.category)}-500 to-${getCategoryColor(selectedItem.category)}-600 p-6 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    {React.createElement(getCategoryIcon(selectedItem.category), { className: "w-8 h-8" })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
                    <div className="flex items-center space-x-4 text-sm opacity-90">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {selectedItem.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(selectedItem.lastUpdated).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Used {selectedItem.usageCount} times
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModals}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Rating and Tags */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedItem.rating)}
                    <span className="text-lg font-semibold text-gray-700 ml-2">{selectedItem.rating}</span>
                  </div>
                  <span className={`px-3 py-1 bg-${getCategoryColor(selectedItem.category)}-100 text-${getCategoryColor(selectedItem.category)}-700 text-sm font-semibold rounded-full`}>
                    {selectedItem.category}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                <p className="text-gray-700 leading-relaxed">{selectedItem.fullDescription || selectedItem.description}</p>
              </div>

              {/* Key Insights */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  Key Insights
                </h3>
                <ul className="space-y-2">
                  {selectedItem.insights.map((insight, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Details */}
              {selectedItem.technicalDetails && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    Technical Specifications
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedItem.technicalDetails).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-sm font-medium text-gray-600">{key}</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Code Example */}
              {selectedItem.codeExample && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Code className="w-5 h-5 mr-2 text-purple-600" />
                      Code Example
                    </h3>
                    <button
                      onClick={() => handleCopyCode(selectedItem.codeExample)}
                      className="flex items-center px-3 py-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Code
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono">
                      <code>{selectedItem.codeExample}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUseTemplate(selectedItem)}
                    className="flex items-center px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Use Template
                  </button>
                  <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </button>
                </div>
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Use Template Modal */}
      {showTemplateModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Use Template</h2>
                    <p className="text-green-100">{selectedItem.title}</p>
                  </div>
                </div>
                <button
                  onClick={closeModals}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Complete source code and documentation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Configuration files and examples
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Implementation guidelines
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Best practices and patterns
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <GitBranch className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Integration Ready</h4>
                    <p className="text-sm text-blue-700">
                      This template can be directly integrated into your existing project or used as a starting point for new development.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Template will be downloaded as a ZIP file
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={closeModals}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDownloadTemplate(selectedItem)}
                    className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
