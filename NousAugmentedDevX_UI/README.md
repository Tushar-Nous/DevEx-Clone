# Nous@AI-SDLC-Generator

An AI-powered Software Development Lifecycle (SDLC) Generator specifically designed for the Insurance Domain. This platform leverages OpenAI's advanced language models to automate and streamline the entire SDLC process, from requirements gathering to code generation and DevOps integration.

## 🚀 Features

### 1. User Requirements Management
- **Multi-format Support**: Upload PDF, Excel, Word, and text files
- **Chat Interface**: Natural language requirement input
- **AI Analysis**: Automatic requirement extraction and summarization
- **Insurance Domain Focus**: Specialized for insurance industry needs

### 2. Epics/Features & User Stories Generation
- **AI-Powered Generation**: Automatically creates epics and features from requirements
- **User Story Creation**: Generates detailed user stories with acceptance criteria
- **Best Practices**: Follows Agile and SDLC best practices
- **Export Capability**: Export to Markdown format

### 3. Prompt Details & Management
- **Smart Prompt Generation**: AI-generated prompts based on user stories
- **Prompt Library**: Pre-built templates for common SDLC tasks
- **Code Generation**: Generate production-ready code from prompts
- **Template Management**: Save and reuse custom prompts

### 4. DevOps Integration - Azure DevOps
- **Repository Integration**: Push generated content to Azure DevOps
- **Markdown Export**: Generate structured documentation
- **Version Control**: Track changes and maintain history
- **Branch Management**: Support for multiple branches

### 5. Dashboard & Analytics
- **Real-time Insights**: AI-powered dashboard with progress tracking
- **Visual Analytics**: Charts and graphs for project overview
- **Activity Tracking**: Monitor SDLC progress and milestones
- **Performance Metrics**: Track efficiency and completion rates

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Azure OpenAI (GPT-4)
- **File Processing**: PDF, Excel, Word document support
- **State Management**: React Context API
- **Charts**: Chart.js with React Chart.js 2
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Azure OpenAI API access
- Azure DevOps account (for DevOps integration)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nous-ai-sdlc-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_AZURE_OPENAI_API_KEY=fcd7227745f941e7b6287bfcffcb5f46
   REACT_APP_AZURE_OPENAI_ENDPOINT=https://openaiswarup.openai.azure.com/
   REACT_APP_AZURE_OPENAI_DEPLOYMENT=SwarupDemo
   REACT_APP_AZURE_OPENAI_API_VERSION=2024-02-01
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Azure OpenAI Setup
The application is pre-configured with the provided Azure OpenAI credentials:
- **API Key**: `fcd7227745f941e7b6287bfcffcb5f46`
- **Endpoint**: `https://openaiswarup.openai.azure.com/`
- **Deployment**: `SwarupDemo`
- **API Version**: `2024-02-01`

### Azure DevOps Configuration
1. Generate a Personal Access Token (PAT) in Azure DevOps
2. Configure organization, project, and repository details
3. Set appropriate permissions (Code Read & Write)

## 📖 Usage Guide

### 1. Getting Started
1. Navigate to the **User Requirements** tab
2. Upload insurance domain documents or use the chat interface
3. Let AI analyze and extract requirements

### 2. Generating Epics & Features
1. Go to **Epics/Features & User Stories** tab
2. Select a processed requirement
3. Click "Generate Epics & Features"
4. Review and edit generated content

### 3. Creating User Stories
1. In the Epics/Features section, expand an epic
2. Click "Generate Stories" for any feature
3. AI will create detailed user stories with acceptance criteria

### 4. Generating Prompts
1. Navigate to **Prompt Details** tab
2. Select a user story
3. Generate AI-powered prompts
4. Use the prompt library for templates

### 5. DevOps Integration
1. Go to **DevOps Integration** tab
2. Configure Azure DevOps settings
3. Select items to push
4. Preview content and push to repository

## 🔒 Security Features

- **Anti-Hallucination**: AI prompts designed to prevent false information
- **Input Validation**: Comprehensive file and data validation
- **Secure Storage**: Local storage with data sanitization
- **API Security**: Secure Azure OpenAI integration

## 📊 Data Management

- **Local Storage**: All data stored locally in browser
- **Export Options**: Markdown export for all generated content
- **Data Persistence**: Automatic saving and loading
- **Backup**: Export functionality for data backup

## 🎯 Insurance Domain Features

- **Domain-Specific Templates**: Insurance industry best practices
- **Keyword Detection**: Automatic insurance terminology recognition
- **Business Logic**: Insurance-specific business rules and workflows
- **Compliance**: Built-in compliance and regulatory considerations

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Multi-language Support**: Support for additional programming languages
- **Advanced Analytics**: Enhanced reporting and metrics
- **Integration APIs**: Additional DevOps platform support
- **Mobile App**: React Native mobile application
- **Team Collaboration**: Multi-user support and permissions

## 📊 Performance Metrics

- **File Processing**: Supports files up to 10MB
- **AI Response Time**: Typically 2-5 seconds
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Responsive Design**: Mobile and desktop optimized

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Monitoring

The application includes built-in monitoring:
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time and user interaction tracking
- **Usage Analytics**: Feature usage and adoption metrics
- **AI Performance**: Response quality and accuracy tracking

---

**Built with ❤️ for the Insurance Industry**
