const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();

// Configure CORS to allow all origins
app.use(cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Storage configuration
const STORAGE_DIR = 'storage';
const GUIDELINES_FILE = path.join(STORAGE_DIR, 'guidelines.json');
const AGILE_ARTIFACTS_FILE = path.join(STORAGE_DIR, 'agile_artifacts.json');
const BACKEND_STORAGE_FILE = path.join(STORAGE_DIR, 'backend_storage.json');
const PERSONAS_FILE = path.join(STORAGE_DIR, 'personas.json');

// Ensure storage directory exists
fs.ensureDirSync(STORAGE_DIR);

// Azure OpenAI credentials
const OPENAI_API_VERSION = "2024-02-01";
const AZURE_DEPLOYMENT = "SwarupDemo";
const API_KEY = "fcd7227745f941e7b6287bfcffcb5f46";
const AZURE_ENDPOINT = "https://openaiswarup.openai.azure.com/";
const TEMPERATURE = 0.2;

// Initialize Azure OpenAI client
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: `${AZURE_ENDPOINT}openai/deployments/${AZURE_DEPLOYMENT}`,
    defaultQuery: { 'api-version': OPENAI_API_VERSION },
    defaultHeaders: {
        'api-key': API_KEY,
    }
});

// Storage utility functions
async function loadJsonData(filePath) {
    try {
        if (await fs.pathExists(filePath)) {
            const data = await fs.readJson(filePath);
            return data;
        }
        return [];
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error.message);
        return [];
    }
}

async function saveJsonData(filePath, data) {
    try {
        await fs.writeJson(filePath, data, { spaces: 2 });
        return true;
    } catch (error) {
        console.error(`Error saving ${filePath}:`, error.message);
        return false;
    }
}

async function addRecord(filePath, record) {
    try {
        const data = await loadJsonData(filePath);
        record.id = data.length + 1;
        record.timestamp = new Date().toISOString();
        data.push(record);
        return await saveJsonData(filePath, data);
    } catch (error) {
        console.error(`Error adding record to ${filePath}:`, error.message);
        return false;
    }
}

// Default personas from empathy phase research
const DEFAULT_PERSONAS = [
    {
        id: 'qa-engineer',
        name: 'QA Engineer',
        title: 'Quality Assurance Engineer',
        description: 'Focused on testing, quality assurance, and ensuring software reliability',
        department: 'Quality Assurance',
        experience: 'Senior',
        avatar: '🧪',
        gradient: 'from-purple-500 to-indigo-600',
        skills: ['Test Automation', 'Manual Testing', 'Bug Tracking', 'Performance Testing', 'API Testing'],
        responsibilities: [
            'Design and execute test plans',
            'Identify and report software defects',
            'Automate testing processes',
            'Ensure quality standards compliance'
        ],
        painPoints: [
            'Time-consuming manual testing',
            'Difficulty in reproducing bugs',
            'Integration testing complexity'
        ],
        goals: [
            'Increase test automation coverage',
            'Reduce time to identify defects',
            'Improve test reporting'
        ],
        tools: ['Selenium', 'Jest', 'Postman', 'JIRA', 'TestRail'],
        context: 'testing, quality assurance, bug tracking, automation, validation',
        empathyData: {
            quote: "I need to catch bugs before they reach production",
            frustrations: ["Manual regression takes too long", "Hard to track test coverage"],
            motivations: ["Deliver quality software", "Automate repetitive tasks"]
        }
    },
    {
        id: 'senior-developer',
        name: 'Senior Developer',
        title: 'Senior Software Developer',
        description: 'Experienced developer specializing in full-stack development and architecture',
        department: 'Engineering',
        experience: 'Senior',
        avatar: '👨‍💻',
        gradient: 'from-blue-500 to-cyan-600',
        skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Microservices'],
        responsibilities: [
            'Design and implement software solutions',
            'Code review and mentoring',
            'Architecture planning',
            'Technical documentation'
        ],
        painPoints: [
            'Technical debt management',
            'Balancing speed with code quality',
            'Keeping up with technology changes'
        ],
        goals: [
            'Build scalable architectures',
            'Mentor junior developers',
            'Reduce technical debt'
        ],
        tools: ['VS Code', 'Git', 'Docker', 'AWS', 'MongoDB'],
        context: 'development, architecture, code quality, technical leadership, implementation',
        empathyData: {
            quote: "I want to write clean, maintainable code that scales",
            frustrations: ["Unclear requirements", "Legacy code maintenance", "Context switching"],
            motivations: ["Technical excellence", "Team growth", "Innovation"]
        }
    },
    {
        id: 'devops-engineer',
        name: 'DevOps Engineer',
        title: 'DevOps & Infrastructure Engineer',
        description: 'Specializes in CI/CD, infrastructure automation, and deployment strategies',
        department: 'Infrastructure',
        experience: 'Senior',
        avatar: '⚙️',
        gradient: 'from-green-500 to-emerald-600',
        skills: ['Kubernetes', 'Jenkins', 'Terraform', 'AWS', 'Monitoring', 'Security'],
        responsibilities: [
            'Manage CI/CD pipelines',
            'Infrastructure as Code',
            'System monitoring and alerting',
            'Security compliance'
        ],
        painPoints: [
            'Manual deployment processes',
            'Infrastructure inconsistencies',
            'Alert fatigue'
        ],
        goals: [
            'Achieve 99.9% uptime',
            'Automate infrastructure provisioning',
            'Reduce deployment time'
        ],
        tools: ['Jenkins', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana'],
        context: 'deployment, infrastructure, automation, monitoring, ci/cd, pipelines',
        empathyData: {
            quote: "I need reliable, automated deployments with zero downtime",
            frustrations: ["Manual interventions", "Inconsistent environments", "False alerts"],
            motivations: ["System reliability", "Automation", "Efficiency"]
        }
    },
    {
        id: 'security-analyst',
        name: 'Security Analyst',
        title: 'Cybersecurity Analyst',
        description: 'Focuses on security assessments, vulnerability management, and compliance',
        department: 'Security',
        experience: 'Mid-Level',
        avatar: '🔒',
        gradient: 'from-red-500 to-pink-600',
        skills: ['Penetration Testing', 'Vulnerability Assessment', 'SIEM', 'Compliance', 'Risk Management'],
        responsibilities: [
            'Conduct security assessments',
            'Monitor security threats',
            'Ensure compliance standards',
            'Incident response management'
        ],
        painPoints: [
            'Keeping up with emerging threats',
            'Balancing security with usability',
            'Compliance reporting overhead'
        ],
        goals: [
            'Proactively identify vulnerabilities',
            'Improve incident response time',
            'Maintain compliance'
        ],
        tools: ['Nessus', 'Burp Suite', 'Splunk', 'Wireshark', 'Metasploit'],
        context: 'security, compliance, vulnerability management, risk assessment, penetration testing',
        empathyData: {
            quote: "I need to protect our systems without hindering productivity",
            frustrations: ["Late security reviews", "Complex compliance requirements", "False positives"],
            motivations: ["Risk mitigation", "Regulatory compliance", "User safety"]
        }
    },
    {
        id: 'product-manager',
        name: 'Product Manager',
        title: 'Senior Product Manager',
        description: 'Drives product strategy, roadmap planning, and stakeholder coordination',
        department: 'Product',
        experience: 'Senior',
        avatar: '📊',
        gradient: 'from-orange-500 to-amber-600',
        skills: ['Product Strategy', 'Roadmap Planning', 'User Research', 'Analytics', 'Agile'],
        responsibilities: [
            'Define product vision and strategy',
            'Coordinate with stakeholders',
            'Analyze user feedback and metrics',
            'Prioritize feature development'
        ],
        painPoints: [
            'Competing stakeholder priorities',
            'Limited resources for all features',
            'Measuring product success'
        ],
        goals: [
            'Increase user satisfaction',
            'Drive product adoption',
            'Deliver valuable features'
        ],
        tools: ['JIRA', 'Figma', 'Analytics', 'Miro', 'Slack'],
        context: 'product strategy, stakeholder management, user research, roadmap planning, prioritization',
        empathyData: {
            quote: "I need to balance user needs with business objectives",
            frustrations: ["Unclear user needs", "Resource constraints", "Alignment challenges"],
            motivations: ["User value", "Business growth", "Team collaboration"]
        }
    },
    {
        id: 'data-analyst',
        name: 'Data Analyst',
        title: 'Senior Data Analyst',
        description: 'Specializes in data analysis, reporting, and business intelligence',
        department: 'Analytics',
        experience: 'Senior',
        avatar: '📈',
        gradient: 'from-teal-500 to-cyan-600',
        skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Machine Learning', 'ETL'],
        responsibilities: [
            'Analyze business data and trends',
            'Create reports and dashboards',
            'Provide data-driven insights',
            'Maintain data quality standards'
        ],
        painPoints: [
            'Data quality issues',
            'Ad-hoc analysis requests',
            'Complex data integration'
        ],
        goals: [
            'Provide actionable insights',
            'Automate reporting',
            'Improve data accuracy'
        ],
        tools: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel'],
        context: 'data analysis, reporting, business intelligence, analytics, insights, metrics',
        empathyData: {
            quote: "I need clean, accessible data to drive business decisions",
            frustrations: ["Inconsistent data", "Manual report generation", "Data silos"],
            motivations: ["Data-driven decisions", "Business impact", "Automation"]
        }
    }
];

// Initialize personas file with defaults if it doesn't exist
async function initializePersonas() {
    try {
        if (!await fs.pathExists(PERSONAS_FILE)) {
            await saveJsonData(PERSONAS_FILE, DEFAULT_PERSONAS);
            console.log('✅ Initialized personas.json with default empathy phase data');
        }
    } catch (error) {
        console.error('Error initializing personas:', error);
    }
}

// Call initialization on startup
initializePersonas();


// Full SYSTEM_PROMPT with template included
const SYSTEM_PROMPT = `
System Message (role = system):
You are an expert Enterprise UX/UI Designer specializing in enterprise-grade application design documentation for Figma Make.
You strictly follow WCAG 2.1 AA accessibility standards, modern enterprise design systems, and Figma implementation best practices.
The user may provide:
Short text/chat (e.g., "Employee logs into HR portal to check payslips")
Long text/PDF/document (detailed workflows, requirements, or business specs)
Assistant Instructions (role = assistant):
Step 1: Requirement Understanding
If input is short → expand into a full business-ready requirement.
If input is long/PDF → extract the key requirements/journeys and summarize.
Step 2: Transform
Convert requirement(s) into the structured Enterprise Application Design Guidelines for Figma Make format.
Always follow the section order and formatting.
Step 3: Output Format
Always use this exact template for your output:
Enterprise Application Design Guidelines for Figma Make
Project Overview
[Summarize the requirement/journey into a high-level application purpose and business goal]
1. Design System Foundation
Brand Identity
Logo Integration: Implement company logo with proper sizing (minimum 24px height for web)
Brand Colors: Define primary, secondary, and neutral color palettes with semantic meanings
Brand Voice: Maintain professional, trustworthy, and approachable tone throughout UI copy
Typography Hierarchy: Establish clear heading levels (H1-H6) with consistent font weights and sizes
Color System
Primary Colors: Define 2-3 main brand colors with accessibility-compliant contrast ratios
Semantic Colors: Success (green), Warning (amber), Error (red), Info (blue)
Neutral Palette: Grays for backgrounds, borders, and text (minimum 9 shades)
Contrast Requirements: Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
2. Typography Guidelines
# Enterprise Application Design Guidelines for Figma Make
 
## Project Overview
Create a comprehensive, scalable, and accessible enterprise application following modern design principles and best practices. This application should serve as a robust foundation for business operations with consistent user experience across all touchpoints.
 
## 1. Design System Foundation
 
### Brand Identity
- **Logo Integration**: Implement company logo with proper sizing (minimum 24px height for web)
- **Brand Colors**: Define primary, secondary, and neutral color palettes with semantic meanings
- **Brand Voice**: Maintain professional, trustworthy, and approachable tone throughout UI copy
- **Typography Hierarchy**: Establish clear heading levels (H1-H6) with consistent font weights and sizes
 
### Color System
- **Primary Colors**: Define 2-3 main brand colors with accessibility-compliant contrast ratios
- **Semantic Colors**: Success (green), Warning (amber), Error (red), Info (blue)
- **Neutral Palette**: Grays for backgrounds, borders, and text (minimum 9 shades)
- **Contrast Requirements**: Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 
## 2. Typography Guidelines
 
### Font Selection
- **Primary Font**: Choose enterprise-grade typeface (system fonts recommended for performance)
- **Font Weights**: Regular (400), Medium (500), Semi-bold (600), Bold (700)
- **Line Heights**: 1.2 for headings, 1.4-1.6 for body text
- **Font Sizes**: Establish 8-point scale (12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px)
 
### Text Hierarchy
- **H1**: Primary page titles (32-48px)
- **H2**: Section headers (24-32px)
- **H3**: Subsection headers (20-24px)
- **Body**: Primary content (14-16px)
- **Caption**: Supporting text (12-14px)
 
## 3. Layout and Grid System
 
### Grid Structure
- **Desktop**: 12-column grid with 24px gutters and 120px max margins
- **Tablet**: 8-column grid with 20px gutters
- **Mobile**: 4-column grid with 16px gutters
- **Container Max-width**: 1200px for optimal readability
 
### Spacing System
- **Base Unit**: 8px (use multiples: 8px, 16px, 24px, 32px, 48px, 64px, 96px)
- **Component Padding**: Internal spacing for consistency
- **Section Margins**: Vertical rhythm between content blocks
 
## 4. Component Library Specifications
 
### Navigation Components
 
#### Primary Navigation
- **Desktop**: Horizontal top navigation with dropdown menus
- **Mobile**: Hamburger menu with slide-out drawer
- **Active States**: Clear visual indication of current page/section
- **Accessibility**: Proper ARIA labels, keyboard navigation support
 
#### Breadcrumbs
- **Format**: Home > Section > Subsection > Current Page
- **Separators**: Forward slash (/) or chevron (>)
- **Clickable Elements**: All except current page
 
### Form Components
 
#### Input Fields
- **Height**: Minimum 44px for touch targets
- **States**: Default, Focus, Error, Disabled, Success
- **Labels**: Always visible, positioned above inputs
- **Placeholder Text**: Helpful examples, not instructions
- **Error Messaging**: Clear, actionable feedback below inputs
 
#### Buttons
- **Primary Button**: High contrast, for main actions
- **Secondary Button**: Lower contrast, for secondary actions
- **Tertiary Button**: Text-only, for less important actions
- **Sizes**: Small (32px), Medium (40px), Large (48px)
- **States**: Default, Hover, Active, Disabled, Loading
 
#### Form Validation
- **Inline Validation**: Real-time feedback for individual fields
- **Error Prevention**: Input constraints and helpful formatting
- **Success States**: Positive confirmation of correct inputs
 
### Data Display Components
 
#### Tables
- **Header Styling**: Bold text, background color differentiation
- **Row Styling**: Alternating backgrounds for readability
- **Sorting**: Clear visual indicators for sortable columns
- **Pagination**: Show entries info and navigation controls
- **Responsive**: Stack or scroll horizontally on mobile
 
#### Cards
- **Shadow Elevation**: Subtle drop shadows (2-4px blur)
- **Border Radius**: Consistent corner rounding (4-8px)
- **Content Hierarchy**: Clear title, body, and action areas
- **Hover States**: Subtle elevation or border changes
 
### Feedback Components
 
#### Alerts and Notifications
- **Success**: Green background with checkmark icon
- **Warning**: Amber background with warning icon
- **Error**: Red background with error icon
- **Info**: Blue background with info icon
- **Positioning**: Toast notifications in top-right, inline alerts contextually
 
#### Loading States
- **Skeleton Screens**: Gray placeholders matching content structure
- **Progress Indicators**: Linear for known progress, circular for unknown
- **Spinners**: Use sparingly, prefer skeleton screens
 
## 5. Web Accessibility (WCAG 2.1 AA Compliance)
 
### Color and Contrast
- **Contrast Ratios**: Test all color combinations
- **Color Independence**: Never rely solely on color to convey information
- **Focus Indicators**: Visible focus states for keyboard navigation
 
### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Skip Links**: "Skip to main content" for screen readers
- **Escape Functionality**: Close modals and dropdowns with Escape key
 
### Screen Reader Support
- **ARIA Labels**: Descriptive labels for interactive elements
- **Heading Structure**: Proper H1-H6 hierarchy
- **Alt Text**: Meaningful descriptions for images and icons
- **Form Labels**: Explicitly associated with form controls
 
### Motor Accessibility
- **Touch Targets**: Minimum 44px x 44px clickable areas
- **Spacing**: Adequate space between interactive elements
- **Timeout Warnings**: For sessions with time limits
 
## 6. Responsive Design Principles
 
### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1199px
- **Large Desktop**: 1200px+
 
### Mobile-First Approach
- **Progressive Enhancement**: Start with mobile design, enhance for larger screens
- **Touch Interactions**: Swipe gestures, tap targets, thumb-friendly navigation
- **Content Priority**: Most important content visible without scrolling
 
## 7. Interaction and Animation Guidelines
 
### Micro-interactions
- **Duration**: 200-300ms for most transitions
- **Easing**: Ease-out for entrances, ease-in for exits
- **Button Feedback**: Subtle scale or color changes on interaction
- **Form Feedback**: Smooth transitions between states
 
### Page Transitions
- **Loading States**: Show progress for actions taking >1 second
- **Content Updates**: Smooth fade or slide transitions
- **Error Handling**: Clear visual feedback without jarring interruptions
 
## 8. Icon System
 
### Icon Library
- **Style**: Consistent stroke width and corner radius
- **Sizes**: 16px, 20px, 24px, 32px standard sizes
- **Usage**: Functional icons for navigation, decorative icons sparingly
- **Accessibility**: Alt text or ARIA labels for meaningful icons
 
## 9. Content Guidelines
 
### Writing Principles
- **Clarity**: Simple, direct language
- **Consistency**: Standard terminology across application
- **Actionable**: Clear next steps for users
- **Inclusive**: Gender-neutral, accessible language
 
### Error Messages
- **Specific**: Explain exactly what went wrong
- **Helpful**: Provide steps to resolve the issue
- **Human**: Avoid technical jargon
- **Positioning**: Near the relevant input or action
 
## 10. Performance Considerations
 
### Image Optimization
- **Formats**: WebP with fallbacks, SVG for icons
- **Sizing**: Multiple resolutions for different screen densities
- **Lazy Loading**: For images below the fold
 
### Asset Management
- **Component Reusability**: Maximum reuse of design components
- **Consistent Naming**: Clear, descriptive names for all elements
- **Style Organization**: Logical grouping of colors, typography, and spacing
 
## 11. Quality Assurance Checklist
 
### Pre-Development Review
- [ ] All components follow established design system
- [ ] Color contrast meets WCAG AA standards
- [ ] Interactive elements meet minimum size requirements
- [ ] Typography hierarchy is consistent
- [ ] Responsive behavior is defined for all breakpoints
 
### Accessibility Audit
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader compatibility verified
- [ ] Color-blind friendly color combinations
- [ ] Alternative text provided for all images
- [ ] Form labels properly associated
 
### Brand Consistency
- [ ] Logo usage follows brand guidelines
- [ ] Color palette matches brand standards
- [ ] Typography reflects brand personality
- [ ] Voice and tone consistent throughout
 
## Implementation Notes for Figma Make
 
1. **Component Organization**: Create a master component library with all variants and states
2. **Auto-layout Usage**: Implement responsive behavior using Figma's auto-layout features
3. **Style Management**: Use Figma styles for colors, typography, and effects
4. **Documentation**: Include usage guidelines within component descriptions
5. **Testing**: Create example pages showing components in context
 
---
Implementation Notes for Figma Make
Component Organization: Create a master component library with all variants and states
Auto-layout Usage: Implement responsive behavior using Figma's auto-layout features
Style Management: Use Figma styles for colors, typography, and effects
Documentation: Include usage guidelines within component descriptions
Testing: Create example pages showing components in context
Output Rules
Always keep the exact section order and markdown formatting.
Always expand short inputs to a complete enterprise guideline.
Always compress long PDF inputs into this structure.
Always ensure the output is detailed, enterprise-ready, and Figma implementation-ready.
`;

// Generate Guidelines endpoint
app.post('/generate-guidelines', async (req, res) => {
    try {
        const { input } = req.body;

        if (!input) {
            return res.status(400).json({ error: "Input is required" });
        }

        // Append user input into the SYSTEM_PROMPT for full context
        const systemWithInput = SYSTEM_PROMPT + `\n\n---\nUser Requirement / Input:\n${input}\n---`;

        const messages = [
            { role: "system", content: systemWithInput },
            { role: "user", content: input }
        ];

        const response = await openai.chat.completions.create({
            model: AZURE_DEPLOYMENT,
            messages: messages,
            temperature: TEMPERATURE,
            max_tokens: 4096
        });

        const result = response.choices[0].message.content;
        
        // Store the generated guidelines in JSON
        const guidelineRecord = {
            input: input,
            guidelines: result,
            type: "design_guidelines"
        };
        
        const saved = await addRecord(GUIDELINES_FILE, guidelineRecord);
        
        if (saved) {
            return res.json({
                success: true,
                guidelines: result,
                input: input,
                id: guidelineRecord.id,
                message: "Guidelines generated and stored successfully"
            });
        } else {
            return res.json({
                success: true,
                guidelines: result,
                input: input,
                warning: "Guidelines generated but storage failed"
            });
        }
            
    } catch (error) {
        console.error('Error generating guidelines:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to generate guidelines: ${error.message}`
        });
    }
});

// Helper function to filter relevant personas based on requirement context
function filterRelevantPersonas(requirement, allPersonas) {
    const requirementLower = requirement.toLowerCase();
    
    // Define technical requirement indicators
    const technicalIndicators = [
        'system', 'application', 'platform', 'software', 'build', 'develop',
        'implement', 'create', 'integration', 'api', 'database', 'backend',
        'frontend', 'architecture', 'code', 'microservice', 'service',
        'processing', 'automation', 'workflow', 'algorithm', 'ml', 'ai-powered'
    ];
    
    // Check if this is a technical requirement
    const isTechnicalRequirement = technicalIndicators.some(indicator => 
        requirementLower.includes(indicator)
    );
    
    // Score each persona based on relevance to requirement
    const scoredPersonas = allPersonas.map(persona => {
        let score = 0;
        const contextKeywords = persona.context.split(',').map(k => k.trim().toLowerCase());
        const responsibilities = persona.responsibilities.join(' ').toLowerCase();
        const painPoints = persona.painPoints.join(' ').toLowerCase();
        const goals = persona.goals.join(' ').toLowerCase();
        const personaName = persona.name.toLowerCase();
        
        // Boost developer persona for any technical requirement
        if (isTechnicalRequirement && 
            (personaName.includes('developer') || personaName.includes('engineer'))) {
            score += 5; // Strong boost for developers in technical requirements
        }
        
        // Check context keywords (exact matches)
        contextKeywords.forEach(keyword => {
            if (requirementLower.includes(keyword)) {
                score += 3; // Higher weight for direct context match
            }
        });
        
        // Check for partial keyword matches in context
        const requirementWords = requirementLower.split(/\s+/);
        requirementWords.forEach(word => {
            if (word.length > 4) { // Only check meaningful words
                contextKeywords.forEach(keyword => {
                    if (keyword.includes(word) || word.includes(keyword)) {
                        score += 1; // Partial match bonus
                    }
                });
            }
        });
        
        // Check responsibilities
        if (responsibilities.split(' ').some(word => 
            word.length > 4 && requirementLower.includes(word.toLowerCase())
        )) {
            score += 2;
        }
        
        // Check pain points and goals
        if (painPoints.split(' ').some(word => 
            word.length > 4 && requirementLower.includes(word.toLowerCase())
        )) {
            score += 1;
        }
        if (goals.split(' ').some(word => 
            word.length > 4 && requirementLower.includes(word.toLowerCase())
        )) {
            score += 1;
        }
        
        return { persona, score };
    });
    
    // Sort by relevance score
    scoredPersonas.sort((a, b) => b.score - a.score);
    
    // Log scores for debugging
    console.log('📊 Persona Relevance Scores:');
    scoredPersonas.forEach(p => {
        console.log(`  ${p.persona.name}: ${p.score} points`);
    });
    
    // Return top relevant personas (at least 2, max 5 for complex requirements)
    const threshold = 3;
    const highScorePersonas = scoredPersonas.filter(p => p.score >= threshold);
    
    if (highScorePersonas.length >= 2) {
        // Return personas with score >= threshold, max 5 for complex requirements
        return highScorePersonas.slice(0, 5).map(p => p.persona);
    } else {
        // Return top 4 personas even with low scores for variety
        return scoredPersonas.slice(0, 4).map(p => p.persona);
    }
}

// Agile Artifacts System Prompt with Persona Context
const AGILE_SYSTEM_PROMPT_WITH_PERSONAS = (personasContext, personaCount) => `
You are a Business Analyst expert in Agile methodology and Design Thinking.
You will convert user requirements into comprehensive Agile artifacts with persona-based user stories.

CRITICAL REQUIREMENTS - READ CAREFULLY:
1. Break down the requirement into 5-10 distinct features (each feature = logical grouping)
2. Generate 3-5 user stories PER feature (covering different personas and aspects)
3. MANDATORY: Use EVERY provided persona multiple times across different features
4. ALL user stories MUST use ONLY the provided persona names - NO generic roles
5. Format: "As a [Exact Persona Name], I want [goal] so that [benefit]"
6. Each story MUST include 3-5 specific acceptance criteria using Gherkin format (Given/When/Then)

PERSONA COVERAGE REQUIREMENT:
The ${personaCount} personas below were intelligently selected as relevant to this requirement.
YOU MUST use each persona AT LEAST 3-5 times across different features and stories.

AVAILABLE PERSONAS (pre-filtered for relevance):
${personasContext}

OUTPUT STRUCTURE - FOLLOW EXACTLY:
Epic: [High-level business objective]

Features:
  Feature 1: [First capability - e.g., "Automated Claim Intake"]
    User Stories:
      - Story 1: As a [Persona Name], I want [specific capability] so that [business value]
        Acceptance Criteria:
          • Given [context]
          • When [action]
          • Then [expected result]
          • [3-5 total criteria...]
        Priority: [High/Medium/Low]
        Story Points: [1/2/3/5/8/13]
      
      - Story 2: As a [Different Persona], I want [different aspect of same feature] so that [value]
        Acceptance Criteria: [3-5 criteria]
      
      - Story 3: As a [Another Persona], I want [another aspect] so that [value]
        Acceptance Criteria: [3-5 criteria]
      
      [3-5 stories per feature]

  Feature 2: [Second capability - e.g., "AI-Powered Damage Assessment"]
    User Stories: [3-5 stories covering different personas and aspects]
  
  Feature 3: [Third capability - e.g., "Third-Party Integration"]
    User Stories: [3-5 stories]
  
  [Continue for 5-10 features total]

STORY GENERATION RULES - MANDATORY:
1. For EACH requirement bullet point, create at least 1 feature
2. For EACH feature, generate 3-5 user stories from different perspectives:
   - Senior Developer: Implementation, architecture, integration, coding
   - DevOps Engineer: Deployment, infrastructure, monitoring, CI/CD
   - QA Engineer: Testing, validation, quality assurance, test automation
   - Security Analyst: Security testing, vulnerability assessment, compliance
   - Data Analyst: Data processing, analytics, reporting, insights
   - Product Manager: User experience, business value, prioritization

3. Technical features (APIs, integrations, systems, automation) MUST include:
   ✅ Senior Developer stories for implementation
   ✅ DevOps Engineer stories for deployment/infrastructure
   ✅ QA Engineer stories for testing
   ✅ Security Analyst stories if security-related

4. Data features (analytics, reporting, dashboards) MUST include:
   ✅ Data Analyst stories for data processing
   ✅ Senior Developer stories for implementation
   ✅ QA Engineer stories for validation

COMPREHENSIVE COVERAGE CHECKLIST:
For a complex system requirement, you should generate approximately:
- 5-10 features (one per major capability)
- 3-5 stories per feature
- Total: 15-50 user stories (depending on complexity)
- Each persona should appear 3-8 times across different features

VALIDATION RULES:
❌ NEVER use generic terms: "System Admin", "User", "Analyst", "Developer", "Tester", "Admin"
❌ NEVER invent persona names not in the list above
❌ NEVER generate less than 3 stories per feature
❌ NEVER skip a provided persona - ALL must be used multiple times
✅ ALWAYS use exact persona names from the provided list
✅ ALWAYS break down complex requirements into multiple features
✅ ALWAYS generate sufficient stories to cover the feature comprehensively
✅ Each story must have 3-5 acceptance criteria minimum
✅ Stories must be independently deliverable

Keep language clear, actionable, and aligned to Agile best practices.

EXAMPLE FOR COMPLEX REQUIREMENTS:
If a requirement has 10 bullet points (like "automated intake, AI assessment, integration, fraud detection, workflow automation, customer portal, policy integration, compliance, analytics, mobile app, payment processing"), you should generate:

Feature 1: Automated Claim Intake
  - Story 1: As a Senior Developer, I want to implement multi-channel claim intake APIs...
  - Story 2: As a QA Engineer, I want to validate claim data from all channels...
  - Story 3: As a Security Analyst, I want to secure claim submission endpoints...
  
Feature 2: AI-Powered Damage Assessment  
  - Story 1: As a Senior Developer, I want to integrate ML models for image recognition...
  - Story 2: As a Data Analyst, I want to analyze damage assessment accuracy...
  - Story 3: As a QA Engineer, I want to test ML model predictions...

Feature 3: Third-Party Integration
  - Story 1: As a Senior Developer, I want to build REST APIs for assessor integration...
  - Story 2: As a DevOps Engineer, I want to monitor third-party API performance...
  - Story 3: As a Security Analyst, I want to implement OAuth for partner access...

[Continue for 10+ features with 3-5 stories each]

This ensures comprehensive coverage with 30-50 total user stories for complex systems.
`;

// Helper function to format personas for AI prompt with full empathy data
function formatPersonasForPrompt(personas) {
    return personas.map(p => `
• ${p.name} (${p.title}) - ${p.department}
  Responsibilities: ${p.responsibilities.join(', ')}
  Goals: ${p.goals.join(', ')}
  Pain Points: ${p.painPoints.join(', ')}
  Context Keywords: ${p.context}
  
  **Empathy Phase Research:**
  - Quote: "${p.empathyData.quote}"
  - Frustrations: ${p.empathyData.frustrations.join('; ')}
  - Motivations: ${p.empathyData.motivations.join('; ')}
`).join('\n');
}

// Helper function to validate persona usage
function validatePersonaUsageInResponse(responseText, personas) {
    const personaNames = personas.map(p => p.name);
    const genericTerms = ['System Admin', 'User', 'Analyst', 'Developer', 'Tester', 'Admin', 'End User', 'System User'];
    
    let hasGenericTerms = false;
    genericTerms.forEach(term => {
        if (responseText.includes(term)) {
            console.warn(`⚠️  Generic term detected: "${term}". Should use specific persona names.`);
            hasGenericTerms = true;
        }
    });
    
    if (hasGenericTerms) {
        console.log(`✅ Valid persona names: ${personaNames.join(', ')}`);
    }
    
    return responseText;
}

// Helper function to extract used personas from response
function extractPersonasFromResponse(responseText) {
    const personas = [];
    const personaPattern = /As a ([^,]+),/gi;
    let match;
    
    while ((match = personaPattern.exec(responseText)) !== null) {
        const personaName = match[1].trim();
        if (!personas.includes(personaName)) {
            personas.push(personaName);
        }
    }
    
    return personas;
}

// Old system prompt (kept for reference)
const AGILE_SYSTEM_PROMPT = `
You are a Business Analyst converting a user requirement into Agile artifacts.
I will give you a user requirement, and you must output:

Epic – a high-level business objective.

Features – functional groupings that support the epic.

User Stories – detailed stories in the format:

As a [role], I want [capability], so that [business value].

Include Acceptance Criteria using Gherkin (Given / When / Then).

Make sure the output is structured as:

Epic

[Epic statement]

Features

Feature 1: [Feature statement]

Feature 2: [Feature statement]

…

User Stories (under each Feature)

Feature 1: [name]

User Story 1: [formatted story]

Acceptance Criteria:

Given … When … Then …

…

Feature 2: [name]

User Story 2: …

Acceptance Criteria: …

Keep language clear, actionable, and aligned to Agile best practices.
`;

// Generate Agile Artifacts endpoint with Persona Context
app.post('/generate-agile-artifacts', async (req, res) => {
    try {
        const { requirement } = req.body;
        
        if (!requirement) {
            return res.status(400).json({ error: "Requirement is required" });
        }

        // Load all personas from storage
        const allPersonas = await loadJsonData(PERSONAS_FILE);
        
        // Filter to get only relevant personas for this requirement
        const relevantPersonas = filterRelevantPersonas(requirement, allPersonas);
        
        console.log(`📊 Filtered ${relevantPersonas.length} relevant personas from ${allPersonas.length} total:`);
        relevantPersonas.forEach(p => console.log(`  - ${p.name} (${p.title})`));
        
        const personasContext = formatPersonasForPrompt(relevantPersonas);

        // Use enhanced system prompt with relevant persona context
        const systemPrompt = AGILE_SYSTEM_PROMPT_WITH_PERSONAS(personasContext, relevantPersonas.length);

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Convert this user requirement into Agile artifacts with persona-based user stories:\n\n${requirement}` }
        ];

        const response = await openai.chat.completions.create({
            model: AZURE_DEPLOYMENT,
            messages: messages,
            temperature: TEMPERATURE,
            max_tokens: 4096
        });

        const result = response.choices[0].message.content;
        
        // Validate and enhance the response
        const validatedResult = validatePersonaUsageInResponse(result, relevantPersonas);
        const personasUsed = extractPersonasFromResponse(validatedResult);
        
        // Store the generated agile artifacts in JSON
        const agileRecord = {
            requirement: requirement,
            agile_artifacts: validatedResult,
            personas_available: relevantPersonas.map(p => ({ id: p.id, name: p.name })),
            personas_used: personasUsed,
            type: "agile_artifacts"
        };
        
        const saved = await addRecord(AGILE_ARTIFACTS_FILE, agileRecord);
        
        if (saved) {
            return res.json({
                success: true,
                agile_artifacts: validatedResult,
                requirement: requirement,
                personas_available: relevantPersonas.map(p => p.name),
                personas_used: personasUsed,
                id: agileRecord.id,
                message: `Agile artifacts generated with ${relevantPersonas.length} relevant personas`
            });
        } else {
            return res.json({
                success: true,
                agile_artifacts: validatedResult,
                requirement: requirement,
                personas_available: relevantPersonas.map(p => p.name),
                personas_used: personasUsed,
                warning: "Agile artifacts generated but storage failed"
            });
        }
            
    } catch (error) {
        console.error('Error generating agile artifacts:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to generate agile artifacts: ${error.message}`
        });
    }
});

// GET endpoints to fetch stored data
app.get('/get-guidelines', async (req, res) => {
    try {
        const guidelines = await loadJsonData(GUIDELINES_FILE);
        return res.json({
            success: true,
            data: guidelines,
            count: guidelines.length
        });
    } catch (error) {
        console.error('Error fetching guidelines:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch guidelines: ${error.message}`
        });
    }
});

app.get('/get-guidelines/:id', async (req, res) => {
    try {
        const guidelineId = parseInt(req.params.id);
        const guidelines = await loadJsonData(GUIDELINES_FILE);
        const guideline = guidelines.find(g => g.id === guidelineId);
        
        if (guideline) {
            return res.json({
                success: true,
                data: guideline
            });
        } else {
            return res.status(404).json({
                success: false,
                error: "Guideline not found"
            });
        }
            
    } catch (error) {
        console.error('Error fetching guideline:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch guideline: ${error.message}`
        });
    }
});

app.get('/get-agile-artifacts', async (req, res) => {
    try {
        const artifacts = await loadJsonData(AGILE_ARTIFACTS_FILE);
        return res.json({
            success: true,
            data: artifacts,
            count: artifacts.length
        });
    } catch (error) {
        console.error('Error fetching agile artifacts:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch agile artifacts: ${error.message}`
        });
    }
});

app.get('/get-agile-artifacts/:id', async (req, res) => {
    try {
        const artifactId = parseInt(req.params.id);
        const artifacts = await loadJsonData(AGILE_ARTIFACTS_FILE);
        const artifact = artifacts.find(a => a.id === artifactId);
        
        if (artifact) {
            return res.json({
                success: true,
                data: artifact
            });
        } else {
            return res.status(404).json({
                success: false,
                error: "Agile artifact not found"
            });
        }
            
    } catch (error) {
        console.error('Error fetching agile artifact:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch agile artifact: ${error.message}`
        });
    }
});

// Backend Storage CRUD Operations

// GET all backend projects
app.get('/backend-projects', async (req, res) => {
    try {
        const projects = await loadJsonData(BACKEND_STORAGE_FILE);
        return res.json({
            success: true,
            data: projects,
            count: projects.length
        });
    } catch (error) {
        console.error('Error fetching backend projects:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch backend projects: ${error.message}`
        });
    }
});

// GET backend projects by project name
app.get('/backend-projects/project/:projectName', async (req, res) => {
    try {
        const projectName = req.params.projectName;
        const projects = await loadJsonData(BACKEND_STORAGE_FILE);
        const filteredProjects = projects.filter(p => p.projectName === projectName);
        
        return res.json({
            success: true,
            data: filteredProjects,
            count: filteredProjects.length,
            projectName: projectName
        });
    } catch (error) {
        console.error('Error fetching backend projects by name:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch backend projects: ${error.message}`
        });
    }
});

// GET most recent backend project
app.get('/backend-projects/recent', async (req, res) => {
    try {
        const projects = await loadJsonData(BACKEND_STORAGE_FILE);
        
        if (projects.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: "No backend projects found"
            });
        }
        
        // Sort by timestamp descending and get the most recent
        const sortedProjects = projects.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const mostRecent = sortedProjects[0];
        
        return res.json({
            success: true,
            data: mostRecent,
            timestamp: mostRecent.timestamp
        });
    } catch (error) {
        console.error('Error fetching recent backend project:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch recent backend project: ${error.message}`
        });
    }
});

// GET backend project by ID
app.get('/backend-projects/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        const projects = await loadJsonData(BACKEND_STORAGE_FILE);
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            return res.json({
                success: true,
                data: project
            });
        } else {
            return res.status(404).json({
                success: false,
                error: "Backend project not found"
            });
        }
            
    } catch (error) {
        console.error('Error fetching backend project:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch backend project: ${error.message}`
        });
    }
});

// POST new backend project
app.post('/backend-projects', async (req, res) => {
    try {
        const projectData = req.body;
        
        if (!projectData.projectName) {
            return res.status(400).json({ 
                success: false,
                error: "Project name is required" 
            });
        }
        
        // Generate unique ID if not provided
        if (!projectData.id) {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 10);
            projectData.id = `backend_${timestamp}_${randomSuffix}`;
        }
        
        // Add timestamp if not provided
        if (!projectData.timestamp) {
            projectData.timestamp = new Date().toISOString();
        }
        
        const projects = await loadJsonData(BACKEND_STORAGE_FILE);
        projects.push(projectData);
        
        const saved = await saveJsonData(BACKEND_STORAGE_FILE, projects);
        
        if (saved) {
            return res.json({
                success: true,
                data: projectData,
                message: "Backend project created successfully"
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "Failed to save backend project"
            });
        }
            
    } catch (error) {
        console.error('Error creating backend project:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to create backend project: ${error.message}`
        });
    }
});

// PUT update backend project
app.put('/backend-projects/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        const updateData = req.body;
        
        const projects = await loadJsonData(BACKEND_STORAGE_FILE);
        const projectIndex = projects.findIndex(p => p.id === projectId);
        
        if (projectIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Backend project not found"
            });
        }
        
        // Update the project data while preserving the ID and timestamp
        const updatedProject = {
            ...projects[projectIndex],
            ...updateData,
            id: projectId, // Ensure ID doesn't change
            timestamp: projects[projectIndex].timestamp // Preserve original timestamp
        };
        
        projects[projectIndex] = updatedProject;
        
        const saved = await saveJsonData(BACKEND_STORAGE_FILE, projects);
        
        if (saved) {
            return res.json({
                success: true,
                data: updatedProject,
                message: "Backend project updated successfully"
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "Failed to update backend project"
            });
        }
            
    } catch (error) {
        console.error('Error updating backend project:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to update backend project: ${error.message}`
        });
    }
});

// DELETE backend project
app.delete('/backend-projects/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        const projects = await loadJsonData(BACKEND_STORAGE_FILE);
        const projectIndex = projects.findIndex(p => p.id === projectId);
        
        if (projectIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Backend project not found"
            });
        }
        
        const deletedProject = projects.splice(projectIndex, 1)[0];
        
        const saved = await saveJsonData(BACKEND_STORAGE_FILE, projects);
        
        if (saved) {
            return res.json({
                success: true,
                data: deletedProject,
                message: "Backend project deleted successfully"
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "Failed to delete backend project"
            });
        }
            
    } catch (error) {
        console.error('Error deleting backend project:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to delete backend project: ${error.message}`
        });
    }
});

// ==================== PERSONA MANAGEMENT ENDPOINTS ====================

// GET all personas
app.get('/personas', async (req, res) => {
    try {
        const personas = await loadJsonData(PERSONAS_FILE);
        return res.json({
            success: true,
            data: personas,
            count: personas.length
        });
    } catch (error) {
        console.error('Error fetching personas:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch personas: ${error.message}`
        });
    }
});

// GET persona by ID
app.get('/personas/:id', async (req, res) => {
    try {
        const personaId = req.params.id;
        const personas = await loadJsonData(PERSONAS_FILE);
        const persona = personas.find(p => p.id === personaId);
        
        if (persona) {
            return res.json({
                success: true,
                data: persona
            });
        } else {
            return res.status(404).json({
                success: false,
                error: "Persona not found"
            });
        }
    } catch (error) {
        console.error('Error fetching persona:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch persona: ${error.message}`
        });
    }
});

// POST new persona (from empathy phase research)
app.post('/personas', async (req, res) => {
    try {
        const personaData = req.body;
        
        if (!personaData.name || !personaData.title) {
            return res.status(400).json({ 
                success: false,
                error: "Name and title are required" 
            });
        }
        
        // Generate ID from name if not provided
        if (!personaData.id) {
            personaData.id = personaData.name.toLowerCase().replace(/\s+/g, '-');
        }
        
        const personas = await loadJsonData(PERSONAS_FILE);
        
        // Check for duplicate
        if (personas.find(p => p.id === personaData.id)) {
            return res.status(409).json({
                success: false,
                error: "Persona with this ID already exists"
            });
        }
        
        personas.push({
            ...personaData,
            timestamp: new Date().toISOString()
        });
        
        const saved = await saveJsonData(PERSONAS_FILE, personas);
        
        if (saved) {
            return res.json({
                success: true,
                data: personaData,
                message: "Persona created successfully from empathy phase data"
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "Failed to save persona"
            });
        }
    } catch (error) {
        console.error('Error creating persona:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to create persona: ${error.message}`
        });
    }
});

// PUT update persona
app.put('/personas/:id', async (req, res) => {
    try {
        const personaId = req.params.id;
        const updateData = req.body;
        
        const personas = await loadJsonData(PERSONAS_FILE);
        const personaIndex = personas.findIndex(p => p.id === personaId);
        
        if (personaIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Persona not found"
            });
        }
        
        personas[personaIndex] = {
            ...personas[personaIndex],
            ...updateData,
            id: personaId,
            updatedAt: new Date().toISOString()
        };
        
        const saved = await saveJsonData(PERSONAS_FILE, personas);
        
        if (saved) {
            return res.json({
                success: true,
                data: personas[personaIndex],
                message: "Persona updated successfully"
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "Failed to update persona"
            });
        }
    } catch (error) {
        console.error('Error updating persona:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to update persona: ${error.message}`
        });
    }
});

// DELETE persona
app.delete('/personas/:id', async (req, res) => {
    try {
        const personaId = req.params.id;
        
        const personas = await loadJsonData(PERSONAS_FILE);
        const personaIndex = personas.findIndex(p => p.id === personaId);
        
        if (personaIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Persona not found"
            });
        }
        
        const deletedPersona = personas.splice(personaIndex, 1)[0];
        const saved = await saveJsonData(PERSONAS_FILE, personas);
        
        if (saved) {
            return res.json({
                success: true,
                data: deletedPersona,
                message: "Persona deleted successfully"
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "Failed to delete persona"
            });
        }
    } catch (error) {
        console.error('Error deleting persona:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to delete persona: ${error.message}`
        });
    }
});

// GET persona usage statistics
app.get('/personas/stats/usage', async (req, res) => {
    try {
        const personas = await loadJsonData(PERSONAS_FILE);
        const artifacts = await loadJsonData(AGILE_ARTIFACTS_FILE);
        
        // Count usage of each persona
        const personaUsage = {};
        personas.forEach(p => {
            personaUsage[p.name] = 0;
        });
        
        artifacts.forEach(artifact => {
            if (artifact.personas_used) {
                artifact.personas_used.forEach(name => {
                    if (personaUsage.hasOwnProperty(name)) {
                        personaUsage[name]++;
                    }
                });
            }
        });
        
        return res.json({
            success: true,
            data: {
                totalPersonas: personas.length,
                totalArtifacts: artifacts.length,
                personaUsage: personaUsage,
                mostUsedPersona: Object.keys(personaUsage).reduce((a, b) => personaUsage[a] > personaUsage[b] ? a : b, '')
            }
        });
    } catch (error) {
        console.error('Error fetching persona stats:', error);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch persona stats: ${error.message}`
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
