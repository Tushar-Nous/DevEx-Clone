# Local Testing Guide - Persona-Based User Story Generation

## 🎯 What's New

Your app now generates user stories with **specific persona names** instead of generic terms like "user" or "analyst". All stories will use personas from empathy phase research.

## 📋 Prerequisites

- ✅ Backend API running on **port 8080** (already running)
- ✅ Frontend will run on **port 3000**

## 🚀 Quick Start

### 1. Verify Backend is Running

```bash
# Test backend health
curl http://localhost:8080/health

# Test personas endpoint
curl http://localhost:8080/personas
```

Expected response from `/personas`:
```json
{
  "success": true,
  "data": [
    { "id": "qa-engineer", "name": "QA Engineer", ... },
    { "id": "senior-developer", "name": "Senior Developer", ... },
    ...
  ],
  "count": 6
}
```

### 2. Start Frontend

```bash
cd c:\Users\tushars\Documents\DevEx\NousAugmentedDevX_UI
npm start
```

The frontend will automatically:
- Use `http://localhost:8080` as API base URL (configured in `.env.local`)
- Load personas from backend
- Include persona context in all story generation

### 3. Test the Persona Integration

#### Test 1: View Personas
1. Open browser: `http://localhost:3000`
2. Navigate to **Persona Manager**
3. You should see 6 default personas:
   - QA Engineer
   - Senior Developer
   - DevOps Engineer
   - Security Analyst
   - Product Manager
   - Data Analyst

#### Test 2: Generate User Stories with Personas
1. Navigate to **User Stories** page
2. Enter a requirement, for example:
   ```
   Need automated testing capability for our insurance application
   ```
3. Click **Generate Stories**
4. **Expected Result**: Stories should use specific persona names:
   ```
   ✅ "As a QA Engineer, I want to automate regression tests so that we reduce testing time"
   ✅ "As a DevOps Engineer, I want to integrate tests into CI/CD pipeline..."
   
   ❌ NOT "As a tester..." or "As a user..."
   ```

#### Test 3: Verify Acceptance Criteria
Each story should have **3-5 acceptance criteria** in Given/When/Then format:
```
Acceptance Criteria:
• Given the test suite exists, when automation runs, then all tests execute successfully
• The automation covers 80% of regression scenarios
• Test results are reported within 5 minutes
```

#### Test 4: Check Persona Matching
Test different types of requirements to see smart persona matching:

**Testing-related requirement:**
```
Input: "Need to improve quality assurance process"
Expected Persona: QA Engineer
```

**Deployment-related requirement:**
```
Input: "Need to automate infrastructure deployment"
Expected Persona: DevOps Engineer
```

**Security-related requirement:**
```
Input: "Need to implement vulnerability scanning"
Expected Persona: Security Analyst
```

## 🔍 Debugging

### Check API Configuration
Open browser console (F12) and you should see:
```
🔌 API Configuration: {
  environment: 'development',
  baseURL: 'http://localhost:8080',
  endpoints: 13
}
```

### Check Network Requests
1. Open DevTools > Network tab
2. Generate a user story
3. Look for requests to:
   - `http://localhost:8080/personas` (not Azure URL)
   - `http://localhost:8080/generate-agile-artifacts`

### Common Issues

**Issue: Still calling Azure URL**
- Solution: Clear browser cache and restart frontend
- Verify `.env.local` file exists in `NousAugmentedDevX_UI` folder

**Issue: "Cannot connect to localhost:8080"**
- Solution: Verify backend is running: `netstat -ano | findstr :8080`
- Restart backend: `cd NousAugmentedDevX_API && node app.js`

**Issue: Personas not loading**
- Check backend console for: "✅ Initialized personas.json with default empathy phase data"
- Check `NousAugmentedDevX_API\storage\personas.json` exists

## 📊 Testing Checklist

- [ ] Backend running on port 8080
- [ ] Frontend using localhost:8080 (check network tab)
- [ ] Personas loaded in Persona Manager (6 personas visible)
- [ ] User stories use exact persona names
- [ ] Each story has 3-5 acceptance criteria
- [ ] Generic terms (user, analyst) are NOT used
- [ ] Personas match story context (QA Engineer for testing stories)

## 🎨 Visual Verification

In the UI, you should see:
- **Persona badges** with avatars on each story card
- **Persona names** prominently displayed
- **Persona details** (title, responsibilities) when hovering
- **Usage statistics** showing which personas are used most

## 📝 Example Full Flow

1. **Input**: "Need to build automated testing framework for claims processing"

2. **Backend Processing**:
   - Loads 6 personas from `personas.json`
   - Includes persona context in AI prompt
   - AI generates stories with persona names
   - Validates persona usage

3. **Expected Output**:
   ```
   Epic: Automated Testing Framework
   
   Feature: Test Automation Infrastructure
   
   User Stories:
   1. As a QA Engineer, I want to create automated test suites so that we can reduce manual testing effort
      - Given test scenarios are defined, when automation runs, then all tests execute
      - The framework supports both UI and API testing
      - Test coverage reaches 80% minimum
      
   2. As a DevOps Engineer, I want to integrate tests into CI/CD pipeline so that quality checks are automated
      - Given code is committed, when pipeline runs, then tests execute automatically
      - Failed tests block deployment
      - Test results are reported to the team
   ```

## 🔄 Switching Back to Production

To use the production Azure API:
1. Delete or rename `.env.local` file
2. Restart the frontend
3. App will use production URL automatically

## 💡 Tips

- **Backend Logs**: Watch backend console for validation warnings about invalid personas
- **Frontend Logs**: Check browser console for persona loading messages
- **Persona Stats**: Check `/personas/stats/usage` endpoint to see persona usage analytics
- **Add Custom Personas**: Use Persona Manager UI or POST to `/personas` endpoint

---

✅ **You're all set!** The persona-based user story generation is now integrated and ready for testing on your local machine.
