# Local Testing Instructions for Persona-Based User Story Generation

## ✅ Changes Completed

All hardcoded Azure production URLs have been replaced with centralized API configuration. The following files were updated:

### Updated Files:
1. ✅ `src/components/BackendPromptGenerator.js` - Uses `API_ENDPOINTS.generateAgileArtifacts` and `API_ENDPOINTS.backendProjects`
2. ✅ `src/components/GuidelinesGeneratorWithAzure.js` - Uses `API_ENDPOINTS.generateGuidelines` and `API_ENDPOINTS.generateAgileArtifacts`
3. ✅ `src/components/Dashboard.js` - Uses `API_ENDPOINTS.getGuidelines`
4. ✅ `src/components/GenerationHistory.js` - Uses `API_ENDPOINTS.getGuidelines` and `API_ENDPOINTS.getAgileArtifacts`
5. ✅ `src/components/GuidelinesGenerator.js` - Uses `API_ENDPOINTS.generateGuidelines`
6. ✅ `src/components/UserStoryPage.js` - Uses `API_ENDPOINTS.getAgileArtifacts` and `API_ENDPOINTS.backendProjects`

## 🚀 Testing Steps

### 1. Verify Backend is Running
Open a terminal and run:
```cmd
curl http://localhost:8080/health
```
Expected output: `{"status":"ok","message":"Server is running","timestamp":"..."}`

### 2. Verify Personas Endpoint
```cmd
curl http://localhost:8080/personas
```
Expected output: JSON array with 6 personas (QA Engineer, Senior Developer, DevOps Engineer, Security Analyst, Product Manager, Data Analyst)

### 3. Start Frontend (if not already running)
```cmd
cd c:\Users\tushars\Documents\DevEx\NousAugmentedDevX_UI
npm start
```
The app should open at `http://localhost:3000`

### 4. Verify API Configuration
Open browser Developer Tools (F12) → Console tab. You should see:
```
🔌 API Configuration: 
{
  environment: 'development',
  baseURL: 'http://localhost:8080',
  endpoints: { ... }
}
```

### 5. Test Persona-Based Story Generation

#### Option A: Via User Stories Page
1. Navigate to **User Stories** page
2. Switch to **Backend Mode** (toggle at top)
3. Input a requirement like: "Need automated testing for insurance claims processing"
4. Click **Generate Agile Artifacts**
5. Open **Network tab** in DevTools
6. Verify the API call goes to: `http://localhost:8080/generate-agile-artifacts`
7. Check generated stories for:
   - ✅ Specific persona names (e.g., "As a QA Engineer...")
   - ✅ NOT generic terms ("As a tester...", "As a user...")
   - ✅ 3-5 acceptance criteria per story

#### Option B: Via Guidelines Generator
1. Navigate to **AI Guidelines** page
2. Input project requirements
3. Click **Generate Guidelines**
4. Open **Network tab** in DevTools
5. Verify API calls go to `http://localhost:8080/generate-guidelines`

### 6. Verify Persona Usage in Stories

**Good Example (What you should see):**
```
✅ As a QA Engineer, I want automated test suite generation...
✅ As a DevOps Engineer, I want CI/CD pipeline templates...
✅ As a Security Analyst, I want vulnerability scanning integration...
```

**Bad Example (What you should NOT see):**
```
❌ As a tester, I want test automation...
❌ As a user, I want deployment tools...
❌ As an analyst, I want security checks...
```

## 🔍 Troubleshooting

### If calls still go to Azure production:
1. **Check `.env.local` file exists** in `NousAugmentedDevX_UI` folder
2. **Restart the frontend** (Ctrl+C, then `npm start` again)
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Check console logs** for environment configuration

### If backend returns errors:
1. Verify backend is running on port 8080
2. Check backend console for error messages
3. Ensure `storage/personas.json` was created successfully
4. Test personas endpoint: `curl http://localhost:8080/personas`

### If personas are not being used:
1. Check backend logs for "✅ Initialized personas.json"
2. Verify personas endpoint returns data
3. Check frontend console for persona loading messages
4. Ensure `personaService.initialize()` was called

## 📊 Expected Behavior

### Backend (port 8080)
- ✅ Loads 6 default personas on startup
- ✅ Includes persona context in AI prompts
- ✅ Validates persona usage in responses
- ✅ Logs warnings if generic terms are detected

### Frontend (port 3000)
- ✅ Uses `http://localhost:8080` for API calls (in development)
- ✅ Loads personas from backend on app start
- ✅ Validates stories have real persona names
- ✅ Shows 3-5 acceptance criteria per story

## 🎯 Success Criteria

Your local setup is working correctly if:
1. ✅ Network tab shows all API calls going to `localhost:8080`
2. ✅ Generated stories use specific persona names from personas endpoint
3. ✅ No generic terms like "user", "tester", "analyst" appear in stories
4. ✅ Each story has 3-5 acceptance criteria
5. ✅ Backend logs show "Using 6 personas from storage" in generation logs

## 📝 Key Files Reference

### Configuration
- `.env.local` - Environment variables (API base URL)
- `src/config/api.js` - Centralized API endpoints

### Backend
- `NousAugmentedDevX_API/app.js` - Main server with persona integration
- `storage/personas.json` - Persona storage (auto-created)

### Frontend Services
- `src/utils/personaService.js` - Persona management
- `src/utils/aiService.js` - AI generation with persona validation

### Components
- `src/components/UserStoryPage.js` - Main user story interface
- `src/components/PersonaManager.js` - Persona viewing/editing
- `src/components/BackendPromptGenerator.js` - Backend prompt generation
- `src/components/GuidelinesGeneratorWithAzure.js` - Guidelines generation

## 🐛 Debugging Commands

```cmd
# Check backend health
curl http://localhost:8080/health

# View all personas
curl http://localhost:8080/personas

# Check persona usage stats
curl http://localhost:8080/personas/stats/usage

# Test story generation (replace with your requirement)
curl -X POST http://localhost:8080/generate-agile-artifacts ^
  -H "Content-Type: application/json" ^
  -d "{\"requirement\":\"Need automated testing system\"}"
```

## 📞 Next Steps

After verifying local testing works:
1. Test end-to-end story generation with various requirements
2. Verify different persona types are used appropriately
3. Check acceptance criteria quality and relevance
4. Test PersonaManager UI for viewing/editing personas
5. Consider adding custom personas for your specific domain
