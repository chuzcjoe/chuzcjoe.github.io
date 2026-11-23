import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { build } from '../lib/build.mjs';

const preview = process.argv.includes('--preview');
const root = process.cwd();
const outDir = preview ? 'dist' : '.dev';
const out = path.join(root, outDir);
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 4321);
const clients = new Set();
if (!preview) await build({ outDir, live: true });
else if (!(await fs.stat(path.join(out, 'index.html')).catch(() => null))) throw Error('Run npm run build before npm run preview.');

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp4': 'video/mp4' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (!preview && url.pathname === '/__events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write(': connected\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); res.end('Bad request'); return; }
    if (pathname.split('/').some(p => p.startsWith('.')) || pathname.includes('\\') || pathname.includes('\0')) { res.writeHead(404); res.end('Not found'); return; }
    let file = path.join(out, pathname);
    if (!file.startsWith(out + path.sep)) { res.writeHead(403); res.end(); return; }
    let stat = await fs.stat(file).catch(() => null);
    if (stat?.isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); res.end(); return; }
      file = path.join(file, 'index.html'); stat = await fs.stat(file).catch(() => null);
    }
    const exists = stat?.isFile();
    if (!exists) { file = path.join(out, '404.html'); stat = await fs.stat(file); }
    const headers = { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Content-Length': stat.size };
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (exists && range) {
      const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
      if (start > end || start >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); res.end(); return; }
      res.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes' });
      if (req.method === 'HEAD') res.end(); else createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(exists ? 200 : 404, headers);
      if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res);
    }
  } catch (error) { console.error(error); if (!res.headersSent) res.writeHead(500); res.end('Server error'); }
});
server.listen(port, '127.0.0.1', () => console.log(`\n  JoeChu · ${preview ? 'production preview' : 'Markdown dev server'}\n  Local: http://localhost:${port}/\n  ${preview ? 'Serving dist/' : 'Watching content/, templates/, static/, lib/, site.config.yml'}\n`));
let watcher;
if (!preview) {
  let timer, building = false, pending = false, copyAssets = false;
  const rebuild = async () => {
    if (building) { pending = true; return; }
    building = true;
    const assets = copyAssets; copyAssets = false;
    try {
      const { stdout } = await promisify(execFile)(process.execPath, ['scripts/build.mjs', '--dev', ...(assets ? [] : ['--no-assets'])], { cwd: root });
      process.stdout.write(stdout);
      for (const c of clients) c.write('data: reload\n\n');
    }
    catch (error) { console.error('Build failed; fix the source to retry:\n', error); }
    finally { building = false; if (pending) { pending = false; void rebuild(); } }
  };
  watcher = chokidar.watch(['content', 'templates', 'static', 'site.config.yml', 'lib'], { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 } });
  watcher.on('all', (_event, file) => {
    copyAssets ||= !file.endsWith('.md') || _event !== 'change';
    clearTimeout(timer); timer = setTimeout(rebuild, 180);
  });
}
const heartbeat = setInterval(() => { for (const c of clients) c.write(': keepalive\n\n'); }, 20000);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { clearInterval(heartbeat); await watcher?.close(); for (const c of clients) c.end(); server.close(() => process.exit(0)); });
