const router = require('express').Router();
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios'); // 引入 axios

// =================== 新增部分 1: 模拟数据库 ===================
// 在真实的应用中, 你会使用像 MongoDB, PostgreSQL, 或者 Firestore 这样的数据库。
// 为了演示，我们使用一个简单的内存对象来存储用户信息。
// 键是用户的 Google ID (sub), 值是用户信息和 token。
const userStore = {};
// =============================================================

// 初始化 OAuth2Client，我们仍然需要它来验证 id_token
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'postmessage', 
  requestOptions: {
    timeout: 30000, 
  },
});

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

router.post('/authgoogle', async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing.' });
    }
    console.log('Received authorization code on backend:', code);

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'postmessage', 
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
       timeout: 30000,
    });

    const tokens = tokenResponse.data;
    console.log('Successfully exchanged code for tokens:', tokens);
    
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log('User Info (from ID Token):', payload);
    
    // =================== 新增部分 2: 存储用户信息和 Refresh Token ===================
    const userId = payload.sub; // Google 用户的唯一 ID

    // 检查这个用户是否是第一次登录, 或者我们是否需要更新 refresh token
    // Google 只在第一次授权时提供 refresh_token
    if (tokens.refresh_token) {
      console.log(`Storing refresh token for user: ${userId}`);
      userStore[userId] = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        refreshToken: tokens.refresh_token, // 保存 refresh token
      };
    } else {
      console.log(`User ${userId} already exists, no new refresh token provided.`);
    }

    // 打印当前的用户存储来验证
    console.log('Current User Store:', userStore);
    // =================================================================================

    // 为了安全, 不要将 refresh_token 直接发送回客户端
    // 只返回 access_token 和用户信息
    res.status(200).json({
      message: 'Authentication successful!',
      accessToken: tokens.access_token,
      accessTokenExpiresAt: Date.now() + tokens.expires_in * 1000,
      user: payload,
    });

  } catch (error) {
    console.error('Failed in /authgoogle route.');
    if (error.response?.data) {
        console.error('Error Details from Google:', error.response.data);
    } else if (error.code) {
        console.error(`Network or Request Error Code: ${error.code}`);
        console.error('Raw Error:', error.message);
    } else {
        console.error('Raw Error:', error.message);
    }
    next(error);
  }
});

module.exports = router;
