import { getRedirectUri } from './environment';

export const msalConfig = {
  auth: {
    clientId: "c324fa10-3c19-4d64-99e9-4b0e94845058", // ✅ This is your App ID (Client ID)
    authority: "https://login.microsoftonline.com/5a6c876c-f971-4b14-91e5-b14f89bb031d", // ✅ This is your Tenant ID
    redirectUri: getRedirectUri(), // ✅ Automatically selects based on environment
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};

// Optional: Additional scopes you might need
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
