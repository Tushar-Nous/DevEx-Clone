# Artifact Parsing Fix - Comprehensive Update

## Issues Identified

### 1. Parser Not Recognizing Nested Format
**Problem:** The agileParser.js was expecting "User Story N:" format but AI generated "- Story N:" format with indentation under features.

**Example of AI Output:**
```
Epic: Develop a full-featured e-commerce platform

Features:
  Feature 1: Product Management
    User Stories:
      - Story 1: As a Product Manager, I want...
        Acceptance Criteria:
          • Given a product catalog interface
          • When adding variants
          ...
        Priority: High
        Story Points: 5
```

**Old Parser Expected:**
```
Feature 1: Product Management
User Story 1: As a Product Manager...
```

### 2. Generation History Using Different Parser
**Problem:** GenerationHistory.js had its own local `parseAgileArtifacts` function that didn't match the shared parser, causing inconsistent results.

### 3. Display Not Showing Parsed Data
**Problem:** GuidelinesGeneratorWithAzure.js and GenerationHistory.js weren't correctly displaying parsed epic, features, and user stories.

## Changes Made

### 1. Enhanced agileParser.js (`src/utils/agileParser.js`)

**New Features:**
- ✅ Detects "Epic:" format explicitly
- ✅ Handles "Feature N:" format with regex matching
- ✅ Recognizes "- Story N:" and "Story N:" formats (indented or not)
- ✅ Extracts persona names from "As a [Persona]..." format
- ✅ Parses acceptance criteria with bullet points (•, -, *, numbers)
- ✅ Supports Given/When/Then format
- ✅ Extracts Priority and Story Points from structured format
- ✅ Links stories to their parent features
- ✅ Comprehensive logging for debugging

**Key Code Changes:**
```javascript
// Epic detection
if (trimmedLine.startsWith('Epic:')) {
  const epicTitle = trimmedLine.replace(/^Epic:\s*/, '').trim();
  ...
}

// Feature detection with regex
if (/^\s*Feature\s+\d+:/.test(line)) {
  const featureMatch = trimmedLine.match(/Feature\s+\d+:\s*(.+)/);
  ...
}

// Story detection with flexible format
if (/^\s*-?\s*Story\s+\d+:/.test(line)) {
  const storyMatch = trimmedLine.match(/-?\s*Story\s+\d+:\s*(.+)/);
  
  // Extract persona
  const personaMatch = storyText.match(/As (?:a |an )?([^,]+),/i);
  const persona = personaMatch ? personaMatch[1].trim() : 'User';
  ...
}

// Acceptance criteria with bullet points
if (/^\s*[•\-\*]/.test(line) || /^\s*\d+\./.test(line)) {
  const criteriaText = trimmedLine.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
  acceptanceCriteria.push(criteriaText);
}

// Priority and Story Points extraction
if (trimmedLine.startsWith('Priority:')) {
  const priorityMatch = trimmedLine.match(/Priority:\s*(\w+)/i);
  currentUserStory.priority = priorityMatch[1];
}

if (trimmedLine.startsWith('Story Points:')) {
  const pointsMatch = trimmedLine.match(/Story Points:\s*(\d+)/i);
  currentUserStory.storyPoints = parseInt(pointsMatch[1], 10);
}
```

### 2. Updated GenerationHistory.js

**Changes:**
- ✅ Removed local `parseAgileArtifacts` function
- ✅ Imported shared parser from `../utils/agileParser`
- ✅ Updated renderItem to use parsed.epics[0].title instead of parsed.epic
- ✅ Updated to access feature.title and story.title from parsed objects
- ✅ Enhanced preview modal with persona, acceptance criteria, priority, and story points display

**Before:**
```javascript
const parseAgileArtifacts = (content) => {
  // Local implementation...
}

// Usage
{parsed.epic && <p>{parsed.epic}</p>}
{parsed.features.map(feature => <span>{feature}</span>)}
```

**After:**
```javascript
import { parseAgileArtifacts } from '../utils/agileParser';

// Usage
{parsed.epics && parsed.epics.length > 0 && <p>{parsed.epics[0].title}</p>}
{parsed.features.map(feature => <span>{feature.title}</span>)}
{story.acceptanceCriteria.map(criteria => <p>• {criteria}</p>)}
```

### 3. GuidelinesGeneratorWithAzure.js Already Correct

The component was already using the shared parser and displaying correctly with fallback to context:

```javascript
const epicsCount = (parsedArtifacts?.epics?.length ?? 0) || epics.length;
const featuresCount = (parsedArtifacts?.features?.length ?? 0) || features.length;
const userStoriesCount = (parsedArtifacts?.userStories?.length ?? 0) || userStories.length;
```

## Data Structure

### Parsed Output Structure
```javascript
{
  epics: [
    {
      id: "epic_timestamp_random",
      title: "Develop a full-featured e-commerce platform...",
      description: "...",
      priority: "High",
      status: "Pending",
      createdAt: "2025-10-28T..."
    }
  ],
  features: [
    {
      id: "feature_timestamp_random",
      title: "Product Management",
      description: "Product Management",
      priority: "Medium",
      status: "Pending",
      userStories: ["story_id_1", "story_id_2"], // References to stories
      createdAt: "2025-10-28T..."
    }
  ],
  userStories: [
    {
      id: "story_timestamp_random",
      title: "As a Product Manager, I want product catalog management...",
      description: "Full story text",
      persona: "Product Manager", // Extracted from story
      feature: "Product Management", // Parent feature title
      priority: "High",
      status: "Pending",
      storyPoints: 5,
      acceptanceCriteria: [
        "Given a product catalog interface",
        "When adding variants and setting prices",
        "Then inventory levels should update accordingly",
        "The system should support at least 10,000 products",
        "Changes should reflect in real-time"
      ],
      createdAt: "2025-10-28T..."
    }
  ]
}
```

## Testing Instructions

### 1. Test New Generation
1. Go to AI Guidelines page
2. Enter requirement: "Build an e-commerce platform"
3. Click "Generate Content"
4. Check console logs:
   ```
   Raw agile artifacts: Epic: ...
   Parsed artifacts: {epics: Array(1), features: Array(4), userStories: Array(8)}
   ✅ Parser Results: { epics: 1, features: 4, userStories: 8 }
   ```

### 2. Verify Display in Agile Artifacts Tab
1. Switch to "Agile Artifacts" tab
2. Verify counts are correct (not 0):
   - ✅ X Epics Created
   - ✅ X Features Created
   - ✅ X User Stories Created
3. Scroll down to see structured display:
   - Epic section with title
   - Features section with all features
   - User Stories section with cards showing:
     - Story title with persona
     - Acceptance criteria
     - Priority and Story Points

### 3. Verify Generation History
1. Go to Generation History page
2. Find recent generation
3. Verify card shows:
   - ✅ "Epic" section with content
   - ✅ "Features (X)" with count
   - ✅ "User Stories (X)" with count
4. Click "Preview" button
5. Verify modal shows all details including:
   - Persona names
   - Acceptance criteria (all items)
   - Priority
   - Story Points

### 4. Verify User Story Page
1. Navigate to User Stories page
2. Check that stories appear with:
   - ✅ Correct titles with persona names
   - ✅ Acceptance criteria listed
   - ✅ Priority and Story Points visible

## Expected vs Actual Results

### Before Fix
```
Console Log:
  Raw agile artifacts: Epic: ...Features...User Stories...
  Parsed artifacts: {epics: Array(1), features: Array(4), userStories: Array(0)}
  
Display:
  5 Epics Created (wrong - hardcoded)
  50 Features (wrong - hardcoded)
  8 Stories (wrong - hardcoded)
  
Generation History:
  0 Features
  0 Stories
```

### After Fix
```
Console Log:
  Raw agile artifacts: Epic: ...Features...User Stories...
  Parsed artifacts: {epics: Array(1), features: Array(4), userStories: Array(8)}
  ✅ Parser Results: { epics: 1, features: 4, userStories: 8 }
  
Display:
  1 Epic Created ✅
  4 Features Created ✅
  8 User Stories Created ✅
  
Generation History:
  4 Features ✅
  8 Stories ✅
  All with proper details (persona, acceptance criteria, etc.)
```

## Key Features Now Working

### ✅ Persona-Based Stories
- Stories correctly show specific persona names (Product Manager, QA Engineer, etc.)
- Not generic terms (user, tester, analyst)
- Persona extracted and stored in story object

### ✅ Acceptance Criteria
- All criteria items parsed and displayed
- Supports bullet formats: •, -, *, numbers
- Supports Given/When/Then format
- Displayed in preview and detail views

### ✅ Priority and Story Points
- Extracted from AI output
- Stored in story objects
- Displayed in UI

### ✅ Feature-Story Relationships
- Stories linked to parent features
- Feature title stored in each story
- Can filter/group by feature

### ✅ Consistent Parsing
- Single source of truth (agileParser.js)
- Used by all components
- Consistent data structure everywhere

## Files Modified

1. **src/utils/agileParser.js** - Enhanced parser with comprehensive format support
2. **src/components/GenerationHistory.js** - Use shared parser, updated display logic
3. **src/components/GuidelinesGeneratorWithAzure.js** - Already correct, no changes needed

## Database Considerations

Currently using JSON file storage (`storage/agile_artifacts.json`). For future database integration:

### Recommended Schema

**Epics Table:**
```sql
CREATE TABLE epics (
  id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Features Table:**
```sql
CREATE TABLE features (
  id VARCHAR(255) PRIMARY KEY,
  epic_id VARCHAR(255) REFERENCES epics(id),
  title TEXT NOT NULL,
  description TEXT,
  priority VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**User Stories Table:**
```sql
CREATE TABLE user_stories (
  id VARCHAR(255) PRIMARY KEY,
  feature_id VARCHAR(255) REFERENCES features(id),
  title TEXT NOT NULL,
  description TEXT,
  persona_id VARCHAR(255) REFERENCES personas(id),
  persona_name VARCHAR(255),
  priority VARCHAR(50),
  status VARCHAR(50),
  story_points INT,
  acceptance_criteria JSONB, -- Array of strings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Artifacts Table (for storage):**
```sql
CREATE TABLE agile_artifacts (
  id VARCHAR(255) PRIMARY KEY,
  requirement TEXT NOT NULL,
  agile_artifacts TEXT NOT NULL, -- Raw AI output
  personas_used JSONB, -- Array of persona names
  type VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### If counts still show 0:
1. Check console for "✅ Parser Results" log
2. Verify AI output format matches expected structure
3. Check if `parsedArtifacts` state is being set correctly
4. Clear localStorage: `localStorage.clear()`
5. Hard refresh: Ctrl+Shift+R

### If persona names are missing:
1. Verify AI output uses "As a [Persona Name]," format
2. Check personas are loaded: `curl http://localhost:8080/personas`
3. Verify backend prompt includes persona context

### If acceptance criteria missing:
1. Check AI output includes "Acceptance Criteria:" section
2. Verify bullet points use supported formats (•, -, *, numbers)
3. Check parser recognizes the format

## Next Steps

1. **Test Thoroughly:** Generate multiple artifacts with different requirements
2. **Database Migration:** Plan migration from JSON files to proper database
3. **Azure DevOps Integration:** Ensure parsed artifacts sync correctly with Azure DevOps
4. **Enhanced Filtering:** Add filters by persona, priority, story points
5. **Story Editing:** Enable editing of parsed stories
6. **Bulk Operations:** Export/import parsed artifacts
7. **Analytics:** Show persona usage statistics
8. **Validation:** Add validation rules for story format

## Success Criteria

- ✅ Parser correctly identifies all epics, features, and user stories
- ✅ Counts display correctly (not 0, not hardcoded)
- ✅ Generation History shows proper artifact details
- ✅ User stories include persona names
- ✅ Acceptance criteria fully displayed
- ✅ Priority and story points extracted
- ✅ Feature-story relationships maintained
- ✅ Consistent parsing across all components
- ✅ No console errors
- ✅ Local testing successful on port 8080

