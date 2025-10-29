// Azure Context-Memory Agent utilities
// The agent maintains a 10-message rolling memory and enforces strict JSON I/O.

// Credentials and configuration — provided by the user request
// Deprecated – replaced by Lyzr. Keeping placeholders to avoid runtime import breaks
export const OPENAI_API_VERSION = "";
export const AZURE_DEPLOYMENT = "";
export const API_KEY = "";
export const AZURE_ENDPOINT = "";
export const TEMPERATURE = 0.2;

// Prompt definition to be used by the chat agent
export const AzureContextAgentPrompt = {
  name: "AzureContextAgent",
  description:
    "An Azure OpenAI-based interactive project context generator with 10-message rolling memory. Each step passes all previous responses and any mid-conversation clarifications into the next call.",
  instructions: [
    "You are an Azure OpenAI conversational agent that builds full technical project contexts through a sequence of 8 questions.",
    "Each question is asked in order, and every response (including off-script or clarifying messages) must be stored and passed as input to the next question.",
    "Maintain memory of up to 10 exchanges (messages).",
    "After 10 messages, drop the oldest message to preserve context window.",
    "Each OpenAI API call corresponds to one question or confirmation.",
    "Always output in strict JSON format. Never include markdown or natural language outside JSON.",
    "Each JSON output must contain 'response' and 'next_action'."
  ],
  memory_policy: {
    type: "rolling_window",
    max_messages: 10,
    include_user: true,
    include_assistant: true
  },
  flow: {
    "1": "Ask: 'Would you like Frontend, Backend, or Both?'",
    "2": "Ask: 'What is the project about?' — include response from Q1",
    "3": "Ask: 'What technology stack will you use? (or reply default)' — include responses from Q1–Q2",
    "4": "Ask: 'List 3–6 core features.' — include responses from Q1–Q3",
    "5": "Ask: 'Who are the target users?' — include responses from Q1–Q4",
    "6": "Ask: 'Expected scale? (MVP / medium SaaS / enterprise)' — include responses from Q1–Q5",
    "7": "Ask: 'Any architectural preferences?' — include responses from Q1–Q6",
    "8": "Ask: 'Please paste the user journey or application story.' — include responses from Q1–Q7",
    "9": "After collecting all answers, summarize all inputs in a bullet list and ask for confirmation: 'I have all inputs. Ready to generate the full project context (15k–16k tokens)? Proceed?'",
    "10": "If confirmed, generate the full project context following the Final Document Requirements, then append a short checklist of next steps."
  },
  output_format: {
    type: "json",
    fields: {
      response: "string - The message to show the user or the generated document.",
      next_action: {
        type: "object",
        fields: {
          current_step: "integer",
          next_step: "integer or null",
          awaiting_user_input: "boolean"
        }
      },
      memory_context: "array - contains the last 10 message pairs (user + assistant)."
    }
  },
  example: {
    input: {
      user_message: "Frontend",
      previous_context: []
    },
    output: {
      response: "What is the project about?",
      next_action: {
        current_step: 1,
        next_step: 2,
        awaiting_user_input: true
      },
      memory_context: [
        {
          user: "Frontend",
          assistant: "What is the project about?"
        }
      ]
    }
  }
};

// Builds the system message instructing the model to obey strict JSON I/O and memory policy.
function buildSystemMessage() {
  return [
    "You are AzureContextAgent.",
    "Follow the exact flow steps and memory policy below.",
    "Always respond with STRICT JSON only — no markdown, no prose outside JSON.",
    JSON.stringify({
      name: AzureContextAgentPrompt.name,
      instructions: AzureContextAgentPrompt.instructions,
      memory_policy: AzureContextAgentPrompt.memory_policy,
      flow: AzureContextAgentPrompt.flow,
      output_format: AzureContextAgentPrompt.output_format
    })
  ].join("\n\n");
}

// Utility that trims the rolling memory to the last 10 exchanges.
export function trimMemoryContext(memoryContext) {
  if (!Array.isArray(memoryContext)) return [];
  const MAX = AzureContextAgentPrompt.memory_policy.max_messages;
  const start = Math.max(0, memoryContext.length - MAX);
  return memoryContext.slice(start);
}

// Helper to turn memory into a readable brief for final context generation
export function buildFinalBriefFromMemory(memoryContext) {
  const parts = [];
  memoryContext.forEach((pair, idx) => {
    const u = pair?.user ?? '';
    const a = pair?.assistant ?? '';
    parts.push(`Q${idx + 1}: ${u}`);
    parts.push(`A${idx + 1}: ${a}`);
  });
  return parts.join("\n");
}

// Generate a long final project context using the accumulated conversation
export async function generateFinalProjectContext(memoryContext) {
  const pairs = Array.isArray(memoryContext) && memoryContext.length && memoryContext[0]?.user !== undefined
    ? memoryContext
    : [];
  const brief = buildFinalBriefFromMemory(pairs);
  const url = `${AZURE_ENDPOINT}openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  const system = [
    "You are AzureContextAgent Finalizer.",
    "Using the provided Q/A transcript, generate a comprehensive, highly-detailed, production-grade project context document.",
    "Aim for 14k–15k tokens if model limits allow; otherwise produce the longest coherent document permitted.",
    "Output as rich Markdown only (no JSON), with clear sections: Overview, Goals, Personas, User Journeys, Functional Requirements, Non-Functional Requirements, Architecture, API Design, Data Model, Security, Compliance, DevOps, Testing Strategy, Performance, Observability, Risks & Mitigations, Roadmap, and Next Steps.",
    "Prefer concrete, actionable guidance and realistic defaults derived from the transcript."
  ].join("\n\n");

  const body = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Transcript to synthesize into final context:\n\n${brief}` }
    ],
    temperature: TEMPERATURE,
    // Allow the service to choose max tokens. Azure may cap this per model.
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Azure OpenAI error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return content;
}

// Runs a single step against Azure OpenAI Chat Completions API.
// Returns a parsed JSON object adhering to the output_format and the updated memory_context.
export async function runAzureContextAgentStep(userMessage, previousContext, lastNextAction) {
  const memory_context = trimMemoryContext(previousContext || []);

  const url = `${AZURE_ENDPOINT}openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${OPENAI_API_VERSION}`;

  const messages = [
    { role: "system", content: buildSystemMessage() },
    {
      role: "user",
      content: JSON.stringify({
        user_message: userMessage,
        previous_context: memory_context,
        last_next_action: lastNextAction || null
      })
    }
  ];

  const body = {
    messages,
    temperature: TEMPERATURE,
    response_format: { type: "json_object" }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Azure OpenAI error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // Fallback to a minimal JSON if model strays from the enforced schema
    parsed = {
      response: "",
      next_action: { current_step: 0, next_step: 1, awaiting_user_input: true },
      memory_context
    };
  }

  // Update memory with the latest exchange
  const updatedMemory = trimMemoryContext([
    ...memory_context,
    { user: userMessage, assistant: parsed.response }
  ]);

  // Ensure memory_context is returned for chaining
  parsed.memory_context = updatedMemory;
  // Ensure next_action exists with step hints to avoid step regression
  if (!parsed.next_action) {
    parsed.next_action = { current_step: (lastNextAction?.next_step ?? 1), next_step: (lastNextAction?.next_step ?? 2), awaiting_user_input: true };
  }
  return parsed;
}


