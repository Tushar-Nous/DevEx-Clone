# API Documentation - Node.js Backend

## Overview
This Node.js backend provides AI-powered services for generating design guidelines and agile artifacts using Azure OpenAI. All generated content is automatically stored in JSON format for later retrieval.

## Base URL
```
http://localhost:3001
```

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
cd nodejs
npm install
```

### Environment Configuration
Create a `.env` file in the nodejs directory with the following variables:
```env
# Azure OpenAI Configuration
OPENAI_API_VERSION=2024-02-01
AZURE_DEPLOYMENT=your_deployment_name
API_KEY=your_api_key
AZURE_ENDPOINT=https://your_endpoint.openai.azure.com/
TEMPERATURE=0.2

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Running the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Endpoints

### 1. Generate Design Guidelines
**POST** `/generate-guidelines`

Generates enterprise application design guidelines for Figma Make.

**Request Body:**
```json
{
  "input": "Your requirement or description here"
}
```

**Response:**
```json
{
  "success": true,
  "guidelines": "Generated design guidelines content...",
  "input": "Original input text",
  "id": 1,
  "message": "Guidelines generated and stored successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

### 2. Generate Agile Artifacts
**POST** `/generate-agile-artifacts`

Converts user requirements into structured Agile artifacts (Epic, Features, User Stories).

**Request Body:**
```json
{
  "requirement": "Your user requirement here"
}
```

**Response:**
```json
{
  "success": true,
  "agile_artifacts": "Generated Epic, Features, and User Stories...",
  "requirement": "Original requirement text",
  "id": 1,
  "message": "Agile artifacts generated and stored successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

### 3. Get All Guidelines
**GET** `/get-guidelines`

Retrieves all stored design guidelines.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "input": "Original input text",
      "guidelines": "Generated guidelines...",
      "type": "design_guidelines",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 4. Get Specific Guideline
**GET** `/get-guidelines/{id}`

Retrieves a specific guideline by ID.

**Parameters:**
- `id` (integer): The guideline ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "input": "Original input text",
    "guidelines": "Generated guidelines...",
    "type": "design_guidelines",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Guideline not found"
}
```

---

### 5. Get All Agile Artifacts
**GET** `/get-agile-artifacts`

Retrieves all stored agile artifacts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "requirement": "Original requirement text",
      "agile_artifacts": "Generated Epic, Features, User Stories...",
      "type": "agile_artifacts",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 6. Get Specific Agile Artifact
**GET** `/get-agile-artifacts/{id}`

Retrieves a specific agile artifact by ID.

**Parameters:**
- `id` (integer): The agile artifact ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "requirement": "Original requirement text",
    "agile_artifacts": "Generated Epic, Features, User Stories...",
    "type": "agile_artifacts",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Agile artifact not found"
}
```

---

### 7. Health Check
**GET** `/health`

Simple health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## Storage Format

### Guidelines Storage (`storage/guidelines.json`)
```json
[
  {
    "id": 1,
    "input": "User input text",
    "guidelines": "Generated design guidelines",
    "type": "design_guidelines",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
]
```

### Agile Artifacts Storage (`storage/agile_artifacts.json`)
```json
[
  {
    "id": 1,
    "requirement": "User requirement text",
    "agile_artifacts": "Generated Epic, Features, and User Stories",
    "type": "agile_artifacts",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
]
```

---

## Features

✅ **Automatic Storage**: All generated content is automatically stored in JSON format  
✅ **Unique IDs**: Each stored item gets a unique incremental ID  
✅ **Timestamps**: All records include ISO format timestamps  
✅ **Error Handling**: Comprehensive error handling with meaningful messages  
✅ **CORS Enabled**: Cross-origin requests supported for frontend integration  
✅ **Azure OpenAI Integration**: Uses existing Azure OpenAI credentials  
✅ **Structured Templates**: Follows specific templates for consistent output  
✅ **Async/Await**: Modern JavaScript async patterns for better performance  
✅ **Environment Variables**: Secure configuration management  

---

## Usage Examples

### Example 1: Generate and Store Guidelines
```bash
# Generate guidelines
curl -X POST http://localhost:3000/generate-guidelines \
  -H "Content-Type: application/json" \
  -d '{"input": "Employee management system for HR operations"}'

# Fetch all guidelines
curl http://localhost:3000/get-guidelines

# Fetch specific guideline
curl http://localhost:3000/get-guidelines/1
```

### Example 2: Generate and Store Agile Artifacts
```bash
# Generate agile artifacts
curl -X POST http://localhost:3000/generate-agile-artifacts \
  -H "Content-Type: application/json" \
  -d '{"requirement": "Employee management system with attendance tracking"}'

# Fetch all agile artifacts
curl http://localhost:3000/get-agile-artifacts

# Fetch specific agile artifact
curl http://localhost:3000/get-agile-artifacts/1
```

### Example 3: Health Check
```bash
curl http://localhost:3000/health
```

---

## Technical Details

- **Framework**: Express.js with CORS support
- **AI Service**: Azure OpenAI (GPT model)
- **Storage**: Local JSON files in `storage/` directory
- **File Operations**: fs-extra for enhanced file system operations
- **Environment**: dotenv for environment variable management
- **Encoding**: UTF-8 support for all text content
- **Port**: 5000 (configurable via environment variables)
- **Host**: 0.0.0.0 (accepts connections from all interfaces)

---

## Development

### Project Structure
```
nodejs/
├── app.js                     # Main application file
├── package.json              # Dependencies and scripts
├── API_DOCUMENTATION.md      # This documentation
├── storage/                  # JSON storage directory
│   ├── guidelines.json       # Design guidelines storage
│   └── agile_artifacts.json  # Agile artifacts storage
└── .env                      # Environment variables (create this)
```

### Dependencies
- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **openai**: OpenAI client library
- **dotenv**: Environment variable management
- **body-parser**: Request body parsing
- **fs-extra**: Enhanced file system operations
- **nodemon**: Development auto-reload (dev dependency)

### Scripts
- `npm start`: Start the production server
- `npm run dev`: Start development server with auto-reload
- `npm test`: Run tests (placeholder)

---

## Migration from Python

This Node.js backend is a direct port of the Python Flask backend with the following improvements:

1. **Modern JavaScript**: Uses async/await for better code readability
2. **Enhanced Error Handling**: More robust error handling and logging
3. **Environment Variables**: Better configuration management
4. **Development Tools**: Includes nodemon for development
5. **File System**: Uses fs-extra for enhanced file operations
6. **Health Check**: Added health check endpoint for monitoring

The API endpoints and functionality remain identical to the Python version for seamless migration.
