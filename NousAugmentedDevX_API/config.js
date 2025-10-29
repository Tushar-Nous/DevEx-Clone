require('dotenv').config();

const config = {
    // Azure OpenAI Configuration
    openai: {
        apiVersion: process.env.OPENAI_API_VERSION || "2024-02-01",
        deployment: process.env.AZURE_DEPLOYMENT || "SwarupDemo",
        apiKey: process.env.API_KEY || "fcd7227745f941e7b6287bfcffcb5f46",
        endpoint: process.env.AZURE_ENDPOINT || "https://openaiswarup.openai.azure.com/",
        temperature: parseFloat(process.env.TEMPERATURE) || 0.2
    },
    
    // Server Configuration
    server: {
        port: process.env.PORT || 8080,
        host: process.env.HOST || '0.0.0.0',
        environment: process.env.NODE_ENV || 'development'
    },
    
    // Storage Configuration
    storage: {
        directory: 'storage',
        guidelinesFile: 'guidelines.json',
        agileArtifactsFile: 'agile_artifacts.json'
    },
    
    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        credentials: process.env.CORS_CREDENTIALS === 'true' || true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
    }
};

module.exports = config;
