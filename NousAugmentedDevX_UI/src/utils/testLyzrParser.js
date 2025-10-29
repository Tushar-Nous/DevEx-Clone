// Test file to demonstrate Lyzr response parsing

// Example 1: Question format
const exampleQuestion = {
  "question": "Would you like Frontend, Backend, or Both?",
  "action_required": {
    "response": ""
  },
  "note": "Reply 'Frontend', 'Backend', or 'Both'."
};

// Example 2: Confirmation format
const exampleConfirmation = {
  "confirmation": "All required details have been collected. Shall I generate the full project context now?",
  "expected_response": "yes / generate / proceed"
};

// Example 3: Project Context format (abbreviated)
const exampleProjectContext = {
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
};

// Test the parsing by converting to JSON string (simulating API response)
console.log('=== Example 1: Question Format ===');
console.log(JSON.stringify(exampleQuestion, null, 2));
console.log('\n');

console.log('=== Example 2: Confirmation Format ===');
console.log(JSON.stringify(exampleConfirmation, null, 2));
console.log('\n');

console.log('=== Example 3: Project Context Format (abbreviated) ===');
console.log(JSON.stringify(exampleProjectContext, null, 2));

// Export for use in other files
export const testExamples = {
  question: exampleQuestion,
  confirmation: exampleConfirmation,
  projectContext: exampleProjectContext
};

