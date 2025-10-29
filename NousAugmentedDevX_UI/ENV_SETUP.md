# Environment Variables Setup

## Azure DevOps Configuration

This project uses environment variables to securely store Azure DevOps credentials and configuration.

### Setup Instructions

1. **Copy the example environment file:**
   ```bash
   copy .env.example .env
   ```

2. **Update the `.env` file with your actual values:**
   
   ```env
   REACT_APP_AZURE_DEVOPS_ORGANIZATION=your_organization_name
   REACT_APP_AZURE_DEVOPS_PROJECT=your_project_name
   REACT_APP_AZURE_DEVOPS_REPOSITORY=your_repository_name
   REACT_APP_AZURE_DEVOPS_PAT=your_personal_access_token
   REACT_APP_AZURE_DEVOPS_BRANCH=main
   REACT_APP_AZURE_DEVOPS_FILE_PATH=src/
   ```

3. **Obtain your Personal Access Token (PAT):**
   - Go to Azure DevOps → User Settings → Personal Access Tokens
   - Create a new token with the following scopes:
     - Code (Read & Write)
     - Work Items (Read & Write)
   - Copy the token and paste it in your `.env` file

### Important Notes

- **Never commit the `.env` file to version control**
- The `.env` file is already included in `.gitignore`
- Use `.env.example` as a template for other developers
- Restart your development server after changing environment variables

### Default Values

If environment variables are not set, the application will use the following defaults:
- Organization: InsurityPOC
- Project: InsurityPOC
- Repository: InsurityPocAIFigma
- Branch: main
- File Path: src/

However, **personalAccessToken must be provided** via environment variables for the integration to work.
