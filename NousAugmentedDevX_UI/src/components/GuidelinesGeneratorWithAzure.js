import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, FileText, Send, Download, Loader2, Sparkles, GitBranch, Users, Eye, Code2, Layers, BookOpen, ChevronRight, Search, Filter, X, History, Target, Zap, CheckCircle, RefreshCw, Copy, Save, Database, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as XLSX from 'xlsx';
import { useRequirements } from '../context/RequirementsContext';
import { parseAgileArtifacts } from '../utils/agileParser';
import { promptTemplates, getAllIndustries } from '../data/promptTemplates';
import { runLyzrContextAgentStep, initializeLyzrAgent } from '../utils/lyzrContextAgent';
import { API_ENDPOINTS } from '../config/api';

function GuidelinesGeneratorWithAzure() {
  const { epics, features, userStories, dispatch } = useRequirements();
  const MAX_INPUT_CHARS = 50000; // allow ~50k chars per request (UI cap)
  const SAFE_CHUNK_CHAR_LIMIT = 12000; // conservative per-request chunk size to stay under ~16k token limits

  // --- Helpers: Chunking and response normalization ---
  const splitIntoChunks = (text, size) => {
    if (!text) return [];
    const chunks = [];
    let i = 0;
    while (i < text.length) {
      // try to break at a paragraph boundary near the limit
      let end = Math.min(i + size, text.length);
      if (end < text.length) {
        const lastBreak = text.lastIndexOf('\n\n', end);
        if (lastBreak > i + size * 0.6) {
          end = lastBreak + 2; // include the boundary
        }
      }
      chunks.push(text.slice(i, end));
      i = end;
    }
    return chunks;
  };

  const normalizeGuidelinesPayload = (data) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (data.guidelines) return typeof data.guidelines === 'string' ? data.guidelines : JSON.stringify(data.guidelines);
    if (data.content) return data.content;
    try { return JSON.stringify(data); } catch { return String(data); }
  };

  const normalizeAgileArtifactsPayload = (data) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (data.agile_artifacts) return data.agile_artifacts;
    try { return JSON.stringify(data); } catch { return String(data); }
  };

  // Helper function to create clean copies without circular references
  const createCleanAgileArtifacts = (artifacts) => {
    if (!artifacts) return null;
    
    const cleanEpics = artifacts.epics?.map(epic => ({
      id: epic.id,
      title: epic.title,
      description: epic.description,
      priority: epic.priority,
      status: epic.status,
      createdAt: epic.createdAt
    })) || [];
    
    const cleanFeatures = artifacts.features?.map(feature => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      priority: feature.priority,
      status: feature.status,
      createdAt: feature.createdAt
    })) || [];
    
    const cleanUserStories = artifacts.userStories?.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      priority: story.priority,
      status: story.status,
      createdAt: story.createdAt,
      acceptanceCriteria: story.acceptanceCriteria || []
    })) || [];
    
    return {
      epics: cleanEpics,
      features: cleanFeatures,
      userStories: cleanUserStories
    };
  };

  // Merge many parts into one coherent document using the same backend endpoint.
  const synthesizeTextParts = async (parts, mode = 'guidelines') => {
    let current = parts.slice();
    // Reduce pairwise until one remains
    while (current.length > 1) {
      const next = [];
      for (let i = 0; i < current.length; i += 2) {
        if (i + 1 >= current.length) {
          next.push(current[i]);
          continue;
        }
        const a = current[i];
        const b = current[i + 1];
        // Build a merge instruction that fits within limits
        const instruction = `Combine the two documents below into ONE cohesive, non-redundant, well-structured document.\n` +
          `- Preserve all factual details; remove duplicates.\n- Improve flow and headings.\n- Output ONLY the final combined document.\n\n` +
          `--- Document A ---\n${a}\n\n--- Document B ---\n${b}`;
        const endpoint = mode === 'guidelines'
          ? API_ENDPOINTS.generateGuidelines
          : API_ENDPOINTS.generateAgileArtifacts;
        const bodyKey = mode === 'guidelines' ? 'input' : 'requirement';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [bodyKey]: instruction.slice(0, SAFE_CHUNK_CHAR_LIMIT) })
        });
        if (!res.ok) throw new Error('Synthesis step failed');
        const data = await res.json();
        const normalized = mode === 'guidelines' ? normalizeGuidelinesPayload(data) : normalizeAgileArtifactsPayload(data);
        next.push(normalized);
      }
      current = next;
    }
    return current[0] || '';
  };
  const [inputType, setInputType] = useState('chat');
  const [chatInput, setChatInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [guidelines, setGuidelines] = useState(null);
  const [agileArtifacts, setAgileArtifacts] = useState(null);
  const [activeTab, setActiveTab] = useState('guidelines');
  const [showTemplateSidebar, setShowTemplateSidebar] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [showUserStoryModal, setShowUserStoryModal] = useState(false);
  const [selectedUserStory, setSelectedUserStory] = useState(null);
  const [parsedArtifacts, setParsedArtifacts] = useState({ epics: [], features: [], userStories: [] });
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);

  // Simple chat agent state (AzureContextAgent)
  const [chatMessages, setChatMessages] = useState([]);
  const [liveChatInput, setLiveChatInput] = useState('');
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [memoryContext, setMemoryContext] = useState([]);
  const [lastNextAction, setLastNextAction] = useState(null);
  const justAppendedRef = useRef(false);
  const [meetingActive, setMeetingActive] = useState(false);
  const [meetingSeconds, setMeetingSeconds] = useState(0);
  const [lastAutoStep, setLastAutoStep] = useState(null);
  const [finalGenerated, setFinalGenerated] = useState(false);
  const [savedProjectContext, setSavedProjectContext] = useState(null);
  const [isContextFinalized, setIsContextFinalized] = useState(false);
  const [interactionMode, setInteractionMode] = useState('agent'); // 'agent' | 'manual'
  
  // Workflow Progress Tracking
  const [workflowProgress, setWorkflowProgress] = useState({
    agent: {
      'start-chat': false,
      'context-finalize': false,
      'generate-guidelines': false,
      'push-devops': false
    },
    manual: {
      'input-upload': false,
      'generate-guideline': false,
      'push-devops': false
    }
  });
  
  // Persistent storage keys
  const STORAGE_KEYS = React.useMemo(() => ({
    chatMessages: 'ggwa:agent:chatMessages',
    memoryContext: 'ggwa:agent:memoryContext',
    lastNextAction: 'ggwa:agent:lastNextAction',
    meetingActive: 'ggwa:agent:meetingActive',
    meetingSeconds: 'ggwa:agent:meetingSeconds',
    finalGenerated: 'ggwa:agent:finalGenerated',
    interactionMode: 'ggwa:ui:interactionMode',
    inputType: 'ggwa:ui:inputType',
    chatInput: 'ggwa:ui:chatInput',
    fileContent: 'ggwa:ui:fileContent',
    guidelines: 'ggwa:data:guidelines',
    agileArtifacts: 'ggwa:data:agileArtifacts',
    workflowProgress: 'ggwa:ui:workflowProgress',
    parsedArtifacts: 'ggwa:data:parsedArtifacts',
    savedProjectContext: 'savedProjectContext',
    savedProjectContextTimestamp: 'savedProjectContextTimestamp',
    savedProjectContextFinalized: 'savedProjectContextFinalized'
  }), []);

  // Rehydrate persisted state on mount (best-effort)
  useEffect(() => {
    try {
      const cm = localStorage.getItem(STORAGE_KEYS.chatMessages);
      if (cm) setChatMessages(JSON.parse(cm));
    } catch {}
    try {
      const mc = localStorage.getItem(STORAGE_KEYS.memoryContext);
      if (mc) setMemoryContext(JSON.parse(mc));
    } catch {}
    try {
      const na = localStorage.getItem(STORAGE_KEYS.lastNextAction);
      if (na) setLastNextAction(JSON.parse(na));
    } catch {}
    try {
      const ma = localStorage.getItem(STORAGE_KEYS.meetingActive);
      if (ma) setMeetingActive(ma === 'true');
    } catch {}
    try {
      const ms = localStorage.getItem(STORAGE_KEYS.meetingSeconds);
      if (ms) setMeetingSeconds(parseInt(ms, 10) || 0);
    } catch {}
    try {
      const fg = localStorage.getItem(STORAGE_KEYS.finalGenerated);
      if (fg) setFinalGenerated(fg === 'true');
    } catch {}
    try {
      const im = localStorage.getItem(STORAGE_KEYS.interactionMode);
      if (im) setInteractionMode(im);
    } catch {}
    try {
      const wp = localStorage.getItem(STORAGE_KEYS.workflowProgress);
      if (wp) setWorkflowProgress(JSON.parse(wp));
    } catch {}
    try {
      const it = localStorage.getItem(STORAGE_KEYS.inputType);
      if (it) setInputType(it);
    } catch {}
    try {
      const ci = localStorage.getItem(STORAGE_KEYS.chatInput);
      if (ci) setChatInput(ci);
    } catch {}
    try {
      const fc = localStorage.getItem(STORAGE_KEYS.fileContent);
      if (fc) setFileContent(fc);
    } catch {}
    try {
      const g = localStorage.getItem(STORAGE_KEYS.guidelines);
      if (g) setGuidelines(JSON.parse(g));
    } catch {}
    try {
      const a = localStorage.getItem(STORAGE_KEYS.agileArtifacts);
      if (a) setAgileArtifacts(JSON.parse(a));
    } catch {}
    try {
      const pa = localStorage.getItem(STORAGE_KEYS.parsedArtifacts);
      if (pa) setParsedArtifacts(JSON.parse(pa));
    } catch {}
  }, [STORAGE_KEYS]);

  // Persist critical state whenever it changes
  // Persist chatMessages
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.chatMessages, JSON.stringify(chatMessages)); } catch {}
  }, [chatMessages, STORAGE_KEYS]);
  // Persist memoryContext
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.memoryContext, JSON.stringify(memoryContext)); } catch {}
  }, [memoryContext, STORAGE_KEYS]);
  // Persist lastNextAction
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.lastNextAction, JSON.stringify(lastNextAction)); } catch {}
  }, [lastNextAction, STORAGE_KEYS]);
  // Persist meetingActive
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.meetingActive, String(meetingActive)); } catch {}
  }, [meetingActive, STORAGE_KEYS]);
  // Persist meetingSeconds
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.meetingSeconds, String(meetingSeconds)); } catch {}
  }, [meetingSeconds, STORAGE_KEYS]);
  // Persist finalGenerated
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.finalGenerated, String(finalGenerated)); } catch {}
  }, [finalGenerated, STORAGE_KEYS]);
  // Persist interactionMode
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.interactionMode, interactionMode); } catch {}
  }, [interactionMode, STORAGE_KEYS]);
  // Persist workflowProgress
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.workflowProgress, JSON.stringify(workflowProgress)); } catch {}
  }, [workflowProgress, STORAGE_KEYS]);
  // Persist inputType
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.inputType, inputType); } catch {}
  }, [inputType, STORAGE_KEYS]);
  // Persist chatInput
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.chatInput, chatInput); } catch {}
  }, [chatInput, STORAGE_KEYS]);
  // Persist fileContent
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.fileContent, fileContent); } catch {}
  }, [fileContent, STORAGE_KEYS]);
  // Persist guidelines
  useEffect(() => {
    try { if (guidelines) localStorage.setItem(STORAGE_KEYS.guidelines, JSON.stringify(guidelines)); } catch {}
  }, [guidelines, STORAGE_KEYS]);
  // Persist agileArtifacts
  useEffect(() => {
    try { if (agileArtifacts) localStorage.setItem(STORAGE_KEYS.agileArtifacts, JSON.stringify(agileArtifacts)); } catch {}
  }, [agileArtifacts, STORAGE_KEYS]);
  // Persist parsedArtifacts
  useEffect(() => {
    try { if (parsedArtifacts) localStorage.setItem(STORAGE_KEYS.parsedArtifacts, JSON.stringify(parsedArtifacts)); } catch {}
  }, [parsedArtifacts, STORAGE_KEYS]);

  // Auto-scroll to latest message
  useEffect(() => {
    const el = messageListRef?.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages, assistantTyping]);

  // Don't auto-initialize - wait for user to click "Start Meeting"

  // Meeting timer effect
  useEffect(() => {
    if (!meetingActive) return;
    const t = setInterval(() => setMeetingSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [meetingActive]);

  const formatDuration = (total) => {
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartMeeting = async () => {
    setMeetingSeconds(0);
    setMeetingActive(true);
    setFinalGenerated(false);
    
    // Mark start-chat as completed when meeting starts
    updateWorkflowProgress('agent', 'start-chat', true);
    
    // If no messages yet, bootstrap first question
    if (chatMessages.length === 0 && !assistantTyping) {
      try {
        setAssistantTyping(true);
        const result = await initializeLyzrAgent();
        setMemoryContext(result?.memory_context || []);
        setLastNextAction(result?.next_action || null);
        setChatMessages([{ id: `a-${Date.now()}`, role: 'assistant', text: result?.response || '' }]);
      } catch {
        toast.error('Failed to start chat');
      } finally {
        setAssistantTyping(false);
      }
    }
  };

  const handleEndMeeting = () => {
    // Save transcript on meeting end
    try {
      const transcriptEntry = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
        messages: chatMessages
      };
      const key = 'ggwa:data:chatTranscripts';
      const existing = localStorage.getItem(key);
      const list = existing ? JSON.parse(existing) : [];
      list.push(transcriptEntry);
      localStorage.setItem(key, JSON.stringify(list));
      localStorage.setItem('ggwa:data:lastTranscript', JSON.stringify(transcriptEntry));
      toast.success('Transcript saved');
    } catch {}
    setMeetingActive(false);
  };

  const handleCopyTranscript = () => {
    const transcript = chatMessages
      .map((m) => `${m.role === 'user' ? 'You' : 'Assistant'}: ${m.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(transcript)
      .then(() => toast.success('Transcript copied'))
      .catch(() => toast.error('Copy failed'));

    // Also persist transcript entry for history
    try {
      const key = 'ggwa:data:chatTranscripts';
      const transcriptEntry = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
        messages: chatMessages
      };
      const existing = localStorage.getItem(key);
      const list = existing ? JSON.parse(existing) : [];
      list.push(transcriptEntry);
      localStorage.setItem(key, JSON.stringify(list));
      localStorage.setItem('ggwa:data:lastTranscript', JSON.stringify(transcriptEntry));
    } catch {}
  };

  const handleSaveProjectContext = () => {
    // Find the latest project context message
    const projectContextMessage = chatMessages
      .slice()
      .reverse()
      .find(m => m.role === 'assistant' && m.text.includes('project_context'));
    
    if (projectContextMessage) {
      setSavedProjectContext(projectContextMessage.text);
      
      // Store in localStorage for persistence
      localStorage.setItem('savedProjectContext', projectContextMessage.text);
      localStorage.setItem('savedProjectContextTimestamp', new Date().toISOString());
      // Saving invalidates previous finalization
      setIsContextFinalized(false);
      localStorage.removeItem('savedProjectContextFinalized');
      
      toast.success('Project context saved successfully!');
    } else {
      toast.error('No project context found to save');
    }
  };

  // Load saved project context on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedProjectContext');
    if (saved) {
      setSavedProjectContext(saved);
    }
    const finalized = localStorage.getItem('savedProjectContextFinalized') === 'true';
    setIsContextFinalized(finalized);
  }, []);

  const handleFinalizeProjectContext = () => {
    if (!savedProjectContext) {
      toast.error('Save project context first');
      return;
    }
    setIsContextFinalized(true);
    localStorage.setItem('savedProjectContextFinalized', 'true');
    updateWorkflowProgress('agent', 'context-finalize', true);
    toast.success('Project context finalized');
  };

  const handleGenerateFigmaPrompt = async () => {
    if (!savedProjectContext) {
      toast.error('Save project context first');
      return;
    }
    if (!isContextFinalized) {
      toast.error('Please finalize the context before generating');
      return;
    }
    try {
      // Do not switch UI mode or touch inputs; run generation internally with saved context
      toast.success('Generating using saved project context...');
      await runGuidelinesGeneration(savedProjectContext);
      updateWorkflowProgress('agent', 'generate-guidelines', true);
    } catch (e) {
      toast.error('Failed to trigger Figma prompt generation');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleResetChat = async () => {
    setChatMessages([]);
    setMemoryContext([]);
    setLastNextAction(null);
    setMeetingSeconds(0);
    setFinalGenerated(false);
    // Clear persisted chat-only state but keep saved project context
    try {
      localStorage.removeItem(STORAGE_KEYS.chatMessages);
      localStorage.removeItem(STORAGE_KEYS.memoryContext);
      localStorage.removeItem(STORAGE_KEYS.lastNextAction);
      localStorage.removeItem(STORAGE_KEYS.meetingActive);
      localStorage.removeItem(STORAGE_KEYS.meetingSeconds);
      localStorage.removeItem(STORAGE_KEYS.finalGenerated);
    } catch {}
    try {
      setAssistantTyping(true);
      const result = await initializeLyzrAgent();
      setMemoryContext(result?.memory_context || []);
      setLastNextAction(result?.next_action || null);
      setChatMessages([{ id: `a-${Date.now()}`, role: 'assistant', text: result?.response || '' }]);
      toast.success('Chat reset');
    } catch {
      toast.error('Failed to reset chat');
    } finally {
      setAssistantTyping(false);
    }
  };

  // Hard reset: clear everything and DO NOT auto-boot the first question
  const handleHardReset = () => {
    justAppendedRef.current = false;
    setAssistantTyping(false);
    setChatMessages([]);
    setMemoryContext([]);
    setLastNextAction(null);
    setLastAutoStep(null);
    setFinalGenerated(false);
    setMeetingActive(false);
    setMeetingSeconds(0);
    // Clear all persisted state including UI/data (except saved project context - leave as is per earlier feature)
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        if (key !== STORAGE_KEYS.savedProjectContext && key !== STORAGE_KEYS.savedProjectContextTimestamp && key !== STORAGE_KEYS.savedProjectContextFinalized) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
    toast.success('All chat state cleared');
  };

  // If the agent says no user input needed, auto-advance to next step
  useEffect(() => {
    const maybeAutoAdvance = async () => {
      if (!lastNextAction || assistantTyping) return;

      // If model signaled completion, generate the final document immediately
      if ((lastNextAction.next_step === null || lastNextAction.current_step >= 10) && !finalGenerated) {
        try {
          setAssistantTyping(true);
          setFinalGenerated(true);
          // Removed completion message - no finalDoc needed
          justAppendedRef.current = true;
        } catch (e) {
          toast.error('Final context generation failed');
        } finally {
          setAssistantTyping(false);
        }
        return;
      }

      if (lastNextAction.awaiting_user_input === false && lastNextAction.next_step !== null && lastNextAction.current_step !== lastAutoStep) {
        // prevent reentry loops
        if (justAppendedRef.current) {
          justAppendedRef.current = false;
          return;
        }
        try {
          setAssistantTyping(true);
          const result = await runLyzrContextAgentStep("", memoryContext, lastNextAction);
          const reply = result?.response || '';
          setMemoryContext(result?.memory_context || []);
          setLastNextAction(result?.next_action || null);
          justAppendedRef.current = true;
          setChatMessages((m) => {
            const last = m[m.length - 1];
            if (last?.role === 'assistant' && (last.text || '').trim() === reply.trim()) return m; // de-dupe
            return [...m, { id: `a-${Date.now()}`, role: 'assistant', text: reply }];
          });
          setLastAutoStep(lastNextAction.current_step);
        } catch (e) {
          toast.error('Auto-advance failed');
        } finally {
          setAssistantTyping(false);
        }
      }
    };
    maybeAutoAdvance();
  }, [lastNextAction, memoryContext, assistantTyping, lastAutoStep, chatMessages, finalGenerated]);

  // Build full conversation pairs from chat messages for final synthesis
  // buildPairsFromChat removed (unused)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showUserStoryModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showUserStoryModal]);
  
  // (Removed Lyzer meeting timer, auto-scroll, and duration helpers)

  // (Removed Lyzer text beautifier)

  
  const fileInputRef = useRef();
  const messageListRef = useRef();

  // Format acceptance criteria with bold Gherkin keywords
  const formatCriteriaWithBoldKeywords = (criteria) => {
    if (!criteria) return '';
    
    // Replace Given, When, Then with bold versions
    return criteria
      .replace(/\bGiven\b/g, '<strong>Given</strong>')
      .replace(/\bWhen\b/g, '<strong>When</strong>')
      .replace(/\bThen\b/g, '<strong>Then</strong>');
  };


  // Reset function to clear all generated data
  const resetGeneration = () => {
    setGuidelines(null);
    setAgileArtifacts(null);
    setParsedArtifacts({ epics: [], features: [], userStories: [] });
    setHasGeneratedContent(false);
    setChatInput('');
    setSelectedFile(null);
    setFileContent('');
    setActiveTab('guidelines');
    setShowUserStoryModal(false);
    setSelectedUserStory(null);
    
    // Clear DevOps status and session flags
    localStorage.removeItem('devops-guidelines');
    localStorage.removeItem('devops-sent-status');
    sessionStorage.removeItem('content-generated-this-session');
    
    toast.success('Generation data reset successfully!');
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setInputType('file');
    
    try {
      const content = await extractFileContent(file);
      setFileContent(content);
      toast.success(`File "${file.name}" loaded successfully`);
    } catch (error) {
      toast.error(`Failed to read file: ${error.message}`);
      setSelectedFile(null);
      setFileContent('');
    }
  };

  const extractFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const ext = file.name.split('.').pop().toLowerCase();
          
          if (ext === 'pdf') {
            resolve(`PDF Content: ${file.name} - File size: ${(file.size / 1024).toFixed(2)} KB`);
          } else if (ext === 'xlsx' || ext === 'xls') {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            let text = '';
            workbook.SheetNames.forEach(sheetName => {
              const sheet = workbook.Sheets[sheetName];
              text += `Sheet: ${sheetName}\n`;
              text += XLSX.utils.sheet_to_csv(sheet);
              text += '\n\n';
            });
            resolve(text);
          } else if (ext === 'txt' || ext === 'md') {
            resolve(e.target.result);
          } else {
            reject(new Error('Unsupported file type. Please upload PDF, Excel, or Text file.'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type.includes('pdf') || file.type.includes('excel') || file.type.includes('spreadsheet')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileContent('');
    setInputType('chat');
  };

  const getInputContent = () => {
    switch (inputType) {
      case 'chat':
        return chatInput;
      case 'file':
        return fileContent;
      default:
        return '';
    }
  };

  const getFilteredTemplates = () => {
    let filtered = promptTemplates;
    
    // Filter by industry
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(template => template.industry === selectedIndustry);
    }
    
    // Filter by search term
    if (templateSearch) {
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
        template.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
        template.industry.toLowerCase().includes(templateSearch.toLowerCase()) ||
        template.category.toLowerCase().includes(templateSearch.toLowerCase())
      );
    }
    
    return filtered;
  };

  const applyTemplate = (template) => {
    setChatInput(template.template);
    setInputType('chat');
    setShowTemplateSidebar(false);
    toast.success(`Template "${template.title}" applied successfully!`);
  };

  // Function to clean generated content by removing unwanted structured sections
  const cleanGeneratedContent = (content) => {
    if (!content) return content;
    
    // Remove the structured project overview sections
    const unwantedSections = [
      '🚀 Project Overview',
      '🧰 Tech Stack',
      '🏛 Architecture Design',
      '🧩 Module & Component Breakdown',
      '🔁 Data Flow & Interactions',
      '🔗 API & DB Integration Points',
      '🔒 Security & Performance',
      '🛠 Development Best Practices',
      '📈 Scalability & Reliability',
      '🗺 Implementation Roadmap',
      '📎 Appendix',
      '✅ Conclusion & Next Steps',
      'Summary',
      'Project',
      'Project Overview',
      'Tech Stack',
      'Architecture Design',
      'Module & Component Breakdown',
      'Data Flow & Interactions',
      'API & DB Integration Points',
      'Security & Performance',
      'Development Best Practices',
      'Scalability & Reliability',
      'Implementation Roadmap',
      'Appendix',
      'Conclusion & Next Steps'
    ];
    
    let cleanedContent = content;
    
    // Remove sections that start with emojis or specific patterns
    unwantedSections.forEach(section => {
      // Remove lines that start with the section name (with or without emoji)
      const patterns = [
        new RegExp(`^\\s*${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gmi'),
        new RegExp(`^\\s*#+\\s*${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gmi'),
        new RegExp(`^\\s*##+\\s*${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gmi'),
        new RegExp(`^\\s*###+\\s*${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gmi')
      ];
      
      patterns.forEach(pattern => {
        cleanedContent = cleanedContent.replace(pattern, '');
      });
    });
    
    // Remove any remaining empty lines and clean up formatting
    cleanedContent = cleanedContent
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove multiple empty lines
      .replace(/^\s*\n/g, '') // Remove leading empty lines
      .trim();
    
    return cleanedContent;
  };

  const runGuidelinesGeneration = async (content) => {
    if (!content || !content.trim()) {
      toast.error('Please provide some input content');
      return;
    }

    setIsProcessing(true);
    const needsChunking = content.length > SAFE_CHUNK_CHAR_LIMIT;
    const inputChunks = needsChunking ? splitIntoChunks(content, SAFE_CHUNK_CHAR_LIMIT) : [content];
    try {
      const mergedGuidelinesParts = [];
      for (let idx = 0; idx < inputChunks.length; idx++) {
        const chunk = inputChunks[idx];
        const res = await fetch(API_ENDPOINTS.generateGuidelines, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: chunk })
        });
        if (!res.ok) throw new Error('Guidelines chunk failed');
        const data = await res.json();
        mergedGuidelinesParts.push(normalizeGuidelinesPayload(data));
      }
      const mergedGuidelines = await synthesizeTextParts(mergedGuidelinesParts, 'guidelines');
      const cleanedGuidelines = cleanGeneratedContent(mergedGuidelines);
      const guidelinesData = { guidelines: cleanedGuidelines, success: true };

      const mergedArtifactsParts = [];
      for (let idx = 0; idx < inputChunks.length; idx++) {
        const chunk = inputChunks[idx];
        const res = await fetch(API_ENDPOINTS.generateAgileArtifacts, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirement: chunk })
        });
        if (!res.ok) throw new Error('Agile artifact chunk failed');
        const data = await res.json();
        mergedArtifactsParts.push(normalizeAgileArtifactsPayload(data));
      }
      const mergedArtifacts = await synthesizeTextParts(mergedArtifactsParts, 'artifacts');
      const cleanedArtifacts = cleanGeneratedContent(mergedArtifacts);
      const agileData = { success: true, agile_artifacts: cleanedArtifacts };

      const parsedArtifacts = parseAgileArtifacts(agileData.agile_artifacts);

      // Debug logging to see what's being parsed
      console.log('Raw agile artifacts:', agileData.agile_artifacts);
      console.log('Parsed artifacts:', parsedArtifacts);
      console.log('Epics count:', parsedArtifacts.epics.length);
      console.log('Features count:', parsedArtifacts.features.length);
      console.log('User Stories count:', parsedArtifacts.userStories.length);

      setGuidelines(guidelinesData);
      setAgileArtifacts(agileData);
      setParsedArtifacts(parsedArtifacts); // Use clean parsedArtifacts instead of parsed
      setHasGeneratedContent(true);
      localStorage.removeItem('devops-sent-status');
      sessionStorage.setItem('content-generated-this-session', 'true');

      if (parsedArtifacts.epics.length > 0) dispatch({ type: 'ADD_EPICS', payload: parsedArtifacts.epics });
      if (parsedArtifacts.features.length > 0) dispatch({ type: 'ADD_FEATURES', payload: parsedArtifacts.features });
      if (parsedArtifacts.userStories.length > 0) dispatch({ type: 'ADD_USER_STORIES', payload: parsedArtifacts.userStories });

      toast.success(`Content generated successfully! Added ${parsedArtifacts.epics.length} epics, ${parsedArtifacts.features.length} features, and ${parsedArtifacts.userStories.length} user stories.`);
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setIsProcessing(false);
    }
  };

  // Workflow Progress Helper Functions
  const updateWorkflowProgress = (mode, step, completed) => {
    setWorkflowProgress(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [step]: completed
      }
    }));
  };

  const getWorkflowStepStatus = (mode, step) => {
    return workflowProgress[mode]?.[step] || false;
  };


  const generateGuidelines = async () => {
    const content = getInputContent();
    await runGuidelinesGeneration(content);
    // Mark manual workflow steps as completed
    updateWorkflowProgress('manual', 'input-upload', true);
    updateWorkflowProgress('manual', 'generate-guideline', true);
  };

  const downloadGuidelines = () => {
    if (!guidelines) return;
    
    const element = document.createElement('a');
    const content = typeof guidelines === 'string' ? guidelines : JSON.stringify(guidelines, null, 2);
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'generated-guidelines.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sendToDevOps = () => {
    if (!guidelines) return;
    
    // Store the guidelines in localStorage for DevOps Integration to access
    const guidelinesData = {
      content: typeof guidelines === 'string' ? guidelines : 
               guidelines.guidelines ? guidelines.guidelines : 
               JSON.stringify(guidelines, null, 2),
      timestamp: new Date().toISOString(),
      fileName: 'generated-guidelines.md'
    };
    
    localStorage.setItem('devops-guidelines', JSON.stringify(guidelinesData));
    
    // Store agile artifacts in localStorage for DevOps Integration to access
    if (parsedArtifacts && (parsedArtifacts.epics.length > 0 || parsedArtifacts.features.length > 0 || parsedArtifacts.userStories.length > 0)) {
      const cleanArtifacts = createCleanAgileArtifacts(parsedArtifacts);
      
      const agileArtifactsData = {
        ...cleanArtifacts,
        timestamp: new Date().toISOString(),
        source: 'frontend-guidelines-generation'
      };
      
      localStorage.setItem('devops-agile-artifacts', JSON.stringify(agileArtifactsData));
    }
    
    localStorage.setItem('devops-sent-status', 'true');
    sessionStorage.removeItem('content-generated-this-session'); // Clear session flag since content is now sent
    
    // Mark DevOps step as completed for both modes
    updateWorkflowProgress('agent', 'push-devops', true);
    updateWorkflowProgress('manual', 'push-devops', true);
    
    toast.success('Guidelines and agile artifacts sent to DevOps Integration!');

    // Show a short countdown, then navigate to DevOps Integration
    let secondsRemaining = 3;
    const toastId = toast(`Opening DevOps Integration in ${secondsRemaining}s...`, { icon: '⏳' });
    const intervalId = setInterval(() => {
      secondsRemaining -= 1;
      if (secondsRemaining > 0) {
        toast(`Opening DevOps Integration in ${secondsRemaining}s...`, { id: toastId });
      } else {
        clearInterval(intervalId);
        toast.dismiss(toastId);
        window.location.href = '/devops-integration';
      }
    }, 1000);
  };

  const copyAllContent = () => {
    let allContent = '';
    
    // Add header
    allContent += `# Frontend Prompt Generation - Complete Output\n`;
    allContent += `Generated on: ${new Date().toLocaleString()}\n`;
    allContent += `Input: ${chatInput || fileContent.substring(0, 100)}...\n\n`;
    
    // Add AI Guidelines
    if (guidelines) {
      allContent += `## AI Guidelines\n\n`;
      allContent += `---\n\n`;
      const guidelinesContent = typeof guidelines === 'string' ? guidelines : 
                               guidelines.guidelines ? guidelines.guidelines : 
                               JSON.stringify(guidelines, null, 2);
      const cleanedGuidelines = cleanGeneratedContent(guidelinesContent);
      allContent += cleanedGuidelines;
      allContent += '\n\n';
    }
    
    // Add Agile Artifacts
    if (agileArtifacts) {
      allContent += `## Agile Artifacts\n\n`;
      allContent += `---\n\n`;
      const artifactsContent = agileArtifacts.agile_artifacts || JSON.stringify(agileArtifacts, null, 2);
      const cleanedArtifacts = cleanGeneratedContent(artifactsContent);
      allContent += cleanedArtifacts;
      allContent += '\n\n';
    }
    
    // Add Statistics
    if (parsedArtifacts) {
      allContent += `## Generated Statistics\n\n`;
      allContent += `- Epics: ${parsedArtifacts.epics.length}\n`;
      allContent += `- Features: ${parsedArtifacts.features.length}\n`;
      allContent += `- User Stories: ${parsedArtifacts.userStories.length}\n\n`;
    }
    
    // Add footer
    allContent += `---\n`;
    allContent += `Generated by Frontend Prompt Generator\n`;
    allContent += `Timestamp: ${new Date().toISOString()}\n`;
    
    navigator.clipboard.writeText(allContent).then(() => {
      toast.success('All content copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy content to clipboard');
    });
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Template Sidebar */}
      {showTemplateSidebar && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowTemplateSidebar(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Prompt Library</h2>
                    <p className="text-sm text-indigo-100">Industry-specific examples</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplateSidebar(false)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Library..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Industry Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Industries</option>
                  {getAllIndustries().map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {getFilteredTemplates().map((template) => (
                  <div
                    key={template.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {template.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full">
                                {template.industry}
                              </span>
                              <span className="text-xs text-gray-500">{template.category}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getFilteredTemplates().length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                    <p className="text-sm text-gray-600">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Mode Toggle */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-b border-indigo-500/30 flex items-center justify-between">
            <div className="text-sm font-semibold">Interaction Mode</div>
            <div className="flex items-center space-x-2 bg-white/15 p-1 rounded-full">
              <button
                onClick={() => setInteractionMode('agent')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${interactionMode === 'agent' ? 'bg-white text-indigo-700 shadow' : 'text-white hover:bg-white/10'}`}
              >
                Agent Chat
              </button>
              <button
                onClick={() => setInteractionMode('manual')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${interactionMode === 'manual' ? 'bg-white text-indigo-700 shadow' : 'text-white hover:bg-white/10'}`}
              >
                Manual
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Steps Display */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
          <div className="px-8 py-6 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Workflow Progress</h3>
                    <p className="text-sm text-white/70">Track your journey through the process</p>
                  </div>
                </div>
                
                {/* Progress Summary */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {interactionMode === 'agent' 
                      ? Object.values(workflowProgress.agent).filter(Boolean).length + '/4'
                      : Object.values(workflowProgress.manual).filter(Boolean).length + '/3'
                    }
                  </div>
                  <div className="text-xs text-white/70">Steps Completed</div>
                </div>
              </div>
              
              {/* Agent Workflow */}
              {interactionMode === 'agent' && (
                <div className="flex items-center justify-center space-x-6">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center space-y-3 group">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform group-hover:scale-110 ${
                      getWorkflowStepStatus('agent', 'start-chat') 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 ring-4 ring-emerald-200' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                      {getWorkflowStepStatus('agent', 'start-chat') ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      )}
                      {getWorkflowStepStatus('agent', 'start-chat') && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold transition-colors ${
                        getWorkflowStepStatus('agent', 'start-chat') ? 'text-emerald-300' : 'text-white'
                      }`}>Start Chat</div>
                      <div className="text-xs text-white/60">Begin conversation</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <div className={`w-8 h-0.5 transition-all duration-500 ${
                      getWorkflowStepStatus('agent', 'start-chat') ? 'bg-emerald-400' : 'bg-white/30'
                    }`}></div>
                    <svg className={`w-6 h-6 transition-colors ${
                      getWorkflowStepStatus('agent', 'start-chat') ? 'text-emerald-400' : 'text-white/40'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center space-y-3 group">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform group-hover:scale-110 ${
                      getWorkflowStepStatus('agent', 'context-finalize') 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 ring-4 ring-emerald-200' 
                        : 'bg-gradient-to-r from-purple-500 to-purple-600'
                    }`}>
                      {getWorkflowStepStatus('agent', 'context-finalize') ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {getWorkflowStepStatus('agent', 'context-finalize') && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold transition-colors ${
                        getWorkflowStepStatus('agent', 'context-finalize') ? 'text-emerald-300' : 'text-white'
                      }`}>Context Finalize</div>
                      <div className="text-xs text-white/60">Define requirements</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <div className={`w-8 h-0.5 transition-all duration-500 ${
                      getWorkflowStepStatus('agent', 'context-finalize') ? 'bg-emerald-400' : 'bg-white/30'
                    }`}></div>
                    <svg className={`w-6 h-6 transition-colors ${
                      getWorkflowStepStatus('agent', 'context-finalize') ? 'text-emerald-400' : 'text-white/40'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center space-y-3 group">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform group-hover:scale-110 ${
                      getWorkflowStepStatus('agent', 'generate-guidelines') 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 ring-4 ring-emerald-200' 
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}>
                      {getWorkflowStepStatus('agent', 'generate-guidelines') ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      {getWorkflowStepStatus('agent', 'generate-guidelines') && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold transition-colors ${
                        getWorkflowStepStatus('agent', 'generate-guidelines') ? 'text-emerald-300' : 'text-white'
                      }`}>Generate Guidelines</div>
                      <div className="text-xs text-white/60">Figma & artifacts</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <div className={`w-8 h-0.5 transition-all duration-500 ${
                      getWorkflowStepStatus('agent', 'generate-guidelines') ? 'bg-emerald-400' : 'bg-white/30'
                    }`}></div>
                    <svg className={`w-6 h-6 transition-colors ${
                      getWorkflowStepStatus('agent', 'generate-guidelines') ? 'text-emerald-400' : 'text-white/40'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center space-y-3 group">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform group-hover:scale-110 ${
                      getWorkflowStepStatus('agent', 'push-devops') 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 ring-4 ring-emerald-200' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}>
                      {getWorkflowStepStatus('agent', 'push-devops') ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      )}
                      {getWorkflowStepStatus('agent', 'push-devops') && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold transition-colors ${
                        getWorkflowStepStatus('agent', 'push-devops') ? 'text-emerald-300' : 'text-white'
                      }`}>Push to DevOps</div>
                      <div className="text-xs text-white/60">Deploy & integrate</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Workflow */}
              {interactionMode === 'manual' && (
                <div className="flex items-center justify-center space-x-8">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center space-y-3 group">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform group-hover:scale-110 ${
                      getWorkflowStepStatus('manual', 'input-upload') 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 ring-4 ring-emerald-200' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                      {getWorkflowStepStatus('manual', 'input-upload') ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      )}
                      {getWorkflowStepStatus('manual', 'input-upload') && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold transition-colors ${
                        getWorkflowStepStatus('manual', 'input-upload') ? 'text-emerald-300' : 'text-white'
                      }`}>Input/Upload</div>
                      <div className="text-xs text-white/60">Chat or file upload</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <div className={`w-12 h-0.5 transition-all duration-500 ${
                      getWorkflowStepStatus('manual', 'input-upload') ? 'bg-emerald-400' : 'bg-white/30'
                    }`}></div>
                    <svg className={`w-6 h-6 transition-colors ${
                      getWorkflowStepStatus('manual', 'input-upload') ? 'text-emerald-400' : 'text-white/40'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center space-y-3 group">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform group-hover:scale-110 ${
                      getWorkflowStepStatus('manual', 'generate-guideline') 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 ring-4 ring-emerald-200' 
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}>
                      {getWorkflowStepStatus('manual', 'generate-guideline') ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      {getWorkflowStepStatus('manual', 'generate-guideline') && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold transition-colors ${
                        getWorkflowStepStatus('manual', 'generate-guideline') ? 'text-emerald-300' : 'text-white'
                      }`}>Generate Guideline</div>
                      <div className="text-xs text-white/60">Create guidelines</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <div className={`w-12 h-0.5 transition-all duration-500 ${
                      getWorkflowStepStatus('manual', 'generate-guideline') ? 'bg-emerald-400' : 'bg-white/30'
                    }`}></div>
                    <svg className={`w-6 h-6 transition-colors ${
                      getWorkflowStepStatus('manual', 'generate-guideline') ? 'text-emerald-400' : 'text-white/40'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center space-y-3 group">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform group-hover:scale-110 ${
                      getWorkflowStepStatus('manual', 'push-devops') 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 ring-4 ring-emerald-200' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}>
                      {getWorkflowStepStatus('manual', 'push-devops') ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      )}
                      {getWorkflowStepStatus('manual', 'push-devops') && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold transition-colors ${
                        getWorkflowStepStatus('manual', 'push-devops') ? 'text-emerald-300' : 'text-white'
                      }`}>Push to DevOps</div>
                      <div className="text-xs text-white/60">Deploy & integrate</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Agent (Lyzr powered) */}
        {interactionMode === 'agent' && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white via-slate-50/20 to-slate-50/20">
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white border-b border-slate-700/50 flex items-center relative overflow-hidden">
            {/* Modern animated background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              <div className="absolute top-4 left-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-6 right-12 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-4 left-16 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/90 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-sm"></div>
                  </div>
                </div>
                {meetingActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse">
                    <div className="w-full h-full bg-emerald-400 rounded-full animate-ping"></div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold tracking-wide bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">Live Meeting Chat • Lyzr</div>
                <div className="text-xs sm:text-sm text-slate-300 flex items-center space-x-1 sm:space-x-2">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${meetingActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
                  <span>Assistant is {meetingActive ? 'online' : 'offline'}</span>
                  <span>•</span>
                  <span className={meetingActive ? 'text-emerald-300' : 'text-slate-400'}>{meetingActive ? 'In meeting' : 'Ended'}</span>
                  <span>•</span>
                  <span className="font-mono text-cyan-300">{formatDuration(meetingSeconds)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-end lg:items-center gap-6 lg:gap-8 relative z-10 ml-auto lg:ml-12">
              {/* Primary Actions Row */}
              <div className="flex items-center gap-3 flex-wrap">
              {!meetingActive && (
                  <button 
                    onClick={handleStartMeeting} 
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 group flex-shrink-0"
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse group-hover:animate-spin"></div>
                    <span className="hidden sm:inline font-medium">Start Meeting</span>
                    <span className="sm:hidden font-medium">Start</span>
                  </button>
                )}
                <button 
                  onClick={handleHardReset} 
                  className="text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200 group flex-shrink-0 font-medium"
                >
                  <span className="group-hover:animate-pulse">Reset</span>
                </button>
                <button 
                  onClick={handleCopyTranscript} 
                  className="text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200 group flex-shrink-0 font-medium"
                >
                  <span className="hidden sm:inline group-hover:animate-pulse">Copy Transcript</span>
                  <span className="sm:hidden group-hover:animate-pulse">Copy</span>
                </button>
              </div>

              {/* Secondary Actions Row */}
              {chatMessages.some(m => m.role === 'assistant' && m.text.includes('project_context')) && (
                <div className="flex items-center gap-3 flex-wrap">
                  <button 
                    onClick={handleSaveProjectContext} 
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 group flex-shrink-0 font-medium"
                  >
                    <Save className="w-4 h-4 group-hover:animate-bounce" />
                    <span className="hidden sm:inline">{savedProjectContext ? 'Update Context' : 'Save Context'}</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                  <button
                    onClick={handleFinalizeProjectContext}
                    disabled={!savedProjectContext || isContextFinalized}
                    className={`text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg transform transition-all duration-200 flex items-center space-x-2 group flex-shrink-0 font-medium ${
                      (!savedProjectContext || isContextFinalized) 
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 group-hover:animate-bounce" />
                    <span className="hidden sm:inline">{isContextFinalized ? 'Finalized' : 'Finalize'}</span>
                    <span className="sm:hidden">Finalize</span>
                  </button>
                  <button
                    onClick={handleGenerateFigmaPrompt}
                    disabled={!savedProjectContext || !isContextFinalized}
                    className={`text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg transform transition-all duration-200 flex items-center space-x-2 group flex-shrink-0 font-medium ${
                      (!savedProjectContext || !isContextFinalized) 
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                    <span className="hidden sm:inline">Generate Figma Make Prompt</span>
                    <span className="sm:hidden">Figma</span>
                  </button>
                </div>
              )}

              {/* End Action */}
              <button 
                onClick={handleEndMeeting} 
                className="text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group flex-shrink-0 font-medium"
              >
                <span className="group-hover:animate-pulse">End</span>
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-white to-slate-50 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] relative overflow-hidden">
            {/* Modern geometric background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-32 right-24 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-24 left-32 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-40 right-16 w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
            </div>
            
            <div ref={messageListRef} className="space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[350px] md:max-h-[450px] lg:max-h-[500px] xl:max-h-[550px] overflow-y-auto pr-1 sm:pr-2 relative z-10 custom-scrollbar">
              {!meetingActive && chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-32 sm:h-40 md:h-48 lg:h-56">
                  <div className="text-center transform hover:scale-105 transition-all duration-300 px-4">
                    <div className="relative mb-4 sm:mb-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl transform rotate-3 animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl transform -rotate-3 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center shadow-lg">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700 text-base sm:text-lg font-semibold mb-2">Ready to start your meeting?</p>
                    <p className="text-slate-500 text-sm sm:text-base mb-4">Click "Start Meeting" to begin the conversation with your AI assistant</p>
                    <div className="flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              {chatMessages.map((m, index) => (
                <div 
                  key={m.id} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp px-2 sm:px-0`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] px-3 sm:px-4 md:px-5 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-lg border text-xs sm:text-sm transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] group ${
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white border-slate-600 rounded-br-md shadow-slate-200/50'
                        : 'bg-white text-slate-800 border-slate-200 rounded-bl-md shadow-slate-200/50 backdrop-blur-sm'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <div className="prose prose-xs sm:prose-sm max-w-none chat-md prose-headings:mt-2 sm:prose-headings:mt-3 prose-headings:mb-1 sm:prose-headings:mb-2 prose-p:my-1 sm:prose-p:my-2 prose-ul:my-1 sm:prose-ul:my-2 prose-ol:my-1 sm:prose-ol:my-2 prose-li:my-0.5 sm:prose-li:my-1 prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-h1:text-slate-900 prose-h1:font-bold prose-h1:text-lg prose-h1:underline prose-h1:decoration-cyan-500 prose-h1:decoration-2 prose-h1:underline-offset-2 prose-h2:text-slate-800 prose-h2:font-bold prose-h2:text-base prose-h2:underline prose-h2:decoration-purple-500 prose-h2:decoration-1 prose-h2:underline-offset-1 prose-h3:text-slate-700 prose-h3:font-semibold prose-h3:text-sm prose-h3:underline prose-h3:decoration-pink-500 prose-h3:decoration-1 prose-h3:underline-offset-1 prose-code:text-slate-800 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-3 prose-pre:rounded-lg prose-pre:overflow-x-auto">
                        {m.text.includes('project_context') ? (
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-cyan-50 to-purple-50 p-4 rounded-lg border border-cyan-200">
                              <h2 className="text-slate-800 font-bold text-base underline decoration-purple-500 decoration-1 underline-offset-1 mb-3">📋 Project Context</h2>
                              {(() => {
                                try {
                                  // Try to extract JSON from code block first
                                  let projectContext = null;
                                  
                                  // Check if it's wrapped in ```json code block
                                  const jsonMatch = m.text.match(/```json\s*\n?([\s\S]*?)\n?```/);
                                  if (jsonMatch) {
                                    const jsonString = jsonMatch[1];
                                    const parsed = JSON.parse(jsonString);
                                    projectContext = parsed.project_context || parsed;
                                  } else {
                                    // Fallback to original parsing method
                                    const contextMatch = m.text.match(/"project_context":\s*({[\s\S]*?})/);
                                    if (contextMatch) {
                                      projectContext = JSON.parse(contextMatch[1]);
                                    }
                                  }
                                  
                                  // If we still have the wrapper, extract just the content
                                  if (projectContext && projectContext.project_context) {
                                    projectContext = projectContext.project_context;
                                  }
                                  
                                  if (!projectContext) {
                                    throw new Error('No project context found');
                                  }
                                  
                                  return (
                                    <div className="space-y-3">
                                      {projectContext.project_name && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Project Name</h3>
                                          <p className="text-slate-700 font-medium">{projectContext.project_name}</p>
                                        </div>
                                      )}
                                      {projectContext.overview && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Overview</h3>
                                          <p className="text-slate-700">{projectContext.overview}</p>
                                        </div>
                                      )}
                                      {projectContext.tech_stack_and_justification && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Tech Stack & Justification</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.tech_stack_and_justification}</div>
                                        </div>
                                      )}
                                      {projectContext.architecture_design && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Architecture Design</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.architecture_design}</div>
                                        </div>
                                      )}
                                      {projectContext.module_component_breakdown && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Module Component Breakdown</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.module_component_breakdown}</div>
                                        </div>
                                      )}
                                      {projectContext.data_flow_and_interactions && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Data Flow & Interactions</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.data_flow_and_interactions}</div>
                                        </div>
                                      )}
                                      {projectContext.api_db_integrations && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">API & DB Integrations</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.api_db_integrations}</div>
                                        </div>
                                      )}
                                      {projectContext.security_and_performance && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Security & Performance</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.security_and_performance}</div>
                                        </div>
                                      )}
                                      {projectContext.development_best_practices && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Development Best Practices</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.development_best_practices}</div>
                                        </div>
                                      )}
                                      {projectContext.scalability_and_reliability && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Scalability & Reliability</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.scalability_and_reliability}</div>
                                        </div>
                                      )}
                                      {projectContext.implementation_roadmap_and_milestones && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Implementation Roadmap & Milestones</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.implementation_roadmap_and_milestones}</div>
                                        </div>
                                      )}
                                      {projectContext.appendix_and_examples && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Appendix & Examples</h3>
                                          <div className="text-slate-700 whitespace-pre-line">{projectContext.appendix_and_examples}</div>
                                        </div>
                                      )}
                                      {projectContext.conclusion && (
                                        <div>
                                          <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1">Conclusion</h3>
                                          <p className="text-slate-700">{projectContext.conclusion}</p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                } catch (e) {
                                  return <ReactMarkdown components={{
                                    h1: ({children}) => <h1 className="text-slate-900 font-bold text-lg underline decoration-cyan-500 decoration-2 underline-offset-2 mb-2 mt-3">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-slate-800 font-bold text-base underline decoration-purple-500 decoration-1 underline-offset-1 mb-2 mt-2">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1 mt-2">{children}</h3>,
                                    strong: ({children}) => <strong className="font-bold text-slate-900">{children}</strong>,
                                    code: ({children}) => <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs">{children}</code>,
                                    pre: ({children}) => <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-xs">{children}</pre>,
                                    p: ({children}) => <p className="text-slate-700 leading-relaxed mb-2">{children}</p>,
                                    ul: ({children}) => <ul className="list-disc list-inside text-slate-700 space-y-1 mb-2">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal list-inside text-slate-700 space-y-1 mb-2">{children}</ol>,
                                    li: ({children}) => <li className="text-slate-700">{children}</li>
                                  }}>{m.text}</ReactMarkdown>;
                                }
                              })()}
                            </div>
                      </div>
                    ) : (
                          <ReactMarkdown
                            components={{
                              h1: ({children}) => <h1 className="text-slate-900 font-bold text-lg underline decoration-cyan-500 decoration-2 underline-offset-2 mb-2 mt-3">{children}</h1>,
                              h2: ({children}) => <h2 className="text-slate-800 font-bold text-base underline decoration-purple-500 decoration-1 underline-offset-1 mb-2 mt-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-slate-700 font-semibold text-sm underline decoration-pink-500 decoration-1 underline-offset-1 mb-1 mt-2">{children}</h3>,
                              strong: ({children}) => <strong className="font-bold text-slate-900">{children}</strong>,
                              code: ({children}) => <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs">{children}</code>,
                              pre: ({children}) => <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-xs">{children}</pre>,
                              p: ({children}) => <p className="text-slate-700 leading-relaxed mb-2">{children}</p>,
                              ul: ({children}) => <ul className="list-disc list-inside text-slate-700 space-y-1 mb-2">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside text-slate-700 space-y-1 mb-2">{children}</ol>,
                              li: ({children}) => <li className="text-slate-700">{children}</li>
                            }}
                          >
                            {m.text}
                          </ReactMarkdown>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">{m.text}</p>
                    )}
                    {/* Message timestamp */}
                    <div className={`text-xs mt-1 sm:mt-2 opacity-70 flex items-center space-x-1 ${m.role === 'user' ? 'text-slate-300' : 'text-slate-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${m.role === 'user' ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
              {assistantTyping && (
                    <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-5 py-3 sm:py-4 animate-fadeInUp">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-cyan-100 to-purple-100 flex items-center justify-center shadow-lg">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse"></div>
                      </div>
                      <div className="bg-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg border border-slate-200">
                        <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                          <span className="text-xs sm:text-sm text-slate-600 font-medium">Assistant is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-slate-200/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-1 relative">
              <input
                type="text"
                value={liveChatInput}
                onChange={(e) => setLiveChatInput(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && liveChatInput.trim() && meetingActive && !assistantTyping) {
                    e.preventDefault();
                    try {
                      const text = liveChatInput.trim();
                      setChatMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text }]);
                      setLiveChatInput('');
                      setAssistantTyping(true);
                      const result = await runLyzrContextAgentStep(text, memoryContext, lastNextAction);
                      const reply = result?.response || '';
                      setMemoryContext(result?.memory_context || []);
                      setLastNextAction(result?.next_action || null);
                      setChatMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: reply }]);
                    } catch (err) {
                      toast.error('Chat agent failed');
                      setChatMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: 'Sorry, I could not process that right now.' }]);
                    } finally {
                      setAssistantTyping(false);
                    }
                  }
                }}
                placeholder={meetingActive ? (assistantTyping ? "Assistant is responding..." : "Type your question...") : "Start meeting to begin..."}
                  className={`w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 text-xs sm:text-sm shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                  meetingActive && !assistantTyping
                      ? 'border-slate-300 bg-white focus:border-cyan-500 focus:ring-cyan-200 shadow-slate-100/50 hover:shadow-slate-200/50' 
                      : 'border-slate-200 bg-slate-100 text-slate-400 shadow-slate-100/50'
                }`}
                disabled={!meetingActive || assistantTyping}
              />
                {/* Input decoration */}
                {meetingActive && !assistantTyping && (
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <button
                onClick={async () => {
                  if (!liveChatInput.trim() || !meetingActive || assistantTyping) return;
                  try {
                    const text = liveChatInput.trim();
                    setChatMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text }]);
                    setLiveChatInput('');
                    setAssistantTyping(true);
                    const result = await runLyzrContextAgentStep(text, memoryContext, lastNextAction);
                    const reply = result?.response || '';
                    const nextAction = result?.next_action || null;
                    setMemoryContext(result?.memory_context || []);
                    setLastNextAction(nextAction);
                    // If user confirmed proceed and agent indicates completion, generate final context
                    if ((/\b(proceed|yes)\b/i.test(text) || (nextAction && (nextAction.next_step === null || nextAction.current_step >= 10))) && !finalGenerated) {
                      setFinalGenerated(true);
                      // Removed completion message - no finalDoc needed
                    } else {
                      setChatMessages((m) => {
                        const last = m[m.length - 1];
                        if (last?.role === 'assistant' && (last.text || '').trim() === reply.trim()) return m; // de-dupe
                        return [...m, { id: `a-${Date.now()}`, role: 'assistant', text: reply }];
                      });
                    }
                  } catch (err) {
                    toast.error('Chat agent failed');
                    setChatMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: 'Sorry, I could not process that right now.' }]);
                  } finally {
                    setAssistantTyping(false);
                  }
                }}
                className={`px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg transform transition-all duration-300 flex items-center space-x-1 sm:space-x-2 group ${
                  meetingActive && !assistantTyping && liveChatInput.trim()
                    ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 hover:shadow-xl hover:scale-105 focus:ring-4 focus:ring-slate-200' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
                disabled={assistantTyping || !liveChatInput.trim() || !meetingActive}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
                <span className="font-medium hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Saved Project Context Display (hidden in Manual mode) */}
        {interactionMode !== 'manual' && savedProjectContext && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Saved Project Context</h2>
                    <p className="text-blue-100">
                      Last saved: {localStorage.getItem('savedProjectContextTimestamp') ? 
                        new Date(localStorage.getItem('savedProjectContextTimestamp')).toLocaleString() : 
                        'Unknown'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(savedProjectContext)
                        .then(() => toast.success('Project context copied to clipboard'))
                        .catch(() => toast.error('Failed to copy'));
                    }}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => {
                      const element = document.createElement('a');
                      const file = new Blob([savedProjectContext], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = 'project-context.md';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      toast.success('Project context downloaded');
                    }}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      setSavedProjectContext(null);
                      localStorage.removeItem('savedProjectContext');
                      localStorage.removeItem('savedProjectContextTimestamp');
                      toast.success('Project context cleared');
                    }}
                    className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none max-h-96 overflow-y-auto">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="text-gray-600 mb-3 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-gray-600">{children}</li>,
                    code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600">{children}</code>,
                    pre: ({children}) => <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mb-3">{children}</pre>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 mb-3 bg-blue-50 py-2">{children}</blockquote>,
                    strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>
                  }}
                >
                  {savedProjectContext}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Input Type Selection - only show in Manual mode */}
        {interactionMode === 'manual' && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
            <h2 className="text-xl font-semibold text-white mb-2">Input Method</h2>
            <p className="text-blue-100">Choose how you'd like to provide your requirements</p>
              </div>
              <div className="flex space-x-2">
                {hasGeneratedContent && (
                  <button
                    onClick={resetGeneration}
                    className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  onClick={() => window.location.href = '/generation-history'}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => setShowTemplateSidebar(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Prompt Library</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setInputType('chat')}
                className={`flex-1 px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 ${
                  inputType === 'chat' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">Chat Input</span>
              </button>
              <button
                onClick={() => setInputType('file')}
                className={`flex-1 px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 ${
                  inputType === 'file' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">File Upload</span>
              </button>
            </div>

            {/* Chat Input */}
            {inputType === 'chat' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  <label className="block text-sm font-semibold text-gray-800">
                    Requirement Description
                  </label>
                  </div>
                  <button
                    onClick={() => setShowTemplateSidebar(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Use Template</span>
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="I need the system ability to ingest bureau rating algorithms. I will import filing to create rating calculation using AI and leverage machine learning for premium calculations..."
                    className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none text-gray-700 placeholder-gray-400 shadow-sm"
                    maxLength={MAX_INPUT_CHARS}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {chatInput.length}/{MAX_INPUT_CHARS} characters
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            {inputType === 'file' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <label className="block text-sm font-semibold text-gray-800">
                    Document Upload
                  </label>
                </div>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 bg-gradient-to-b from-blue-25 to-white"
                >
                  {!selectedFile ? (
                    <>
                      <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Your Document</h3>
                      <p className="text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                      <p className="text-sm text-gray-500 mb-6">Supports: PDF, Excel (.xlsx, .xls), Text (.txt, .md)</p>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Choose File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.xlsx,.xls,.txt,.md"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                        <FileText className="w-10 h-10 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-800 transition-colors font-medium"
                      >
                        Remove File
                      </button>
                    </div>
                  )}
                </div>

                {fileContent && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <label className="block text-sm font-semibold text-gray-800">
                        Extracted Content Preview
                      </label>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {fileContent.substring(0, 500)}
                        {fileContent.length > 500 && (
                          <span className="text-blue-600 font-medium">... ({fileContent.length - 500} more characters)</span>
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Generate Button - only for Manual mode */}
        {interactionMode === 'manual' && (
        <div className="flex justify-center">
          <button
            onClick={generateGuidelines}
            disabled={isProcessing || !getInputContent().trim()}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-base font-semibold shadow-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Guidelines...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Prompt Generation
              </>
            )}
          </button>
        </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Generating Content</h2>
                    <p className="text-blue-100">Please wait while we process your requirements...</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Processing AI Guidelines</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Generating Agile Artifacts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Content - Tabbed Interface */}
        {!isProcessing && (guidelines || agileArtifacts) && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header with Tabs */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Generated Content</h2>
                    <p className="text-indigo-100">View both AI Guidelines and Agile Artifacts</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={copyAllContent}
                    disabled={!guidelines && !agileArtifacts}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy All</span>
                  </button>
                  <button
                    onClick={downloadGuidelines}
                    disabled={!guidelines}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={sendToDevOps}
                    disabled={!guidelines}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>Send to DevOps</span>
                  </button>
                  {agileArtifacts && (
                    <button
                      onClick={() => window.location.href = '/user-stories'}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>View User Stories</span>
                    </button>
                  )}
                </div>
            </div>
            
              {/* Tab Navigation */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('guidelines')}
                  disabled={!guidelines}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === 'guidelines' && guidelines
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : guidelines
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      : 'bg-white bg-opacity-10 text-white opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Guidelines</span>
                  {guidelines && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                </button>
                <button
                  onClick={() => setActiveTab('artifacts')}
                  disabled={!agileArtifacts}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === 'artifacts' && agileArtifacts
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : agileArtifacts
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      : 'bg-white bg-opacity-10 text-white opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Agile Artifacts</span>
                  {agileArtifacts && <div className="w-2 h-2 bg-purple-400 rounded-full"></div>}
                </button>
                <button
                  onClick={() => setActiveTab('both')}
                  disabled={!guidelines || !agileArtifacts}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === 'both' && guidelines && agileArtifacts
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : guidelines && agileArtifacts
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      : 'bg-white bg-opacity-10 text-white opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Compare Both</span>
                  {guidelines && agileArtifacts && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Guidelines Tab */}
              {activeTab === 'guidelines' && guidelines && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">AI Guidelines Response</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">Generated Successfully</span>
                    </div>
                  </div>
              <div className="prose prose-lg max-w-none">
                {typeof guidelines === 'string' ? (
                  <ReactMarkdown 
                    className="markdown-content"
                    components={{
                      h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-200 pb-3">{children}</h1>,
                      h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-medium text-gray-700 mb-3 mt-6">{children}</h3>,
                      p: ({children}) => <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                      li: ({children}) => <li className="text-gray-600">{children}</li>,
                      code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600">{children}</code>,
                      pre: ({children}) => <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,
                      strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>
                    }}
                  >
                    {guidelines}
                  </ReactMarkdown>
                ) : guidelines.guidelines ? (
                  <ReactMarkdown 
                    className="markdown-content"
                    components={{
                      h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-200 pb-3">{children}</h1>,
                      h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-medium text-gray-700 mb-3 mt-6">{children}</h3>,
                      p: ({children}) => <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                      li: ({children}) => <li className="text-gray-600">{children}</li>,
                      code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600">{children}</code>,
                      pre: ({children}) => <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,
                      strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>
                    }}
                  >
                    {guidelines.guidelines}
                  </ReactMarkdown>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border">
                    {JSON.stringify(guidelines, null, 2)}
                  </pre>
                )}
              </div>
                </div>
              )}

              {/* Agile Artifacts Tab */}
              {activeTab === 'artifacts' && agileArtifacts && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Agile Artifacts Response</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-purple-600 font-medium">Generated Successfully</span>
                    </div>
                  </div>

                  {/* Statistics */}
                  {(() => {
                    // Only show current generation's parsed artifacts, not accumulated context data
                    const epicsCount = parsedArtifacts?.epics?.length ?? 0;
                    const featuresCount = parsedArtifacts?.features?.length ?? 0;
                    const userStoriesCount = parsedArtifacts?.userStories?.length ?? 0;
                    return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-red-100 rounded-xl w-fit mx-auto mb-3">
                        <Target className="w-8 h-8 text-red-600" />
                    </div>
                      <div className="text-3xl font-bold text-red-600">{epicsCount}</div>
                      <div className="text-sm text-red-600 font-medium">Epics Created</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-3">
                        <Zap className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600">{featuresCount}</div>
                      <div className="text-sm text-blue-600 font-medium">Features Created</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-3">
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-green-600">{userStoriesCount}</div>
                      <div className="text-sm text-green-600 font-medium">User Stories Created</div>
                    </div>
                  </div>
                    );
                  })()}

                  {/* Structured Agile Artifacts Display */}
                  <div className="space-y-8">
                    {/* Show message if no artifacts parsed yet */}
                    {(!parsedArtifacts || (parsedArtifacts.epics.length === 0 && parsedArtifacts.features.length === 0 && parsedArtifacts.userStories.length === 0)) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="p-3 bg-yellow-100 rounded-full">
                            <AlertCircle className="w-8 h-8 text-yellow-600" />
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold text-yellow-800 mb-2">No Parsed Artifacts Yet</h4>
                        <p className="text-sm text-yellow-700 mb-4">
                          The AI generated content but it couldn't be parsed into structured artifacts. 
                          This might happen if the output format doesn't match the expected structure.
                        </p>
                        <p className="text-xs text-yellow-600">
                          You can still view the raw output in the "Complete Raw Output" section below.
                        </p>
                      </div>
                    )}
                    
                    {/* Epics Section */}
                    {parsedArtifacts?.epics && parsedArtifacts.epics.length > 0 && (
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-red-100 rounded-xl">
                            <Target className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-red-800">Epics</h4>
                            <p className="text-sm text-red-600">High-level objectives and goals</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {parsedArtifacts.epics.map((epic, index) => {
                            // Count related features and stories
                            const relatedFeatures = parsedArtifacts.features?.filter(f => f.epicId === epic.id) || [];
                            const relatedStories = parsedArtifacts.userStories?.filter(s => 
                              relatedFeatures.some(f => f.title === s.feature)
                            ) || [];
                            
                            return (
                            <div key={epic.id} className="bg-white rounded-xl p-5 border border-red-200 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                  <span className="text-sm font-bold text-red-600">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 mb-2">{epic.title}</h5>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center space-x-1">
                                      <Zap className="w-4 h-4" />
                                      <span>{relatedFeatures.length} Features</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Users className="w-4 h-4" />
                                      <span>{relatedStories.length} User Stories</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Features Section */}
                    {parsedArtifacts?.features && parsedArtifacts.features.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <Zap className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-blue-800">Features</h4>
                            <p className="text-sm text-blue-600">Functional groupings and capabilities</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {parsedArtifacts.features.map((feature, index) => {
                            // Count related stories
                            const relatedStories = parsedArtifacts.userStories?.filter(s => s.feature === feature.title) || [];
                            
                            return (
                            <div key={feature.id} className="bg-white rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 text-sm mb-1">{feature.title}</h5>
                                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                                    <Users className="w-3 h-3" />
                                    <span>{relatedStories.length} User Stories</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* User Stories Section */}
                    {parsedArtifacts?.userStories && parsedArtifacts.userStories.length > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-green-100 rounded-xl">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-green-800">User Stories</h4>
                            <p className="text-sm text-green-600">Detailed requirements from user perspective</p>
                          </div>
                        </div>
                        
                        {/* Group stories by feature */}
                        {(() => {
                          const storyGroups = {};
                          parsedArtifacts.userStories.forEach(story => {
                            const featureName = story.feature || 'Ungrouped';
                            if (!storyGroups[featureName]) {
                              storyGroups[featureName] = [];
                            }
                            storyGroups[featureName].push(story);
                          });
                          
                          return (
                            <div className="space-y-6">
                              {Object.entries(storyGroups).map(([featureName, stories]) => (
                                <div key={featureName} className="bg-white rounded-xl p-4 border border-green-200">
                                  <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-green-100">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                    <h5 className="font-semibold text-gray-900 text-sm">{featureName}</h5>
                                    <span className="text-xs text-gray-500">({stories.length} {stories.length === 1 ? 'story' : 'stories'})</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {stories.map((story, storyIndex) => (
                                      <div 
                                        key={story.id} 
                                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer"
                                        onClick={() => {
                                          setSelectedUserStory(story);
                                          setShowUserStoryModal(true);
                                        }}
                                      >
                                        <div className="flex items-start space-x-2 mb-2">
                                          <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                                            <span className="text-xs font-bold text-green-600">{storyIndex + 1}</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-xs mb-1 line-clamp-2">{story.title}</p>
                                            {story.persona && (
                                              <div className="flex items-center space-x-1 mb-2">
                                                <Users className="w-3 h-3 text-purple-500" />
                                                <span className="text-xs font-semibold text-purple-600">{story.persona}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Acceptance Criteria Preview */}
                                        {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                                          <div className="mb-2">
                                            <div className="bg-white rounded p-2 border border-gray-200">
                                              <h6 className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                                                <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                                                Acceptance Criteria ({story.acceptanceCriteria.length})
                                              </h6>
                                              <ul className="space-y-0.5">
                                                {story.acceptanceCriteria.slice(0, 2).map((criteria, criteriaIndex) => (
                                                  <li key={criteriaIndex} className="text-xs text-gray-600 flex items-start">
                                                    <span className="text-green-500 mr-1">•</span>
                                                    <span className="line-clamp-1">{criteria}</span>
                                                  </li>
                                                ))}
                                                {story.acceptanceCriteria.length > 2 && (
                                                  <li className="text-xs text-green-600 font-medium">
                                                    +{story.acceptanceCriteria.length - 2} more...
                                                  </li>
                                                )}
                                              </ul>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Meta info */}
                                        <div className="flex items-center justify-between text-xs">
                                          {story.priority && (
                                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                                              story.priority === 'High' ? 'bg-red-100 text-red-600' :
                                              story.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                              'bg-blue-100 text-blue-600'
                                            }`}>
                                              {story.priority}
                                            </span>
                                          )}
                                          {story.storyPoints > 0 && (
                                            <span className="text-gray-600 font-medium">
                                              {story.storyPoints} SP
                                            </span>
                                          )}
                                          <span className="text-green-600 font-medium ml-auto">View →</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Raw Output Section (Collapsible) */}
                    <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="p-4 bg-gray-100 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800">Complete Raw Output</h4>
                        <p className="text-sm text-gray-600">Full agile artifacts response from AI</p>
                      </div>
                      <div className="p-4">
                        <div className="max-h-64 overflow-y-auto bg-white p-4 rounded-lg border border-gray-300">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {agileArtifacts.agile_artifacts}
                      </pre>
                    </div>
                  </div>
                  </div>
                  </div>


                </div>
              )}

              {/* Compare Both Tab */}
              {activeTab === 'both' && guidelines && agileArtifacts && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Side-by-Side Comparison</h3>
                    <p className="text-gray-600">Both AI responses generated from the same input</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Guidelines Column */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-blue-800">AI Guidelines</h4>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Success</span>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto bg-white p-4 rounded-lg border border-blue-300">
                        <div className="prose prose-sm max-w-none">
                          {typeof guidelines === 'string' ? (
                            <ReactMarkdown className="markdown-content text-sm">
                              {guidelines}
                            </ReactMarkdown>
                          ) : guidelines.guidelines ? (
                            <ReactMarkdown className="markdown-content text-sm">
                              {guidelines.guidelines}
                            </ReactMarkdown>
                          ) : (
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(guidelines, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Agile Artifacts Column */}
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-purple-800">Agile Artifacts</h4>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs text-purple-600">Success</span>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto bg-white p-4 rounded-lg border border-purple-300">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                          {agileArtifacts.agile_artifacts}
                        </pre>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2 rounded border border-purple-200">
                          <div className="text-lg font-bold text-purple-600">{parsedArtifacts?.epics?.length ?? 0}</div>
                          <div className="text-xs text-purple-600">Epics</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-purple-200">
                          <div className="text-lg font-bold text-purple-600">{parsedArtifacts?.features?.length ?? 0}</div>
                          <div className="text-xs text-purple-600">Features</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-purple-200">
                          <div className="text-lg font-bold text-purple-600">{parsedArtifacts?.userStories?.length ?? 0}</div>
                          <div className="text-xs text-purple-600">Stories</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Example Input */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Example Input</h2>
                <p className="text-gray-200">Sample requirement for AI guidelines generation</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 mb-4 font-medium">Here's an example of the expected input format:</p>
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">
{`"I need the system ability to ingest bureau rating algorithms. As an actuary, as part of rate making process, I will import filing to create rating calculation using AI and leverage machine learning for premium calculations. The objective of the requirement is to automate the process of interpreting insurer-submitted rate filing documents (PDFs) and converting them into executable rating logic using AI."`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* User Story Detail Modal */}
        {showUserStoryModal && selectedUserStory && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUserStoryModal(false);
              }
            }}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">User Story Details</h2>
                      <p className="text-green-100">Complete breakdown with epic and feature context</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserStoryModal(false)}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-6">
                  {/* Epic Context */}
                  {selectedUserStory.epic && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-red-800">Related Epic</h3>
                          <p className="text-sm text-red-600">High-level objective</p>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium">{selectedUserStory.epic.title}</p>
                    </div>
                  )}

                  {/* Feature Context */}
                  {selectedUserStory.feature && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-blue-800">Related Feature</h3>
                          <p className="text-sm text-blue-600">Functional grouping</p>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium">{selectedUserStory.feature.title}</p>
                    </div>
                  )}

                  {/* User Story Details */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-800">User Story</h3>
                        <p className="text-sm text-green-600">Detailed requirement</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-gray-800 font-medium leading-relaxed">{selectedUserStory.title}</p>
                    </div>
                  </div>

                  {/* Acceptance Criteria */}
                  {selectedUserStory.acceptanceCriteria && selectedUserStory.acceptanceCriteria.length > 0 && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">Acceptance Criteria</h3>
                          <p className="text-sm text-gray-600">Definition of done</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <ul className="space-y-3">
                          {selectedUserStory.acceptanceCriteria.map((criteria, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-xs font-bold text-green-600">{index + 1}</span>
                              </div>
                              <p 
                                className="text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formatCriteriaWithBoldKeywords(criteria) }}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Hierarchy Visualization */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-purple-800">Hierarchy</h3>
                        <p className="text-sm text-purple-600">Project structure breakdown</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>Epic</span>
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Feature</span>
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>User Story</span>
                        </span>
                      </div>
                    </div>
                  </div>


                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserStoryModal(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Could add functionality to edit or take action on the user story
                      toast.success('User story details viewed');
                    }}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Mark as Reviewed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      
      </div>
    </div>
  );
}

export default GuidelinesGeneratorWithAzure;

