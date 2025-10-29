// Lyzr Context Agent - Simple API Client
// This module handles communication with Lyzr API and response parsing

export const TEMPERATURE = 0.0; // kept for interface compatibility

// Lyzr API Configuration
const LYZR_API_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
const LYZR_API_KEY = 'sk-default-c9pyqTsp5TphNSQlIr4Ts14n9j1gKihU';
const LYZR_AGENT_ID = '68e7c1e496a574cbc5dca6af';
const LYZR_USER_ID = 'nous@lyzr.ai';

let LYZR_SESSION_ID = null;

function ensureSessionId() {
  if (!LYZR_SESSION_ID) {
    LYZR_SESSION_ID = `${LYZR_AGENT_ID}-${Math.random().toString(36).slice(2, 12)}`;
  }
  return LYZR_SESSION_ID;
}

function trimMemoryContext(pairs) {
  const copy = Array.isArray(pairs) ? [...pairs] : [];
  const MAX = 10;
  if (copy.length > MAX) return copy.slice(copy.length - MAX);
  return copy;
}

async function callLyzr(message) {
  try {
    const res = await fetch(LYZR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LYZR_API_KEY
      },
      body: JSON.stringify({
        user_id: LYZR_USER_ID,
        agent_id: LYZR_AGENT_ID,
        session_id: ensureSessionId(),
        message: message || ''
      })
    });
    
    if (!res.ok) {
      throw new Error(`${res.status} ${await res.text()}`);
    }
    
    const data = await res.json();
    
    // Normalize responses: prefer plain string; if JSON with {response}, extract it
    let text = '';
    const normalize = (s) => {
      if (typeof s !== 'string') return '';
      let t = s.trim();
      // unwrap surrounding quotes if present
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        t = t.slice(1, -1);
      }
      // if still JSON-like, parse and extract
      if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
        try {
          const parsed = JSON.parse(t);
          if (typeof parsed === 'string') return parsed;
          // If payload is a structured object (not a wrapper with response/message),
          // return the original pretty JSON string so the renderer can parse it later.
          if (parsed && typeof parsed === 'object' && !parsed.response && !parsed.message) {
            return JSON.stringify(parsed);
          }
          return parsed?.response || parsed?.message || '';
        } catch (_) {
          return t;
        }
      }
      return t;
    };

    if (typeof data === 'string') {
      text = normalize(data);
    } else if (data && typeof data === 'object') {
      let candidate = data.response || data.message || '';
      
      // Handle nested JSON response structure
      if (typeof candidate === 'string') {
        try {
          // Try to parse the nested JSON
          const parsed = JSON.parse(candidate);
          if (parsed && typeof parsed === 'object') {
            // Extract the actual response from nested structure
            candidate = parsed.response || parsed.message || candidate;
          }
        } catch (e) {
          // If parsing fails, use the original candidate
          console.log('Failed to parse nested JSON:', e);
        }
      }
      
      text = normalize(candidate);
    }
    
    return (text || '').trim();
  } catch (e) {
    console.error('Lyzr API Error:', e);
    return '';
  }
}

// Parse and beautify Lyzr agent JSON responses
const parseLyzrResponse = (text) => {
  if (!text) return null;
  const str = String(text).trim();
  
  // Try to parse as JSON
  let parsed = null;
  try {
    // Handle JSON code blocks
    const match = str.match(/```json\n([\s\S]*?)\n```/i);
    if (match) {
      parsed = JSON.parse(match[1]);
    } else if (str.startsWith('{') && str.endsWith('}')) {
      // Try to fix common JSON issues before parsing
      let fixedStr = str;
      // Fix missing commas between properties (common issue from LLM responses)
      fixedStr = fixedStr.replace(/"\s*\n\s*"/g, '",\n"');
      // Fix closing braces without commas
      fixedStr = fixedStr.replace(/"\s*}\s*"/g, '"},\n"');
      
      try {
        parsed = JSON.parse(fixedStr);
      } catch (e2) {
        // If fixed version fails, try original
        parsed = JSON.parse(str);
      }
    }
  } catch (e) {
    // Last resort: check if it's a completion message
    if (str.includes('Project Context Complete') || str.includes('project context has been successfully generated')) {
      return null; // Don't show completion message
    }
    return null;
  }
  
  if (!parsed || typeof parsed !== 'object') return null;
  
  // Handle different Lyzr response types
  
  // 1. Question format
  if (parsed.question) {
    const lines = [];
    lines.push(`### 📝 ${parsed.question}`);
    lines.push('');
    if (parsed.note) {
      lines.push(`> 💡 **Note:** ${parsed.note}`);
      lines.push('');
    }
    if (parsed.action_required) {
      lines.push('---');
      lines.push('');
      lines.push('**⏳ Awaiting your response...**');
    }
    return lines.join('\n');
  }
  
  // 2. Confirmation format
  if (parsed.confirmation) {
    const lines = [];
    lines.push(`## ✅ ${parsed.confirmation}`);
    lines.push('');
    if (parsed.expected_response) {
      lines.push(`> 🎯 **Expected:** ${parsed.expected_response}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
    lines.push('**Ready to proceed!** 🚀');
    return lines.join('\n');
  }
  
  // 3. Project context format (comprehensive)
  if (parsed.project_context) {
    return renderProjectContext(parsed.project_context);
  }
  
  return null;
};

// Helper function to clean and format text content
const cleanText = (text) => {
  if (!text) return '';
  
  let cleaned = String(text)
    // Remove extra quotes and formatting artifacts
    .replace(/^["'\s]+|["'\s]+$/g, '')
    // Remove trailing commas, colons, and quotes
    .replace(/[,:;]\s*$/g, '')
    // Fix line breaks - preserve paragraphs
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
  
  // Clean up bullet point formatting
  cleaned = cleaned
    // Convert *** to section headers
    .replace(/\*\*\*\s+([^:]+):/g, '\n\n### $1\n')
    // Convert ** to bold markers
    .replace(/\*\*\s+([^:]+):/g, '\n\n**$1:**')
    // Clean up standalone bullets
    .replace(/^\*\*\*\s+/gm, '- ')
    .replace(/^\*\*\s+/gm, '  - ');
  
  // Format list items properly
  cleaned = cleaned
    // Add proper spacing for sections
    .replace(/\n(###\s)/g, '\n\n$1')
    .replace(/(###[^\n]+)\n/g, '$1\n\n')
    // Clean up multiple spaces
    .replace(/\s{2,}(?!\n)/g, ' ')
    .trim();
  
  return cleaned;
};

// Render comprehensive project context
const renderProjectContext = (pc) => {
  if (!pc || typeof pc !== 'object') return null;

  const lines = [];
  
  // Header
  const name = cleanText(pc.project_name) || 'Project Context';
  lines.push(`# 🎯 ${name}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Overview
  if (pc.overview) {
    lines.push('## 📋 Overview');
    lines.push('');
    lines.push(cleanText(pc.overview));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Tech Stack
  if (pc.tech_stack_and_justification) {
    lines.push('## 🛠️ Tech Stack & Justification');
    lines.push('');
    lines.push(cleanText(pc.tech_stack_and_justification));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Architecture Design
  if (pc.architecture_design) {
    lines.push('## 🏗️ Architecture Design');
    lines.push('');
    lines.push(cleanText(pc.architecture_design));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Module & Component Breakdown
  if (pc.module_component_breakdown) {
    lines.push('## 🧩 Module & Component Breakdown');
    lines.push('');
    lines.push(cleanText(pc.module_component_breakdown));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Data Flow & Interactions
  if (pc.data_flow_and_interactions) {
    lines.push('## 🔄 Data Flow & Interactions');
    lines.push('');
    lines.push(cleanText(pc.data_flow_and_interactions));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // API & DB Integrations
  if (pc.api_db_integrations) {
    lines.push('## 🔌 API & Database Integrations');
    lines.push('');
    lines.push(cleanText(pc.api_db_integrations));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Security & Performance
  if (pc.security_and_performance) {
    lines.push('## 🔒 Security & Performance');
    lines.push('');
    lines.push(cleanText(pc.security_and_performance));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Development Best Practices
  if (pc.development_best_practices) {
    lines.push('## ✨ Development Best Practices');
    lines.push('');
    lines.push(cleanText(pc.development_best_practices));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Scalability & Reliability
  if (pc.scalability_and_reliability) {
    lines.push('## 📈 Scalability & Reliability');
    lines.push('');
    lines.push(cleanText(pc.scalability_and_reliability));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Implementation Roadmap
  if (pc.implementation_roadmap_and_milestones) {
    lines.push('## 🗺️ Implementation Roadmap & Milestones');
    lines.push('');
    lines.push(cleanText(pc.implementation_roadmap_and_milestones));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Appendix & Examples
  if (pc.appendix_and_examples) {
    lines.push('## 📎 Appendix & Examples');
    lines.push('');
    lines.push(cleanText(pc.appendix_and_examples));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Conclusion
  if (pc.conclusion) {
    lines.push('## 🎊 Conclusion');
    lines.push('');
    lines.push(cleanText(pc.conclusion));
    lines.push('');
  }
  
  return lines.join('\n');
};

// Legacy function for backward compatibility
const renderFromJsonBlock = (text) => {
  // First try the new parser
  const newRender = parseLyzrResponse(text);
  if (newRender) return newRender;
  
  // Fall back to old logic for project context
  if (!text) return null;
  const str = String(text);
  let jsonPayload = null;
  const match = str.match(/```json\n([\s\S]*?)\n```/i);
  if (match) {
    jsonPayload = match[1];
  } else if (str.trim().startsWith('{') && str.trim().endsWith('}')) {
    jsonPayload = str.trim();
  }
  if (!jsonPayload) return null;
  
  try {
    const parsed = JSON.parse(jsonPayload);
    const pc = parsed?.projectContext || parsed;
    if (!pc || typeof pc !== 'object') return null;

    const lines = [];
    const name = pc.projectName || 'Project';
    lines.push(`# ${name}`);
    lines.push('');
    const overview = pc.overview || {};
    if (overview.scope) {
      lines.push(`*${overview.scope.trim()}*`);
    }
    lines.push('', '---', '', '## 🚀 Project Overview');
    if (overview.scope) {
      lines.push('', '**Scope**', '', overview.scope.trim(), '');
    }
    if (overview.goals) {
      lines.push('**Goals**', '');
      const goalsArr = Array.isArray(overview.goals) ? overview.goals : [overview.goals];
      for (const g of goalsArr) lines.push(`* ${String(g).trim()}`);
      lines.push('', '---');
    }

    const tech = pc.techStack || {};
    lines.push('', '## 🧰 Tech Stack', '');
    if (tech.frontend || tech.justification) {
      if (tech.frontend) lines.push(`* **Frontend:** ${tech.frontend}`);
      if (tech.justification) lines.push(`* **Justification:** ${tech.justification}`);
    }
    lines.push('', '---', '', '## 🏛 Architecture Design (High-level)', '');
    const arch = pc.architectureDesign || {};
    if (arch.highLevelDiagrams) lines.push('**Component-based architecture**', '', arch.highLevelDiagrams, '');
    if (arch.communicationPatterns) {
      lines.push('**Communication patterns**', '');
      lines.push(`* ${arch.communicationPatterns}`);
    }
    if (arch.deploymentModel) {
      lines.push('', '**Deployment model**', '', `* ${arch.deploymentModel}`);
    }
    if (arch.componentBoundaries) {
      lines.push('', '**Component boundaries**', '', arch.componentBoundaries, '');
    }
    lines.push('', '---', '', '## 🧩 Module & Component Breakdown', '');
    const modules = pc.moduleComponentBreakdown || {};
    for (const [modName, mod] of Object.entries(modules)) {
      lines.push('', `### ${toTitleCase(modName)}`);
      if (mod.roles) lines.push('', `**Roles:** ${Array.isArray(mod.roles) ? mod.roles.join(', ') : mod.roles}`);
      if (mod.responsibilities) lines.push('', `**Responsibilities:** ${mod.responsibilities}`);
      if (mod.inputs) lines.push('', `**Inputs:** ${formatArray(mod.inputs)}`);
      if (mod.outputs) lines.push('', `**Outputs:** ${formatArray(mod.outputs)}`);
      lines.push('', '---');
    }

    lines.push('', '## 🔁 Data Flow & Interactions', '');
    const flow = pc.dataFlowAndInteractions || {};
    if (flow.endToEndUserFlows) {
      lines.push('**End-to-end user flow (example):**', '', flow.endToEndUserFlows, '');
    }
    if (flow.sequenceOfCalls) {
      lines.push('**Sequence of calls (typical):**', '', `* ${flow.sequenceOfCalls}`);
    }
    if (flow.errorHandling) {
      lines.push('', '**Error handling:**', '', `* ${flow.errorHandling}`);
    }

    lines.push('', '---', '', '## 🔗 API & DB Integration Points', '');
    const api = pc.apiDBIntegrationPoints || {};
    const auth = api.authentication || {};
    if (auth.endpoints) {
      lines.push('**Authentication**', '', `* Endpoints: ${formatArray(auth.endpoints)}`);
      if (auth.payloadExample) {
        lines.push('* Payload example:', '', '```json', auth.payloadExample, '```');
      }
    }

    const cm = api.courseManagement || {};
    if (cm.endpoints || cm.databaseSchema) {
      lines.push('', '**Course Management (schema)**');
      if (cm.endpoints) lines.push('', `* Endpoints: ${formatArray(cm.endpoints)}`);
      const dbs = cm.databaseSchema || {};
      const courses = dbs.courses?.fields;
      const enrolls = dbs.enrollments?.fields;
      if (courses || enrolls) {
        lines.push('* Sample DB tables:', '', '  * courses(' + (courses || []).join(', ') + ')');
        if (enrolls) lines.push('  * enrollments(' + enrolls.join(', ') + ')');
      }
    }

    lines.push('', '---', '', '## 🔒 Security & Performance', '');
    const sec = pc.securityAndPerformance || {};
    if (sec.threatModel) lines.push('**Threat model**', '', `* ${sec.threatModel}`);
    if (sec.authAuthorization) lines.push('', '**Auth & Authorization**', '', `* ${sec.authAuthorization}`);
    if (sec.caching) lines.push('', '**Caching**', '', `* ${sec.caching}`);

    lines.push('', '---', '', '## 🛠 Development Best Practices', '');
    const dev = pc.developmentBestPractices || {};
    if (dev.testing) lines.push(`* **Testing:** ${dev.testing}`);
    if (dev.ciCd) lines.push(`* **CI/CD:** ${dev.ciCd}`);
    if (dev.linting) lines.push(`* **Linting:** ${dev.linting}`);

    lines.push('', '---', '', '## 📈 Scalability & Reliability', '');
    const scal = pc.scalabilityReliability || {};
    if (scal.autoscalingStrategy) lines.push(`* **Autoscaling:** ${scal.autoscalingStrategy}`);
    if (scal.capacityPlanning) lines.push(`* **Capacity planning:** ${scal.capacityPlanning}`);

    lines.push('', '---', '', '## 🗺 Implementation Roadmap', '');
    const road = pc.implementationRoadmap || {};
    if (road.mvp) { lines.push('**MVP**', '', `* ${road.mvp}`, ''); }
    if (road.v1) { lines.push('**v1**', '', `* ${road.v1}`, ''); }
    if (road.scale) { lines.push('**Scale**', '', `* ${road.scale}`, ''); }

    lines.push('', '---', '', '## 📎 Appendix — Examples & Models', '');
    const apx = pc.appendixExamples || {};
    const models = apx.sampleDataModels || {};
    const u = models.user?.fields;
    const c = models.course?.fields;
    if (u || c) {
      lines.push('**Sample data models**', '');
      if (u) lines.push(`* user: ${u.join(', ')}`);
      if (c) lines.push(`* course: ${c.join(', ')}`);
    }
    const payloads = apx.sampleApiPayloads || {};
    if (payloads.userRegistration) {
      lines.push('', '**Sample API payload (user registration)**', '', '```json', payloads.userRegistration, '```');
    }

    const concl = pc.conclusion || {};
    lines.push('', '---', '', '## ✅ Conclusion & Next Steps', '', '**Summary**');
    if (concl.summary) lines.push('', concl.summary);
    if (Array.isArray(concl.recommendedNextSteps)) {
      lines.push('', '**Recommended next steps**');
      let idx = 1; for (const step of concl.recommendedNextSteps) { lines.push(`${idx}. ${step}`); idx++; }
    }
    lines.push('', '---');
    return lines.join('\n');
  } catch { return null; }
};

function toTitleCase(s) { return String(s || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function formatArray(a) { return Array.isArray(a) ? a.join(', ') : String(a || ''); }

// Beautify helper: convert "Key: value, value" lines into Markdown list
const beautify = (text) => {
  const t = String(text || '').trim();
  if (!t) return t;
  const lines = t.split(/\r?\n/);
  if (lines.length < 2) return t; // nothing to beautify
  const parts = [];
  let header = null;
  // If the first line looks like a sentence, keep it as a bold lead
  if (lines[0].toLowerCase().includes('i have all inputs')) {
    header = '**I have all inputs**';
  }
  if (header) parts.push(header, '');
  for (let i = 1; i < lines.length; i++) {
    const m = lines[i].match(/^\s*([^:]+):\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      const val = m[2].trim();
      if (!val) { parts.push(`- **${key}**`); continue; }
      // Split values by comma for sub-bullets when appropriate
      if (val.includes(',') && val.length < 500) {
        const items = val.split(',').map(s => s.trim()).filter(Boolean);
        parts.push(`- **${key}**:`);
        for (const it of items) parts.push(`  - ${it}`);
      } else {
        parts.push(`- **${key}**: ${val}`);
      }
    } else if (/proceed\?\s*$/i.test(lines[i])) {
      parts.push('', '> Ready to generate the full project context. Reply "yes" to proceed.');
    }
  }
  return parts.join('\n');
};

export async function runLyzrContextAgentStep(userMessage, previousContext, lastNextAction) {
  const memory_context = trimMemoryContext(previousContext || []);

  // Append user message
  const updatedMemory = trimMemoryContext([
    ...memory_context,
    { user: userMessage, assistant: undefined }
  ]);

  // Try to get an answer from Lyzr
  const lyzrReply = await callLyzr(userMessage);

  // Try to parse and beautify the Lyzr JSON response first
  const prettyFromJson = parseLyzrResponse(lyzrReply);
  if (prettyFromJson) {
    const next_action = {
      current_step: (lastNextAction?.current_step ?? 0) + 1,
      next_step: (lastNextAction?.next_step ?? null),
      awaiting_user_input: true
    };
    const patchedMemoryJson = trimMemoryContext([
      ...memory_context,
      { user: userMessage, assistant: prettyFromJson }
    ]);
    return { response: prettyFromJson, next_action, memory_context: patchedMemoryJson };
  }

  // Fall back to legacy renderFromJsonBlock
  const legacyPretty = renderFromJsonBlock(lyzrReply);
  if (legacyPretty) {
    const next_action = {
      current_step: (lastNextAction?.current_step ?? 0) + 1,
      next_step: (lastNextAction?.next_step ?? null),
      awaiting_user_input: true
    };
    const patchedMemoryJson = trimMemoryContext([
      ...memory_context,
      { user: userMessage, assistant: legacyPretty }
    ]);
    return { response: legacyPretty, next_action, memory_context: patchedMemoryJson };
  }

  // Beautify the response as last resort
  let response = lyzrReply ? beautify(lyzrReply) : lyzrReply;

  const next_action = {
    current_step: (lastNextAction?.current_step ?? 0) + 1,
    next_step: (lastNextAction?.next_step ?? null),
    awaiting_user_input: true
  };

  // Replace the last assistant field with our response
  const patchedMemory = [...updatedMemory];
  patchedMemory[patchedMemory.length - 1] = {
    ...patchedMemory[patchedMemory.length - 1],
    assistant: response
  };

  return {
    response,
    next_action,
    memory_context: patchedMemory
  };
}

// Initialize with "Frontend" as the first message
// Test function to verify response parsing
export function testResponseParsing() {
  const testResponse = {
    "response": "{\n    \"response\": \"Thank you for explaining the project. A personal finance dashboard is an excellent frontend project. Let me ask about the technology stack:\n\nWhat technology stack do you plan to use? (If unspecified, I'll use sensible defaults like React + Next.js with modern UI libraries)\"\n}",
    "module_outputs": {}
  };
  
  // Simulate the parsing logic
  let candidate = testResponse.response || '';
  
  if (typeof candidate === 'string') {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        candidate = parsed.response || parsed.message || candidate;
      }
    } catch (e) {
      console.log('Failed to parse nested JSON:', e);
    }
  }
  
  console.log('Parsed response:', candidate);
  return candidate;
}

export async function initializeLyzrAgent() {
  // Don't send a message, just provide the first question directly
  const firstQuestion = {
    question: "Would you like Frontend, Backend, or Both?",
    action_required: { response: "" },
    note: "Reply 'Frontend', 'Backend', or 'Both'."
  };
  
  // Parse it beautifully
  const response = parseLyzrResponse(JSON.stringify(firstQuestion));
  
  const memory_context = [
    { user: "", assistant: response }
  ];
  
  const next_action = {
    current_step: 1,
    next_step: null,
    awaiting_user_input: true
  };
  
  return {
    response,
    next_action,
    memory_context
  };
}
