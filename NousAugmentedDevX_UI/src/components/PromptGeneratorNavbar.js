import React, { useState } from 'react';
import { 
  MessageSquare, 
  Download, 
  Copy, 
  Sparkles,
  Figma,
  Palette,
  Layout,
  Type,
  Accessibility,
  Smartphone,
  Zap,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateRequirementSummary } from '../utils/aiService';
import ReactMarkdown from 'react-markdown';

const PromptGeneratorNavbar = () => {
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [promptHistory, setPromptHistory] = useState([]);

  // Enterprise Application Design Guidelines Template
  const figmaTemplate = `# Enterprise Application Design Guidelines for Figma Make

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

---`;

  const generateFigmaPrompt = async () => {
    if (!promptInput.trim()) {
      toast.error('Please enter your design requirements');
      return;
    }

    setIsGenerating(true);
    
    console.log('=== FIGMA PROMPT GENERATION START ===');
    console.log('User Input:', promptInput);
    console.log('Template Length:', figmaTemplate.length);
    
    try {
      // Create a comprehensive prompt for OpenAI
      const fullPrompt = `Based on the following user requirements and the Enterprise Application Design Guidelines template, generate a comprehensive Figma design prompt:

User Requirements: ${promptInput}

Template to Follow: ${figmaTemplate}

Generate a detailed, actionable prompt that:
1. Follows the exact template structure provided
2. Is specifically tailored to the user's requirements
3. Includes practical, implementable design specifications
4. Addresses accessibility, responsive design, and performance
5. Provides clear component specifications and guidelines
6. Includes quality assurance checklists
7. Is ready for use in Figma design tools

The response should be a complete, formatted markdown document following the Enterprise Application Design Guidelines template structure.

Format your response as JSON:
{
  "title": "string",
  "content": "string (complete markdown content)",
  "category": "Design",
  "tags": ["tag1", "tag2", "tag3"],
  "estimatedEffort": "string",
  "priority": "high|medium|low",
  "figmaReady": true
}`;

      console.log('Sending comprehensive prompt to OpenAI...');
      const aiResponse = await generateRequirementSummary(fullPrompt, 'Figma Design Prompt');
      
      console.log('=== OPENAI FIGMA PROMPT RESPONSE ===');
      console.log('Full AI Response:', aiResponse);
      console.log('AI Response Title:', aiResponse.title);
      console.log('AI Response Description:', aiResponse.description);
      console.log('AI Response Tags:', aiResponse.tags);
      console.log('AI Response Priority:', aiResponse.priority);
      console.log('=== END OPENAI FIGMA PROMPT ===');

      // Create the final Figma prompt object
      const figmaPrompt = {
        id: Date.now(),
        title: aiResponse.title || `Figma Design Guidelines for ${promptInput.substring(0, 50)}...`,
        content: aiResponse.description || figmaTemplate,
        category: 'Design',
        tags: aiResponse.tags || ['figma', 'design', 'enterprise'],
        estimatedEffort: '2-4 days',
        priority: aiResponse.priority || 'medium',
        figmaReady: true,
        userInput: promptInput,
        createdAt: new Date().toISOString()
      };

      console.log('=== FINAL FIGMA PROMPT OBJECT ===');
      console.log('Figma Prompt Object:', figmaPrompt);
      console.log('=== END FINAL FIGMA PROMPT ===');

      setGeneratedPrompt(figmaPrompt);
      
      // Add to history
      setPromptHistory(prev => [figmaPrompt, ...prev.slice(0, 9)]);
      
      toast.success('Figma design prompt generated successfully!');
    } catch (error) {
      toast.error('Failed to generate Figma prompt');
    } finally {
      setIsGenerating(false);
      console.log('=== FIGMA PROMPT GENERATION COMPLETE ===');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadPrompt = (prompt) => {
    const content = prompt.content;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_figma_guidelines.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Figma prompt downloaded successfully');
  };

  const clearPrompt = () => {
    setGeneratedPrompt(null);
    setPromptInput('');
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-lg">
              <Figma className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Figma Prompt Generator</h1>
              <p className="text-xs text-blue-100">AI-Powered Design Guidelines</p>
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Design System</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Components</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Typography</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Accessibility className="w-4 h-4" />
              <span className="hidden sm:inline">Accessibility</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Responsive</span>
            </div>
          </div>
        </div>

        {/* Prompt Generation Section */}
        <div className="py-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <h2 className="text-lg font-semibold">Generate Figma Design Guidelines</h2>
            </div>
            
            <div className="space-y-4">
              {/* Input Section */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe your design requirements (e.g., 'Create a modern insurance dashboard with dark theme')"
                  className="flex-1 px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  disabled={isGenerating}
                />
                <button
                  onClick={generateFigmaPrompt}
                  disabled={isGenerating || !promptInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Generate Prompt</span>
                    </>
                  )}
                </button>
              </div>

              {/* Template Preview */}
              <div className="bg-white bg-opacity-5 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-blue-100">Using Enterprise Design Guidelines Template</span>
                </div>
                <p className="text-xs text-blue-200">
                  Template includes: Design System, Typography, Layout, Components, Accessibility, Responsive Design, and Quality Assurance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Prompt Display */}
        {generatedPrompt && (
          <div className="pb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold">{generatedPrompt.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(generatedPrompt.content)}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => downloadPrompt(generatedPrompt)}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={clearPrompt}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Prompt Metadata */}
              <div className="flex items-center space-x-4 mb-4 text-sm">
                <span className="px-2 py-1 bg-blue-500 rounded-full">{generatedPrompt.category}</span>
                <span className="px-2 py-1 bg-green-500 rounded-full">Effort: {generatedPrompt.estimatedEffort}</span>
 <span className={`px-2 py-1 rounded-full ${
   generatedPrompt.priority === 'high' ? 'bg-red-500' :
   generatedPrompt.priority === 'medium' ? 'bg-yellow-500' :
   'bg-green-500'
 }`}>
   {generatedPrompt.priority.charAt(0).toUpperCase() + generatedPrompt.priority.slice(1)} Priority
 </span>
                <span className="px-2 py-1 bg-purple-500 rounded-full">Figma Ready</span>
              </div>

              {/* Prompt Content */}
              <div className="bg-white bg-opacity-5 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{generatedPrompt.content}</ReactMarkdown>
                </div>
              </div>

              {/* User Input Reference */}
              <div className="mt-4 p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                <p className="text-sm text-blue-100">
                  <strong>Based on:</strong> {generatedPrompt.userInput}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Prompt History */}
        {promptHistory.length > 0 && (
          <div className="pb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Recent Prompts</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promptHistory.map((prompt) => (
                  <div key={prompt.id} className="bg-white bg-opacity-5 rounded-lg p-4 hover:bg-opacity-10 transition-colors">
                    <h4 className="font-medium text-sm mb-2 line-clamp-2">{prompt.title}</h4>
                    <p className="text-xs text-blue-200 mb-3 line-clamp-2">{prompt.userInput}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-300">{new Date(prompt.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => setGeneratedPrompt(prompt)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptGeneratorNavbar;
