# MSAL Integration Setup Guide

## Overview
This application now includes Microsoft Authentication Library (MSAL) integration for secure user authentication using Azure Active Directory.

## Features implemented

### 🔐 Authentication Components
- **Landing Page**: Beautiful landing page with Microsoft login button
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **User Profile**: User information display with logout functionality
- **Auth Context**: Centralized authentication state management

### 🎨 UI Components
- **LandingPage.js**: Modern, responsive landing page with gradient design
- **UserProfile.js**: Dropdown user profile with account information
- **ProtectedRoute.js**: Route protection wrapper component
- **AuthContext.js**: React context for authentication state

### ⚙️ Configuration
- **msalConfig.js**: MSAL configuration with environment-specific settings
- **environment.js**: Environment detection and configuration
- Automatic redirect URI selection (localhost for dev, Azure Static Web Apps for production)

## Azure AD Configuration Required

### 1. App Registration Settings
Make sure your Azure AD app registration has:
- **Client ID**: `c324fa10-3c19-4d64-99e9-4b0e94845058`
- **Tenant ID**: `5a6c876c-f971-4b14-91e5-b14f89bb031d`

### 2. Redirect URIs
Add both URLs to your app registration:
- Development: `http://localhost:3000/`
- Production: `https://yellow-desert-07b2f1b00.1.azurestaticapps.net/`

### 3. API Permissions
Ensure the following permissions are granted:
- `User.Read` (Microsoft Graph)

## How It Works

### 1. Authentication Flow
1. User visits the application
2. If not authenticated, shows landing page
3. User clicks "Sign In with Microsoft"
4. MSAL handles OAuth2/OpenID Connect flow
5. After successful login, user is redirected to dashboard
6. User profile is displayed in the navigation sidebar

### 2. Route Protection
```javascript
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

### 3. User Information Access
```javascript
import { useAuth } from '../context/AuthContext';

const { user, isAuthenticated, logout } = useAuth();
```

## Environment Configuration

The application automatically detects the environment:
- **Development**: Uses `http://localhost:3000/`
- **Production**: Uses `https://yellow-desert-07b2f1b00.1.azurestaticapps.net/`

## Testing

### Development
1. Run `yarn start`
2. Navigate to `http://localhost:3000`
3. You should see the landing page
4. Click "Sign In with Microsoft"
5. Complete the authentication flow

### Production
1. Deploy to Azure Static Web Apps
2. Navigate to your production URL
3. Test the same authentication flow

## Troubleshooting

### Common Issues

1. **MSAL Configuration Error**
   - Check that Client ID and Tenant ID are correct
   - Verify redirect URIs are registered in Azure AD

2. **Redirect URI Mismatch**
   - Ensure the redirect URI in Azure AD matches exactly
   - Check environment configuration

3. **Permissions Issues**
   - Verify API permissions are granted
   - Check if admin consent is required

### Debug Information
The application logs authentication events to the browser console for debugging.

## Security Notes

- Tokens are stored in localStorage
- Authentication state is managed securely through MSAL
- User information is only accessible after successful authentication
- Automatic token refresh is handled by MSAL

## File Structure
```
src/
├── config/
│   ├── msalConfig.js      # MSAL configuration
│   └── environment.js     # Environment detection
├── context/
│   └── AuthContext.js     # Authentication context
├── components/
│   ├── LandingPage.js     # Login landing page
│   ├── ProtectedRoute.js  # Route protection
│   ├── UserProfile.js     # User profile component
│   └── Navigation.js      # Updated with user profile
├── App.js                 # Updated with auth providers
└── index.js               # Updated with MSAL provider
```

## Next Steps

1. Test the authentication flow
2. Customize the landing page design if needed
3. Add additional user permissions if required
4. Implement role-based access control if needed
