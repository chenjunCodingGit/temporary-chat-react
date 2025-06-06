const router = require('express').Router();
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User.model.js'); // 引入 User 模型

// =================== 加密配置和函数 ===================
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_SECRET_KEY;
if (!secretKey || secretKey.length !== 32) {
  throw new Error('ENCRYPTION_SECRET_KEY environment variable must be set and be 32 characters long.');
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(data) {
  const iv = Buffer.from(data.iv, 'hex');
  const encryptedText = Buffer.from(data.encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
// =======================================================

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
 * @desc    接收授权码, 交换tokens, 并通过 "upsert" 操作创建或更新数据库中的用户记录
 * @access  Public
 */
router.post('/authgoogle', async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Authorization code is missing.' });

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
    const googleId = payload.sub;

    // ** 数据库操作: 创建或更新用户 **
    // 使用 findOneAndUpdate 和 upsert:true 选项，这是一个高效的 "get or create" 操作。
    const updateData = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    // 只有在 Google 提供了新的 refresh_token 时，才更新数据库中的这个字段
    if (tokens.refresh_token) {
      updateData.encryptedRefreshToken = encrypt(tokens.refresh_token);
    }
    
    const user = await User.findOneAndUpdate(
      { googleId: googleId }, // 查询条件
      { $set: updateData },    // 更新或插入的数据
      { new: true, upsert: true } // 选项: 返回更新后的文档, 如果找不到则创建
    );

    console.log('User created or updated in MongoDB:', user);

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


/**
 * @route   POST /api/refresh-token
 * @desc    从数据库中查找用户, 解密 refresh_token, 并用它获取新的 access_token
 * @access  Protected
 */
router.post('/refresh-token', async (req, res, next) => {
  try {
    // 前端现在应该传递 googleId
    const { googleId } = req.body;
    if (!googleId) {
      return res.status(400).json({ message: 'Google User ID is required.' });
    }

    // ** 数据库操作: 查找用户 **
    const user = await User.findOne({ googleId: googleId });
    if (!user || !user.encryptedRefreshToken?.iv) { // 检查 iv 是否存在以确认有token
      return res.status(403).json({ message: 'No refresh token found for this user. Please log in again.' });
    }
    
    const refreshToken = decrypt(user.encryptedRefreshToken);
    console.log(`Found and decrypted refresh token for user: ${googleId}`);
    
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
    console.log(`Successfully refreshed access token for user: ${googleId}`);

    res.status(200).json({
      message: 'Access token refreshed successfully!',
      accessToken: newTokens.access_token,
      accessTokenExpiresAt: Date.now() + newTokens.expires_in * 1000,
    });
  } catch (error) {
    console.error('Failed to refresh access token:', error.response?.data || error.message);
    if (error.response?.data?.error === 'invalid_grant') {
      return res.status(403).json({ message: 'Refresh token is invalid or has been revoked. Please log in again.' });
    }
    next(error);
  }
});

module.exports = router;
