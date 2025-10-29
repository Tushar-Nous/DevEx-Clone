// Environment configuration
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

export const getRedirectUri = () => {
  if (isProduction) {
    return "https://gentle-stone-0eb06dc0f.1.azurestaticapps.net/";
  }
  return "http://localhost:3000/";
};

export const config = {
  production: {
    redirectUri: "https://gentle-stone-0eb06dc0f.1.azurestaticapps.net/",
    environment: 'production'
  },
  development: {
    redirectUri: "http://localhost:3000/",
    environment: 'development'
  }
};
