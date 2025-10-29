import React, { useState, useEffect } from 'react';
import { 
  Library,
  Copy,
  Search,
  Filter,
  Plus,
  Star,
  Zap,
  Tag,
  Clock,
  CheckCircle,
  RefreshCw,
  Download,
  Heart,
  TrendingUp,
  Building,
  ShoppingCart,
  CreditCard,
  Stethoscope,
  Shield,
  FileText,
  X,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Industry Categories with Icons
const CATEGORIES = [
  {
    id: 'insurance',
    name: 'Insurance',
    icon: Shield,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Risk assessment, policy management, claims processing',
    subcategories: ['Rate Filing', 'Claims Processing', 'Underwriting', 'Policy Management', 'Risk Assessment']
  },
  {
    id: 'banking',
    name: 'Banking & Finance',
    icon: CreditCard,
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    description: 'Loan processing, compliance, customer service',
    subcategories: ['Loan Processing', 'Credit Assessment', 'Compliance', 'Customer Support', 'Investment Advisory']
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    icon: Stethoscope,
    color: 'red',
    gradient: 'from-red-500 to-pink-600',
    description: 'Patient care, diagnostics, treatment planning',
    subcategories: ['Patient Assessment', 'Treatment Planning', 'Medical Documentation', 'Drug Interaction', 'Symptom Analysis']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce & Retail',
    icon: ShoppingCart,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    description: 'Product recommendations, customer support, inventory',
    subcategories: ['Product Descriptions', 'Customer Support', 'Inventory Management', 'Marketing Copy', 'Review Analysis']
  },
  {
    id: 'general',
    name: 'General Business',
    icon: Building,
    color: 'gray',
    gradient: 'from-gray-500 to-slate-600',
    description: 'Generic business processes and workflows',
    subcategories: ['Email Templates', 'Meeting Summaries', 'Report Generation', 'Data Analysis', 'Process Documentation']
  }
];

// Default prompt templates
const DEFAULT_TEMPLATES = {
  insurance: [
    {
      id: 'rate-filing-1',
      title: 'Automated Rate Filing Analysis and Implementation System',
      category: 'Rate Filing',
      description: 'Comprehensive system for analyzing insurance rate filing documents and converting them into executable rating logic with AI-driven automation',
      prompt: `# Automated Rate Filing Analysis and Implementation System

## Business Context and Overview

The insurance industry requires sophisticated solutions for processing bureau-provided rating algorithms and insurer-submitted rate filing documents. This system addresses the critical need to modernize and automate the actuarial rate-making process, reducing manual effort and errors while improving speed, consistency, and regulatory compliance.

## User Requirements

As an actuary, I require the ability to:

• **Document Ingestion**: Import regulatory filings and bureau rating manuals directly into the system in their native formats (PDF, Excel, Word, etc.): {FILING_DOCUMENTS}

• **AI-Driven Processing**: Use AI-driven natural language processing (NLP) to interpret the actuarial, underwriting, and rating rules embedded in these filings: {NLP_REQUIREMENTS}

• **Data Extraction**: Automatically extract and structure rating algorithms, factors, relativities, and eligibility rules into a standardized digital format: {EXTRACTION_RULES}

• **Logic Conversion**: Convert the extracted content into machine-executable rating logic that can be tested, validated, and deployed in rating engines: {RATING_ENGINE_SPECS}

• **Machine Learning Enhancement**: Apply machine learning models on historical loss and exposure data to refine, test, and benchmark bureau/insurer-provided rating algorithms for predictive accuracy and competitive positioning: {ML_MODELS}

• **Compliance Assurance**: Ensure compliance by maintaining a full audit trail of the original filing text, extracted logic, and AI-converted executable rules: {AUDIT_REQUIREMENTS}

## Functional Requirements

### Core Document Processing
1. **Multi-Format Support**: Handle PDF, Excel, Word, and other document formats with high accuracy
2. **OCR Integration**: Advanced optical character recognition for scanned documents
3. **Content Classification**: Automatically identify document types and relevant sections
4. **Data Validation**: Comprehensive validation of extracted data against industry standards

### AI-Powered Analysis
1. **Natural Language Processing**: Advanced NLP to understand complex actuarial language and concepts
2. **Pattern Recognition**: Identify rating patterns, formulas, and business rules
3. **Context Understanding**: Interpret regulatory context and compliance requirements
4. **Accuracy Verification**: Cross-reference extracted data with source documents

### Rating Logic Generation
1. **Algorithm Translation**: Convert written rules into executable code
2. **Factor Extraction**: Identify and structure rating factors and relativities
3. **Rule Engine Integration**: Generate rules compatible with existing rating engines
4. **Testing Framework**: Automated testing of generated rating logic

## Business Objectives

### Primary Goals
- **Time-to-Market Reduction**: Significantly reduce time-to-market for new rates from weeks to days
- **Process Accuracy**: Achieve 99%+ accuracy in automated rule extraction and conversion
- **Regulatory Compliance**: Maintain 100% compliance with regulatory requirements and audit trails
- **Cost Efficiency**: Decrease operational costs by 60% through automation of manual processes

### Success Metrics
- Processing time reduction: {TIME_REDUCTION_TARGET}% improvement over manual processes
- Accuracy improvement: {ACCURACY_TARGET}% in automated rule extraction
- Compliance score: 100% regulatory compliance maintained
- ROI achievement: {ROI_TARGET} within 12 months of implementation

### Advanced Analytics Benefits
- **Competitive Intelligence**: Data-driven premium calculations supporting competitive positioning
- **Predictive Modeling**: Enhanced accuracy through machine learning model integration
- **Risk Assessment**: Improved risk-adequate pricing strategies
- **Market Analysis**: Comprehensive analysis of market trends and competitor positioning

## Technical Implementation

### Architecture Requirements
- **Scalability**: Process {DOCUMENT_VOLUME} documents per day
- **Performance**: Complete analysis within {PROCESSING_TIME} minutes per document
- **Integration**: Seamless integration with existing rating systems: {RATING_SYSTEMS}
- **Security**: Enterprise-grade security with role-based access control

### Machine Learning Components
- **Historical Data Analysis**: Analyze {DATA_YEARS} years of loss and exposure data
- **Model Training**: Continuous model improvement based on new data
- **Benchmarking**: Compare AI-generated rules against industry standards
- **Validation**: Statistical validation of model accuracy and performance

## Compliance and Audit Framework

### Audit Trail Requirements
- **Source Documentation**: Complete preservation of original filing documents
- **Extraction Log**: Detailed log of all extracted data and transformations
- **Rule Generation**: Full documentation of AI-converted executable rules
- **Validation Results**: Comprehensive validation and testing results

### Regulatory Compliance
- **Filing Alignment**: Demonstrate that implemented logic aligns with approved filings
- **Change Tracking**: Track all modifications and updates to rating rules
- **Approval Workflow**: Structured approval process for AI-generated rules
- **Documentation Standards**: Maintain documentation meeting regulatory requirements

## Implementation Success Criteria

The system will be considered successful when:
- All regulatory filings can be processed with 99%+ accuracy
- Time-to-market for new rates is reduced by {TIME_REDUCTION_TARGET}%
- Full audit trail and compliance documentation is maintained
- Integration with existing rating engines is seamless
- Actuarial teams report significant productivity improvements
- Regulatory approval processes are streamlined and accelerated

This comprehensive system transforms the traditional manual rate filing process into an automated, intelligent workflow that enhances accuracy, reduces time-to-market, and ensures regulatory compliance while providing advanced analytics capabilities for competitive advantage.`,
      tags: ['rate-filing', 'ai-automation', 'compliance', 'actuarial', 'regulatory'],
      difficulty: 'Advanced',
      estimatedTime: '30-45 min',
      popularity: 95
    },
    {
      id: 'claims-processing-1',
      title: 'Claims Processing Workflow',
      category: 'Claims Processing',
      description: 'Streamline insurance claims processing with AI assistance',
      prompt: `You are a claims processing specialist. For the following claim, provide:

1. **Initial Assessment**: Evaluate claim validity and completeness
2. **Documentation Review**: Check required documentation
3. **Coverage Analysis**: Verify policy coverage for the claim
4. **Settlement Recommendation**: Suggest appropriate settlement amount
5. **Next Steps**: Outline required actions

Claim Details: {CLAIM_DETAILS}
Policy Information: {POLICY_INFO}

Provide a comprehensive claims assessment with clear recommendations.`,
      tags: ['claims', 'processing', 'assessment'],
      difficulty: 'Intermediate',
      estimatedTime: '10-15 min',
      popularity: 88
    }
  ],
  banking: [
    {
      id: 'loan-assessment-1',
      title: 'Loan Application Assessment',
      category: 'Loan Processing',
      description: 'Comprehensive loan application evaluation and risk assessment',
      prompt: `You are a loan underwriting expert. Evaluate the following loan application:

1. **Credit Analysis**: Assess creditworthiness and payment history
2. **Income Verification**: Analyze income stability and debt-to-income ratio
3. **Collateral Evaluation**: Review collateral value and adequacy
4. **Risk Assessment**: Identify potential risks and mitigation strategies
5. **Recommendation**: Provide loan approval/rejection recommendation with terms

Application Details: {APPLICATION_DATA}
Credit Report: {CREDIT_REPORT}
Financial Statements: {FINANCIAL_DATA}

Provide a detailed underwriting decision with supporting rationale.`,
      tags: ['loan', 'underwriting', 'risk-assessment'],
      difficulty: 'Advanced',
      estimatedTime: '20-25 min',
      popularity: 92
    },
    {
      id: 'compliance-check-1',
      title: 'Regulatory Compliance Check',
      category: 'Compliance',
      description: 'Ensure banking operations comply with regulatory requirements',
      prompt: `You are a banking compliance officer. Review the following transaction/process for regulatory compliance:

1. **Regulatory Framework**: Identify applicable regulations
2. **Compliance Assessment**: Check adherence to requirements
3. **Risk Identification**: Highlight compliance risks
4. **Documentation Review**: Verify proper documentation
5. **Corrective Actions**: Recommend necessary corrections

Transaction/Process Details: {TRANSACTION_DATA}
Applicable Regulations: {REGULATIONS}

Provide a comprehensive compliance assessment with actionable recommendations.`,
      tags: ['compliance', 'regulatory', 'risk-management'],
      difficulty: 'Advanced',
      estimatedTime: '15-20 min',
      popularity: 85
    }
  ],
  healthcare: [
    {
      id: 'patient-assessment-1',
      title: 'Patient Symptom Analysis',
      category: 'Patient Assessment',
      description: 'Analyze patient symptoms and suggest diagnostic pathways',
      prompt: `You are a healthcare AI assistant. Analyze the following patient presentation:

1. **Symptom Analysis**: Review and categorize symptoms
2. **Differential Diagnosis**: List possible conditions
3. **Risk Stratification**: Assess urgency and severity
4. **Diagnostic Recommendations**: Suggest appropriate tests
5. **Treatment Considerations**: Outline potential treatment approaches

Patient Information: {PATIENT_DATA}
Symptoms: {SYMPTOMS}
Medical History: {MEDICAL_HISTORY}

Provide a structured clinical assessment. Note: This is for healthcare professional use only and should not replace clinical judgment.`,
      tags: ['diagnosis', 'symptoms', 'clinical-assessment'],
      difficulty: 'Advanced',
      estimatedTime: '10-15 min',
      popularity: 90
    },
    {
      id: 'treatment-planning-1',
      title: 'Treatment Plan Development',
      category: 'Treatment Planning',
      description: 'Develop comprehensive treatment plans for patient care',
      prompt: `You are a treatment planning specialist. Develop a treatment plan for:

1. **Treatment Goals**: Define specific, measurable objectives
2. **Intervention Strategies**: Outline treatment approaches
3. **Timeline**: Establish treatment schedule and milestones
4. **Monitoring Plan**: Define progress tracking methods
5. **Contingency Plans**: Address potential complications

Patient Condition: {CONDITION}
Patient Profile: {PATIENT_PROFILE}
Available Resources: {RESOURCES}

Create a comprehensive, evidence-based treatment plan with clear implementation steps.`,
      tags: ['treatment', 'care-planning', 'clinical-protocols'],
      difficulty: 'Advanced',
      estimatedTime: '20-30 min',
      popularity: 87
    }
  ],
  ecommerce: [
    {
      id: 'product-description-1',
      title: 'Product Description Generator',
      category: 'Product Descriptions',
      description: 'Create compelling product descriptions that drive sales',
      prompt: `You are an e-commerce copywriting expert. Create a compelling product description:

1. **Headline**: Attention-grabbing product title
2. **Key Features**: Highlight main product benefits
3. **Technical Specifications**: List important details
4. **Use Cases**: Describe how customers will use the product
5. **Call to Action**: Encourage purchase decision

Product Information: {PRODUCT_DATA}
Target Audience: {TARGET_AUDIENCE}
Brand Voice: {BRAND_VOICE}

Create an engaging, SEO-optimized product description that converts browsers into buyers.`,
      tags: ['copywriting', 'seo', 'conversion'],
      difficulty: 'Intermediate',
      estimatedTime: '10-15 min',
      popularity: 94
    },
    {
      id: 'customer-support-1',
      title: 'Customer Support Response',
      category: 'Customer Support',
      description: 'Generate helpful customer support responses',
      prompt: `You are a customer support specialist. Address the following customer inquiry:

1. **Issue Understanding**: Acknowledge the customer's concern
2. **Solution Provision**: Provide clear, actionable solutions
3. **Additional Help**: Offer related assistance
4. **Follow-up**: Suggest next steps if needed
5. **Professional Tone**: Maintain helpful, empathetic communication

Customer Inquiry: {CUSTOMER_MESSAGE}
Order/Account Details: {ACCOUNT_INFO}
Company Policies: {POLICIES}

Provide a helpful, professional response that resolves the customer's issue effectively.`,
      tags: ['customer-service', 'support', 'communication'],
      difficulty: 'Beginner',
      estimatedTime: '5-10 min',
      popularity: 91
    }
  ],
  general: [
    {
      id: 'meeting-summary-1',
      title: 'Meeting Summary Generator',
      category: 'Meeting Summaries',
      description: 'Create structured summaries of business meetings',
      prompt: `You are a meeting documentation expert. Create a comprehensive meeting summary:

1. **Meeting Overview**: Date, participants, purpose
2. **Key Discussion Points**: Main topics covered
3. **Decisions Made**: Important decisions and rationale
4. **Action Items**: Tasks assigned with owners and deadlines
5. **Next Steps**: Follow-up actions and next meeting plans

Meeting Details: {MEETING_TRANSCRIPT}
Participants: {PARTICIPANTS}
Meeting Purpose: {PURPOSE}

Provide a clear, actionable meeting summary that keeps everyone aligned.`,
      tags: ['documentation', 'meetings', 'productivity'],
      difficulty: 'Beginner',
      estimatedTime: '10-15 min',
      popularity: 89
    },
    {
      id: 'email-template-1',
      title: 'Professional Email Templates',
      category: 'Email Templates',
      description: 'Generate professional email templates for various business scenarios',
      prompt: `You are a business communication expert. Create a professional email template:

1. **Subject Line**: Clear, compelling subject
2. **Opening**: Appropriate greeting and context
3. **Main Content**: Clear message with key points
4. **Call to Action**: Specific next steps
5. **Closing**: Professional sign-off

Email Type: {EMAIL_TYPE}
Recipient: {RECIPIENT_INFO}
Purpose: {EMAIL_PURPOSE}
Key Points: {KEY_POINTS}

Create a professional, effective email template that achieves the desired outcome.`,
      tags: ['communication', 'email', 'professional'],
      difficulty: 'Beginner',
      estimatedTime: '5-10 min',
      popularity: 93
    }
  ]
};

const PromptLibrary = () => {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState('checking');

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('prompt-library-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('prompt-library-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Check AI service status
  useEffect(() => {
    const checkAIService = async () => {
      try {
        const { testAzureOpenAIConnection } = await import('../utils/aiService');
        const result = await testAzureOpenAIConnection();
        setAiServiceStatus(result.success ? 'available' : 'unavailable');
      } catch (error) {
        console.error('Error checking AI service:', error);
        setAiServiceStatus('unavailable');
      }
    };
    
    checkAIService();
  }, []);

  // Get all templates flattened
  const getAllTemplates = () => {
    return Object.values(templates).flat();
  };

  // Filter templates based on search and category
  const getFilteredTemplates = () => {
    let allTemplates = getAllTemplates();
    
    if (selectedCategory !== 'all') {
      allTemplates = templates[selectedCategory] || [];
    }
    
    if (searchTerm) {
      allTemplates = allTemplates.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return allTemplates;
  };

  // Copy prompt to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Prompt copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Prompt copied to clipboard!');
    }
  };

  // Toggle favorite
  const toggleFavorite = (templateId) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // Generate new template using OpenAI (for saving to library)
  const generateTemplate = async (category, subcategory, description, generatedTemplate) => {
    if (generatedTemplate) {
      // Add the already generated template to the library
      setTemplates(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), generatedTemplate]
      }));
    }
  };

  // Note: category expansion UI is not currently rendered in this component

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="relative bg-white border-b border-gray-200 shadow-lg overflow-hidden">
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
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-3xl shadow-xl">
                  <Library className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-lg">
                  <div className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                  Prompt Library
                </h1>
                <p className="text-lg text-gray-600 font-medium">
                  Professional AI prompt templates for every industry
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <FileText className="w-4 h-4 mr-2" />
                    {getAllTemplates().length} Templates
                  </div>
                  <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    {favorites.length} Favorites
                  </div>
                  <div className={`flex items-center text-sm px-3 py-1 rounded-full ${
                    aiServiceStatus === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : aiServiceStatus === 'unavailable'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      aiServiceStatus === 'available' 
                        ? 'bg-green-500' 
                        : aiServiceStatus === 'unavailable'
                        ? 'bg-red-500'
                        : 'bg-yellow-500 animate-pulse'
                    }`}></div>
                    {aiServiceStatus === 'available' 
                      ? 'AI Service Online' 
                      : aiServiceStatus === 'unavailable'
                      ? 'AI Service Offline'
                      : 'Checking AI Service'
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={aiServiceStatus === 'unavailable'}
              className={`group relative flex items-center px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ${
                aiServiceStatus === 'unavailable'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700'
              } text-white`}
              title={aiServiceStatus === 'unavailable' ? 'AI Service is currently unavailable' : 'Generate new AI prompt template'}
            >
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">
                {aiServiceStatus === 'unavailable' ? 'AI Service Offline' : 'Generate Template'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-lg">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates by title, category, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none px-6 py-4 pr-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-gray-900 font-medium cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100/80 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {filteredTemplates.length} templates found
              </span>
            </div>
          </div>
        </div>

        {/* Categories Overview */}
        {selectedCategory === 'all' && !searchTerm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {CATEGORIES.map(category => {
              const Icon = category.icon;
              const categoryTemplates = templates[category.id] || [];
              
              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
                >
                  <div className={`h-24 bg-gradient-to-r ${category.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" 
                           style={{
                             backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
                             backgroundSize: '24px 24px'
                           }}>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <div className="p-3 bg-white/25 backdrop-blur-sm rounded-xl border border-white/20">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
                        <span className="text-white text-sm font-semibold">
                          {categoryTemplates.length} templates
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 3).map((sub, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {sub}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-200 text-gray-600">
                          +{category.subcategories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => {
            const isFavorite = favorites.includes(template.id);
            const category = CATEGORIES.find(cat => cat.id === Object.keys(templates).find(key => templates[key].includes(template)));
            
            return (
              <div
                key={template.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Template Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${category?.gradient || 'from-gray-500 to-gray-600'} text-white`}>
                          {template.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          template.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          template.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {template.difficulty}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(template.id);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isFavorite 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{template.estimatedTime}</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>{template.popularity}% popular</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => copyToClipboard(template.prompt)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Prompt</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <Search className="w-16 h-16 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No templates found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or explore different categories to find the perfect prompt template.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.title}</h2>
                <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Prompt Template</h3>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                    {selectedTemplate.prompt}
                  </pre>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    <strong>Category:</strong> {selectedTemplate.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    <strong>Difficulty:</strong> {selectedTemplate.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">
                    <strong>Time:</strong> {selectedTemplate.estimatedTime}
                  </span>
                </div>
                
                <button
                  onClick={() => copyToClipboard(selectedTemplate.prompt)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Prompt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Template Modal */}
      {showCreateModal && (
        <GenerateTemplateModal
          categories={CATEGORIES}
          onGenerate={generateTemplate}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

// Generate Template Modal Component
const GenerateTemplateModal = ({ categories, onGenerate, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState(null);
  const [step, setStep] = useState('form'); // 'form' or 'result'
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedCategory || !selectedSubcategory || !description) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsGenerating(true);
    try {
      const template = await generateTemplateDirectly(selectedCategory, selectedSubcategory, description, additionalContext);
      setGeneratedTemplate(template);
      setStep('result');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTemplateDirectly = async (category, subcategory, description, additionalContext = '') => {
    // Import the AI service dynamically to use the existing Azure OpenAI configuration
    const { generatePromptTemplate } = await import('../utils/aiService');
    return await generatePromptTemplate(category, subcategory, description, additionalContext);
  };

  const handleSaveTemplate = () => {
    if (generatedTemplate) {
      onGenerate(selectedCategory, selectedSubcategory, description, generatedTemplate);
      toast.success('Template saved to library!');
      onClose();
    }
  };

  const handleStartOver = () => {
    setStep('form');
    setGeneratedTemplate(null);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setDescription('');
    setAdditionalContext('');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Template copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Template copied to clipboard!');
    }
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {step === 'form' ? 'Generate New Template' : 'Generated Template'}
              </h2>
              <p className="text-purple-100">
                {step === 'form' ? 'Create a custom AI prompt template' : 'Review and save your generated template'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              disabled={isGenerating}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'form' ? (
            <div className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Industry Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(category => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedSubcategory('');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedCategory === category.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={isGenerating}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            selectedCategory === category.id
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{category.name}</div>
                            <div className="text-xs text-gray-600">{category.subcategories.length} subcategories</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subcategory Selection */}
              {selectedCategoryData && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Subcategory
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    <option value="">Choose a subcategory...</option>
                    {selectedCategoryData.subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Template Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this prompt template should accomplish..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Additional Context/Requirements (Optional)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Add any specific requirements, constraints, or additional context that should be included in the generated template..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={5}
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This field is optional. Add specific business requirements, technical constraints, or any other context to generate more detailed and tailored templates.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedCategory || !selectedSubcategory || !description}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate Template</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Result View */
            <div className="p-6">
              {generatedTemplate && (
                <div className="space-y-6">
                  {/* Template Header */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{generatedTemplate.title}</h3>
                        <p className="text-gray-600 mb-4">{generatedTemplate.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r ${selectedCategoryData?.gradient || 'from-gray-500 to-gray-600'} text-white`}>
                            {generatedTemplate.category}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                            generatedTemplate.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            generatedTemplate.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {generatedTemplate.difficulty}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800">
                            <Clock className="w-4 h-4 mr-1" />
                            {generatedTemplate.estimatedTime}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {generatedTemplate.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Generated Prompt */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Generated Prompt Template</h4>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                        {generatedTemplate.prompt}
                      </pre>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                    <button
                      onClick={() => copyToClipboard(generatedTemplate.prompt)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-5 h-5" />
                      <span>Copy Template</span>
                    </button>
                    
                    <button
                      onClick={handleSaveTemplate}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Save to Library</span>
                    </button>
                    
                    <button
                      onClick={handleStartOver}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Generate Another</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptLibrary;
