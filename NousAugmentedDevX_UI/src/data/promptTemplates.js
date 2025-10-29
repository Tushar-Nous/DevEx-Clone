// Industry-specific prompt templates for AI guidelines generation

export const promptTemplates = [
  {
    id: 'banking_core',
    title: 'Banking Core System',
    industry: 'Banking',
    category: 'Core Banking',
    icon: '🏦',
    description: 'Core banking system with account management and transactions',
    template: `I need a comprehensive banking system that handles customer account management, transaction processing, and regulatory compliance. The system should support:

• Multi-currency account management with real-time balance tracking
• Secure transaction processing with fraud detection mechanisms
• Integration with payment gateways and interbank networks
• Regulatory compliance for KYC, AML, and financial reporting
• Real-time transaction monitoring and alerts
• Customer onboarding with digital identity verification
• Loan origination and management workflows
• Credit scoring and risk assessment capabilities
• Automated reporting for regulatory bodies
• Mobile and web banking interfaces with strong authentication

The system must ensure ACID compliance, handle high transaction volumes, and maintain audit trails for all financial operations.`,
    tags: ['Banking', 'Transactions', 'Compliance', 'Security']
  },
  {
    id: 'insurance_claims',
    title: 'Insurance Claims Processing',
    industry: 'Insurance',
    category: 'Claims Management',
    icon: '🛡️',
    description: 'Automated insurance claims processing and management system',
    template: `I require an intelligent insurance claims processing system that automates claim evaluation, fraud detection, and settlement processes. The system should include:

• Automated claim intake from multiple channels (web, mobile, phone, email)
• AI-powered damage assessment using image recognition and ML algorithms
• Integration with third-party assessors, repair shops, and medical providers
• Real-time fraud detection using pattern analysis and risk scoring
• Workflow automation for claim routing, approval, and settlement
• Customer communication portal with status updates and document sharing
• Integration with policy management systems for coverage verification
• Regulatory compliance for insurance industry standards
• Analytics dashboard for claim trends, fraud patterns, and performance metrics
• Mobile app for field adjusters with offline capability
• Automated payment processing and settlement reconciliation

The system must handle high claim volumes, ensure regulatory compliance, and provide excellent customer experience throughout the claims lifecycle.`,
    tags: ['Insurance', 'Claims', 'Fraud Detection', 'Automation']
  },
  {
    id: 'healthcare_medicare',
    title: 'Medicare Management System',
    industry: 'Healthcare',
    category: 'Medicare Administration',
    icon: '🏥',
    description: 'Comprehensive Medicare benefits and claims management',
    template: `I need a Medicare management system that handles beneficiary enrollment, claims processing, and provider network management. The system should provide:

• Beneficiary enrollment and eligibility verification with Medicare databases
• Claims processing workflow with CMS compliance and validation
• Provider credentialing and network management capabilities
• Prior authorization workflows for medical procedures and medications
• Integration with Electronic Health Records (EHR) systems
• Medicare Advantage plan management and coordination of benefits
• Prescription drug coverage (Part D) administration
• Quality reporting and Star Ratings compliance
• Member portal for benefit information, claims status, and provider search
• Provider portal for claims submission, status tracking, and payments
• Analytics for utilization patterns, cost management, and fraud detection
• HIPAA-compliant data handling and security measures

The system must integrate with CMS systems, handle complex Medicare regulations, and ensure accurate benefit administration while maintaining member satisfaction.`,
    tags: ['Healthcare', 'Medicare', 'Claims', 'Compliance']
  },
  {
    id: 'fintech_payment',
    title: 'FinTech Payment Platform',
    industry: 'FinTech',
    category: 'Digital Payments',
    icon: '💳',
    description: 'Modern digital payment processing platform',
    template: `I want to build a comprehensive FinTech payment platform that enables seamless digital transactions across multiple channels. The platform should support:

• Multi-channel payment processing (mobile, web, POS, API)
• Real-time payment processing with instant settlement capabilities
• Integration with major card networks (Visa, Mastercard, Amex)
• Alternative payment methods (digital wallets, buy-now-pay-later, crypto)
• Advanced fraud prevention using ML algorithms and behavioral analysis
• PCI DSS compliance and end-to-end encryption
• Merchant onboarding with risk assessment and KYC verification
• Dynamic pricing and fee management with transparent reporting
• Webhook notifications and real-time transaction status updates
• Comprehensive analytics dashboard for merchants and platform administrators
• Multi-currency support with competitive foreign exchange rates
• Dispute management and chargeback handling workflows

The platform must be scalable, secure, and provide excellent developer experience with comprehensive APIs and documentation.`,
    tags: ['FinTech', 'Payments', 'API', 'Security']
  },
  {
    id: 'retail_ecommerce',
    title: 'E-commerce Retail Platform',
    industry: 'Retail',
    category: 'E-commerce',
    icon: '🛒',
    description: 'Comprehensive e-commerce platform for retail businesses',
    template: `I need a full-featured e-commerce platform that supports modern retail operations across multiple channels. The system should include:

• Product catalog management with variants, pricing, and inventory tracking
• Multi-channel selling (web, mobile app, social commerce, marketplaces)
• Shopping cart and checkout optimization with multiple payment options
• Customer account management with order history and preferences
• Inventory management with real-time stock levels and automated reordering
• Order fulfillment workflow with shipping integration and tracking
• Customer service tools including live chat, returns, and refunds
• Marketing automation with personalized recommendations and email campaigns
• Analytics and reporting for sales, customer behavior, and inventory performance
• SEO optimization and content management capabilities
• Mobile-responsive design with progressive web app features
• Integration with ERP, CRM, and accounting systems

The platform must handle high traffic loads, provide excellent user experience, and support business growth with scalable architecture.`,
    tags: ['Retail', 'E-commerce', 'Inventory', 'Marketing']
  },
  {
    id: 'healthcare_ehr',
    title: 'Electronic Health Records',
    industry: 'Healthcare',
    category: 'Health Records',
    icon: '📋',
    description: 'Comprehensive electronic health records management system',
    template: `I require a comprehensive Electronic Health Records (EHR) system that digitizes patient information and streamlines healthcare workflows. The system should provide:

• Patient demographics and medical history management
• Clinical documentation with templates and voice-to-text capabilities
• Prescription management with drug interaction checking and e-prescribing
• Laboratory and diagnostic results integration with automated alerts
• Appointment scheduling and patient portal access
• Clinical decision support with evidence-based guidelines
• Billing and coding integration with insurance claim processing
• Interoperability with other healthcare systems using HL7 FHIR standards
• Quality reporting for meaningful use and clinical quality measures
• Population health management and analytics capabilities
• Mobile access for healthcare providers with offline synchronization
• HIPAA compliance with audit trails and access controls
• Telemedicine integration for remote patient consultations

The system must ensure data security, regulatory compliance, and improve patient care quality while reducing administrative burden on healthcare providers.`,
    tags: ['Healthcare', 'EHR', 'HIPAA', 'Interoperability']
  },
  {
    id: 'manufacturing_erp',
    title: 'Manufacturing ERP System',
    industry: 'Manufacturing',
    category: 'Enterprise Resource Planning',
    icon: '🏭',
    description: 'Integrated ERP system for manufacturing operations',
    template: `I need an integrated Manufacturing ERP system that manages all aspects of production, supply chain, and business operations. The system should encompass:

• Production planning and scheduling with capacity management
• Bill of Materials (BOM) management with version control
• Inventory management for raw materials, work-in-progress, and finished goods
• Supply chain management with vendor relationships and procurement
• Quality control workflows with inspection points and compliance tracking
• Shop floor control with real-time production monitoring
• Maintenance management for equipment and preventive maintenance scheduling
• Financial management including cost accounting and profitability analysis
• Sales order management with delivery scheduling and customer communication
• Human resources management with workforce planning and time tracking
• Regulatory compliance for industry standards (ISO, FDA, etc.)
• Business intelligence and analytics for operational insights
• Integration with IoT devices and manufacturing equipment

The system must optimize production efficiency, reduce waste, ensure quality standards, and provide real-time visibility into all manufacturing operations.`,
    tags: ['Manufacturing', 'ERP', 'Production', 'Supply Chain']
  },
  {
    id: 'education_lms',
    title: 'Learning Management System',
    industry: 'Education',
    category: 'Online Learning',
    icon: '🎓',
    description: 'Comprehensive learning management and education platform',
    template: `I want to develop a comprehensive Learning Management System (LMS) that supports modern educational delivery and administration. The platform should include:

• Course creation and content management with multimedia support
• Student enrollment and progress tracking with automated notifications
• Interactive learning tools including quizzes, assignments, and discussions
• Virtual classroom integration with video conferencing and screen sharing
• Gradebook and assessment management with rubric-based grading
• Student portal with course access, grades, and communication tools
• Instructor dashboard with analytics and student performance insights
• Mobile learning app with offline content access and synchronization
• Integration with Student Information Systems (SIS) and third-party tools
• Certification and badge management with digital credential issuance
• Parent/guardian portal for K-12 implementations
• Accessibility compliance with WCAG guidelines and assistive technologies
• Multi-language support and internationalization capabilities

The system must be scalable to support thousands of concurrent users, provide engaging learning experiences, and ensure data privacy compliance with educational regulations like FERPA.`,
    tags: ['Education', 'LMS', 'E-learning', 'Accessibility']
  }
];

// Helper functions for template management
export const getTemplatesByIndustry = (industry) => {
  return promptTemplates.filter(template => template.industry === industry);
};

export const getTemplateById = (id) => {
  return promptTemplates.find(template => template.id === id);
};

export const getAllIndustries = () => {
  return [...new Set(promptTemplates.map(template => template.industry))];
};

export const getTemplateCategories = () => {
  return [...new Set(promptTemplates.map(template => template.category))];
};
