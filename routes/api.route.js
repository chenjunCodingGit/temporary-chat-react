const router = require('express').Router();
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const crypto = require('crypto'); // 引入 Node.js 内置的加密模块

// =================== 加密配置和函数 ===================
const algorithm = 'aes-256-cbc'; // 使用 AES-256-CBC 对称加密算法
const secretKey = process.env.ENCRYPTION_SECRET_KEY;
if (!secretKey || secretKey.length !== 32) {
  throw new Error('ENCRYPTION_SECRET_KEY environment variable must be set and be 32 characters long.');
}

// 加密函数
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// 解密函数
function decrypt(data) {
  const iv = Buffer.from(data.iv, 'hex');
  const encryptedText = Buffer.from(data.encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
// =======================================================

// =================== 模拟数据库 ===================
const userStore = {};
// ===============================================

// 初始化 OAuth2Client
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'postmessage', 
  requestOptions: {
    timeout: 30000, 
  },
});

/**
 * @route   POST /api/authgoogle
 * @desc    接收从前端发来的授权码(code), 交换成tokens, 并存储用户信息和加密的refresh_token
 * @access  Public
 */
router.post('/authgoogle', async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing.' });
    }
    
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'postmessage',
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000,
    });

    const tokens = tokenResponse.data;
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userId = payload.sub;

    if (tokens.refresh_token) {
      console.log(`Encrypting and storing refresh token for user: ${userId}`);
      const encryptedToken = encrypt(tokens.refresh_token);
      userStore[userId] = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        encryptedRefreshToken: encryptedToken,
      };
    }

    console.log('Current User Store:', userStore);

    res.status(200).json({
      message: 'Authentication successful!',
      accessToken: tokens.access_token,
      accessTokenExpiresAt: Date.now() + tokens.expires_in * 1000,
      user: payload,
    });

  } catch (error) {
    console.error('Failed in /authgoogle route:', error.response?.data || error.message);
    next(error);
  }
});

// =================== 新增部分: 刷新 Access Token 的路由 ===================
/**
 * @route   POST /api/refresh-token
 * @desc    使用存储的 refresh_token 获取一个新的 access_token
 * @access  Protected (在真实应用中, 应检查用户会话或JWT)
 */
router.post('/refresh-token', async (req, res, next) => {
  try {
    // 在真实应用中, userId 通常从 session 或 JWT token 中获取
    // 为了演示, 我们从请求体中直接获取
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const userData = userStore[userId];
    if (!userData || !userData.encryptedRefreshToken) {
      return res.status(403).json({ message: 'No refresh token found for this user. Please log in again.' });
    }

    // 1. 解密存储的 refresh token
    const refreshToken = decrypt(userData.encryptedRefreshToken);
    console.log(`Found and decrypted refresh token for user: ${userId}`);

    // 2. 使用 refresh token 请求新的 access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000,
    });

    const newTokens = tokenResponse.data;
    console.log(`Successfully refreshed access token for user: ${userId}`);

    // 3. 将新的 access token 和过期时间返回给前端
    res.status(200).json({
      message: 'Access token refreshed successfully!',
      accessToken: newTokens.access_token,
      accessTokenExpiresAt: Date.now() + newTokens.expires_in * 1000,
    });

  } catch (error) {
    console.error('Failed to refresh access token:', error.response?.data || error.message);
    // 如果 refresh token 也失效了, Google 会返回 'invalid_grant'
    if (error.response?.data?.error === 'invalid_grant') {
      return res.status(403).json({ message: 'Refresh token is invalid or has been revoked. Please log in again.'});
    }
    next(error);
  }
});
// =========================================================================

module.exports = router;
