// static-site/static-site-server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules 中获取 __dirname 的方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3002; // 静态站点服务端口

// 托管当前目录下的静态文件 (index.html, assets 文件夹等)
app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`Static Site Server listening at http://localhost:${port}`);
  console.log(`Serving index.html from: ${path.join(__dirname, 'index.html')}`);
});
