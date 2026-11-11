/* Static file server that stands in for Vercel when the tests run.
   It reads vercel.json so cleanUrls, trailingSlash and the redirects cannot
   drift away from production. Node built-ins only, no dependencies. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const redirects = new Map((config.redirects || []).map(function (r) {
  return [r.source, { to: r.destination, code: r.permanent ? 308 : 307 }];
}));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

function resolve(pathname) {
  // trailingSlash: false — /foo/ is the same file as /foo
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  const rel = decodeURIComponent(pathname).replace(/^\/+/, '');
  const candidates = rel === ''
    ? ['index.html']
    : config.cleanUrls
      ? [rel + '.html', rel, path.join(rel, 'index.html')]
      : [rel, rel + '.html', path.join(rel, 'index.html')];

  for (const candidate of candidates) {
    const file = path.join(ROOT, candidate);
    // never serve outside the repo
    if (!file.startsWith(ROOT + path.sep)) continue;
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

const server = http.createServer(function (req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);

  const redirect = redirects.get(pathname);
  if (redirect) {
    res.writeHead(redirect.code, { Location: redirect.to + url.search });
    return res.end();
  }

  // cleanUrls: /foo.html redirects to /foo, same as Vercel
  if (config.cleanUrls && pathname.endsWith('.html')) {
    res.writeHead(308, { Location: pathname.slice(0, -'.html'.length) + url.search });
    return res.end();
  }

  const file = resolve(pathname);
  if (!file) return send(res, 404, 'Not found');

  send(res, 200, fs.readFileSync(file), TYPES[path.extname(file)] || 'application/octet-stream');
});

const port = Number(process.env.PORT || 4321);
server.listen(port, '127.0.0.1', function () {
  console.log('serving ' + ROOT + ' on http://127.0.0.1:' + port);
});
