import { Configuration, PublicClientApplication } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MS_CLIENT_ID,
    authority: `https://${import.meta.env.VITE_MS_TENANT_ID}.b2clogin.com/${import.meta.env.VITE_MS_TENANT_ID}/B2C_1_signin-signup`, // 包含用户流名称
    redirectUri: import.meta.env.VITE_MS_REDIRECT_URI,
  },
  cache: { 
    cacheLocation: 'sessionStorage',
    // storeAuthStateInCookie: false,
 }
};

export const msalInstance = new PublicClientApplication(msalConfig);
export const loginRequest = {
  scopes: ['api.read', 'openid', 'profile', 'email'], // 使用后端API的范围
  redirectUri: import.meta.env.VITE_MS_REDIRECT_URI,
  p: 'B2C_1_signin-signup' // 显式指定用户流名称
};