// Azure DevOps Service for creating work items and managing repositories
// Real implementation using Azure DevOps REST API

// Create work items in Azure DevOps (Epics, Features, User Stories with proper linking)
export const createWorkItems = async (selectedData, azureConfig) => {
  try {
    // Validate configuration
    if (!azureConfig.organization || !azureConfig.project || !azureConfig.personalAccessToken) {
      throw new Error('Invalid Azure DevOps configuration for work item creation');
    }

    const workItemResults = {
      epics: [],
      features: [],
      userStories: [],
      errors: []
    };

    // Create Epics first
    if (selectedData.epics && selectedData.epics.length > 0) {
      for (const epic of selectedData.epics) {
        try {
          const epicResult = await createEpic(epic, azureConfig);
          workItemResults.epics.push(epicResult);
        } catch (error) {
          workItemResults.errors.push(`Epic "${epic.title}": ${error.message}`);
        }
      }
    }

    // Create Features and link to Epics
    if (selectedData.features && selectedData.features.length > 0) {
      for (const feature of selectedData.features) {
        try {
          const featureResult = await createFeature(feature, azureConfig, workItemResults.epics);
          workItemResults.features.push(featureResult);
        } catch (error) {
          workItemResults.errors.push(`Feature "${feature.title}": ${error.message}`);
        }
      }
    }

    // Create User Stories and link to Features
    if (selectedData.userStories && selectedData.userStories.length > 0) {
      for (const userStory of selectedData.userStories) {
        try {
          const userStoryResult = await createUserStory(userStory, azureConfig, workItemResults.features);
          workItemResults.userStories.push(userStoryResult);
        } catch (error) {
          workItemResults.errors.push(`User Story "${userStory.title}": ${error.message}`);
        }
      }
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      results: workItemResults,
      summary: {
        epicsCreated: workItemResults.epics.length,
        featuresCreated: workItemResults.features.length,
        userStoriesCreated: workItemResults.userStories.length,
        totalErrors: workItemResults.errors.length
      }
    };

  } catch (error) {
    throw new Error('Failed to create work items');
  }
};

// Create an Epic work item
const createEpic = async (epic, azureConfig) => {
  const workItemData = [
    {
      "op": "add",
      "path": "/fields/System.Title",
      "value": epic.title
    },
    {
      "op": "add", 
      "path": "/fields/System.Description",
      "value": epic.description || ""
    },
    {
      "op": "add",
      "path": "/fields/System.State",
      "value": mapStatusToAzureDevOps(epic.status)
    },
    {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.Priority",
      "value": mapPriorityToAzureDevOps(epic.priority)
    }
  ];

  // Add acceptance criteria if available
  if (epic.acceptanceCriteria && epic.acceptanceCriteria.length > 0) {
    workItemData.push({
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.AcceptanceCriteria",
      "value": epic.acceptanceCriteria.join('\n')
    });
  }

  const response = await callAzureDevOpsAPI(
    `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/wit/workitems/$Epic?api-version=7.0`,
    'POST',
    azureConfig.personalAccessToken,
    workItemData
  );

  return {
    id: response.id,
    title: epic.title,
    workItemId: response.id,
    url: response._links.html.href,
    type: 'Epic'
  };
};

// Create a Feature work item and link to Epic
const createFeature = async (feature, azureConfig, createdEpics) => {
  const workItemData = [
    {
      "op": "add",
      "path": "/fields/System.Title", 
      "value": feature.title
    },
    {
      "op": "add",
      "path": "/fields/System.Description",
      "value": feature.description || ""
    },
    {
      "op": "add",
      "path": "/fields/System.State",
      "value": mapStatusToAzureDevOps(feature.status)
    },
    {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.Priority",
      "value": mapPriorityToAzureDevOps(feature.priority)
    }
  ];

  // Add story points if available
  if (feature.storyPoints) {
    workItemData.push({
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Scheduling.StoryPoints",
      "value": feature.storyPoints
    });
  }

  // Add acceptance criteria if available
  if (feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0) {
    workItemData.push({
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.AcceptanceCriteria", 
      "value": feature.acceptanceCriteria.join('\n')
    });
  }

  const response = await callAzureDevOpsAPI(
    `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/wit/workitems/$Feature?api-version=7.0`,
    'POST',
    azureConfig.personalAccessToken,
    workItemData
  );

  // Link to Epic if available
  if (createdEpics.length > 0) {
    const parentEpic = createdEpics[0]; // Link to first epic for simplicity
    await linkWorkItems(response.id, parentEpic.workItemId, 'Parent', azureConfig);
  }

  return {
    id: response.id,
    title: feature.title,
    workItemId: response.id,
    url: response._links.html.href,
    type: 'Feature',
    linkedEpic: createdEpics.length > 0 ? createdEpics[0].workItemId : null
  };
};

// Create a User Story work item and link to Feature
const createUserStory = async (userStory, azureConfig, createdFeatures) => {
  const workItemData = [
    {
      "op": "add",
      "path": "/fields/System.Title",
      "value": userStory.title
    },
    {
      "op": "add",
      "path": "/fields/System.Description", 
      "value": userStory.description || ""
    },
    {
      "op": "add",
      "path": "/fields/System.State",
      "value": mapStatusToAzureDevOps(userStory.status)
    },
    {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.Priority",
      "value": mapPriorityToAzureDevOps(userStory.priority)
    }
  ];

  // Add story points if available
  if (userStory.storyPoints) {
    workItemData.push({
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Scheduling.StoryPoints",
      "value": userStory.storyPoints
    });
  }

  // Add acceptance criteria if available
  if (userStory.acceptanceCriteria && userStory.acceptanceCriteria.length > 0) {
    workItemData.push({
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.AcceptanceCriteria",
      "value": userStory.acceptanceCriteria.join('\n')
    });
  }

  const response = await callAzureDevOpsAPI(
    `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/wit/workitems/$User%20Story?api-version=7.0`,
    'POST',
    azureConfig.personalAccessToken,
    workItemData
  );

  // Link to Feature if available
  if (createdFeatures.length > 0) {
    const parentFeature = createdFeatures[0]; // Link to first feature for simplicity
    await linkWorkItems(response.id, parentFeature.workItemId, 'Parent', azureConfig);
  }

  return {
    id: response.id,
    title: userStory.title,
    workItemId: response.id,
    url: response._links.html.href,
    type: 'User Story',
    linkedFeature: createdFeatures.length > 0 ? createdFeatures[0].workItemId : null
  };
};

// Link work items (create parent-child relationships)
const linkWorkItems = async (childId, parentId, linkType, azureConfig) => {
  const linkData = [
    {
      "op": "add",
      "path": "/relations/-",
      "value": {
        "rel": `System.LinkTypes.Hierarchy-${linkType}`,
        "url": `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/wit/workItems/${parentId}`
      }
    }
  ];

  await callAzureDevOpsAPI(
    `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/wit/workitems/${childId}?api-version=7.0`,
    'PATCH',
    azureConfig.personalAccessToken,
    linkData
  );
};

// Generic Azure DevOps API caller with real implementation
const callAzureDevOpsAPI = async (url, method, token, data) => {
  console.log(`Making Azure DevOps API call to: ${url}`);
  console.log(`Method: ${method}`);
  console.log(`Data:`, data);

  const response = await fetch(url, {
    method: method,
    headers: {
      'Authorization': `Basic ${btoa(`:${token}`)}`,
      'Content-Type': 'application/json-patch+json',
      'Accept': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined
  });

  console.log(`Response status: ${response.status}`);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error?.message || errorMessage;
    } catch (e) {
      // Failed to parse error response - use default message
    }
    throw new Error(`Azure DevOps API error: ${errorMessage}`);
  }

  const result = await response.json();
  console.log('Azure DevOps API Response:', result);
    return result;
};

// Map internal status to Azure DevOps states
const mapStatusToAzureDevOps = (status) => {
  const statusMap = {
    'pending': 'New',
    'todo': 'New', 
    'in-progress': 'Active',
    'active': 'Active',
    'completed': 'Closed',
    'done': 'Closed'
  };
  return statusMap[status?.toLowerCase()] || 'New';
};

// Map internal priority to Azure DevOps priority
const mapPriorityToAzureDevOps = (priority) => {
  const priorityMap = {
    'low': 4,
    'medium': 3,
    'high': 2,
    'critical': 1
  };
  return priorityMap[priority?.toLowerCase()] || 3;
};

// Browser-compatible base64 encoding for UTF-8 strings
const encodeBase64 = (str) => {
  try {
    // Handle UTF-8 encoding properly in browser
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    // Fallback: simple btoa for ASCII-only content
    return btoa(str);
  }
};

// Real Azure DevOps repository integration for pushing files
export const pushToAzureDevOps = async (selectedData, azureConfig) => {
  try {
    // Validate configuration
    if (!azureConfig.organization || !azureConfig.project || !azureConfig.repository || !azureConfig.personalAccessToken) {
      throw new Error('Invalid Azure DevOps configuration');
    }

    // Generate markdown content (only for requirements and prompts, NOT work items)
    const documentationData = {
      requirements: selectedData.requirements || [],
      prompts: selectedData.prompts || []
    };
    const markdownContent = generateMarkdownContent(documentationData);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
    const fileName = `sdlc-documentation-${timestamp}.md`;
    const filePath = `${azureConfig.filePath}${fileName}`;
    
    // Get repository information
    const repoUrl = `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/git/repositories/${azureConfig.repository}?api-version=7.0`;
    await callAzureDevOpsAPI(repoUrl, 'GET', azureConfig.personalAccessToken);
    
    // Get the latest commit from the target branch
    const refsUrl = `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/git/repositories/${azureConfig.repository}/refs?filter=heads/${azureConfig.branch}&api-version=7.0`;
    const refsResponse = await callAzureDevOpsAPI(refsUrl, 'GET', azureConfig.personalAccessToken);
    
    if (!refsResponse.value || refsResponse.value.length === 0) {
      throw new Error(`Branch '${azureConfig.branch}' not found in repository`);
    }
    
    const latestCommitId = refsResponse.value[0].objectId;
    
    // Check if file exists to determine if we should add or edit
    let changeType = "add";
    try {
      const fileUrl = `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/git/repositories/${azureConfig.repository}/items?path=/${filePath}&api-version=7.0`;
      const fileResponse = await callAzureDevOpsAPI(fileUrl, 'GET', azureConfig.personalAccessToken);
      if (fileResponse) {
        changeType = "edit";
      }
    } catch (error) {
      // File doesn't exist, use add
      changeType = "add";
    }

    // Create the push data
    const pushData = {
      refUpdates: [
        {
          name: `refs/heads/${azureConfig.branch}`,
          oldObjectId: latestCommitId
        }
      ],
      commits: [
        {
          comment: `SDLC Documentation Update - ${new Date().toLocaleDateString()}`,
          changes: [
            {
              changeType: changeType,
              item: {
                path: `/${filePath}`
              },
              newContent: {
                content: encodeBase64(markdownContent),
                contentType: "base64encoded"
              }
            }
          ]
        }
      ]
    };
    
    // Push the changes
    const pushUrl = `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_apis/git/repositories/${azureConfig.repository}/pushes?api-version=7.0`;
    const pushResponse = await callAzureDevOpsAPI(pushUrl, 'POST', azureConfig.personalAccessToken, pushData);
    
    return {
      success: true,
      commitId: pushResponse.commits[0].commitId,
      branch: azureConfig.branch,
      repository: azureConfig.repository,
      project: azureConfig.project,
      organization: azureConfig.organization,
      timestamp: new Date().toISOString(),
      filesPushed: 1,
      contentSize: markdownContent.length,
      message: `SDLC Documentation Update - ${new Date().toLocaleDateString()}`,
      url: `https://dev.azure.com/${azureConfig.organization}/${azureConfig.project}/_git/${azureConfig.repository}?path=%2F${filePath}&version=GB${azureConfig.branch}`
    };

  } catch (error) {
    throw new Error('Failed to push to Azure DevOps');
  }
};

// Generate markdown content from selected data (only requirements and prompts)
const generateMarkdownContent = (selectedData) => {
  let content = `# SDLC Documentation - ${new Date().toLocaleDateString()}\n\n`;
  content += `> This document contains requirements and prompts. Work items (Epics, Features, User Stories) are created separately as Azure DevOps work items.\n\n`;
  
  if (selectedData.requirements && selectedData.requirements.length > 0) {
    content += `## Requirements\n\n`;
    selectedData.requirements.forEach(req => {
      content += `### ${req.title}\n`;
      content += `${req.description}\n\n`;
    });
  }

  if (selectedData.prompts && selectedData.prompts.length > 0) {
    content += `## Prompts\n\n`;
    selectedData.prompts.forEach(prompt => {
      content += `### ${prompt.title}\n`;
      content += `**Category:** ${prompt.category}\n`;
      content += `**Tags:** ${prompt.tags.join(', ')}\n\n`;
      content += `${prompt.content}\n\n`;
      
      if (prompt.generatedCode) {
        content += `**Generated Code:**\n`;
        content += `\`\`\`javascript\n${prompt.generatedCode}\n\`\`\`\n\n`;
      }
    });
  }

  if (!selectedData.requirements?.length && !selectedData.prompts?.length) {
    content += `## No Documentation Content\n\n`;
    content += `No requirements or prompts were selected for documentation. Work items are created separately as Azure DevOps work items.\n\n`;
  }

  return content;
};

// Real Azure DevOps API implementation for guidelines
export const pushGuidelinesToAzureDevOpsReal = async (guidelinesData, azureConfig) => {
  try {
    console.log('Guidelines data received:', guidelinesData);
    console.log('Guidelines data keys:', Object.keys(guidelinesData || {}));
    
    // Validate that we have actual content
    const content = guidelinesData.content || guidelinesData.guidelines || guidelinesData;
    if (!content || content === 'undefined' || (typeof content === 'string' && content.trim() === '')) {
      throw new Error('No valid guidelines content found. Please generate guidelines first.');
    }
    
    const { organization, project, repository, personalAccessToken, branch } = azureConfig;
    
    if (!organization || !project || !repository || !personalAccessToken) {
      throw new Error('Missing required Azure DevOps configuration');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
    const fileName = `ai-guidelines-${timestamp}.md`;
    const filePath = `src/${fileName}`;
    
    // Get repository information
    const repoUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repository}?api-version=7.0`;
    await callAzureDevOpsAPI(repoUrl, 'GET', personalAccessToken);
    
    // Get the latest commit from the target branch
    const refsUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repository}/refs?filter=heads/${branch}&api-version=7.0`;
    const refsResponse = await callAzureDevOpsAPI(refsUrl, 'GET', personalAccessToken);
    
    if (!refsResponse.value || refsResponse.value.length === 0) {
      throw new Error(`Branch '${branch}' not found in repository`);
    }
    
    const latestCommitId = refsResponse.value[0].objectId;
    
    // Check if file exists to determine if we should add or edit
    let changeType = "add";
    try {
      const fileUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repository}/items?path=/${filePath}&api-version=7.0`;
      const fileResponse = await callAzureDevOpsAPI(fileUrl, 'GET', personalAccessToken);
      if (fileResponse) {
        changeType = "edit";
      }
    } catch (error) {
      // File doesn't exist, use add
      changeType = "add";
    }

    // Create the push data
    const pushData = {
      refUpdates: [
        {
          name: `refs/heads/${branch}`,
          oldObjectId: latestCommitId
        }
      ],
      commits: [
        {
          comment: `AI Guidelines Update - ${new Date().toLocaleDateString()}`,
          changes: [
            {
              changeType: changeType,
              item: {
                path: `/${filePath}`
              },
              newContent: {
                content: (() => {
                  const contentToEncode = guidelinesData.content || guidelinesData.guidelines || guidelinesData;
                  console.log('Content to encode:', contentToEncode);
                  console.log('Content type:', typeof contentToEncode);
                  
                  let finalContent = '';
                  
                  if (typeof contentToEncode === 'string' && contentToEncode.trim() !== '') {
                    finalContent = contentToEncode;
                  } else if (typeof contentToEncode === 'object' && contentToEncode !== null) {
                    finalContent = JSON.stringify(contentToEncode, null, 2);
                  } else {
                    // Fallback content
                    finalContent = `# AI Guidelines - ${new Date().toLocaleDateString()}\n\nGenerated guidelines content not available.\n\nOriginal data:\n${JSON.stringify(guidelinesData, null, 2)}`;
                  }
                  
                  console.log('Final content to encode:', finalContent.substring(0, 100) + '...');
                  return encodeBase64(finalContent);
                })(),
                contentType: "base64encoded"
              }
            }
          ]
        }
      ]
    };

    // Push the changes
    const pushUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repository}/pushes?api-version=7.0`;
    const pushResponse = await callAzureDevOpsAPI(pushUrl, 'POST', personalAccessToken, pushData);

    return {
      success: true,
      commitId: pushResponse.commits[0].commitId,
      branch: branch,
      repository: repository,
      project: project,
      organization: organization,
      timestamp: new Date().toISOString(),
      filesPushed: 1,
      contentSize: (guidelinesData.content || guidelinesData.guidelines || JSON.stringify(guidelinesData)).length,
      message: `AI Guidelines Update - ${new Date().toLocaleDateString()}`,
      url: `https://dev.azure.com/${organization}/${project}/_git/${repository}?path=%2F${filePath}&version=GB${branch}`
    };

  } catch (error) {
    throw new Error('Failed to push guidelines to Azure DevOps');
  }
};
