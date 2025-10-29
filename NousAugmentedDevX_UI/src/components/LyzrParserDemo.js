import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Code, Eye, FileJson } from 'lucide-react';

// Import test examples
const testExamples = {
  question: {
    "question": "Would you like Frontend, Backend, or Both?",
    "action_required": {
      "response": ""
    },
    "note": "Reply 'Frontend', 'Backend', or 'Both'."
  },
  confirmation: {
    "confirmation": "All required details have been collected. Shall I generate the full project context now?",
    "expected_response": "yes / generate / proceed"
  },
  projectContext: {
    "project_context": {
      "project_name": "Personal Finance Tracking App Frontend Dashboard",
      "overview": "This document outlines the context for a responsive web dashboard, designed as the frontend for a personal finance tracking application. The primary goal is to provide a clean, interactive interface for visualizing spending data, managing budgets, and tracking savings goals.",
      "tech_stack_and_justification": "The frontend will be built using React with TypeScript, leveraging Vite for a fast development setup. Redux Toolkit will be employed for robust state management, ensuring predictable and scalable data flow. TailwindCSS is chosen for utility-first styling, enabling rapid UI development and responsive design. Chart.js will be integrated for dynamic and interactive data visualization.",
      "architecture_design": "The frontend architecture will adhere to a modular, component-based structure, following atomic design principles to ensure reusability, consistency, and maintainability across the dashboard. React Router will manage client-side navigation, facilitating a seamless single-page application experience.",
      "module_component_breakdown": "Based on the project's core features and the preference for modularity, the frontend will be broken down into key modules and components:\n\n*   **Dashboard Module:** Contains the main overview components like summary cards, quick access to reports, and a central navigation hub.\n*   **Spending Visualization Module:** Houses interactive category-based spending graphs, trend charts, and detailed transaction views.",
      "data_flow_and_interactions": "The frontend will manage data flow primarily through Redux Toolkit for centralized state management. Data will be fetched from a backend API, with interactions mirroring patterns described in the user journey.",
      "api_db_integrations": "While this project focuses on the frontend, it assumes interaction with a comprehensive backend API. The frontend will interact with endpoints such as `POST /api/auth/register` for user sign-up and `POST /api/auth/login` for user authentication, expecting a JWT token in response.",
      "security_and_performance": "The frontend will adhere to best practices for security and performance, including:\n\n*   **Security:** JWT tokens received from the backend will be stored securely, ideally in HTTP-only, secure cookies.\n*   **Performance:** React's `lazy` and `Suspense` will be used for route-based and component-based code splitting to reduce the initial bundle size and improve load times.",
      "development_best_practices": "Development will follow established best practices to ensure code quality, maintainability, and efficient collaboration:\n\n*   **Component-Based Development:** Adherence to Atomic Design principles\n*   **TypeScript:** Strict typing with TypeScript\n*   **State Management:** Redux Toolkit",
      "scalability_and_reliability": "For an MVP frontend, scalability and reliability primarily focus on efficient resource utilization, robust client-side performance, and fault tolerance in handling user interactions and API responses.",
      "implementation_roadmap_and_milestones": "The project will follow an MVP-first approach, focusing on delivering core value and high-quality user experience for the personal finance dashboard.\n\n*   **Phase 1:** Core Dashboard & Basic Visualization (MVP)\n*   **Phase 2:** Budgeting & Savings Goals\n*   **Phase 3:** Refinement & Integration",
      "appendix_and_examples": "This section contains detailed examples, API payloads, and reference documentation for the development team.",
      "conclusion": "This document provides a comprehensive technical context for the Frontend development of a personal finance tracking app dashboard, emphasizing its modern tech stack, modular architecture, and core features."
    }
  }
};

// Inline parser functions (simplified versions for demo)
const parseLyzrResponse = (jsonObj) => {
  if (!jsonObj || typeof jsonObj !== 'object') return null;
  
  // 1. Question format
  if (jsonObj.question) {
    const lines = [];
    lines.push(`### 📝 ${jsonObj.question}`);
    lines.push('');
    if (jsonObj.note) {
      lines.push(`> 💡 **Note:** ${jsonObj.note}`);
      lines.push('');
    }
    if (jsonObj.action_required) {
      lines.push('---');
      lines.push('');
      lines.push('**⏳ Awaiting your response...**');
    }
    return lines.join('\n');
  }
  
  // 2. Confirmation format
  if (jsonObj.confirmation) {
    const lines = [];
    lines.push(`## ✅ ${jsonObj.confirmation}`);
    lines.push('');
    if (jsonObj.expected_response) {
      lines.push(`> 🎯 **Expected:** ${jsonObj.expected_response}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
    lines.push('**Ready to proceed!** 🚀');
    return lines.join('\n');
  }
  
  // 3. Project context format
  if (jsonObj.project_context) {
    const pc = jsonObj.project_context;
    const lines = [];
    
    const name = pc.project_name || 'Project Context';
    lines.push(`# 🎯 ${name}`);
    lines.push('');
  // Removed completion message
    lines.push('');
    lines.push('---');
    lines.push('');
    
    if (pc.overview) {
      lines.push('## 📋 Overview');
      lines.push('');
      lines.push(pc.overview);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
    
    if (pc.tech_stack_and_justification) {
      lines.push('## 🛠️ Tech Stack & Justification');
      lines.push('');
      lines.push(pc.tech_stack_and_justification);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
    
    if (pc.architecture_design) {
      lines.push('## 🏗️ Architecture Design');
      lines.push('');
      lines.push(pc.architecture_design);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
    
    if (pc.module_component_breakdown) {
      lines.push('## 🧩 Module & Component Breakdown');
      lines.push('');
      lines.push(pc.module_component_breakdown);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
    
    if (pc.conclusion) {
      lines.push('## 🎊 Conclusion');
      lines.push('');
      lines.push(pc.conclusion);
      lines.push('');
    }
    
    return lines.join('\n');
  }
  
  return null;
};

function LyzrParserDemo() {
  const [selectedExample, setSelectedExample] = useState('question');
  const [showJson, setShowJson] = useState(true);
  const [showRendered, setShowRendered] = useState(true);

  const examples = {
    question: testExamples.question,
    confirmation: testExamples.confirmation,
    projectContext: testExamples.projectContext
  };

  const currentExample = examples[selectedExample];
  const parsedMarkdown = parseLyzrResponse(currentExample);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Lyzr Response Parser Demo
              </h1>
              <p className="text-gray-600">
                See how JSON responses are transformed into beautiful markdown
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowJson(!showJson)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  showJson
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FileJson className="w-5 h-5 inline mr-2" />
                JSON
              </button>
              <button
                onClick={() => setShowRendered(!showRendered)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  showRendered
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Eye className="w-5 h-5 inline mr-2" />
                Rendered
              </button>
            </div>
          </div>
        </div>

        {/* Example Selector */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Select Response Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedExample('question')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedExample === 'question'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Question Format
              </h3>
              <p className="text-sm text-gray-600">
                Standard question with note and action required
              </p>
            </button>

            <button
              onClick={() => setSelectedExample('confirmation')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedExample === 'confirmation'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirmation Format
              </h3>
              <p className="text-sm text-gray-600">
                Confirmation message with expected response
              </p>
            </button>

            <button
              onClick={() => setSelectedExample('projectContext')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedExample === 'projectContext'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Project Context
              </h3>
              <p className="text-sm text-gray-600">
                Comprehensive project documentation
              </p>
            </button>
          </div>
        </div>

        {/* Display Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON Input */}
          {showJson && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <div className="flex items-center space-x-2">
                  <FileJson className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-bold text-white">
                    JSON Input
                  </h3>
                </div>
              </div>
              <div className="p-4 bg-gray-900 overflow-auto max-h-[600px]">
                <pre className="text-sm text-green-400 font-mono">
                  {JSON.stringify(currentExample, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Rendered Output */}
          {showRendered && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-bold text-white">
                    Rendered Output
                  </h3>
                </div>
              </div>
              <div className="p-6 overflow-auto max-h-[600px]">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-3">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-6">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-medium text-gray-700 mb-2 mt-4">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-3 space-y-1">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-600">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 mb-3 bg-blue-50 py-2">
                          {children}
                        </blockquote>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-800">
                          {children}
                        </strong>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600">
                          {children}
                        </code>
                      ),
                      hr: () => (
                        <hr className="my-4 border-gray-200" />
                      )
                    }}
                  >
                    {parsedMarkdown}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Markdown Source */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-6">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white">
                Generated Markdown
              </h3>
            </div>
          </div>
          <div className="p-4 bg-gray-50 overflow-auto max-h-[400px]">
            <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
              {parsedMarkdown}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Parse JSON
                </h4>
                <p className="text-sm text-gray-600">
                  Detect and parse the JSON response from Lyzr API
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Convert to Markdown
                </h4>
                <p className="text-sm text-gray-600">
                  Transform JSON into beautiful markdown with icons
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Render in Chat
                </h4>
                <p className="text-sm text-gray-600">
                  Display as rich formatted text in the chat interface
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LyzrParserDemo;

