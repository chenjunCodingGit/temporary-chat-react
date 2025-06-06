const router = require('express').Router();
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios'); // 引入 axios

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

    // *********************************************************************************
    // ** 最终修复方案：手动进行 Token 交换 **
    // 由于 `client.getToken()` 持续引发 'invalid_grant' 错误，
    // 我们现在绕过该方法，使用 axios 手动发送 POST 请求到 Google 的 token 端点。
    // 这让我们能够完全控制请求体，确保不包含任何多余的参数（如 code_verifier）。
    // *********************************************************************************
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'postmessage', // 必须与前端和客户端配置相匹配
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
       timeout: 30000,
    });

    const tokens = tokenResponse.data;

    console.log('Successfully exchanged code for tokens:', tokens);
    
    // 成功获取 tokens 后，我们继续使用 google-auth-library 来验证 ID token
    // 因为这是它的强项，而且很安全
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    console.log('User Info (from ID Token):', payload);

    // 成功后，将 tokens 和用户信息返回给前端
    res.status(200).json({
      message: 'Authentication successful!',
      tokens: tokens,
      user: payload,
    });

  } catch (error) {
    // 捕获并记录更详细的错误信息
    console.error('Failed to exchange authorization code.');
    if (error.response?.data) {
        console.error('Error Details from Google:', error.response.data);
    } else if (error.code) {
        console.error(`Network or Request Error Code: ${error.code}`);
        console.error('Raw Error:', error.message);
    } else {
        console.error('Raw Error:', error.message);
    }
    // 将错误传递给全局错误处理中间件
    next(error);
  }
});

module.exports = router;
