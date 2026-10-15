// A tiny static file server for suites that need to take the network away for real. Playwright's
// context.setOffline() doesn't stop requests made by the service worker, so "offline" there can still
// reach the server; stopping this server can't be bypassed. Serves PLAYTEST_DIST (default ./dist).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

export async function serveDist(dir = process.env.PLAYTEST_DIST ?? 'dist') {
  const root = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    let file = path.join(root, decodeURIComponent(u.pathname));
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) return res.writeHead(404).end('not found');
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  return {
    // localhost (not 127.0.0.1) so the page is a secure context for the service worker and Cache Storage
    url: `http://localhost:${port}/`,
    stop: () => new Promise((r) => { server.closeAllConnections?.(); server.close(() => r()); }),
    start: () => new Promise((r) => server.listen(port, r)),
  };
}
