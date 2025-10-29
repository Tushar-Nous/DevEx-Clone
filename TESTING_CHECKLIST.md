# Quick Testing Checklist

## Prerequisites
- ✅ Backend running on `http://localhost:8080`
- ✅ Frontend running on `http://localhost:3000`
- ✅ .env.local file configured with `REACT_APP_API_BASE_URL=http://localhost:8080`

## Test 1: Generate New Artifacts
### Steps:
1. Navigate to AI Guidelines page
2. Enter requirement: "Develop a full-featured e-commerce platform to support modern retail operations"
3. Click "Generate Content"
4. Wait for generation to complete

### Expected Console Logs:
```
Raw agile artifacts: Epic: Develop a full-featured e-commerce platform...
Parsed artifacts: {epics: Array(1), features: Array(4), userStories: Array(8)}
Epics count: 1
Features count: 4
User Stories count: 8
✅ Parser Results: { epics: 1, features: 4, userStories: 8 }
```

### Expected Display:
- ✅ "Agile Artifacts" tab becomes clickable
- ✅ Switch to Agile Artifacts tab
- ✅ See correct counts:
  - 1 Epic Created (not 0, not 5)
  - 4 Features Created (not 0, not 50)
  - 8 User Stories Created (not 0, not 8 if it was hardcoded)

## Test 2: Verify Epic Display
### Steps:
1. Scroll down in Agile Artifacts tab
2. Look for "Epics" section with red/orange gradient

### Expected Display:
```
Epics
High-level objectives and goals

1. Develop a full-featured e-commerce platform to support modern retail operations and business growth.
   ⚡ 4 Features
   👥 8 User Stories
```

## Test 3: Verify Features Display
### Steps:
1. Look for "Features" section with blue/indigo gradient

### Expected Display:
```
Features
Functional groupings and capabilities

1. Product Management
   👥 2 User Stories

2. Multi-Channel Selling
   👥 2 User Stories

3. Customer Experience
   👥 2 User Stories

4. System Scalability
   👥 2 User Stories
```

## Test 4: Verify User Stories Display
### Steps:
1. Look for "User Stories" section with green/emerald gradient
2. Click on any user story card

### Expected Display in Card:
```
1. As a Product Manager, I want product catalog management with variants...
   Priority: High
   Story Points: 5
```

### Expected Display in Modal (after click):
```
User Story Details

As a Product Manager, I want product catalog management with variants, pricing, and inventory tracking so that we can offer a diverse range of products.

Persona: Product Manager

Acceptance Criteria:
• Given a product catalog interface
• When adding variants and setting prices
• Then inventory levels should update accordingly
• The system should support at least 10,000 products
• Changes should reflect in real-time

Priority: High
Story Points: 5
```

## Test 5: Generation History - List View
### Steps:
1. Navigate to Generation History page
2. Switch to "Agile Artifacts" tab
3. Find the most recent item

### Expected Display:
```
Agile Artifacts #[timestamp]
[Date]

Original Requirement
Develop a full-featured e-commerce platform...

Epic                                    [Red/Orange section]
Develop a full-featured e-commerce platform to support modern retail operations

Features (4)                            [Blue section]
✓ Feature 1: Product Management
✓ Feature 2: Multi-Channel Selling
✓ Feature 3: Customer Experience
+1 more features...

User Stories (8)                        [Green section]
⭐ Story 1: As a Product Manager, I want product catalog management...
   • Given a product catalog interface
⭐ Story 2: As a Senior Developer, I want mobile-responsive design...
+6 more user stories...
```

## Test 6: Generation History - Preview Modal
### Steps:
1. Click the "eye" icon on any agile artifact item
2. Verify full content displays

### Expected Display:
- ✅ Modal opens with full width
- ✅ Epic section visible with complete text
- ✅ All 4 features listed (not truncated)
- ✅ All 8 user stories listed with:
  - Full story text
  - Persona name displayed
  - All acceptance criteria items (5 each)
  - Priority: High/Medium/Low
  - Story Points: 1-8

## Test 7: User Story Page Integration
### Steps:
1. Navigate to User Stories page
2. Check if stories appear in the grid/list

### Expected Display:
- ✅ User stories from latest generation appear
- ✅ Each story shows persona name
- ✅ Each story has acceptance criteria
- ✅ Priority badges visible
- ✅ Story points displayed

## Test 8: Persona Verification
### Steps:
1. Check each user story
2. Verify persona names are specific, not generic

### Expected Personas (from your example):
- ✅ Product Manager
- ✅ Senior Developer
- ✅ QA Engineer
- ✅ DevOps Engineer
- ✅ Security Analyst
- ✅ Data Analyst

### NOT Expected (generic terms):
- ❌ user
- ❌ tester
- ❌ developer
- ❌ analyst
- ❌ admin

## Test 9: Backend Verification
### Steps:
1. Open `storage/agile_artifacts.json`
2. Find the most recent entry

### Expected Structure:
```json
{
  "id": "...",
  "requirement": "Develop a full-featured e-commerce platform...",
  "agile_artifacts": "Epic: Develop a full-featured e-commerce platform...\n\nFeatures:\n  Feature 1: Product Management\n    User Stories:\n      - Story 1: As a Product Manager...",
  "personas_used": [
    "Product Manager",
    "Senior Developer",
    "QA Engineer",
    "DevOps Engineer",
    "Security Analyst",
    "Data Analyst"
  ],
  "type": "agile_artifacts",
  "timestamp": "2025-10-28T..."
}
```

## Test 10: Error Handling
### Steps:
1. Generate artifacts with invalid/empty requirement
2. Check error handling

### Expected:
- ✅ Error message displayed
- ✅ No crash
- ✅ Can retry generation

## Common Issues & Solutions

### Issue: Counts show 0
**Solution:**
1. Check console for parser logs
2. Verify AI output format
3. Clear browser cache: `Ctrl+Shift+R`
4. Clear localStorage: Open console, type `localStorage.clear()`

### Issue: Old data showing
**Solution:**
1. Hard refresh: `Ctrl+Shift+R`
2. Clear localStorage
3. Restart frontend: `npm start`

### Issue: Network errors
**Solution:**
1. Verify backend is running: `curl http://localhost:8080/health`
2. Check .env.local file exists
3. Verify NODE_ENV=development
4. Check API_ENDPOINTS in console

### Issue: Parser not working
**Solution:**
1. Check console for "✅ Parser Results" log
2. If log missing, check agileParser.js import
3. Verify parseAgileArtifacts is called
4. Check AI output format matches expected structure

## Success Indicators

### Console (no errors):
```
✅ API Configuration: { environment: 'development', baseURL: 'http://localhost:8080' }
✅ Initialized personas.json
✅ Parser Results: { epics: 1, features: 4, userStories: 8 }
✅ Generated user stories with validated personas: ['Product Manager', 'Senior Developer', ...]
```

### UI (proper display):
- ✅ Correct counts (not 0, not hardcoded values)
- ✅ Epic displays with full text
- ✅ All features listed
- ✅ All user stories visible
- ✅ Persona names specific (not generic)
- ✅ Acceptance criteria all items visible
- ✅ Priority and Story Points displayed

### Storage (backend saved correctly):
- ✅ agile_artifacts.json has new entry
- ✅ Entry has raw AI output
- ✅ Entry has personas_used array
- ✅ Entry has timestamp

## Performance Checks

- ✅ Generation completes in < 30 seconds
- ✅ Parsing happens instantly (< 100ms)
- ✅ Display renders smoothly
- ✅ No memory leaks (check with DevTools)
- ✅ No infinite re-renders

## Accessibility Checks

- ✅ Keyboard navigation works
- ✅ Screen reader announces counts
- ✅ Color contrast meets WCAG AA
- ✅ Focus indicators visible

## Final Checklist

Before marking complete:
- [ ] Generated at least 2 different artifacts
- [ ] Verified counts are correct for both
- [ ] Checked Generation History shows both
- [ ] Verified personas are specific names
- [ ] Confirmed all acceptance criteria visible
- [ ] Tested modal preview
- [ ] Checked User Story Page integration
- [ ] Verified backend storage
- [ ] No console errors
- [ ] No UI glitches

## Demo Preparation

For client demo:
1. **Pre-generate 2-3 good examples:**
   - E-commerce platform
   - Insurance claims processing
   - Healthcare patient management

2. **Prepare to show:**
   - Generation flow (Guidelines page)
   - Structured display (Agile Artifacts tab)
   - History tracking (Generation History)
   - Detail view (User Story modal)
   - Persona integration (Persona Manager)

3. **Key talking points:**
   - AI-powered generation with persona context
   - Structured agile artifacts (Epic → Features → Stories)
   - Persona-based user stories (not generic)
   - Comprehensive acceptance criteria (3-5 per story)
   - Full audit trail (Generation History)
   - Azure DevOps integration ready
   - Scalable architecture

4. **Have ready:**
   - Backend health check: `http://localhost:8080/health`
   - Personas endpoint: `http://localhost:8080/personas`
   - Sample requirement text
   - Questions about future database/integrations

