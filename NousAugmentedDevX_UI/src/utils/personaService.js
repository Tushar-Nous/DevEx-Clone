/**
 * Persona Service
 * Manages persona data and provides persona context for user story generation
 */

import { API_ENDPOINTS } from '../config/api';

class PersonaService {
  constructor() {
    this.personas = [];
    this.initialized = false;
    this.initPromise = null; // Track ongoing initialization
  }

  /**
   * Initialize and load personas from backend
   */
  async initialize() {
    // Return cached data if already initialized
    if (this.initialized) {
      return this.personas;
    }

    // Return ongoing initialization promise if already in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Create new initialization promise
    this.initPromise = (async () => {
      try {
        const response = await fetch(API_ENDPOINTS.personas);
        const result = await response.json();
        
        if (result.success) {
          this.personas = result.data;
          this.initialized = true;
          console.log('✅ Loaded personas from backend:', this.personas.length);
        } else {
          console.error('Failed to load personas:', result.error);
          this.personas = this.getDefaultPersonas();
          this.initialized = true;
        }
      } catch (error) {
        console.error('Error initializing personas:', error);
        this.personas = this.getDefaultPersonas();
        this.initialized = true;
      } finally {
        this.initPromise = null; // Clear the promise after completion
      }

      return this.personas;
    })();

    return this.initPromise;
  }

  /**
   * Get default personas (fallback)
   */
  getDefaultPersonas() {
    return [
      {
        id: 'qa-engineer',
        name: 'QA Engineer',
        title: 'Quality Assurance Engineer',
        responsibilities: [
          'Design and execute test plans',
          'Identify and report software defects',
          'Automate testing processes',
          'Ensure quality standards compliance'
        ],
        context: 'testing, quality assurance, bug tracking, automation'
      },
      {
        id: 'senior-developer',
        name: 'Senior Developer',
        title: 'Senior Software Developer',
        responsibilities: [
          'Design and implement software solutions',
          'Code review and mentoring',
          'Architecture planning',
          'Technical documentation'
        ],
        context: 'development, architecture, code quality, technical leadership'
      },
      {
        id: 'devops-engineer',
        name: 'DevOps Engineer',
        title: 'DevOps & Infrastructure Engineer',
        responsibilities: [
          'Manage CI/CD pipelines',
          'Infrastructure as Code',
          'System monitoring and alerting',
          'Security compliance'
        ],
        context: 'deployment, infrastructure, automation, monitoring'
      },
      {
        id: 'security-analyst',
        name: 'Security Analyst',
        title: 'Cybersecurity Analyst',
        responsibilities: [
          'Conduct security assessments',
          'Monitor security threats',
          'Ensure compliance standards',
          'Incident response management'
        ],
        context: 'security, compliance, vulnerability management, risk assessment'
      },
      {
        id: 'product-manager',
        name: 'Product Manager',
        title: 'Senior Product Manager',
        responsibilities: [
          'Define product vision and strategy',
          'Coordinate with stakeholders',
          'Analyze user feedback and metrics',
          'Prioritize feature development'
        ],
        context: 'product strategy, stakeholder management, user research, roadmap planning'
      },
      {
        id: 'data-analyst',
        name: 'Data Analyst',
        title: 'Senior Data Analyst',
        responsibilities: [
          'Analyze business data and trends',
          'Create reports and dashboards',
          'Provide data-driven insights',
          'Maintain data quality standards'
        ],
        context: 'data analysis, reporting, business intelligence, analytics'
      }
    ];
  }

  /**
   * Get all active personas
   */
  async getAllPersonas() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.personas.filter(p => p.status !== 'archived');
  }

  /**
   * Get persona by ID
   */
  async getPersonaById(id) {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.personas.find(p => p.id === id);
  }

  /**
   * Get persona by name
   */
  async getPersonaByName(name) {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.personas.find(p => 
      p.name.toLowerCase() === name.toLowerCase() || 
      p.title.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Get personas relevant to a specific context/feature
   */
  async getRelevantPersonas(context) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!context) return this.getAllPersonas();

    const contextLower = context.toLowerCase();
    return this.personas.filter(persona => {
      const personaContext = (persona.context || '').toLowerCase();
      const responsibilities = (persona.responsibilities || []).join(' ').toLowerCase();
      const skills = (persona.skills || []).join(' ').toLowerCase();
      
      return personaContext.includes(contextLower) || 
             responsibilities.includes(contextLower) || 
             skills.includes(contextLower);
    });
  }

  /**
   * Generate persona context for AI prompt
   */
  async generatePersonaContext() {
    if (!this.initialized) {
      await this.initialize();
    }

    const personas = await this.getAllPersonas();
    return personas.map(persona => ({
      name: persona.name,
      title: persona.title,
      responsibilities: persona.responsibilities,
      context: persona.context
    }));
  }

  /**
   * Format persona list for AI prompt
   */
  async formatPersonasForPrompt() {
    if (!this.initialized) {
      await this.initialize();
    }

    const personas = await this.getAllPersonas();
    return personas.map(p => 
      `- ${p.name} (${p.title}): ${p.responsibilities.slice(0, 2).join(', ')}`
    ).join('\n');
  }

  /**
   * Create new persona (from empathy phase research)
   */
  async createPersona(personaData) {
    try {
      const response = await fetch(API_ENDPOINTS.personas, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personaData)
      });

      const result = await response.json();
      
      if (result.success) {
        this.personas.push(result.data);
        console.log('✅ Persona created:', result.data.name);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating persona:', error);
      throw error;
    }
  }

  /**
   * Update existing persona
   */
  async updatePersona(id, updateData) {
    try {
      const response = await fetch(API_ENDPOINTS.personaById(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (result.success) {
        const index = this.personas.findIndex(p => p.id === id);
        if (index !== -1) {
          this.personas[index] = result.data;
        }
        console.log('✅ Persona updated:', result.data.name);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating persona:', error);
      throw error;
    }
  }

  /**
   * Delete persona
   */
  async deletePersona(id) {
    try {
      const response = await fetch(API_ENDPOINTS.personaById(id), {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        this.personas = this.personas.filter(p => p.id !== id);
        console.log('✅ Persona deleted:', result.data.name);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting persona:', error);
      throw error;
    }
  }

  /**
   * Find the most relevant persona for a story based on context
   */
  findRelevantPersona(story, personas, feature = {}, requirement = {}) {
  const text = `${story.title || ''} ${story.description || ''} ${feature.title || ''} ${feature.description || ''} ${requirement.title || ''} ${requirement.description || ''}`.toLowerCase();

  // Step 1: Calculate simple context overlap score
  const scored = personas.map(p => {
    const contextTokens = p.context.split(',').map(c => c.trim().toLowerCase());
    const score = contextTokens.reduce((acc, token) => {
      return acc + (text.includes(token) ? 1 : 0);
    }, 0);
    return { persona: p, score };
  });

  // Step 2: Pick the highest scoring persona
  const best = scored.sort((a, b) => b.score - a.score)[0];

  // Step 3: Fallback to role-based heuristic if no clear context match
  if (!best || best.score === 0) {
    if (/test|qa|bug|quality/i.test(text)) return personas.find(p => p.id.includes('qa')) || personas[0];
    if (/deploy|infra|pipeline|ci|cd|k8s/i.test(text)) return personas.find(p => p.id.includes('devops')) || personas[0];
    if (/security|vulnerability|risk|pen/i.test(text)) return personas.find(p => p.id.includes('security')) || personas[0];
    if (/data|report|analytics|insight/i.test(text)) return personas.find(p => p.id.includes('data')) || personas[0];
    if (/product|stakeholder|roadmap|feature/i.test(text)) return personas.find(p => p.id.includes('product')) || personas[0];
  }

  return best?.persona || personas[0];
}

  /**
   * Validate that a story uses an actual persona name
   */
  async validateStoryPersona(story) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Extract persona from story title
    const personaMatch = story.title?.match(/As (?:a |an )?([^,]+),/i);
    
    if (!personaMatch) {
      return {
        valid: false,
        message: 'Story does not follow "As a [Persona]..." format'
      };
    }

    const extractedPersona = personaMatch[1].trim();
    const matchingPersona = this.personas.find(p => 
      p.name.toLowerCase() === extractedPersona.toLowerCase()
    );

    if (!matchingPersona) {
      const relevantPersona = this.findRelevantPersona(story);
      return {
        valid: false,
        message: `Invalid persona: "${extractedPersona}"`,
        suggestion: relevantPersona.name,
        suggestedPersona: relevantPersona
      };
    }

    return {
      valid: true,
      persona: matchingPersona
    };
  }

  /**
   * Get persona usage statistics
   */
  async getPersonaStats() {
    try {
      const response = await fetch(API_ENDPOINTS.personaStats);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching persona stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const personaService = new PersonaService();
export default PersonaService;
