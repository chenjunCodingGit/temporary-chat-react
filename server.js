/**
 * Microsoft Graph API Authentication Example
 * This example demonstrates how to authenticate users with Microsoft Graph API using MSAL Node.
 * It includes endpoints to get the authorization URL, exchange the authorization code for an access token,
 * and fetch user information.
*/
import express from 'express';
import cors from 'cors';
import { ConfidentialClientApplication } from '@azure/msal-node';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 允许跨域请求
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// MSAL 配置
const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    clientSecret: process.env.CLIENT_SECRET || ''
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 3,
    }
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

// 获取授权 URL
app.get('/auth-url', async (req, res) => {
  try {
    const authCodeUrlParameters = {
      scopes: ['User.Read'],
      redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/callback',
    };

    const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.json({ url: authUrl });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ error: 'Failed to get auth URL' });
  }
});

// 交换授权码获取令牌
app.post('/token', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const tokenRequest = {
      code: req.body.code,
      scopes: ['User.Read'],
      redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/callback',
    };

    const tokenResponse = await cca.acquireTokenByCode(tokenRequest);
    res.json(tokenResponse);
  } catch (error) {
    console.error('Error getting token:', error);
    res.status(500).json({ error: 'Failed to get token' });
  }
});

// 获取用户信息 (示例受保护路由)
app.get('/me', async (req, res) => {
  const accessToken = req.headers['authorization']?.split(' ')[1];
  
  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    // 这里应该验证令牌并调用 Microsoft Graph API
    // 简化示例，直接返回模拟数据
    res.json({
      name: 'John Doe',
      email: 'john.doe@example.com'
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});