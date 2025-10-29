// Utility functions to parse agile artifacts response into structured data

export const parseAgileArtifacts = (artifactsText) => {
  if (!artifactsText || typeof artifactsText !== 'string') {
    console.warn('Invalid artifacts text provided to parser');
    return { epics: [], features: [], userStories: [] };
  }

  const lines = artifactsText.split('\n');
  const result = { epics: [], features: [], userStories: [] };

  let currentFeature = null;
  let currentUserStory = null;
  let isInAcceptanceCriteria = false;
  let acceptanceCriteria = [];
  let currentPriority = 'Medium';
  let currentStoryPoints = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;

    // Skip section headers
    if (trimmedLine === 'Features:' || trimmedLine === 'User Stories:') {
      continue;
    }

    // 1) Epic detection - starts with "Epic:" or is the first meaningful line
    if (trimmedLine.startsWith('Epic:')) {
      const epicTitle = trimmedLine.replace(/^Epic:\s*/, '').trim();
      if (epicTitle) {
        result.epics.push({
          id: generateId('epic'),
          title: epicTitle,
          description: epicTitle,
          priority: 'High',
          status: 'Pending',
          createdAt: new Date().toISOString()
        });
      }
      continue;
    }

    // 2) Feature detection - "Feature N:" format
    if (/^\s*Feature\s+\d+:/.test(line)) {
      // Save any pending story before starting new feature
      if (currentUserStory) {
        if (acceptanceCriteria.length > 0) {
          currentUserStory.acceptanceCriteria = [...acceptanceCriteria];
        }
        currentUserStory = null;
        acceptanceCriteria = [];
        isInAcceptanceCriteria = false;
      }

      const featureMatch = trimmedLine.match(/Feature\s+\d+:\s*(.+)/);
      if (featureMatch) {
        const featureTitle = featureMatch[1].trim();
        currentFeature = {
          id: generateId('feature'),
          title: featureTitle,
          description: featureTitle,
          priority: 'Medium',
          status: 'Pending',
          userStories: [],
          createdAt: new Date().toISOString()
        };
        result.features.push(currentFeature);
      }
      continue;
    }

    // 3) User Story detection - "- Story N:" or "Story N:" format
    if (/^\s*-?\s*Story\s+\d+:/.test(line)) {
      // Save previous story's acceptance criteria
      if (currentUserStory && acceptanceCriteria.length > 0) {
        currentUserStory.acceptanceCriteria = [...acceptanceCriteria];
      }

      const storyMatch = trimmedLine.match(/-?\s*Story\s+\d+:\s*(.+)/);
      if (storyMatch) {
        const storyText = storyMatch[1].trim();
        
        // Extract persona from "As a [Persona], I want..." format
        const personaMatch = storyText.match(/As (?:a |an )?([^,]+),/i);
        const persona = personaMatch ? personaMatch[1].trim() : 'User';
        
        currentUserStory = {
          id: generateId('story'),
          title: storyText,
          description: storyText,
          persona: persona,
          feature: currentFeature?.title || 'General',
          priority: 'Medium',
          status: 'Pending',
          storyPoints: 0,
          acceptanceCriteria: [],
          createdAt: new Date().toISOString()
        };
        result.userStories.push(currentUserStory);
        
        // Add story reference to feature
        if (currentFeature && !currentFeature.userStories) {
          currentFeature.userStories = [];
        }
        if (currentFeature) {
          currentFeature.userStories.push(currentUserStory.id);
        }
        
        acceptanceCriteria = [];
        isInAcceptanceCriteria = false;
        currentPriority = 'Medium';
        currentStoryPoints = 0;
      }
      continue;
    }

    // 4) Acceptance Criteria section detection
    if (trimmedLine === 'Acceptance Criteria:' || trimmedLine.startsWith('Acceptance Criteria:')) {
      isInAcceptanceCriteria = true;
      continue;
    }

    // 5) Acceptance Criteria items (bullet points)
    if (isInAcceptanceCriteria && currentUserStory) {
      // Look for bullet points (•, -, *, numbers)
      if (/^\s*[•\-*]/.test(line) || /^\s*\d+\./.test(line)) {
        const criteriaText = trimmedLine.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        if (criteriaText && !criteriaText.startsWith('Priority:') && !criteriaText.startsWith('Story Points:')) {
          acceptanceCriteria.push(criteriaText);
        }
        continue;
      }
      // Also accept Given/When/Then format
      if (trimmedLine.startsWith('Given') || trimmedLine.startsWith('When') || 
          trimmedLine.startsWith('Then') || trimmedLine.startsWith('And')) {
        acceptanceCriteria.push(trimmedLine);
        continue;
      }
    }

    // 6) Priority detection
    if (trimmedLine.startsWith('Priority:') && currentUserStory) {
      const priorityMatch = trimmedLine.match(/Priority:\s*(\w+)/i);
      if (priorityMatch) {
        currentPriority = priorityMatch[1];
        currentUserStory.priority = currentPriority;
        isInAcceptanceCriteria = false; // Priority comes after acceptance criteria
      }
      continue;
    }

    // 7) Story Points detection
    if (trimmedLine.startsWith('Story Points:') && currentUserStory) {
      const pointsMatch = trimmedLine.match(/Story Points:\s*(\d+)/i);
      if (pointsMatch) {
        currentStoryPoints = parseInt(pointsMatch[1], 10);
        currentUserStory.storyPoints = currentStoryPoints;
      }
      continue;
    }

    // 8) Fallback Epic capture if no explicit Epic: found
    if (result.epics.length === 0 && 
        !trimmedLine.startsWith('Feature') && 
        !trimmedLine.startsWith('Story') &&
        !trimmedLine.startsWith('-') &&
        !isInAcceptanceCriteria &&
        trimmedLine.length > 10) { // Meaningful text
      result.epics.push({
        id: generateId('epic'),
        title: trimmedLine,
        description: trimmedLine,
        priority: 'High',
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
    }
  }

  // Save last story's acceptance criteria
  if (currentUserStory && acceptanceCriteria.length > 0) {
    currentUserStory.acceptanceCriteria = [...acceptanceCriteria];
  }

  console.log('✅ Parser Results:', {
    epics: result.epics.length,
    features: result.features.length,
    userStories: result.userStories.length
  });

  return result;
};

// Helper function to generate unique IDs
const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Function to merge new artifacts with existing data
export const mergeAgileArtifacts = (existingData, newArtifacts) => {
  return {
    epics: [...existingData.epics, ...newArtifacts.epics],
    features: [...existingData.features, ...newArtifacts.features],
    userStories: [...existingData.userStories, ...newArtifacts.userStories]
  };
};
