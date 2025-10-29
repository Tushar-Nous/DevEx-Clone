# Nous Augmented Intelligence - Node.js Backend

A Node.js backend service that provides AI-powered generation of design guidelines and agile artifacts using Azure OpenAI.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Azure OpenAI account and credentials

### Installation
```bash
# Navigate to the nodejs directory
cd nodejs

# Install dependencies
npm install
```

### Configuration
Create a `.env` file in the nodejs directory:
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
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📁 Project Structure
```
nodejs/
├── app.js                     # Main application file
├── package.json              # Dependencies and scripts
├── README.md                 # This file
├── API_DOCUMENTATION.md      # Detailed API documentation
├── storage/                  # JSON storage directory
│   ├── guidelines.json       # Design guidelines storage
│   └── agile_artifacts.json  # Agile artifacts storage
└── .env                      # Environment variables (create this)
```

## 🔌 API Endpoints

### Core Endpoints
- `POST /generate-guidelines` - Generate design guidelines
- `POST /generate-agile-artifacts` - Generate agile artifacts
- `GET /get-guidelines` - Get all guidelines
- `GET /get-guidelines/:id` - Get specific guideline
- `GET /get-agile-artifacts` - Get all agile artifacts
- `GET /get-agile-artifacts/:id` - Get specific agile artifact
- `GET /health` - Health check

### Example Usage
```bash
# Generate design guidelines
curl -X POST http://localhost:3000/generate-guidelines \
  -H "Content-Type: application/json" \
  -d '{"input": "Employee management system for HR operations"}'

# Generate agile artifacts
curl -X POST http://localhost:3000/generate-agile-artifacts \
  -H "Content-Type: application/json" \
  -d '{"requirement": "User authentication system with multi-factor auth"}'

# Health check
curl http://localhost:3000/health
```

## 🛠 Features

- ✅ **Azure OpenAI Integration** - Leverages GPT models for content generation
- ✅ **Automatic Storage** - Stores all generated content in JSON format
- ✅ **RESTful API** - Clean, consistent API design
- ✅ **CORS Enabled** - Ready for frontend integration
- ✅ **Error Handling** - Comprehensive error handling and logging
- ✅ **Environment Configuration** - Secure credential management
- ✅ **Development Tools** - Hot reload for development
- ✅ **Health Monitoring** - Built-in health check endpoint

## 📊 Storage

The application uses JSON files for data persistence:

- `storage/guidelines.json` - Stores generated design guidelines
- `storage/agile_artifacts.json` - Stores generated agile artifacts

Each record includes:
- Unique ID
- Original input/requirement
- Generated content
- Timestamp
- Content type

## 🔧 Development

### Available Scripts
```bash
npm start      # Start production server
npm run dev    # Start development server with auto-reload
npm test       # Run tests (placeholder)
```

### Dependencies
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **openai** - OpenAI client library
- **dotenv** - Environment variable management
- **body-parser** - Request body parsing
- **fs-extra** - Enhanced file system operations

### Dev Dependencies
- **nodemon** - Development auto-reload

## 🔒 Security

- Environment variables for sensitive configuration
- CORS configuration for cross-origin requests
- Input validation and error handling
- No sensitive data in source code

## 📚 Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🔄 Migration from Python

This Node.js backend is a direct port of the Python Flask backend with these improvements:

1. **Modern JavaScript** - Uses async/await patterns
2. **Enhanced Error Handling** - More robust error management
3. **Environment Variables** - Better configuration management
4. **Development Tools** - Includes development utilities
5. **File System** - Enhanced file operations with fs-extra

The API remains identical for seamless migration.

## 🚦 Health Check

Check if the server is running:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## 📞 Support

For issues and questions, please check the API documentation or create an issue in the repository.
