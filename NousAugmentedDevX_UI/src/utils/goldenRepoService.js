// Browser-compatible Golden Repository Service
// Note: This service provides mock data for browser environment
// In a real implementation, this would fetch data from an API

// File type mappings for better organization
export const FILE_TYPES = {
  DOCUMENTATION: ['md', 'txt', 'doc', 'docx'],
  CODE: ['py', 'js', 'ts', 'jsx', 'tsx', 'java', 'cpp', 'c', 'yml', 'yaml', 'json', 'xml'],
  DATA: ['csv', 'xlsx', 'xls', 'json'],
  IMAGE: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
  OTHER: []
};

// Get file type category
export const getFileType = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  for (const [type, extensions] of Object.entries(FILE_TYPES)) {
    if (extensions.includes(extension)) {
      return type.toLowerCase();
    }
  }
  return 'other';
};

// Get file size in human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Browser-compatible path joining function (for future use)
// const joinPath = (...parts) => {
//   return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
// };

// Get file basename
const getBasename = (filePath) => {
  return filePath.split('/').pop() || filePath;
};

// Read directory structure (mock implementation for browser)
export const readDirectoryStructure = async (dirPath) => {
  // In a real implementation, this would fetch from an API
  // For now, return mock data based on the directory path
  const mockData = getMockFileStructure();
  return mockData[dirPath] || [];
};

// Read file content (mock implementation for browser)
export const readFileContent = async (filePath) => {
  try {
    // In a real implementation, this would fetch from an API
    const content = getMockFileContent(filePath);
    return {
      success: true,
      content,
      error: null
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return {
      success: false,
      content: null,
      error: error.message
    };
  }
};

// Get all sections with their file structures
export const getAllSections = async () => {
  const sections = [
    { id: '0-docs', name: 'Documentation' },
    { id: '1-requirements', name: 'Requirements' },
    { id: '2-data', name: 'Data Management' },
    { id: '3-code', name: 'Code & Integration' },
    { id: '4-testing', name: 'Testing Framework' },
    { id: '5-deployment', name: 'Deployment' },
    { id: '6-compliance', name: 'Compliance' }
  ];
  
  const sectionsWithFiles = {};
  
  for (const section of sections) {
    sectionsWithFiles[section.id] = await readDirectoryStructure(section.id);
  }
  
  return sectionsWithFiles;
};

// Search files across all sections
export const searchFiles = async (searchTerm, fileType = 'all') => {
  const allSections = await getAllSections();
  const results = [];
  
  const sections = [
    { id: '0-docs', name: 'Documentation' },
    { id: '1-requirements', name: 'Requirements' },
    { id: '2-data', name: 'Data Management' },
    { id: '3-code', name: 'Code & Integration' },
    { id: '4-testing', name: 'Testing Framework' },
    { id: '5-deployment', name: 'Deployment' },
    { id: '6-compliance', name: 'Compliance' }
  ];
  
  const searchInStructure = (structure, sectionId) => {
    for (const item of structure) {
      if (item.type === 'file') {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = fileType === 'all' || item.fileType === fileType;
        
        if (matchesSearch && matchesType) {
          results.push({
            ...item,
            sectionId,
            sectionName: sections.find(s => s.id === sectionId)?.name || sectionId
          });
        }
      } else if (item.children) {
        searchInStructure(item.children, sectionId);
      }
    }
  };
  
  for (const [sectionId, structure] of Object.entries(allSections)) {
    searchInStructure(structure, sectionId);
  }
  
  return results;
};

// Mock data for development (when file system is not available)
export const getMockFileStructure = () => {
  return {
    '0-docs': [
      { name: 'README.md', type: 'file', size: '2.3 KB', fileType: 'documentation' },
      { name: 'AI_Governance.md', type: 'file', size: '4.1 KB', fileType: 'documentation' },
      { name: 'Glossary.md', type: 'file', size: '3.2 KB', fileType: 'documentation' },
      { name: 'IGR_Architecture.png', type: 'file', size: '156 KB', fileType: 'image' },
      { name: 'SDLC_Checklists.md', type: 'file', size: '5.7 KB', fileType: 'documentation' }
    ],
    '1-requirements': [
      { name: 'AI_UseCase_Template.md', type: 'file', size: '1.8 KB', fileType: 'documentation' },
      { name: 'Product_Config_Automation.md', type: 'file', size: '3.4 KB', fileType: 'documentation' },
      { name: 'Risk_Assessment_Form.md', type: 'file', size: '2.1 KB', fileType: 'documentation' },
      { 
        name: 'Sample_UseCases', 
        type: 'folder', 
        children: [
          { name: 'Policy_Doc_Summarizer.md', type: 'file', size: '2.5 KB', fileType: 'documentation' },
          { name: 'Renewal_Forecasting.md', type: 'file', size: '3.1 KB', fileType: 'documentation' },
          { name: 'Smart_Underwriting.md', type: 'file', size: '4.2 KB', fileType: 'documentation' }
        ]
      },
      { name: 'Underwriting_Rules_Authoring.md', type: 'file', size: '6.3 KB', fileType: 'documentation' }
    ],
    '2-data': [
      { name: 'Data_Governance_Guide.md', type: 'file', size: '2.8 KB', fileType: 'documentation' },
      { 
        name: 'Bias_Checks', 
        type: 'folder', 
        children: [
          { name: 'README.md', type: 'file', size: '1.2 KB', fileType: 'documentation' }
        ]
      },
      { 
        name: 'Data_Validation_Scripts', 
        type: 'folder', 
        children: [
          { name: 'validate_csv.py', type: 'file', size: '4.5 KB', fileType: 'code' }
        ]
      },
      { 
        name: 'Synthetic_Data_Sets', 
        type: 'folder', 
        children: [
          { 
            name: 'Commercial_Auto', 
            type: 'folder', 
            children: [
              { name: 'commercial_auto.csv', type: 'file', size: '2.1 MB', fileType: 'data' },
              { name: 'README.md', type: 'file', size: '1.5 KB', fileType: 'documentation' }
            ]
          },
          { 
            name: 'Personal_Auto', 
            type: 'folder', 
            children: [
              { name: 'personal_auto.csv', type: 'file', size: '1.8 MB', fileType: 'data' },
              { name: 'README.md', type: 'file', size: '1.3 KB', fileType: 'documentation' }
            ]
          }
        ]
      }
    ],
    '3-code': [
      { 
        name: 'AI_Integration_SDK', 
        type: 'folder', 
        children: [
          { name: 'llm_client.py', type: 'file', size: '8.2 KB', fileType: 'code' },
          { name: 'ISO_Verisk_Integration.md', type: 'file', size: '3.4 KB', fileType: 'documentation' },
          { name: 'README.md', type: 'file', size: '2.1 KB', fileType: 'documentation' }
        ]
      },
      { 
        name: 'Example_Services', 
        type: 'folder', 
        children: [
          { 
            name: 'ai-policy-doc-assist', 
            type: 'folder', 
            children: [
              { name: 'app.py', type: 'file', size: '12.5 KB', fileType: 'code' },
              { name: 'README.md', type: 'file', size: '2.8 KB', fileType: 'documentation' }
            ]
          }
        ]
      },
      { 
        name: 'Prompt_Templates', 
        type: 'folder', 
        children: [
          { name: 'Claims_Integration.txt', type: 'file', size: '1.9 KB', fileType: 'documentation' },
          { name: 'Policy_Doc_Summary.txt', type: 'file', size: '2.3 KB', fileType: 'documentation' },
          { name: 'Underwriting_QA.txt', type: 'file', size: '1.7 KB', fileType: 'documentation' }
        ]
      },
      { name: 'Rating_Service_Interface.md', type: 'file', size: '4.1 KB', fileType: 'documentation' }
    ],
    '4-testing': [
      { 
        name: 'Bias_Tests', 
        type: 'folder', 
        children: [
          { name: 'README.md', type: 'file', size: '1.8 KB', fileType: 'documentation' }
        ]
      },
      { 
        name: 'CI_CD_Integration', 
        type: 'folder', 
        children: [
          { name: 'github-actions-ci.yml', type: 'file', size: '3.2 KB', fileType: 'code' },
          { name: 'README.md', type: 'file', size: '2.1 KB', fileType: 'documentation' }
        ]
      },
      { 
        name: 'Unit_Tests', 
        type: 'folder', 
        children: [
          { name: 'README.md', type: 'file', size: '1.5 KB', fileType: 'documentation' }
        ]
      }
    ],
    '5-deployment': [
      { 
        name: 'MLOps_Pipelines', 
        type: 'folder', 
        children: [
          { name: 'README.md', type: 'file', size: '3.4 KB', fileType: 'documentation' }
        ]
      },
      { name: 'Model_Card_Template.md', type: 'file', size: '4.7 KB', fileType: 'documentation' },
      { 
        name: 'Monitoring_Dashboards', 
        type: 'folder', 
        children: [
          { name: 'README.md', type: 'file', size: '2.9 KB', fileType: 'documentation' }
        ]
      },
      { name: 'Rollback_Strategies.md', type: 'file', size: '3.8 KB', fileType: 'documentation' }
    ],
    '6-compliance': [
      { name: 'Audit_Log_Format.md', type: 'file', size: '2.4 KB', fileType: 'documentation' },
      { name: 'ISO27001_Checklist.md', type: 'file', size: '5.1 KB', fileType: 'documentation' },
      { name: 'NAIC_Compliance_Guide.md', type: 'file', size: '6.8 KB', fileType: 'documentation' },
      { name: 'Responsible_AI_Metrics.md', type: 'file', size: '4.2 KB', fileType: 'documentation' }
    ]
  };
};

// Get mock file content for development
export const getMockFileContent = (filePath) => {
  const fileName = getBasename(filePath);
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (extension === 'md') {
    return `# ${fileName.replace('.md', '').replace(/_/g, ' ').replace(/-/g, ' ')}\n\n## Overview\n\nThis document is part of the Insurance Golden Repository and provides important guidance for AI-enabled SDLC processes.\n\n## Key Points\n\n- **Governance**: Ensure responsible AI practices\n- **Standards**: Follow industry best practices\n- **Compliance**: Meet regulatory requirements\n- **Quality**: Maintain high standards throughout the lifecycle\n\n## Implementation Guidelines\n\n### Step 1: Assessment\n\nEvaluate the current state and requirements.\n\n### Step 2: Planning\n\nDevelop a comprehensive plan that addresses all aspects.\n\n### Step 3: Execution\n\nImplement the solution following established patterns.\n\n### Step 4: Monitoring\n\nContinuously monitor and improve the system.\n\n## Related Documents\n\n- See other files in this section for additional context\n- Refer to compliance documentation for audit requirements\n- Check testing guidelines for quality assurance\n\n## Notes\n\nThis is a sample document generated for demonstration purposes. In a real implementation, this would contain the actual content from the ${fileName} file in the Golden Repository.`;
  } else if (extension === 'py') {
    return `#!/usr/bin/env python3\n"""${fileName} - Part of Insurance Golden Repository\n\nThis module provides functionality for the AI-enabled SDLC process.\n"""\n\nimport os\nimport json\nfrom typing import Dict, List, Optional\n\nclass GoldenRepoService:\n    """Service class for Golden Repository operations."""\n    \n    def __init__(self):\n        self.config = self._load_config()\n    \n    def _load_config(self) -> Dict:\n        """Load configuration settings."""\n        return {\n            "version": "1.0.0",\n            "environment": os.getenv("ENVIRONMENT", "development"),\n            "debug": os.getenv("DEBUG", "false").lower() == "true"\n        }\n    \n    def process_data(self, data: Dict) -> Dict:\n        """Process data according to Golden Repository standards."""\n        # Implementation would go here\n        return {"status": "processed", "data": data}\n    \n    def validate_compliance(self, item: Dict) -> bool:\n        """Validate item against compliance requirements."""\n        # Implementation would go here\n        return True\n\nif __name__ == "__main__":\n    service = GoldenRepoService()\n    print(f"Golden Repository Service initialized - Version {service.config['version']}")`;
  } else if (extension === 'txt') {
    return `${fileName.replace('.txt', '').replace(/_/g, ' ').replace(/-/g, ' ')}\n\nThis is a template file from the Insurance Golden Repository.\n\nKey Components:\n- Component 1: Description and usage\n- Component 2: Implementation details\n- Component 3: Best practices\n\nInstructions:\n1. Review the requirements carefully\n2. Follow the established patterns\n3. Ensure compliance with standards\n4. Test thoroughly before deployment\n\nNotes:\n- This template should be customized for specific use cases\n- Refer to documentation for additional guidance\n- Contact the team for questions or clarifications\n\nLast Updated: ${new Date().toISOString().split('T')[0]}`;
  } else {
    return `Content of ${fileName}\n\nThis file is part of the Insurance Golden Repository and contains important resources for AI-enabled SDLC processes.\n\nFile Type: ${extension?.toUpperCase() || 'Unknown'}\nPath: ${filePath}\n\nFor more information about this file and its usage, please refer to the documentation in the same directory or contact the development team.`;
  }
};
