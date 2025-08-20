const http = require('http');
const fs = require('fs');
const path = require('path');

// 定义静态资源的 MIME 类型
const mimeTypes = {
  'html': 'text/html',
  'js': 'application/javascript',
  'css': 'text/css',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'json': 'application/json',
};

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 获取请求文件的路径和扩展名
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const extname = path.extname(filePath).slice(1);  // 获取文件的扩展名，如 html, js, css 等

  // 如果文件扩展名在 mimeTypes 中定义过，就返回该类型的文件
  if (mimeTypes[extname]) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error loading file');
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', mimeTypes[extname] || 'application/octet-stream');
      res.end(data);
    });
  } else {
    // 如果文件类型不被支持，返回 404
    res.statusCode = 404;
    res.end('File not found');
  }
});

// 设定服务器端口
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});