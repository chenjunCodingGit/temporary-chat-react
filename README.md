# React + TypeScript + Vite

UI: https://chatui.io/components/chat
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

```
/// 微软 OAuth2.0 集成 Demo 步骤说明（前端：Vite+React+TypeScript，后端：Node+Express）

/**
 * 步骤 1：注册 Azure 应用
 * -----------------------------------
 * 1. 登录 Azure Portal: https://portal.azure.com
 * 2. 导航到 Azure Active Directory > 应用注册 > 新注册
 *    - 名称：任意
 *    - 受支持的帐户类型：选择“任何组织目录中的帐户和个人 Microsoft 帐户”
 *    - 重定向 URI（web）：http://localhost:5173/auth/callback
 * 3. 创建后，记录以下信息：
 *    - 应用程序(客户端)ID
 *    - 目录(租户)ID
 *    - 客户端密钥（需手动生成一次）
 */

/**
 * 步骤 2：后端搭建（Node + Express）
 * -----------------------------------
 */
// 安装依赖：npm install express axios dotenv cors

// server/index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/auth/redirect', async (req, res) => {
  const code = req.query.code;

  const params = new URLSearchParams();
  params.append('client_id', process.env.CLIENT_ID);
  params.append('scope', 'openid profile email');
  params.append('code', code);
  params.append('redirect_uri', 'http://localhost:5173/auth/callback');
  params.append('grant_type', 'authorization_code');
  params.append('client_secret', process.env.CLIENT_SECRET);

  try {
    const response = await axios.post(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      params
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(3001, () => console.log('Auth server running on http://localhost:3001'));

/** .env 文件 */
// CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
// CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxx
// TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx


/**
 * 步骤 3：前端集成（Vite + React + TS）
 * -----------------------------------
 */
// 安装依赖：npm install axios react-router-dom

// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// src/App.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const clientId = '你的 CLIENT_ID';
const tenantId = '你的 TENANT_ID';
const redirectUri = 'http://localhost:5173/auth/callback';

function App() {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');

    if (code) {
      axios.get(`http://localhost:3001/auth/redirect?code=${code}`)
        .then(res => console.log('Access token:', res.data))
        .catch(err => console.error(err));
    }
  }, [location]);

  const login = () => {
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=openid%20profile%20email&state=12345`;
    window.location.href = authUrl;
  };

  return (
    <div>
      <h1>微软 OAuth2 登录 Demo</h1>
      <button onClick={login}>登录</button>
    </div>
  );
}

export default App;

```
