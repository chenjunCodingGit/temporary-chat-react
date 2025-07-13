// chat-app-server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

// ES Modules 中获取 __dirname 的方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001; // React 应用服务端口

// 配置 CORS
// 允许来自 http://localhost:3002 (静态站点服务器) 的请求
const corsOptions = {
  origin: 'http://localhost:3002', 
  optionsSuccessStatus: 200 // 一些旧浏览器 (IE11, various SmartTVs) 会对 204 产生问题
};
app.use(cors(corsOptions));

// 托管 dist-lib 目录下的静态文件
app.use(express.static(path.join(__dirname, 'dist-embed')));

app.listen(port, () => {
  console.log(`Chat App Server (React Component Library) listening at http://localhost:${port}`);
  console.log(`Serving files from: ${path.join(__dirname, 'dist-lib')}`);
});
