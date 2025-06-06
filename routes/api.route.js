const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const router = require('express').Router();
const { google } = require('googleapis');
// process.env.GOOGLE_REDIRECT_URI,

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

router.post('/create-tokens', async (req, res, next) => {
  try {
    const { code } = req.body;
    console.log(' code:', code);

    const client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
    
    const { tokens_Library } = await client.getToken({
      code,
      redirect_uri: 'postmessage'
    });
    
    console.log('tokens_Library:', tokens_Library);

    const { tokens } = await oauth2Client.getToken({
      code,
      scope: 'openid email profile https://www.googleapis.com/auth/calendar'
    }).catch(err => {
      console.error('Error getting token:', err);
      throw new Error('Failed to get token');
    });
    console.log('tokens:', tokens);
    res.send(tokens);
  } catch (error) {
    next(error);
  }
})

router.post('/authgoogle', async (req, res) => {
  const { code } = req.body;
  console.log('Received /api/auth/google code:', code);
  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'postmessage',
      grant_type: 'authorization_code',
      scope: 'openid email profile https://www.googleapis.com/auth/calendar'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const tokens = tokenResponse.data;
    console.log('Tokens from direct API:', tokens);

    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });

    console.log('User Info:', userInfo.data);
    res.json({ tokens, user: userInfo.data });

  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);

    // 详细错误分析
    if (error.response) {
      console.error('HTTP status:', error.response.status);
      console.error('Error details:', error.response.data);

      // 特定错误处理
      if (error.response.data.error === 'invalid_grant') {
        console.error('Possible causes: expired code, incorrect credentials, or scope mismatch');
      }
    }

    res.status(500).json({
      error: 'Failed to authenticate',
      details: error.response?.data || error.message
    });
  }
});

router.get('/testing', async (req, res, next) => {
  try {
    const { tokens } = await oauth2Client.getToken({
      code: '4/0AUJR-x5lbcsIBoADL5DuitsQD2LBe8gf8YOtyQ8bQ2WCpaR_gQ-expH_u6d1kkxvo8CEqA',
      scope: 'openid email profile https://www.googleapis.com/auth/calendar'
    }).catch(err => {
      console.error('Error getting token:', err);
      throw new Error('Failed to get token');
    });
    console.log('tokens:', tokens);
    res.send({ message: 'Ok Testing api' });
  } catch (error) {

    console.error('Error in testing route:', error);
    // next(error);
  }
})

module.exports = router;
