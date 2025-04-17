
const express = require('express');
const path = require('path');
const fs = require('fs')

const mimeTypes = {
  '.js': 'application/javascript',
  '.jsx': 'application/javascript',
  '.ts': 'application/x-typescript',
  '.tsx': 'text/typescript'
};

const staticPagePath = path.join(path.dirname(__dirname), 'public', 'index.html');

const entryPoint = staticPagePath;

const staticFiles = [
  path.join(path.dirname(__dirname), 'public', '/build/lib/lib.js'),
];

const staticDir = [
  path.join(path.dirname(__dirname), 'public', '/build/scripts'),
  path.join(path.dirname(__dirname), 'public', '/build/images')
];

const buildStaticFiles = async () => {
  staticDir.forEach(async (dir) => {
    const files = await fs.readdirSync(dir);
    files.forEach((file) => {
      staticFiles.push(path.join(dir, file));
    });
  });
  console.log('staticFiles: ', staticFiles);
}

const run = async () => {
  await buildStaticFiles();
}

run();

const renderDefaultPage = (res) => {
  res.setHeader("Content-type", "text/html");
  res.writeHead(200);
  fs.createReadStream(entryPoint).pipe(res);
};

const renderStaticFile = (staticFile, res) => {
  res.writeHead(200);
  fs.createReadStream(staticFile).pipe(res);
}

const app = express();

app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    if (mimeTypes[ext]) {
      res.set('Content-Type', mimeTypes[ext]);
    }
  }
}));

app.use('/', express.static(path.join(__dirname, '../public')), (req, res, next) => {
  const ext = path.extname(req.path);
  if (mimeTypes[ext]) {
    res.set('Content-Type', mimeTypes[ext]);
  }
  next();
});

// 原有静态资源服务
app.use('/static', express.static(path.join(__dirname, '../public/legacy')), (req, res, next) => {
  const ext = path.extname(req.path);
  if (mimeTypes[ext]) {
    res.set('Content-Type', mimeTypes[ext]);
  }
  console.log('req.url: ', req.url);
  renderDefaultPage(res);
  const staticFileResult = staticFiles.filter((file) => file.replace(/\\/g, "/").endsWith(req.url.slice(1)));
  console.log('staticFileResult: ', staticFileResult);
  if (staticFileResult.length > 0) {
    const staticFile = staticFileResult[0];
    renderStaticFile(staticFile, res);
    return;
  }
  next();
});

// React 构建产物服务
app.use('/react', express.static(path.join(__dirname, '../public/build')), (req, res, next) => {
  const ext = path.extname(req.path);
  if (mimeTypes[ext]) {
    res.set('Content-Type', mimeTypes[ext]);
  }
  next();
});

// API 路由保持原有
app.get('/api/data', (req, res, next) => {
  console.log('staticFiles: ', staticFiles);
  const staticFileResult = staticFiles.filter((file) => file.replace(/\\/g, "/").endsWith(req.url.slice(1)));
  // console.log('staticFileResult: ', staticFileResult);
  if (staticFiles.length > 0) {
    const staticFile = staticFileResult[0];
    renderStaticFile(staticFile, res);
    return;
  }
  next();
  res.json({ message: "From Express API" });
});

// 启动服务
app.listen(4000, () => {
  console.log('Express server running on port 4000');
});

// const server = http.createServer((req, res) => {
//   try {
//     if (req.url === "/") {
//       renderDefaultPage(res);
//       return;
//     }

//     const staticFileResult = staticFiles.filter((file) => file.replace(/\\/g, "/").endsWith(req.url.slice(1)));

//     if (staticFileResult.length > 0) {
//       const staticFile = staticFileResult[0];
//       renderStaticFile(staticFile, res);
//       return;
//     }

//     renderDefaultPage(res);
//   } catch {
//     console.log(`Invalid path: ${req.url}`);
//     renderDefaultPage(res);
//   }
// })

// server.listen(process.env.PORT || 8080);


/*
const http = require('http');
const fs = require('fs');
const path = require('path');

const staticPagePath = path.join(path.dirname(__dirname), 'public', '/build/index.html');

const entryPoint = staticPagePath;

const staticFiles = [
    path.join(path.dirname(__dirname), 'public', '/build/lib/lib.js'),
];

const staticDir = [
    path.join(path.dirname(__dirname), 'public', '/build/scripts'),
    path.join(path.dirname(__dirname), 'public', '/build/images')
];

const buildStaticFiles = async () => {
    staticDir.forEach(async (dir) => {
        const files = await fs.readdirSync(dir);
        files.forEach((file) => {
            staticFiles.push(path.join(dir, file));
        });
    });
}

const run = async () => {
    await buildStaticFiles();
}

run();

const renderDefaultPage = (res) => {
  console.log('entryPoint: ', entryPoint);
    res.setHeader("Content-type", "text/html");
    res.writeHead(200);
    fs.createReadStream(entryPoint).pipe(res);
};

const renderStaticFile = (staticFile, res) => {
    res.writeHead(200);
    fs.createReadStream(staticFile).pipe(res);
}

const server = http.createServer((req, res) => {
    try {
        if (req.url === "/") {
            renderDefaultPage(res);
            return;
        }

        const staticFileResult = staticFiles.filter((file) => file.replace(/\//g, "/").endsWith(req.url.slice(1)));
        console.log('staticFileResult; ', staticFileResult);
        if (staticFileResult.length > 0) {
            const staticFile = staticFileResult[0];
            renderStaticFile(staticFile, res);
            return;
        }

        renderDefaultPage(res);
    } catch {
        console.log(`Invalid path: ${req.url}`);
        renderDefaultPage(res);
    }
})

server.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
}
);

*/